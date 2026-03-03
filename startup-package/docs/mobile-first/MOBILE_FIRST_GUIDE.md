# Guide Mobile-First et Responsivité 📱

> L'approche Mobile-First est **obligatoire** - Toutes les applications doivent être conçues pour mobile d'abord

---

## Table des Matières

1. [Philosophie Mobile-First](#philosophie-mobile-first)
2. [Breakpoints et Media Queries](#breakpoints-et-media-queries)
3. [Composants Responsifs](#composants-responsifs)
4. [Navigation Mobile](#navigation-mobile)
5. [Formulaires Mobile](#formulaires-mobile)
6. [Performance Mobile](#performance-mobile)
7. [Touch et Gestes](#touch-et-gestes)
8. [Tests et Validation](#tests-et-validation)

---

## Philosophie Mobile-First

### Pourquoi Mobile-First ?

```
📊 STATISTIQUES 2024 :
   • 60%+ du trafic web mondial est mobile
   • 70%+ des achats e-commerce débutent sur mobile
   • Google utilise l'indexation Mobile-First

🎯 AVANTAGES :
   • Performance optimisée (moins de CSS à charger)
   • Focus sur l'essentiel (UX simplifiée)
   • Progression naturelle vers les grands écrans
   • Meilleur SEO
```

### Principe Fondamental

```css
/* ❌ MAUVAIS : Desktop-First (à éviter) */
.container {
  width: 1200px;
  padding: 40px;
}

@media (max-width: 768px) {
  .container {
    width: 100%;
    padding: 16px;
  }
}

/* ✅ BON : Mobile-First (obligatoire) */
.container {
  width: 100%;
  padding: 16px;
}

@media (min-width: 768px) {
  .container {
    max-width: 1200px;
    padding: 40px;
  }
}
```

### Règle d'Or

```
1. Commencer par la version MOBILE
2. Ajouter de la complexité pour les écrans plus grands
3. JAMAIS l'inverse
```

---

## Breakpoints et Media Queries

### Breakpoints Standard (Tailwind CSS)

```typescript
// lib/config/breakpoints.ts

export const BREAKPOINTS = {
  xs: 0,       // Mobile portrait
  sm: 640,     // Mobile landscape
  md: 768,     // Tablette portrait
  lg: 1024,    // Tablette landscape / Desktop small
  xl: 1280,    // Desktop
  '2xl': 1536, // Desktop large
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Largeurs max de contenu par breakpoint
export const MAX_WIDTHS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;
```

### Configuration Tailwind

```javascript
// tailwind.config.js

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    screens: {
      // Mobile-First : min-width par défaut
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',

      // Utilitaires pour cibler spécifiquement
      'mobile': { max: '639px' },
      'tablet': { min: '640px', max: '1023px' },
      'desktop': { min: '1024px' },

      // Touch devices
      'touch': { raw: '(hover: none)' },
      'pointer': { raw: '(hover: hover)' },
    },
    extend: {
      // Espacements mobile-friendly
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Hauteurs pour mobile
      height: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh', // Dynamic viewport height
      },
      minHeight: {
        'screen-safe': 'calc(100vh - env(safe-area-inset-top) - env(safe-area-inset-bottom))',
        'dvh': '100dvh',
      },
    },
  },
  plugins: [],
};
```

### Hook useBreakpoint

```typescript
// lib/hooks/useBreakpoint.ts

'use client';

import { useState, useEffect } from 'react';
import { BREAKPOINTS, Breakpoint } from '@/lib/config/breakpoints';

/**
 * Hook pour détecter le breakpoint actuel
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { isMobile, isTablet, isDesktop, breakpoint } = useBreakpoint();
 *
 *   if (isMobile) {
 *     return <MobileLayout />;
 *   }
 *   return <DesktopLayout />;
 * }
 * ```
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('xs');
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    function handleResize() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      setWindowSize({ width, height });

      // Déterminer le breakpoint
      if (width >= BREAKPOINTS['2xl']) {
        setBreakpoint('2xl');
      } else if (width >= BREAKPOINTS.xl) {
        setBreakpoint('xl');
      } else if (width >= BREAKPOINTS.lg) {
        setBreakpoint('lg');
      } else if (width >= BREAKPOINTS.md) {
        setBreakpoint('md');
      } else if (width >= BREAKPOINTS.sm) {
        setBreakpoint('sm');
      } else {
        setBreakpoint('xs');
      }
    }

    // Initialisation
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    breakpoint,
    windowSize,
    // Helpers
    isMobile: breakpoint === 'xs' || breakpoint === 'sm',
    isTablet: breakpoint === 'md',
    isDesktop: breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl',
    // Comparaisons
    isAbove: (bp: Breakpoint) => windowSize.width >= BREAKPOINTS[bp],
    isBelow: (bp: Breakpoint) => windowSize.width < BREAKPOINTS[bp],
  };
}

/**
 * Hook pour détecter si c'est un appareil tactile
 */
export function useIsTouchDevice() {
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    setIsTouch(
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0
    );
  }, []);

  return isTouch;
}

/**
 * Hook pour l'orientation de l'écran
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');

  useEffect(() => {
    function handleOrientationChange() {
      setOrientation(
        window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      );
    }

    handleOrientationChange();

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return orientation;
}
```

### CSS Custom Properties pour Responsive

```css
/* app/globals.css */

:root {
  /* Espacements responsive */
  --spacing-page: 1rem;
  --spacing-section: 1.5rem;
  --spacing-component: 1rem;

  /* Tailles de police responsive */
  --font-size-base: 1rem;
  --font-size-lg: 1.125rem;
  --font-size-xl: 1.25rem;
  --font-size-2xl: 1.5rem;
  --font-size-3xl: 1.875rem;

  /* Largeur max du contenu */
  --max-width-content: 100%;

  /* Hauteur du header/footer */
  --header-height: 56px;
  --footer-height: 64px;
  --bottom-nav-height: 64px;
}

@media (min-width: 640px) {
  :root {
    --spacing-page: 1.5rem;
    --spacing-section: 2rem;
    --font-size-2xl: 1.75rem;
    --font-size-3xl: 2.25rem;
  }
}

@media (min-width: 768px) {
  :root {
    --spacing-page: 2rem;
    --spacing-section: 3rem;
    --header-height: 64px;
    --bottom-nav-height: 0px; /* Pas de nav bottom sur tablette+ */
  }
}

@media (min-width: 1024px) {
  :root {
    --spacing-page: 2.5rem;
    --spacing-section: 4rem;
    --max-width-content: 1024px;
  }
}

@media (min-width: 1280px) {
  :root {
    --max-width-content: 1200px;
  }
}

/* Safe areas pour iOS */
@supports (padding: env(safe-area-inset-top)) {
  :root {
    --safe-area-top: env(safe-area-inset-top);
    --safe-area-bottom: env(safe-area-inset-bottom);
    --safe-area-left: env(safe-area-inset-left);
    --safe-area-right: env(safe-area-inset-right);
  }
}
```

---

## Composants Responsifs

### Container Responsive

```tsx
// components/ui/Container.tsx

import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  padding?: boolean;
}

const sizeClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  full: 'max-w-full',
};

export function Container({
  children,
  className,
  size = 'lg',
  padding = true,
}: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full',
        sizeClasses[size],
        padding && 'px-4 sm:px-6 lg:px-8',
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Grid Responsive

```tsx
// components/ui/Grid.tsx

import { cn } from '@/lib/utils';

interface GridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
}

const gapClasses = {
  sm: 'gap-2 sm:gap-3',
  md: 'gap-4 sm:gap-6',
  lg: 'gap-6 sm:gap-8',
};

export function Grid({
  children,
  className,
  cols = { default: 1, sm: 2, lg: 3 },
  gap = 'md',
}: GridProps) {
  const gridCols = [
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
  ].filter(Boolean).join(' ');

  return (
    <div
      className={cn(
        'grid',
        gridCols,
        gapClasses[gap],
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Stack Responsive

```tsx
// components/ui/Stack.tsx

import { cn } from '@/lib/utils';

interface StackProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'vertical' | 'horizontal' | 'responsive';
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
}

const gapClasses = {
  xs: 'gap-1',
  sm: 'gap-2',
  md: 'gap-4',
  lg: 'gap-6',
  xl: 'gap-8',
};

const alignClasses = {
  start: 'items-start',
  center: 'items-center',
  end: 'items-end',
  stretch: 'items-stretch',
};

const justifyClasses = {
  start: 'justify-start',
  center: 'justify-center',
  end: 'justify-end',
  between: 'justify-between',
  around: 'justify-around',
};

export function Stack({
  children,
  className,
  direction = 'vertical',
  gap = 'md',
  align = 'stretch',
  justify = 'start',
}: StackProps) {
  const directionClass = {
    vertical: 'flex-col',
    horizontal: 'flex-row',
    responsive: 'flex-col sm:flex-row', // Vertical sur mobile, horizontal sur desktop
  }[direction];

  return (
    <div
      className={cn(
        'flex',
        directionClass,
        gapClasses[gap],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
    >
      {children}
    </div>
  );
}
```

### Composant Show/Hide Responsive

```tsx
// components/ui/Responsive.tsx

'use client';

import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { Breakpoint } from '@/lib/config/breakpoints';

interface ShowProps {
  children: React.ReactNode;
  above?: Breakpoint;
  below?: Breakpoint;
  at?: Breakpoint | Breakpoint[];
}

/**
 * Afficher un contenu uniquement à certains breakpoints
 *
 * @example
 * ```tsx
 * // Afficher uniquement sur mobile
 * <Show below="md">
 *   <MobileMenu />
 * </Show>
 *
 * // Afficher uniquement sur desktop
 * <Show above="lg">
 *   <DesktopSidebar />
 * </Show>
 *
 * // Afficher uniquement sur tablette
 * <Show at="md">
 *   <TabletLayout />
 * </Show>
 * ```
 */
export function Show({ children, above, below, at }: ShowProps) {
  const { isAbove, isBelow, breakpoint } = useBreakpoint();

  let shouldShow = true;

  if (above) {
    shouldShow = shouldShow && isAbove(above);
  }

  if (below) {
    shouldShow = shouldShow && isBelow(below);
  }

  if (at) {
    const breakpoints = Array.isArray(at) ? at : [at];
    shouldShow = shouldShow && breakpoints.includes(breakpoint);
  }

  if (!shouldShow) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Version CSS-only (pas de JS, meilleur pour SSR)
 */
export function ShowCSS({
  children,
  className,
  showOn,
}: {
  children: React.ReactNode;
  className?: string;
  showOn: 'mobile' | 'tablet' | 'desktop' | 'mobile-tablet' | 'tablet-desktop';
}) {
  const showClasses = {
    'mobile': 'block sm:hidden',
    'tablet': 'hidden sm:block lg:hidden',
    'desktop': 'hidden lg:block',
    'mobile-tablet': 'block lg:hidden',
    'tablet-desktop': 'hidden sm:block',
  };

  return (
    <div className={`${showClasses[showOn]} ${className || ''}`}>
      {children}
    </div>
  );
}
```

---

## Navigation Mobile

### Bottom Navigation (Mobile)

```tsx
// components/layout/BottomNav.tsx

'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, Search, PlusCircle, User, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { href: '/', label: 'Accueil', icon: Home },
  { href: '/search', label: 'Recherche', icon: Search },
  { href: '/create', label: 'Créer', icon: PlusCircle },
  { href: '/profile', label: 'Profil', icon: User },
  { href: '/menu', label: 'Menu', icon: Menu },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Spacer pour éviter que le contenu soit caché */}
      <div className="h-16 sm:hidden" />

      {/* Navigation fixe en bas */}
      <nav
        className={cn(
          'fixed bottom-0 left-0 right-0 z-50',
          'bg-white dark:bg-gray-900',
          'border-t border-gray-200 dark:border-gray-800',
          'pb-safe', // Safe area pour iOS
          'sm:hidden' // Masquer sur tablette+
        )}
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center',
                  'w-full h-full',
                  'text-xs font-medium',
                  'transition-colors duration-200',
                  isActive
                    ? 'text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                <Icon
                  className={cn(
                    'w-6 h-6 mb-1',
                    isActive && 'scale-110'
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
```

### Header Mobile avec Menu Hamburger

```tsx
// components/layout/MobileHeader.tsx

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileHeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function MobileHeader({
  title,
  showBack,
  onBack,
  rightAction,
}: MobileHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      {/* Header */}
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50',
          'h-14 px-4',
          'bg-white dark:bg-gray-900',
          'border-b border-gray-200 dark:border-gray-800',
          'flex items-center justify-between',
          'pt-safe' // Safe area pour iOS
        )}
      >
        {/* Left */}
        <div className="flex items-center w-20">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Retour"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          ) : (
            <button
              onClick={() => setIsMenuOpen(true)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
              aria-label="Menu"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Center - Title */}
        <h1 className="text-lg font-semibold truncate">
          {title}
        </h1>

        {/* Right */}
        <div className="flex items-center justify-end w-20">
          {rightAction}
        </div>
      </header>

      {/* Spacer */}
      <div className="h-14 pt-safe" />

      {/* Menu Drawer */}
      <MobileMenuDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
    </>
  );
}

function MobileMenuDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed top-0 left-0 bottom-0 z-50',
          'w-80 max-w-[85vw]',
          'bg-white dark:bg-gray-900',
          'transform transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b pt-safe">
          <span className="text-lg font-semibold">Menu</span>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {/* Ajouter vos liens de navigation */}
          <Link
            href="/"
            className="block py-3 px-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={onClose}
          >
            Accueil
          </Link>
          {/* ... autres liens */}
        </nav>
      </div>
    </>
  );
}
```

### Layout Responsive Complet

```tsx
// components/layout/ResponsiveLayout.tsx

'use client';

import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { MobileHeader } from './MobileHeader';
import { BottomNav } from './BottomNav';
import { DesktopSidebar } from './DesktopSidebar';
import { DesktopHeader } from './DesktopHeader';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
}

export function ResponsiveLayout({
  children,
  title,
  showBack,
}: ResponsiveLayoutProps) {
  const { isMobile } = useBreakpoint();

  if (isMobile) {
    return (
      <div className="min-h-dvh bg-gray-50 dark:bg-gray-950">
        <MobileHeader title={title} showBack={showBack} />
        <main className="px-4 py-4 pb-20">
          {children}
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <DesktopHeader />
      <div className="flex">
        <DesktopSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
```

---

## Formulaires Mobile

### Principes pour Formulaires Mobile

```
✅ FAIRE :
   • Inputs assez grands (min 44px de hauteur)
   • Labels au-dessus des inputs (pas à côté)
   • Type d'input approprié (email, tel, number...)
   • Autocomplete activé
   • Messages d'erreur clairs et visibles
   • Bouton submit toujours visible

❌ ÉVITER :
   • Inputs trop petits
   • Placeholders comme labels
   • Clavier qui cache le bouton submit
   • Validation uniquement au submit
```

### Composant Input Mobile-Friendly

```tsx
// components/ui/Input.tsx

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s/g, '-');

    return (
      <div className="w-full">
        {/* Label */}
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        {/* Input */}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            // Base
            'w-full rounded-lg border bg-white dark:bg-gray-900',
            'text-base', // 16px minimum pour éviter le zoom iOS
            // Taille tactile
            'h-12 px-4', // 48px de hauteur
            // États
            'border-gray-300 dark:border-gray-700',
            'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            // Erreur
            error && 'border-red-500 focus:ring-red-500',
            className
          )}
          {...props}
        />

        {/* Hint ou Erreur */}
        {(error || hint) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error ? 'text-red-600' : 'text-gray-500'
            )}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
```

### Formulaire Responsive

```tsx
// components/forms/ResponsiveForm.tsx

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const schema = z.object({
  name: z.string().min(2, 'Nom requis'),
  email: z.string().email('Email invalide'),
  phone: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function ResponsiveForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // ...
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 sm:space-y-6"
    >
      {/* Champs en stack sur mobile, grid sur desktop */}
      <div className="space-y-4 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0">
        <Input
          label="Nom complet"
          type="text"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          error={errors.email?.message}
          {...register('email')}
        />
      </div>

      <Input
        label="Téléphone"
        type="tel"
        autoComplete="tel"
        inputMode="tel"
        error={errors.phone?.message}
        {...register('phone')}
      />

      {/* Bouton submit - full width sur mobile */}
      <div className="pt-4">
        <Button
          type="submit"
          loading={isSubmitting}
          className="w-full sm:w-auto"
        >
          Envoyer
        </Button>
      </div>
    </form>
  );
}
```

---

## Performance Mobile

### Images Responsive

```tsx
// components/ui/ResponsiveImage.tsx

import Image from 'next/image';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
  aspectRatio?: '1:1' | '4:3' | '16:9' | '21:9';
}

const aspectRatioClasses = {
  '1:1': 'aspect-square',
  '4:3': 'aspect-[4/3]',
  '16:9': 'aspect-video',
  '21:9': 'aspect-[21/9]',
};

export function ResponsiveImage({
  src,
  alt,
  priority = false,
  className,
  aspectRatio = '16:9',
}: ResponsiveImageProps) {
  return (
    <div className={`relative overflow-hidden ${aspectRatioClasses[aspectRatio]} ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />
    </div>
  );
}
```

### Lazy Loading des Composants

```tsx
// Lazy loading pour les composants lourds

import dynamic from 'next/dynamic';

// Charger uniquement sur desktop
const DesktopChart = dynamic(
  () => import('@/components/charts/DesktopChart'),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

// Charger uniquement quand visible
const HeavyComponent = dynamic(
  () => import('@/components/HeavyComponent'),
  {
    loading: () => <Skeleton />,
  }
);
```

### Optimisation du Bundle Mobile

```javascript
// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimisations images
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
  },

  // Compression
  compress: true,

  // Optimisation des packages
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
    ],
  },
};

module.exports = nextConfig;
```

---

## Touch et Gestes

### Hook pour Gestes Tactiles

```tsx
// lib/hooks/useSwipe.ts

'use client';

import { useState, useRef, TouchEvent } from 'react';

interface SwipeConfig {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Distance minimale en pixels
}

export function useSwipe(config: SwipeConfig) {
  const { threshold = 50 } = config;
  const startX = useRef(0);
  const startY = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;

    const diffX = endX - startX.current;
    const diffY = endY - startY.current;

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    // Mouvement horizontal dominant
    if (absX > absY && absX > threshold) {
      if (diffX > 0) {
        config.onSwipeRight?.();
      } else {
        config.onSwipeLeft?.();
      }
    }
    // Mouvement vertical dominant
    else if (absY > absX && absY > threshold) {
      if (diffY > 0) {
        config.onSwipeDown?.();
      } else {
        config.onSwipeUp?.();
      }
    }
  };

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd,
  };
}
```

### Composant Swipeable

```tsx
// components/ui/SwipeableCard.tsx

'use client';

import { useState } from 'react';
import { useSwipe } from '@/lib/hooks/useSwipe';
import { cn } from '@/lib/utils';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
}: SwipeableCardProps) {
  const [offset, setOffset] = useState(0);

  const swipeHandlers = useSwipe({
    onSwipeLeft: () => {
      setOffset(-100);
      onSwipeLeft?.();
      setTimeout(() => setOffset(0), 300);
    },
    onSwipeRight: () => {
      setOffset(100);
      onSwipeRight?.();
      setTimeout(() => setOffset(0), 300);
    },
  });

  return (
    <div className="relative overflow-hidden">
      {/* Actions en arrière-plan */}
      <div className="absolute inset-0 flex">
        <div className="flex-1 bg-green-500 flex items-center justify-start px-4">
          {leftAction}
        </div>
        <div className="flex-1 bg-red-500 flex items-center justify-end px-4">
          {rightAction}
        </div>
      </div>

      {/* Contenu swipeable */}
      <div
        {...swipeHandlers}
        className={cn(
          'relative bg-white dark:bg-gray-900',
          'transition-transform duration-300 ease-out'
        )}
        style={{ transform: `translateX(${offset}px)` }}
      >
        {children}
      </div>
    </div>
  );
}
```

---

## Tests et Validation

### Checklist Mobile-First

```markdown
## Checklist de Validation Mobile-First

### Design
- [ ] Maquettes mobile créées EN PREMIER
- [ ] Touch targets >= 44px
- [ ] Texte lisible (min 16px)
- [ ] Contraste suffisant
- [ ] Pas de hover-only interactions

### CSS
- [ ] Media queries en min-width (mobile-first)
- [ ] Pas de largeurs fixes en pixels
- [ ] Flexbox/Grid pour les layouts
- [ ] Safe areas gérées (iOS)

### Performance
- [ ] Images optimisées et responsive
- [ ] Lazy loading implémenté
- [ ] Bundle < 200KB (gzipped)
- [ ] LCP < 2.5s sur 3G

### UX
- [ ] Navigation accessible au pouce
- [ ] Formulaires adaptés au mobile
- [ ] Feedback tactile (états actifs)
- [ ] Orientation portrait ET paysage

### Tests
- [ ] Testé sur vrais appareils
- [ ] Testé sur différentes tailles
- [ ] Testé hors-ligne (PWA)
- [ ] Testé avec clavier virtuel
```

### Script de Test Responsive

```typescript
// scripts/test-responsive.ts

import puppeteer from 'puppeteer';

const VIEWPORTS = [
  { name: 'iPhone SE', width: 375, height: 667 },
  { name: 'iPhone 14', width: 390, height: 844 },
  { name: 'iPhone 14 Pro Max', width: 430, height: 932 },
  { name: 'iPad Mini', width: 768, height: 1024 },
  { name: 'iPad Pro', width: 1024, height: 1366 },
  { name: 'Desktop', width: 1920, height: 1080 },
];

async function testResponsive(url: string) {
  const browser = await puppeteer.launch();

  for (const viewport of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({
      width: viewport.width,
      height: viewport.height,
      deviceScaleFactor: 2,
      isMobile: viewport.width < 768,
      hasTouch: viewport.width < 1024,
    });

    await page.goto(url, { waitUntil: 'networkidle2' });

    // Screenshot
    await page.screenshot({
      path: `./screenshots/${viewport.name.replace(' ', '-')}.png`,
      fullPage: true,
    });

    // Vérifications
    const issues = await page.evaluate(() => {
      const issues: string[] = [];

      // Vérifier les éléments qui débordent
      const elements = document.querySelectorAll('*');
      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
          issues.push(`Overflow: ${el.tagName}.${el.className}`);
        }
      });

      // Vérifier les touch targets trop petits
      const clickables = document.querySelectorAll('a, button, input, select');
      clickables.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.width < 44 || rect.height < 44) {
          issues.push(`Small touch target: ${el.tagName}.${el.className}`);
        }
      });

      return issues;
    });

    if (issues.length > 0) {
      console.log(`\n⚠️ Issues on ${viewport.name}:`);
      issues.forEach((issue) => console.log(`  - ${issue}`));
    } else {
      console.log(`✅ ${viewport.name}: OK`);
    }

    await page.close();
  }

  await browser.close();
}

// Exécuter
testResponsive('http://localhost:3000');
```

---

## Résumé

### Règles Obligatoires

```
1. TOUJOURS commencer par le mobile
2. Media queries en min-width uniquement
3. Touch targets >= 44px
4. Font-size >= 16px sur les inputs
5. Navigation accessible au pouce
6. Performance optimisée pour 3G/4G
7. PWA activée par défaut
```

### Structure Recommandée

```
components/
├── ui/                    # Composants UI de base
│   ├── Container.tsx
│   ├── Grid.tsx
│   ├── Stack.tsx
│   ├── Input.tsx
│   └── Responsive.tsx
├── layout/                # Layouts
│   ├── ResponsiveLayout.tsx
│   ├── MobileHeader.tsx
│   ├── BottomNav.tsx
│   ├── DesktopSidebar.tsx
│   └── DesktopHeader.tsx
└── ...

lib/
├── hooks/
│   ├── useBreakpoint.ts
│   ├── useOrientation.ts
│   └── useSwipe.ts
└── config/
    └── breakpoints.ts
```

---

**Dernière mise à jour** : 2024
