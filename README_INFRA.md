# Local Infrastructure Setup (Docker)

This directory contains the infrastructure configuration for the Saloon Management development environment.

> ⚠️ **État d'usage (2026-10-16)** : l'application utilise **Supabase** pour l'authentification et les données. Keycloak et Redis sont provisionnés par ce compose mais ne sont pas branchés au frontend. Mailpit reste utile pour tester les emails en local. Voir [PHASE_5.md](PHASE_5.md) et [CONTEXT.md](CONTEXT.md).

## Services Included
- **PostgreSQL 16**: Primary database.
- **Redis 7**: Cache and session management.
- **Keycloak 24**: Identity and Access Management (IAM).
- **Mailpit**: SMTP testing server.

## Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose

## Quick Start
To start all services, run the following command in PowerShell:

```powershell
./scripts/start-infra.ps1
```

Or manually:
```bash
docker-compose -f docker-compose.dev.yml --env-file .env.docker up -d
```

## Management URLs
- **Keycloak Admin Console**: port défini par `KEYCLOAK_PORT` dans `.env.docker` (voir `docker-compose.dev.yml`)
  - User: `admin`
  - Password: `admin` (configured in `.env.docker`)
- **Mailpit (Email UI)**: [http://localhost:8025](http://localhost:8025)

## Connection Details (Internal)
- **Postgres Host**: `postgres` (port 5432)
- **Redis Host**: `redis` (port 6379)
- **Keycloak Host**: `keycloak` (port 8080)

## Troubleshooting
- If Keycloak fails to start, check the Postgres health status.
- Keycloak auto-imports the realm from `docker/keycloak/realm-export.json` on the first launch.
