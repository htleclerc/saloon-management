# AGENT.md - Instructions pour l'Agent de Développement

> Ce fichier définit le contexte, les conventions et les bonnes pratiques pour ce projet.
> L'agent DOIT lire ce fichier au début de chaque session.

---

## 📋 Informations Projet

### Projet
- **Nom** : Saloon Management System
- **Type** : Web Application (Frontend Only - Client-side)
- **Stack** : Next.js 14 (App Router) / React 19 / TypeScript / Tailwind CSS 4
- **Statut** : Développement actif

---

## 📚 Documentation de Référence

**TOUJOURS consulter ces fichiers avant de faire des modifications :**

1. **[startup-package/README.md](startup-package/README.md)** - Vue d'ensemble des bonnes pratiques
2. **[startup-package/docs/standards/ENTERPRISE_STANDARDS.md](startup-package/docs/standards/ENTERPRISE_STANDARDS.md)** - Standards enterprise

---

## 🎯 Règles Impératives

### TOUJOURS ✅
1. Utiliser TypeScript strict mode
2. Valider les inputs avec Zod
3. Écrire des tests pour le nouveau code
4. Utiliser `TodoWrite` pour les tâches complexes (> 3 étapes)
5. Faire des commits atomiques avec messages conventionnels
6. Lire le code existant avant de créer du nouveau

### JAMAIS ❌
1. Utiliser `any` en TypeScript
2. Committer des secrets
3. Ignorer les erreurs TypeScript ou ESLint
4. Push sur main/master directement

---

## 🛠️ Conventions de Code

### Nommage
| Type | Convention | Exemple |
|------|------------|---------|
| Variables | camelCase | `userName` |
| Constantes | UPPER_SNAKE | `API_URL` |
| Classes/Types | PascalCase | `UserService` |
| Fichiers composants | PascalCase | `UserProfile.tsx` |

### Git Commits
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

---

## 🔧 Commandes Disponibles

```bash
npm run dev          # Développement (port 3000)
npm run build        # Build production
npm run lint         # ESLint
npm run lint:fix     # ESLint avec auto-fix
npm run type-check   # Vérification TypeScript
npm run format       # Prettier formatting
npm run test         # Tests (à configurer)
```

---

## 🏗️ Architecture et Patterns

### Stack Technique Complète
- **Frontend**: Next.js 14 (App Router), React 19.2.3
- **Langage**: TypeScript 5 (strict mode)
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Charts**: Recharts 3.6
- **Date**: date-fns 4.1
- **État**: Context API (pas de Redux/Zustand pour l'instant)

### Architecture Actuelle
```
frontend/
├── app/              # Next.js App Router pages
├── components/       # Composants réutilisables
│   ├── layout/      # Header, Sidebar, MainLayout, etc.
│   ├── ui/          # Button, Card, StatCard, etc.
│   └── dashboard/   # ClientDashboard
├── context/         # State management
│   ├── AuthProvider.tsx    # Authentification et rôles
│   └── ThemeProvider.tsx   # Thème et responsive
├── hooks/           # Custom React hooks
├── i18n/            # Internationalisation (EN, FR, ES)
├── lib/             # Utilitaires (export.ts)
└── types/           # Types TypeScript centralisés
```

### Patterns Importants

#### 1. "use client" Directive
Tous les composants interactifs (avec state, effects, event handlers) doivent utiliser `"use client"` en première ligne.

#### 2. Mock Data Pattern
Les données de démo sont définies en haut des fichiers pages :
```typescript
const workers = [...]; // Mock data
const clients = [...]; // Mock data
```

#### 3. Context Providers
- **AuthProvider** : Gestion utilisateur, rôles, permissions, demo mode
  - Rôles : 'super_admin' | 'admin' | 'owner' | 'manager' | 'worker' | 'client'
  - Hook : `useAuth()`
  - Composant : `<RequirePermission role={[...]}>`
  
- **ThemeProvider** : Thème, dark mode, responsive
  - Hook : `useTheme()` pour theme/darkMode
  - Hook : `useResponsive()` pour isMobile/isTablet

#### 4. Component Props Pattern
Props définies via interfaces inline ou types :
```typescript
interface Props {
  children: ReactNode;
  className?: string;
}

export default function Component({ children, className }: Props) {
  // ...
}
```

#### 5. Layout Components
- `MainLayout` : Layout standard avec Header + Sidebar
- `TeamLayout` : Layout spécifique pour les pages Team
- `SettingsLayout` : Layout pour les pages Settings

#### 6. Gradients Pattern
Utilise des gradients Tailwind cohérents :
- Workers : `from-purple-500 to-purple-700`, `from-pink-500 to-pink-700`, etc.
- Statuts : `from-green-500 to-green-600` (success), `from-red-500 to-red-600` (error)

#### 7. i18n Pattern
```typescript
import { useTranslation } from '@/i18n';
const { t } = useTranslation();
// Usage: t('nav.dashboard'), t('workers.add')
```

### Conventions Spécifiques

#### Export Utilities (`lib/export.ts`)
- `exportToCSV<T>()` : Export données vers CSV
- `exportToPDF<T>()` : Export via print window
- `sortData<T>()` : Tri de tableaux
- Utilise le type `ExportColumn<TData>` (pas `any`)

#### Types Centralisés (`types/index.ts`)
- `Worker`, `Client`, `Service`, `Product`
- `WorkerShare`, `UsedProduct`
- `Notification`, `ExportColumn`
- Importer depuis `@/types` quand disponible

#### Responsive Design
- Mobile-first approach
- Breakpoints : `md:` (768px), `lg:` (1024px), `xl:` (1280px)
- Sidebar : collapsé sur mobile, ouvert sur desktop
- Use `useResponsive()` hook pour logique conditionnelle

---

## ⚠️ Points d'Attention Spécifiques

### Architecture Client-Only
- **Aucun backend pour l'instant** : toutes les données sont mockées côté client
- Ne pas essayer de créer des API routes ou des server actions
- Les données ne persistent pas (localStorage utilisé pour démo uniquement)

### Role-Based Access Control (RBAC)
- Toujours wrapper les éléments sensibles avec `<RequirePermission>`
- Hiérarchie des rôles : super_admin > admin > owner > manager > worker > client
- Workers ne voient que leurs propres montants (privacy)

### Responsive Considerations
- Tester sur mobile (sidebar devient menu burger)
- Cartes KPI s'adaptent en grille responsive
- Tableaux doivent scroller horizontalement sur mobile

### i18n
- Toutes les chaînes visibles doivent être traduites
- Utiliser `t('key.path')` jamais de texte en dur
- Langues supportées : EN (défaut), FR, ES

### Performance
- Lazy loading non implémenté encore
- Pagination manuelle sur grandes listes (workers, income)
- Charts Recharts peuvent être lents avec beaucoup de données

---

**Dernière mise à jour** : 2026-01-18
**Version** : 1.1
