# =============================================================================
# Dockerfile - Next.js Application (Multi-stage Build)
# =============================================================================
# Template optimisé pour production avec:
# - Multi-stage build pour réduire la taille de l'image
# - Non-root user pour la sécurité
# - Standalone output mode de Next.js
# - Health check intégré
# =============================================================================

# =============================================================================
# Stage 1: Base - Image de base avec les dépendances système
# =============================================================================
FROM node:20-alpine AS base

# Install libc6-compat for Alpine compatibility
RUN apk add --no-cache libc6-compat

# Set working directory
WORKDIR /app

# =============================================================================
# Stage 2: Dependencies - Installation des dépendances
# =============================================================================
FROM base AS deps

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN \
    if [ -f package-lock.json ]; then \
        npm ci --prefer-offline --no-audit; \
    else \
        echo "Warning: package-lock.json not found" && npm install; \
    fi

# =============================================================================
# Stage 3: Builder - Build de l'application
# =============================================================================
FROM base AS builder

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Build arguments (passed from CI/CD)
ARG BUILD_NUMBER=0
ARG GIT_COMMIT=unknown
ARG NODE_ENV=production

# Environment variables for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_APP_VERSION=${BUILD_NUMBER}
ENV NEXT_PUBLIC_GIT_COMMIT=${GIT_COMMIT}

# Generate Prisma client (if using Prisma)
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

# Build Next.js application
RUN npm run build

# =============================================================================
# Stage 4: Runner - Image de production finale
# =============================================================================
FROM node:20-alpine AS runner

# Install security updates and required packages
RUN apk update && \
    apk upgrade && \
    apk add --no-cache \
        curl \
        tini \
    && rm -rf /var/cache/apk/*

# Set working directory
WORKDIR /app

# Environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Create .next directory and set permissions
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build (Next.js standalone output mode)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy build info
COPY --from=builder --chown=nextjs:nodejs /app/.next/build-info.json ./.next/build-info.json 2>/dev/null || true

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Use tini as init system for proper signal handling
ENTRYPOINT ["/sbin/tini", "--"]

# Start application
CMD ["node", "server.js"]
