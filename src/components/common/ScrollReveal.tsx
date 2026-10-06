import React, { useEffect, useRef, useState } from 'react';
import { getScrollDirection, isFullscreenActive, ScrollDirection } from '../../hooks/useScrollDirection';

export interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'photo' | 'heading' | 'text' | 'vault';
  staggerIndex?: number;
  staggerDelay?: number; // ms delay per stagger item, default 100ms
  replay?: boolean; // Whether animation may replay when scrolling back into view (default: true)
  once?: boolean; // Shortcut to never replay (e.g. for secret memory reveals)
  threshold?: number; // IntersectionObserver threshold (default: 0.12)
  style?: React.CSSProperties;
}

export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  className = '',
  variant = 'default',
  staggerIndex = 0,
  staggerDelay = 100,
  replay = true,
  once = false,
  threshold = 0.12,
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  const [revealDirection, setRevealDirection] = useState<ScrollDirection>('down');
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const shouldNeverReplay = once || !replay;
  const hasRevealedOnce = useRef(false);

  // Responsive & accessibility detection
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkDimensions = () => setIsMobile(window.innerWidth < 640);
    checkDimensions();
    window.addEventListener('resize', checkDimensions);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      window.removeEventListener('resize', checkDimensions);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, []);

  // IntersectionObserver for robust, non-flickering bidirectional reveal
  useEffect(() => {
    const element = containerRef.current;
    if (!element || prefersReducedMotion) {
      if (prefersReducedMotion) setIsRevealed(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry) return;

        // Freeze reveal updates if Fullscreen Image modal is active behind this section
        if (isFullscreenActive()) return;

        if (entry.isIntersecting) {
          const currentDir = getScrollDirection();
          setRevealDirection(currentDir);
          setIsRevealed(true);
          hasRevealedOnce.current = true;

          // If once/no-replay is specified, disconnect observer immediately once revealed
          if (shouldNeverReplay) {
            observer.disconnect();
          }
        } else {
          // HYSTERESIS SAFETY:
          // Only reset when completely outside viewport (ratio = 0) and when replay is allowed.
          // This eliminates edge jitter when hovering on boundary.
          if (!shouldNeverReplay && hasRevealedOnce.current && entry.intersectionRatio === 0) {
            setIsRevealed(false);
          }
        }
      },
      {
        threshold,
        // Generous bottom margin to start early when scrolling down, and top margin when scrolling up
        rootMargin: isMobile ? '0px 0px -20px 0px' : '0px 0px -40px 0px',
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [threshold, shouldNeverReplay, prefersReducedMotion, isMobile]);

  // Compute CSS styles dynamically
  const getDynamicStyles = (): React.CSSProperties => {
    if (prefersReducedMotion) {
      return {
        opacity: 1,
        transform: 'none',
        filter: 'none',
        ...style,
      };
    }

    const delayMs = staggerIndex > 0 ? staggerIndex * staggerDelay : 0;

    if (isRevealed) {
      // DURATION:
      // Scrolling UP: 800ms - 1100ms (slow, cinematic, intentional)
      // Scrolling DOWN: 550ms - 650ms (responsive, smooth)
      const durationMs = revealDirection === 'up'
        ? (variant === 'photo' ? (isMobile ? 750 : 950) : variant === 'vault' ? (isMobile ? 800 : 1050) : (isMobile ? 700 : 880))
        : (isMobile ? 450 : 580);

      return {
        opacity: 1,
        transform: 'translate3d(0, 0, 0) scale(1)',
        filter: 'blur(0px)',
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: `${durationMs}ms`,
        transitionDelay: `${delayMs}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
        willChange: 'opacity, transform, filter',
        ...style,
      };
    }

    // Hidden Initial State:
    // UP: Enter from slightly above (-35px) with blur (5px) and scale (0.97)
    // DOWN: Enter from slightly below (+30px)
    if (revealDirection === 'up') {
      const yOffset = isMobile
        ? (variant === 'photo' ? -14 : variant === 'heading' ? -12 : -16)
        : (variant === 'photo' ? -25 : variant === 'heading' ? -20 : -35);

      const scaleVal = variant === 'photo' ? 0.96 : variant === 'vault' ? 0.97 : 0.98;
      const blurVal = isMobile ? '2px' : (variant === 'photo' ? '6px' : '5px');

      return {
        opacity: 0,
        transform: `translate3d(0, ${yOffset}px, 0) scale(${scaleVal})`,
        filter: `blur(${blurVal})`,
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: '220ms', // Rapid clean reset when scrolling far out of view
        transitionTimingFunction: 'ease-out',
        willChange: 'opacity, transform, filter',
        ...style,
      };
    }

    // DOWN: Enter from slightly below
    const yOffset = isMobile ? 16 : (variant === 'heading' ? 20 : 30);
    return {
      opacity: 0,
      transform: `translate3d(0, ${yOffset}px, 0) scale(1)`,
      filter: 'blur(0px)',
      transitionProperty: 'opacity, transform, filter',
      transitionDuration: '220ms',
      transitionTimingFunction: 'ease-out',
      willChange: 'opacity, transform, filter',
      ...style,
    };
  };

  return (
    <div
      ref={containerRef}
      className={`scroll-reveal-container ${className}`}
      data-reveal-direction={revealDirection}
      data-is-revealed={isRevealed ? 'true' : 'false'}
      style={getDynamicStyles()}
    >
      {children}
    </div>
  );
};

/**
 * Dedicated reveal wrapper for photos
 */
export const ScrollRevealPhoto: React.FC<Omit<ScrollRevealProps, 'variant'>> = (props) => {
  return (
    <ScrollReveal
      {...props}
      variant="photo"
    />
  );
};

/**
 * Dedicated reveal wrapper for headings with subtle cinematic text mask
 */
export const ScrollRevealHeading: React.FC<Omit<ScrollRevealProps, 'variant'>> = (props) => {
  return (
    <ScrollReveal
      {...props}
      variant="heading"
    />
  );
};
