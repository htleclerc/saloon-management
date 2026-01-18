# Guide des Stratégies de Branches

> Choisir et implémenter la bonne stratégie de branches pour votre équipe

## Table des Matières

1. [Introduction](#introduction)
2. [GitFlow](#gitflow)
3. [Trunk-Based Development](#trunk-based-development)
4. [GitHub Flow](#github-flow)
5. [Comparaison](#comparaison)
6. [Conventions de Nommage](#conventions-de-nommage)
7. [Protection des Branches](#protection-des-branches)
8. [Automatisation](#automatisation)

---

## Introduction

### Pourquoi une Stratégie de Branches ?

```
Sans stratégie                    Avec stratégie
┌─────────────┐                  ┌─────────────┐
│   chaos     │                  │   main      │
│     │       │                  │     │       │
│   ──┼──     │                  │   ──┼───────│─── Release
│    ╱│╲      │                  │     │       │
│   ╱ │ ╲     │                  │   ──┼───────│─── Feature
│  ╱  │  ╲    │                  │     │       │
│ ╱   │   ╲   │                  │   ──┼───────│─── Hotfix
│     │       │                  │     │       │
└─────────────┘                  └─────────────┘
   Conflits                         Clarté
   Confusion                        Traçabilité
   Risques                          Sécurité
```

### Critères de Choix

| Critère | GitFlow | Trunk-Based | GitHub Flow |
|---------|---------|-------------|-------------|
| Taille équipe | > 5 | Toutes | < 10 |
| Fréquence releases | Planifiées | Continue | Continue |
| Maturité CI/CD | Moyenne | Haute | Moyenne |
| Complexité | Haute | Basse | Basse |
| Hotfixes | Dédiés | Trunk | main |

---

## GitFlow

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              GitFlow                                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  main     ●─────────────────●───────────────────●──────────────●────▶      │
│           │                 │                   │              │            │
│           │    ┌────────────┘                   │              │            │
│           │    │                                │              │            │
│  release  │    ●─────●──────●                   │    ●────●    │            │
│           │    │     │      │                   │    │    │    │            │
│           │    │     │      │                   │    │    │    │            │
│  develop  ●────●─────●──────●───────────────────●────●────●────●────▶      │
│           │    │     │      │                   │    │    │    │            │
│  feature  │    ●─────●      │                   ●────●    │    │            │
│           │         ╲       │                        ╲    │    │            │
│  hotfix   │          ╲      │                         ╲   ●────●            │
│           │           ╲     │                          ╲       │            │
│           ▼            ╲    ▼                           ╲      ▼            │
│                                                                              │
│  Branches:                                                                   │
│  - main: Production stable                                                  │
│  - develop: Intégration continue                                            │
│  - feature/*: Nouvelles fonctionnalités                                     │
│  - release/*: Préparation releases                                          │
│  - hotfix/*: Corrections urgentes                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Workflow Détaillé

#### 1. Feature Branch

```bash
# Créer une feature depuis develop
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# Développer...
git add .
git commit -m "feat: add login form"
git commit -m "feat: add JWT validation"

# Mettre à jour avec develop
git fetch origin develop
git rebase origin/develop

# Push et créer PR
git push -u origin feature/user-authentication
gh pr create --base develop --title "feat: user authentication"

# Après merge, supprimer la branche
git checkout develop
git pull
git branch -d feature/user-authentication
```

#### 2. Release Branch

```bash
# Créer une release depuis develop
git checkout develop
git pull origin develop
git checkout -b release/1.2.0

# Bumper la version
npm version minor --no-git-tag-version
git add package.json package-lock.json
git commit -m "chore: bump version to 1.2.0"

# Corrections de dernière minute
git commit -m "fix: typo in login page"

# Merger dans main ET develop
git checkout main
git merge --no-ff release/1.2.0
git tag -a v1.2.0 -m "Release 1.2.0"
git push origin main --tags

git checkout develop
git merge --no-ff release/1.2.0
git push origin develop

# Supprimer la branche release
git branch -d release/1.2.0
```

#### 3. Hotfix Branch

```bash
# Créer un hotfix depuis main
git checkout main
git pull origin main
git checkout -b hotfix/1.2.1

# Corriger le bug
git commit -m "fix: critical security vulnerability"

# Bumper le patch version
npm version patch --no-git-tag-version
git commit -am "chore: bump version to 1.2.1"

# Merger dans main ET develop
git checkout main
git merge --no-ff hotfix/1.2.1
git tag -a v1.2.1 -m "Hotfix 1.2.1"
git push origin main --tags

git checkout develop
git merge --no-ff hotfix/1.2.1
git push origin develop

git branch -d hotfix/1.2.1
```

### Scripts d'Automatisation GitFlow

```bash
#!/bin/bash
# scripts/gitflow.sh

set -e

case "$1" in
  feature-start)
    FEATURE_NAME=$2
    if [ -z "$FEATURE_NAME" ]; then
      echo "Usage: ./gitflow.sh feature-start <name>"
      exit 1
    fi
    git checkout develop
    git pull origin develop
    git checkout -b "feature/$FEATURE_NAME"
    echo "Created feature/$FEATURE_NAME from develop"
    ;;

  feature-finish)
    CURRENT_BRANCH=$(git branch --show-current)
    if [[ ! "$CURRENT_BRANCH" =~ ^feature/ ]]; then
      echo "Not on a feature branch"
      exit 1
    fi
    git fetch origin develop
    git rebase origin/develop
    git push -u origin "$CURRENT_BRANCH"
    gh pr create --base develop --fill
    ;;

  release-start)
    VERSION=$2
    if [ -z "$VERSION" ]; then
      echo "Usage: ./gitflow.sh release-start <version>"
      exit 1
    fi
    git checkout develop
    git pull origin develop
    git checkout -b "release/$VERSION"
    npm version "$VERSION" --no-git-tag-version
    git add package.json package-lock.json
    git commit -m "chore: bump version to $VERSION"
    echo "Created release/$VERSION"
    ;;

  release-finish)
    CURRENT_BRANCH=$(git branch --show-current)
    VERSION=${CURRENT_BRANCH#release/}

    git checkout main
    git merge --no-ff "$CURRENT_BRANCH" -m "Merge release/$VERSION"
    git tag -a "v$VERSION" -m "Release $VERSION"
    git push origin main --tags

    git checkout develop
    git merge --no-ff "$CURRENT_BRANCH" -m "Merge release/$VERSION back to develop"
    git push origin develop

    git branch -d "$CURRENT_BRANCH"
    echo "Finished release $VERSION"
    ;;

  hotfix-start)
    VERSION=$2
    if [ -z "$VERSION" ]; then
      echo "Usage: ./gitflow.sh hotfix-start <version>"
      exit 1
    fi
    git checkout main
    git pull origin main
    git checkout -b "hotfix/$VERSION"
    npm version "$VERSION" --no-git-tag-version
    git add package.json package-lock.json
    git commit -m "chore: bump version to $VERSION"
    echo "Created hotfix/$VERSION"
    ;;

  hotfix-finish)
    CURRENT_BRANCH=$(git branch --show-current)
    VERSION=${CURRENT_BRANCH#hotfix/}

    git checkout main
    git merge --no-ff "$CURRENT_BRANCH" -m "Merge hotfix/$VERSION"
    git tag -a "v$VERSION" -m "Hotfix $VERSION"
    git push origin main --tags

    git checkout develop
    git merge --no-ff "$CURRENT_BRANCH" -m "Merge hotfix/$VERSION to develop"
    git push origin develop

    git branch -d "$CURRENT_BRANCH"
    echo "Finished hotfix $VERSION"
    ;;

  *)
    echo "GitFlow helper script"
    echo ""
    echo "Commands:"
    echo "  feature-start <name>   Create feature branch"
    echo "  feature-finish         Create PR for feature"
    echo "  release-start <ver>    Create release branch"
    echo "  release-finish         Finish release"
    echo "  hotfix-start <ver>     Create hotfix branch"
    echo "  hotfix-finish          Finish hotfix"
    ;;
esac
```

---

## Trunk-Based Development

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Trunk-Based Development                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  main/trunk  ●────●────●────●────●────●────●────●────●────●────●────▶      │
│              │    │    │    │    │    │    │    │    │    │    │            │
│              │    ●    │    ●────●    │    ●    │    │    ●────●            │
│              │    │    │         │    │    │    │    │         │            │
│  short-lived │    └────┘         └────┘    └────┘    │         └────┘      │
│  branches    │                                       │                      │
│              │                                       │                      │
│  (< 1 jour)  └───────────────────────────────────────┘                      │
│                                                                              │
│  Principes:                                                                  │
│  - Commits directs sur trunk (petits changements)                           │
│  - Branches courtes (< 1 jour)                                              │
│  - Feature flags pour features incomplètes                                  │
│  - Déploiement continu                                                      │
│  - Tests automatisés obligatoires                                           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Workflow

```bash
# Petit changement : commit direct
git checkout main
git pull origin main
# ... faire le changement
git add .
git commit -m "fix: typo in header"
git push origin main

# Changement plus important : branche courte
git checkout main
git pull origin main
git checkout -b add-logout-button

# Développer (max 1 jour de travail)
git add .
git commit -m "feat: add logout button"

# Rebaser et merger rapidement
git fetch origin main
git rebase origin/main
git checkout main
git merge add-logout-button
git push origin main
git branch -d add-logout-button
```

### Feature Flags

```typescript
// lib/feature-flags.ts

interface FeatureFlags {
  newDashboard: boolean;
  betaSearch: boolean;
  experimentalEditor: boolean;
}

// Configuration par environnement
const flags: Record<string, FeatureFlags> = {
  development: {
    newDashboard: true,
    betaSearch: true,
    experimentalEditor: true,
  },
  staging: {
    newDashboard: true,
    betaSearch: true,
    experimentalEditor: false,
  },
  production: {
    newDashboard: false,  // Pas encore prêt
    betaSearch: true,     // En beta
    experimentalEditor: false,
  },
};

export function getFeatureFlags(): FeatureFlags {
  const env = process.env.NODE_ENV || 'development';
  return flags[env] || flags.development;
}

export function isFeatureEnabled(feature: keyof FeatureFlags): boolean {
  return getFeatureFlags()[feature];
}

// Hook React
export function useFeatureFlag(feature: keyof FeatureFlags): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(isFeatureEnabled(feature));
  }, [feature]);

  return enabled;
}
```

```tsx
// Utilisation dans les composants
function Dashboard() {
  const showNewDashboard = useFeatureFlag('newDashboard');

  return showNewDashboard ? <NewDashboard /> : <LegacyDashboard />;
}

// Ou avec un composant Feature
function Feature({
  flag,
  children,
  fallback = null,
}: {
  flag: keyof FeatureFlags;
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const enabled = useFeatureFlag(flag);
  return enabled ? <>{children}</> : <>{fallback}</>;
}

// Usage
<Feature flag="betaSearch" fallback={<OldSearch />}>
  <BetaSearch />
</Feature>
```

### Release Branches (optionnel)

```
┌─────────────────────────────────────────────────────────────────┐
│           Trunk-Based avec Release Branches                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  main       ●────●────●────●────●────●────●────●────●────▶     │
│             │              │              │                      │
│  release/   │    ●─────●   │    ●─────●   │                     │
│  1.0        │    │     │   │    │     │   │                     │
│             │    │  (hotfix)│    │  (hotfix)                    │
│             │    │         │    │         │                      │
│  release/   │              ●────●─────●   │                     │
│  1.1        │              │          │   │                     │
│             │              │    (hotfix)  │                     │
│             ▼              ▼              ▼                      │
│                                                                  │
│  - Release branches créées depuis main                          │
│  - Hotfixes appliqués sur release ET cherry-picked sur main    │
│  - Pas de merge retour vers main                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```bash
# Créer une release branch
git checkout main
git checkout -b release/1.0
git push -u origin release/1.0

# Hotfix sur la release
git checkout release/1.0
git commit -m "fix: critical bug"
git push origin release/1.0

# Cherry-pick sur main
git checkout main
git cherry-pick <commit-hash>
git push origin main
```

---

## GitHub Flow

### Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            GitHub Flow                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  main     ●─────────────●─────────────●─────────────●─────────────▶        │
│           │             │             │             │                        │
│           │    ●────●   │    ●────●   │             │                       │
│           │    │    │   │    │    │   │    ●────●   │                       │
│  feature  │    │    │   │    │    │   │    │    │   │    ●────●             │
│  branches │    └────┘   │    └────┘   │    └────┘   │    │    │             │
│           │      PR     │      PR     │      PR     │    └────┘             │
│           │             │             │             │      PR               │
│           ▼             ▼             ▼             ▼                        │
│                                                                              │
│  Workflow simple:                                                            │
│  1. Créer branche depuis main                                               │
│  2. Commiter les changements                                                │
│  3. Ouvrir Pull Request                                                     │
│  4. Review et discussion                                                    │
│  5. Déployer pour test (optionnel)                                          │
│  6. Merger dans main                                                        │
│  7. Déployer en production                                                  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Workflow Complet

```bash
# 1. Créer une branche
git checkout main
git pull origin main
git checkout -b feature/add-user-profile

# 2. Développer avec commits atomiques
git add src/components/UserProfile.tsx
git commit -m "feat: add UserProfile component"

git add src/api/user.ts
git commit -m "feat: add user API endpoints"

git add tests/user.test.ts
git commit -m "test: add user profile tests"

# 3. Push et créer PR
git push -u origin feature/add-user-profile

# Créer PR avec GitHub CLI
gh pr create \
  --title "feat: add user profile page" \
  --body "## Changes
- Add UserProfile component
- Add user API endpoints
- Add tests

## Testing
- [ ] Unit tests pass
- [ ] Manual testing done

Closes #123"

# 4. Après review, merger
gh pr merge --squash --delete-branch
```

### Automatisation GitHub Flow

```yaml
# .github/workflows/pr-workflow.yml
name: PR Workflow

on:
  pull_request:
    types: [opened, synchronize, reopened]

jobs:
  # Labeler automatique
  label:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/labeler@v4
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}

  # Assignation automatique
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: kentaro-m/auto-assign-action@v1.2.5
        with:
          configuration-path: '.github/auto-assign.yml'

  # Vérification du titre (Conventional Commits)
  title-check:
    runs-on: ubuntu-latest
    steps:
      - uses: amannn/action-semantic-pull-request@v5
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        with:
          types: |
            feat
            fix
            docs
            style
            refactor
            perf
            test
            build
            ci
            chore
            revert

  # Preview deployment
  preview:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Deploy Preview
        uses: amondnet/vercel-action@v25
        id: vercel-preview
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}

      - name: Comment Preview URL
        uses: actions/github-script@v7
        with:
          script: |
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: '🚀 Preview deployed: ${{ steps.vercel-preview.outputs.preview-url }}'
            })
```

---

## Comparaison

### Tableau Comparatif

| Aspect | GitFlow | Trunk-Based | GitHub Flow |
|--------|---------|-------------|-------------|
| **Complexité** | Haute | Basse | Moyenne |
| **Branches** | 5 types | 1 (+ courtes) | 2 types |
| **Releases** | Planifiées | Continues | Continues |
| **Hotfixes** | Dédiés | Via trunk | Via main |
| **CI/CD requis** | Recommandé | Obligatoire | Recommandé |
| **Feature flags** | Optionnel | Obligatoire | Optionnel |
| **Équipe** | Grande | Toutes | Petite/Moyenne |
| **Cycle release** | Semaines | Heures/Jours | Jours |

### Arbre de Décision

```
                    ┌─────────────────────┐
                    │ Quelle stratégie ?  │
                    └─────────┬───────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
    ┌─────────────────┐ ┌───────────┐ ┌─────────────────┐
    │ Releases        │ │ CI/CD     │ │ Équipe          │
    │ planifiées?     │ │ mature?   │ │ < 5 devs?       │
    └────────┬────────┘ └─────┬─────┘ └────────┬────────┘
             │                │                │
     Oui ────┼──── Non   Oui──┼──Non      Oui──┼──Non
             │                │                │
             ▼                ▼                ▼
    ┌─────────────┐   ┌─────────────┐  ┌─────────────┐
    │  GitFlow    │   │Trunk-Based │  │ GitHub Flow │
    └─────────────┘   └─────────────┘  └─────────────┘
```

### Quand Utiliser Quoi ?

**GitFlow** :
- Applications mobiles (releases via App Store)
- Logiciels packagés
- Équipes > 10 développeurs
- Clients nécessitant des versions spécifiques
- Cycles de release longs (semaines/mois)

**Trunk-Based** :
- SaaS avec déploiement continu
- Équipes DevOps matures
- Microservices
- Startups agiles
- Haute vélocité requise

**GitHub Flow** :
- Applications web
- Petites équipes
- Open source
- MVPs et prototypes
- Déploiement continu simple

---

## Conventions de Nommage

### Branches

```bash
# Format général
<type>/<ticket-id>-<description>

# Types de branches
feature/     # Nouvelles fonctionnalités
fix/         # Corrections de bugs
hotfix/      # Corrections urgentes
refactor/    # Refactoring
docs/        # Documentation
test/        # Tests
chore/       # Maintenance

# Exemples
feature/PROJ-123-user-authentication
fix/PROJ-456-login-error
hotfix/1.2.1-security-patch
refactor/PROJ-789-extract-services
docs/update-readme
test/PROJ-101-add-e2e-tests
```

### Commits (Conventional Commits)

```bash
# Format
<type>(<scope>): <description>

[optional body]

[optional footer(s)]

# Types
feat:     # Nouvelle fonctionnalité
fix:      # Correction de bug
docs:     # Documentation
style:    # Formatage (pas de changement de code)
refactor: # Refactoring
perf:     # Amélioration de performance
test:     # Ajout de tests
build:    # Changements de build
ci:       # Changements CI/CD
chore:    # Maintenance
revert:   # Revert d'un commit

# Exemples
feat(auth): add JWT token refresh
fix(api): handle null response in user endpoint
docs(readme): update installation instructions
refactor(hooks)!: rename useAuth to useAuthentication

BREAKING CHANGE: useAuth is now useAuthentication
```

### Validation Automatique

```json
// .commitlintrc.json
{
  "extends": ["@commitlint/config-conventional"],
  "rules": {
    "type-enum": [
      2,
      "always",
      ["feat", "fix", "docs", "style", "refactor", "perf", "test", "build", "ci", "chore", "revert"]
    ],
    "scope-case": [2, "always", "kebab-case"],
    "subject-case": [2, "never", ["start-case", "pascal-case", "upper-case"]],
    "subject-max-length": [2, "always", 72],
    "body-max-line-length": [2, "always", 100]
  }
}
```

```json
// package.json
{
  "scripts": {
    "prepare": "husky install"
  },
  "devDependencies": {
    "@commitlint/cli": "^18.0.0",
    "@commitlint/config-conventional": "^18.0.0",
    "husky": "^8.0.0"
  }
}
```

```bash
# .husky/commit-msg
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx --no -- commitlint --edit "$1"
```

---

## Protection des Branches

### GitHub Branch Protection

```yaml
# Configurer via Settings > Branches > Branch protection rules

# Règle pour main
branch: main
settings:
  require_pull_request:
    required_approving_review_count: 2
    dismiss_stale_reviews: true
    require_code_owner_reviews: true
    require_last_push_approval: true

  require_status_checks:
    strict: true  # Branche doit être à jour
    contexts:
      - "lint"
      - "test"
      - "build"
      - "security"

  require_conversation_resolution: true
  require_signed_commits: true
  require_linear_history: true

  restrictions:
    users: []
    teams: ["maintainers"]

  allow_force_pushes: false
  allow_deletions: false

# Règle pour develop (GitFlow)
branch: develop
settings:
  require_pull_request:
    required_approving_review_count: 1
  require_status_checks:
    contexts:
      - "lint"
      - "test"
```

### CODEOWNERS

```bash
# .github/CODEOWNERS

# Owners par défaut
*                       @team-leads

# Frontend
/src/components/        @frontend-team
/src/hooks/             @frontend-team
/src/styles/            @frontend-team @design-team

# Backend
/src/api/               @backend-team
/src/services/          @backend-team
/prisma/                @backend-team @dba-team

# Infrastructure
/.github/               @devops-team
/docker/                @devops-team
/k8s/                   @devops-team

# Sécurité (review obligatoire)
/src/auth/              @security-team
/src/lib/crypto/        @security-team
*.env*                  @security-team

# Documentation
/docs/                  @docs-team
*.md                    @docs-team
```

### GitLab Protected Branches

```yaml
# Via Settings > Repository > Protected Branches

main:
  allowed_to_push: []  # Personne
  allowed_to_merge:
    - Maintainers
  code_owner_approval_required: true

develop:
  allowed_to_push:
    - Developers
  allowed_to_merge:
    - Developers
    - Maintainers

release/*:
  allowed_to_push: []
  allowed_to_merge:
    - Maintainers
```

---

## Automatisation

### Auto-Merge

```yaml
# .github/workflows/auto-merge.yml
name: Auto Merge

on:
  pull_request:
    types: [labeled]

jobs:
  auto-merge:
    if: contains(github.event.pull_request.labels.*.name, 'auto-merge')
    runs-on: ubuntu-latest
    steps:
      - name: Enable auto-merge
        uses: peter-evans/enable-pull-request-automerge@v3
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          pull-request-number: ${{ github.event.pull_request.number }}
          merge-method: squash
```

### Stale Bot

```yaml
# .github/workflows/stale.yml
name: Stale

on:
  schedule:
    - cron: '0 0 * * *'

jobs:
  stale:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/stale@v9
        with:
          repo-token: ${{ secrets.GITHUB_TOKEN }}

          # PRs
          stale-pr-message: 'Cette PR est inactive depuis 14 jours. Elle sera fermée dans 7 jours sans activité.'
          days-before-pr-stale: 14
          days-before-pr-close: 7
          stale-pr-label: 'stale'

          # Issues
          stale-issue-message: 'Cette issue est inactive depuis 30 jours.'
          days-before-issue-stale: 30
          days-before-issue-close: 14
          stale-issue-label: 'stale'

          # Exemptions
          exempt-pr-labels: 'wip,blocked,dependencies'
          exempt-issue-labels: 'pinned,security'
```

### Release Automatique

```yaml
# .github/workflows/release.yml
name: Release

on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Semantic Release
        uses: cycjimmy/semantic-release-action@v4
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
        with:
          extra_plugins: |
            @semantic-release/changelog
            @semantic-release/git
```

```json
// .releaserc.json
{
  "branches": ["main"],
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "@semantic-release/changelog",
    ["@semantic-release/npm", { "npmPublish": false }],
    ["@semantic-release/git", {
      "assets": ["package.json", "CHANGELOG.md"],
      "message": "chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}"
    }],
    "@semantic-release/github"
  ]
}
```

---

## Conclusion

### Recommandations

1. **Commencez simple** : GitHub Flow pour la plupart des projets
2. **Évoluez si nécessaire** : Passez à Trunk-Based avec la maturité CI/CD
3. **GitFlow si vraiment nécessaire** : Applications mobiles, releases planifiées
4. **Automatisez tout** : Labels, merges, releases
5. **Protégez main** : Reviews obligatoires, checks passants

### Checklist

```markdown
## Configuration des Branches
- [ ] Stratégie choisie et documentée
- [ ] Protection de branches configurée
- [ ] CODEOWNERS en place
- [ ] Commitlint/Husky configuré
- [ ] Templates de PR créés

## Automatisation
- [ ] CI sur toutes les branches
- [ ] Checks obligatoires avant merge
- [ ] Auto-labeling configuré
- [ ] Stale bot activé
- [ ] Release automatique (semantic-release)

## Documentation
- [ ] Guide de contribution (CONTRIBUTING.md)
- [ ] Conventions documentées
- [ ] Workflow expliqué dans README
```
