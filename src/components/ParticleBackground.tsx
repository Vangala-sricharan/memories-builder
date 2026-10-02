import React, { useEffect, useRef, useState } from 'react';
import { ParticleShape } from '../types';

interface Particle {
  // Current coordinates
  x: number;
  y: number;
  z: number; // Depth factor (0.3 to 2.5)

  // Velocities
  vx: number;
  vy: number;

  // Origin / Target coordinates for morphing
  originX: number;
  originY: number;
  targetX: number;
  targetY: number;

  // Dispersion coordinates during transition
  disperseX: number;
  disperseY: number;

  // Physical properties
  size: number;
  baseAlpha: number;
  alpha: number;
  colorType: 'white' | 'red' | 'gray';
  colorString: string;
  glowSize: number;

  // Organic wobble/drift
  wobbleSpeed: number;
  wobbleAngle: number;
  wobbleRadius: number;

  // Transition individual timing
  delay: number;
}

interface ParticleBackgroundProps {
  currentShape?: ParticleShape;
  className?: string;
  intensity?: 'subtle' | 'normal' | 'vibrant';
  interactive?: boolean;
}

export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
  currentShape = 'abstract',
  className = '',
  intensity = 'normal',
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationFrameIdRef = useRef<number | null>(null);

  // Smooth mouse/gyroscope parallax state
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const gyroRef = useRef({ gamma: 0, beta: 0, targetGamma: 0, targetBeta: 0 });
  const isGyroAvailableRef = useRef(false);

  // Transition state
  const transitionRef = useRef({
    progress: 1, // 1 means reached target shape
    isTransitioning: false,
    duration: 120, // frames (~2 seconds at 60fps)
    elapsed: 120,
    fromShape: 'abstract' as ParticleShape,
    toShape: 'abstract' as ParticleShape,
  });

  const prefersReducedMotionRef = useRef(false);

  // Initialize and handle resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    prefersReducedMotionRef.current = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);

      // Re-assign targets when window size changes
      assignShapeTargets(particlesRef.current, currentShape, width, height);
    };

    // Calculate particle count adaptively
    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 110 : 250;

    // Generate initial particle system
    const newParticles: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const z = 0.3 + Math.random() * 2.2;
      const randColor = Math.random();
      let colorType: 'white' | 'red' | 'gray' = 'white';
      let colorString = 'rgba(255, 255, 255, ';
      let baseAlpha = 0.2 + Math.random() * 0.6;

      if (randColor < 0.22) {
        // Red accent particle
        colorType = 'red';
        colorString = 'rgba(229, 9, 20, ';
        baseAlpha = 0.35 + Math.random() * 0.55;
      } else if (randColor < 0.45) {
        // Subtle gray particle
        colorType = 'gray';
        colorString = 'rgba(160, 160, 160, ';
        baseAlpha = 0.15 + Math.random() * 0.35;
      }

      const x = Math.random() * width;
      const y = Math.random() * height;

      newParticles.push({
        x,
        y,
        z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        originX: x,
        originY: y,
        targetX: x,
        targetY: y,
        disperseX: x + (Math.random() - 0.5) * 350,
        disperseY: y + (Math.random() - 0.5) * 350,
        size: (0.8 + Math.random() * 1.8) * (z * 0.8),
        baseAlpha,
        alpha: baseAlpha,
        colorType,
        colorString,
        glowSize: colorType === 'red' ? 6 : 3,
        wobbleSpeed: 0.005 + Math.random() * 0.015,
        wobbleAngle: Math.random() * Math.PI * 2,
        wobbleRadius: 0.4 + Math.random() * 1.2,
        delay: Math.random() * 25,
      });
    }

    particlesRef.current = newParticles;
    handleResize();
    window.addEventListener('resize', handleResize);

    // Mouse parallax tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return;
      const normX = (e.clientX / window.innerWidth) * 2 - 1;
      const normY = (e.clientY / window.innerHeight) * 2 - 1;
      mouseRef.current.targetX = normX * 35;
      mouseRef.current.targetY = normY * 35;
    };

    // Mobile Gyroscope / DeviceOrientation tracking
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!interactive) return;
      if (e.gamma !== null && e.beta !== null) {
        isGyroAvailableRef.current = true;
        // Clamp gamma and beta to avoid wild motion
        const clampedGamma = Math.max(-45, Math.min(45, e.gamma));
        const clampedBeta = Math.max(-45, Math.min(45, e.beta - 45)); // assume holding around 45deg
        gyroRef.current.targetGamma = (clampedGamma / 45) * 30;
        gyroRef.current.targetBeta = (clampedBeta / 45) * 30;
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    // Tab visibility handling (pause when hidden)
    let isTabVisible = true;
    const handleVisibilityChange = () => {
      isTabVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Main animation loop
    let lastTime = performance.now();

    const render = (time: number) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      if (!isTabVisible) {
        animationFrameIdRef.current = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Smooth inertia for mouse/gyro parallax
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      gyroRef.current.gamma += (gyroRef.current.targetGamma - gyroRef.current.gamma) * 0.05;
      gyroRef.current.beta += (gyroRef.current.targetBeta - gyroRef.current.beta) * 0.05;

      const parallaxX = isGyroAvailableRef.current
        ? gyroRef.current.gamma
        : mouseRef.current.x;
      const parallaxY = isGyroAvailableRef.current
        ? gyroRef.current.beta
        : mouseRef.current.y;

      // Handle morph transition progress
      const trans = transitionRef.current;
      if (trans.isTransitioning) {
        trans.elapsed += 1;
        trans.progress = Math.min(1, trans.elapsed / trans.duration);
        if (trans.progress >= 1) {
          trans.isTransitioning = false;
        }
      }

      // Render and update each particle
      const particles = particlesRef.current;
      const len = particles.length;

      for (let i = 0; i < len; i++) {
        const p = particles[i];

        // Wobble oscillation
        p.wobbleAngle += p.wobbleSpeed;
        const wobbleOffsetX = Math.cos(p.wobbleAngle) * p.wobbleRadius;
        const wobbleOffsetY = Math.sin(p.wobbleAngle) * p.wobbleRadius;

        // If shape is abstract, particles drift freely
        if (currentShape === 'abstract' && !trans.isTransitioning) {
          p.x += p.vx + wobbleOffsetX * 0.1;
          p.y += p.vy + wobbleOffsetY * 0.1;

          // Wrap boundaries smoothly
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;
          if (p.y < -20) p.y = height + 20;
          if (p.y > height + 20) p.y = -20;
        } else {
          // Morphing / Formed State
          if (trans.isTransitioning) {
            // Organic multi-stage transition:
            // 0 -> 0.35: Disperse outward
            // 0.35 -> 1.0: Travel and converge onto target formation
            const pTime = Math.max(0, trans.elapsed - p.delay) / Math.max(1, trans.duration - p.delay);
            const clampedP = Math.min(1, Math.max(0, pTime));

            if (clampedP < 0.4) {
              // Dispersal phase
              const tDisperse = clampedP / 0.4;
              const easeOut = Math.sin((tDisperse * Math.PI) / 2);
              p.x = p.originX + (p.disperseX - p.originX) * easeOut;
              p.y = p.originY + (p.disperseY - p.originY) * easeOut;
            } else {
              // Convergence phase
              const tConverge = (clampedP - 0.4) / 0.6;
              // Smooth cubic bezier easing
              const easeIn = tConverge * tConverge * (3 - 2 * tConverge);
              p.x = p.disperseX + (p.targetX - p.disperseX) * easeIn;
              p.y = p.disperseY + (p.targetY - p.disperseY) * easeIn;
            }
          } else {
            // Already in formation: maintain gentle spring orbit around target
            const dx = p.targetX - p.x;
            const dy = p.targetY - p.y;
            p.vx = p.vx * 0.88 + dx * 0.03;
            p.vy = p.vy * 0.88 + dy * 0.03;
            p.x += p.vx + wobbleOffsetX * 0.2;
            p.y += p.vy + wobbleOffsetY * 0.2;
          }
        }

        // Apply depth parallax
        const displayX = p.x + parallaxX * (p.z * 0.6);
        const displayY = p.y + parallaxY * (p.z * 0.6);

        // Alpha calculation based on intensity
        const intensityMul = intensity === 'vibrant' ? 1.25 : intensity === 'subtle' ? 0.75 : 1;
        const currentAlpha = Math.min(1, p.baseAlpha * intensityMul);

        // Draw particle
        ctx.beginPath();
        ctx.arc(displayX, displayY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `${p.colorString}${currentAlpha})`;
        ctx.fill();

        // Soft glow for red and prominent white particles
        if (p.colorType === 'red' || (p.colorType === 'white' && p.z > 1.8)) {
          ctx.beginPath();
          ctx.arc(displayX, displayY, p.size + p.glowSize, 0, Math.PI * 2);
          ctx.fillStyle = p.colorType === 'red' 
            ? `rgba(229, 9, 20, ${currentAlpha * 0.18})` 
            : `rgba(255, 255, 255, ${currentAlpha * 0.12})`;
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

  // When currentShape prop changes, trigger morph transition
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !particlesRef.current.length) return;

    const width = window.innerWidth;
    const height = window.innerHeight;
    const particles = particlesRef.current;

    // Start transition
    const trans = transitionRef.current;
    trans.fromShape = trans.toShape;
    trans.toShape = currentShape;
    trans.isTransitioning = true;
    trans.elapsed = 0;
    trans.progress = 0;
    trans.duration = prefersReducedMotionRef.current ? 40 : 100;

    // For each particle, save origin, generate dispersal burst, compute new target
    const burstMagnitude = Math.min(width, height) * 0.28;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.originX = p.x;
      p.originY = p.y;

      const angle = Math.random() * Math.PI * 2;
      const dist = (0.3 + Math.random() * 0.7) * burstMagnitude;
      p.disperseX = p.x + Math.cos(angle) * dist;
      p.disperseY = p.y + Math.sin(angle) * dist;
    }

    assignShapeTargets(particles, currentShape, width, height);
  }, [currentShape]);

  return (
    <div className={`pointer-events-none fixed inset-0 z-0 overflow-hidden ${className}`}>
      <canvas
        ref={canvasRef}
        className="block h-full w-full opacity-90 transition-opacity duration-1000"
      />
      {/* Subtle cinematic radial vignette */}
      <div className="cinematic-vignette absolute inset-0 pointer-events-none" />
    </div>
  );
};

// Shape target position generator for particle morphing
function assignShapeTargets(
  particles: Particle[],
  shape: ParticleShape,
  width: number,
  height: number
) {
  const count = particles.length;
  const centerX = width * 0.5;
  // Position shape slightly higher or centered nicely
  const centerY = height * (width < 768 ? 0.44 : 0.48);
  const minDim = Math.min(width, height);

  switch (shape) {
    case 'heart': {
      // Parametric cardioid heart:
      // x = 16 * sin^3(t)
      // y = - (13*cos(t) - 5*cos(2t) - 2*cos(3t) - cos(4t))
      const scale = minDim * (width < 768 ? 0.02 : 0.024);
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        // Distribute points along perimeter and filled interior
        const isPerimeter = i < count * 0.65;
        const t = (i / (count * 0.65)) * Math.PI * 2;
        
        let hx = 16 * Math.pow(Math.sin(t), 3);
        let hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));

        if (!isPerimeter) {
          // Scatter inside the heart volume
          const fillRatio = Math.sqrt(Math.random()) * 0.82;
          hx *= fillRatio;
          hy *= fillRatio;
        }

        p.targetX = centerX + hx * scale + (Math.random() - 0.5) * 8;
        p.targetY = centerY + hy * scale + (Math.random() - 0.5) * 8;
      }
      break;
    }

    case 'star': {
      // 5-pointed star
      const outerR = minDim * 0.28;
      const innerR = outerR * 0.42;
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const seg = (i / count) * 10;
        const angle = (seg * Math.PI) / 5 - Math.PI / 2;
        const isOuter = Math.floor(seg) % 2 === 0;
        const r = (isOuter ? outerR : innerR) * (0.85 + Math.random() * 0.2);

        p.targetX = centerX + Math.cos(angle) * r;
        p.targetY = centerY + Math.sin(angle) * r;
      }
      break;
    }

    case 'circle': {
      // Multi-tier orbital circles
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const ring = i % 3;
        const radius = (minDim * 0.12) + ring * (minDim * 0.08);
        const angle = (i / count) * Math.PI * 2 * 3;
        p.targetX = centerX + Math.cos(angle) * radius + (Math.random() - 0.5) * 6;
        p.targetY = centerY + Math.sin(angle) * radius + (Math.random() - 0.5) * 6;
      }
      break;
    }

    case 'diamond': {
      // Faceted diamond gem outline and core
      const widthD = minDim * 0.32;
      const heightD = minDim * 0.42;
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const t = (i / count);
        let tx = 0;
        let ty = 0;
        if (t < 0.25) {
          // Top to right
          const s = t / 0.25;
          tx = s * (widthD / 2);
          ty = -heightD / 2 + s * (heightD / 2);
        } else if (t < 0.5) {
          // Right to bottom
          const s = (t - 0.25) / 0.25;
          tx = (widthD / 2) * (1 - s);
          ty = s * (heightD / 2);
        } else if (t < 0.75) {
          // Bottom to left
          const s = (t - 0.5) / 0.25;
          tx = -s * (widthD / 2);
          ty = (heightD / 2) * (1 - s);
        } else {
          // Left to top
          const s = (t - 0.75) / 0.25;
          tx = -(widthD / 2) * (1 - s);
          ty = -s * (heightD / 2);
        }
        p.targetX = centerX + tx + (Math.random() - 0.5) * 6;
        p.targetY = centerY + ty + (Math.random() - 0.5) * 6;
      }
      break;
    }

    case 'balloon': {
      // Balloon shape: oval sphere on top, pinch knot at base, hanging wavy ribbon
      const balloonRadius = minDim * 0.18;
      const knotY = centerY + balloonRadius * 1.35;
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        if (i < count * 0.75) {
          // Balloon body
          const angle = (i / (count * 0.75)) * Math.PI * 2;
          const rx = Math.cos(angle) * balloonRadius * (0.85 + Math.random() * 0.18);
          // Egg/pear shape stretch
          const ry = Math.sin(angle) * balloonRadius * 1.25;
          p.targetX = centerX + rx;
          p.targetY = centerY - balloonRadius * 0.2 + ry;
        } else if (i < count * 0.85) {
          // Knot triangle
          const kx = (Math.random() - 0.5) * 16;
          const ky = (Math.random() - 0.5) * 12;
          p.targetX = centerX + kx;
          p.targetY = knotY + ky;
        } else {
          // Trailing ribbon string
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
      // Golden ratio spiral / galaxy arms
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        const arm = i % 2;
        const t = (i / count) * 4 * Math.PI;
        const r = (minDim * 0.04) * Math.sqrt(t * 3.5);
        const theta = t + arm * Math.PI;
        p.targetX = centerX + Math.cos(theta) * r + (Math.random() - 0.5) * 12;
        p.targetY = centerY + Math.sin(theta) * r + (Math.random() - 0.5) * 12;
      }
      break;
    }

    case 'abstract':
    default: {
      // Natural scattered 3D cloud
      for (let i = 0; i < count; i++) {
        const p = particles[i];
        p.targetX = Math.random() * width;
        p.targetY = Math.random() * height;
      }
      break;
    }
  }
}
