# Guide Docker & Containerisation

> Bonnes pratiques Docker pour applications production-ready

## Table des Matières

1. [Introduction](#introduction)
2. [Dockerfile Optimisé](#dockerfile-optimisé)
3. [Docker Compose](#docker-compose)
4. [Multi-Stage Builds](#multi-stage-builds)
5. [Sécurité](#sécurité)
6. [Orchestration](#orchestration)
7. [Registry & CI/CD](#registry--cicd)
8. [Best Practices](#best-practices)

---

## Introduction

### Pourquoi Docker ?

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Avantages Docker                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ✅ Reproductibilité     - Même comportement dev/staging/prod              │
│  ✅ Isolation            - Chaque service dans son conteneur               │
│  ✅ Portabilité          - Fonctionne partout (Linux, Mac, Windows, Cloud) │
│  ✅ Scalabilité          - Scale horizontal facile                         │
│  ✅ Versioning           - Images versionnées et rollback facile           │
│  ✅ Microservices        - Architecture modulaire                          │
│  ✅ CI/CD                - Intégration native avec les pipelines           │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Dockerfile Optimisé

### Next.js Production Dockerfile

```dockerfile
# =============================================================================
# Dockerfile - Next.js Application
# =============================================================================
# Multi-stage build optimisé pour la production
# Taille finale: ~150MB (vs ~1GB sans optimisation)
# =============================================================================

# -----------------------------------------------------------------------------
# Stage 1: Base
# -----------------------------------------------------------------------------
FROM node:20-alpine AS base

# Installer les dépendances système nécessaires
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Activer corepack pour pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# -----------------------------------------------------------------------------
# Stage 2: Dependencies
# -----------------------------------------------------------------------------
FROM base AS deps

# Copier les fichiers de dépendances
COPY package.json pnpm-lock.yaml ./

# Installer les dépendances (avec cache)
RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# -----------------------------------------------------------------------------
# Stage 3: Builder
# -----------------------------------------------------------------------------
FROM base AS builder

WORKDIR /app

# Copier les dépendances
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Arguments de build
ARG VERSION=dev
ARG BUILD_DATE
ARG GIT_COMMIT

# Variables d'environnement de build
ENV NEXT_PUBLIC_VERSION=$VERSION
ENV NEXT_PUBLIC_BUILD_DATE=$BUILD_DATE
ENV NEXT_PUBLIC_GIT_COMMIT=$GIT_COMMIT
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build de l'application
RUN pnpm build

# -----------------------------------------------------------------------------
# Stage 4: Production Runner
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner

WORKDIR /app

# Labels OCI
LABEL org.opencontainers.image.title="MyApp"
LABEL org.opencontainers.image.description="Next.js Application"
LABEL org.opencontainers.image.version="${VERSION}"
LABEL org.opencontainers.image.created="${BUILD_DATE}"
LABEL org.opencontainers.image.revision="${GIT_COMMIT}"
LABEL org.opencontainers.image.vendor="MyCompany"

# Configuration production
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Créer un utilisateur non-root
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copier les fichiers nécessaires
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json

# Copier le build standalone
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Utiliser l'utilisateur non-root
USER nextjs

# Exposer le port
EXPOSE 3000

# Variables d'environnement runtime
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Commande de démarrage
CMD ["node", "server.js"]
```

### Configuration Next.js pour Standalone

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',

  // Optimisations
  reactStrictMode: true,
  poweredByHeader: false,

  // Compression
  compress: true,

  // Images
  images: {
    domains: ['cdn.example.com'],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

---

## Docker Compose

### Environnement de Développement

```yaml
# docker-compose.yml
version: '3.8'

services:
  # ==========================================================================
  # Application Next.js
  # ==========================================================================
  app:
    build:
      context: .
      dockerfile: Dockerfile.dev
    container_name: myapp-dev
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - .:/app
      - /app/node_modules
      - /app/.next
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://dev:dev@postgres:5432/myapp_dev
      - REDIS_URL=redis://redis:6379
      - NEXTAUTH_URL=http://localhost:3000
      - NEXTAUTH_SECRET=dev-secret-32-characters-long!!
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - myapp-network

  # ==========================================================================
  # PostgreSQL
  # ==========================================================================
  postgres:
    image: postgres:15-alpine
    container_name: myapp-postgres
    restart: unless-stopped
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
      POSTGRES_DB: myapp_dev
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./docker/postgres/init.sql:/docker-entrypoint-initdb.d/init.sql
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dev -d myapp_dev"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - myapp-network

  # ==========================================================================
  # Redis
  # ==========================================================================
  redis:
    image: redis:7-alpine
    container_name: myapp-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    command: redis-server --appendonly yes
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - myapp-network

  # ==========================================================================
  # Mailhog (Email testing)
  # ==========================================================================
  mailhog:
    image: mailhog/mailhog
    container_name: myapp-mailhog
    ports:
      - "1025:1025"
      - "8025:8025"
    networks:
      - myapp-network

  # ==========================================================================
  # MinIO (S3-compatible storage)
  # ==========================================================================
  minio:
    image: minio/minio
    container_name: myapp-minio
    command: server /data --console-address ":9001"
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - myapp-network

  # ==========================================================================
  # Keycloak (IAM)
  # ==========================================================================
  keycloak:
    image: quay.io/keycloak/keycloak:latest
    container_name: myapp-keycloak
    command: start-dev
    ports:
      - "8080:8080"
    environment:
      KEYCLOAK_ADMIN: admin
      KEYCLOAK_ADMIN_PASSWORD: admin
      KC_DB: postgres
      KC_DB_URL: jdbc:postgresql://postgres:5432/keycloak
      KC_DB_USERNAME: dev
      KC_DB_PASSWORD: dev
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - myapp-network

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  myapp-network:
    driver: bridge
```

### Environnement de Production

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  app:
    image: ${DOCKER_REGISTRY}/myapp:${IMAGE_TAG:-latest}
    restart: always
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
      - REDIS_URL=${REDIS_URL}
    deploy:
      replicas: 3
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
      update_config:
        parallelism: 1
        delay: 10s
        failure_action: rollback
      rollback_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
    healthcheck:
      test: ["CMD", "wget", "--spider", "-q", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    networks:
      - myapp-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    networks:
      - myapp-network

networks:
  myapp-network:
    driver: overlay
```

### Dockerfile de Développement

```dockerfile
# Dockerfile.dev
FROM node:20-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

# Installer les dépendances de développement
RUN apk add --no-cache git

COPY package.json pnpm-lock.yaml ./
RUN pnpm install

COPY . .

EXPOSE 3000

CMD ["pnpm", "dev"]
```

---

## Multi-Stage Builds

### Build Optimisé avec Cache

```dockerfile
# Dockerfile avec cache avancé
# syntax=docker/dockerfile:1.4

FROM node:20-alpine AS base
RUN corepack enable
WORKDIR /app

# Stage: Dependencies (cached séparément)
FROM base AS deps
COPY package.json pnpm-lock.yaml ./

# Cache pnpm store
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm fetch

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --offline

# Stage: Build (invalidé uniquement si le code change)
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Cache Next.js build
RUN --mount=type=cache,target=/app/.next/cache \
    pnpm build

# Stage: Production
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## Sécurité

### Dockerfile Sécurisé

```dockerfile
# Bonnes pratiques de sécurité

# 1. Utiliser une image de base minimale
FROM node:20-alpine AS base

# 2. Ne pas exécuter en root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# 3. Installer uniquement les packages nécessaires
RUN apk add --no-cache dumb-init

# 4. Copier uniquement les fichiers nécessaires
COPY --chown=appuser:appgroup package*.json ./
COPY --chown=appuser:appgroup . .

# 5. Utiliser un utilisateur non-root
USER appuser

# 6. Utiliser dumb-init pour gérer les signaux
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
```

### Scan de Sécurité

```yaml
# GitHub Actions - Scan Trivy
- name: Scan image for vulnerabilities
  uses: aquasecurity/trivy-action@master
  with:
    image-ref: myapp:${{ github.sha }}
    format: 'sarif'
    output: 'trivy-results.sarif'
    severity: 'CRITICAL,HIGH'

- name: Upload Trivy scan results
  uses: github/codeql-action/upload-sarif@v2
  with:
    sarif_file: 'trivy-results.sarif'
```

### Docker Secrets

```yaml
# docker-compose avec secrets
version: '3.8'

services:
  app:
    image: myapp:latest
    secrets:
      - db_password
      - api_key
    environment:
      - DATABASE_PASSWORD_FILE=/run/secrets/db_password
      - API_KEY_FILE=/run/secrets/api_key

secrets:
  db_password:
    external: true
  api_key:
    external: true
```

---

## Orchestration

### Kubernetes Deployment

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  labels:
    app: myapp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp
  template:
    metadata:
      labels:
        app: myapp
    spec:
      containers:
        - name: myapp
          image: registry.example.com/myapp:latest
          ports:
            - containerPort: 3000
          resources:
            requests:
              memory: "256Mi"
              cpu: "250m"
            limits:
              memory: "512Mi"
              cpu: "500m"
          livenessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 15
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
          env:
            - name: NODE_ENV
              value: "production"
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: myapp-secrets
                  key: database-url
```

---

## Registry & CI/CD

### GitHub Container Registry

```yaml
# .github/workflows/docker-publish.yml
name: Docker Build & Push

on:
  push:
    branches: [main]
    tags: ['v*']

env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Login to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.IMAGE_NAME }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=sha

      - name: Build and push
        uses: docker/build-push-action@v5
        with:
          context: .
          push: true
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
          build-args: |
            VERSION=${{ github.ref_name }}
            BUILD_DATE=${{ github.event.head_commit.timestamp }}
            GIT_COMMIT=${{ github.sha }}
```

---

## Best Practices

### Checklist Docker

```markdown
## Dockerfile
- [ ] Image de base minimale (alpine)
- [ ] Multi-stage build
- [ ] Utilisateur non-root
- [ ] HEALTHCHECK configuré
- [ ] Labels OCI standards
- [ ] .dockerignore configuré
- [ ] Cache optimisé

## Sécurité
- [ ] Scan de vulnérabilités (Trivy)
- [ ] Pas de secrets dans l'image
- [ ] Mise à jour régulière des images de base
- [ ] Principe du moindre privilège

## Performance
- [ ] Layers ordonnés (fréquence de changement)
- [ ] Cache BuildKit activé
- [ ] Compression des images
- [ ] Taille d'image < 200MB

## CI/CD
- [ ] Build automatique sur push
- [ ] Tags sémantiques
- [ ] Registry privé sécurisé
- [ ] Cleanup des anciennes images
```

### .dockerignore

```gitignore
# .dockerignore
.git
.gitignore
.env*
!.env.example

node_modules
.next
.cache

*.md
!README.md

.github
.vscode
.idea

tests
coverage
playwright-report

docker-compose*.yml
Dockerfile*
.dockerignore

*.log
*.tmp
```
