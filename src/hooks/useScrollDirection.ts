import { useState, useEffect } from 'react';

export type ScrollDirection = 'down' | 'up';

// Global singleton state to avoid duplicate scroll listeners across dozens of elements
let globalScrollDirection: ScrollDirection = 'down';
let globalLastScrollY = typeof window !== 'undefined' ? window.scrollY : 0;
let globalIsFullscreenActive = false;
const listeners = new Set<(direction: ScrollDirection) => void>();
let scrollTicking = false;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'scroll',
    () => {
      if (globalIsFullscreenActive) return;

      if (!scrollTicking) {
        window.requestAnimationFrame(() => {
          const currentY = window.scrollY;
          const delta = currentY - globalLastScrollY;

          // Hysteresis threshold: ignore micro-jitters (< 3px)
          if (Math.abs(delta) >= 3) {
            const newDirection: ScrollDirection = delta > 0 ? 'down' : 'up';
            if (newDirection !== globalScrollDirection) {
              globalScrollDirection = newDirection;
              listeners.forEach((listener) => listener(newDirection));
            }
            globalLastScrollY = currentY;
          }

          scrollTicking = false;
        });
        scrollTicking = true;
      }
    },
    { passive: true }
  );
}

export function getScrollDirection(): ScrollDirection {
  return globalScrollDirection;
}

export function setFullscreenActive(active: boolean) {
  globalIsFullscreenActive = active;
}

export function isFullscreenActive(): boolean {
  return globalIsFullscreenActive;
}

/**
 * React hook to access current scroll direction ('down' | 'up')
 */
export function useScrollDirection(): ScrollDirection {
  const [direction, setDirection] = useState<ScrollDirection>(globalScrollDirection);

  useEffect(() => {
    const handler = (dir: ScrollDirection) => setDirection(dir);
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return direction;
}
