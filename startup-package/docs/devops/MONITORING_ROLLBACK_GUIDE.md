# Guide Monitoring et Rollback

> Surveillance des applications et procédures de rollback d'urgence

## Table des Matières

1. [Monitoring](#monitoring)
2. [Logging](#logging)
3. [Alerting](#alerting)
4. [Health Checks](#health-checks)
5. [Rollback](#rollback)
6. [Incident Response](#incident-response)
7. [Post-Mortem](#post-mortem)

---

## Monitoring

### Architecture de Monitoring

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        Monitoring Stack                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐                   │
│  │ Application │────▶│  Collector  │────▶│   Storage   │                   │
│  │   Metrics   │     │             │     │             │                   │
│  └─────────────┘     └─────────────┘     └─────────────┘                   │
│                                                 │                           │
│  ┌─────────────┐     ┌─────────────┐           │                           │
│  │    Logs     │────▶│  Log Agg    │───────────┤                           │
│  │             │     │             │           │                           │
│  └─────────────┘     └─────────────┘           │                           │
│                                                 │                           │
│  ┌─────────────┐     ┌─────────────┐           ▼                           │
│  │   Traces    │────▶│   Tracing   │     ┌─────────────┐                   │
│  │             │     │             │     │  Dashboard  │                   │
│  └─────────────┘     └─────────────┘     │   Alerts    │                   │
│                                          └─────────────┘                   │
│                                                                              │
│  Outils recommandés:                                                        │
│  • Metrics: Prometheus, Datadog, New Relic                                 │
│  • Logs: Loki, Elasticsearch, Datadog                                      │
│  • Traces: Jaeger, Tempo, Datadog APM                                      │
│  • Errors: Sentry                                                          │
│  • Uptime: Better Uptime, Pingdom                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Métriques Clés (Golden Signals)

```typescript
// lib/monitoring/metrics.ts

/**
 * Les 4 Golden Signals de Google SRE
 *
 * 1. Latency - Temps de réponse
 * 2. Traffic - Volume de requêtes
 * 3. Errors - Taux d'erreurs
 * 4. Saturation - Utilisation des ressources
 */

interface Metrics {
  // Latency
  requestDurationMs: Histogram;
  requestDurationP50: Gauge;
  requestDurationP95: Gauge;
  requestDurationP99: Gauge;

  // Traffic
  requestsTotal: Counter;
  requestsPerSecond: Gauge;
  activeConnections: Gauge;

  // Errors
  errorsTotal: Counter;
  errorRate: Gauge;
  http5xxTotal: Counter;
  http4xxTotal: Counter;

  // Saturation
  cpuUsagePercent: Gauge;
  memoryUsagePercent: Gauge;
  diskUsagePercent: Gauge;
  connectionPoolUsage: Gauge;
}
```

### Intégration Sentry

```typescript
// lib/monitoring/sentry.ts

import * as Sentry from '@sentry/nextjs';

// sentry.client.config.ts
Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.NEXT_PUBLIC_APP_VERSION,

  // Performance Monitoring
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,

  // Filtrage
  ignoreErrors: [
    'ResizeObserver loop limit exceeded',
    'Network request failed',
    /^Fetch failed/,
  ],

  beforeSend(event) {
    // Nettoyer les données sensibles
    if (event.request?.cookies) {
      delete event.request.cookies;
    }
    return event;
  },
});

// Utilitaires
export function captureError(error: Error, context?: Record<string, any>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

export function setUserContext(user: { id: string; email: string }) {
  Sentry.setUser({
    id: user.id,
    email: user.email,
  });
}

export function addBreadcrumb(message: string, category: string) {
  Sentry.addBreadcrumb({
    message,
    category,
    level: 'info',
  });
}
```

### Intégration Datadog

```typescript
// lib/monitoring/datadog.ts

import { datadogRum } from '@datadog/browser-rum';
import { datadogLogs } from '@datadog/browser-logs';

// Initialisation RUM (Real User Monitoring)
export function initDatadogRUM() {
  if (typeof window === 'undefined') return;

  datadogRum.init({
    applicationId: process.env.NEXT_PUBLIC_DD_APP_ID!,
    clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
    site: 'datadoghq.eu',
    service: 'myapp-frontend',
    env: process.env.NODE_ENV,
    version: process.env.NEXT_PUBLIC_APP_VERSION,

    // Session
    sessionSampleRate: 100,
    sessionReplaySampleRate: 20,

    // Tracking
    trackUserInteractions: true,
    trackResources: true,
    trackLongTasks: true,

    // Privacy
    defaultPrivacyLevel: 'mask-user-input',
  });

  datadogRum.startSessionReplayRecording();
}

// Initialisation Logs
export function initDatadogLogs() {
  if (typeof window === 'undefined') return;

  datadogLogs.init({
    clientToken: process.env.NEXT_PUBLIC_DD_CLIENT_TOKEN!,
    site: 'datadoghq.eu',
    service: 'myapp-frontend',
    env: process.env.NODE_ENV,
    forwardErrorsToLogs: true,
    sessionSampleRate: 100,
  });
}

// Logging
export const logger = {
  info: (message: string, context?: object) => {
    datadogLogs.logger.info(message, context);
  },
  warn: (message: string, context?: object) => {
    datadogLogs.logger.warn(message, context);
  },
  error: (message: string, context?: object) => {
    datadogLogs.logger.error(message, context);
  },
};
```

### Métriques Custom Next.js

```typescript
// lib/monitoring/nextjs-metrics.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { performance } from 'perf_hooks';

// Middleware de métriques
export function withMetrics(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    const start = performance.now();

    // Intercepter la fin de la réponse
    const originalEnd = res.end;
    res.end = function (...args: any[]) {
      const duration = performance.now() - start;

      // Envoyer les métriques
      sendMetrics({
        path: req.url,
        method: req.method,
        statusCode: res.statusCode,
        duration,
      });

      return originalEnd.apply(res, args);
    };

    try {
      await handler(req, res);
    } catch (error) {
      // Log erreur
      sendMetrics({
        path: req.url,
        method: req.method,
        statusCode: 500,
        duration: performance.now() - start,
        error: true,
      });
      throw error;
    }
  };
}

async function sendMetrics(data: {
  path?: string;
  method?: string;
  statusCode: number;
  duration: number;
  error?: boolean;
}) {
  // Envoyer à votre système de métriques
  // Exemple: StatsD, Prometheus Pushgateway, Datadog API
  console.log(`[METRIC] ${data.method} ${data.path} ${data.statusCode} ${data.duration.toFixed(2)}ms`);
}
```

---

## Logging

### Structure des Logs

```typescript
// lib/logging/logger.ts

import pino from 'pino';

const isProduction = process.env.NODE_ENV === 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),

  // Format structuré en production, lisible en dev
  transport: isProduction
    ? undefined
    : {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss',
          ignore: 'pid,hostname',
        },
      },

  // Champs de base
  base: {
    env: process.env.NODE_ENV,
    version: process.env.npm_package_version,
    service: 'myapp',
  },

  // Formattage des erreurs
  formatters: {
    level: (label) => ({ level: label }),
  },

  // Redaction des données sensibles
  redact: {
    paths: ['password', 'token', 'authorization', 'cookie', '*.password', '*.token'],
    censor: '[REDACTED]',
  },
});

// Utilitaires
export function createChildLogger(context: Record<string, any>) {
  return logger.child(context);
}

// Logger pour les requêtes
export function logRequest(req: {
  method: string;
  url: string;
  userId?: string;
  ip?: string;
}) {
  logger.info({
    type: 'request',
    method: req.method,
    url: req.url,
    userId: req.userId,
    ip: req.ip,
  });
}

// Logger pour les réponses
export function logResponse(res: {
  method: string;
  url: string;
  statusCode: number;
  duration: number;
}) {
  const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

  logger[level]({
    type: 'response',
    method: res.method,
    url: res.url,
    statusCode: res.statusCode,
    duration: res.duration,
  });
}
```

### Logging Middleware

```typescript
// middleware/logging.ts

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function loggingMiddleware(request: NextRequest) {
  const start = Date.now();
  const requestId = crypto.randomUUID();

  // Ajouter l'ID de requête aux headers
  const response = NextResponse.next();
  response.headers.set('x-request-id', requestId);

  // Log de la requête
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'request',
      requestId,
      method: request.method,
      url: request.nextUrl.pathname,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
    })
  );

  return response;
}
```

### Log Aggregation avec Vercel

```typescript
// Vercel Log Drains vers un service externe

// vercel.json
{
  "functions": {
    "app/api/**/*": {
      "maxDuration": 30
    }
  }
}

// Configuration Log Drain (via CLI ou Dashboard)
// vercel logs drain create --url https://logs.example.com/ingest
```

---

## Alerting

### Configuration des Alertes

```yaml
# Exemple de configuration Prometheus/Alertmanager

# alerting-rules.yml
groups:
  - name: application
    rules:
      # Taux d'erreur élevé
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m])) /
          sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      # Latence élevée
      - alert: HighLatency
        expr: |
          histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P95 latency is {{ $value }}s"

      # Application down
      - alert: ApplicationDown
        expr: up{job="myapp"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Application is down"
          description: "{{ $labels.instance }} is not responding"

      # Mémoire élevée
      - alert: HighMemoryUsage
        expr: process_resident_memory_bytes / 1024 / 1024 > 512
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}MB"
```

### Alertes GitHub Actions

```yaml
# .github/workflows/monitoring-alerts.yml
name: Monitoring Alerts

on:
  schedule:
    - cron: '*/5 * * * *'  # Toutes les 5 minutes

jobs:
  check-health:
    runs-on: ubuntu-latest
    steps:
      - name: Check Production Health
        id: health
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://example.com/api/health)
          echo "status=$STATUS" >> $GITHUB_OUTPUT

          if [ "$STATUS" != "200" ]; then
            echo "error=true" >> $GITHUB_OUTPUT
          fi

      - name: Alert on Failure
        if: steps.health.outputs.error == 'true'
        run: |
          # Slack
          curl -X POST ${{ secrets.SLACK_WEBHOOK }} \
            -H 'Content-Type: application/json' \
            -d '{"text": "🚨 Production health check FAILED! Status: ${{ steps.health.outputs.status }}"}'

          # PagerDuty
          curl -X POST https://events.pagerduty.com/v2/enqueue \
            -H 'Content-Type: application/json' \
            -d '{
              "routing_key": "${{ secrets.PAGERDUTY_KEY }}",
              "event_action": "trigger",
              "payload": {
                "summary": "Production health check failed",
                "severity": "critical",
                "source": "github-actions"
              }
            }'
```

### Configuration Slack Alerts

```typescript
// lib/alerts/slack.ts

interface SlackAlert {
  channel: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  fields?: { name: string; value: string }[];
}

export async function sendSlackAlert(alert: SlackAlert) {
  const colors = {
    info: '#36a64f',
    warning: '#ff9800',
    critical: '#dc3545',
  };

  const payload = {
    channel: alert.channel,
    attachments: [
      {
        color: colors[alert.severity],
        blocks: [
          {
            type: 'header',
            text: {
              type: 'plain_text',
              text: `${getEmoji(alert.severity)} ${alert.title}`,
            },
          },
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: alert.message,
            },
          },
          ...(alert.fields
            ? [
                {
                  type: 'section',
                  fields: alert.fields.map((f) => ({
                    type: 'mrkdwn',
                    text: `*${f.name}:*\n${f.value}`,
                  })),
                },
              ]
            : []),
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `Environment: ${process.env.NODE_ENV} | ${new Date().toISOString()}`,
              },
            ],
          },
        ],
      },
    ],
  };

  await fetch(process.env.SLACK_WEBHOOK_URL!, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

function getEmoji(severity: string): string {
  switch (severity) {
    case 'critical':
      return '🚨';
    case 'warning':
      return '⚠️';
    default:
      return 'ℹ️';
  }
}
```

---

## Health Checks

### Endpoint de Health Check

```typescript
// app/api/health/route.ts

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    [key: string]: {
      status: 'pass' | 'warn' | 'fail';
      message?: string;
      duration?: number;
    };
  };
}

export async function GET() {
  const startTime = Date.now();
  const checks: HealthCheckResult['checks'] = {};

  // Check Database
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'pass',
      duration: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = {
      status: 'fail',
      message: 'Database connection failed',
    };
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    await redis.ping();
    checks.redis = {
      status: 'pass',
      duration: Date.now() - redisStart,
    };
  } catch (error) {
    checks.redis = {
      status: 'warn',
      message: 'Redis unavailable, using fallback',
    };
  }

  // Check External API
  try {
    const apiStart = Date.now();
    const response = await fetch('https://api.external.com/health', {
      signal: AbortSignal.timeout(5000),
    });
    checks.externalApi = {
      status: response.ok ? 'pass' : 'warn',
      duration: Date.now() - apiStart,
    };
  } catch (error) {
    checks.externalApi = {
      status: 'warn',
      message: 'External API timeout',
    };
  }

  // Determine overall status
  const hasFailure = Object.values(checks).some((c) => c.status === 'fail');
  const hasWarning = Object.values(checks).some((c) => c.status === 'warn');

  const result: HealthCheckResult = {
    status: hasFailure ? 'unhealthy' : hasWarning ? 'degraded' : 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || 'unknown',
    uptime: process.uptime(),
    checks,
  };

  const statusCode = hasFailure ? 503 : 200;

  return NextResponse.json(result, {
    status: statusCode,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
```

### Liveness et Readiness

```typescript
// app/api/health/live/route.ts
// Simple check - l'application répond
export async function GET() {
  return new Response('OK', { status: 200 });
}

// app/api/health/ready/route.ts
// Check complet - prêt à recevoir du trafic
export async function GET() {
  try {
    // Vérifier les dépendances critiques
    await prisma.$queryRaw`SELECT 1`;
    return new Response('READY', { status: 200 });
  } catch {
    return new Response('NOT READY', { status: 503 });
  }
}
```

### Kubernetes Probes

```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
spec:
  template:
    spec:
      containers:
        - name: app
          livenessProbe:
            httpGet:
              path: /api/health/live
              port: 3000
            initialDelaySeconds: 10
            periodSeconds: 10
            failureThreshold: 3

          readinessProbe:
            httpGet:
              path: /api/health/ready
              port: 3000
            initialDelaySeconds: 5
            periodSeconds: 5
            failureThreshold: 3

          startupProbe:
            httpGet:
              path: /api/health/live
              port: 3000
            initialDelaySeconds: 0
            periodSeconds: 2
            failureThreshold: 30
```

---

## Rollback

### Stratégies de Rollback

```
┌─────────────────────────────────────────────────────────────────┐
│                    Rollback Strategies                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. INSTANT ROLLBACK (< 30 sec)                                 │
│     └── Vercel: Promote previous deployment                    │
│     └── K8s: kubectl rollout undo                               │
│                                                                  │
│  2. REDEPLOY PREVIOUS (2-5 min)                                 │
│     └── Trigger CD pipeline with previous tag                   │
│     └── Full build and deploy process                           │
│                                                                  │
│  3. FEATURE FLAG DISABLE (instant)                              │
│     └── Disable broken feature remotely                         │
│     └── No deployment needed                                    │
│                                                                  │
│  4. DATABASE ROLLBACK (risky, 10-30 min)                        │
│     └── Only for data corruption                                │
│     └── Restore from backup                                     │
│     └── May cause data loss                                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Script de Rollback Vercel

```bash
#!/bin/bash
# scripts/rollback.sh

set -e

ENVIRONMENT=${1:-production}
DEPLOYMENT_ID=${2:-}

echo "🔄 Rollback to $ENVIRONMENT"

if [ -z "$DEPLOYMENT_ID" ]; then
  # Trouver le deployment précédent
  echo "Finding previous deployment..."
  DEPLOYMENT_ID=$(vercel list --scope $VERCEL_ORG_ID | grep -E "Production|Preview" | head -2 | tail -1 | awk '{print $1}')
fi

if [ -z "$DEPLOYMENT_ID" ]; then
  echo "❌ No deployment found to rollback to"
  exit 1
fi

echo "Rolling back to deployment: $DEPLOYMENT_ID"

# Promouvoir le deployment
if [ "$ENVIRONMENT" == "production" ]; then
  vercel promote $DEPLOYMENT_ID --scope $VERCEL_ORG_ID
else
  vercel alias $DEPLOYMENT_ID staging.example.com --scope $VERCEL_ORG_ID
fi

# Vérifier
echo "Verifying rollback..."
sleep 30

URL=$([ "$ENVIRONMENT" == "production" ] && echo "https://example.com" || echo "https://staging.example.com")
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL/api/health")

if [ "$STATUS" == "200" ]; then
  echo "✅ Rollback successful!"
else
  echo "❌ Rollback verification failed! Status: $STATUS"
  exit 1
fi
```

### Rollback Kubernetes

```bash
#!/bin/bash
# scripts/k8s-rollback.sh

NAMESPACE=${1:-production}
DEPLOYMENT=${2:-app}
REVISION=${3:-}

echo "🔄 Rolling back $DEPLOYMENT in $NAMESPACE"

# Voir l'historique
echo "Deployment history:"
kubectl rollout history deployment/$DEPLOYMENT -n $NAMESPACE

if [ -z "$REVISION" ]; then
  # Rollback au précédent
  kubectl rollout undo deployment/$DEPLOYMENT -n $NAMESPACE
else
  # Rollback à une révision spécifique
  kubectl rollout undo deployment/$DEPLOYMENT -n $NAMESPACE --to-revision=$REVISION
fi

# Attendre le rollback
kubectl rollout status deployment/$DEPLOYMENT -n $NAMESPACE --timeout=300s

echo "✅ Rollback complete!"
```

### Rollback Automatique

```typescript
// lib/monitoring/auto-rollback.ts

interface RollbackConfig {
  errorRateThreshold: number;  // Pourcentage (ex: 0.05 = 5%)
  latencyThreshold: number;    // Millisecondes
  windowSeconds: number;       // Fenêtre d'observation
  minRequests: number;         // Minimum de requêtes pour déclencher
}

const config: RollbackConfig = {
  errorRateThreshold: 0.05,
  latencyThreshold: 3000,
  windowSeconds: 300,
  minRequests: 100,
};

export async function checkAndRollback() {
  // Récupérer les métriques
  const metrics = await getMetrics(config.windowSeconds);

  if (metrics.requestCount < config.minRequests) {
    console.log('Not enough requests to evaluate');
    return;
  }

  const shouldRollback =
    metrics.errorRate > config.errorRateThreshold ||
    metrics.p95Latency > config.latencyThreshold;

  if (shouldRollback) {
    console.log('🚨 Triggering automatic rollback!');
    console.log(`Error rate: ${(metrics.errorRate * 100).toFixed(2)}%`);
    console.log(`P95 Latency: ${metrics.p95Latency}ms`);

    // Notifier
    await sendSlackAlert({
      channel: '#incidents',
      title: 'Automatic Rollback Triggered',
      message: `Error rate: ${(metrics.errorRate * 100).toFixed(2)}%, P95: ${metrics.p95Latency}ms`,
      severity: 'critical',
    });

    // Déclencher le rollback
    await triggerRollback();
  }
}

async function triggerRollback() {
  // Via GitHub Actions API
  await fetch(
    `https://api.github.com/repos/${REPO}/actions/workflows/rollback.yml/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github.v3+json',
      },
      body: JSON.stringify({
        ref: 'main',
        inputs: {
          environment: 'production',
          reason: 'Auto-rollback: High error rate detected',
        },
      }),
    }
  );
}
```

---

## Incident Response

### Processus de Réponse

```
┌─────────────────────────────────────────────────────────────────┐
│                 Incident Response Process                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. DETECTION (0-5 min)                                         │
│     • Alerte automatique reçue                                  │
│     • Vérification initiale                                     │
│     • Création du ticket incident                               │
│                                                                  │
│  2. TRIAGE (5-15 min)                                           │
│     • Évaluer la sévérité (P1-P4)                              │
│     • Identifier l'impact                                       │
│     • Mobiliser l'équipe appropriée                            │
│                                                                  │
│  3. MITIGATION (15-60 min)                                      │
│     • Actions immédiates (rollback, feature flag)              │
│     • Communication aux utilisateurs                            │
│     • Monitoring continu                                        │
│                                                                  │
│  4. RESOLUTION (1-24h)                                          │
│     • Identifier la cause racine                               │
│     • Développer et tester le fix                              │
│     • Déployer en production                                    │
│                                                                  │
│  5. POST-MORTEM (24-72h)                                        │
│     • Analyse complète                                          │
│     • Documentation                                             │
│     • Actions préventives                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Niveaux de Sévérité

```markdown
## P1 - Critical
- Impact: Service complètement indisponible
- Utilisateurs affectés: Tous
- Temps de réponse: < 5 minutes
- Escalade: Immédiate

## P2 - High
- Impact: Fonctionnalité majeure dégradée
- Utilisateurs affectés: > 50%
- Temps de réponse: < 30 minutes
- Escalade: Après 1 heure

## P3 - Medium
- Impact: Fonctionnalité secondaire dégradée
- Utilisateurs affectés: < 50%
- Temps de réponse: < 4 heures
- Escalade: Après 24 heures

## P4 - Low
- Impact: Bug mineur, cosmétique
- Utilisateurs affectés: Quelques-uns
- Temps de réponse: < 24 heures
- Escalade: Selon backlog
```

### Runbook Template

```markdown
# Runbook: [Nom de l'Incident Type]

## Description
[Description du type d'incident]

## Symptômes
- [ ] Symptôme 1
- [ ] Symptôme 2

## Vérification
```bash
# Commandes de diagnostic
curl https://example.com/api/health
kubectl get pods -n production
```

## Actions Immédiates
1. [ ] Action 1
2. [ ] Action 2

## Rollback
```bash
# Commande de rollback
./scripts/rollback.sh production
```

## Escalade
- L1: On-call engineer
- L2: Team lead
- L3: CTO

## Post-Incident
- [ ] Mettre à jour le status page
- [ ] Notifier les utilisateurs
- [ ] Créer le ticket post-mortem
```

---

## Post-Mortem

### Template Post-Mortem

```markdown
# Post-Mortem: [Titre de l'Incident]

## Résumé
- **Date**: YYYY-MM-DD
- **Durée**: X heures Y minutes
- **Sévérité**: P1/P2/P3/P4
- **Impact**: [Description de l'impact]
- **Utilisateurs affectés**: ~X utilisateurs

## Timeline (UTC)
| Heure | Événement |
|-------|-----------|
| 14:00 | Déploiement de la version X.Y.Z |
| 14:05 | Premières erreurs détectées |
| 14:10 | Alerte reçue par l'équipe |
| 14:15 | Début de l'investigation |
| 14:30 | Cause identifiée |
| 14:35 | Rollback initié |
| 14:40 | Service restauré |

## Cause Racine
[Description détaillée de la cause]

## Détection
- Comment l'incident a été détecté ?
- Temps de détection : X minutes
- Gap : Pourquoi pas plus tôt ?

## Résolution
- Actions prises pour résoudre
- Efficacité des actions
- Ce qui a bien fonctionné

## Impact Business
- Nombre de transactions perdues
- Revenu impacté (si applicable)
- Impact réputation

## Leçons Apprises

### Ce qui a bien fonctionné
1. [Point positif 1]
2. [Point positif 2]

### Ce qui peut être amélioré
1. [Point à améliorer 1]
2. [Point à améliorer 2]

## Actions Correctives

| Action | Owner | Priorité | Deadline | Status |
|--------|-------|----------|----------|--------|
| [Action 1] | @person | High | YYYY-MM-DD | TODO |
| [Action 2] | @person | Medium | YYYY-MM-DD | TODO |

## Approbations
- [ ] Engineering Lead
- [ ] Product Manager
- [ ] CTO (pour P1)
```

### Métriques Post-Mortem

```typescript
// lib/incidents/metrics.ts

interface IncidentMetrics {
  // MTTR - Mean Time To Recovery
  mttr: number;

  // MTTD - Mean Time To Detection
  mttd: number;

  // MTTR par sévérité
  mttrBySeverity: Record<string, number>;

  // Nombre d'incidents par période
  incidentCount: number;

  // Disponibilité
  availability: number;
}

export async function calculateIncidentMetrics(
  startDate: Date,
  endDate: Date
): Promise<IncidentMetrics> {
  const incidents = await getIncidents(startDate, endDate);

  const mttr =
    incidents.reduce((sum, i) => sum + i.resolutionTime, 0) / incidents.length;

  const mttd =
    incidents.reduce((sum, i) => sum + i.detectionTime, 0) / incidents.length;

  const totalDowntime = incidents.reduce((sum, i) => sum + i.downtime, 0);
  const totalTime = endDate.getTime() - startDate.getTime();
  const availability = ((totalTime - totalDowntime) / totalTime) * 100;

  return {
    mttr,
    mttd,
    mttrBySeverity: calculateMttrBySeverity(incidents),
    incidentCount: incidents.length,
    availability,
  };
}
```

---

## Conclusion

Un bon monitoring et des procédures de rollback claires permettent :

1. **Détection rapide** : Alertes en temps réel
2. **Réponse efficace** : Runbooks et procédures
3. **Récupération rapide** : Rollback en minutes
4. **Amélioration continue** : Post-mortems constructifs

### Checklist

```markdown
## Monitoring
- [ ] Métriques des 4 Golden Signals
- [ ] Logs structurés et centralisés
- [ ] Tracing distribué
- [ ] Error tracking (Sentry)
- [ ] Uptime monitoring

## Alerting
- [ ] Alertes par sévérité
- [ ] Escalade automatique
- [ ] Notifications Slack/PagerDuty
- [ ] Runbooks à jour

## Health Checks
- [ ] Endpoint /api/health
- [ ] Liveness et Readiness probes
- [ ] Checks des dépendances

## Rollback
- [ ] Rollback instantané disponible
- [ ] Script de rollback testé
- [ ] Feature flags en place
- [ ] Backup database régulier

## Incident Response
- [ ] Processus documenté
- [ ] On-call rotation
- [ ] Communication template
- [ ] Post-mortem process
```
