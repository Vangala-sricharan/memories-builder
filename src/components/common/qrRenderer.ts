import QRCode from 'qrcode';

export interface QrColorPreset {
  id: 'classic' | 'crimson' | 'ruby' | 'gold' | 'silver' | 'white';
  name: string;
  tagline: string;
  qrDark: string;
  qrLight: string;
  accent: string;
  glowColor: string;
  frameBorder: string;
  cardBg: string;
  textColor: string;
  swatchBg: string;
  swatchBorder: string;
}

export const QR_COLOR_PRESETS: QrColorPreset[] = [
  {
    id: 'classic',
    name: 'CLASSIC',
    tagline: 'Obsidian & Crisp White',
    qrDark: '#0A0A0A',
    qrLight: '#FFFFFF',
    accent: '#E50914',
    glowColor: 'rgba(229, 9, 20, 0.32)',
    frameBorder: 'rgba(229, 9, 20, 0.65)',
    cardBg: '#0C0A0B',
    textColor: '#FFFFFF',
    swatchBg: '#0A0A0A',
    swatchBorder: '#E50914',
  },
  {
    id: 'crimson',
    name: 'CRIMSON',
    tagline: 'Deep Crimson & Rose White',
    qrDark: '#8B0000',
    qrLight: '#FFF5F5',
    accent: '#DC2626',
    glowColor: 'rgba(220, 38, 38, 0.35)',
    frameBorder: 'rgba(220, 38, 38, 0.7)',
    cardBg: '#10080A',
    textColor: '#FFFFFF',
    swatchBg: '#8B0000',
    swatchBorder: '#DC2626',
  },
  {
    id: 'ruby',
    name: 'RUBY',
    tagline: 'Vivid Ruby & Pure Pearl',
    qrDark: '#B91C1C',
    qrLight: '#FFFFFF',
    accent: '#EF4444',
    glowColor: 'rgba(239, 68, 68, 0.38)',
    frameBorder: 'rgba(239, 68, 68, 0.75)',
    cardBg: '#120809',
    textColor: '#FFFFFF',
    swatchBg: '#EF4444',
    swatchBorder: '#F87171',
  },
  {
    id: 'gold',
    name: 'GOLD',
    tagline: 'Royal Gold & Champagne Ivory',
    qrDark: '#7A5405',
    qrLight: '#FFFDF2',
    accent: '#D4AF37',
    glowColor: 'rgba(212, 175, 55, 0.35)',
    frameBorder: 'rgba(212, 175, 55, 0.7)',
    cardBg: '#0F0D08',
    textColor: '#FDF6E2',
    swatchBg: '#D4AF37',
    swatchBorder: '#F3E5AB',
  },
  {
    id: 'silver',
    name: 'SILVER',
    tagline: 'Platinum Silver & Midnight Slate',
    qrDark: '#1E293B',
    qrLight: '#F8FAFC',
    accent: '#94A3B8',
    glowColor: 'rgba(148, 163, 184, 0.3)',
    frameBorder: 'rgba(148, 163, 184, 0.65)',
    cardBg: '#090B10',
    textColor: '#F1F5F9',
    swatchBg: '#94A3B8',
    swatchBorder: '#CBD5E1',
  },
  {
    id: 'white',
    name: 'WHITE',
    tagline: 'Monochrome Diamond White',
    qrDark: '#0A0A0A',
    qrLight: '#FFFFFF',
    accent: '#FFFFFF',
    glowColor: 'rgba(255, 255, 255, 0.28)',
    frameBorder: 'rgba(255, 255, 255, 0.65)',
    cardBg: '#080808',
    textColor: '#FFFFFF',
    swatchBg: '#FFFFFF',
    swatchBorder: '#999999',
  },
];

export interface QrRenderOptions {
  url: string;
  preset: QrColorPreset;
  recipientName?: string;
  width: number;
  height: number;
}

/**
 * Draws a large, prominent symmetrical bezier heart centered at (cx, cy).
 */
function drawHeart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  fillColor: string,
  strokeColor?: string,
  strokeWidth = 2
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.beginPath();
  const topCurveHeight = size * 0.32;
  ctx.moveTo(0, size * 0.3);
  // Left curve
  ctx.bezierCurveTo(-size * 0.55, -size * 0.35, -size * 0.55, topCurveHeight, 0, size * 0.85);
  // Right curve
  ctx.bezierCurveTo(size * 0.55, topCurveHeight, size * 0.55, -size * 0.35, 0, size * 0.3);
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();

  if (strokeColor) {
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.stroke();
  }
  ctx.restore();
}

/**
 * Draws a 4-point editorial starburst ✦ centered at (cx, cy).
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  outerRadius: number,
  innerRadius: number,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (i * Math.PI) / 4;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a big, prominent botanical floral blossom 🌸 with blooming petals and lush leaves.
 */
function drawFloralBlossom(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  color: string,
  leafColor: string
) {
  ctx.save();
  ctx.translate(cx, cy);

  // 1. Prominent botanical leaves behind
  ctx.fillStyle = leafColor;
  [-Math.PI / 4, (3 * Math.PI) / 4, -Math.PI / 2, Math.PI / 2].forEach((angle) => {
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(radius * 0.9, -radius * 0.4, radius * 1.5, 0);
    ctx.quadraticCurveTo(radius * 0.9, radius * 0.4, 0, 0);
    ctx.fill();
    ctx.restore();
  });

  // 2. Overlapping floral petals (6 petals for rich blooming fullness)
  ctx.fillStyle = color;
  const numPetals = 6;
  for (let i = 0; i < numPetals; i++) {
    const angle = (i * 2 * Math.PI) / numPetals;
    ctx.save();
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      radius * 0.5,
      -radius * 0.7,
      radius * 1.0,
      -radius * 0.5,
      radius * 1.1,
      0
    );
    ctx.bezierCurveTo(
      radius * 1.0,
      radius * 0.5,
      radius * 0.5,
      radius * 0.7,
      0,
      0
    );
    ctx.fill();
    ctx.restore();
  }

  // 3. Blossom core pistil with golden/white highlight
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.35, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.restore();
}

/**
 * Draws a big, visible botanical floral bouquet flourish around each corner.
 */
function drawCornerBouquet(
  ctx: CanvasRenderingContext2D,
  cornerX: number,
  cornerY: number,
  scaleX: number,
  scaleY: number,
  accentColor: string
) {
  ctx.save();
  ctx.translate(cornerX, cornerY);
  ctx.scale(scaleX, scaleY);

  // Graceful vine stems
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 3.0;
  ctx.beginPath();
  ctx.moveTo(0, 60);
  ctx.bezierCurveTo(20, 30, 30, 20, 60, 0);
  ctx.stroke();

  // Secondary vine branch
  ctx.lineWidth = 2.0;
  ctx.beginPath();
  ctx.moveTo(15, 65);
  ctx.bezierCurveTo(35, 45, 45, 35, 65, 15);
  ctx.stroke();

  // Prominent large blooming flower in corner
  drawFloralBlossom(ctx, 30, 30, 16, accentColor, 'rgba(255,255,255,0.45)');

  // Secondary flower buds
  drawFloralBlossom(ctx, 55, 12, 9, accentColor, 'rgba(255,255,255,0.3)');
  drawFloralBlossom(ctx, 12, 55, 9, accentColor, 'rgba(255,255,255,0.3)');

  // Leaf sprays along outer perimeter
  ctx.fillStyle = accentColor;
  ctx.beginPath();
  ctx.ellipse(55, 6, 8, 4, Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.ellipse(6, 55, 8, 4, -Math.PI / 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Primary single source-of-truth QR card renderer.
 * Renders the complete, self-contained, decorated QR composition onto any HTML5 Canvas.
 */
export function renderQrCardToCanvas(
  canvas: HTMLCanvasElement,
  options: QrRenderOptions
): boolean {
  const { url, preset, recipientName, width, height } = options;
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) return false;

  const scale = width / 1200; // Base reference is 1200x1200

  // 1. Deep Atmospheric Background
  const bgGrad = ctx.createRadialGradient(
    width / 2,
    height * 0.48,
    40 * scale,
    width / 2,
    height * 0.48,
    width * 0.75
  );
  bgGrad.addColorStop(0, preset.cardBg);
  bgGrad.addColorStop(0.5, '#08080A');
  bgGrad.addColorStop(1, '#030304');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // 2. Ambient Accent Glow
  const glowGrad = ctx.createRadialGradient(
    width / 2,
    height * 0.5,
    30 * scale,
    width / 2,
    height * 0.5,
    420 * scale
  );
  glowGrad.addColorStop(0, preset.glowColor);
  glowGrad.addColorStop(0.7, 'rgba(0,0,0,0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(0, 0, width, height);

  // 3. Outer Editorial Frame Card
  const cardMargin = 40 * scale;
  const cardW = width - cardMargin * 2;
  const cardH = height - cardMargin * 2;
  const cardR = 40 * scale;

  ctx.save();
  // Card base fill
  ctx.fillStyle = 'rgba(16, 16, 20, 0.75)';
  ctx.beginPath();
  ctx.roundRect(cardMargin, cardMargin, cardW, cardH, cardR);
  ctx.fill();

  // Card outer glowing border
  ctx.strokeStyle = preset.frameBorder;
  ctx.lineWidth = 3.5 * scale;
  ctx.shadowColor = preset.accent;
  ctx.shadowBlur = 18 * scale;
  ctx.stroke();
  ctx.restore();

  // Card inner hairline border
  ctx.save();
  const innerInset = 12 * scale;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.14)';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.roundRect(
    cardMargin + innerInset,
    cardMargin + innerInset,
    cardW - innerInset * 2,
    cardH - innerInset * 2,
    cardR - innerInset
  );
  ctx.stroke();
  ctx.restore();

  // 4. Four Large Visible Corner Floral Bouquets (OUTSIDE QR SAFE AREA)
  const pad = cardMargin + 24 * scale;
  drawCornerBouquet(ctx, pad, pad, 1.4 * scale, 1.4 * scale, preset.accent);
  drawCornerBouquet(ctx, width - pad, pad, -1.4 * scale, 1.4 * scale, preset.accent);
  drawCornerBouquet(ctx, pad, height - pad, 1.4 * scale, -1.4 * scale, preset.accent);
  drawCornerBouquet(ctx, width - pad, height - pad, -1.4 * scale, -1.4 * scale, preset.accent);

  // Corner Starbursts (✦)
  const starPad = cardMargin + 18 * scale;
  drawStar(ctx, starPad, starPad, 12 * scale, 4.5 * scale, preset.accent);
  drawStar(ctx, width - starPad, starPad, 12 * scale, 4.5 * scale, preset.accent);
  drawStar(ctx, starPad, height - starPad, 12 * scale, 4.5 * scale, preset.accent);
  drawStar(ctx, width - starPad, height - starPad, 12 * scale, 4.5 * scale, preset.accent);

  // 5. Header Typography: BIG, PROMINENT SURPRISE ANNOUNCEMENT
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // BIG SURPRISE TEASER BADGE (Prominently visible!)
  const pillY = cardMargin + 50 * scale;
  ctx.font = `bold ${Math.round(18 * scale)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = preset.accent;
  ctx.shadowColor = preset.accent;
  ctx.shadowBlur = 14 * scale;
  ctx.fillText('✨  A SPECIAL SURPRISE AWAITS INSIDE  ✨', width / 2, pillY);

  // Main Recipient Display Title (Large, Bold, Cinematic)
  const titleY = pillY + 44 * scale;
  const nameToDisplay = recipientName ? recipientName.toUpperCase() : 'YOUR SPECIAL CELEBRATION';
  ctx.font = `bold ${Math.round(38 * scale)}px Cinzel, "Playfair Display", Georgia, serif`;
  ctx.fillStyle = preset.textColor;
  ctx.shadowColor = 'rgba(0,0,0,0.9)';
  ctx.shadowBlur = 20 * scale;
  ctx.fillText(nameToDisplay, width / 2, titleY);

  // Subtitle Teaser: States a surprise is inside without revealing it
  const subY = titleY + 30 * scale;
  ctx.font = `bold ${Math.round(15 * scale)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  ctx.shadowBlur = 0;
  ctx.fillText('A SECRET BIRTHDAY SURPRISE IS ENCLOSED · SCAN TO REVEAL', width / 2, subY);
  ctx.restore();

  // 6. Top Decorative Heart Cluster (✦ ♥ ✦) — BIG & VISIBLE
  const topHeartY = subY + 32 * scale;
  drawStar(ctx, width / 2 - 50 * scale, topHeartY, 10 * scale, 4 * scale, preset.accent);
  drawHeart(ctx, width / 2, topHeartY, 22 * scale, preset.accent, '#FFFFFF', 2 * scale);
  drawStar(ctx, width / 2 + 50 * scale, topHeartY, 10 * scale, 4 * scale, preset.accent);

  // 7. Central High-Contrast QR Code Plaque (WITH RIGID QUIET ZONE)
  const qrBoxSize = 560 * scale;
  const qrBoxX = (width - qrBoxSize) / 2;
  const qrBoxY = topHeartY + 28 * scale;
  const qrBoxR = 26 * scale;

  ctx.save();
  // Plaque drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 50 * scale;
  ctx.shadowOffsetY = 20 * scale;

  // Plaque Background (Guaranteed 100% solid, crisp, high-contrast)
  ctx.fillStyle = preset.qrLight;
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrBoxR);
  ctx.fill();
  ctx.restore();

  // Plaque Inner Double Border
  ctx.save();
  ctx.strokeStyle = preset.accent;
  ctx.lineWidth = 3.5 * scale;
  ctx.beginPath();
  ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, qrBoxR);
  ctx.stroke();

  // Subtle inner accent line
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)';
  ctx.lineWidth = 1.5 * scale;
  ctx.beginPath();
  ctx.roundRect(
    qrBoxX + 8 * scale,
    qrBoxY + 8 * scale,
    qrBoxSize - 16 * scale,
    qrBoxSize - 16 * scale,
    qrBoxR - 6 * scale
  );
  ctx.stroke();
  ctx.restore();

  // 8. Generate Real Standards-Compliant QR Matrix
  // Using high error correction ('H') for maximum readability & tolerance
  const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
  const modCount = qr.modules.size;

  // Quiet Zone Padding: Generous undisturbed safe area around QR code
  const quietZonePadding = 42 * scale;
  const qrInnerSize = qrBoxSize - quietZonePadding * 2;
  const cellPx = qrInnerSize / modCount;

  // Draw QR Modules cleanly
  ctx.fillStyle = preset.qrDark;
  for (let r = 0; r < modCount; r++) {
    for (let c = 0; c < modCount; c++) {
      if (qr.modules.get(r, c)) {
        const x = qrBoxX + quietZonePadding + c * cellPx;
        const y = qrBoxY + quietZonePadding + r * cellPx;
        const nextX = qrBoxX + quietZonePadding + (c + 1) * cellPx;
        const nextY = qrBoxY + quietZonePadding + (r + 1) * cellPx;

        // Use Math.round to prevent hairline sub-pixel gaps between modules
        ctx.fillRect(
          Math.floor(x),
          Math.floor(y),
          Math.ceil(nextX - x),
          Math.ceil(nextY - y)
        );
      }
    }
  }

  // 9. Large Visible Side Floating Hearts (Out of safe zone)
  const sideY = qrBoxY + qrBoxSize / 2;
  drawHeart(ctx, cardMargin + 32 * scale, sideY, 18 * scale, preset.accent, 'rgba(255,255,255,0.7)', 1.5 * scale);
  drawHeart(ctx, width - cardMargin - 32 * scale, sideY, 18 * scale, preset.accent, 'rgba(255,255,255,0.7)', 1.5 * scale);

  // 10. Bottom Large Bouquet & Heart Cluster — BIG & BEAUTIFUL
  const bottomClusterY = qrBoxY + qrBoxSize + 36 * scale;
  drawFloralBlossom(ctx, width / 2 - 58 * scale, bottomClusterY, 14 * scale, preset.accent, 'rgba(255,255,255,0.4)');
  drawHeart(ctx, width / 2, bottomClusterY, 22 * scale, preset.accent, '#FFFFFF', 2 * scale);
  drawFloralBlossom(ctx, width / 2 + 58 * scale, bottomClusterY, 14 * scale, preset.accent, 'rgba(255,255,255,0.4)');

  // 11. Footer Instructions: BIG & PROMINENT
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const footerTextY = bottomClusterY + 40 * scale;
  ctx.font = `bold ${Math.round(24 * scale)}px Cinzel, "Playfair Display", Georgia, serif`;
  ctx.fillStyle = preset.textColor;
  ctx.shadowColor = preset.accent;
  ctx.shadowBlur = 12 * scale;
  ctx.fillText('SCAN TO UNLOCK THE SURPRISE', width / 2, footerTextY);

  const metaY = footerTextY + 30 * scale;
  ctx.font = `bold ${Math.round(13 * scale)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = preset.accent;
  ctx.shadowBlur = 0;
  ctx.fillText('POINT CAMERA TO WATCH  ·  KEEP SURPRISE SECRET UNTIL OPENED', width / 2, metaY);
  ctx.restore();

  return true;
}
