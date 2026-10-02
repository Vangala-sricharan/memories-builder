export interface OptimizedImageResult {
  file: File;
  previewUrl: string;
  originalSizeBytes: number;
  optimizedSizeBytes: number;
  width: number;
  height: number;
  format: 'webp' | 'jpeg' | 'png';
  error?: string;
}

export interface OptimizationStats {
  totalOriginalBytes: number;
  totalOptimizedBytes: number;
  percentageSaved: number;
  successfulCount: number;
  failedCount: number;
}

const MAX_DIMENSION = 2560; // 2560px maximum dimension (quality-first)
const WEBP_QUALITY = 0.88; // 85-90% high visual quality
const JPEG_QUALITY = 0.88;

/**
 * Checks if a canvas has any transparent pixels.
 */
function hasTransparency(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  try {
    // Sample step to test transparency without heavy pixel looping
    const step = Math.max(1, Math.floor(Math.min(width, height) / 40));
    const imgData = ctx.getImageData(0, 0, width, height).data;
    for (let i = 3; i < imgData.length; i += 4 * step) {
      if (imgData[i] < 250) {
        return true;
      }
    }
  } catch (e) {
    // Fall back safely
    return false;
  }
  return false;
}

/**
 * Safely decodes an image File into an HTMLImageElement using an Object URL.
 */
function decodeImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`Failed to decode image "${file.name}"`));
    };

    img.src = objectUrl;
  });
}

/**
 * Optimizes a single image file in the browser:
 * - Validates format
 * - Resizes if larger than 2560px (never upscales)
 * - Encodes to WebP (or PNG for transparent images, JPEG as fallback)
 * - Releases memory
 */
export async function optimizeImageFile(file: File): Promise<OptimizedImageResult> {
  const originalSizeBytes = file.size;

  try {
    const img = await decodeImage(file);
    const origWidth = img.naturalWidth || img.width;
    const origHeight = img.naturalHeight || img.height;

    // Calculate target dimensions (preserving aspect ratio, max 2560px, never upscaling)
    let targetWidth = origWidth;
    let targetHeight = origHeight;

    if (origWidth > MAX_DIMENSION || origHeight > MAX_DIMENSION) {
      if (origWidth >= origHeight) {
        targetWidth = MAX_DIMENSION;
        targetHeight = Math.round((origHeight * MAX_DIMENSION) / origWidth);
      } else {
        targetHeight = MAX_DIMENSION;
        targetWidth = Math.round((origWidth * MAX_DIMENSION) / origHeight);
      }
    }

    // Draw to canvas with high quality image smoothing
    const canvas = document.createElement('canvas');
    canvas.width = targetWidth;
    canvas.height = targetHeight;
    const ctx = canvas.getContext('2d', { alpha: true });

    if (!ctx) {
      throw new Error('Unable to create 2D canvas context');
    }

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    // Format selection:
    // If PNG with transparency, retain WebP (which supports alpha) or PNG fallback.
    const isPng = file.type === 'image/png';
    const transparent = isPng ? hasTransparency(ctx, targetWidth, targetHeight) : false;

    let targetMime = 'image/webp';
    let format: 'webp' | 'jpeg' | 'png' = 'webp';

    // Test webp support
    const supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;

    if (!supportsWebP) {
      if (transparent) {
        targetMime = 'image/png';
        format = 'png';
      } else {
        targetMime = 'image/jpeg';
        format = 'jpeg';
      }
    }

    // Quality encoding
    const quality = format === 'webp' ? WEBP_QUALITY : JPEG_QUALITY;

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), targetMime, quality);
    });

    // Cleanup canvas
    canvas.width = 1;
    canvas.height = 1;

    if (!blob) {
      throw new Error('Canvas toBlob conversion failed');
    }

    // Create optimized File
    const originalExt = file.name.substring(file.name.lastIndexOf('.'));
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const newExt = format === 'webp' ? '.webp' : format === 'png' ? '.png' : '.jpg';
    const optimizedFileName = `${baseName}_optimized${newExt}`;

    const optimizedFile = new File([blob], optimizedFileName, {
      type: targetMime,
      lastModified: Date.now(),
    });

    const previewUrl = URL.createObjectURL(blob);

    return {
      file: optimizedFile,
      previewUrl,
      originalSizeBytes,
      optimizedSizeBytes: blob.size,
      width: targetWidth,
      height: targetHeight,
      format,
    };
  } catch (err: any) {
    // Graceful fallback: return original with warning
    const fallbackPreviewUrl = URL.createObjectURL(file);
    return {
      file,
      previewUrl: fallbackPreviewUrl,
      originalSizeBytes,
      optimizedSizeBytes: originalSizeBytes,
      width: 0,
      height: 0,
      format: 'jpeg',
      error: err?.message || 'Optimization failed, original preserved',
    };
  }
}

/**
 * Optimizes a list of image files sequentially to prevent browser memory spikes.
 */
export async function optimizeImageBatch(
  files: File[],
  onProgress?: (current: number, total: number, fileName: string) => void
): Promise<{
  results: OptimizedImageResult[];
  stats: OptimizationStats;
}> {
  const results: OptimizedImageResult[] = [];
  let totalOriginal = 0;
  let totalOptimized = 0;
  let successful = 0;
  let failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (onProgress) {
      onProgress(i + 1, files.length, file.name);
    }

    const result = await optimizeImageFile(file);
    results.push(result);

    totalOriginal += result.originalSizeBytes;
    totalOptimized += result.optimizedSizeBytes;

    if (result.error) {
      failed++;
    } else {
      successful++;
    }

    // Yield back to browser event loop briefly so UI stays responsive
    await new Promise((r) => setTimeout(r, 20));
  }

  const saved = totalOriginal > 0
    ? Math.max(0, Math.round(((totalOriginal - totalOptimized) / totalOriginal) * 100))
    : 0;

  return {
    results,
    stats: {
      totalOriginalBytes: totalOriginal,
      totalOptimizedBytes: totalOptimized,
      percentageSaved: saved,
      successfulCount: successful,
      failedCount: failed,
    },
  };
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}
