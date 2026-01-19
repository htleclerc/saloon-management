# MCD - Modèle Conceptuel de Données (Draft Phase 0)

> **Approche** : Frontend leads Backend. Le modèle est dicté par les besoins de l'UI.

---

## 🏗️ Entités Principales

### 1. Tenant (Salon)
*Propriétaire du SaaS. Isolation des données.*
- `id`: UUID (PK)
- `name`: string
- `subdomain`: string
- `created_at`: datetime

### 2. User (Compte Keycloak)
*Utilisateurs authentifiés (SuperAdmin, Owner, Manager, Worker, Client).*
- `id`: UUID (Keycloak Subject ID)
- `tenant_id`: UUID (FK)
- `email`: string
- `role`: enum (RBAC)

### 3. Worker (Employé)
*Ceux qui effectuent les prestations.*
- `id`: Int (PK)
- `tenant_id`: UUID (FK)
- `name`: string
- `avatar`: string (URL)
- `status`: enum (Active, Inactive)
- `sharing_key`: Int (0-100)
- `color`: string (Hex)

### 4. Client
- `id`: Int (PK)
- `tenant_id`: UUID (FK)
- `name`: string
- `email`: string
- `phone`: string

### 5. Service (Prestation)
- `id`: Int (PK)
- `tenant_id`: UUID (FK)
- `name`: string
- `price`: Decimal
- `duration`: Int (minutes)

### 6. Booking (Rendez-vous)
- `id`: Int (PK)
- `tenant_id`: UUID (FK)
- `client_id`: Int (FK)
- `worker_id`: Int (FK)
- `service_id`: Int (FK)
- `date`: datetime
- `status`: enum (Pending, Confirmed, Cancelled, Completed)

---

## 🔗 Relations

- **Tenant 1:N Users** (Un salon a plusieurs utilisateurs)
- **Tenant 1:N Workers** (Un salon a plusieurs employés)
- **Tenant 1:N Clients** (Un salon a plusieurs clients)
- **Tenant 1:N Services** (Un salon a plusieurs services)
- **Booking N:1 Client** (Un rendez-vous appartient à un client)
- **Booking N:1 Worker** (Un rendez-vous est assigné à un employé)
- **Booking N:1 Service** (Un rendez-vous concerne un service)

---

## 📐 Validation UI

- [ ] Match `Worker` type in `frontend/types/index.ts`
- [ ] Match `Client` type in `frontend/types/index.ts`
- [ ] Match `Service` type in `frontend/types/index.ts`
- [ ] Match Dashboard KPIs needs (Revenue per worker, etc.)
