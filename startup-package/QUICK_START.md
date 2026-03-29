# 🚀 Guide de Démarrage Rapide

> Mettez en place votre projet en 5 minutes

## Option 1 : Script Automatique (Recommandé)

### Pour Linux/Mac

```bash
# 1. Naviguez vers votre dossier de travail
cd ~/projets

# 2. Exécutez le script d'initialisation
bash /chemin/vers/startup-package/scripts/init-project.sh mon-nouveau-projet

# 3. Entrez dans votre projet
cd mon-nouveau-projet

# 4. Configurez vos variables d'environnement
cp .env.example .env.local
# Éditez .env.local avec vos valeurs

# 5. Lancez le serveur de développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) 🎉

---

### Pour Windows (PowerShell)

```powershell
# 1. Naviguez vers votre dossier de travail
cd C:\projets

# 2. Créez le projet manuellement (le script bash ne fonctionne pas sur Windows)
# Suivez "Option 2 : Manuelle" ci-dessous
```

---

## Option 2 : Installation Manuelle

### Étape 1 : Créer le projet

```bash
# Créez un nouveau projet Next.js
npx create-next-app@latest mon-projet --typescript --tailwind --app --use-npm

# Entrez dans le dossier
cd mon-projet
```

### Étape 2 : Installer les dépendances supplémentaires

```bash
npm install zod react-hook-form @hookform/resolvers clsx tailwind-merge
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier tailwindcss-animate
```

### Étape 3 : Copier les fichiers de configuration

```bash
# Depuis le dossier startup-package, copiez :
cp startup-package/templates/configs/tsconfig.json .
cp startup-package/templates/configs/.eslintrc.json .
cp startup-package/templates/configs/.prettierrc .
cp startup-package/templates/configs/.prettierignore .
cp startup-package/templates/configs/.env.example .
cp startup-package/templates/configs/next.config.js .
cp startup-package/templates/configs/tailwind.config.js .
```

### Étape 4 : Créer la structure de dossiers

```bash
mkdir -p components/{ui,features,layout,providers}
mkdir -p lib/{db,services,api,hooks,utils,validations,constants}
mkdir -p types config tests/{unit,integration,e2e} docs
```

### Étape 5 : Copier les templates de planification

```bash
cp startup-package/templates/checklists/PROJECT_PLAN_TEMPLATE.md ./PROJECT_PLAN.md
cp startup-package/templates/checklists/ARCHITECTURE_TEMPLATE.md ./ARCHITECTURE.md
```

### Étape 6 : Configurer les variables d'environnement

```bash
cp .env.example .env.local
# Éditez .env.local avec vos vraies valeurs
```

### Étape 7 : Lancer le projet

```bash
npm run dev
```

---

## Avec Claude Code

### Prompt pour démarrer avec Claude Code

```
Je veux créer un nouveau projet Next.js en suivant les bonnes pratiques.

Utilise le startup-package situé dans [CHEMIN_VERS_STARTUP_PACKAGE] pour :
1. M'aider à remplir PROJECT_PLAN.md
2. Configurer mon architecture dans ARCHITECTURE.md
3. Créer la structure de base du projet

Mon projet : [DESCRIPTION DE VOTRE PROJET]
```

Claude vous guidera étape par étape !

---

## Checklist Post-Installation

Après l'installation, vérifiez que tout fonctionne :

```bash
# ✅ Vérifier les types TypeScript
npm run type-check

# ✅ Vérifier le linting
npm run lint

# ✅ Vérifier le formatage
npm run format:check

# ✅ Builder le projet
npm run build
```

Si tout est vert, vous êtes prêt ! 🎉

---

## Prochaines Étapes

### 1. Planification (30-60 min)

- [ ] Remplir [PROJECT_PLAN.md](./PROJECT_PLAN.md)
- [ ] Définir votre stack dans [ARCHITECTURE.md](./ARCHITECTURE.md)
- [ ] Lire [docs/01-PLANNING.md](./docs/01-PLANNING.md)

### 2. Configuration (15-30 min)

- [ ] Configurer `.env.local`
- [ ] Personnaliser `config/site.ts`
- [ ] Adapter les couleurs dans `tailwind.config.js`

### 3. Développement

- [ ] Lire [docs/02-DEVELOPMENT.md](./docs/02-DEVELOPMENT.md)
- [ ] Commencer par une feature simple
- [ ] Utiliser TodoWrite avec Claude Code pour tracer vos tâches

---

## Structure du Projet

Voici ce qui a été créé :

```
mon-projet/
├── app/                    # Next.js App Router
├── components/             # Composants React
│   ├── ui/                # Composants UI réutilisables
│   ├── features/          # Composants métier
│   └── layout/            # Header, Footer, etc.
├── lib/                   # Logique métier
│   ├── services/         # Services (API calls, etc.)
│   ├── hooks/            # Custom hooks
│   └── utils/            # Utilitaires
├── types/                 # Types TypeScript
├── config/                # Configuration
├── PROJECT_PLAN.md        # Votre plan de projet
└── ARCHITECTURE.md        # Votre architecture
```

Détails complets : [templates/project-structure/nextjs-14/STRUCTURE.md](./templates/project-structure/nextjs-14/STRUCTURE.md)

---

## Scripts Disponibles

| Script | Description |
|--------|-------------|
| `npm run dev` | Serveur de développement (localhost:3000) |
| `npm run build` | Build production |
| `npm run start` | Serveur production |
| `npm run lint` | Vérifier le code |
| `npm run lint:fix` | Corriger les erreurs automatiquement |
| `npm run format` | Formater le code |
| `npm run type-check` | Vérifier les types TypeScript |

---

## Résolution de Problèmes

### Erreur : "Module not found"

```bash
# Réinstallez les dépendances
rm -rf node_modules package-lock.json
npm install
```

### Erreur TypeScript

```bash
# Vérifiez que tsconfig.json est correct
npm run type-check
```

### Le serveur ne démarre pas

```bash
# Vérifiez le port 3000 n'est pas déjà utilisé
lsof -i :3000
# Si occupé, tuez le processus ou changez le port
PORT=3001 npm run dev
```

---

## Aide et Support

- 📚 Documentation complète : [README.md](./README.md)
- 🎯 Phase par phase : [docs/](./docs/)
- 💬 Avec Claude Code : Référencez simplement ce package dans vos conversations

---

## Exemples de Premier Composant

### Créer votre premier composant UI

```bash
# Créez le fichier
touch components/ui/button.tsx
```

```typescript
// components/ui/button.tsx
import { cn } from '@/lib/utils/cn';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  className,
  variant = 'default',
  size = 'md',
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'rounded-md font-medium transition-colors',
        {
          'bg-primary text-primary-foreground hover:bg-primary/90':
            variant === 'default',
          'border border-input bg-background hover:bg-accent':
            variant === 'outline',
          'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
        },
        {
          'h-9 px-3 text-sm': size === 'sm',
          'h-10 px-4': size === 'md',
          'h-11 px-8 text-lg': size === 'lg',
        },
        className
      )}
      {...props}
    />
  );
}
```

### Utiliser le composant

```typescript
// app/page.tsx
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Mon App</h1>
      <Button>Click me</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost" size="sm">Small Ghost</Button>
    </div>
  );
}
```

---

**Vous êtes prêt ! Bon développement ! 🚀**

Pour la suite, consultez [docs/01-PLANNING.md](./docs/01-PLANNING.md)
