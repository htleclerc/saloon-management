# Guide d'Intégration Antigravity

> Adapter le Startup Package pour les agents de développement IA (Antigravity, Claude Code, etc.)

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Configuration de l'Agent](#configuration-de-lagent)
3. [Structure du Projet](#structure-du-projet)
4. [Fichier d'Instructions (AGENT.md)](#fichier-dinstructions-agentmd)
5. [Workflow avec l'Agent](#workflow-avec-lagent)
6. [Prompts Optimisés](#prompts-optimisés)
7. [Intégration Nouveau Projet](#intégration-nouveau-projet)
8. [Intégration Projet Existant](#intégration-projet-existant)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## 1. Vue d'Ensemble

### Qu'est-ce qu'Antigravity ?

Antigravity est un agent de développement IA basé sur Claude qui peut :
- Comprendre et naviguer dans un codebase
- Écrire, modifier et refactorer du code
- Exécuter des commandes shell
- Gérer des tâches complexes de manière autonome
- Suivre des instructions contextuelles

### Pourquoi adapter le Startup Package ?

```
┌─────────────────────────────────────────────────────────────────────┐
│                    BÉNÉFICES DE L'INTÉGRATION                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐                     │
│  │   SANS PACKAGE     │  │   AVEC PACKAGE     │                     │
│  ├────────────────────┤  ├────────────────────┤                     │
│  │ • Instructions     │  │ • Instructions     │                     │
│  │   répétées à       │  │   chargées auto    │                     │
│  │   chaque session   │  │   via AGENT.md     │                     │
│  │                    │  │                    │                     │
│  │ • Incohérence      │  │ • Standards        │                     │
│  │   entre sessions   │  │   uniformes        │                     │
│  │                    │  │                    │                     │
│  │ • Oubli des        │  │ • Contexte         │                     │
│  │   conventions      │  │   persistant       │                     │
│  │                    │  │                    │                     │
│  │ • Réinvention      │  │ • Patterns         │                     │
│  │   constante        │  │   réutilisables    │                     │
│  └────────────────────┘  └────────────────────┘                     │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Compatibilité

| Agent | Compatible | Notes |
|-------|------------|-------|
| **Antigravity** | ✅ Oui | Agent principal ciblé |
| **Claude Code** | ✅ Oui | Via CLAUDE.md |
| **Cursor** | ✅ Oui | Via .cursorrules |
| **Aider** | ✅ Oui | Via .aider.conf.yml |
| **Continue** | ✅ Oui | Via .continuerc |
| **Cody** | ✅ Oui | Via cody.json |

---

## 2. Configuration de l'Agent

### 2.1 Structure des Fichiers de Configuration

```
mon-projet/
├── AGENT.md                    # Instructions principales (Antigravity)
├── CLAUDE.md                   # Instructions Claude Code (symlink vers AGENT.md)
├── .cursorrules                # Instructions Cursor (généré depuis AGENT.md)
├── .antigravity/               # Configuration spécifique Antigravity
│   ├── config.yml              # Configuration de l'agent
│   ├── prompts/                # Prompts personnalisés
│   │   ├── feature.md          # Template pour nouvelles features
│   │   ├── bugfix.md           # Template pour corrections
│   │   ├── refactor.md         # Template pour refactoring
│   │   └── review.md           # Template pour code review
│   └── memory/                 # Mémoire persistante
│       ├── decisions.md        # Décisions architecturales
│       └── context.md          # Contexte du projet
├── startup-package/            # Le package complet
│   ├── docs/                   # Documentation
│   └── templates/              # Templates
└── ...
```

### 2.2 Configuration Antigravity

```yaml
# .antigravity/config.yml
agent:
  name: "antigravity"
  model: "claude-sonnet-4-20250514"
  context_window: 200000

# Fichiers à toujours inclure dans le contexte
context:
  always_include:
    - "AGENT.md"
    - "package.json"
    - "tsconfig.json"

  # Patterns à exclure
  exclude:
    - "node_modules/**"
    - ".next/**"
    - "dist/**"
    - "coverage/**"
    - "*.lock"

# Comportements
behaviors:
  # Toujours utiliser TodoWrite pour les tâches complexes
  use_todo_list: true

  # Demander confirmation avant les actions destructives
  confirm_destructive: true

  # Créer des commits atomiques
  atomic_commits: true

  # Exécuter les tests après modification
  run_tests_after_change: true

# Outils autorisés
tools:
  allowed:
    - read
    - write
    - edit
    - bash
    - glob
    - grep
    - web_search
    - web_fetch

  restricted:
    - delete_file  # Demande confirmation
    - git_push     # Demande confirmation

# Templates de prompts
prompts:
  feature: ".antigravity/prompts/feature.md"
  bugfix: ".antigravity/prompts/bugfix.md"
  refactor: ".antigravity/prompts/refactor.md"

# Hooks
hooks:
  pre_commit:
    - "npm run lint"
    - "npm run type-check"
  post_commit:
    - "npm run test"
```

---

## 3. Structure du Projet

### 3.1 Structure Recommandée avec Agent

```
mon-projet/
├── AGENT.md                    # 📌 FICHIER PRINCIPAL - Instructions pour l'agent
├── README.md                   # Documentation publique
├── package.json
├── tsconfig.json
│
├── .antigravity/               # Configuration agent
│   ├── config.yml
│   ├── prompts/
│   └── memory/
│
├── startup-package/            # 📦 Package de référence
│   ├── README.md
│   ├── docs/
│   │   ├── 01-PLANNING.md
│   │   ├── 02-DEVELOPMENT.md
│   │   ├── devops/
│   │   ├── security/
│   │   ├── internationalization/
│   │   └── standards/
│   └── templates/
│       ├── components/
│       ├── configs/
│       └── devops/
│
├── src/                        # Code source
│   ├── domain/                 # Architecture hexagonale
│   ├── application/
│   ├── infrastructure/
│   └── presentation/
│
├── docs/                       # Documentation projet
│   ├── adr/                    # Architecture Decision Records
│   ├── api/                    # Documentation API
│   └── guides/                 # Guides utilisateur
│
└── tests/                      # Tests
    ├── unit/
    ├── integration/
    └── e2e/
```

### 3.2 Intégration du Startup Package

```bash
# Option 1: Copier le package dans le projet
cp -r /path/to/startup-package ./startup-package

# Option 2: Git submodule (recommandé pour les mises à jour)
git submodule add https://github.com/your-org/startup-package.git startup-package

# Option 3: Symlink (pour développement local)
ln -s /path/to/startup-package ./startup-package
```

---

## 4. Fichier d'Instructions (AGENT.md)

### 4.1 Template AGENT.md Complet

```markdown
# AGENT.md - Instructions pour l'Agent de Développement

> Ce fichier définit le contexte, les conventions et les bonnes pratiques pour ce projet.
> L'agent DOIT lire ce fichier au début de chaque session.

---

## 📋 Informations Projet

### Projet
- **Nom** : [Nom du projet]
- **Type** : [Web App / API / Mobile / etc.]
- **Stack** : [Next.js 14 / TypeScript / Tailwind CSS / etc.]
- **Statut** : [MVP / Production / Maintenance]

### Équipe
- **Tech Lead** : [Nom]
- **Développeurs** : [Nombre]
- **Méthodologie** : [Agile / Scrum / Kanban]

---

## 📚 Documentation de Référence

**TOUJOURS consulter ces fichiers avant de faire des modifications :**

1. **[startup-package/README.md](startup-package/README.md)** - Vue d'ensemble des bonnes pratiques
2. **[startup-package/docs/standards/ENTERPRISE_STANDARDS.md](startup-package/docs/standards/ENTERPRISE_STANDARDS.md)** - Standards enterprise
3. **[startup-package/docs/devops/CI_CD_GUIDE.md](startup-package/docs/devops/CI_CD_GUIDE.md)** - CI/CD et déploiement

### Documentation Spécifique au Projet
- **[docs/adr/](docs/adr/)** - Décisions architecturales
- **[docs/api/](docs/api/)** - Documentation API

---

## 🎯 Règles Impératives

### TOUJOURS
1. ✅ Utiliser TypeScript strict mode (`strict: true`)
2. ✅ Valider les inputs avec Zod
3. ✅ Écrire des tests pour le nouveau code
4. ✅ Utiliser `TodoWrite` pour les tâches complexes (> 3 étapes)
5. ✅ Faire des commits atomiques avec messages conventionnels
6. ✅ Respecter l'architecture hexagonale
7. ✅ Documenter les décisions importantes dans `docs/adr/`

### JAMAIS
1. ❌ Utiliser `any` en TypeScript
2. ❌ Committer des secrets ou credentials
3. ❌ Ignorer les erreurs TypeScript ou ESLint
4. ❌ Modifier le code sans comprendre le contexte
5. ❌ Créer des fichiers sans les rattacher à la structure existante
6. ❌ Push sur main/master directement

---

## 🛠️ Conventions de Code

### Nommage
| Type | Convention | Exemple |
|------|------------|---------|
| Variables | camelCase | `userName`, `isActive` |
| Constantes | UPPER_SNAKE | `API_URL`, `MAX_RETRIES` |
| Classes/Types | PascalCase | `UserService`, `ApiResponse` |
| Fichiers composants | PascalCase | `UserProfile.tsx` |
| Fichiers utils | camelCase | `formatDate.ts` |
| Fichiers tests | *.test.ts | `UserService.test.ts` |

### Structure des Composants
```tsx
// 1. Imports (groupés)
import { useState } from 'react';           // React
import { useQuery } from '@tanstack/query'; // Librairies externes
import { Button } from '@/components/ui';   // Composants internes
import { formatDate } from '@/lib/utils';   // Utils
import type { User } from '@/types';        // Types

// 2. Types/Interfaces
interface Props {
  user: User;
  onSave: (user: User) => void;
}

// 3. Composant
export function UserProfile({ user, onSave }: Props) {
  // 3.1 Hooks
  const [isEditing, setIsEditing] = useState(false);

  // 3.2 Handlers
  const handleSave = () => { ... };

  // 3.3 Render
  return ( ... );
}
```

### Git Commits
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: composant ou module concerné
Description: impératif, présent, minuscules

Exemples:
- feat(auth): add password reset functionality
- fix(api): handle null response from users endpoint
- refactor(hooks): extract useDebounce from useSearch
```

---

## 🏗️ Architecture

### Architecture Hexagonale
```
src/
├── domain/           # Cœur métier (0 dépendance externe)
│   ├── entities/     # Entités métier
│   ├── value-objects/# Value Objects
│   ├── services/     # Services domaine
│   └── repositories/ # Interfaces (ports)
│
├── application/      # Use Cases
│   ├── commands/     # Actions d'écriture
│   ├── queries/      # Actions de lecture
│   └── dto/          # Data Transfer Objects
│
├── infrastructure/   # Implémentations techniques
│   ├── api/          # Clients API
│   ├── database/     # Repositories concrets
│   └── external/     # Services externes
│
└── presentation/     # UI (React/Next.js)
    ├── app/          # Pages Next.js
    ├── components/   # Composants React
    └── hooks/        # Hooks personnalisés
```

### Règles de Dépendances
```
presentation → application → domain ← infrastructure
                    ↓
              domain NE DÉPEND DE RIEN
```

---

## 🔧 Commandes Disponibles

```bash
# Développement
npm run dev          # Serveur de développement
npm run build        # Build production
npm run start        # Démarrer en production

# Qualité
npm run lint         # ESLint
npm run lint:fix     # ESLint avec correction
npm run type-check   # Vérification TypeScript
npm run format       # Prettier

# Tests
npm run test         # Tests unitaires
npm run test:watch   # Tests en mode watch
npm run test:cov     # Tests avec couverture
npm run test:e2e     # Tests E2E (Playwright)

# Base de données
npm run db:generate  # Générer client Prisma
npm run db:migrate   # Appliquer migrations
npm run db:seed      # Peupler la base
npm run db:studio    # Interface Prisma Studio
```

---

## 📝 Workflow de Développement

### Pour une Nouvelle Feature
```
1. Créer une branche: git checkout -b feature/nom-feature
2. Lire la documentation pertinente dans startup-package/
3. Utiliser TodoWrite pour planifier les étapes
4. Implémenter en suivant l'architecture hexagonale
5. Écrire les tests
6. Vérifier: npm run lint && npm run type-check && npm run test
7. Commit avec message conventionnel
8. Créer une PR
```

### Pour un Bug Fix
```
1. Créer une branche: git checkout -b fix/description-bug
2. Reproduire le bug
3. Écrire un test qui échoue
4. Corriger le bug
5. Vérifier que le test passe
6. Commit et PR
```

---

## ⚠️ Points d'Attention Spécifiques

### Sécurité
- Voir [startup-package/docs/security/](startup-package/docs/security/)
- Toujours valider les inputs utilisateur
- Ne jamais exposer de données sensibles dans les logs
- Utiliser les variables d'environnement pour les secrets

### Performance
- Voir [startup-package/docs/05-PERFORMANCE.md](startup-package/docs/05-PERFORMANCE.md)
- Lazy loading pour les composants lourds
- Optimiser les images avec next/image
- Utiliser React.memo pour les composants purs

### Accessibilité
- Attributs ARIA appropriés
- Navigation clavier fonctionnelle
- Contraste suffisant (WCAG AA)

---

## 🔗 Liens Utiles

- **Startup Package** : [startup-package/README.md](startup-package/README.md)
- **Standards Enterprise** : [startup-package/docs/standards/ENTERPRISE_STANDARDS.md](startup-package/docs/standards/ENTERPRISE_STANDARDS.md)
- **CI/CD** : [startup-package/docs/devops/CI_CD_GUIDE.md](startup-package/docs/devops/CI_CD_GUIDE.md)
- **i18n** : [startup-package/docs/internationalization/I18N_GUIDE.md](startup-package/docs/internationalization/I18N_GUIDE.md)

---

**Dernière mise à jour** : [DATE]
**Version** : 1.0
```

### 4.2 Génération Automatique du AGENT.md

```bash
#!/bin/bash
# scripts/generate-agent-md.sh

# Génère le AGENT.md à partir du template et des infos projet

cat > AGENT.md << 'EOF'
# AGENT.md - Instructions pour l'Agent de Développement

> Ce fichier est généré automatiquement. Modifier le template dans scripts/agent-template.md

EOF

# Ajouter les infos du package.json
echo "## Projet" >> AGENT.md
echo "" >> AGENT.md
echo "- **Nom** : $(jq -r '.name' package.json)" >> AGENT.md
echo "- **Version** : $(jq -r '.version' package.json)" >> AGENT.md
echo "- **Description** : $(jq -r '.description' package.json)" >> AGENT.md
echo "" >> AGENT.md

# Ajouter le reste du template
cat scripts/agent-template.md >> AGENT.md

echo "✅ AGENT.md généré avec succès"
```

---

## 5. Workflow avec l'Agent

### 5.1 Démarrage de Session

```
┌─────────────────────────────────────────────────────────────────────┐
│                    WORKFLOW SESSION ANTIGRAVITY                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. INITIALISATION                                                  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ L'agent lit automatiquement:                                  │  │
│  │ • AGENT.md (instructions principales)                        │  │
│  │ • package.json (dépendances, scripts)                        │  │
│  │ • tsconfig.json (configuration TypeScript)                   │  │
│  │ • .antigravity/config.yml (configuration agent)              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  2. COMPRÉHENSION DU CONTEXTE                                       │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ L'agent comprend:                                             │  │
│  │ • La stack technique                                         │  │
│  │ • Les conventions de code                                    │  │
│  │ • L'architecture du projet                                   │  │
│  │ • Les commandes disponibles                                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              ▼                                       │
│  3. EXÉCUTION DES TÂCHES                                            │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ Pour chaque tâche:                                            │  │
│  │ 1. TodoWrite pour planifier                                  │  │
│  │ 2. Lecture du code existant                                  │  │
│  │ 3. Consultation de startup-package/ si besoin               │  │
│  │ 4. Implémentation incrémentale                               │  │
│  │ 5. Tests et validation                                       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Commandes Courantes

```bash
# Démarrer une session avec contexte
antigravity start --context AGENT.md

# Exécuter une tâche spécifique
antigravity run "Ajouter l'authentification OAuth"

# Utiliser un prompt template
antigravity run --template feature "Ajouter le tableau de bord"

# Review de code
antigravity review --files "src/**/*.ts"

# Générer de la documentation
antigravity doc --output docs/api/
```

---

## 6. Prompts Optimisés

### 6.1 Template Feature

```markdown
<!-- .antigravity/prompts/feature.md -->
# Nouvelle Feature: {{FEATURE_NAME}}

## Contexte
Je veux ajouter la feature suivante: {{DESCRIPTION}}

## Instructions
1. Consulte d'abord AGENT.md pour les conventions
2. Consulte startup-package/docs/ pour les best practices pertinentes
3. Utilise TodoWrite pour planifier les étapes
4. Respecte l'architecture hexagonale (domain → application → infrastructure → presentation)
5. Écris les tests appropriés
6. Fais des commits atomiques

## Critères d'acceptation
- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}
- [ ] Tests unitaires passent
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de warnings ESLint
```

### 6.2 Template Bugfix

```markdown
<!-- .antigravity/prompts/bugfix.md -->
# Correction Bug: {{BUG_DESCRIPTION}}

## Symptôme
{{SYMPTOM_DESCRIPTION}}

## Étapes de reproduction
1. {{STEP_1}}
2. {{STEP_2}}

## Instructions
1. Reproduis d'abord le bug
2. Écris un test qui échoue (TDD)
3. Corrige le bug
4. Vérifie que le test passe
5. Vérifie qu'aucune régression n'a été introduite

## Commit
fix({{SCOPE}}): {{DESCRIPTION}}
```

### 6.3 Template Refactoring

```markdown
<!-- .antigravity/prompts/refactor.md -->
# Refactoring: {{REFACTOR_NAME}}

## Objectif
{{OBJECTIVE}}

## Fichiers concernés
- {{FILE_1}}
- {{FILE_2}}

## Instructions
1. Assure-toi que tous les tests passent AVANT le refactoring
2. Fais des changements incrémentaux
3. Lance les tests après chaque modification
4. Aucun changement de comportement (seulement structure)
5. Documente les changements significatifs

## Checklist
- [ ] Tests passent avant refactoring
- [ ] Changements incrémentaux commités
- [ ] Tests passent après chaque étape
- [ ] Comportement identique
- [ ] Code plus lisible/maintenable
```

---

## 7. Intégration Nouveau Projet

### 7.1 Script d'Initialisation

```bash
#!/bin/bash
# scripts/init-project.sh

set -e

PROJECT_NAME=$1
TEMPLATE=${2:-"nextjs"}

echo "🚀 Initialisation du projet: $PROJECT_NAME"

# 1. Créer le projet
if [ "$TEMPLATE" == "nextjs" ]; then
  npx create-next-app@latest $PROJECT_NAME --typescript --tailwind --eslint --app --src-dir
fi

cd $PROJECT_NAME

# 2. Cloner le startup-package
echo "📦 Ajout du startup-package..."
git submodule add https://github.com/your-org/startup-package.git startup-package

# 3. Créer la structure Antigravity
echo "🤖 Configuration Antigravity..."
mkdir -p .antigravity/{prompts,memory}

# 4. Copier les templates
cp startup-package/templates/agents/config.yml .antigravity/
cp startup-package/templates/agents/prompts/*.md .antigravity/prompts/

# 5. Générer AGENT.md
cat > AGENT.md << EOF
# AGENT.md - Instructions pour l'Agent de Développement

## Projet: $PROJECT_NAME

Consulte [startup-package/README.md](startup-package/README.md) pour les bonnes pratiques.

## Stack
- Next.js 14 (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Prisma ORM

## Commandes
\`\`\`bash
npm run dev      # Développement
npm run build    # Build
npm run lint     # Linting
npm run test     # Tests
\`\`\`

## Documentation
- startup-package/docs/01-PLANNING.md
- startup-package/docs/standards/ENTERPRISE_STANDARDS.md
EOF

# 6. Créer le symlink CLAUDE.md
ln -s AGENT.md CLAUDE.md

# 7. Mettre à jour .gitignore
echo "" >> .gitignore
echo "# Antigravity" >> .gitignore
echo ".antigravity/memory/" >> .gitignore

# 8. Installer les dépendances additionnelles
npm install zod @hookform/resolvers react-hook-form

# 9. Configurer ESLint strict
cat > .eslintrc.json << 'EOF'
{
  "extends": ["next/core-web-vitals", "next/typescript"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
EOF

echo "✅ Projet $PROJECT_NAME initialisé avec succès!"
echo ""
echo "Prochaines étapes:"
echo "1. cd $PROJECT_NAME"
echo "2. Personnaliser AGENT.md"
echo "3. Lancer: antigravity start"
```

### 7.2 Utilisation

```bash
# Créer un nouveau projet
./scripts/init-project.sh mon-super-projet nextjs

# Résultat
mon-super-projet/
├── AGENT.md              # ✅ Créé
├── CLAUDE.md             # ✅ Symlink vers AGENT.md
├── startup-package/      # ✅ Submodule
├── .antigravity/         # ✅ Configuration
│   ├── config.yml
│   └── prompts/
├── src/
│   └── app/
└── ...
```

---

## 8. Intégration Projet Existant

### 8.1 Script de Migration

```bash
#!/bin/bash
# scripts/migrate-to-antigravity.sh

set -e

echo "🔄 Migration vers Antigravity..."

# 1. Vérifier qu'on est dans un projet
if [ ! -f "package.json" ]; then
  echo "❌ Erreur: package.json non trouvé. Êtes-vous dans un projet?"
  exit 1
fi

# 2. Ajouter le startup-package
if [ ! -d "startup-package" ]; then
  echo "📦 Ajout du startup-package..."
  git submodule add https://github.com/your-org/startup-package.git startup-package
fi

# 3. Créer la structure Antigravity
echo "🤖 Création de la structure Antigravity..."
mkdir -p .antigravity/{prompts,memory}

# 4. Copier les templates
cp startup-package/templates/agents/config.yml .antigravity/
cp startup-package/templates/agents/prompts/*.md .antigravity/prompts/

# 5. Analyser le projet existant
echo "🔍 Analyse du projet..."

PROJECT_NAME=$(jq -r '.name' package.json)
HAS_TYPESCRIPT=$([ -f "tsconfig.json" ] && echo "true" || echo "false")
HAS_NEXT=$(jq -r '.dependencies.next // empty' package.json)
HAS_REACT=$(jq -r '.dependencies.react // empty' package.json)
HAS_PRISMA=$(jq -r '.dependencies.prisma // .devDependencies.prisma // empty' package.json)

# 6. Générer AGENT.md basé sur l'analyse
echo "📝 Génération de AGENT.md..."

cat > AGENT.md << EOF
# AGENT.md - Instructions pour l'Agent de Développement

## Projet: $PROJECT_NAME

> Ce fichier a été généré automatiquement. Personnalisez-le selon vos besoins.

---

## 📋 Stack Technique

$([ -n "$HAS_NEXT" ] && echo "- **Framework**: Next.js")
$([ -n "$HAS_REACT" ] && echo "- **UI**: React")
$([ "$HAS_TYPESCRIPT" == "true" ] && echo "- **Langage**: TypeScript")
$([ -n "$HAS_PRISMA" ] && echo "- **ORM**: Prisma")

---

## 📚 Documentation de Référence

Consulte [startup-package/README.md](startup-package/README.md) pour les bonnes pratiques.

### Guides Essentiels
- [startup-package/docs/standards/ENTERPRISE_STANDARDS.md](startup-package/docs/standards/ENTERPRISE_STANDARDS.md)
- [startup-package/docs/devops/CI_CD_GUIDE.md](startup-package/docs/devops/CI_CD_GUIDE.md)

---

## 🛠️ Commandes Disponibles

\`\`\`bash
$(jq -r '.scripts | to_entries | map("npm run \(.key)  # \(.value)") | .[]' package.json | head -10)
\`\`\`

---

## ⚠️ Points d'Attention

### Structure Existante
Respecte la structure actuelle du projet. Ne pas réorganiser sans discussion préalable.

### Conventions
- Maintenir la cohérence avec le code existant
- Consulter les fichiers similaires avant de créer du nouveau code
- Utiliser les patterns déjà en place

---

**Généré le**: $(date)
**À personnaliser**: Oui
EOF

# 7. Créer CLAUDE.md si n'existe pas
if [ ! -f "CLAUDE.md" ]; then
  ln -s AGENT.md CLAUDE.md
fi

# 8. Mettre à jour .gitignore
if ! grep -q ".antigravity/memory" .gitignore 2>/dev/null; then
  echo "" >> .gitignore
  echo "# Antigravity" >> .gitignore
  echo ".antigravity/memory/" >> .gitignore
fi

# 9. Commit initial
git add .
git commit -m "chore: add Antigravity configuration and startup-package"

echo ""
echo "✅ Migration terminée!"
echo ""
echo "Fichiers créés:"
echo "  - AGENT.md (à personnaliser)"
echo "  - CLAUDE.md (symlink)"
echo "  - .antigravity/ (configuration)"
echo "  - startup-package/ (submodule)"
echo ""
echo "Prochaines étapes:"
echo "1. Personnaliser AGENT.md avec les spécificités de votre projet"
echo "2. Documenter l'architecture actuelle"
echo "3. Lancer: antigravity start"
```

### 8.2 Personnalisation Post-Migration

```markdown
## Checklist Post-Migration

### 1. Personnaliser AGENT.md
- [ ] Décrire l'architecture actuelle
- [ ] Lister les conventions spécifiques
- [ ] Documenter les patterns utilisés
- [ ] Ajouter les commandes personnalisées

### 2. Documenter les Décisions
- [ ] Créer docs/adr/ pour les ADRs
- [ ] Documenter les choix techniques majeurs
- [ ] Expliquer les exceptions aux standards

### 3. Configurer les Prompts
- [ ] Adapter .antigravity/prompts/feature.md
- [ ] Adapter .antigravity/prompts/bugfix.md
- [ ] Créer des prompts spécifiques au projet

### 4. Tester l'Intégration
- [ ] Lancer une session Antigravity
- [ ] Tester une modification simple
- [ ] Vérifier que les conventions sont respectées
```

---

## 9. Best Practices

### 9.1 Optimisation du Contexte

```yaml
# .antigravity/config.yml

context:
  # Limiter le contexte pour éviter la surcharge
  max_files: 20
  max_file_size: 50000  # 50KB

  # Priorité des fichiers
  priority:
    high:
      - "AGENT.md"
      - "src/domain/**/*.ts"
      - "src/application/**/*.ts"
    medium:
      - "src/infrastructure/**/*.ts"
      - "src/presentation/components/**/*.tsx"
    low:
      - "tests/**/*.ts"
      - "docs/**/*.md"
```

### 9.2 Mémoire Persistante

```markdown
<!-- .antigravity/memory/decisions.md -->
# Décisions de Session

## 2024-01-15
- Décidé d'utiliser Zustand au lieu de Redux pour le state management
- Raison: Plus simple, moins de boilerplate

## 2024-01-10
- Migré de REST à tRPC pour l'API
- Raison: Type-safety end-to-end
```

```markdown
<!-- .antigravity/memory/context.md -->
# Contexte du Projet

## Particularités
- Le module de paiement utilise une API legacy (voir docs/legacy-api.md)
- Les tests E2E doivent tourner sur Chromium uniquement (problème Safari)

## En cours
- Migration vers Next.js 15
- Refactoring du module authentification
```

### 9.3 Hooks Automatiques

```yaml
# .antigravity/config.yml

hooks:
  # Avant chaque commit
  pre_commit:
    - "npm run lint:fix"
    - "npm run format"
    - "npm run type-check"

  # Après chaque commit
  post_commit:
    - "npm run test -- --changed"

  # Avant création de PR
  pre_pr:
    - "npm run test:all"
    - "npm run build"

  # Après modification de fichier
  on_file_change:
    patterns:
      "*.test.ts": "npm run test -- --findRelatedTests {file}"
      "prisma/schema.prisma": "npm run db:generate"
```

---

## 10. Troubleshooting

### Problèmes Courants

#### L'agent ne lit pas AGENT.md
```bash
# Vérifier que le fichier existe
ls -la AGENT.md

# Vérifier le contenu
head -20 AGENT.md

# Forcer le rechargement
antigravity reload --context
```

#### L'agent ignore les conventions
```markdown
<!-- Ajouter dans AGENT.md -->
## ⚠️ RAPPEL IMPORTANT

À CHAQUE modification de code:
1. Vérifier les conventions de nommage ci-dessus
2. Consulter un fichier similaire existant
3. Suivre le même pattern
```

#### Contexte trop volumineux
```yaml
# .antigravity/config.yml
context:
  # Réduire le nombre de fichiers
  max_files: 10

  # Exclure plus de patterns
  exclude:
    - "**/*.test.ts"
    - "**/*.spec.ts"
    - "**/__tests__/**"
    - "**/fixtures/**"
    - "docs/**"
```

#### L'agent ne trouve pas le startup-package
```bash
# Vérifier le submodule
git submodule status

# Initialiser si nécessaire
git submodule update --init --recursive
```

---

## 📚 Ressources

### Documentation
- [Startup Package README](../README.md)
- [Enterprise Standards](standards/ENTERPRISE_STANDARDS.md)
- [CI/CD Guide](devops/CI_CD_GUIDE.md)

### Templates
- [AGENT.md Template](../../templates/agents/AGENT.md.template)
- [Prompts Templates](../../templates/agents/prompts/)
- [Config Template](../../templates/agents/config.yml)

---

**Dernière mise à jour** : 2026-01-18
