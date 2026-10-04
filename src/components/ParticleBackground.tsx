import React, { useEffect, useRef } from 'react';
import { ParticleShape, ExperienceTemplate, ParticleAtmosphere, MotionEnergy } from '../types';
import { hexToRgb } from '../utils/themeTokens';

interface Particle {
  // Current spatial coordinates
  x: number;
  y: number;
  z: number; // Continuous depth: 0.35 (distant background) to 2.8 (near foreground)
  tier: 'background' | 'midground' | 'foreground';

  // Physical motion & inertia
  vx: number;
  vy: number;
  drag: number; // Personalized air resistance / dampening (0.88 - 0.95)
  springStrength: number; // Elastic pull toward target when morphing
  swirlDirection: number; // 1 or -1 for organic flocking swirl

  // Morphing targets
  targetX: number;
  targetY: number;
  homeX: number; // Abstract wander anchor
  homeY: number;

  // Visual appearance
  size: number;
  baseAlpha: number;
  alpha: number;
  colorType: 'white' | 'red' | 'gray';
  colorRgb: string; // "255, 255, 255" | "229, 9, 20" | "170, 170, 175"
  glowRadius: number;

  // Organic atmospheric drift & breathing
  driftPhase: number;
  driftSpeed: number;
  driftRadiusX: number;
  driftRadiusY: number;
  pulsePhase: number;
  pulseSpeed: number;
}

interface ParticleBackgroundProps {
  currentShape?: ParticleShape;
  className?: string;
  intensity?: 'subtle' | 'normal' | 'vibrant';
  interactive?: boolean;
  template?: ExperienceTemplate;
  primaryColor?: string;
  particleAtmosphere?: ParticleAtmosphere;
  motionEnergy?: MotionEnergy;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  currentShape = 'abstract',
  className = '',
  intensity = 'normal',
  interactive = true,
  template = 'cinema',
  primaryColor = '#E50914',
  particleAtmosphere,
  motionEnergy,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  // Smooth mouse / pointer parallax state with inertia
  const pointerRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const gyroRef = useRef({ gamma: 0, beta: 0, targetGamma: 0, targetBeta: 0 });
  const isGyroAvailableRef = useRef(false);

  // Morph state tracking
  const currentShapeRef = useRef<ParticleShape>(currentShape);
  const morphIntensityRef = useRef(0); // 0 = relaxed abstract drift, 1 = tight shape formation
  const prefersReducedMotionRef = useRef(false);

  // Keep currentShapeRef in sync and update targets seamlessly
  useEffect(() => {
    currentShapeRef.current = currentShape;
    const canvas = canvasRef.current;
    if (!canvas || !particlesRef.current.length) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    assignShapeTargets(particlesRef.current, currentShape, width, height);
  }, [currentShape]);

  // Main lifecycle: Setup canvas, particles, event listeners, and render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    prefersReducedMotionRef.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Responsive setup with device pixel ratio clamp
    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0); // reset scale before scaling
      ctx.scale(dpr, dpr);

      // Re-assign shape targets according to new viewport dimensions
      assignShapeTargets(particlesRef.current, currentShapeRef.current, width, height);
    };

    // Adaptive particle count based on viewport capability, template personality, and atmosphere setting:
    const screenWidth = window.innerWidth;
    const baseCount = screenWidth < 768 ? 180 : screenWidth < 1024 ? 340 : 560;
    const tplMultiplier = 
      template === 'memories' ? 0.6 : 
      template === 'celebration' ? 1.25 : 
      template === 'elegance' ? 0.4 : 1.0;
    const atmMultiplier =
      particleAtmosphere === 'minimal' ? 0.45 :
      particleAtmosphere === 'intense' ? 1.45 : 1.0;
    const particleCount = Math.round(baseCount * tplMultiplier * atmMultiplier);

    const prim = hexToRgb(primaryColor || '#E50914');
    const primaryRgbStr = `${prim.r}, ${prim.g}, ${prim.b}`;

    // Generate balanced layered particle field with 3 distinct depth tiers
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      // Stratified depth distribution:
      // ~38% background (deep stars/dust), ~44% midground (ambient field), ~18% foreground (cinematic sparks)
      const depthRoll = Math.random();
      let z: number;
      let tier: 'background' | 'midground' | 'foreground';

      if (depthRoll < 0.38) {
        tier = 'background';
        z = 0.40 + Math.random() * 0.55; // 0.40 - 0.95
      } else if (depthRoll < 0.82) {
        tier = 'midground';
        z = 0.96 + Math.random() * 0.89; // 0.96 - 1.85
      } else {
        tier = 'foreground';
        z = 1.86 + Math.random() * 1.14; // 1.86 - 3.00
      }

      // Color classification (Primary accent highlights, warm cinematic white, graphite depth)
      const colorRoll = Math.random();
      let colorType: 'white' | 'red' | 'gray' = 'white';
      let colorRgb = '255, 255, 255';
      let baseAlpha = 0.50;

      const accentThreshold = template === 'celebration' ? 0.42 : template === 'memories' ? 0.25 : template === 'elegance' ? 0.22 : 0.30;
      if (colorRoll < accentThreshold) {
        // Primary accent highlight (prominent, glowing)
        colorType = 'red';
        colorRgb = primaryRgbStr;
        baseAlpha = tier === 'foreground' ? 0.92 : tier === 'midground' ? 0.72 : 0.50;
      } else if (colorRoll < 0.55) {
        // Soft graphite / warm silver-gray (enhances deep spatial illusion)
        colorType = 'gray';
        colorRgb = template === 'memories' ? '195, 185, 175' : '185, 185, 195';
        baseAlpha = tier === 'foreground' ? 0.70 : tier === 'midground' ? 0.50 : 0.35;
      } else {
        // Pristine white sparkling star / warm mote
        colorType = 'white';
        colorRgb = template === 'memories' ? '255, 250, 240' : '255, 255, 255';
        baseAlpha = tier === 'foreground' ? 0.95 : tier === 'midground' ? 0.76 : 0.48;
      }

      // Size scales physically with depth:
      // Background: 0.9 - 1.5px | Midground: 1.6 - 2.5px | Foreground: 2.6 - 3.8px
      const baseRadius = 0.85 + Math.random() * 0.95;
      const size = Math.max(0.75, baseRadius * (z * 0.74));

      // Glow size for foreground embers/sparks & bright midground accents
      let glowRadius = 0;
      if (tier === 'foreground') {
        glowRadius = colorType === 'red' ? 7.0 : 4.8;
      } else if (tier === 'midground') {
        glowRadius = colorType === 'red' ? 4.0 : 2.6;
      }

      const x = Math.random() * width;
      const y = Math.random() * height;

      newParticles.push({
        x,
        y,
        z,
        tier,
        vx: (Math.random() - 0.5) * (0.65 * z + 0.35),
        vy: (Math.random() - 0.5) * (0.65 * z + 0.35),
        drag: 0.92 + Math.random() * 0.04,
        springStrength: 0.028 + Math.random() * 0.020,
        swirlDirection: Math.random() > 0.5 ? 1 : -1,
        targetX: x,
        targetY: y,
        homeX: x,
        homeY: y,
        size,
        baseAlpha,
        alpha: baseAlpha,
        colorType,
        colorRgb,
        glowRadius,
        driftPhase: Math.random() * Math.PI * 2,
        driftSpeed: (0.010 + Math.random() * 0.018) * (0.8 + z * 0.4),
        driftRadiusX: (1.2 + Math.random() * 2.2) * z,
        driftRadiusY: (1.0 + Math.random() * 1.8) * z,
        pulsePhase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.035,
      });
    }

    particlesRef.current = newParticles;
    handleResize();
    window.addEventListener('resize', handleResize);

    // Desktop Pointer Parallax with subtle normalized amplitude
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive || prefersReducedMotionRef.current) return;
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      // Maximum parallax displacement: 36px on desktop
      pointerRef.current.targetX = normX * 36;
      pointerRef.current.targetY = normY * 36;
    };

    // Mobile Device Orientation Gyroscope Parallax (gentle, safe fallback)
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!interactive || prefersReducedMotionRef.current) return;
      if (e.gamma !== null && e.beta !== null) {
        isGyroAvailableRef.current = true;
        // Clamp gamma and beta to avoid disorienting jumps
        const clampedGamma = Math.max(-40, Math.min(40, e.gamma));
        const clampedBeta = Math.max(-40, Math.min(40, e.beta - 45)); // standard holding angle
        gyroRef.current.targetGamma = (clampedGamma / 40) * 22;
        gyroRef.current.targetBeta = (clampedBeta / 40) * 22;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    // Tab visibility handling: pause calculation and rendering when page is hidden
    let isTabVisible = !document.hidden;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial shape target setup
    assignShapeTargets(newParticles, currentShapeRef.current, width, height);

    // Main animation render loop with requestAnimationFrame
    let lastTimestamp = performance.now();

    const render = (now: number) => {
      // Calculate delta time capped at 100ms to prevent huge jumps after tab resume
      const dt = Math.min((now - lastTimestamp) / 1000, 0.1);
      lastTimestamp = now;

      if (!isTabVisible) {
        animationFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth critically-damped pointer / gyroscope parallax interpolation
      const parallaxEase = prefersReducedMotionRef.current ? 0.01 : 0.045;
      pointerRef.current.x += (pointerRef.current.targetX - pointerRef.current.x) * parallaxEase;
      pointerRef.current.y += (pointerRef.current.targetY - pointerRef.current.y) * parallaxEase;

      gyroRef.current.gamma += (gyroRef.current.targetGamma - gyroRef.current.gamma) * parallaxEase;
      gyroRef.current.beta += (gyroRef.current.targetBeta - gyroRef.current.beta) * parallaxEase;

      const activeParallaxX = isGyroAvailableRef.current
        ? gyroRef.current.gamma
        : pointerRef.current.x;
      const activeParallaxY = isGyroAvailableRef.current
        ? gyroRef.current.beta
        : pointerRef.current.y;

      const particles = particlesRef.current;
      const len = particles.length;
      const isAbstract = currentShapeRef.current === 'abstract';
      const intensityMul = intensity === 'vibrant' ? 1.25 : intensity === 'subtle' ? 0.75 : 1.0;
      const templateSpeed =
        template === 'celebration' ? 1.4 :
        template === 'memories' ? 0.6 :
        template === 'elegance' ? 0.45 : 1.0;
      const energyMultiplier =
        motionEnergy === 'epic' ? 1.5 :
        motionEnergy === 'subtle' ? 0.6 : 1.0;
      const motionScale = (prefersReducedMotionRef.current ? 0.2 : 1.0) * templateSpeed * energyMultiplier;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // 1. Organic multi-frequency atmospheric drift & breathing
        p.driftPhase += p.driftSpeed * motionScale;
        p.pulsePhase += p.pulseSpeed * motionScale;
        const driftX = Math.cos(p.driftPhase) * p.driftRadiusX;
        const driftY = Math.sin(p.driftPhase * 1.3) * p.driftRadiusY;
        const pulse = Math.sin(p.pulsePhase) * 0.12;

        if (isAbstract) {
          // Free 3D atmospheric wandering with natural inertia (faster, more alive)
          p.x += (p.vx + driftX * 0.22) * motionScale;
          p.y += (p.vy + driftY * 0.22) * motionScale;

          // Gentle smooth boundary wrapping (margin 40px)
          if (p.x < -40) p.x = width + 40;
          if (p.x > width + 40) p.x = -40;
          if (p.y < -40) p.y = height + 40;
          if (p.y > height + 40) p.y = -40;
        } else {
          // Structured Morphing Physics:
          // Velocity continuity + gravitational spring toward target + tangential vortex swirl
          const dx = p.targetX - p.x;
          const dy = p.targetY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Spring pull with distance-attenuated acceleration
          const springAcc = p.springStrength * Math.min(dist * 0.045, 5.0);
          const directAngle = Math.atan2(dy, dx);

          // Swirl effect decays smoothly as particle nears its formation destination
          const swirlFactor = Math.min(1, dist / 150) * 0.55;
          const motionAngle = directAngle + (Math.PI / 2) * p.swirlDirection * swirlFactor;

          p.vx += Math.cos(motionAngle) * springAcc * motionScale * 1.25;
          p.vy += Math.sin(motionAngle) * springAcc * motionScale * 1.25;

          // Velocity damping / inertia
          p.vx *= p.drag;
          p.vy *= p.drag;

          p.x += (p.vx + driftX * 0.12) * motionScale;
          p.y += (p.vy + driftY * 0.12) * motionScale;
        }

        // 2. Depth Parallax (Subtle 3D stereoscopic shift based on tier)
        // Background barely shifts (0.2x), Midground shifts moderately (0.5x), Foreground shifts distinctly (1.0x)
        const depthParallaxFactor = prefersReducedMotionRef.current 
          ? 0 
          : (p.z * 0.45 + 0.15);
        const displayX = p.x + activeParallaxX * depthParallaxFactor;
        const displayY = p.y + activeParallaxY * depthParallaxFactor;

        // 3. Opacity Calculation with subtle organic pulse
        const renderAlpha = Math.min(
          1,
          Math.max(0.08, (p.baseAlpha + pulse) * intensityMul)
        );

        // 4. Render Particle Dot
        ctx.beginPath();
        ctx.arc(displayX, displayY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorRgb}, ${renderAlpha})`;
        ctx.fill();

        // 5. Cinematic Depth Glow (Preserved strictly for foreground embers & red highlights)
        if (p.glowRadius > 0 && renderAlpha > 0.15) {
          ctx.beginPath();
          ctx.arc(displayX, displayY, p.size + p.glowRadius, 0, Math.PI * 2);
          const glowAlpha = p.colorType === 'red' ? renderAlpha * 0.28 : renderAlpha * 0.16;
          ctx.fillStyle = `rgba(${p.colorRgb}, ${glowAlpha})`;
          ctx.fill();
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [intensity, interactive]);

  return (
    <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full opacity-100 transition-opacity duration-700"
      />
      {/* Subtle cinematic radial vignette to frame typography and visuals */}
      <div className="cinematic-vignette absolute inset-0 pointer-events-none" />
    </div>
  );
};

/**
 * Shape Target Position Generator
 * Assigns continuous 3D coordinate targets across Abstract, Heart, Star, Circle, Diamond, Balloon, Galaxy
 */
function assignShapeTargets(
  particles: Particle[],
  shape: ParticleShape,
  width: number,
  height: number
) {
  const count = particles.length;
  if (!count) return;

  const centerX = width * 0.5;
  // Position shape slightly higher on mobile for visual balance above text
  const centerY = height * (width < 768 ? 0.44 : 0.48);
  const minDim = Math.min(width, height);

  switch (shape) {
    case 'heart': {
      // Parametric cardioid heart equation:
      // x = 16 * sin^3(t)
      // y = - (13*cos(t) - 5*cos(2t) - 2*cos(3t) - cos(4t))
      const scale = minDim * (width < 768 ? 0.020 : 0.024);
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const isPerimeter = i < count * 0.65;
        const t = (i / (count * 0.65)) * Math.PI * 2;

        let hx = 16 * Math.pow(Math.sin(t), 3);
        let hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        if (!isPerimeter) {
          // Volume interior fill with natural density
          const fillRatio = Math.sqrt(Math.random()) * 0.85;
          hx *= fillRatio;
          hy *= fillRatio;
        }

        // Subtly vary target depth offset for 3D fullness
        const jitter = (Math.random() - 0.5) * 6;
        p.targetX = centerX + hx * scale + jitter;
        p.targetY = centerY + hy * scale + jitter;
      }
      break;
    }

    case 'star': {
      // 5-pointed star geometry with layered inner & outer vertices
      const outerR = minDim * 0.28;
      const innerR = outerR * 0.42;
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const seg = (i / count) * 10;
        const angle = (seg * Math.PI) / 5 - Math.PI / 2;
        const isOuter = Math.floor(seg) % 2 === 0;
        const r = (isOuter ? outerR : innerR) * (0.88 + Math.random() * 0.16);

        p.targetX = centerX + Math.cos(angle) * r;
        p.targetY = centerY + Math.sin(angle) * r;
      }
      break;
    }

    case 'circle': {
      // Concentric orbital rings with varying particle angular velocities
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const ring = i % 3;
        const radius = minDim * 0.11 + ring * (minDim * 0.075);
        const angle = (i / count) * Math.PI * 2 * 3;
        p.targetX = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 5;
        p.targetY = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 5;
      }
      break;
    }

    case 'diamond': {
      // Faceted diamond silhouette and radiant core
      const widthD = minDim * 0.32;
      const heightD = minDim * 0.42;
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const t = i / count;
        let tx = 0;
        let ty = 0;
        if (t < 0.25) {
          const s = t / 0.25;
          tx = s * (widthD / 2);
          ty = -heightD / 2 + s * (heightD / 2);
        } else if (t < 0.5) {
          const s = (t - 0.25) / 0.25;
          tx = (widthD / 2) * (1 - s);
          ty = s * (heightD / 2);
        } else if (t < 0.75) {
          const s = (t - 0.5) / 0.25;
          tx = -s * (widthD / 2);
          ty = (heightD / 2) * (1 - s);
        } else {
          const s = (t - 0.75) / 0.25;
          tx = -(widthD / 2) * (1 - s);
          ty = -s * (heightD / 2);
        }
        p.targetX = centerX + tx + (Math.random() - 0.5) * 5;
        p.targetY = centerY + ty + (Math.random() - 0.5) * 5;
      }
      break;
    }

    case 'balloon': {
      // Balloon volume, knot, and undulating ribbon
      const balloonRadius = minDim * 0.18;
      const knotY = centerY + balloonRadius * 1.35;
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        if (i < count * 0.75) {
          const angle = (i / (count * 0.75)) * Math.PI * 2;
          const rx = Math.cos(angle) * balloonRadius * (0.86 + Math.random() * 0.16);
          const ry = Math.sin(angle) * balloonRadius * 1.25;
          p.targetX = centerX + rx;
          p.targetY = centerY - balloonRadius * 0.2 + ry;
        } else if (i < count * 0.85) {
          // Knot
          p.targetX = centerX + (Math.random() - 0.5) * 14;
          p.targetY = knotY + (Math.random() - 0.5) * 10;
        } else {
          // Ribbon
          const stringIndex = (i - count * 0.85) / (count * 0.15);
          const sy = knotY + stringIndex * (minDim * 0.24);
          const sx = centerX + Math.sin(stringIndex * Math.PI * 3) * 14;
          p.targetX = sx;
          p.targetY = sy;
        }
      }
      break;
    }

    case 'galaxy': {
      // Logarithmic dual-arm spiral galaxy
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const arm = i % 2;
        const t = (i / count) * 4 * Math.PI;
        const r = minDim * 0.04 * Math.sqrt(t * 3.5);
        const theta = t + arm * Math.PI;
        p.targetX = centerX + Math.cos(theta) * r + (Math.random() - 0.5) * 10;
        p.targetY = centerY + Math.sin(theta) * r + (Math.random() - 0.5) * 10;
      }
      break;
    }

    case 'abstract':
    default: {
      // Random organic 3D cloud
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.targetX = p.homeX || Math.random() * width;
        p.targetY = p.homeY || Math.random() * height;
      }
      break;
    }
  }
}
