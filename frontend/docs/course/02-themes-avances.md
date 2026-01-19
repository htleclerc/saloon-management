# Vidéo 02 - Système de Thèmes Avancé

## 🎬 Durée: 10 minutes

---

## 📋 Script Vidéo Détaillé

### ⏱️ 0:00 - 2:00 | 8 Palettes de Couleurs (2 min)

**À dire:**
> "On va créer un système de thèmes pro avec 8 palettes de couleurs prédéfinies. Chaque palette a une couleur primaire ET secondaire."

**Créer les palettes:**
```tsx
// context/ThemeProvider.tsx
export interface ColorPalette {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  primaryLight: string;
  secondaryLight: string;
}

export const colorPalettes: ColorPalette[] = [
  { 
    id: "purple-pink", 
    name: "Purple & Pink", 
    primary: "#9333ea", 
    secondary: "#ec4899",
    primaryLight: "#f3e8ff",
    secondaryLight: "#fce7f3"
  },
  { 
    id: "blue-cyan", 
    name: "Blue & Cyan", 
    primary: "#3b82f6", 
    secondary: "#06b6d4",
    primaryLight: "#dbeafe",
    secondaryLight: "#cffafe"
  },
  { 
    id: "green-teal", 
    name: "Green & Teal", 
    primary: "#22c55e", 
    secondary: "#14b8a6",
    primaryLight: "#dcfce7",
    secondaryLight: "#ccfbf1"
  },
  { 
    id: "orange-yellow", 
    name: "Orange & Yellow", 
    primary: "#f97316", 
    secondary: "#eab308",
    primaryLight: "#ffedd5",
    secondaryLight: "#fef9c3"
  },
  { 
    id: "red-pink", 
    name: "Red & Pink", 
    primary: "#ef4444", 
    secondary: "#f472b6",
    primaryLight: "#fee2e2",
    secondaryLight: "#fce7f3"
  },
  { 
    id: "indigo-purple", 
    name: "Indigo & Purple", 
    primary: "#6366f1", 
    secondary: "#a855f7",
    primaryLight: "#e0e7ff",
    secondaryLight: "#f3e8ff"
  },
  { 
    id: "slate-blue", 
    name: "Slate & Blue", 
    primary: "#475569", 
    secondary: "#3b82f6",
    primaryLight: "#f1f5f9",
    secondaryLight: "#dbeafe"
  },
  { 
    id: "emerald-lime", 
    name: "Emerald & Lime", 
    primary: "#10b981", 
    secondary: "#84cc16",
    primaryLight: "#d1fae5",
    secondaryLight: "#ecfccb"
  },
];
```

**À dire:**
> "8 palettes pro! Chacune avec des couleurs qui s'harmonisent parfaitement."

---

### ⏱️ 2:00 - 4:00 | ThemeProvider Avancé (2 min)

**Structure du ThemeProvider:**
```tsx
// context/ThemeProvider.tsx
"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type DesignType = "modern" | "minimal" | "glassmorphism" | "gradient";
export type FontSize = "small" | "normal" | "large";

interface ThemeSettings {
  designType: DesignType;
  colorPaletteId: string;
  fontFamily: string;
  fontSize: FontSize;
  darkMode: boolean;
  compactMode: boolean;
  animations: boolean;
  transparency: number; // 0.0 to 1.0
  sidebarCollapsed: boolean;
}

const defaultTheme: ThemeSettings = {
  designType: "modern",
  colorPaletteId: "purple-pink",
  fontFamily: "Open Sans",
  fontSize: "normal",
  darkMode: false,
  compactMode: false,
  animations: true,
  transparency: 0.95,
  sidebarCollapsed: false,
};

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
  toggleDarkMode: () => void;
  currentPalette: ColorPalette;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Get current palette
  const currentPalette = colorPalettes.find(p => p.id === theme.colorPaletteId) || colorPalettes[0];

  // Load from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("workshop-theme");
    if (saved) {
      setTheme({ ...defaultTheme, ...JSON.parse(saved) });
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    if (!mounted) return;

    localStorage.setItem("workshop-theme", JSON.stringify(theme));

    // Apply CSS variables
    const palette = colorPalettes.find(p => p.id === theme.colorPaletteId) || colorPalettes[0];
    
    document.documentElement.style.setProperty("--color-primary", palette.primary);
    document.documentElement.style.setProperty("--color-secondary", palette.secondary);
    document.documentElement.style.setProperty("--color-primary-light", palette.primaryLight);
    document.documentElement.style.setProperty("--color-secondary-light", palette.secondaryLight);

    // Font size
    const fontSizes = { small: "14px", normal: "16px", large: "18px" };
    document.documentElement.style.setProperty("--base-font-size", fontSizes[theme.fontSize]);

    // Dark mode
    if (theme.darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    // Font family
    document.body.style.fontFamily = `"${theme.fontFamily}", sans-serif`;
  }, [theme, mounted]);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  };

  const toggleDarkMode = () => {
    setTheme((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, toggleDarkMode, currentPalette }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
```

---

### ⏱️ 4:00 - 6:00 | Hook useKpiCardStyle (2 min)

**À dire:**
> "Voici le PLUS IMPORTANT: un custom hook qui génère des styles dynamiques pour les cartes KPI selon le type de design choisi!"

**Créer le custom hook:**
```tsx
// hooks/useKpiCardStyle.ts
import { CSSProperties } from 'react';
import { useTheme } from '@/context/ThemeProvider';

export function useKpiCardStyle() {
  const { theme } = useTheme();

  const getCardStyle = (index: number): CSSProperties => {
    const isPrimary = index % 2 === 0;
    const colorVar = isPrimary ? 'primary' : 'secondary';

    switch (theme.designType) {
      case 'minimal':
        // Flat, solid colors - no gradients
        return {
          backgroundColor: `var(--color-${colorVar})`,
        };

      case 'modern':
        // Subtle gradient with shadows
        return {
          background: `linear-gradient(135deg, var(--color-${colorVar}) 0%, var(--color-${colorVar}) 100%)`,
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        };

      case 'gradient':
      case 'glassmorphism':
        // Full gradient mixing primary and secondary
        return {
          background: isPrimary
            ? 'linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))'
            : 'linear-gradient(to bottom right, var(--color-secondary), var(--color-primary))',
        };

      default:
        return {
          background: 'linear-gradient(to bottom right, var(--color-primary), var(--color-secondary))',
        };
    }
  };

  return { getCardStyle };
}
```

**Utilisation:**
```tsx
// Dans un composant
import { useKpiCardStyle } from '@/hooks/useKpiCardStyle';

function Dashboard() {
  const { getCardStyle } = useKpiCardStyle();

  return (
    <div className="grid grid-cols-4 gap-6">
      <div style={getCardStyle(0)} className="rounded-2xl p-6 text-white">
        Card 1 - Primary Color
      </div>
      <div style={getCardStyle(1)} className="rounded-2xl p-6 text-white">
        Card 2 - Secondary Color
      </div>
      <div style={getCardStyle(2)} className="rounded-2xl p-6 text-white">
        Card 3 - Primary Color
      </div>
      <div style={getCardStyle(3)} className="rounded-2xl p-6 text-white">
        Card 4 - Secondary Color
      </div>
    </div>
  );
}
```

---

### ⏱️ 6:00 - 8:00 | useResponsive Hook (2 min)

**Hook pour le responsive:**
```tsx
// Dans ThemeProvider.tsx (ou hooks/useResponsive.ts)
export function useResponsive() {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setIsDesktop(width >= 1024);
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return { isMobile, isTablet, isDesktop };
}
```

---

### ⏱️ 8:00 - 10:00 | Sélecteur de Palette et Demo (2 min)

**Créer un sélecteur:**
```tsx
// components/ColorPaletteSelector.tsx
"use client";
import { useTheme, colorPalettes } from "@/context/ThemeProvider";

export function ColorPaletteSelector() {
  const { theme, updateTheme, currentPalette } = useTheme();

  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Choose Color Palette</h3>
      <div className="grid grid-cols-2 gap-3">
        {colorPalettes.map((palette) => (
          <button
            key={palette.id}
            onClick={() => updateTheme({ colorPaletteId: palette.id })}
            className={`p-3 rounded-lg border-2 transition ${
              theme.colorPaletteId === palette.id
                ? "border-purple-500 bg-purple-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: palette.primary }}
              />
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: palette.secondary }}
              />
            </div>
            <p className="text-sm font-medium">{palette.name}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Design Type Selector:**
```tsx
<div className="space-y-2">
  <label className="font-semibold">Design Type</label>
  <select
    value={theme.designType}
    onChange={(e) => updateTheme({ designType: e.target.value })}
    className="w-full p-2 border rounded"
  >
    <option value="modern">Modern (Subtle Gradients)</option>
    <option value="minimal">Minimal (Flat Colors)</option>
    <option value="gradient">Gradient (Full Mix)</option>
    <option value="glassmorphism">Glassmorphism</option>
  </select>
</div>
```

**Conclusion:**
> "On a maintenant 8 palettes × 4 designs = 32 variations possibles! Et tout ça avec un seul custom hook. Dans la prochaine vidéo: le système d'authentification multi-tenant!"

---

## 📝 Points Clés à Retenir

| Concept | Description |
|---------|-------------|
| **8 Palettes** | Purple/Pink, Blue/Cyan, Green/Teal, etc. |
| **useKpiCardStyle** | Custom hook pour styles dynamiques selon designType |
| **4 Design Types** | minimal, modern, gradient, glassmorphism |
| **CSS Variables** | `--color-primary`, `--color-secondary` |
| **useResponsive** | isMobile, isTablet, isDesktop |

---

## 🎯 Exercice Pratique

1. Créez une 9ème palette "Sunset" (orange + purple)
2. Testez les 4 design types sur vos cartes KPI
3. Ajoutez un toggle pour `compactMode`

---

## ➡️ Vidéo Suivante

[Vidéo 03: Authentification Multi-Tenant](./03-auth-multitenant.md)
