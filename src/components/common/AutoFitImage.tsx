import React, { useState } from 'react';

export interface AutoFitImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt?: string;
  className?: string;
  containerClassName?: string;
  /** Custom focal alignment override if explicitly desired */
  focalPoint?: 'auto' | 'top' | 'center' | 'bottom';
  /** Whether to render a subtle ambient blurred backdrop layer behind the photo */
  enableBackdropGlow?: boolean;
}

/**
 * AutoFitImage: Intelligent visual auto-cropping & framing component
 * 
 * - Automatically fits assigned frames without distortion
 * - NEVER stretches or squashes images
 * - Preserves natural aspect ratio
 * - Dynamically determines natural photo dimensions to calculate optimal focal centering:
 *   * Portrait orientation (aspect < 0.92): centers at upper-third (center 20%-25%) to preserve faces/heads
 *   * Square / Near-square (0.92 - 1.15): centers at upper-mid (center 32%)
 *   * Standard Landscape (1.15 - 1.65): centers at natural eye-level (center 40%)
 *   * Wide / Panoramic (>= 1.65): centers at center 48%
 * - Completely non-destructive: does NOT modify original uploaded file or create copies
 */
export const AutoFitImage: React.FC<AutoFitImageProps> = ({
  src,
  alt = 'Memory Moment',
  className = '',
  containerClassName = '',
  focalPoint = 'auto',
  enableBackdropGlow = false,
  style,
  onLoad,
  ...rest
}) => {
  // Calculated focal position based on natural aspect ratio
  // Default to 50% 25% (upper-third rule) before load completes so portraits look great immediately
  const [objectPosition, setObjectPosition] = useState<string>('50% 28%');
  const [aspectRatio, setAspectRatio] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    const { naturalWidth, naturalHeight } = img;

    if (naturalWidth && naturalHeight) {
      const aspect = naturalWidth / naturalHeight;
      setAspectRatio(aspect);

      if (focalPoint === 'auto') {
        if (aspect < 0.92) {
          // Portrait (vertical phone photo, studio portrait, headshot):
          // Faces and heads are located in the top 15%-35% zone.
          // Bias focus point toward upper third to guarantee faces aren't chopped off.
          setObjectPosition('50% 22%');
        } else if (aspect >= 0.92 && aspect < 1.15) {
          // Square / Near square:
          // Slightly raised focus point
          setObjectPosition('50% 32%');
        } else if (aspect >= 1.15 && aspect < 1.68) {
          // Standard landscape (4:3, 3:2):
          // Natural eye-level horizon
          setObjectPosition('50% 40%');
        } else {
          // Wide / Cinematic / Panorama (16:9, 21:9):
          setObjectPosition('50% 48%');
        }
      } else if (focalPoint === 'top') {
        setObjectPosition('50% 18%');
      } else if (focalPoint === 'center') {
        setObjectPosition('50% 50%');
      } else if (focalPoint === 'bottom') {
        setObjectPosition('50% 80%');
      }
    }

    setIsLoaded(true);
    if (onLoad) {
      onLoad(e);
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${containerClassName}`}>
      {/* Optional ambient backdrop glow layer for letterboxed or cinematic frames */}
      {enableBackdropGlow && (
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-110 blur-xl opacity-35 filter pointer-events-none transition-opacity duration-700"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
          }}
        />
      )}

      {/* Main Intelligently Framed Image */}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={handleImageLoad}
        style={{
          objectFit: 'cover',
          objectPosition: objectPosition,
          ...style,
        }}
        className={`w-full h-full transition-opacity duration-300 ${
          isLoaded ? 'opacity-100' : 'opacity-90'
        } ${className}`}
        {...rest}
      />
    </div>
  );
};
