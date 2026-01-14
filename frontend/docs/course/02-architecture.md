# Vidéo 02 - Architecture Next.js

## 🎬 Durée: 10 minutes

---

## 📋 Script Vidéo Détaillé

### ⏱️ 0:00 - 2:00 | Création du Projet Next.js (2 min)

**À dire:**
> "On va créer notre projet Next.js depuis zéro. Je vais vous montrer les options importantes à choisir."

**Commande à exécuter:**
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
✔ Would you like to use Turbopack? → Yes
✔ Would you like to customize the default import alias? → No
```

**À dire:**
> "On utilise TypeScript pour le typage, Tailwind pour les styles, et l'App Router qui est la nouvelle façon de gérer les routes dans Next.js 16."

---

### ⏱️ 2:00 - 4:00 | Structure des Dossiers (2 min)

**À montrer dans VS Code:**

```
workshop-manager/
├── app/                    ← 📁 PAGES & ROUTES
│   ├── layout.tsx         # Layout racine (HTML, body)
│   ├── page.tsx           # Page d'accueil (/)
│   ├── globals.css        # Styles globaux
│   ├── favicon.ico        # Icône du site
│   │
│   ├── dashboard/         # Route /dashboard
│   │   └── page.tsx
│   │
│   ├── workers/           # Route /workers
│   │   ├── page.tsx       # Liste des travailleurs
│   │   └── [id]/          # Route dynamique /workers/123
│   │       └── page.tsx
│   │
│   └── settings/          # Route /settings
│       └── page.tsx
│
├── components/            ← 📁 COMPOSANTS RÉUTILISABLES
│   ├── layout/           # Sidebar, Header, MainLayout
│   └── ui/               # Button, Card, Input...
│
├── context/              ← 📁 ÉTATS GLOBAUX
│   ├── ThemeProvider.tsx # Gestion des thèmes
│   └── AuthProvider.tsx  # Authentification
│
├── i18n/                 ← 📁 TRADUCTIONS
│   ├── index.tsx         # Provider i18n
│   └── translations/     # en.json, fr.json, es.json
│
├── lib/                  ← 📁 UTILITAIRES
│   └── utils.ts          # Fonctions helper
│
├── public/               ← 📁 FICHIERS STATIQUES
│   └── images/           # Logo, icônes...
│
├── package.json          # Dépendances
├── tsconfig.json         # Config TypeScript
└── tailwind.config.ts    # Config Tailwind
```

**À dire:**
> "La règle d'or: chaque dossier dans `app/` devient une route. Le fichier `page.tsx` est la page affichée à cette route."

---

### ⏱️ 4:00 - 7:00 | Fichiers Clés Expliqués (3 min)

#### Le `layout.tsx` (1 min)

**À montrer:**
```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Workshop Manager",
  description: "Gérez votre atelier efficacement",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**À dire:**
> "Le layout.tsx est le squelette de votre app. Il contient le HTML, les fonts, et enveloppe toutes les pages. Le `{children}` sera remplacé par le contenu de chaque page."

#### Le `providers.tsx` (1 min)

**À montrer:**
```tsx
// app/providers.tsx
"use client";

import { ThemeProvider } from "@/context/ThemeProvider";
import { I18nProvider } from "@/i18n";
import { AuthProvider } from "@/context/AuthProvider";

export default function Providers({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  return (
    <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          {children}
        </AuthProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
```

**À dire:**
> "Le providers.tsx combine tous nos Context React. C'est ici qu'on configure le thème, la langue, et l'authentification. Notez le 'use client' - c'est obligatoire pour les Context."

#### La directive `"use client"` (1 min)

**À montrer:**
```tsx
// ❌ Sans "use client" - Server Component (par défaut)
export default function StaticPage() {
  // Pas d'accès à useState, useEffect, onClick...
  return <div>Contenu statique</div>;
}

// ✅ Avec "use client" - Client Component
"use client";
import { useState } from "react";

export default function InteractivePage() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

**À dire:**
> "Next.js 16 distingue les Server Components (par défaut, pour le rendu statique) et les Client Components (avec 'use client', pour l'interactivité). Utilisez 'use client' quand vous avez besoin de hooks React."

---

### ⏱️ 7:00 - 10:00 | Premier Lancement (3 min)

**Commandes à exécuter:**
```bash
# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

**À montrer:**
- Ouvrir http://localhost:3000
- La page d'accueil Next.js par défaut
- Les DevTools ouverts

**Créer notre première page:**

```tsx
// app/page.tsx
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-4xl font-bold text-purple-600">
        Workshop Manager
      </h1>
      <p className="mt-4 text-gray-600">
        Bienvenue dans votre espace de gestion!
      </p>
    </main>
  );
}
```

**Créer une sous-page:**

```tsx
// app/workers/page.tsx
export default function WorkersPage() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold">Travailleurs</h1>
      <p>Liste des travailleurs à venir...</p>
    </main>
  );
}
```

**À dire:**
> "Naviguez vers /workers dans le navigateur. La route est créée automatiquement! C'est la magie de l'App Router."

**Conclusion:**
> "Maintenant qu'on a notre structure en place, on va apprendre à gérer les thèmes avec un Context React. C'est le sujet de la prochaine vidéo!"

---

## 📝 Points Clés à Retenir

| Concept | Description |
|---------|-------------|
| **App Router** | Chaque dossier dans `app/` = une route |
| **page.tsx** | Le fichier affiché pour cette route |
| **layout.tsx** | Le conteneur partagé entre pages |
| **providers.tsx** | Combine tous les Context React |
| **"use client"** | Active les hooks React (useState, etc.) |

---

## 🎯 Exercice Pratique

1. Créez un nouveau projet Next.js avec les mêmes options
2. Ajoutez une page `/settings` avec un titre "Paramètres"
3. Ajoutez une page `/expenses` avec un titre "Dépenses"
4. Naviguez entre les pages en changeant l'URL manuellement

---

## ➡️ Vidéo Suivante

[Vidéo 03: Système de Thèmes](./03-themes.md)
