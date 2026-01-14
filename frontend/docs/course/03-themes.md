# Vidéo 03 - Système de Thèmes

## 🎬 Durée: 10 minutes

---

## 📋 Script Vidéo Détaillé

### ⏱️ 0:00 - 2:00 | Créer un Context React (2 min)

**À dire:**
> "Les thèmes sont un état global - ils affectent toute l'application. Pour ça, on utilise la Context API de React."

**Créer le fichier:**
```tsx
// context/ThemeProvider.tsx
"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// 1. Définir les types
interface ThemeSettings {
  darkMode: boolean;
  accentColor: "purple" | "blue" | "green" | "pink";
  designType: "modern" | "minimal" | "glassmorphism";
  sidebarCollapsed: boolean;
}

interface ThemeContextType {
  theme: ThemeSettings;
  updateTheme: (updates: Partial<ThemeSettings>) => void;
}

// 2. Créer le Context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// 3. Valeurs par défaut
const defaultTheme: ThemeSettings = {
  darkMode: false,
  accentColor: "purple",
  designType: "modern",
  sidebarCollapsed: false,
};
```

**À dire:**
> "On définit d'abord les types TypeScript. Ça nous aide à éviter les erreurs et donne l'autocomplétion dans VS Code."

---

### ⏱️ 2:00 - 5:00 | Variables CSS et Thèmes (3 min)

**Dans globals.css:**
```css
/* app/globals.css */

/* === VARIABLES DE BASE === */
:root {
  --background: #ffffff;
  --foreground: #1a1a1a;
  --card-bg: #ffffff;
  --card-border: #e5e7eb;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  --sidebar-bg: #1f2937;
  --header-bg: #ffffff;
}

/* === MODE SOMBRE === */
[data-dark="true"] {
  --background: #0f172a;
  --foreground: #f8fafc;
  --card-bg: #1e293b;
  --card-border: #334155;
  --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  --sidebar-bg: #0f172a;
  --header-bg: #1e293b;
}

/* === COULEURS D'ACCENT === */
[data-accent="purple"] {
  --accent: #9333ea;
  --accent-light: #c084fc;
  --accent-dark: #7e22ce;
}

[data-accent="blue"] {
  --accent: #3b82f6;
  --accent-light: #60a5fa;
  --accent-dark: #2563eb;
}

[data-accent="green"] {
  --accent: #22c55e;
  --accent-light: #4ade80;
  --accent-dark: #16a34a;
}

[data-accent="pink"] {
  --accent: #ec4899;
  --accent-light: #f472b6;
  --accent-dark: #db2777;
}

/* === TYPES DE DESIGN === */
[data-theme="modern"] {
  --card-radius: 16px;
  --button-radius: 12px;
}

[data-theme="minimal"] {
  --card-radius: 8px;
  --button-radius: 4px;
  --card-shadow: none;
}

[data-theme="glassmorphism"] {
  --card-radius: 20px;
  --card-bg: rgba(255, 255, 255, 0.1);
  --card-border: rgba(255, 255, 255, 0.2);
}
```

**À dire:**
> "Les variables CSS, c'est magique! On change une valeur, et TOUT le site se met à jour. Le `data-dark`, `data-accent`, et `data-theme` sont des attributs qu'on va ajouter au HTML."

---

### ⏱️ 5:00 - 7:00 | Dark Mode Toggle (2 min)

**Compléter le ThemeProvider:**
```tsx
// context/ThemeProvider.tsx (suite)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeSettings>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Charger depuis localStorage au montage
  useEffect(() => {
    const saved = localStorage.getItem("workshop-theme");
    if (saved) {
      setTheme(JSON.parse(saved));
    }
    setMounted(true);
  }, []);

  // Appliquer le thème au document HTML
  useEffect(() => {
    if (!mounted) return;
    
    document.documentElement.setAttribute("data-dark", String(theme.darkMode));
    document.documentElement.setAttribute("data-accent", theme.accentColor);
    document.documentElement.setAttribute("data-theme", theme.designType);
    
    // Sauvegarder dans localStorage
    localStorage.setItem("workshop-theme", JSON.stringify(theme));
  }, [theme, mounted]);

  const updateTheme = (updates: Partial<ThemeSettings>) => {
    setTheme((prev) => ({ ...prev, ...updates }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

// Hook personnalisé pour utiliser le thème
export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
```

**À dire:**
> "On utilise useEffect pour appliquer les attributs `data-` au HTML quand le thème change. Le localStorage garde le choix de l'utilisateur entre les sessions."

---

### ⏱️ 7:00 - 10:00 | Couleurs d'Accent (3 min)

**Créer un composant de sélection de couleur:**
```tsx
// Dans Settings ou Header
"use client";
import { useTheme } from "@/context/ThemeProvider";
import { Sun, Moon } from "lucide-react";

function ThemeControls() {
  const { theme, updateTheme } = useTheme();

  const colors = [
    { name: "purple", class: "bg-purple-500" },
    { name: "blue", class: "bg-blue-500" },
    { name: "green", class: "bg-green-500" },
    { name: "pink", class: "bg-pink-500" },
  ];

  return (
    <div className="flex items-center gap-4">
      {/* Toggle Dark Mode */}
      <button
        onClick={() => updateTheme({ darkMode: !theme.darkMode })}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {theme.darkMode ? (
          <Sun className="w-5 h-5 text-yellow-500" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600" />
        )}
      </button>

      {/* Sélecteur de couleur */}
      <div className="flex gap-2">
        {colors.map((color) => (
          <button
            key={color.name}
            onClick={() => updateTheme({ accentColor: color.name })}
            className={`w-6 h-6 rounded-full ${color.class} ${
              theme.accentColor === color.name 
                ? "ring-2 ring-offset-2 ring-gray-400" 
                : ""
            }`}
          />
        ))}
      </div>
    </div>
  );
}
```

**À montrer:**
- Cliquer sur le toggle dark mode → le site passe en sombre
- Cliquer sur une couleur → l'accent change partout
- Rafraîchir la page → le choix est conservé!

**À dire:**
> "Voyez comment tout le site réagit instantanément! C'est parce qu'on utilise des variables CSS connectées au Context React."

**Conclusion:**
> "Maintenant on a un système de thèmes complet. Dans la prochaine vidéo, on va ajouter le support multi-langue avec i18n!"

---

## 📝 Points Clés à Retenir

| Concept | Description |
|---------|-------------|
| **Context API** | État global partagé entre composants |
| **Variables CSS** | `--nom: valeur;` dans `:root` |
| **Attributs data-*** | `data-dark="true"` pour cibler en CSS |
| **localStorage** | Persiste les préférences utilisateur |
| **useEffect** | Applique les changements au DOM |

---

## 🎯 Exercice Pratique

1. Ajoutez une nouvelle couleur d'accent "orange"
2. Créez un toggle pour les animations (on/off)
3. Testez le dark mode et vérifiez que ça persiste après refresh

---

## ⚠️ Erreur Courante

```tsx
// ❌ MAUVAIS - Le contexte n'est pas disponible avant le montage
if (!mounted) {
  return <>{children}</>; // useTheme() échouera!
}

// ✅ BON - Toujours fournir le contexte
return (
  <ThemeContext.Provider value={{ theme, updateTheme }}>
    {children}
  </ThemeContext.Provider>
);
```

---

## ➡️ Vidéo Suivante

[Vidéo 04: Internationalisation](./04-i18n.md)
