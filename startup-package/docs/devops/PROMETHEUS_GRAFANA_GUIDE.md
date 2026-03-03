# Prometheus & Grafana - Guide de Monitoring

> Guide complet pour implémenter un monitoring avec Prometheus et Grafana

---

## 📋 Table des Matières

1. [Vue d'Ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation Prometheus](#installation-prometheus)
4. [Configuration Prometheus](#configuration-prometheus)
5. [Installation Grafana](#installation-grafana)
6. [Dashboards Grafana](#dashboards-grafana)
7. [Métriques Application](#métriques-application)
8. [Alerting](#alerting)
9. [Intégration Next.js](#intégration-nextjs)
10. [Production Best Practices](#production-best-practices)

---

## 1. Vue d'Ensemble

### Pourquoi Prometheus + Grafana ?

| Outil | Rôle | Forces |
|-------|------|--------|
| **Prometheus** | Collecte et stockage des métriques | Pull-based, TSDB, PromQL, alerting natif |
| **Grafana** | Visualisation et dashboards | Multi-datasource, alerting avancé, plugins |

### Stack Monitoring Complète

```
┌─────────────────────────────────────────────────────────────────────┐
│                        MONITORING STACK                              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐        │
│  │   Next.js    │     │   Node.js    │     │   Database   │        │
│  │   App        │     │   Services   │     │   (Postgres) │        │
│  └──────┬───────┘     └──────┬───────┘     └──────┬───────┘        │
│         │                     │                    │                 │
│         │ /metrics            │ /metrics           │                 │
│         ▼                     ▼                    ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      PROMETHEUS                              │   │
│  │  - Scraping des métriques                                   │   │
│  │  - Stockage TSDB                                            │   │
│  │  - Évaluation des règles                                    │   │
│  │  - Alerting                                                 │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                       GRAFANA                                │   │
│  │  - Dashboards                                               │   │
│  │  - Alertes visuelles                                        │   │
│  │  - Annotations                                              │   │
│  └──────────────────────────┬──────────────────────────────────┘   │
│                              │                                       │
│                              ▼                                       │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                   ALERTMANAGER                               │   │
│  │  - Routing des alertes                                      │   │
│  │  - Déduplication                                            │   │
│  │  - Notifications (Slack, PagerDuty, Email)                  │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 2. Architecture

### 2.1 Composants

```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  # ==========================================================================
  # PROMETHEUS - Collecte et stockage des métriques
  # ==========================================================================
  prometheus:
    image: prom/prometheus:v2.48.0
    container_name: prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml:ro
      - ./prometheus/rules/:/etc/prometheus/rules/:ro
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--storage.tsdb.retention.time=30d'
      - '--storage.tsdb.retention.size=10GB'
      - '--web.console.libraries=/usr/share/prometheus/console_libraries'
      - '--web.console.templates=/usr/share/prometheus/consoles'
      - '--web.enable-lifecycle'
      - '--web.enable-admin-api'
    restart: unless-stopped
    networks:
      - monitoring

  # ==========================================================================
  # GRAFANA - Visualisation et dashboards
  # ==========================================================================
  grafana:
    image: grafana/grafana:10.2.2
    container_name: grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning/:/etc/grafana/provisioning/:ro
      - ./grafana/dashboards/:/var/lib/grafana/dashboards/:ro
    environment:
      - GF_SECURITY_ADMIN_USER=${GRAFANA_ADMIN_USER:-admin}
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_ADMIN_PASSWORD:-admin}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_ROOT_URL=${GRAFANA_ROOT_URL:-http://localhost:3001}
      - GF_SMTP_ENABLED=true
      - GF_SMTP_HOST=${SMTP_HOST:-smtp.gmail.com:587}
      - GF_SMTP_USER=${SMTP_USER}
      - GF_SMTP_PASSWORD=${SMTP_PASSWORD}
      - GF_SMTP_FROM_ADDRESS=${SMTP_FROM:-alerts@example.com}
    restart: unless-stopped
    networks:
      - monitoring
    depends_on:
      - prometheus

  # ==========================================================================
  # ALERTMANAGER - Gestion des alertes
  # ==========================================================================
  alertmanager:
    image: prom/alertmanager:v0.26.0
    container_name: alertmanager
    ports:
      - "9093:9093"
    volumes:
      - ./alertmanager/alertmanager.yml:/etc/alertmanager/alertmanager.yml:ro
      - alertmanager_data:/alertmanager
    command:
      - '--config.file=/etc/alertmanager/alertmanager.yml'
      - '--storage.path=/alertmanager'
    restart: unless-stopped
    networks:
      - monitoring

  # ==========================================================================
  # NODE EXPORTER - Métriques système
  # ==========================================================================
  node-exporter:
    image: prom/node-exporter:v1.7.0
    container_name: node-exporter
    ports:
      - "9100:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.sysfs=/host/sys'
      - '--path.rootfs=/rootfs'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    networks:
      - monitoring

  # ==========================================================================
  # CADVISOR - Métriques Docker containers
  # ==========================================================================
  cadvisor:
    image: gcr.io/cadvisor/cadvisor:v0.47.2
    container_name: cadvisor
    ports:
      - "8080:8080"
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro
    privileged: true
    restart: unless-stopped
    networks:
      - monitoring

  # ==========================================================================
  # POSTGRES EXPORTER - Métriques PostgreSQL
  # ==========================================================================
  postgres-exporter:
    image: prometheuscommunity/postgres-exporter:v0.15.0
    container_name: postgres-exporter
    ports:
      - "9187:9187"
    environment:
      - DATA_SOURCE_NAME=postgresql://${DB_USER}:${DB_PASSWORD}@postgres:5432/${DB_NAME}?sslmode=disable
    restart: unless-stopped
    networks:
      - monitoring

  # ==========================================================================
  # REDIS EXPORTER - Métriques Redis
  # ==========================================================================
  redis-exporter:
    image: oliver006/redis_exporter:v1.55.0
    container_name: redis-exporter
    ports:
      - "9121:9121"
    environment:
      - REDIS_ADDR=redis://redis:6379
    restart: unless-stopped
    networks:
      - monitoring

networks:
  monitoring:
    driver: bridge

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
```

---

## 3. Installation Prometheus

### 3.1 Configuration Prometheus

```yaml
# prometheus/prometheus.yml
global:
  scrape_interval: 15s
  evaluation_interval: 15s
  external_labels:
    monitor: 'saloon-management'
    environment: 'production'

# Alertmanager configuration
alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

# Load rules once and periodically evaluate them
rule_files:
  - /etc/prometheus/rules/*.yml

# Scrape configurations
scrape_configs:
  # ==========================================================================
  # Prometheus self-monitoring
  # ==========================================================================
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']
    metrics_path: /metrics

  # ==========================================================================
  # Node Exporter - System metrics
  # ==========================================================================
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        regex: '(.+):\d+'
        replacement: '${1}'

  # ==========================================================================
  # cAdvisor - Container metrics
  # ==========================================================================
  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']
    metrics_path: /metrics

  # ==========================================================================
  # Next.js Application
  # ==========================================================================
  - job_name: 'nextjs-app'
    static_configs:
      - targets: ['app:3000']
    metrics_path: /api/metrics
    scrape_interval: 10s
    scrape_timeout: 5s

  # ==========================================================================
  # API Backend (Node.js)
  # ==========================================================================
  - job_name: 'api-backend'
    static_configs:
      - targets: ['api:4000']
    metrics_path: /metrics

  # ==========================================================================
  # PostgreSQL Exporter
  # ==========================================================================
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  # ==========================================================================
  # Redis Exporter
  # ==========================================================================
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  # ==========================================================================
  # Kubernetes Service Discovery (si applicable)
  # ==========================================================================
  # - job_name: 'kubernetes-pods'
  #   kubernetes_sd_configs:
  #     - role: pod
  #   relabel_configs:
  #     - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_scrape]
  #       action: keep
  #       regex: true
  #     - source_labels: [__meta_kubernetes_pod_annotation_prometheus_io_path]
  #       action: replace
  #       target_label: __metrics_path__
  #       regex: (.+)
```

### 3.2 Règles d'Alerting

```yaml
# prometheus/rules/application.yml
groups:
  # ==========================================================================
  # Application Alerts
  # ==========================================================================
  - name: application
    rules:
      # High error rate
      - alert: HighErrorRate
        expr: |
          sum(rate(http_requests_total{status=~"5.."}[5m]))
          / sum(rate(http_requests_total[5m])) > 0.05
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }} over the last 5 minutes"

      # High response time
      - alert: HighResponseTime
        expr: |
          histogram_quantile(0.95,
            sum(rate(http_request_duration_seconds_bucket[5m])) by (le)
          ) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "95th percentile response time is {{ $value | humanizeDuration }}"

      # Low request rate (potential outage)
      - alert: LowRequestRate
        expr: |
          sum(rate(http_requests_total[5m])) < 0.1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low request rate - potential outage"
          description: "Request rate is only {{ $value }} req/s"

      # Health check failures
      - alert: HealthCheckFailed
        expr: up{job="nextjs-app"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Application health check failed"
          description: "Application {{ $labels.instance }} is down"

  # ==========================================================================
  # Database Alerts
  # ==========================================================================
  - name: database
    rules:
      # PostgreSQL down
      - alert: PostgreSQLDown
        expr: pg_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "PostgreSQL is down"
          description: "PostgreSQL instance {{ $labels.instance }} is unreachable"

      # High connection usage
      - alert: PostgreSQLHighConnections
        expr: |
          pg_stat_activity_count / pg_settings_max_connections > 0.8
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL high connection usage"
          description: "Connection usage is at {{ $value | humanizePercentage }}"

      # Slow queries
      - alert: PostgreSQLSlowQueries
        expr: |
          rate(pg_stat_statements_seconds_total[5m])
          / rate(pg_stat_statements_calls_total[5m]) > 1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL slow queries detected"
          description: "Average query time is {{ $value | humanizeDuration }}"

      # Replication lag
      - alert: PostgreSQLReplicationLag
        expr: pg_replication_lag > 30
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "PostgreSQL replication lag"
          description: "Replication lag is {{ $value }} seconds"

  # ==========================================================================
  # Redis Alerts
  # ==========================================================================
  - name: redis
    rules:
      # Redis down
      - alert: RedisDown
        expr: redis_up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Redis is down"
          description: "Redis instance {{ $labels.instance }} is unreachable"

      # High memory usage
      - alert: RedisHighMemory
        expr: |
          redis_memory_used_bytes / redis_memory_max_bytes > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis high memory usage"
          description: "Memory usage is at {{ $value | humanizePercentage }}"

      # Too many connections
      - alert: RedisTooManyConnections
        expr: redis_connected_clients > 1000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Redis too many connections"
          description: "Redis has {{ $value }} connected clients"

  # ==========================================================================
  # Infrastructure Alerts
  # ==========================================================================
  - name: infrastructure
    rules:
      # High CPU usage
      - alert: HighCPUUsage
        expr: |
          100 - (avg by(instance) (rate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage on {{ $labels.instance }}"
          description: "CPU usage is {{ $value | humanize }}%"

      # High memory usage
      - alert: HighMemoryUsage
        expr: |
          (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage on {{ $labels.instance }}"
          description: "Memory usage is {{ $value | humanize }}%"

      # Disk space low
      - alert: DiskSpaceLow
        expr: |
          (node_filesystem_avail_bytes{fstype!~"tmpfs|overlay"}
          / node_filesystem_size_bytes{fstype!~"tmpfs|overlay"}) * 100 < 15
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Disk space low on {{ $labels.instance }}"
          description: "Disk {{ $labels.mountpoint }} has only {{ $value | humanize }}% free"

      # Disk space critical
      - alert: DiskSpaceCritical
        expr: |
          (node_filesystem_avail_bytes{fstype!~"tmpfs|overlay"}
          / node_filesystem_size_bytes{fstype!~"tmpfs|overlay"}) * 100 < 5
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Disk space critical on {{ $labels.instance }}"
          description: "Disk {{ $labels.mountpoint }} has only {{ $value | humanize }}% free"

      # Container restart
      - alert: ContainerRestarting
        expr: |
          increase(container_restart_count[1h]) > 3
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Container {{ $labels.name }} is restarting frequently"
          description: "Container has restarted {{ $value }} times in the last hour"
```

---

## 4. Configuration Alertmanager

```yaml
# alertmanager/alertmanager.yml
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@example.com'
  smtp_auth_username: '${SMTP_USER}'
  smtp_auth_password: '${SMTP_PASSWORD}'

  slack_api_url: '${SLACK_WEBHOOK_URL}'

  pagerduty_url: 'https://events.pagerduty.com/v2/enqueue'

# Templates
templates:
  - '/etc/alertmanager/templates/*.tmpl'

# Route tree
route:
  group_by: ['alertname', 'severity', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
  receiver: 'default-receiver'

  routes:
    # Critical alerts - immediate notification
    - match:
        severity: critical
      receiver: 'critical-receiver'
      group_wait: 10s
      repeat_interval: 1h
      continue: true

    # Warning alerts
    - match:
        severity: warning
      receiver: 'warning-receiver'
      group_wait: 1m
      repeat_interval: 4h

    # Database alerts
    - match:
        service: database
      receiver: 'database-team'

    # Infrastructure alerts
    - match:
        service: infrastructure
      receiver: 'infra-team'

# Inhibition rules
inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'instance']

# Receivers
receivers:
  # Default receiver
  - name: 'default-receiver'
    email_configs:
      - to: 'team@example.com'
        send_resolved: true

  # Critical alerts - PagerDuty + Slack
  - name: 'critical-receiver'
    pagerduty_configs:
      - service_key: '${PAGERDUTY_SERVICE_KEY}'
        severity: critical
        description: '{{ .CommonAnnotations.summary }}'
        details:
          firing: '{{ template "pagerduty.default.instances" .Alerts.Firing }}'
          resolved: '{{ template "pagerduty.default.instances" .Alerts.Resolved }}'
    slack_configs:
      - channel: '#alerts-critical'
        send_resolved: true
        title: '🚨 CRITICAL: {{ .CommonAnnotations.summary }}'
        text: '{{ .CommonAnnotations.description }}'
        color: '{{ if eq .Status "firing" }}danger{{ else }}good{{ end }}'
        actions:
          - type: button
            text: 'View in Grafana'
            url: '{{ (index .Alerts 0).GeneratorURL }}'

  # Warning alerts - Slack only
  - name: 'warning-receiver'
    slack_configs:
      - channel: '#alerts-warning'
        send_resolved: true
        title: '⚠️ WARNING: {{ .CommonAnnotations.summary }}'
        text: '{{ .CommonAnnotations.description }}'
        color: '{{ if eq .Status "firing" }}warning{{ else }}good{{ end }}'

  # Database team
  - name: 'database-team'
    email_configs:
      - to: 'dba@example.com'
        send_resolved: true
    slack_configs:
      - channel: '#database-alerts'
        send_resolved: true

  # Infrastructure team
  - name: 'infra-team'
    email_configs:
      - to: 'infra@example.com'
        send_resolved: true
    slack_configs:
      - channel: '#infra-alerts'
        send_resolved: true
```

---

## 5. Installation Grafana

### 5.1 Provisioning Datasources

```yaml
# grafana/provisioning/datasources/datasources.yml
apiVersion: 1

datasources:
  # Prometheus
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    editable: false
    jsonData:
      timeInterval: "15s"
      queryTimeout: "60s"
      httpMethod: POST

  # Alertmanager
  - name: Alertmanager
    type: alertmanager
    access: proxy
    url: http://alertmanager:9093
    editable: false
    jsonData:
      implementation: prometheus

  # Loki (logs - optionnel)
  # - name: Loki
  #   type: loki
  #   access: proxy
  #   url: http://loki:3100
  #   editable: false
```

### 5.2 Provisioning Dashboards

```yaml
# grafana/provisioning/dashboards/dashboards.yml
apiVersion: 1

providers:
  - name: 'Default'
    orgId: 1
    folder: ''
    folderUid: ''
    type: file
    disableDeletion: false
    updateIntervalSeconds: 30
    allowUiUpdates: true
    options:
      path: /var/lib/grafana/dashboards
```

---

## 6. Dashboards Grafana

### 6.1 Dashboard Application

```json
{
  "dashboard": {
    "id": null,
    "uid": "app-overview",
    "title": "Application Overview",
    "tags": ["application", "nextjs"],
    "timezone": "browser",
    "schemaVersion": 38,
    "version": 1,
    "refresh": "30s",
    "panels": [
      {
        "id": 1,
        "title": "Request Rate",
        "type": "stat",
        "gridPos": { "h": 4, "w": 6, "x": 0, "y": 0 },
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m]))",
            "legendFormat": "req/s"
          }
        ],
        "options": {
          "colorMode": "value",
          "graphMode": "area"
        },
        "fieldConfig": {
          "defaults": {
            "unit": "reqps",
            "thresholds": {
              "mode": "absolute",
              "steps": [
                { "color": "red", "value": null },
                { "color": "yellow", "value": 10 },
                { "color": "green", "value": 50 }
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "Error Rate",
        "type": "stat",
        "gridPos": { "h": 4, "w": 6, "x": 6, "y": 0 },
        "targets": [
          {
            "expr": "sum(rate(http_requests_total{status=~\"5..\"}[5m])) / sum(rate(http_requests_total[5m])) * 100",
            "legendFormat": "Error %"
          }
        ],
        "options": {
          "colorMode": "value"
        },
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "thresholds": {
              "mode": "absolute",
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 1 },
                { "color": "red", "value": 5 }
              ]
            }
          }
        }
      },
      {
        "id": 3,
        "title": "P95 Response Time",
        "type": "stat",
        "gridPos": { "h": 4, "w": 6, "x": 12, "y": 0 },
        "targets": [
          {
            "expr": "histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le))",
            "legendFormat": "P95"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "s",
            "thresholds": {
              "mode": "absolute",
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 0.5 },
                { "color": "red", "value": 1 }
              ]
            }
          }
        }
      },
      {
        "id": 4,
        "title": "Active Users",
        "type": "stat",
        "gridPos": { "h": 4, "w": 6, "x": 18, "y": 0 },
        "targets": [
          {
            "expr": "sum(active_sessions_total)",
            "legendFormat": "Users"
          }
        ]
      },
      {
        "id": 5,
        "title": "Request Rate by Endpoint",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 4 },
        "targets": [
          {
            "expr": "sum(rate(http_requests_total[5m])) by (path)",
            "legendFormat": "{{ path }}"
          }
        ],
        "options": {
          "legend": { "displayMode": "table", "placement": "right" }
        }
      },
      {
        "id": 6,
        "title": "Response Time Distribution",
        "type": "heatmap",
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 4 },
        "targets": [
          {
            "expr": "sum(increase(http_request_duration_seconds_bucket[1m])) by (le)",
            "format": "heatmap",
            "legendFormat": "{{ le }}"
          }
        ]
      },
      {
        "id": 7,
        "title": "HTTP Status Codes",
        "type": "piechart",
        "gridPos": { "h": 8, "w": 8, "x": 0, "y": 12 },
        "targets": [
          {
            "expr": "sum(increase(http_requests_total[1h])) by (status)",
            "legendFormat": "{{ status }}"
          }
        ]
      },
      {
        "id": 8,
        "title": "Memory Usage",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 8, "x": 8, "y": 12 },
        "targets": [
          {
            "expr": "process_resident_memory_bytes{job=\"nextjs-app\"}",
            "legendFormat": "Heap Used"
          }
        ],
        "fieldConfig": {
          "defaults": { "unit": "bytes" }
        }
      },
      {
        "id": 9,
        "title": "CPU Usage",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 8, "x": 16, "y": 12 },
        "targets": [
          {
            "expr": "rate(process_cpu_seconds_total{job=\"nextjs-app\"}[5m]) * 100",
            "legendFormat": "CPU %"
          }
        ],
        "fieldConfig": {
          "defaults": { "unit": "percent" }
        }
      }
    ]
  }
}
```

### 6.2 Dashboard Infrastructure

```json
{
  "dashboard": {
    "id": null,
    "uid": "infra-overview",
    "title": "Infrastructure Overview",
    "tags": ["infrastructure", "system"],
    "panels": [
      {
        "id": 1,
        "title": "CPU Usage by Host",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 },
        "targets": [
          {
            "expr": "100 - (avg by(instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)",
            "legendFormat": "{{ instance }}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "max": 100,
            "thresholds": {
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 70 },
                { "color": "red", "value": 90 }
              ]
            }
          }
        }
      },
      {
        "id": 2,
        "title": "Memory Usage by Host",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 },
        "targets": [
          {
            "expr": "(1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100",
            "legendFormat": "{{ instance }}"
          }
        ],
        "fieldConfig": {
          "defaults": { "unit": "percent", "max": 100 }
        }
      },
      {
        "id": 3,
        "title": "Disk Usage",
        "type": "gauge",
        "gridPos": { "h": 8, "w": 8, "x": 0, "y": 8 },
        "targets": [
          {
            "expr": "100 - (node_filesystem_avail_bytes{fstype!~\"tmpfs|overlay\"} / node_filesystem_size_bytes{fstype!~\"tmpfs|overlay\"}) * 100",
            "legendFormat": "{{ mountpoint }}"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "unit": "percent",
            "max": 100,
            "thresholds": {
              "steps": [
                { "color": "green", "value": null },
                { "color": "yellow", "value": 70 },
                { "color": "red", "value": 85 }
              ]
            }
          }
        }
      },
      {
        "id": 4,
        "title": "Network I/O",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 8, "x": 8, "y": 8 },
        "targets": [
          {
            "expr": "rate(node_network_receive_bytes_total{device!~\"lo|docker.*|veth.*\"}[5m])",
            "legendFormat": "{{ instance }} - RX"
          },
          {
            "expr": "rate(node_network_transmit_bytes_total{device!~\"lo|docker.*|veth.*\"}[5m])",
            "legendFormat": "{{ instance }} - TX"
          }
        ],
        "fieldConfig": {
          "defaults": { "unit": "Bps" }
        }
      },
      {
        "id": 5,
        "title": "Container CPU Usage",
        "type": "timeseries",
        "gridPos": { "h": 8, "w": 8, "x": 16, "y": 8 },
        "targets": [
          {
            "expr": "sum(rate(container_cpu_usage_seconds_total{name!=\"\"}[5m])) by (name) * 100",
            "legendFormat": "{{ name }}"
          }
        ],
        "fieldConfig": {
          "defaults": { "unit": "percent" }
        }
      }
    ]
  }
}
```

---

## 7. Métriques Application

### 7.1 Instrumentation Next.js

```typescript
// lib/metrics/prometheus.ts
import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';

// Create a Registry
export const register = new Registry();

// Add default metrics
collectDefaultMetrics({ register });

// =============================================================================
// HTTP Metrics
// =============================================================================
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const httpRequestSize = new Histogram({
  name: 'http_request_size_bytes',
  help: 'Size of HTTP requests in bytes',
  labelNames: ['method', 'path'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register],
});

export const httpResponseSize = new Histogram({
  name: 'http_response_size_bytes',
  help: 'Size of HTTP responses in bytes',
  labelNames: ['method', 'path'],
  buckets: [100, 1000, 10000, 100000, 1000000],
  registers: [register],
});

// =============================================================================
// Business Metrics
// =============================================================================
export const activeSessionsGauge = new Gauge({
  name: 'active_sessions_total',
  help: 'Number of active user sessions',
  registers: [register],
});

export const appointmentsCreatedTotal = new Counter({
  name: 'appointments_created_total',
  help: 'Total number of appointments created',
  labelNames: ['service_type'],
  registers: [register],
});

export const revenueTotal = new Counter({
  name: 'revenue_total',
  help: 'Total revenue in cents',
  labelNames: ['currency', 'payment_method'],
  registers: [register],
});

export const clientsTotal = new Gauge({
  name: 'clients_total',
  help: 'Total number of clients',
  registers: [register],
});

// =============================================================================
// Database Metrics
// =============================================================================
export const dbQueryDuration = new Histogram({
  name: 'db_query_duration_seconds',
  help: 'Duration of database queries in seconds',
  labelNames: ['operation', 'table'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1],
  registers: [register],
});

export const dbConnectionPool = new Gauge({
  name: 'db_connection_pool_size',
  help: 'Size of database connection pool',
  labelNames: ['state'],
  registers: [register],
});

// =============================================================================
// Cache Metrics
// =============================================================================
export const cacheHitsTotal = new Counter({
  name: 'cache_hits_total',
  help: 'Total number of cache hits',
  labelNames: ['cache_name'],
  registers: [register],
});

export const cacheMissesTotal = new Counter({
  name: 'cache_misses_total',
  help: 'Total number of cache misses',
  labelNames: ['cache_name'],
  registers: [register],
});

// =============================================================================
// External API Metrics
// =============================================================================
export const externalApiDuration = new Histogram({
  name: 'external_api_duration_seconds',
  help: 'Duration of external API calls in seconds',
  labelNames: ['api', 'endpoint', 'status'],
  buckets: [0.1, 0.25, 0.5, 1, 2.5, 5, 10],
  registers: [register],
});

export const externalApiErrors = new Counter({
  name: 'external_api_errors_total',
  help: 'Total number of external API errors',
  labelNames: ['api', 'endpoint', 'error_type'],
  registers: [register],
});
```

### 7.2 Middleware de Métriques

```typescript
// middleware/metrics.ts
import { NextRequest, NextResponse } from 'next/server';
import {
  httpRequestsTotal,
  httpRequestDuration,
  httpRequestSize,
  httpResponseSize,
} from '@/lib/metrics/prometheus';

export function metricsMiddleware(request: NextRequest) {
  const start = Date.now();
  const method = request.method;
  const path = getPathPattern(request.nextUrl.pathname);

  // Track request size
  const requestSize = parseInt(request.headers.get('content-length') || '0');
  if (requestSize > 0) {
    httpRequestSize.labels(method, path).observe(requestSize);
  }

  return {
    onResponse: (response: NextResponse) => {
      const duration = (Date.now() - start) / 1000;
      const status = response.status.toString();

      // Record metrics
      httpRequestsTotal.labels(method, path, status).inc();
      httpRequestDuration.labels(method, path, status).observe(duration);

      // Track response size
      const responseSize = parseInt(response.headers.get('content-length') || '0');
      if (responseSize > 0) {
        httpResponseSize.labels(method, path).observe(responseSize);
      }

      return response;
    },
  };
}

// Normalize paths to avoid high cardinality
function getPathPattern(pathname: string): string {
  // Remove IDs and UUIDs from paths
  return pathname
    .replace(/\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '/:id')
    .replace(/\/\d+/g, '/:id')
    .replace(/\/$/, '') || '/';
}
```

### 7.3 API Route pour Métriques

```typescript
// app/api/metrics/route.ts
import { NextResponse } from 'next/server';
import { register } from '@/lib/metrics/prometheus';

export async function GET(request: Request) {
  // Check for authentication in production
  const authHeader = request.headers.get('authorization');
  if (process.env.NODE_ENV === 'production') {
    const expectedToken = process.env.METRICS_TOKEN;
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    const metrics = await register.metrics();

    return new NextResponse(metrics, {
      headers: {
        'Content-Type': register.contentType,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('Error collecting metrics:', error);
    return new NextResponse('Error collecting metrics', { status: 500 });
  }
}
```

### 7.4 Hook pour Business Metrics

```typescript
// lib/metrics/businessMetrics.ts
import {
  appointmentsCreatedTotal,
  revenueTotal,
  clientsTotal,
} from './prometheus';

export const businessMetrics = {
  // Track appointment creation
  trackAppointmentCreated(serviceType: string) {
    appointmentsCreatedTotal.labels(serviceType).inc();
  },

  // Track revenue
  trackRevenue(amount: number, currency: string, paymentMethod: string) {
    // Convert to cents to avoid floating point issues
    const amountInCents = Math.round(amount * 100);
    revenueTotal.labels(currency, paymentMethod).inc(amountInCents);
  },

  // Update client count
  setClientCount(count: number) {
    clientsTotal.set(count);
  },

  // Track session
  trackSession: {
    start: () => {
      const { activeSessionsGauge } = require('./prometheus');
      activeSessionsGauge.inc();
    },
    end: () => {
      const { activeSessionsGauge } = require('./prometheus');
      activeSessionsGauge.dec();
    },
  },
};
```

---

## 8. Alerting Avancé

### 8.1 Alertes Grafana

```yaml
# grafana/provisioning/alerting/alerting.yml
apiVersion: 1

groups:
  - orgId: 1
    name: Application Alerts
    folder: Alerts
    interval: 1m
    rules:
      - uid: high-error-rate
        title: High Error Rate
        condition: C
        data:
          - refId: A
            relativeTimeRange:
              from: 300
              to: 0
            datasourceUid: prometheus
            model:
              expr: sum(rate(http_requests_total{status=~"5.."}[5m])) / sum(rate(http_requests_total[5m])) * 100
          - refId: B
            relativeTimeRange:
              from: 300
              to: 0
            datasourceUid: __expr__
            model:
              conditions:
                - evaluator:
                    params: [5]
                    type: gt
              type: threshold
              refId: B
        noDataState: NoData
        execErrState: Error
        for: 5m
        annotations:
          summary: Error rate is above 5%
          description: Current error rate is {{ $values.A }}%
        labels:
          severity: critical
        isPaused: false

contactPoints:
  - orgId: 1
    name: slack-alerts
    receivers:
      - uid: slack
        type: slack
        settings:
          url: ${SLACK_WEBHOOK_URL}
          recipient: '#alerts'
          mentionChannel: channel
          text: |
            {{ range .Alerts }}
            *Alert:* {{ .Labels.alertname }}
            *Status:* {{ .Status }}
            *Summary:* {{ .Annotations.summary }}
            {{ end }}

policies:
  - orgId: 1
    receiver: slack-alerts
    group_by: ['alertname']
    group_wait: 30s
    group_interval: 5m
    repeat_interval: 4h
```

### 8.2 SLO (Service Level Objectives)

```yaml
# prometheus/rules/slo.yml
groups:
  - name: slo
    rules:
      # Availability SLO (99.9%)
      - record: slo:availability:ratio
        expr: |
          1 - (
            sum(rate(http_requests_total{status=~"5.."}[30d]))
            / sum(rate(http_requests_total[30d]))
          )

      # Error budget remaining
      - record: slo:error_budget:remaining
        expr: |
          1 - (
            (1 - slo:availability:ratio)
            / (1 - 0.999)
          )

      # Alert when error budget is low
      - alert: ErrorBudgetLow
        expr: slo:error_budget:remaining < 0.2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Error budget is running low"
          description: "Only {{ $value | humanizePercentage }} of error budget remaining"

      # Latency SLO (95% of requests < 500ms)
      - record: slo:latency:ratio
        expr: |
          sum(rate(http_request_duration_seconds_bucket{le="0.5"}[30d]))
          / sum(rate(http_request_duration_seconds_count[30d]))

      # Alert when latency SLO is breached
      - alert: LatencySLOBreach
        expr: slo:latency:ratio < 0.95
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Latency SLO breach"
          description: "Only {{ $value | humanizePercentage }} of requests are under 500ms"
```

---

## 9. Intégration Next.js

### 9.1 Package.json Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "dev:metrics": "ENABLE_METRICS=true next dev",
    "build": "next build",
    "start": "ENABLE_METRICS=true next start",
    "metrics:dev": "docker-compose -f docker-compose.monitoring.yml up -d",
    "metrics:stop": "docker-compose -f docker-compose.monitoring.yml down"
  },
  "dependencies": {
    "prom-client": "^15.1.0"
  }
}
```

### 9.2 Configuration Environment

```bash
# .env.monitoring
# Prometheus
METRICS_TOKEN=your-secure-metrics-token

# Grafana
GRAFANA_ADMIN_USER=admin
GRAFANA_ADMIN_PASSWORD=secure-password-here
GRAFANA_ROOT_URL=https://grafana.example.com

# Alerting
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxx/yyy/zzz
PAGERDUTY_SERVICE_KEY=your-pagerduty-key

# SMTP for alerts
SMTP_HOST=smtp.gmail.com:587
SMTP_USER=alerts@example.com
SMTP_PASSWORD=app-password
SMTP_FROM=alerts@example.com

# Database exporters
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=saloon_management
```

### 9.3 Health Check Endpoint

```typescript
// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: { status: string; latency?: number };
    redis: { status: string; latency?: number };
    memory: { used: number; total: number; percentage: number };
  };
}

export async function GET() {
  const checks: HealthStatus['checks'] = {
    database: { status: 'unknown' },
    redis: { status: 'unknown' },
    memory: { used: 0, total: 0, percentage: 0 },
  };

  let overallStatus: HealthStatus['status'] = 'healthy';

  // Check database
  try {
    const dbStart = Date.now();
    await db.$queryRaw`SELECT 1`;
    checks.database = {
      status: 'healthy',
      latency: Date.now() - dbStart,
    };
  } catch (error) {
    checks.database = { status: 'unhealthy' };
    overallStatus = 'unhealthy';
  }

  // Check Redis
  try {
    const redisStart = Date.now();
    await redis.ping();
    checks.redis = {
      status: 'healthy',
      latency: Date.now() - redisStart,
    };
  } catch (error) {
    checks.redis = { status: 'unhealthy' };
    if (overallStatus !== 'unhealthy') {
      overallStatus = 'degraded';
    }
  }

  // Check memory
  const memUsage = process.memoryUsage();
  checks.memory = {
    used: memUsage.heapUsed,
    total: memUsage.heapTotal,
    percentage: (memUsage.heapUsed / memUsage.heapTotal) * 100,
  };

  if (checks.memory.percentage > 90) {
    if (overallStatus !== 'unhealthy') {
      overallStatus = 'degraded';
    }
  }

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || 'unknown',
    checks,
  };

  const statusCode = overallStatus === 'healthy' ? 200 : overallStatus === 'degraded' ? 200 : 503;

  return NextResponse.json(health, { status: statusCode });
}
```

---

## 10. Production Best Practices

### 10.1 Haute Disponibilité

```yaml
# kubernetes/prometheus-ha.yml
apiVersion: monitoring.coreos.com/v1
kind: Prometheus
metadata:
  name: prometheus
  namespace: monitoring
spec:
  replicas: 2
  retention: 30d
  retentionSize: 50GB

  # Persistent storage
  storage:
    volumeClaimTemplate:
      spec:
        storageClassName: fast-ssd
        resources:
          requests:
            storage: 100Gi

  # Resources
  resources:
    requests:
      memory: 2Gi
      cpu: 500m
    limits:
      memory: 4Gi
      cpu: 2000m

  # Affinity for HA
  affinity:
    podAntiAffinity:
      requiredDuringSchedulingIgnoredDuringExecution:
        - labelSelector:
            matchLabels:
              prometheus: prometheus
          topologyKey: kubernetes.io/hostname

  # Service monitors
  serviceMonitorSelector:
    matchLabels:
      team: frontend

  # Alertmanager
  alerting:
    alertmanagers:
      - namespace: monitoring
        name: alertmanager-main
        port: web
```

### 10.2 Retention et Performance

```yaml
# prometheus/prometheus.yml (production)
global:
  scrape_interval: 15s
  evaluation_interval: 15s

  # External labels for federation
  external_labels:
    cluster: production
    region: eu-west-1

# Storage configuration (flags)
# --storage.tsdb.retention.time=30d
# --storage.tsdb.retention.size=50GB
# --storage.tsdb.wal-compression
# --storage.tsdb.max-block-duration=2h
# --query.max-samples=50000000

# Remote write for long-term storage (Thanos/Mimir)
remote_write:
  - url: "http://thanos-receive:19291/api/v1/receive"
    queue_config:
      max_samples_per_send: 10000
      batch_send_deadline: 5s
      capacity: 100000
```

### 10.3 Security

```yaml
# prometheus/prometheus.yml (avec auth)
global:
  scrape_interval: 15s

# Basic auth pour les targets sensibles
scrape_configs:
  - job_name: 'nextjs-app'
    scheme: https
    tls_config:
      ca_file: /etc/prometheus/certs/ca.crt
    basic_auth:
      username: prometheus
      password_file: /etc/prometheus/secrets/scrape_password
    static_configs:
      - targets: ['app:3000']
```

### 10.4 Grafana en Production

```ini
# grafana/grafana.ini
[server]
protocol = https
cert_file = /etc/grafana/ssl/grafana.crt
cert_key = /etc/grafana/ssl/grafana.key
root_url = https://grafana.example.com

[security]
admin_user = admin
admin_password = ${GRAFANA_ADMIN_PASSWORD}
secret_key = ${GRAFANA_SECRET_KEY}
disable_gravatar = true
cookie_secure = true
cookie_samesite = strict

[auth]
disable_login_form = false
oauth_auto_login = true

[auth.generic_oauth]
enabled = true
name = Keycloak
allow_sign_up = true
client_id = grafana
client_secret = ${KEYCLOAK_CLIENT_SECRET}
scopes = openid profile email
auth_url = https://keycloak.example.com/realms/main/protocol/openid-connect/auth
token_url = https://keycloak.example.com/realms/main/protocol/openid-connect/token
api_url = https://keycloak.example.com/realms/main/protocol/openid-connect/userinfo
role_attribute_path = contains(groups[*], 'grafana-admin') && 'Admin' || 'Viewer'

[database]
type = postgres
host = postgres:5432
name = grafana
user = grafana
password = ${GRAFANA_DB_PASSWORD}
ssl_mode = require

[session]
provider = redis
provider_config = addr=redis:6379,pool_size=100,db=0,prefix=grafana

[analytics]
reporting_enabled = false
check_for_updates = false
```

---

## 📚 Ressources

### Documentation Officielle
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [PromQL Cheat Sheet](https://promlabs.com/promql-cheat-sheet/)
- [Alertmanager Configuration](https://prometheus.io/docs/alerting/latest/configuration/)

### Dashboards Recommandés
- [Node Exporter Full](https://grafana.com/grafana/dashboards/1860)
- [Docker Container & Swarm](https://grafana.com/grafana/dashboards/893)
- [PostgreSQL Database](https://grafana.com/grafana/dashboards/9628)
- [Redis Dashboard](https://grafana.com/grafana/dashboards/11835)

### Best Practices
- [Prometheus Best Practices](https://prometheus.io/docs/practices/naming/)
- [SRE Workbook - Monitoring](https://sre.google/workbook/monitoring/)
- [The RED Method](https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/)

---

**Dernière mise à jour** : 2026-01-18
