# Vidéo 01 - Méthodologie Frontend & Architecture Next.js

## 🎬 Durée: 10 minutes

---

## 📋 Script Vidéo Détaillé

### ⏱️ 0:00 - 2:00 | Méthodologie: Les 5 Étapes (2 min)

**À dire:**
> "Bienvenue ! Avant de coder, apprenons à PENSER comme un développeur frontend professionnel. Voici ma méthodologie en 5 étapes que j'utilise sur tous mes projets."

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. ANALYSER │ → │ 2. STRUCTURER│ → │ 3. STYLISER │ → │ 4. INTERAGIR│ → │ 5. OPTIMISER│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

**Les 5 étapes expliquées (30 sec chacune):**

1. **ANALYSER** - Quel besoin? Quelles données? Quelle maquette?
2. **STRUCTURER** - Quels fichiers? Quels composants? Quelle organisation?
3. **STYLISER** - Quelles couleurs? Quel design system? Dark mode?
4. **INTERAGIR** - Quels états? Quels événements? Quelle navigation?
5. **OPTIMISER** - Performance? Accessibilité? Responsive?

---

### ⏱️ 2:00 - 4:00 | Création Projet Next.js 16 (2 min)

**À dire:**
> "On va créer notre projet avec Next.js 16, la dernière version avec l'App Router."

**Commande:**
```bash
npx create-next-app@latest workshop-manager
```

**Options à sélectionner:**
```
✔ Would you like to use TypeScript? → Yes
✔ Would you like to use ESLint? → Yes
✔ Would you like to use Tailwind CSS? → Yes
✔ Would you like to use `src/` directory? → No
✔ Would you like to use App Router? → Yes
✔ Would you like to customize the default import alias? → No
```

**À dire:**
> "TypeScript pour la sécurité, Tailwind pour les styles, App Router pour le routing moderne."

---

### ⏱️ 4:00 - 7:00 | Fichiers Clés et Multiple Fonts (3 min)

**Structure du projet:**
```
workshop-manager/
├── app/
│   ├── layout.tsx         # ← Layout racine avec fonts
│   ├── page.tsx           # ← Page d'accueil
│   ├── providers.tsx      # ← Providers React Context
│   └── globals.css        # ← Styles globaux
├── components/            # ← Composants réutilisables
├── context/              # ← Context providers (Auth, Theme, I18n)
├── hooks/                # ← Custom hooks
├── i18n/                 # ← Traductions
└── package.json
```

**Le layout.tsx avec Multiple Google Fonts:**
```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Open_Sans, Inter, Roboto, Poppins } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const openSans = Open_Sans({
  variable: "--font-opensans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Workshop Manager",
  description: "Manage your workshop, workers, and income",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${openSans.variable} ${inter.variable} ${roboto.variable} ${poppins.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**À dire:**
> "On charge 4 fonts Google pour offrir du choix aux utilisateurs. Le `suppressHydrationWarning` évite les warnings avec le dark mode."

---

### ⏱️ 7:00 - 10:00 | Providers et Premier Lancement (3 min)

**Le fichier providers.tsx (ordre IMPORTANT):**
```tsx
// app/providers.tsx
"use client";

import { ThemeProvider } from "@/context/ThemeProvider";
import { AuthProvider } from "@/context/AuthProvider";
import { I18nProvider } from "@/i18n";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <I18nProvider>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </I18nProvider>
    </AuthProvider>
  );
}
```

**À dire:**
> "L'ordre est crucial! AuthProvider en premier car Theme et I18n en dépendent. Notez le 'use client' obligatoire."

**Première page simple:**
```tsx
// app/page.tsx
export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-purple-900 mb-4">
          Workshop Manager
        </h1>
        <p className="text-gray-600">
          Votre application de gestion professionnelle
        </p>
      </div>
    </main>
  );
}
```

**Lancement:**
```bash
npm run dev
# Ouvrir http://localhost:3000
```

**Conclusion:**
> "Voilà! On a notre base Next.js 16 avec TypeScript, Tailwind, et multiple fonts. Dans la prochaine vidéo, on construit un système de thèmes ultra-avancé avec 8 palettes de couleurs!"

---

## 📝 Points Clés à Retenir

| Concept | Description |
|---------|-------------|
| **5 Étapes** | Analyser → Structurer → Styliser → Interagir → Optimiser |
| **App Router** | Nouvelle architecture de Next.js 16 |
| **Multiple Fonts** | Open Sans, Inter, Roboto, Poppins pour flexibilité |
| **Providers Order** | AuthProvider > I18nProvider > ThemeProvider |
| **"use client"** | Nécessaire pour les contextes React |

---

## 🎯 Exercice Pratique

1. Créez votre projet avec `create-next-app`
2. Ajoutez 2 fonts supplémentaires (ex: Montserrat, Lato)
3. Créez une page `/about` avec un titre stylisé
4. Testez le hot-reload en changeant le texte

---

## ➡️ Vidéo Suivante

[Vidéo 02: Système de Thèmes Avancé](./02-themes-avances.md)
