#!/bin/bash

# =============================================================================
# Script d'Initialisation de Projet Next.js 14
# =============================================================================
# Ce script initialise un nouveau projet Next.js avec toutes les bonnes pratiques
# Usage: bash init-project.sh [nom-du-projet]
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}ℹ ${NC}$1"
}

log_success() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# =============================================================================
# Configuration
# =============================================================================

PROJECT_NAME=${1:-"my-app"}
CURRENT_DIR=$(pwd)

log_info "Initialisation du projet: ${PROJECT_NAME}"
echo ""

# =============================================================================
# 1. Vérifications préalables
# =============================================================================

log_info "Vérification des prérequis..."

# Check Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js n'est pas installé. Veuillez installer Node.js 18+ depuis https://nodejs.org"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js version 18+ requis. Version actuelle: $(node -v)"
    exit 1
fi
log_success "Node.js $(node -v) détecté"

# Check npm
if ! command -v npm &> /dev/null; then
    log_error "npm n'est pas installé"
    exit 1
fi
log_success "npm $(npm -v) détecté"

# Check git
if ! command -v git &> /dev/null; then
    log_warning "Git n'est pas installé. Le repository Git ne sera pas initialisé."
    GIT_AVAILABLE=false
else
    log_success "git $(git --version | cut -d' ' -f3) détecté"
    GIT_AVAILABLE=true
fi

echo ""

# =============================================================================
# 2. Créer le dossier du projet
# =============================================================================

log_info "Création du dossier projet..."

if [ -d "$PROJECT_NAME" ]; then
    log_error "Le dossier '$PROJECT_NAME' existe déjà"
    read -p "Voulez-vous continuer et écraser le contenu ? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Annulé par l'utilisateur"
        exit 1
    fi
else
    mkdir "$PROJECT_NAME"
fi

cd "$PROJECT_NAME"
log_success "Dossier créé: $PROJECT_NAME"

echo ""

# =============================================================================
# 3. Initialiser Next.js
# =============================================================================

log_info "Initialisation de Next.js 14..."

# Create package.json first
cat > package.json <<EOF
{
  "name": "$PROJECT_NAME",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "next": "^14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "zod": "^3.22.4",
    "react-hook-form": "^7.49.2",
    "@hookform/resolvers": "^3.3.3"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "@typescript-eslint/eslint-plugin": "^6.16.0",
    "@typescript-eslint/parser": "^6.16.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-config-next": "^14.0.4",
    "eslint-config-prettier": "^9.1.0",
    "postcss": "^8.4.32",
    "prettier": "^3.1.1",
    "tailwindcss": "^3.4.0",
    "tailwindcss-animate": "^1.0.7",
    "typescript": "^5.3.3"
  }
}
EOF

log_success "package.json créé"

# =============================================================================
# 4. Installer les dépendances
# =============================================================================

log_info "Installation des dépendances (cela peut prendre quelques minutes)..."
npm install --silent
log_success "Dépendances installées"

echo ""

# =============================================================================
# 5. Copier les fichiers de configuration
# =============================================================================

log_info "Configuration du projet..."

# Find startup-package directory
STARTUP_PACKAGE_DIR="${CURRENT_DIR}/startup-package"
if [ ! -d "$STARTUP_PACKAGE_DIR" ]; then
    STARTUP_PACKAGE_DIR="${CURRENT_DIR}/../startup-package"
fi

if [ ! -d "$STARTUP_PACKAGE_DIR" ]; then
    log_error "Dossier startup-package introuvable"
    exit 1
fi

# Copy config files
cp "${STARTUP_PACKAGE_DIR}/templates/configs/tsconfig.json" .
cp "${STARTUP_PACKAGE_DIR}/templates/configs/.eslintrc.json" .
cp "${STARTUP_PACKAGE_DIR}/templates/configs/.prettierrc" .
cp "${STARTUP_PACKAGE_DIR}/templates/configs/.prettierignore" .
cp "${STARTUP_PACKAGE_DIR}/templates/configs/.gitignore" .
cp "${STARTUP_PACKAGE_DIR}/templates/configs/.env.example" .
cp "${STARTUP_PACKAGE_DIR}/templates/configs/next.config.js" .
cp "${STARTUP_PACKAGE_DIR}/templates/configs/tailwind.config.js" .

log_success "Fichiers de configuration copiés"

# =============================================================================
# 6. Créer la structure de dossiers
# =============================================================================

log_info "Création de la structure de dossiers..."

mkdir -p app/{api,\(public\),\(auth\),\(protected\)}
mkdir -p components/{ui,features,layout,providers}
mkdir -p lib/{db,services,api,hooks,utils,validations,constants}
mkdir -p types
mkdir -p config
mkdir -p public/{images,icons}
mkdir -p tests/{unit,integration,e2e}
mkdir -p docs

log_success "Structure de dossiers créée"

# =============================================================================
# 7. Créer les fichiers de base
# =============================================================================

log_info "Création des fichiers de base..."

# app/layout.tsx
cat > app/layout.tsx <<'EOF'
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'My App',
  description: 'Generated with startup-package',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
EOF

# app/page.tsx
cat > app/page.tsx <<'EOF'
export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold mb-4">Welcome to Your App</h1>
        <p className="text-xl">Built with Next.js 14 and startup-package</p>
      </div>
    </main>
  );
}
EOF

# app/globals.css
cat > app/globals.css <<'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
EOF

# lib/utils/cn.ts
mkdir -p lib/utils
cat > lib/utils/cn.ts <<'EOF'
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
EOF

# Add clsx and tailwind-merge
npm install clsx tailwind-merge --silent

# postcss.config.js
cat > postcss.config.js <<'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
EOF

# Copy templates
cp "${STARTUP_PACKAGE_DIR}/templates/checklists/PROJECT_PLAN_TEMPLATE.md" ./PROJECT_PLAN.md
cp "${STARTUP_PACKAGE_DIR}/templates/checklists/ARCHITECTURE_TEMPLATE.md" ./ARCHITECTURE.md

# README.md
cat > README.md <<EOF
# $PROJECT_NAME

> Généré avec [startup-package](../startup-package)

## Démarrage

\`\`\`bash
# Installer les dépendances
npm install

# Copier .env.example vers .env.local et remplir les valeurs
cp .env.example .env.local

# Lancer le serveur de développement
npm run dev
\`\`\`

Ouvrez [http://localhost:3000](http://localhost:3000) dans votre navigateur.

## Scripts Disponibles

- \`npm run dev\` - Démarrer le serveur de développement
- \`npm run build\` - Builder pour la production
- \`npm run start\` - Démarrer le serveur de production
- \`npm run lint\` - Vérifier le code avec ESLint
- \`npm run lint:fix\` - Corriger les erreurs ESLint automatiquement
- \`npm run format\` - Formater le code avec Prettier
- \`npm run type-check\` - Vérifier les types TypeScript

## Prochaines Étapes

1. ✅ Remplir \`PROJECT_PLAN.md\` avec votre vision et vos objectifs
2. ✅ Compléter \`ARCHITECTURE.md\` avec vos choix techniques
3. ✅ Copier \`.env.example\` vers \`.env.local\` et configurer vos variables
4. ✅ Commencer le développement en suivant \`startup-package/docs/02-DEVELOPMENT.md\`

## Documentation

Consultez le [startup-package](../startup-package) pour :
- Bonnes pratiques de développement
- Patterns et conventions
- Guides de déploiement
- Et plus encore !

## Stack Technique

- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript
- **Styling** : Tailwind CSS
- **Validation** : Zod
- **Forms** : React Hook Form

---

Bon développement ! 🚀
EOF

log_success "Fichiers de base créés"

echo ""

# =============================================================================
# 8. Initialiser Git
# =============================================================================

if [ "$GIT_AVAILABLE" = true ]; then
    log_info "Initialisation du repository Git..."

    git init
    git add .
    git commit -m "chore: initial commit with startup-package structure"

    log_success "Repository Git initialisé"
    echo ""
fi

# =============================================================================
# 9. Vérifications finales
# =============================================================================

log_info "Vérification de l'installation..."

# Type check
if npm run type-check --silent; then
    log_success "TypeScript: OK"
else
    log_warning "TypeScript: Quelques erreurs à corriger"
fi

# Linting
if npm run lint --silent; then
    log_success "ESLint: OK"
else
    log_warning "ESLint: Quelques erreurs à corriger"
fi

echo ""

# =============================================================================
# 10. Résumé
# =============================================================================

log_success "========================================="
log_success "✨ Projet initialisé avec succès !"
log_success "========================================="
echo ""
echo "📁 Projet : $PROJECT_NAME"
echo "📍 Emplacement : $(pwd)"
echo ""
echo "Prochaines étapes :"
echo ""
echo "  1. cd $PROJECT_NAME"
echo "  2. cp .env.example .env.local"
echo "  3. Éditer .env.local avec vos valeurs"
echo "  4. npm run dev"
echo ""
echo "📚 Documentation :"
echo "  - Planification : PROJECT_PLAN.md"
echo "  - Architecture : ARCHITECTURE.md"
echo "  - Guide complet : ../startup-package/README.md"
echo ""
log_success "Bon développement ! 🚀"
echo ""
