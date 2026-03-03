# Internationalisation (i18n) et Multi-Currency

> Guide complet pour les applications multilingues et multi-devises

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture i18n](#architecture-i18n)
3. [Configuration Next.js](#configuration-nextjs)
4. [Gestion des Traductions](#gestion-des-traductions)
5. [Formatage des Données](#formatage-des-données)
6. [Multi-Currency](#multi-currency)
7. [RTL Support](#rtl-support)
8. [SEO International](#seo-international)
9. [Testing i18n](#testing-i18n)
10. [Best Practices Enterprise](#best-practices-enterprise)

---

## 1. Vue d'Ensemble

### Pourquoi l'Internationalisation ?

| Aspect | Impact |
|--------|--------|
| **Marché** | Accès à 7.9 milliards d'utilisateurs potentiels |
| **Revenus** | +40% de revenus avec contenu localisé |
| **SEO** | Meilleur référencement par région |
| **UX** | Expérience native pour chaque utilisateur |
| **Conformité** | Respect des réglementations locales (RGPD, CCPA) |

### Concepts Clés

```
┌─────────────────────────────────────────────────────────────────────┐
│                    INTERNATIONALISATION (i18n)                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐  │
│  │   Localisation   │  │    Formatting    │  │     Content      │  │
│  │      (L10n)      │  │                  │  │                  │  │
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤  │
│  │ - Traductions    │  │ - Dates/Heures   │  │ - Textes UI      │  │
│  │ - Culture locale │  │ - Nombres        │  │ - Emails         │  │
│  │ - Conventions    │  │ - Devises        │  │ - Documentation  │  │
│  │ - Fuseaux        │  │ - Unités         │  │ - Légal          │  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    LOCALE IDENTIFIER                          │   │
│  │                                                                │   │
│  │   fr-FR = French (France)      zh-Hans-CN = Simplified Chinese│   │
│  │   en-US = English (US)         ar-SA = Arabic (Saudi Arabia)  │   │
│  │   pt-BR = Portuguese (Brazil)  ja-JP = Japanese (Japan)       │   │
│  │                                                                │   │
│  │   Format: language[-script][-region]                          │   │
│  │                                                                │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture i18n

### 2.1 Structure des Fichiers

```
src/
├── i18n/
│   ├── config.ts              # Configuration i18n
│   ├── client.ts              # Client i18n
│   ├── server.ts              # Server i18n (RSC)
│   ├── middleware.ts          # Locale detection
│   ├── locales/
│   │   ├── en/
│   │   │   ├── common.json    # Traductions communes
│   │   │   ├── auth.json      # Authentification
│   │   │   ├── dashboard.json # Dashboard
│   │   │   ├── errors.json    # Messages d'erreur
│   │   │   └── validation.json # Validation
│   │   ├── fr/
│   │   │   ├── common.json
│   │   │   ├── auth.json
│   │   │   └── ...
│   │   ├── ar/
│   │   │   └── ...
│   │   └── zh-Hans/
│   │       └── ...
│   ├── formatters/
│   │   ├── date.ts            # Formatage dates
│   │   ├── number.ts          # Formatage nombres
│   │   ├── currency.ts        # Formatage devises
│   │   └── relative-time.ts   # Temps relatif
│   └── types/
│       └── index.ts           # Types TypeScript
├── lib/
│   └── currency/
│       ├── config.ts          # Configuration devises
│       ├── converter.ts       # Conversion
│       ├── rates.ts           # Taux de change
│       └── format.ts          # Formatage
└── hooks/
    ├── useTranslation.ts      # Hook traduction
    ├── useLocale.ts           # Hook locale
    ├── useCurrency.ts         # Hook devise
    └── useFormatter.ts        # Hook formatage
```

### 2.2 Configuration de Base

```typescript
// i18n/config.ts
export const i18nConfig = {
  // Locales supportées
  locales: ['en', 'fr', 'es', 'de', 'ar', 'zh-Hans', 'ja', 'pt-BR'] as const,

  // Locale par défaut
  defaultLocale: 'en' as const,

  // Locale fallback
  fallbackLocale: 'en' as const,

  // Namespaces
  namespaces: ['common', 'auth', 'dashboard', 'errors', 'validation'] as const,

  // Namespace par défaut
  defaultNamespace: 'common' as const,

  // Options
  options: {
    // Lazy loading des traductions
    load: 'languageOnly' as const,

    // Debugging en développement
    debug: process.env.NODE_ENV === 'development',

    // Interpolation
    interpolation: {
      escapeValue: false, // React échappe déjà
    },

    // React options
    react: {
      useSuspense: true,
      bindI18n: 'languageChanged loaded',
    },
  },
};

// Types dérivés
export type Locale = (typeof i18nConfig.locales)[number];
export type Namespace = (typeof i18nConfig.namespaces)[number];

// Métadonnées des locales
export const localeMetadata: Record<
  Locale,
  {
    name: string;
    nativeName: string;
    dir: 'ltr' | 'rtl';
    dateFormat: string;
    currency: string;
    flag: string;
  }
> = {
  en: {
    name: 'English',
    nativeName: 'English',
    dir: 'ltr',
    dateFormat: 'MM/DD/YYYY',
    currency: 'USD',
    flag: '🇺🇸',
  },
  fr: {
    name: 'French',
    nativeName: 'Français',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    flag: '🇫🇷',
  },
  es: {
    name: 'Spanish',
    nativeName: 'Español',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    currency: 'EUR',
    flag: '🇪🇸',
  },
  de: {
    name: 'German',
    nativeName: 'Deutsch',
    dir: 'ltr',
    dateFormat: 'DD.MM.YYYY',
    currency: 'EUR',
    flag: '🇩🇪',
  },
  ar: {
    name: 'Arabic',
    nativeName: 'العربية',
    dir: 'rtl',
    dateFormat: 'DD/MM/YYYY',
    currency: 'SAR',
    flag: '🇸🇦',
  },
  'zh-Hans': {
    name: 'Chinese (Simplified)',
    nativeName: '简体中文',
    dir: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    currency: 'CNY',
    flag: '🇨🇳',
  },
  ja: {
    name: 'Japanese',
    nativeName: '日本語',
    dir: 'ltr',
    dateFormat: 'YYYY/MM/DD',
    currency: 'JPY',
    flag: '🇯🇵',
  },
  'pt-BR': {
    name: 'Portuguese (Brazil)',
    nativeName: 'Português (Brasil)',
    dir: 'ltr',
    dateFormat: 'DD/MM/YYYY',
    currency: 'BRL',
    flag: '🇧🇷',
  },
};
```

---

## 3. Configuration Next.js

### 3.1 next.config.js

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Internationalisation
  i18n: {
    locales: ['en', 'fr', 'es', 'de', 'ar', 'zh-Hans', 'ja', 'pt-BR'],
    defaultLocale: 'en',
    localeDetection: true,
  },

  // Rewrites pour les sous-domaines (optionnel)
  async rewrites() {
    return {
      beforeFiles: [
        // Sous-domaines par langue
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'fr.example.com' }],
          destination: '/fr/:path*',
        },
        {
          source: '/:path*',
          has: [{ type: 'host', value: 'de.example.com' }],
          destination: '/de/:path*',
        },
      ],
    };
  },

  // Headers pour le cache i18n
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Vary',
            value: 'Accept-Language',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

### 3.2 Middleware de Détection de Locale

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import Negotiator from 'negotiator';
import { match } from '@formatjs/intl-localematcher';
import { i18nConfig, Locale } from '@/i18n/config';

// Matcher pour le middleware
export const config = {
  matcher: [
    // Skip les fichiers statiques et API
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',
  ],
};

function getLocale(request: NextRequest): Locale {
  // 1. Vérifier le cookie de préférence
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
  if (cookieLocale && i18nConfig.locales.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale;
  }

  // 2. Vérifier le header Accept-Language
  const negotiator = new Negotiator({
    headers: { 'accept-language': request.headers.get('accept-language') || '' },
  });
  const languages = negotiator.languages();

  try {
    return match(languages, i18nConfig.locales, i18nConfig.defaultLocale) as Locale;
  } catch {
    return i18nConfig.defaultLocale;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si le pathname contient déjà une locale
  const pathnameHasLocale = i18nConfig.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  if (pathnameHasLocale) {
    return NextResponse.next();
  }

  // Rediriger vers la locale appropriée
  const locale = getLocale(request);
  const newUrl = new URL(`/${locale}${pathname}`, request.url);

  // Préserver les query params
  newUrl.search = request.nextUrl.search;

  return NextResponse.redirect(newUrl);
}
```

### 3.3 Provider i18n

```typescript
// i18n/client.ts
'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import HttpBackend from 'i18next-http-backend';
import { i18nConfig } from './config';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    ...i18nConfig.options,
    fallbackLng: i18nConfig.fallbackLocale,
    supportedLngs: i18nConfig.locales,
    ns: i18nConfig.namespaces,
    defaultNS: i18nConfig.defaultNamespace,
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    detection: {
      order: ['cookie', 'navigator', 'htmlTag'],
      caches: ['cookie'],
      cookieMinutes: 60 * 24 * 365, // 1 an
    },
  });

export default i18n;
```

```typescript
// i18n/provider.tsx
'use client';

import { ReactNode, useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './client';
import { Locale } from './config';

interface I18nProviderProps {
  children: ReactNode;
  locale: Locale;
}

export function I18nProvider({ children, locale }: I18nProviderProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    i18n.changeLanguage(locale).then(() => setIsReady(true));
  }, [locale]);

  if (!isReady) {
    return null; // ou un loader
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
```

---

## 4. Gestion des Traductions

### 4.1 Structure des Fichiers de Traduction

```json
// locales/en/common.json
{
  "app": {
    "name": "Saloon Management",
    "tagline": "Professional Salon Management"
  },
  "navigation": {
    "home": "Home",
    "dashboard": "Dashboard",
    "appointments": "Appointments",
    "clients": "Clients",
    "services": "Services",
    "settings": "Settings"
  },
  "actions": {
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "create": "Create",
    "search": "Search",
    "filter": "Filter",
    "export": "Export",
    "import": "Import"
  },
  "status": {
    "loading": "Loading...",
    "saving": "Saving...",
    "success": "Success!",
    "error": "An error occurred"
  },
  "pagination": {
    "previous": "Previous",
    "next": "Next",
    "page": "Page {{current}} of {{total}}",
    "showing": "Showing {{from}}-{{to}} of {{count}} results"
  },
  "time": {
    "today": "Today",
    "yesterday": "Yesterday",
    "tomorrow": "Tomorrow",
    "thisWeek": "This week",
    "thisMonth": "This month"
  }
}
```

```json
// locales/fr/common.json
{
  "app": {
    "name": "Saloon Management",
    "tagline": "Gestion Professionnelle de Salon"
  },
  "navigation": {
    "home": "Accueil",
    "dashboard": "Tableau de bord",
    "appointments": "Rendez-vous",
    "clients": "Clients",
    "services": "Services",
    "settings": "Paramètres"
  },
  "actions": {
    "save": "Enregistrer",
    "cancel": "Annuler",
    "delete": "Supprimer",
    "edit": "Modifier",
    "create": "Créer",
    "search": "Rechercher",
    "filter": "Filtrer",
    "export": "Exporter",
    "import": "Importer"
  },
  "status": {
    "loading": "Chargement...",
    "saving": "Enregistrement...",
    "success": "Succès !",
    "error": "Une erreur est survenue"
  },
  "pagination": {
    "previous": "Précédent",
    "next": "Suivant",
    "page": "Page {{current}} sur {{total}}",
    "showing": "Affichage de {{from}}-{{to}} sur {{count}} résultats"
  },
  "time": {
    "today": "Aujourd'hui",
    "yesterday": "Hier",
    "tomorrow": "Demain",
    "thisWeek": "Cette semaine",
    "thisMonth": "Ce mois"
  }
}
```

### 4.2 Traductions avec Pluralisation

```json
// locales/en/dashboard.json
{
  "appointments": {
    "title": "Appointments",
    "count_zero": "No appointments",
    "count_one": "{{count}} appointment",
    "count_other": "{{count}} appointments",
    "upcoming": "You have {{count}} upcoming appointment",
    "upcoming_plural": "You have {{count}} upcoming appointments"
  },
  "clients": {
    "title": "Clients",
    "count_zero": "No clients yet",
    "count_one": "{{count}} client",
    "count_other": "{{count}} clients",
    "newThisMonth": "{{count}} new client this month",
    "newThisMonth_plural": "{{count}} new clients this month"
  },
  "revenue": {
    "title": "Revenue",
    "today": "Today's revenue",
    "thisWeek": "This week",
    "thisMonth": "This month",
    "growth": "{{percent}}% growth compared to last month"
  }
}
```

```json
// locales/fr/dashboard.json
{
  "appointments": {
    "title": "Rendez-vous",
    "count_zero": "Aucun rendez-vous",
    "count_one": "{{count}} rendez-vous",
    "count_other": "{{count}} rendez-vous",
    "upcoming": "Vous avez {{count}} rendez-vous à venir",
    "upcoming_plural": "Vous avez {{count}} rendez-vous à venir"
  },
  "clients": {
    "title": "Clients",
    "count_zero": "Aucun client",
    "count_one": "{{count}} client",
    "count_other": "{{count}} clients",
    "newThisMonth": "{{count}} nouveau client ce mois",
    "newThisMonth_plural": "{{count}} nouveaux clients ce mois"
  },
  "revenue": {
    "title": "Chiffre d'affaires",
    "today": "Chiffre du jour",
    "thisWeek": "Cette semaine",
    "thisMonth": "Ce mois",
    "growth": "{{percent}}% de croissance par rapport au mois dernier"
  }
}
```

### 4.3 Hook useTranslation Typé

```typescript
// hooks/useTranslation.ts
'use client';

import { useTranslation as useI18nTranslation } from 'react-i18next';
import { Namespace } from '@/i18n/config';

// Types pour les traductions
type TranslationKeys = {
  common: keyof typeof import('@/i18n/locales/en/common.json');
  auth: keyof typeof import('@/i18n/locales/en/auth.json');
  dashboard: keyof typeof import('@/i18n/locales/en/dashboard.json');
  errors: keyof typeof import('@/i18n/locales/en/errors.json');
  validation: keyof typeof import('@/i18n/locales/en/validation.json');
};

export function useTranslation<NS extends Namespace>(namespace?: NS | NS[]) {
  const { t, i18n, ready } = useI18nTranslation(namespace);

  return {
    t: t as (key: string, options?: Record<string, any>) => string,
    i18n,
    ready,
    locale: i18n.language,
    changeLocale: (locale: string) => i18n.changeLanguage(locale),
  };
}

// Hook simplifié pour un namespace unique
export function useT<NS extends Namespace = 'common'>(namespace?: NS) {
  const { t } = useTranslation(namespace);
  return t;
}
```

### 4.4 Composant de Traduction

```tsx
// components/i18n/Trans.tsx
'use client';

import { Trans as I18nTrans, TransProps } from 'react-i18next';

interface TypedTransProps extends Omit<TransProps<string>, 'i18nKey'> {
  i18nKey: string;
  components?: Record<string, React.ReactElement>;
  values?: Record<string, any>;
}

export function Trans({ i18nKey, components, values, ...props }: TypedTransProps) {
  return (
    <I18nTrans
      i18nKey={i18nKey}
      components={components}
      values={values}
      {...props}
    />
  );
}

// Usage:
// <Trans
//   i18nKey="welcome.message"
//   components={{ bold: <strong />, link: <a href="/help" /> }}
//   values={{ name: user.name }}
// />
// welcome.message = "Hello <bold>{{name}}</bold>, <link>need help?</link>"
```

---

## 5. Formatage des Données

### 5.1 Formatage des Dates

```typescript
// i18n/formatters/date.ts
import { format, formatRelative, formatDistance, Locale as DateFnsLocale } from 'date-fns';
import { enUS, fr, es, de, ar, zhCN, ja, ptBR } from 'date-fns/locale';
import { Locale } from '../config';

// Mapping des locales date-fns
const dateLocales: Record<Locale, DateFnsLocale> = {
  en: enUS,
  fr: fr,
  es: es,
  de: de,
  ar: ar,
  'zh-Hans': zhCN,
  ja: ja,
  'pt-BR': ptBR,
};

export class DateFormatter {
  private locale: DateFnsLocale;
  private intlFormatter: Intl.DateTimeFormat;

  constructor(locale: Locale) {
    this.locale = dateLocales[locale] || enUS;
    this.intlFormatter = new Intl.DateTimeFormat(locale);
  }

  // Format court: 12/31/2024
  short(date: Date | string | number): string {
    const d = new Date(date);
    return this.intlFormatter.format(d);
  }

  // Format long: December 31, 2024
  long(date: Date | string | number): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat(this.locale.code, {
      dateStyle: 'long',
    }).format(d);
  }

  // Format complet: Tuesday, December 31, 2024
  full(date: Date | string | number): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat(this.locale.code, {
      dateStyle: 'full',
    }).format(d);
  }

  // Format avec heure: 12/31/2024, 2:30 PM
  withTime(date: Date | string | number): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat(this.locale.code, {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(d);
  }

  // Heure seule: 2:30 PM
  time(date: Date | string | number): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat(this.locale.code, {
      timeStyle: 'short',
    }).format(d);
  }

  // Format relatif: "2 days ago", "in 3 hours"
  relative(date: Date | string | number): string {
    const d = new Date(date);
    return formatRelative(d, new Date(), { locale: this.locale });
  }

  // Distance: "about 2 hours"
  distance(date: Date | string | number, options?: { addSuffix?: boolean }): string {
    const d = new Date(date);
    return formatDistance(d, new Date(), {
      locale: this.locale,
      addSuffix: options?.addSuffix ?? true,
    });
  }

  // Format personnalisé avec date-fns
  custom(date: Date | string | number, formatStr: string): string {
    const d = new Date(date);
    return format(d, formatStr, { locale: this.locale });
  }
}
```

### 5.2 Formatage des Nombres

```typescript
// i18n/formatters/number.ts
import { Locale } from '../config';

export class NumberFormatter {
  private locale: string;

  constructor(locale: Locale) {
    this.locale = locale;
  }

  // Nombre standard: 1,234.56
  standard(value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.locale, options).format(value);
  }

  // Entier: 1,234
  integer(value: number): string {
    return new Intl.NumberFormat(this.locale, {
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Décimal avec précision: 1,234.56
  decimal(value: number, precision: number = 2): string {
    return new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(value);
  }

  // Pourcentage: 12.5%
  percent(value: number, precision: number = 1): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'percent',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(value / 100);
  }

  // Compact: 1.2K, 3.4M
  compact(value: number): string {
    return new Intl.NumberFormat(this.locale, {
      notation: 'compact',
      compactDisplay: 'short',
    }).format(value);
  }

  // Ordinal: 1st, 2nd, 3rd (EN only, needs polyfill for others)
  ordinal(value: number): string {
    const pr = new Intl.PluralRules(this.locale, { type: 'ordinal' });
    const suffixes: Record<string, string> = {
      one: 'st',
      two: 'nd',
      few: 'rd',
      other: 'th',
    };
    const rule = pr.select(value);
    return `${value}${suffixes[rule] || suffixes.other}`;
  }

  // Unité: 5 kg, 100 km
  unit(value: number, unit: Intl.NumberFormatOptions['unit']): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'unit',
      unit,
      unitDisplay: 'short',
    }).format(value);
  }

  // Plage: 10-20
  range(start: number, end: number): string {
    return new Intl.NumberFormat(this.locale).formatRange(start, end);
  }
}
```

### 5.3 Hook de Formatage

```typescript
// hooks/useFormatter.ts
'use client';

import { useMemo } from 'react';
import { useTranslation } from './useTranslation';
import { DateFormatter } from '@/i18n/formatters/date';
import { NumberFormatter } from '@/i18n/formatters/number';
import { CurrencyFormatter } from '@/i18n/formatters/currency';
import { Locale } from '@/i18n/config';

export function useFormatter() {
  const { locale } = useTranslation();

  const formatters = useMemo(() => ({
    date: new DateFormatter(locale as Locale),
    number: new NumberFormatter(locale as Locale),
    currency: new CurrencyFormatter(locale as Locale),
  }), [locale]);

  return formatters;
}

// Usage simplifié
export function useFormatDate() {
  const { date } = useFormatter();
  return date;
}

export function useFormatNumber() {
  const { number } = useFormatter();
  return number;
}

export function useFormatCurrency() {
  const { currency } = useFormatter();
  return currency;
}
```

---

## 6. Multi-Currency

### 6.1 Configuration des Devises

```typescript
// lib/currency/config.ts
export interface CurrencyConfig {
  code: string;           // ISO 4217
  name: string;
  symbol: string;
  symbolPosition: 'before' | 'after';
  decimalSeparator: string;
  thousandsSeparator: string;
  decimalPlaces: number;
  subunit: string;
  subunitToUnit: number;
}

export const currencies: Record<string, CurrencyConfig> = {
  USD: {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
    subunit: 'cent',
    subunitToUnit: 100,
  },
  EUR: {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    symbolPosition: 'after',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    decimalPlaces: 2,
    subunit: 'cent',
    subunitToUnit: 100,
  },
  GBP: {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
    subunit: 'penny',
    subunitToUnit: 100,
  },
  JPY: {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 0,
    subunit: 'sen',
    subunitToUnit: 1,
  },
  CNY: {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    symbolPosition: 'before',
    decimalSeparator: '.',
    thousandsSeparator: ',',
    decimalPlaces: 2,
    subunit: 'fen',
    subunitToUnit: 100,
  },
  XOF: {
    code: 'XOF',
    name: 'CFA Franc BCEAO',
    symbol: 'CFA',
    symbolPosition: 'after',
    decimalSeparator: ',',
    thousandsSeparator: ' ',
    decimalPlaces: 0,
    subunit: 'centime',
    subunitToUnit: 1,
  },
  BRL: {
    code: 'BRL',
    name: 'Brazilian Real',
    symbol: 'R$',
    symbolPosition: 'before',
    decimalSeparator: ',',
    thousandsSeparator: '.',
    decimalPlaces: 2,
    subunit: 'centavo',
    subunitToUnit: 100,
  },
};

// Devise par défaut de l'application
export const defaultCurrency = 'EUR';

// Devises supportées
export const supportedCurrencies = Object.keys(currencies);
```

### 6.2 Formatage des Devises

```typescript
// i18n/formatters/currency.ts
import { Locale } from '../config';
import { currencies, CurrencyConfig } from '@/lib/currency/config';

export class CurrencyFormatter {
  private locale: string;

  constructor(locale: Locale) {
    this.locale = locale;
  }

  // Format standard avec Intl
  format(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }

  // Format court sans symbole de devise
  formatShort(amount: number, currency: string = 'EUR'): string {
    const config = currencies[currency];
    if (!config) {
      return new Intl.NumberFormat(this.locale).format(amount);
    }

    return new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    }).format(amount);
  }

  // Format avec symbole personnalisé
  formatWithSymbol(amount: number, currency: string = 'EUR'): string {
    const config = currencies[currency];
    if (!config) {
      return this.format(amount, currency);
    }

    const formattedNumber = new Intl.NumberFormat(this.locale, {
      minimumFractionDigits: config.decimalPlaces,
      maximumFractionDigits: config.decimalPlaces,
    }).format(amount);

    return config.symbolPosition === 'before'
      ? `${config.symbol}${formattedNumber}`
      : `${formattedNumber} ${config.symbol}`;
  }

  // Format compact: $1.2K
  formatCompact(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency,
      notation: 'compact',
      compactDisplay: 'short',
    }).format(amount);
  }

  // Parser une chaîne en montant
  parse(value: string, currency: string = 'EUR'): number {
    const config = currencies[currency];
    if (!config) {
      return parseFloat(value.replace(/[^\d.-]/g, ''));
    }

    // Nettoyer la chaîne
    let cleaned = value
      .replace(new RegExp(`\\${config.symbol}`, 'g'), '')
      .replace(new RegExp(`\\${config.thousandsSeparator}`, 'g'), '')
      .replace(config.decimalSeparator, '.')
      .trim();

    return parseFloat(cleaned);
  }

  // Obtenir les informations de devise
  getCurrencyInfo(currency: string): CurrencyConfig | undefined {
    return currencies[currency];
  }
}
```

### 6.3 Service de Conversion

```typescript
// lib/currency/converter.ts
import { currencies } from './config';

interface ExchangeRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

class CurrencyConverter {
  private rates: ExchangeRates | null = null;
  private cacheKey = 'exchange_rates';
  private cacheDuration = 1000 * 60 * 60; // 1 heure

  // Charger les taux depuis l'API
  async loadRates(baseCurrency: string = 'EUR'): Promise<ExchangeRates> {
    // Vérifier le cache
    const cached = this.getCachedRates();
    if (cached && cached.base === baseCurrency) {
      this.rates = cached;
      return cached;
    }

    try {
      // API gratuite: exchangerate-api, open exchange rates, etc.
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates');
      }

      const data = await response.json();
      this.rates = {
        base: baseCurrency,
        rates: data.rates,
        timestamp: Date.now(),
      };

      // Mettre en cache
      this.setCachedRates(this.rates);

      return this.rates;
    } catch (error) {
      console.error('Error loading exchange rates:', error);
      // Utiliser des taux de fallback
      return this.getFallbackRates(baseCurrency);
    }
  }

  // Convertir un montant
  convert(amount: number, from: string, to: string): number {
    if (!this.rates) {
      throw new Error('Exchange rates not loaded. Call loadRates() first.');
    }

    if (from === to) {
      return amount;
    }

    // Convertir vers la devise de base puis vers la cible
    const fromRate = this.rates.rates[from] || 1;
    const toRate = this.rates.rates[to] || 1;

    // Si la devise de base est différente
    if (this.rates.base !== from) {
      const baseAmount = amount / fromRate;
      return baseAmount * toRate;
    }

    return amount * toRate;
  }

  // Obtenir le taux de change
  getRate(from: string, to: string): number {
    if (!this.rates) {
      throw new Error('Exchange rates not loaded');
    }

    const fromRate = this.rates.rates[from] || 1;
    const toRate = this.rates.rates[to] || 1;

    return toRate / fromRate;
  }

  // Cache localStorage
  private getCachedRates(): ExchangeRates | null {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem(this.cacheKey);
      if (!cached) return null;

      const data = JSON.parse(cached) as ExchangeRates;

      // Vérifier l'expiration
      if (Date.now() - data.timestamp > this.cacheDuration) {
        localStorage.removeItem(this.cacheKey);
        return null;
      }

      return data;
    } catch {
      return null;
    }
  }

  private setCachedRates(rates: ExchangeRates): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.cacheKey, JSON.stringify(rates));
  }

  // Taux de fallback
  private getFallbackRates(base: string): ExchangeRates {
    const fallbackRates: Record<string, number> = {
      EUR: 1,
      USD: 1.08,
      GBP: 0.86,
      JPY: 162.5,
      CNY: 7.82,
      XOF: 655.96,
      BRL: 5.35,
    };

    // Normaliser par rapport à la devise de base
    const baseRate = fallbackRates[base] || 1;
    const rates: Record<string, number> = {};

    for (const [currency, rate] of Object.entries(fallbackRates)) {
      rates[currency] = rate / baseRate;
    }

    return { base, rates, timestamp: Date.now() };
  }
}

export const currencyConverter = new CurrencyConverter();
```

### 6.4 Hook useCurrency

```typescript
// hooks/useCurrency.ts
'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslation } from './useTranslation';
import { CurrencyFormatter } from '@/i18n/formatters/currency';
import { currencyConverter } from '@/lib/currency/converter';
import { currencies, defaultCurrency } from '@/lib/currency/config';
import { Locale } from '@/i18n/config';

interface UseCurrencyOptions {
  defaultCurrency?: string;
  autoLoadRates?: boolean;
}

export function useCurrency(options: UseCurrencyOptions = {}) {
  const { locale } = useTranslation();
  const [currency, setCurrency] = useState(options.defaultCurrency || defaultCurrency);
  const [ratesLoaded, setRatesLoaded] = useState(false);
  const [loading, setLoading] = useState(false);

  const formatter = useMemo(
    () => new CurrencyFormatter(locale as Locale),
    [locale]
  );

  // Charger les taux de change
  useEffect(() => {
    if (options.autoLoadRates !== false) {
      setLoading(true);
      currencyConverter.loadRates(currency)
        .then(() => setRatesLoaded(true))
        .finally(() => setLoading(false));
    }
  }, [currency, options.autoLoadRates]);

  // Formater un montant
  const format = useCallback(
    (amount: number, currencyCode?: string) => {
      return formatter.format(amount, currencyCode || currency);
    },
    [formatter, currency]
  );

  // Formater de manière compacte
  const formatCompact = useCallback(
    (amount: number, currencyCode?: string) => {
      return formatter.formatCompact(amount, currencyCode || currency);
    },
    [formatter, currency]
  );

  // Convertir un montant
  const convert = useCallback(
    (amount: number, from: string, to?: string) => {
      if (!ratesLoaded) {
        console.warn('Exchange rates not loaded yet');
        return amount;
      }
      return currencyConverter.convert(amount, from, to || currency);
    },
    [ratesLoaded, currency]
  );

  // Obtenir le taux de change
  const getRate = useCallback(
    (from: string, to?: string) => {
      if (!ratesLoaded) return 1;
      return currencyConverter.getRate(from, to || currency);
    },
    [ratesLoaded, currency]
  );

  return {
    currency,
    setCurrency,
    format,
    formatCompact,
    convert,
    getRate,
    loading,
    ratesLoaded,
    currencies: Object.keys(currencies),
    currencyInfo: currencies[currency],
  };
}
```

---

## 7. RTL Support

### 7.1 Configuration RTL

```typescript
// i18n/rtl.ts
import { Locale, localeMetadata } from './config';

export function isRTL(locale: Locale): boolean {
  return localeMetadata[locale]?.dir === 'rtl';
}

export function getDirection(locale: Locale): 'ltr' | 'rtl' {
  return localeMetadata[locale]?.dir || 'ltr';
}

// Classes CSS conditionnelles
export function rtlClass(locale: Locale, ltrClass: string, rtlClass: string): string {
  return isRTL(locale) ? rtlClass : ltrClass;
}
```

### 7.2 Layout RTL Automatique

```tsx
// app/[locale]/layout.tsx
import { ReactNode } from 'react';
import { getDirection, isRTL } from '@/i18n/rtl';
import { Locale, localeMetadata } from '@/i18n/config';

interface LayoutProps {
  children: ReactNode;
  params: { locale: Locale };
}

export default function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = params;
  const direction = getDirection(locale);
  const metadata = localeMetadata[locale];

  return (
    <html lang={locale} dir={direction}>
      <head>
        {/* Fonts spécifiques pour les langues */}
        {locale === 'ar' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        )}
        {locale === 'ja' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        )}
        {locale === 'zh-Hans' && (
          <link
            href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600;700&display=swap"
            rel="stylesheet"
          />
        )}
      </head>
      <body className={isRTL(locale) ? 'rtl' : 'ltr'}>
        {children}
      </body>
    </html>
  );
}
```

### 7.3 Tailwind RTL Utilities

```css
/* globals.css */
/* RTL Utilities avec Tailwind */
@layer utilities {
  /* Flip horizontal */
  .rtl\:flip {
    transform: scaleX(-1);
  }

  /* Margin et Padding RTL */
  [dir="rtl"] .rtl\:mr-auto {
    margin-right: auto;
    margin-left: 0;
  }

  [dir="rtl"] .rtl\:ml-auto {
    margin-left: auto;
    margin-right: 0;
  }

  /* Text alignment */
  [dir="rtl"] .rtl\:text-right {
    text-align: right;
  }

  [dir="rtl"] .rtl\:text-left {
    text-align: left;
  }

  /* Flexbox */
  [dir="rtl"] .rtl\:flex-row-reverse {
    flex-direction: row-reverse;
  }

  /* Position */
  [dir="rtl"] .rtl\:left-0 {
    left: 0;
    right: auto;
  }

  [dir="rtl"] .rtl\:right-0 {
    right: 0;
    left: auto;
  }

  /* Border radius */
  [dir="rtl"] .rtl\:rounded-l-lg {
    border-radius: 0 0.5rem 0.5rem 0;
  }

  [dir="rtl"] .rtl\:rounded-r-lg {
    border-radius: 0.5rem 0 0 0.5rem;
  }
}

/* Fonts par langue */
[lang="ar"] {
  font-family: 'Noto Sans Arabic', sans-serif;
}

[lang="ja"] {
  font-family: 'Noto Sans JP', sans-serif;
}

[lang="zh-Hans"] {
  font-family: 'Noto Sans SC', sans-serif;
}
```

### 7.4 Composant RTL-Aware

```tsx
// components/ui/RTLIcon.tsx
'use client';

import { useTranslation } from '@/hooks/useTranslation';
import { isRTL } from '@/i18n/rtl';
import { Locale } from '@/i18n/config';
import { LucideIcon } from 'lucide-react';

interface RTLIconProps {
  icon: LucideIcon;
  flip?: boolean;
  className?: string;
}

export function RTLIcon({ icon: Icon, flip = true, className = '' }: RTLIconProps) {
  const { locale } = useTranslation();
  const shouldFlip = flip && isRTL(locale as Locale);

  return (
    <Icon
      className={`${className} ${shouldFlip ? 'rtl:scale-x-[-1]' : ''}`}
    />
  );
}

// Usage
// <RTLIcon icon={ArrowRight} className="w-4 h-4" />
```

---

## 8. SEO International

### 8.1 Métadonnées Multilingues

```typescript
// app/[locale]/layout.tsx
import { Metadata } from 'next';
import { Locale, i18nConfig, localeMetadata } from '@/i18n/config';

interface GenerateMetadataProps {
  params: { locale: Locale };
}

export async function generateMetadata({ params }: GenerateMetadataProps): Promise<Metadata> {
  const { locale } = params;
  const meta = localeMetadata[locale];

  // Charger les traductions des métadonnées
  const translations = await import(`@/i18n/locales/${locale}/seo.json`);

  return {
    title: {
      default: translations.site.title,
      template: `%s | ${translations.site.name}`,
    },
    description: translations.site.description,
    keywords: translations.site.keywords,

    // Open Graph
    openGraph: {
      title: translations.site.title,
      description: translations.site.description,
      siteName: translations.site.name,
      locale: locale.replace('-', '_'),
      type: 'website',
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: translations.site.title,
      description: translations.site.description,
    },

    // Alternates (hreflang)
    alternates: {
      canonical: `https://example.com/${locale}`,
      languages: Object.fromEntries(
        i18nConfig.locales.map((l) => [l, `https://example.com/${l}`])
      ),
    },

    // Other
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}
```

### 8.2 Sitemap Multilingue

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { i18nConfig, Locale } from '@/i18n/config';

const BASE_URL = 'https://example.com';

// Pages statiques
const staticPages = ['', '/about', '/services', '/contact', '/pricing'];

// Fonction pour générer les alternates
function generateAlternates(path: string): Record<string, string> {
  const alternates: Record<string, string> = {};

  for (const locale of i18nConfig.locales) {
    alternates[locale] = `${BASE_URL}/${locale}${path}`;
  }

  // x-default (fallback)
  alternates['x-default'] = `${BASE_URL}/en${path}`;

  return alternates;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const sitemap: MetadataRoute.Sitemap = [];

  // Pages statiques
  for (const page of staticPages) {
    for (const locale of i18nConfig.locales) {
      sitemap.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: page === '' ? 1.0 : 0.8,
        alternates: {
          languages: generateAlternates(page),
        },
      });
    }
  }

  // Pages dynamiques (blog, produits, etc.)
  // const posts = await getBlogPosts();
  // for (const post of posts) {
  //   for (const locale of i18nConfig.locales) {
  //     sitemap.push({
  //       url: `${BASE_URL}/${locale}/blog/${post.slug}`,
  //       lastModified: post.updatedAt,
  //       changeFrequency: 'monthly',
  //       priority: 0.6,
  //     });
  //   }
  // }

  return sitemap;
}
```

### 8.3 Schema.org Multilingue

```tsx
// components/seo/StructuredData.tsx
import { Locale, localeMetadata } from '@/i18n/config';

interface StructuredDataProps {
  locale: Locale;
  type: 'Organization' | 'LocalBusiness' | 'WebSite' | 'BreadcrumbList';
  data: Record<string, any>;
}

export function StructuredData({ locale, type, data }: StructuredDataProps) {
  const meta = localeMetadata[locale];

  const baseData = {
    '@context': 'https://schema.org',
    '@type': type,
    inLanguage: locale,
    ...data,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(baseData) }}
    />
  );
}

// Exemple d'utilisation
function OrganizationSchema({ locale }: { locale: Locale }) {
  return (
    <StructuredData
      locale={locale}
      type="Organization"
      data={{
        name: 'Saloon Management',
        url: 'https://example.com',
        logo: 'https://example.com/logo.png',
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+1-800-123-4567',
          contactType: 'customer service',
          availableLanguage: ['English', 'French', 'Spanish'],
        },
        sameAs: [
          'https://twitter.com/saloonmgmt',
          'https://facebook.com/saloonmgmt',
          'https://linkedin.com/company/saloonmgmt',
        ],
      }}
    />
  );
}
```

---

## 9. Testing i18n

### 9.1 Tests Unitaires

```typescript
// __tests__/i18n/formatters.test.ts
import { DateFormatter } from '@/i18n/formatters/date';
import { NumberFormatter } from '@/i18n/formatters/number';
import { CurrencyFormatter } from '@/i18n/formatters/currency';

describe('DateFormatter', () => {
  const date = new Date('2024-12-31T14:30:00Z');

  test.each([
    ['en', '12/31/2024'],
    ['fr', '31/12/2024'],
    ['de', '31.12.2024'],
    ['ja', '2024/12/31'],
  ])('formats short date correctly for %s', (locale, expected) => {
    const formatter = new DateFormatter(locale as any);
    expect(formatter.short(date)).toBe(expected);
  });

  test('formats relative time correctly', () => {
    const formatter = new DateFormatter('en');
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatter.relative(yesterday)).toContain('yesterday');
  });
});

describe('NumberFormatter', () => {
  test.each([
    ['en', 1234.56, '1,234.56'],
    ['fr', 1234.56, '1 234,56'],
    ['de', 1234.56, '1.234,56'],
  ])('formats numbers correctly for %s', (locale, number, expected) => {
    const formatter = new NumberFormatter(locale as any);
    expect(formatter.standard(number)).toBe(expected);
  });

  test('formats percentages correctly', () => {
    const formatter = new NumberFormatter('en');
    expect(formatter.percent(25)).toBe('25.0%');
  });
});

describe('CurrencyFormatter', () => {
  test.each([
    ['en', 1234.56, 'USD', '$1,234.56'],
    ['fr', 1234.56, 'EUR', '1 234,56 €'],
    ['de', 1234.56, 'EUR', '1.234,56 €'],
  ])('formats currency correctly for %s', (locale, amount, currency, expected) => {
    const formatter = new CurrencyFormatter(locale as any);
    expect(formatter.format(amount, currency)).toBe(expected);
  });
});
```

### 9.2 Tests de Traduction

```typescript
// __tests__/i18n/translations.test.ts
import fs from 'fs';
import path from 'path';
import { i18nConfig, Locale, Namespace } from '@/i18n/config';

const localesPath = path.join(process.cwd(), 'src/i18n/locales');

describe('Translations', () => {
  const defaultLocale = i18nConfig.defaultLocale;

  // Récupérer toutes les clés de la locale par défaut
  function getKeys(obj: any, prefix = ''): string[] {
    return Object.entries(obj).flatMap(([key, value]) => {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof value === 'object' && value !== null) {
        return getKeys(value, fullKey);
      }
      return [fullKey];
    });
  }

  // Charger les traductions
  function loadTranslations(locale: Locale, namespace: Namespace): Record<string, any> {
    const filePath = path.join(localesPath, locale, `${namespace}.json`);
    if (!fs.existsSync(filePath)) {
      return {};
    }
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  }

  // Tester que toutes les clés existent
  i18nConfig.namespaces.forEach((namespace) => {
    describe(`namespace: ${namespace}`, () => {
      const defaultTranslations = loadTranslations(defaultLocale, namespace);
      const defaultKeys = getKeys(defaultTranslations);

      i18nConfig.locales
        .filter((locale) => locale !== defaultLocale)
        .forEach((locale) => {
          test(`${locale} has all keys from ${defaultLocale}`, () => {
            const translations = loadTranslations(locale, namespace);
            const keys = getKeys(translations);

            const missingKeys = defaultKeys.filter((key) => !keys.includes(key));

            expect(missingKeys).toEqual([]);
          });
        });
    });
  });

  // Tester que les traductions ne sont pas vides
  i18nConfig.locales.forEach((locale) => {
    i18nConfig.namespaces.forEach((namespace) => {
      test(`${locale}/${namespace} has no empty translations`, () => {
        const translations = loadTranslations(locale, namespace);

        function checkEmpty(obj: any, path = ''): string[] {
          return Object.entries(obj).flatMap(([key, value]) => {
            const fullPath = path ? `${path}.${key}` : key;
            if (typeof value === 'object' && value !== null) {
              return checkEmpty(value, fullPath);
            }
            if (value === '' || value === null || value === undefined) {
              return [fullPath];
            }
            return [];
          });
        }

        const emptyKeys = checkEmpty(translations);
        expect(emptyKeys).toEqual([]);
      });
    });
  });
});
```

### 9.3 Tests E2E

```typescript
// e2e/i18n.spec.ts
import { test, expect } from '@playwright/test';

const locales = ['en', 'fr', 'es', 'de'];
const baseUrl = 'http://localhost:3000';

test.describe('Internationalization', () => {
  locales.forEach((locale) => {
    test(`should display correct language for ${locale}`, async ({ page }) => {
      await page.goto(`${baseUrl}/${locale}`);

      // Vérifier l'attribut lang
      const html = page.locator('html');
      await expect(html).toHaveAttribute('lang', locale);

      // Vérifier le contenu traduit (exemple)
      const nav = page.locator('nav');
      if (locale === 'en') {
        await expect(nav).toContainText('Home');
      } else if (locale === 'fr') {
        await expect(nav).toContainText('Accueil');
      }
    });
  });

  test('should switch language correctly', async ({ page }) => {
    await page.goto(`${baseUrl}/en`);

    // Trouver et cliquer sur le sélecteur de langue
    await page.click('[data-testid="language-selector"]');
    await page.click('[data-testid="locale-fr"]');

    // Vérifier la redirection
    await expect(page).toHaveURL(/\/fr/);

    // Vérifier que le contenu est en français
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  });

  test('should persist language preference', async ({ page, context }) => {
    await page.goto(`${baseUrl}/fr`);

    // Vérifier le cookie
    const cookies = await context.cookies();
    const localeCookie = cookies.find((c) => c.name === 'NEXT_LOCALE');
    expect(localeCookie?.value).toBe('fr');

    // Revenir sur la page
    await page.goto(baseUrl);

    // Devrait rediriger vers /fr
    await expect(page).toHaveURL(/\/fr/);
  });

  test('should format dates correctly by locale', async ({ page }) => {
    const testDate = '2024-12-31';

    // Anglais (US)
    await page.goto(`${baseUrl}/en`);
    const enDate = await page.textContent('[data-testid="formatted-date"]');
    expect(enDate).toMatch(/12\/31\/2024|December 31, 2024/);

    // Français
    await page.goto(`${baseUrl}/fr`);
    const frDate = await page.textContent('[data-testid="formatted-date"]');
    expect(frDate).toMatch(/31\/12\/2024|31 décembre 2024/);
  });

  test('should format currency correctly by locale', async ({ page }) => {
    const amount = 1234.56;

    await page.goto(`${baseUrl}/en`);
    const enCurrency = await page.textContent('[data-testid="formatted-currency"]');
    expect(enCurrency).toContain('$');

    await page.goto(`${baseUrl}/fr`);
    const frCurrency = await page.textContent('[data-testid="formatted-currency"]');
    expect(frCurrency).toContain('€');
  });

  test('should support RTL for Arabic', async ({ page }) => {
    await page.goto(`${baseUrl}/ar`);

    const html = page.locator('html');
    await expect(html).toHaveAttribute('dir', 'rtl');
    await expect(html).toHaveAttribute('lang', 'ar');
  });
});
```

---

## 10. Best Practices Enterprise

### 10.1 Workflow de Traduction

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW DE TRADUCTION                            │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐                │
│  │   Dev      │───▶│   Review   │───▶│   Export   │                │
│  │ (en.json)  │    │            │    │            │                │
│  └────────────┘    └────────────┘    └────────────┘                │
│                                             │                        │
│                                             ▼                        │
│                                    ┌────────────────┐               │
│                                    │   Plateforme   │               │
│                                    │   Traduction   │               │
│                                    │ (Lokalise/     │               │
│                                    │  Crowdin/      │               │
│                                    │  Phrase)       │               │
│                                    └───────┬────────┘               │
│                                            │                         │
│                                            ▼                         │
│  ┌────────────┐    ┌────────────┐    ┌────────────┐                │
│  │   Merge    │◀───│   Import   │◀───│ Traducteurs│                │
│  │            │    │            │    │ Natifs     │                │
│  └────────────┘    └────────────┘    └────────────┘                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 10.2 Outils Recommandés

| Catégorie | Outils | Usage |
|-----------|--------|-------|
| **Plateforme** | Lokalise, Phrase, Crowdin | Gestion des traductions |
| **CI/CD** | Lokalise CLI, Crowdin CLI | Synchronisation automatique |
| **Formatage** | Intl API, date-fns | Formatage localisé |
| **Librairies** | i18next, react-i18next | Intégration React |
| **Testing** | Playwright, Jest | Tests i18n |
| **SEO** | Next.js, hreflang-validator | SEO multilingue |

### 10.3 Standards Internationaux

```typescript
// lib/standards/international.ts
export const internationalStandards = {
  // ISO 639-1: Codes de langue
  languageCodes: {
    english: 'en',
    french: 'fr',
    german: 'de',
    spanish: 'es',
    arabic: 'ar',
    chinese: 'zh',
    japanese: 'ja',
    portuguese: 'pt',
  },

  // ISO 3166-1: Codes de pays
  countryCodes: {
    unitedStates: 'US',
    france: 'FR',
    germany: 'DE',
    spain: 'ES',
    saudiArabia: 'SA',
    china: 'CN',
    japan: 'JP',
    brazil: 'BR',
  },

  // ISO 4217: Codes de devise
  currencyCodes: {
    usDollar: 'USD',
    euro: 'EUR',
    britishPound: 'GBP',
    japaneseYen: 'JPY',
    chineseYuan: 'CNY',
    brazilianReal: 'BRL',
  },

  // IETF BCP 47: Tags de langue
  languageTags: {
    'en-US': 'English (United States)',
    'en-GB': 'English (United Kingdom)',
    'fr-FR': 'French (France)',
    'fr-CA': 'French (Canada)',
    'zh-Hans': 'Chinese (Simplified)',
    'zh-Hant': 'Chinese (Traditional)',
    'pt-BR': 'Portuguese (Brazil)',
    'pt-PT': 'Portuguese (Portugal)',
  },

  // Unicode CLDR: Formats régionaux
  regionalFormats: {
    dateFormats: {
      'en-US': 'MM/DD/YYYY',
      'en-GB': 'DD/MM/YYYY',
      'de-DE': 'DD.MM.YYYY',
      'ja-JP': 'YYYY/MM/DD',
    },
    numberFormats: {
      'en-US': { decimal: '.', thousands: ',' },
      'fr-FR': { decimal: ',', thousands: ' ' },
      'de-DE': { decimal: ',', thousands: '.' },
    },
    firstDayOfWeek: {
      'en-US': 0, // Sunday
      'fr-FR': 1, // Monday
      'ar-SA': 6, // Saturday
    },
  },
};
```

### 10.4 Checklist Enterprise

```markdown
## Checklist i18n Enterprise

### Configuration
- [ ] Définir les locales supportées
- [ ] Configurer la détection automatique de locale
- [ ] Implémenter le fallback de langue
- [ ] Configurer les cookies de préférence

### Traductions
- [ ] Structurer les namespaces par fonctionnalité
- [ ] Implémenter la pluralisation
- [ ] Gérer les interpolations
- [ ] Utiliser des clés descriptives (pas "msg1")

### Formatage
- [ ] Dates et heures localisées
- [ ] Nombres avec séparateurs locaux
- [ ] Devises avec symboles corrects
- [ ] Unités de mesure (métrique vs impérial)

### RTL Support
- [ ] Direction du texte (dir="rtl")
- [ ] Layouts miroir
- [ ] Icônes flippées si nécessaire
- [ ] Fonts appropriées

### SEO
- [ ] Balises hreflang
- [ ] Sitemap multilingue
- [ ] Métadonnées traduites
- [ ] URLs localisées

### Testing
- [ ] Tests unitaires des formatters
- [ ] Tests de complétude des traductions
- [ ] Tests E2E multilingues
- [ ] Tests de screenshot visuel

### Performance
- [ ] Lazy loading des traductions
- [ ] Cache des traductions
- [ ] Bundle splitting par locale

### Workflow
- [ ] Intégration avec plateforme de traduction
- [ ] Process de review des traductions
- [ ] Documentation pour traducteurs
```

---

## 📚 Ressources

### Documentation
- [i18next Documentation](https://www.i18next.com/)
- [Next.js i18n Routing](https://nextjs.org/docs/app/building-your-application/routing/internationalization)
- [Intl API MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)
- [Unicode CLDR](https://cldr.unicode.org/)

### Plateformes de Traduction
- [Lokalise](https://lokalise.com/)
- [Crowdin](https://crowdin.com/)
- [Phrase](https://phrase.com/)
- [Transifex](https://www.transifex.com/)

### Standards
- [ISO 639 Language Codes](https://www.iso.org/iso-639-language-codes.html)
- [ISO 4217 Currency Codes](https://www.iso.org/iso-4217-currency-codes.html)
- [BCP 47 Language Tags](https://www.rfc-editor.org/info/bcp47)

---

**Dernière mise à jour** : 2026-01-18
