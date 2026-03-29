# Saloon Management - Start Infrastructure
# This script starts PostgreSQL, Redis, and Keycloak

Write-Host "🚀 Starting Saloon Infrastructure..." -ForegroundColor Cyan

# Check for Docker
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Error: Docker is not installed or not in PATH." -ForegroundColor Red
    exit 1
}

# Start containers
docker-compose -f docker-compose.dev.yml --env-file .env.docker up -d

Write-Host "`n📊 Service Status:" -ForegroundColor Green
docker-compose -f docker-compose.dev.yml ps

Write-Host "`n✅ Infrastructure is running!" -ForegroundColor Green
Write-Host "🔗 Keycloak: http://localhost:8080" -ForegroundColor Yellow
Write-Host "🔗 Mailpit:  http://localhost:8025" -ForegroundColor Yellow
Write-Host "🐘 Postgres: localhost:5432" -ForegroundColor Yellow
Write-Host "🚀 Redis:    localhost:6379" -ForegroundColor Yellow
