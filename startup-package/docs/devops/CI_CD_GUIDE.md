# Guide CI/CD Complet

> Automatisation de l'intégration continue et du déploiement continu

## Table des Matières

1. [Introduction](#introduction)
2. [Concepts Fondamentaux](#concepts-fondamentaux)
3. [GitHub Actions](#github-actions)
4. [GitLab CI/CD](#gitlab-cicd)
5. [Stratégies de Déploiement](#stratégies-de-déploiement)
6. [Environnements](#environnements)
7. [Secrets et Variables](#secrets-et-variables)
8. [Qualité et Gates](#qualité-et-gates)
9. [Monitoring et Alertes](#monitoring-et-alertes)
10. [Rollback](#rollback)
11. [Best Practices](#best-practices)

---

## Introduction

### Qu'est-ce que CI/CD ?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CI/CD Pipeline                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌────────┐│
│  │  Code    │───▶│  Build   │───▶│  Test    │───▶│  Deploy  │───▶│ Monitor││
│  │  Push    │    │          │    │          │    │          │    │        ││
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘    └────────┘│
│       │              │               │               │              │       │
│       ▼              ▼               ▼               ▼              ▼       │
│   Trigger        Compile         Unit Tests      Staging        Metrics    │
│   Webhook        Lint            Integration     Production     Logs       │
│                  Type Check      E2E             Rollback       Alerts     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**CI (Continuous Integration)** :
- Intégration automatique du code à chaque commit
- Build, lint, tests automatiques
- Feedback rapide aux développeurs

**CD (Continuous Delivery/Deployment)** :
- **Delivery** : Déploiement automatisé jusqu'au staging, manuel pour prod
- **Deployment** : Déploiement automatisé jusqu'en production

### Objectifs

1. **Automatisation** : Éliminer les tâches manuelles répétitives
2. **Qualité** : Détecter les bugs le plus tôt possible
3. **Rapidité** : Réduire le temps entre le code et la production
4. **Fiabilité** : Déploiements reproductibles et réversibles
5. **Collaboration** : Feedback rapide pour toute l'équipe

---

## Concepts Fondamentaux

### Pipeline

```yaml
# Structure d'un pipeline
pipeline:
  stages:
    - build      # Compilation, bundling
    - test       # Tests unitaires, intégration
    - security   # Scan de vulnérabilités
    - deploy     # Déploiement
    - verify     # Smoke tests, monitoring
```

### Jobs et Stages

```
┌─────────────────────────────────────────────────────────────────┐
│                         Pipeline                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Stage: Build          Stage: Test           Stage: Deploy      │
│  ┌────────────┐       ┌────────────┐        ┌────────────┐     │
│  │ Job: build │       │ Job: unit  │        │Job: staging│     │
│  └────────────┘       └────────────┘        └────────────┘     │
│  ┌────────────┐       ┌────────────┐        ┌────────────┐     │
│  │ Job: lint  │       │Job: e2e    │        │Job: prod   │     │
│  └────────────┘       └────────────┘        └────────────┘     │
│                       ┌────────────┐                            │
│                       │Job: security│                           │
│                       └────────────┘                            │
│                                                                  │
│  ◄── Parallèle ──►   ◄── Parallèle ──►     ◄── Séquentiel ──►  │
└─────────────────────────────────────────────────────────────────┘
```

### Artifacts et Cache

```yaml
# Artifacts : fichiers générés à conserver
artifacts:
  - build/
  - coverage/
  - test-results/

# Cache : fichiers à réutiliser entre builds
cache:
  - node_modules/
  - .next/cache/
```

---

## GitHub Actions

### Structure des Workflows

```
.github/
└── workflows/
    ├── ci.yml              # Tests sur chaque PR
    ├── cd.yml              # Déploiement
    ├── security.yml        # Scans de sécurité
    ├── release.yml         # Gestion des releases
    └── scheduled.yml       # Jobs planifiés
```

### Workflow CI Complet

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

# Permissions minimales
permissions:
  contents: read
  pull-requests: write
  checks: write

# Annuler les runs précédents sur la même branche
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  # ============================================================
  # JOB: Setup et Cache
  # ============================================================
  setup:
    name: Setup
    runs-on: ubuntu-latest
    outputs:
      cache-hit: ${{ steps.cache.outputs.cache-hit }}
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - name: Get pnpm store directory
        shell: bash
        run: |
          echo "STORE_PATH=$(pnpm store path --silent)" >> $GITHUB_ENV

      - name: Cache dependencies
        id: cache
        uses: actions/cache@v4
        with:
          path: ${{ env.STORE_PATH }}
          key: ${{ runner.os }}-pnpm-store-${{ hashFiles('**/pnpm-lock.yaml') }}
          restore-keys: |
            ${{ runner.os }}-pnpm-store-

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

  # ============================================================
  # JOB: Lint et Format
  # ============================================================
  lint:
    name: Lint & Format
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Run ESLint
        run: pnpm lint --format=json --output-file=eslint-report.json
        continue-on-error: true

      - name: Annotate ESLint results
        uses: ataylorme/eslint-annotate-action@v2
        if: always()
        with:
          report-json: 'eslint-report.json'

      - name: Check Prettier
        run: pnpm format:check

      - name: TypeScript Check
        run: pnpm type-check

  # ============================================================
  # JOB: Tests Unitaires
  # ============================================================
  unit-tests:
    name: Unit Tests
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Run Unit Tests
        run: pnpm test:unit --coverage --reporters=default --reporters=jest-junit
        env:
          JEST_JUNIT_OUTPUT_DIR: ./test-results

      - name: Upload Coverage
        uses: codecov/codecov-action@v4
        with:
          token: ${{ secrets.CODECOV_TOKEN }}
          files: ./coverage/lcov.info
          fail_ci_if_error: true

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: unit-test-results
          path: test-results/
          retention-days: 7

  # ============================================================
  # JOB: Tests d'Intégration
  # ============================================================
  integration-tests:
    name: Integration Tests
    needs: setup
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: test_db
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Setup Database
        run: pnpm db:push
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db

      - name: Run Integration Tests
        run: pnpm test:integration
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/test_db
          REDIS_URL: redis://localhost:6379

  # ============================================================
  # JOB: Tests E2E
  # ============================================================
  e2e-tests:
    name: E2E Tests
    needs: [lint, unit-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Install Playwright Browsers
        run: pnpm exec playwright install --with-deps chromium

      - name: Build Application
        run: pnpm build
        env:
          NEXT_PUBLIC_API_URL: http://localhost:3000

      - name: Run E2E Tests
        run: pnpm test:e2e
        env:
          CI: true

      - name: Upload Playwright Report
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      - name: Upload Screenshots
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: e2e-screenshots
          path: test-results/
          retention-days: 7

  # ============================================================
  # JOB: Build
  # ============================================================
  build:
    name: Build
    needs: [lint, unit-tests]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Build
        run: pnpm build
        env:
          NEXT_TELEMETRY_DISABLED: 1

      - name: Upload Build Artifact
        uses: actions/upload-artifact@v4
        with:
          name: build
          path: |
            .next/
            !.next/cache
          retention-days: 1

      - name: Analyze Bundle
        run: pnpm analyze
        if: github.event_name == 'pull_request'
        continue-on-error: true

  # ============================================================
  # JOB: Security Scan
  # ============================================================
  security:
    name: Security Scan
    needs: setup
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Run Trivy vulnerability scanner
        uses: aquasecurity/trivy-action@master
        with:
          scan-type: 'fs'
          scan-ref: '.'
          format: 'sarif'
          output: 'trivy-results.sarif'
          severity: 'CRITICAL,HIGH'

      - name: Upload Trivy scan results
        uses: github/codeql-action/upload-sarif@v3
        if: always()
        with:
          sarif_file: 'trivy-results.sarif'

      - name: Dependency Audit
        run: pnpm audit --audit-level=high
        continue-on-error: true

      - name: Check for secrets
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified

  # ============================================================
  # JOB: Quality Gate
  # ============================================================
  quality-gate:
    name: Quality Gate
    needs: [lint, unit-tests, integration-tests, e2e-tests, build, security]
    runs-on: ubuntu-latest
    if: always()
    steps:
      - name: Check all jobs status
        run: |
          if [[ "${{ needs.lint.result }}" != "success" ]] ||
             [[ "${{ needs.unit-tests.result }}" != "success" ]] ||
             [[ "${{ needs.build.result }}" != "success" ]]; then
            echo "Quality gate failed!"
            exit 1
          fi
          echo "Quality gate passed!"

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v7
        with:
          script: |
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const botComment = comments.find(comment =>
              comment.user.type === 'Bot' &&
              comment.body.includes('## CI Status')
            );

            const body = `## CI Status ✅

            | Check | Status |
            |-------|--------|
            | Lint | ${{ needs.lint.result == 'success' && '✅' || '❌' }} |
            | Unit Tests | ${{ needs.unit-tests.result == 'success' && '✅' || '❌' }} |
            | Integration | ${{ needs.integration-tests.result == 'success' && '✅' || '❌' }} |
            | E2E | ${{ needs.e2e-tests.result == 'success' && '✅' || '❌' }} |
            | Build | ${{ needs.build.result == 'success' && '✅' || '❌' }} |
            | Security | ${{ needs.security.result == 'success' && '✅' || '⚠️' }} |

            Ready to merge: ${{ needs.lint.result == 'success' && needs.unit-tests.result == 'success' && needs.build.result == 'success' && '✅ Yes' || '❌ No' }}
            `;

            if (botComment) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body: body
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body: body
              });
            }
```

### Workflow CD Complet

```yaml
# .github/workflows/cd.yml
name: CD Pipeline

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to deploy'
        required: true
        default: 'staging'
        type: choice
        options:
          - staging
          - production
      skip_tests:
        description: 'Skip tests (emergency deploy)'
        required: false
        default: false
        type: boolean

permissions:
  contents: read
  deployments: write
  id-token: write  # Pour OIDC avec cloud providers

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '8'

jobs:
  # ============================================================
  # JOB: Prepare
  # ============================================================
  prepare:
    name: Prepare Deployment
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.version.outputs.version }}
      environment: ${{ steps.env.outputs.environment }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Determine Version
        id: version
        run: |
          VERSION=$(git describe --tags --always --dirty)
          echo "version=$VERSION" >> $GITHUB_OUTPUT
          echo "Deploying version: $VERSION"

      - name: Determine Environment
        id: env
        run: |
          if [[ "${{ github.event_name }}" == "workflow_dispatch" ]]; then
            echo "environment=${{ inputs.environment }}" >> $GITHUB_OUTPUT
          elif [[ "${{ github.ref }}" == "refs/heads/main" ]]; then
            echo "environment=staging" >> $GITHUB_OUTPUT
          fi

  # ============================================================
  # JOB: Build Docker Image
  # ============================================================
  build:
    name: Build Docker Image
    needs: prepare
    runs-on: ubuntu-latest
    outputs:
      image: ${{ steps.build.outputs.image }}
    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/${{ github.repository }}
          tags: |
            type=sha,prefix=
            type=ref,event=branch
            type=semver,pattern={{version}}

      - name: Build and push
        id: build
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VERSION=${{ needs.prepare.outputs.version }}

      - name: Output image
        run: |
          echo "image=ghcr.io/${{ github.repository }}:${{ github.sha }}" >> $GITHUB_OUTPUT

  # ============================================================
  # JOB: Deploy Staging
  # ============================================================
  deploy-staging:
    name: Deploy to Staging
    needs: [prepare, build]
    if: needs.prepare.outputs.environment == 'staging'
    runs-on: ubuntu-latest
    environment:
      name: staging
      url: https://staging.example.com
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Vercel (Staging)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prebuilt'
          scope: ${{ secrets.VERCEL_ORG_ID }}

      # Alternative: Deploy to Kubernetes
      # - name: Deploy to K8s Staging
      #   uses: azure/k8s-deploy@v4
      #   with:
      #     manifests: |
      #       k8s/staging/deployment.yaml
      #       k8s/staging/service.yaml
      #     images: |
      #       ghcr.io/${{ github.repository }}:${{ github.sha }}
      #     namespace: staging

      - name: Wait for deployment
        run: sleep 30

      - name: Smoke Tests
        run: |
          response=$(curl -s -o /dev/null -w "%{http_code}" https://staging.example.com/api/health)
          if [ "$response" != "200" ]; then
            echo "Smoke test failed with status: $response"
            exit 1
          fi
          echo "Smoke test passed!"

      - name: Notify Slack
        if: always()
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          text: 'Staging deployment ${{ job.status }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
          fields: repo,message,commit,author,action,eventName,ref,workflow

  # ============================================================
  # JOB: E2E Tests on Staging
  # ============================================================
  e2e-staging:
    name: E2E Tests (Staging)
    needs: deploy-staging
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v2
        with:
          version: ${{ env.PNPM_VERSION }}

      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'

      - run: pnpm install --frozen-lockfile

      - name: Install Playwright
        run: pnpm exec playwright install --with-deps

      - name: Run E2E Tests
        run: pnpm test:e2e
        env:
          BASE_URL: https://staging.example.com

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: e2e-staging-results
          path: playwright-report/

  # ============================================================
  # JOB: Deploy Production
  # ============================================================
  deploy-production:
    name: Deploy to Production
    needs: [prepare, build, e2e-staging]
    if: needs.prepare.outputs.environment == 'production' || (github.event_name == 'push' && github.ref == 'refs/heads/main')
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://example.com
    steps:
      - uses: actions/checkout@v4

      # Approval automatique via GitHub Environment protection rules

      - name: Deploy to Vercel (Production)
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod --prebuilt'
          scope: ${{ secrets.VERCEL_ORG_ID }}

      - name: Create Sentry Release
        uses: getsentry/action-release@v1
        env:
          SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
          SENTRY_ORG: ${{ secrets.SENTRY_ORG }}
          SENTRY_PROJECT: ${{ secrets.SENTRY_PROJECT }}
        with:
          environment: production
          version: ${{ needs.prepare.outputs.version }}

      - name: Smoke Tests
        run: |
          for i in {1..5}; do
            response=$(curl -s -o /dev/null -w "%{http_code}" https://example.com/api/health)
            if [ "$response" == "200" ]; then
              echo "Production is healthy!"
              exit 0
            fi
            echo "Attempt $i failed, retrying in 10s..."
            sleep 10
          done
          echo "Production smoke tests failed!"
          exit 1

      - name: Tag Release
        run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git tag -a "v${{ needs.prepare.outputs.version }}" -m "Release v${{ needs.prepare.outputs.version }}"
          git push origin "v${{ needs.prepare.outputs.version }}"

      - name: Create GitHub Release
        uses: softprops/action-gh-release@v1
        with:
          tag_name: v${{ needs.prepare.outputs.version }}
          generate_release_notes: true

      - name: Notify Success
        uses: 8398a7/action-slack@v3
        with:
          status: success
          text: ':rocket: Production deployment successful! v${{ needs.prepare.outputs.version }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

      - name: Notify Failure
        if: failure()
        uses: 8398a7/action-slack@v3
        with:
          status: failure
          text: ':x: Production deployment FAILED! v${{ needs.prepare.outputs.version }}'
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}

  # ============================================================
  # JOB: Post-Deploy Verification
  # ============================================================
  verify:
    name: Post-Deploy Verification
    needs: deploy-production
    runs-on: ubuntu-latest
    steps:
      - name: Check Error Rate
        run: |
          # Intégration avec votre outil de monitoring
          # Exemple avec Datadog API
          echo "Checking error rate in production..."
          sleep 300  # Attendre 5 minutes
          # curl pour vérifier les métriques
          echo "Error rate is acceptable"

      - name: Rollback if needed
        if: failure()
        run: |
          echo "Error rate too high, triggering rollback..."
          # Déclencher le rollback workflow
```

### Workflow de Rollback

```yaml
# .github/workflows/rollback.yml
name: Rollback

on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Environment to rollback'
        required: true
        type: choice
        options:
          - staging
          - production
      version:
        description: 'Version to rollback to (leave empty for previous)'
        required: false
        type: string
      reason:
        description: 'Reason for rollback'
        required: true
        type: string

permissions:
  contents: read
  deployments: write

jobs:
  rollback:
    name: Rollback ${{ inputs.environment }}
    runs-on: ubuntu-latest
    environment: ${{ inputs.environment }}
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Determine rollback version
        id: version
        run: |
          if [[ -n "${{ inputs.version }}" ]]; then
            echo "version=${{ inputs.version }}" >> $GITHUB_OUTPUT
          else
            # Get previous deployment tag
            PREVIOUS=$(git tag --sort=-version:refname | head -2 | tail -1)
            echo "version=$PREVIOUS" >> $GITHUB_OUTPUT
          fi
          echo "Rolling back to: $(cat $GITHUB_OUTPUT | grep version)"

      - name: Checkout rollback version
        run: git checkout ${{ steps.version.outputs.version }}

      - name: Deploy rollback version
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '${{ inputs.environment == "production" && "--prod" || "" }}'

      - name: Verify rollback
        run: |
          URL=${{ inputs.environment == 'production' && 'https://example.com' || 'https://staging.example.com' }}
          response=$(curl -s -o /dev/null -w "%{http_code}" $URL/api/health)
          if [ "$response" != "200" ]; then
            echo "Rollback verification failed!"
            exit 1
          fi
          echo "Rollback successful!"

      - name: Create incident
        run: |
          echo "Creating incident record..."
          # Intégration avec PagerDuty, Opsgenie, etc.

      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              "text": ":warning: ROLLBACK executed",
              "attachments": [{
                "color": "warning",
                "fields": [
                  {"title": "Environment", "value": "${{ inputs.environment }}", "short": true},
                  {"title": "Version", "value": "${{ steps.version.outputs.version }}", "short": true},
                  {"title": "Reason", "value": "${{ inputs.reason }}", "short": false},
                  {"title": "Initiated by", "value": "${{ github.actor }}", "short": true}
                ]
              }]
            }
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

---

## GitLab CI/CD

### Configuration Complète

```yaml
# .gitlab-ci.yml

# Variables globales
variables:
  NODE_VERSION: "20"
  DOCKER_TLS_CERTDIR: "/certs"
  FF_USE_FASTZIP: "true"
  ARTIFACT_COMPRESSION_LEVEL: "fast"
  CACHE_COMPRESSION_LEVEL: "fast"

# Cache global
default:
  cache:
    key:
      files:
        - pnpm-lock.yaml
    paths:
      - node_modules/
      - .pnpm-store/
    policy: pull

# Stages
stages:
  - setup
  - validate
  - test
  - build
  - security
  - deploy-staging
  - verify-staging
  - deploy-production
  - verify-production

# Templates réutilisables
.node-setup:
  image: node:${NODE_VERSION}-alpine
  before_script:
    - corepack enable
    - corepack prepare pnpm@latest --activate
    - pnpm config set store-dir .pnpm-store
    - pnpm install --frozen-lockfile

.docker-setup:
  image: docker:24-dind
  services:
    - docker:24-dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY

# ============================================================
# STAGE: Setup
# ============================================================
install:
  stage: setup
  extends: .node-setup
  cache:
    key:
      files:
        - pnpm-lock.yaml
    paths:
      - node_modules/
      - .pnpm-store/
    policy: pull-push
  script:
    - pnpm install --frozen-lockfile
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ============================================================
# STAGE: Validate
# ============================================================
lint:
  stage: validate
  extends: .node-setup
  script:
    - pnpm lint
    - pnpm format:check
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  allow_failure: false

typecheck:
  stage: validate
  extends: .node-setup
  script:
    - pnpm type-check
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ============================================================
# STAGE: Test
# ============================================================
unit-tests:
  stage: test
  extends: .node-setup
  script:
    - pnpm test:unit --coverage
  coverage: '/All files[^|]*\|[^|]*\s+([\d\.]+)/'
  artifacts:
    when: always
    paths:
      - coverage/
    reports:
      junit: junit.xml
      coverage_report:
        coverage_format: cobertura
        path: coverage/cobertura-coverage.xml
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

integration-tests:
  stage: test
  extends: .node-setup
  services:
    - postgres:15
    - redis:7
  variables:
    POSTGRES_DB: test
    POSTGRES_USER: test
    POSTGRES_PASSWORD: test
    DATABASE_URL: postgresql://test:test@postgres:5432/test
    REDIS_URL: redis://redis:6379
  script:
    - pnpm db:push
    - pnpm test:integration
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

e2e-tests:
  stage: test
  extends: .node-setup
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  script:
    - pnpm build
    - pnpm test:e2e
  artifacts:
    when: on_failure
    paths:
      - playwright-report/
      - test-results/
    expire_in: 1 week
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ============================================================
# STAGE: Build
# ============================================================
build:
  stage: build
  extends: .node-setup
  script:
    - pnpm build
  artifacts:
    paths:
      - .next/
      - public/
    expire_in: 1 day
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

build-docker:
  stage: build
  extends: .docker-setup
  script:
    - docker build
        --cache-from $CI_REGISTRY_IMAGE:latest
        --tag $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
        --tag $CI_REGISTRY_IMAGE:latest
        .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
    - docker push $CI_REGISTRY_IMAGE:latest
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

# ============================================================
# STAGE: Security
# ============================================================
dependency-scan:
  stage: security
  extends: .node-setup
  script:
    - pnpm audit --audit-level=high
  allow_failure: true
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

sast:
  stage: security
  image:
    name: "returntocorp/semgrep"
    entrypoint: [""]
  script:
    - semgrep ci --sarif --output=gl-sast-report.sarif
  artifacts:
    reports:
      sast: gl-sast-report.sarif
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH

container-scan:
  stage: security
  image:
    name: aquasec/trivy:latest
    entrypoint: [""]
  script:
    - trivy image --exit-code 0 --severity HIGH,CRITICAL $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  needs:
    - build-docker

# ============================================================
# STAGE: Deploy Staging
# ============================================================
deploy-staging:
  stage: deploy-staging
  image: alpine:latest
  environment:
    name: staging
    url: https://staging.example.com
  before_script:
    - apk add --no-cache curl
  script:
    - |
      curl -X POST "$VERCEL_DEPLOY_HOOK_STAGING"
    # Ou déploiement Kubernetes
    # - kubectl set image deployment/app app=$CI_REGISTRY_IMAGE:$CI_COMMIT_SHA -n staging
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  needs:
    - build
    - build-docker

# ============================================================
# STAGE: Verify Staging
# ============================================================
smoke-test-staging:
  stage: verify-staging
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - |
      for i in $(seq 1 10); do
        response=$(curl -s -o /dev/null -w "%{http_code}" https://staging.example.com/api/health)
        if [ "$response" = "200" ]; then
          echo "Staging is healthy!"
          exit 0
        fi
        echo "Attempt $i failed, waiting..."
        sleep 10
      done
      exit 1
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  needs:
    - deploy-staging

e2e-staging:
  stage: verify-staging
  extends: .node-setup
  image: mcr.microsoft.com/playwright:v1.40.0-focal
  variables:
    BASE_URL: https://staging.example.com
  script:
    - pnpm test:e2e:smoke
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  needs:
    - smoke-test-staging

# ============================================================
# STAGE: Deploy Production
# ============================================================
deploy-production:
  stage: deploy-production
  image: alpine:latest
  environment:
    name: production
    url: https://example.com
  before_script:
    - apk add --no-cache curl
  script:
    - |
      curl -X POST "$VERCEL_DEPLOY_HOOK_PRODUCTION"
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
      when: manual
  needs:
    - e2e-staging

# ============================================================
# STAGE: Verify Production
# ============================================================
smoke-test-production:
  stage: verify-production
  image: alpine:latest
  before_script:
    - apk add --no-cache curl
  script:
    - |
      for i in $(seq 1 10); do
        response=$(curl -s -o /dev/null -w "%{http_code}" https://example.com/api/health)
        if [ "$response" = "200" ]; then
          echo "Production is healthy!"
          exit 0
        fi
        echo "Attempt $i failed, waiting..."
        sleep 10
      done
      exit 1
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
  needs:
    - deploy-production

create-release:
  stage: verify-production
  image: registry.gitlab.com/gitlab-org/release-cli:latest
  script:
    - echo "Creating release for $CI_COMMIT_TAG"
  release:
    tag_name: $CI_COMMIT_TAG
    description: 'Release $CI_COMMIT_TAG'
  rules:
    - if: $CI_COMMIT_TAG
  needs:
    - smoke-test-production
```

---

## Stratégies de Déploiement

### Blue-Green Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                    Blue-Green Deployment                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Load Balancer                                               │
│          │                                                       │
│          ├────────────────┐                                     │
│          │                │                                     │
│          ▼                ▼                                     │
│    ┌──────────┐    ┌──────────┐                                │
│    │  BLUE    │    │  GREEN   │                                │
│    │ (Active) │    │ (Idle)   │                                │
│    │  v1.0    │    │  v1.1    │                                │
│    └──────────┘    └──────────┘                                │
│                                                                  │
│  1. Deploy v1.1 to GREEN                                        │
│  2. Test GREEN                                                   │
│  3. Switch traffic to GREEN                                     │
│  4. BLUE becomes idle (rollback ready)                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```yaml
# Kubernetes Blue-Green
apiVersion: v1
kind: Service
metadata:
  name: app
spec:
  selector:
    app: myapp
    version: green  # Switch to blue for rollback
  ports:
    - port: 80
      targetPort: 3000

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-green
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
      version: green
  template:
    metadata:
      labels:
        app: myapp
        version: green
    spec:
      containers:
        - name: app
          image: myapp:v1.1
```

### Canary Deployment

```
┌─────────────────────────────────────────────────────────────────┐
│                     Canary Deployment                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│     Traffic: 100%                                               │
│          │                                                       │
│          ├─── 90% ──────────────────┐                          │
│          │                          │                           │
│          ├─── 10% ────┐             │                          │
│          │            │             │                           │
│          ▼            ▼             ▼                           │
│    ┌──────────┐  ┌──────────┐ ┌──────────┐                     │
│    │ Canary   │  │ Stable   │ │ Stable   │                     │
│    │  v1.1    │  │  v1.0    │ │  v1.0    │                     │
│    └──────────┘  └──────────┘ └──────────┘                     │
│                                                                  │
│  Progression: 10% → 25% → 50% → 100%                           │
│  Rollback automatique si erreurs > seuil                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

```yaml
# GitHub Actions - Canary Deployment
canary-deploy:
  name: Canary Deployment
  runs-on: ubuntu-latest
  steps:
    - name: Deploy Canary (10%)
      run: |
        kubectl set image deployment/app-canary app=$IMAGE
        kubectl scale deployment/app-canary --replicas=1
        kubectl scale deployment/app-stable --replicas=9

    - name: Monitor Canary (5 min)
      run: |
        for i in {1..30}; do
          ERROR_RATE=$(curl -s $PROMETHEUS_URL/api/v1/query \
            --data-urlencode 'query=rate(http_errors_total{version="canary"}[1m])' \
            | jq '.data.result[0].value[1]')

          if (( $(echo "$ERROR_RATE > 0.01" | bc -l) )); then
            echo "Error rate too high: $ERROR_RATE"
            exit 1
          fi
          sleep 10
        done

    - name: Promote to 50%
      run: |
        kubectl scale deployment/app-canary --replicas=5
        kubectl scale deployment/app-stable --replicas=5

    - name: Final promotion
      run: |
        kubectl scale deployment/app-canary --replicas=10
        kubectl scale deployment/app-stable --replicas=0
        kubectl set image deployment/app-stable app=$IMAGE
```

### Rolling Update

```yaml
# Kubernetes Rolling Update
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1      # Max 1 pod down at a time
      maxSurge: 2            # Max 2 extra pods during update
  template:
    spec:
      containers:
        - name: app
          image: myapp:v1.1
          readinessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          livenessProbe:
            httpGet:
              path: /health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
```

---

## Environnements

### Structure Multi-Environnement

```
┌─────────────────────────────────────────────────────────────────┐
│                    Environment Pipeline                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Developer     PR/Feature      Staging         Production       │
│  Local         Branch          Environment     Environment      │
│                                                                  │
│  ┌────────┐   ┌────────┐      ┌────────┐      ┌────────┐       │
│  │  Dev   │──▶│ Preview│─────▶│Staging │─────▶│  Prod  │       │
│  └────────┘   └────────┘      └────────┘      └────────┘       │
│                                                                  │
│  localhost    pr-123.app      staging.app     app.com          │
│  SQLite       PostgreSQL      PostgreSQL      PostgreSQL       │
│  Mock APIs    Real APIs       Real APIs       Real APIs        │
│  No Auth      Test Auth       Real Auth       Real Auth        │
│                                                                  │
│  Automatic    Automatic       Automatic       Manual/Auto      │
│  ─────────    ─────────       ─────────       ───────────      │
│  On save      On PR           On merge        On approval      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Configuration par Environnement

```typescript
// config/environments.ts

interface EnvironmentConfig {
  name: string;
  apiUrl: string;
  features: {
    analytics: boolean;
    debugMode: boolean;
    mockData: boolean;
  };
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    remote: boolean;
  };
}

const environments: Record<string, EnvironmentConfig> = {
  development: {
    name: 'development',
    apiUrl: 'http://localhost:3001',
    features: {
      analytics: false,
      debugMode: true,
      mockData: true,
    },
    logging: {
      level: 'debug',
      remote: false,
    },
  },

  preview: {
    name: 'preview',
    apiUrl: process.env.NEXT_PUBLIC_API_URL!,
    features: {
      analytics: false,
      debugMode: true,
      mockData: false,
    },
    logging: {
      level: 'debug',
      remote: true,
    },
  },

  staging: {
    name: 'staging',
    apiUrl: 'https://api.staging.example.com',
    features: {
      analytics: true,
      debugMode: true,
      mockData: false,
    },
    logging: {
      level: 'info',
      remote: true,
    },
  },

  production: {
    name: 'production',
    apiUrl: 'https://api.example.com',
    features: {
      analytics: true,
      debugMode: false,
      mockData: false,
    },
    logging: {
      level: 'warn',
      remote: true,
    },
  },
};

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.NEXT_PUBLIC_ENVIRONMENT || 'development';
  return environments[env] || environments.development;
}
```

### GitHub Environments

```yaml
# Configurer dans GitHub Settings > Environments

# Environment: staging
# - No protection rules
# - Secrets: VERCEL_TOKEN, DATABASE_URL, etc.

# Environment: production
# - Required reviewers: 2
# - Wait timer: 10 minutes
# - Branch restriction: main only
# - Secrets: VERCEL_TOKEN, DATABASE_URL, SENTRY_DSN, etc.
```

---

## Secrets et Variables

### Gestion des Secrets

```yaml
# GitHub Actions - Utilisation des secrets
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy
        env:
          # Secrets d'environnement (définis dans GitHub)
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          API_KEY: ${{ secrets.API_KEY }}

          # Variables d'environnement (non sensibles)
          NODE_ENV: production
          NEXT_PUBLIC_APP_URL: ${{ vars.APP_URL }}
        run: |
          pnpm build
          pnpm deploy
```

### Rotation des Secrets

```yaml
# .github/workflows/rotate-secrets.yml
name: Rotate Secrets

on:
  schedule:
    - cron: '0 0 1 * *'  # Premier jour du mois
  workflow_dispatch:

jobs:
  rotate:
    runs-on: ubuntu-latest
    steps:
      - name: Generate new API key
        id: new-key
        run: |
          NEW_KEY=$(openssl rand -hex 32)
          echo "::add-mask::$NEW_KEY"
          echo "key=$NEW_KEY" >> $GITHUB_OUTPUT

      - name: Update in vault
        run: |
          # Mettre à jour dans HashiCorp Vault ou AWS Secrets Manager
          vault kv put secret/api-key value=${{ steps.new-key.outputs.key }}

      - name: Trigger redeployment
        run: |
          gh workflow run cd.yml -f environment=production

      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: custom
          custom_payload: |
            {
              "text": ":key: API keys rotated successfully"
            }
```

### Variables d'Environnement Vercel

```bash
# Définir les variables via CLI Vercel
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# Ou via fichier
vercel env pull .env.local  # Télécharger
vercel env push .env.production  # Uploader
```

---

## Qualité et Gates

### Quality Gates

```yaml
# .github/workflows/quality-gate.yml
name: Quality Gate

on:
  pull_request:
    branches: [main, develop]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Check Coverage Threshold
        run: |
          COVERAGE=$(cat coverage/coverage-summary.json | jq '.total.lines.pct')
          if (( $(echo "$COVERAGE < 80" | bc -l) )); then
            echo "Coverage $COVERAGE% is below 80% threshold"
            exit 1
          fi

      - name: Check Bundle Size
        run: |
          BUNDLE_SIZE=$(du -sk .next/static | cut -f1)
          MAX_SIZE=500  # 500KB
          if [ "$BUNDLE_SIZE" -gt "$MAX_SIZE" ]; then
            echo "Bundle size ${BUNDLE_SIZE}KB exceeds ${MAX_SIZE}KB"
            exit 1
          fi

      - name: Check Lighthouse Score
        uses: treosh/lighthouse-ci-action@v10
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true

      - name: SonarCloud Scan
        uses: SonarSource/sonarcloud-github-action@master
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
```

### Lighthouse CI

```json
// lighthouserc.json
{
  "ci": {
    "collect": {
      "url": ["http://localhost:3000/", "http://localhost:3000/dashboard"],
      "startServerCommand": "pnpm start",
      "numberOfRuns": 3
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.9 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

## Monitoring et Alertes

### Intégration Monitoring

```yaml
# Post-deploy monitoring
post-deploy-check:
  runs-on: ubuntu-latest
  steps:
    - name: Wait for deployment
      run: sleep 60

    - name: Check Error Rate (Sentry)
      run: |
        ERRORS=$(curl -s -H "Authorization: Bearer ${{ secrets.SENTRY_TOKEN }}" \
          "https://sentry.io/api/0/projects/$ORG/$PROJECT/issues/?query=is:unresolved" \
          | jq '. | length')

        if [ "$ERRORS" -gt 10 ]; then
          echo "Too many new errors: $ERRORS"
          exit 1
        fi

    - name: Check Response Time (Datadog)
      run: |
        AVG_LATENCY=$(curl -s -H "DD-API-KEY: ${{ secrets.DD_API_KEY }}" \
          "https://api.datadoghq.com/api/v1/query?query=avg:trace.http.request.duration{service:myapp}" \
          | jq '.series[0].pointlist[-1][1]')

        if (( $(echo "$AVG_LATENCY > 500" | bc -l) )); then
          echo "Latency too high: ${AVG_LATENCY}ms"
          exit 1
        fi

    - name: Check Uptime (StatusPage)
      run: |
        STATUS=$(curl -s "https://api.statuspage.io/v1/pages/$PAGE_ID/components" \
          -H "Authorization: OAuth ${{ secrets.STATUSPAGE_TOKEN }}" \
          | jq '.[] | select(.name == "API") | .status')

        if [ "$STATUS" != "\"operational\"" ]; then
          echo "API not operational: $STATUS"
          exit 1
        fi
```

### Alertes Slack

```yaml
# Notification template
notify:
  runs-on: ubuntu-latest
  if: always()
  needs: [deploy]
  steps:
    - name: Notify Success
      if: needs.deploy.result == 'success'
      uses: 8398a7/action-slack@v3
      with:
        status: success
        fields: repo,message,commit,author,action,workflow
        text: ':white_check_mark: Deployment successful!'

    - name: Notify Failure
      if: needs.deploy.result == 'failure'
      uses: 8398a7/action-slack@v3
      with:
        status: failure
        fields: repo,message,commit,author,action,workflow
        text: ':x: Deployment failed! @channel'

    - name: Create PagerDuty Incident
      if: needs.deploy.result == 'failure'
      run: |
        curl -X POST "https://events.pagerduty.com/v2/enqueue" \
          -H "Content-Type: application/json" \
          -d '{
            "routing_key": "${{ secrets.PAGERDUTY_KEY }}",
            "event_action": "trigger",
            "payload": {
              "summary": "Production deployment failed",
              "severity": "critical",
              "source": "github-actions"
            }
          }'
```

---

## Rollback

### Stratégies de Rollback

```
┌─────────────────────────────────────────────────────────────────┐
│                    Rollback Strategies                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. IMMEDIATE ROLLBACK (< 1 min)                                │
│     - Vercel: Instant rollback to previous deployment           │
│     - K8s: Switch service selector to previous version          │
│                                                                  │
│  2. REDEPLOY PREVIOUS VERSION (5-10 min)                        │
│     - Trigger CD pipeline with previous tag                     │
│     - Full deployment process                                   │
│                                                                  │
│  3. DATABASE ROLLBACK (risky)                                   │
│     - Restore from backup                                       │
│     - Only if data corruption                                   │
│                                                                  │
│  4. FEATURE FLAG DISABLE (instant)                              │
│     - Disable broken feature                                    │
│     - No deployment needed                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Rollback Automatique

```yaml
# Auto-rollback basé sur métriques
auto-rollback:
  runs-on: ubuntu-latest
  needs: deploy-production
  steps:
    - name: Monitor for 10 minutes
      run: |
        for i in {1..20}; do
          # Vérifier le taux d'erreur
          ERROR_RATE=$(curl -s "$PROMETHEUS_URL/api/v1/query" \
            --data-urlencode 'query=rate(http_requests_total{status=~"5.."}[1m]) / rate(http_requests_total[1m])' \
            | jq '.data.result[0].value[1] | tonumber')

          if (( $(echo "$ERROR_RATE > 0.05" | bc -l) )); then
            echo "Error rate $ERROR_RATE > 5%, triggering rollback"
            gh workflow run rollback.yml -f environment=production -f reason="Auto: High error rate"
            exit 1
          fi

          sleep 30
        done
        echo "Deployment stable"
```

### Vercel Instant Rollback

```typescript
// scripts/rollback.ts
import { Vercel } from '@vercel/sdk';

const vercel = new Vercel({
  bearerToken: process.env.VERCEL_TOKEN,
});

async function rollback(deploymentId?: string) {
  const project = await vercel.projects.get({
    idOrName: process.env.VERCEL_PROJECT_ID!,
  });

  // Si pas de deployment ID, prendre le précédent
  if (!deploymentId) {
    const deployments = await vercel.deployments.list({
      projectId: project.id,
      limit: 2,
      state: 'READY',
    });

    deploymentId = deployments.deployments[1].uid;
  }

  // Promouvoir l'ancien deployment
  await vercel.deployments.create({
    name: project.name,
    gitSource: {
      type: 'github',
      ref: deploymentId,
    },
    target: 'production',
  });

  console.log(`Rolled back to deployment: ${deploymentId}`);
}

rollback(process.argv[2]);
```

---

## Best Practices

### Checklist CI/CD

```markdown
## Pipeline CI
- [ ] Build automatique sur chaque commit
- [ ] Linting et formatting vérifiés
- [ ] Type checking TypeScript
- [ ] Tests unitaires avec couverture > 80%
- [ ] Tests d'intégration
- [ ] Tests E2E sur PR critiques
- [ ] Scan de sécurité (SAST, dépendances)
- [ ] Analyse de bundle size

## Pipeline CD
- [ ] Déploiement automatique en staging
- [ ] Smoke tests après déploiement
- [ ] E2E tests sur staging
- [ ] Approbation manuelle pour production
- [ ] Déploiement progressif (canary/blue-green)
- [ ] Monitoring post-déploiement
- [ ] Rollback automatique si erreurs

## Sécurité
- [ ] Secrets dans les variables d'environnement
- [ ] Rotation régulière des secrets
- [ ] Permissions minimales (GITHUB_TOKEN)
- [ ] Scan de vulnérabilités des images Docker
- [ ] Vérification des signatures

## Qualité
- [ ] Quality gates configurés
- [ ] Lighthouse CI pour performance
- [ ] SonarCloud pour code quality
- [ ] Couverture de code trackée
- [ ] Bundle size limité

## Notifications
- [ ] Slack/Teams pour succès/échecs
- [ ] PagerDuty pour incidents critiques
- [ ] Commentaires automatiques sur PR
- [ ] Release notes générées
```

### Anti-Patterns à Éviter

```yaml
# ❌ NE PAS FAIRE

# 1. Secrets en clair
env:
  API_KEY: "sk-1234567890"  # ❌ Jamais en clair!

# 2. Ignorer les échecs
- run: pnpm test
  continue-on-error: true  # ❌ Masque les vrais problèmes

# 3. Pas de cache
- run: npm install  # ❌ Lent sans cache

# 4. Déployer sans tests
deploy:
  needs: []  # ❌ Pas de dépendance aux tests

# 5. Pas de timeout
- run: pnpm e2e  # ❌ Peut bloquer indéfiniment

# ✅ BONNES PRATIQUES

# 1. Utiliser les secrets
env:
  API_KEY: ${{ secrets.API_KEY }}

# 2. Échouer explicitement
- run: pnpm test
  continue-on-error: false

# 3. Utiliser le cache
- uses: actions/cache@v4
  with:
    path: ~/.pnpm-store
    key: ${{ hashFiles('pnpm-lock.yaml') }}

# 4. Dépendances explicites
deploy:
  needs: [lint, test, build, security]

# 5. Timeouts configurés
- run: pnpm e2e
  timeout-minutes: 30
```

### Performance du Pipeline

```yaml
# Optimisations de performance
jobs:
  # 1. Parallélisation maximale
  lint:
    runs-on: ubuntu-latest

  test-unit:
    runs-on: ubuntu-latest

  test-integration:
    runs-on: ubuntu-latest

  # 2. Cache agressif
  setup:
    steps:
      - uses: actions/cache@v4
        with:
          path: |
            ~/.pnpm-store
            .next/cache
            node_modules/.cache
          key: ${{ runner.os }}-${{ hashFiles('pnpm-lock.yaml') }}

  # 3. Matrices pour tests parallèles
  test:
    strategy:
      matrix:
        shard: [1, 2, 3, 4]
    steps:
      - run: pnpm test --shard=${{ matrix.shard }}/4

  # 4. Skip conditions
  build:
    if: |
      !contains(github.event.head_commit.message, '[skip ci]') &&
      !contains(github.event.head_commit.message, '[docs only]')

  # 5. Artifacts légers
  - uses: actions/upload-artifact@v4
    with:
      path: |
        .next/
        !.next/cache  # Exclure le cache
      retention-days: 1  # Courte durée
```

---

## Conclusion

Un pipeline CI/CD bien configuré permet :

1. **Feedback rapide** : Erreurs détectées en minutes
2. **Déploiements fiables** : Reproductibles et réversibles
3. **Qualité constante** : Gates automatiques
4. **Sécurité renforcée** : Scans automatiques
5. **Productivité** : Focus sur le code, pas les déploiements

**Prochaines étapes** :
1. Configurer le pipeline CI de base
2. Ajouter les tests automatisés
3. Mettre en place le CD progressif
4. Configurer le monitoring et les alertes
5. Documenter les procédures de rollback
