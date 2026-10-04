import QRCode from 'qrcode';
import jsQR from 'jsqr';

const testUrls = [
  'https://ais-dev-khayhhwa7pti5peejsi24u-911771626099.asia-southeast1.run.app/b/test-premiere-1',
  'https://ais-dev-khayhhwa7pti5peejsi24u-911771626099.asia-southeast1.run.app/b/elena-rostova-2026',
  'https://ais-pre-khayhhwa7pti5peejsi24u-911771626099.asia-southeast1.run.app/b/t_1791130491',
];

const presets = [
  { id: 'classic', name: 'CLASSIC', dark: '#0A0A0A', light: '#FFFFFF', accent: '#E50914' },
  { id: 'crimson', name: 'CRIMSON', dark: '#8B0000', light: '#FFF5F5', accent: '#DC2626' },
  { id: 'ruby', name: 'RUBY', dark: '#B91C1C', light: '#FFFFFF', accent: '#EF4444' },
  { id: 'gold', name: 'GOLD', dark: '#7A5405', light: '#FFFDF2', accent: '#D4AF37' },
  { id: 'silver', name: 'SILVER', dark: '#1E293B', light: '#F8FAFC', accent: '#94A3B8' },
  { id: 'white', name: 'WHITE', dark: '#0A0A0A', light: '#FFFFFF', accent: '#FFFFFF' },
];

function parseHex(h) {
  return [
    parseInt(h.slice(1, 3), 16),
    parseInt(h.slice(3, 5), 16),
    parseInt(h.slice(5, 7), 16),
  ];
}

console.log('================ TESTING QR STANDARDS & DECODABILITY ================');

let allPassed = true;

for (const testUrl of testUrls) {
  console.log(`\nTesting URL: ${testUrl}`);

  for (const preset of presets) {
    // Generate QR with errorCorrectionLevel 'H'
    const qr = QRCode.create(testUrl, { errorCorrectionLevel: 'H' });
    const modCount = qr.modules.size;

    // Simulate 1400x1400 composition
    const W = 1400;
    const H = 1400;
    const scale = W / 1200;
    const buffer = new Uint8ClampedArray(W * H * 4);

    // Fill dark card background
    for (let i = 0; i < buffer.length; i += 4) {
      buffer[i] = 12;
      buffer[i + 1] = 10;
      buffer[i + 2] = 11;
      buffer[i + 3] = 255;
    }

    // Plaque dimensions matching qrRenderer.ts
    const qrBoxSize = Math.round(580 * scale);
    const qrBoxX = Math.round((W - qrBoxSize) / 2);
    const qrBoxY = Math.round(300 * scale);

    const [dr, dg, db] = parseHex(preset.dark);
    const [lr, lg, lb] = parseHex(preset.light);

    // Fill QR plaque with light background
    for (let y = qrBoxY; y < qrBoxY + qrBoxSize; y++) {
      for (let x = qrBoxX; x < qrBoxX + qrBoxSize; x++) {
        const idx = (y * W + x) * 4;
        buffer[idx] = lr;
        buffer[idx + 1] = lg;
        buffer[idx + 2] = lb;
        buffer[idx + 3] = 255;
      }
    }

    // Quiet zone padding of 44 * scale
    const quietZonePadding = Math.round(44 * scale);
    const qrInnerSize = qrBoxSize - quietZonePadding * 2;
    const cellPx = qrInnerSize / modCount;

    // Draw QR modules
    for (let r = 0; r < modCount; r++) {
      for (let c = 0; c < modCount; c++) {
        if (qr.modules.get(r, c)) {
          const x0 = Math.floor(qrBoxX + quietZonePadding + c * cellPx);
          const y0 = Math.floor(qrBoxY + quietZonePadding + r * cellPx);
          const x1 = Math.ceil(qrBoxX + quietZonePadding + (c + 1) * cellPx);
          const y1 = Math.ceil(qrBoxY + quietZonePadding + (r + 1) * cellPx);

          for (let y = y0; y < y1; y++) {
            for (let x = x0; x < x1; x++) {
              const idx = (y * W + x) * 4;
              buffer[idx] = dr;
              buffer[idx + 1] = dg;
              buffer[idx + 2] = db;
              buffer[idx + 3] = 255;
            }
          }
        }
      }
    }

    // Add simulated outer decorations (strictly outside qrBox)
    // Frame lines
    const [ar, ag, ab] = parseHex(preset.accent);
    for (let x = 60; x < W - 60; x++) {
      const topIdx = (60 * W + x) * 4;
      const botIdx = ((H - 60) * W + x) * 4;
      buffer[topIdx] = ar; buffer[topIdx + 1] = ag; buffer[topIdx + 2] = ab; buffer[topIdx + 3] = 255;
      buffer[botIdx] = ar; buffer[botIdx + 1] = ag; buffer[botIdx + 2] = ab; buffer[botIdx + 3] = 255;
    }

    // Decode with jsQR
    const result = jsQR(buffer, W, H);
    if (!result || result.data !== testUrl) {
      console.error(`  FAIL: Preset ${preset.name} could not be decoded!`);
      if (result) console.error(`        Got: ${result.data}`);
      allPassed = false;
    } else {
      console.log(`  ✓ PASS: Preset ${preset.name} decoded successfully -> exact URL match!`);
    }
  }
}

console.log('\n=====================================================================');
if (allPassed) {
  console.log('OVERALL RESULT: ALL QR DECODABILITY TESTS PASSED (100% RELIABLE)');
  process.exit(0);
} else {
  console.error('OVERALL RESULT: QR TESTS FAILED');
  process.exit(1);
}
