/**
 * Responsive Components
 *
 * Composants utilitaires pour la mise en page responsive.
 *
 * @example
 * ```tsx
 * import {
 *   Container,
 *   Grid,
 *   Stack,
 *   Show,
 *   Hide,
 *   ResponsiveValue,
 * } from '@/components/responsive';
 *
 * function Page() {
 *   return (
 *     <Container maxWidth="lg">
 *       <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={4}>
 *         <Card />
 *         <Card />
 *         <Card />
 *       </Grid>
 *
 *       <Show above="md">
 *         Visible uniquement sur tablette et desktop
 *       </Show>
 *
 *       <Hide above="lg">
 *         Caché sur desktop
 *       </Hide>
 *     </Container>
 *   );
 * }
 * ```
 */
'use client';

import React from 'react';
import { useBreakpoint, type BreakpointKey, BREAKPOINTS } from './hooks';

// ============================================================================
// TYPES
// ============================================================================

/** Valeur responsive par breakpoint */
export type ResponsiveValue<T> = T | Partial<Record<BreakpointKey | 'base', T>>;

/** Helper pour résoudre une valeur responsive */
function resolveResponsiveValue<T>(
  value: ResponsiveValue<T>,
  currentBreakpoint: BreakpointKey
): T | undefined {
  if (typeof value !== 'object' || value === null) {
    return value as T;
  }

  const breakpointOrder: (BreakpointKey | 'base')[] = ['base', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const responsiveValue = value as Partial<Record<BreakpointKey | 'base', T>>;

  // Trouver l'index du breakpoint actuel
  const currentIndex = breakpointOrder.indexOf(currentBreakpoint);

  // Parcourir du breakpoint actuel vers le plus petit
  for (let i = currentIndex; i >= 0; i--) {
    const bp = breakpointOrder[i];
    if (responsiveValue[bp] !== undefined) {
      return responsiveValue[bp];
    }
  }

  return undefined;
}

// ============================================================================
// CONTAINER
// ============================================================================

interface ContainerProps {
  children: React.ReactNode;
  /** Largeur maximale */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full' | 'prose';
  /** Padding horizontal */
  px?: ResponsiveValue<number>;
  /** Centrer le contenu */
  centered?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
  /** Element HTML à utiliser */
  as?: keyof JSX.IntrinsicElements;
}

const containerMaxWidths = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
  prose: 'max-w-prose',
};

/**
 * Container responsive avec largeur maximale
 *
 * @example
 * ```tsx
 * <Container maxWidth="lg" centered>
 *   <Content />
 * </Container>
 * ```
 */
export function Container({
  children,
  maxWidth = 'lg',
  px,
  centered = true,
  className = '',
  as: Component = 'div',
}: ContainerProps) {
  const { current } = useBreakpoint();

  const paddingX = px ? resolveResponsiveValue(px, current) : undefined;
  const paddingStyle = paddingX !== undefined ? { paddingLeft: `${paddingX * 4}px`, paddingRight: `${paddingX * 4}px` } : {};

  const classes = [
    containerMaxWidths[maxWidth],
    centered && 'mx-auto',
    !paddingX && 'px-4 sm:px-6 lg:px-8',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes} style={paddingStyle}>
      {children}
    </Component>
  );
}

// ============================================================================
// GRID
// ============================================================================

interface GridProps {
  children: React.ReactNode;
  /** Nombre de colonnes */
  cols?: ResponsiveValue<1 | 2 | 3 | 4 | 5 | 6 | 12>;
  /** Gap entre les éléments */
  gap?: ResponsiveValue<0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12>;
  /** Gap horizontal uniquement */
  gapX?: ResponsiveValue<0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12>;
  /** Gap vertical uniquement */
  gapY?: ResponsiveValue<0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12>;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Grid responsive
 *
 * @example
 * ```tsx
 * <Grid cols={{ base: 1, sm: 2, lg: 3 }} gap={4}>
 *   <Card />
 *   <Card />
 *   <Card />
 * </Grid>
 * ```
 */
export function Grid({
  children,
  cols = 1,
  gap = 4,
  gapX,
  gapY,
  className = '',
}: GridProps) {
  const { current } = useBreakpoint();

  const colsValue = resolveResponsiveValue(cols, current) ?? 1;
  const gapValue = resolveResponsiveValue(gap, current) ?? 4;
  const gapXValue = gapX !== undefined ? resolveResponsiveValue(gapX, current) : undefined;
  const gapYValue = gapY !== undefined ? resolveResponsiveValue(gapY, current) : undefined;

  const style: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: `repeat(${colsValue}, minmax(0, 1fr))`,
    gap: gapXValue !== undefined || gapYValue !== undefined
      ? undefined
      : `${gapValue * 4}px`,
    columnGap: gapXValue !== undefined ? `${gapXValue * 4}px` : undefined,
    rowGap: gapYValue !== undefined ? `${gapYValue * 4}px` : undefined,
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

// ============================================================================
// STACK
// ============================================================================

interface StackProps {
  children: React.ReactNode;
  /** Direction (vertical par défaut) */
  direction?: ResponsiveValue<'row' | 'col' | 'row-reverse' | 'col-reverse'>;
  /** Gap entre les éléments */
  gap?: ResponsiveValue<0 | 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12>;
  /** Alignement des items */
  align?: ResponsiveValue<'start' | 'center' | 'end' | 'stretch' | 'baseline'>;
  /** Justification du contenu */
  justify?: ResponsiveValue<'start' | 'center' | 'end' | 'between' | 'around' | 'evenly'>;
  /** Retour à la ligne */
  wrap?: boolean;
  /** Classes CSS additionnelles */
  className?: string;
  /** Element HTML à utiliser */
  as?: keyof JSX.IntrinsicElements;
}

const alignMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  stretch: 'stretch',
  baseline: 'baseline',
};

const justifyMap = {
  start: 'flex-start',
  center: 'center',
  end: 'flex-end',
  between: 'space-between',
  around: 'space-around',
  evenly: 'space-evenly',
};

/**
 * Stack flexible (vertical ou horizontal)
 *
 * @example
 * ```tsx
 * <Stack gap={4} align="center">
 *   <Item />
 *   <Item />
 * </Stack>
 *
 * <Stack direction={{ base: 'col', md: 'row' }} gap={4}>
 *   <Item />
 *   <Item />
 * </Stack>
 * ```
 */
export function Stack({
  children,
  direction = 'col',
  gap = 4,
  align,
  justify,
  wrap = false,
  className = '',
  as: Component = 'div',
}: StackProps) {
  const { current } = useBreakpoint();

  const directionValue = resolveResponsiveValue(direction, current) ?? 'col';
  const gapValue = resolveResponsiveValue(gap, current) ?? 4;
  const alignValue = align ? resolveResponsiveValue(align, current) : undefined;
  const justifyValue = justify ? resolveResponsiveValue(justify, current) : undefined;

  const style: React.CSSProperties = {
    display: 'flex',
    flexDirection: directionValue === 'row' ? 'row'
      : directionValue === 'col' ? 'column'
      : directionValue === 'row-reverse' ? 'row-reverse'
      : 'column-reverse',
    gap: `${gapValue * 4}px`,
    alignItems: alignValue ? alignMap[alignValue] : undefined,
    justifyContent: justifyValue ? justifyMap[justifyValue] : undefined,
    flexWrap: wrap ? 'wrap' : undefined,
  };

  return (
    <Component className={className} style={style}>
      {children}
    </Component>
  );
}

// ============================================================================
// SHOW / HIDE
// ============================================================================

interface ShowHideProps {
  children: React.ReactNode;
  /** Afficher/Cacher au-dessus de ce breakpoint */
  above?: BreakpointKey;
  /** Afficher/Cacher en-dessous de ce breakpoint */
  below?: BreakpointKey;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Affiche le contenu conditionnellement selon le breakpoint
 *
 * @example
 * ```tsx
 * // Visible uniquement sur md et plus
 * <Show above="md">Desktop content</Show>
 *
 * // Visible uniquement en dessous de lg
 * <Show below="lg">Mobile/Tablet content</Show>
 * ```
 */
export function Show({ children, above, below, className = '' }: ShowHideProps) {
  const { width } = useBreakpoint();

  let shouldShow = true;

  if (above) {
    shouldShow = shouldShow && width >= BREAKPOINTS[above];
  }

  if (below) {
    shouldShow = shouldShow && width < BREAKPOINTS[below];
  }

  if (!shouldShow) return null;

  return className ? <div className={className}>{children}</div> : <>{children}</>;
}

/**
 * Cache le contenu conditionnellement selon le breakpoint
 *
 * @example
 * ```tsx
 * // Caché sur md et plus
 * <Hide above="md">Mobile only</Hide>
 *
 * // Caché en dessous de lg
 * <Hide below="lg">Desktop only</Hide>
 * ```
 */
export function Hide({ children, above, below, className = '' }: ShowHideProps) {
  const { width } = useBreakpoint();

  let shouldHide = false;

  if (above) {
    shouldHide = shouldHide || width >= BREAKPOINTS[above];
  }

  if (below) {
    shouldHide = shouldHide || width < BREAKPOINTS[below];
  }

  if (shouldHide) return null;

  return className ? <div className={className}>{children}</div> : <>{children}</>;
}

// ============================================================================
// ASPECT RATIO
// ============================================================================

interface AspectRatioProps {
  children: React.ReactNode;
  /** Ratio (ex: 16/9, 4/3, 1) */
  ratio?: number;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Container avec ratio d'aspect fixe
 *
 * @example
 * ```tsx
 * <AspectRatio ratio={16/9}>
 *   <img src="..." alt="..." className="object-cover w-full h-full" />
 * </AspectRatio>
 * ```
 */
export function AspectRatio({
  children,
  ratio = 16 / 9,
  className = '',
}: AspectRatioProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
    >
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// SPACER
// ============================================================================

interface SpacerProps {
  /** Taille de l'espace */
  size?: ResponsiveValue<1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16 | 20 | 24>;
  /** Direction (vertical par défaut) */
  direction?: 'horizontal' | 'vertical';
}

/**
 * Espace flexible entre éléments
 *
 * @example
 * ```tsx
 * <div>
 *   <Header />
 *   <Spacer size={{ base: 4, md: 8 }} />
 *   <Content />
 * </div>
 * ```
 */
export function Spacer({ size = 4, direction = 'vertical' }: SpacerProps) {
  const { current } = useBreakpoint();
  const sizeValue = resolveResponsiveValue(size, current) ?? 4;

  const style: React.CSSProperties = direction === 'horizontal'
    ? { width: `${sizeValue * 4}px`, flexShrink: 0 }
    : { height: `${sizeValue * 4}px`, flexShrink: 0 };

  return <div style={style} aria-hidden="true" />;
}

// ============================================================================
// CENTER
// ============================================================================

interface CenterProps {
  children: React.ReactNode;
  /** Centrer horizontalement */
  horizontal?: boolean;
  /** Centrer verticalement */
  vertical?: boolean;
  /** Hauteur minimale (pour centrage vertical) */
  minHeight?: string;
  /** Classes CSS additionnelles */
  className?: string;
}

/**
 * Centre le contenu horizontalement et/ou verticalement
 *
 * @example
 * ```tsx
 * <Center horizontal vertical minHeight="100vh">
 *   <Loader />
 * </Center>
 * ```
 */
export function Center({
  children,
  horizontal = true,
  vertical = false,
  minHeight,
  className = '',
}: CenterProps) {
  const style: React.CSSProperties = {
    display: 'flex',
    justifyContent: horizontal ? 'center' : undefined,
    alignItems: vertical ? 'center' : undefined,
    minHeight,
  };

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  Container,
  Grid,
  Stack,
  Show,
  Hide,
  AspectRatio,
  Spacer,
  Center,
};
