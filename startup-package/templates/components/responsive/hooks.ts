/**
 * Responsive Hooks
 *
 * Hooks React pour gérer la responsivité et les interactions mobiles.
 *
 * @example
 * ```tsx
 * import {
 *   useBreakpoint,
 *   useMediaQuery,
 *   useOrientation,
 *   useIsTouchDevice,
 *   useSwipe,
 *   useViewportSize,
 * } from '@/hooks/responsive';
 *
 * function MyComponent() {
 *   const { isMobile, isTablet, isDesktop } = useBreakpoint();
 *   const isLargeScreen = useMediaQuery('(min-width: 1024px)');
 *   const { isPortrait, isLandscape } = useOrientation();
 *   const isTouch = useIsTouchDevice();
 *
 *   return (
 *     <div>
 *       {isMobile && <MobileLayout />}
 *       {isTablet && <TabletLayout />}
 *       {isDesktop && <DesktopLayout />}
 *     </div>
 *   );
 * }
 * ```
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// BREAKPOINTS (Tailwind CSS defaults)
// ============================================================================

export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof BREAKPOINTS;

// ============================================================================
// useMediaQuery
// ============================================================================

/**
 * Hook pour écouter une media query CSS
 *
 * @param query - Media query CSS (ex: '(min-width: 768px)')
 * @returns true si la media query correspond
 *
 * @example
 * ```tsx
 * const isLargeScreen = useMediaQuery('(min-width: 1024px)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 * const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
 * ```
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handler = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Utiliser addEventListener pour la compatibilité
    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [query]);

  return matches;
}

// ============================================================================
// useBreakpoint
// ============================================================================

interface BreakpointResult {
  /** Breakpoint actuel */
  current: BreakpointKey;
  /** Largeur de la fenêtre */
  width: number;
  /** Mobile (< 640px) */
  isMobile: boolean;
  /** Tablette (640px - 1023px) */
  isTablet: boolean;
  /** Desktop (>= 1024px) */
  isDesktop: boolean;
  /** >= sm (640px) */
  isSmUp: boolean;
  /** >= md (768px) */
  isMdUp: boolean;
  /** >= lg (1024px) */
  isLgUp: boolean;
  /** >= xl (1280px) */
  isXlUp: boolean;
  /** < sm (640px) */
  isSmDown: boolean;
  /** < md (768px) */
  isMdDown: boolean;
  /** < lg (1024px) */
  isLgDown: boolean;
  /** < xl (1280px) */
  isXlDown: boolean;
}

/**
 * Hook pour connaître le breakpoint actuel et les helpers
 *
 * @example
 * ```tsx
 * function Navigation() {
 *   const { isMobile, isTablet, isDesktop, current } = useBreakpoint();
 *
 *   if (isMobile) {
 *     return <MobileNav />;
 *   }
 *
 *   if (isTablet) {
 *     return <TabletNav />;
 *   }
 *
 *   return <DesktopNav />;
 * }
 * ```
 */
export function useBreakpoint(): BreakpointResult {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setWidth(window.innerWidth);
    };

    // Valeur initiale
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Déterminer le breakpoint actuel
  const getCurrentBreakpoint = (): BreakpointKey => {
    if (width >= BREAKPOINTS['2xl']) return '2xl';
    if (width >= BREAKPOINTS.xl) return 'xl';
    if (width >= BREAKPOINTS.lg) return 'lg';
    if (width >= BREAKPOINTS.md) return 'md';
    if (width >= BREAKPOINTS.sm) return 'sm';
    return 'xs';
  };

  const current = getCurrentBreakpoint();

  return {
    current,
    width,
    // Catégories simplifiées
    isMobile: width < BREAKPOINTS.sm,
    isTablet: width >= BREAKPOINTS.sm && width < BREAKPOINTS.lg,
    isDesktop: width >= BREAKPOINTS.lg,
    // Up (>=)
    isSmUp: width >= BREAKPOINTS.sm,
    isMdUp: width >= BREAKPOINTS.md,
    isLgUp: width >= BREAKPOINTS.lg,
    isXlUp: width >= BREAKPOINTS.xl,
    // Down (<)
    isSmDown: width < BREAKPOINTS.sm,
    isMdDown: width < BREAKPOINTS.md,
    isLgDown: width < BREAKPOINTS.lg,
    isXlDown: width < BREAKPOINTS.xl,
  };
}

// ============================================================================
// useOrientation
// ============================================================================

interface OrientationResult {
  /** Portrait (height > width) */
  isPortrait: boolean;
  /** Paysage (width > height) */
  isLandscape: boolean;
  /** Angle de rotation (0, 90, 180, 270) */
  angle: number;
  /** Type d'orientation */
  type: 'portrait-primary' | 'portrait-secondary' | 'landscape-primary' | 'landscape-secondary';
}

/**
 * Hook pour détecter l'orientation de l'écran
 *
 * @example
 * ```tsx
 * function VideoPlayer() {
 *   const { isLandscape, isPortrait } = useOrientation();
 *
 *   return (
 *     <div className={isLandscape ? 'fullscreen' : 'portrait-view'}>
 *       <video />
 *     </div>
 *   );
 * }
 * ```
 */
export function useOrientation(): OrientationResult {
  const [orientation, setOrientation] = useState<OrientationResult>({
    isPortrait: true,
    isLandscape: false,
    angle: 0,
    type: 'portrait-primary',
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateOrientation = () => {
      const isPortrait = window.innerHeight > window.innerWidth;
      const screenOrientation = window.screen?.orientation;

      setOrientation({
        isPortrait,
        isLandscape: !isPortrait,
        angle: screenOrientation?.angle ?? 0,
        type: (screenOrientation?.type ?? 'portrait-primary') as OrientationResult['type'],
      });
    };

    updateOrientation();

    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  return orientation;
}

// ============================================================================
// useIsTouchDevice
// ============================================================================

/**
 * Hook pour détecter si l'appareil est tactile
 *
 * @example
 * ```tsx
 * function Button({ onClick }) {
 *   const isTouch = useIsTouchDevice();
 *
 *   return (
 *     <button
 *       onClick={onClick}
 *       className={isTouch ? 'touch-target' : 'hover-target'}
 *     >
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */
export function useIsTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkTouch = () => {
      return (
        'ontouchstart' in window ||
        navigator.maxTouchPoints > 0 ||
        (navigator as any).msMaxTouchPoints > 0
      );
    };

    setIsTouch(checkTouch());
  }, []);

  return isTouch;
}

// ============================================================================
// useViewportSize
// ============================================================================

interface ViewportSize {
  width: number;
  height: number;
  /** Largeur visuelle (sans zoom) */
  visualWidth: number;
  /** Hauteur visuelle (sans zoom) */
  visualHeight: number;
}

/**
 * Hook pour obtenir la taille du viewport
 *
 * @example
 * ```tsx
 * function FullscreenModal() {
 *   const { width, height, visualHeight } = useViewportSize();
 *
 *   return (
 *     <div style={{ width, height: visualHeight }}>
 *       Modal content
 *     </div>
 *   );
 * }
 * ```
 */
export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>({
    width: 0,
    height: 0,
    visualWidth: 0,
    visualHeight: 0,
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateSize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
        visualWidth: window.visualViewport?.width ?? window.innerWidth,
        visualHeight: window.visualViewport?.height ?? window.innerHeight,
      });
    };

    updateSize();

    window.addEventListener('resize', updateSize);
    window.visualViewport?.addEventListener('resize', updateSize);

    return () => {
      window.removeEventListener('resize', updateSize);
      window.visualViewport?.removeEventListener('resize', updateSize);
    };
  }, []);

  return size;
}

// ============================================================================
// useSwipe
// ============================================================================

type SwipeDirection = 'left' | 'right' | 'up' | 'down';

interface SwipeCallbacks {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipe?: (direction: SwipeDirection) => void;
}

interface SwipeOptions extends SwipeCallbacks {
  /** Distance minimale pour déclencher un swipe (défaut: 50px) */
  threshold?: number;
  /** Empêcher le scroll pendant le swipe */
  preventDefault?: boolean;
}

interface SwipeResult {
  /** Direction du dernier swipe */
  direction: SwipeDirection | null;
  /** Swipe en cours */
  isSwiping: boolean;
  /** Distance du swipe en cours (X) */
  deltaX: number;
  /** Distance du swipe en cours (Y) */
  deltaY: number;
}

/**
 * Hook pour détecter les gestes de swipe
 *
 * @example
 * ```tsx
 * function Carousel() {
 *   const containerRef = useRef<HTMLDivElement>(null);
 *
 *   const { direction, isSwiping, deltaX } = useSwipe(containerRef, {
 *     threshold: 50,
 *     onSwipeLeft: () => nextSlide(),
 *     onSwipeRight: () => prevSlide(),
 *   });
 *
 *   return (
 *     <div
 *       ref={containerRef}
 *       style={{ transform: isSwiping ? `translateX(${deltaX}px)` : undefined }}
 *     >
 *       Carousel content
 *     </div>
 *   );
 * }
 * ```
 */
export function useSwipe(
  ref: React.RefObject<HTMLElement>,
  options: SwipeOptions = {}
): SwipeResult {
  const {
    threshold = 50,
    preventDefault = false,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onSwipe,
  } = options;

  const [result, setResult] = useState<SwipeResult>({
    direction: null,
    isSwiping: false,
    deltaX: 0,
    deltaY: 0,
  });

  const touchStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      touchStart.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
      setResult((prev) => ({ ...prev, isSwiping: true, deltaX: 0, deltaY: 0 }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStart.current) return;

      if (preventDefault) {
        e.preventDefault();
      }

      const deltaX = e.touches[0].clientX - touchStart.current.x;
      const deltaY = e.touches[0].clientY - touchStart.current.y;

      setResult((prev) => ({ ...prev, deltaX, deltaY }));
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;

      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const deltaX = endX - touchStart.current.x;
      const deltaY = endY - touchStart.current.y;

      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);

      let direction: SwipeDirection | null = null;

      // Déterminer la direction du swipe
      if (absX > threshold || absY > threshold) {
        if (absX > absY) {
          direction = deltaX > 0 ? 'right' : 'left';
        } else {
          direction = deltaY > 0 ? 'down' : 'up';
        }
      }

      // Appeler les callbacks
      if (direction) {
        onSwipe?.(direction);

        switch (direction) {
          case 'left':
            onSwipeLeft?.();
            break;
          case 'right':
            onSwipeRight?.();
            break;
          case 'up':
            onSwipeUp?.();
            break;
          case 'down':
            onSwipeDown?.();
            break;
        }
      }

      setResult({
        direction,
        isSwiping: false,
        deltaX: 0,
        deltaY: 0,
      });

      touchStart.current = null;
    };

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventDefault });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, threshold, preventDefault, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, onSwipe]);

  return result;
}

// ============================================================================
// useLongPress
// ============================================================================

interface LongPressOptions {
  /** Durée avant déclenchement (défaut: 500ms) */
  delay?: number;
  /** Callback sur long press */
  onLongPress: () => void;
  /** Callback sur press court (optionnel) */
  onPress?: () => void;
}

interface LongPressResult {
  /** En train de presser */
  isPressing: boolean;
  /** Long press déclenché */
  isLongPress: boolean;
}

/**
 * Hook pour détecter les appuis longs
 *
 * @example
 * ```tsx
 * function Item({ onDelete, onClick }) {
 *   const { isPressing } = useLongPress(ref, {
 *     delay: 500,
 *     onLongPress: onDelete,
 *     onPress: onClick,
 *   });
 *
 *   return (
 *     <div ref={ref} className={isPressing ? 'pressing' : ''}>
 *       Item
 *     </div>
 *   );
 * }
 * ```
 */
export function useLongPress(
  ref: React.RefObject<HTMLElement>,
  options: LongPressOptions
): LongPressResult {
  const { delay = 500, onLongPress, onPress } = options;

  const [isPressing, setIsPressing] = useState(false);
  const [isLongPress, setIsLongPress] = useState(false);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const start = () => {
      setIsPressing(true);
      isLongPressRef.current = false;

      timeoutRef.current = setTimeout(() => {
        isLongPressRef.current = true;
        setIsLongPress(true);
        onLongPress();
      }, delay);
    };

    const end = () => {
      setIsPressing(false);
      setIsLongPress(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Si ce n'était pas un long press, c'est un press court
      if (!isLongPressRef.current && onPress) {
        onPress();
      }
    };

    const cancel = () => {
      setIsPressing(false);
      setIsLongPress(false);

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };

    element.addEventListener('mousedown', start);
    element.addEventListener('touchstart', start, { passive: true });
    element.addEventListener('mouseup', end);
    element.addEventListener('touchend', end);
    element.addEventListener('mouseleave', cancel);
    element.addEventListener('touchcancel', cancel);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      element.removeEventListener('mousedown', start);
      element.removeEventListener('touchstart', start);
      element.removeEventListener('mouseup', end);
      element.removeEventListener('touchend', end);
      element.removeEventListener('mouseleave', cancel);
      element.removeEventListener('touchcancel', cancel);
    };
  }, [ref, delay, onLongPress, onPress]);

  return { isPressing, isLongPress };
}

// ============================================================================
// useScrollDirection
// ============================================================================

type ScrollDirection = 'up' | 'down' | null;

interface ScrollDirectionOptions {
  /** Seuil de déclenchement (défaut: 10px) */
  threshold?: number;
}

/**
 * Hook pour détecter la direction du scroll
 *
 * @example
 * ```tsx
 * function Header() {
 *   const scrollDirection = useScrollDirection({ threshold: 50 });
 *
 *   return (
 *     <header className={scrollDirection === 'down' ? 'hidden' : 'visible'}>
 *       Header
 *     </header>
 *   );
 * }
 * ```
 */
export function useScrollDirection(options: ScrollDirectionOptions = {}): ScrollDirection {
  const { threshold = 10 } = options;

  const [direction, setDirection] = useState<ScrollDirection>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const diff = currentScrollY - lastScrollY.current;

      if (Math.abs(diff) >= threshold) {
        setDirection(diff > 0 ? 'down' : 'up');
        lastScrollY.current = currentScrollY;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return direction;
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default {
  useMediaQuery,
  useBreakpoint,
  useOrientation,
  useIsTouchDevice,
  useViewportSize,
  useSwipe,
  useLongPress,
  useScrollDirection,
  BREAKPOINTS,
};
