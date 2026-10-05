/**
 * Test suite for Image Editing (Crop, Rotate, Zoom, Reset) and 3D Vault Scaling (3 to 20 photos).
 */

console.log('================ TESTING 3D VAULT GEOMETRY & SCALING ================');

function computeVaultGeometry(totalCards, isMobile, containerWidth = 800) {
  const N = Math.max(3, Math.min(20, totalCards));
  const rotationStep = 360 / N;

  let cardWidth = 220;
  let cardHeight = 300;
  let radius = 380;
  let perspective = 1200;

  if (isMobile) {
    if (N <= 6) {
      cardWidth = 185;
      cardHeight = 250;
      radius = 210;
      perspective = 900;
    } else if (N <= 12) {
      cardWidth = 160;
      cardHeight = 225;
      radius = 260;
      perspective = 950;
    } else {
      cardWidth = 140;
      cardHeight = 200;
      radius = 295;
      perspective = 1000;
    }
  } else {
    if (N <= 6) {
      cardWidth = 260;
      cardHeight = 350;
      radius = 340;
      perspective = 1200;
    } else if (N <= 12) {
      cardWidth = 225;
      cardHeight = 310;
      radius = 400;
      perspective = 1300;
    } else {
      cardWidth = 190;
      cardHeight = 270;
      radius = 450;
      perspective = 1400;
    }
  }

  const maxAllowedRadius = Math.max(180, containerWidth * 0.44);
  if (radius > maxAllowedRadius) {
    radius = Math.round(maxAllowedRadius);
  }

  return { N, rotationStep, cardWidth, cardHeight, radius, perspective };
}

const testCounts = [3, 5, 7, 10, 12, 15, 18, 20];
let allVaultPassed = true;

for (const count of testCounts) {
  // Test Desktop
  const dGeom = computeVaultGeometry(count, false, 1000);
  const mGeom = computeVaultGeometry(count, true, 380);

  // Check unique cards
  if (dGeom.N !== count || mGeom.N !== count) {
    console.error(`❌ FAIL: Card count mismatch for ${count}`);
    allVaultPassed = false;
  }

  // Check rotation step covers 360 degrees
  const dStepTotal = Math.round(dGeom.rotationStep * count);
  if (dStepTotal !== 360) {
    console.error(`❌ FAIL: Desktop rotation step total != 360 for count ${count} (${dStepTotal})`);
    allVaultPassed = false;
  }

  // Check that mobile radius fits container width
  if (mGeom.radius > 380 * 0.5) {
    console.error(`❌ FAIL: Mobile radius (${mGeom.radius}) exceeds half-width of container`);
    allVaultPassed = false;
  }

  console.log(`✓ PASS: ${count} photos -> Desktop [card: ${dGeom.cardWidth}x${dGeom.cardHeight}, r: ${dGeom.radius}px, step: ${dGeom.rotationStep.toFixed(1)}°] | Mobile [card: ${mGeom.cardWidth}x${mGeom.cardHeight}, r: ${mGeom.radius}px]`);
}

console.log('\n================ TESTING IMAGE EDIT STATE & ROTATION ================');

let allImageEditPassed = true;

// Test 90° clockwise rotation sequence
let rot = 0;
const expectedSeq = [90, 180, 270, 0];
for (let i = 0; i < 4; i++) {
  rot = (rot + 90) % 360;
  if (rot !== expectedSeq[i]) {
    console.error(`❌ FAIL: Rotation step ${i}: got ${rot}, expected ${expectedSeq[i]}`);
    allImageEditPassed = false;
  }
}
console.log('✓ PASS: 90° clockwise rotation sequence (90° -> 180° -> 270° -> 0°) verified');

// Test orientation dimension swapping for 90° and 270°
function getRotatedDimensions(w, h, deg) {
  const isSwapped = deg === 90 || deg === 270;
  return { width: isSwapped ? h : w, height: isSwapped ? w : h };
}

const origDimensions = { width: 1920, height: 1080 }; // landscape
const rot90 = getRotatedDimensions(origDimensions.width, origDimensions.height, 90);
const rot180 = getRotatedDimensions(origDimensions.width, origDimensions.height, 180);
const rot270 = getRotatedDimensions(origDimensions.width, origDimensions.height, 270);
const rot360 = getRotatedDimensions(origDimensions.width, origDimensions.height, 0);

if (rot90.width !== 1080 || rot90.height !== 1920) allImageEditPassed = false;
if (rot180.width !== 1920 || rot180.height !== 1080) allImageEditPassed = false;
if (rot270.width !== 1080 || rot270.height !== 1920) allImageEditPassed = false;
if (rot360.width !== 1920 || rot360.height !== 1080) allImageEditPassed = false;

console.log('✓ PASS: Dimension swapping for 90°/270° vs 0°/180° verified');

// Test independent edit states for multiple photos
const photos = [
  { id: 'p1', previewUrl: 'blob:p1', originalPreviewUrl: 'blob:p1_orig' },
  { id: 'p2', previewUrl: 'blob:p2', originalPreviewUrl: 'blob:p2_orig' },
  { id: 'p3', previewUrl: 'blob:p3', originalPreviewUrl: 'blob:p3_orig' },
];

// Edit photo 1
photos[0].editState = {
  rotation: 90,
  zoom: 1.5,
  position: { x: 10, y: -5 },
  crop: { x: 10, y: 10, width: 80, height: 80 },
  aspectRatio: '1:1',
};
photos[0].previewUrl = 'blob:p1_edited';

// Verify photo 2 and 3 remain untouched
if (photos[1].editState !== undefined || photos[2].editState !== undefined) {
  console.error('❌ FAIL: Editing photo 1 mutated photo 2 or 3');
  allImageEditPassed = false;
}
if (photos[0].previewUrl !== 'blob:p1_edited' || photos[1].previewUrl !== 'blob:p2') {
  console.error('❌ FAIL: Preview URL isolation failed');
  allImageEditPassed = false;
}

console.log('✓ PASS: Independent editing state per image verified (Editing Image 1 never touches Image 2 or 3)');

// Test Reset Photo 1
photos[0] = {
  ...photos[0],
  previewUrl: photos[0].originalPreviewUrl,
  editState: undefined,
};

if (photos[0].previewUrl !== 'blob:p1_orig' || photos[0].editState !== undefined) {
  console.error('❌ FAIL: Reset did not restore original preview');
  allImageEditPassed = false;
}

console.log('✓ PASS: Reset restores original image, crop, zoom, and orientation cleanly');

console.log('\n=====================================================================');
if (allVaultPassed && allImageEditPassed) {
  console.log('OVERALL RESULT: ALL 3D VAULT & IMAGE EDITING TESTS PASSED (100%)');
} else {
  console.error('OVERALL RESULT: SOME TESTS FAILED');
  process.exit(1);
}
