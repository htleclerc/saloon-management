# MCD - Modèle Conceptuel de Données (Phase 1)

> **Approche** : Frontend leads Backend. Le modèle est dicté par les besoins de l'UI et du `SupabaseProvider`.

---

## 🏗️ Entités Principales (Multi-Tenant)

Toutes les tables (sauf `salons` et `users`) possèdent une FK `salon_id`.

### 1. Salon (Tenant)
- `id`: BIGSERIAL (PK)
- `name`: string
- `slug`: string (Unique, URL friendly)
- `address`, `city`, `postal_code`, `country`: string
- `timezone`, `currency`: string
- `subscription_plan`, `subscription_status`: enum
- `is_active`: boolean

### 2. User (Global)
- `id`: BIGSERIAL (PK)
- `user_code`: string (Unique, 12 chars)
- `email`: string (Unique)
- `first_name`, `last_name`: string
- `role`: enum (super_admin, owner, manager, worker, client)
- `is_active`: boolean

### 3. Salon Workforce
- **Worker**: Employé rattaché à un salon.
  - `id`: BIGSERIAL (PK)
  - `salon_id`: FK
  - `user_id`: FK (Optionnel, lien vers compte User)
  - `name`, `status`, `sharing_key`, `color`, `bio`, `specialties` (JSON)
- **UserSalon**: Table de liaison pour les accès RBAC au salon.

### 4. Salon Business
- **Client**: Base de données clients du salon.
- **ServiceCategory**: Organisation des prestations.
- **Service**: Prestations (nom, prix, durée).
- **Product**: Inventaire (prix, stock, sku).
- **PromoCode**: Codes promo (type, valeur, limites).

### 5. Operations
- **Booking**: Rendez-vous.
  - Relations N:N via `booking_services` et `booking_workers`.
  - `status`: Created, Pending, Confirmed, Started, Finished, Cancelled, Closed.
- **Income**: Encaissements.
  - `worker_shares`: Ventilation du CA par employé (Revenu split).
- **Expense**: Dépenses.

---

## 🔗 Relations Clés

- **Salon 1:N Clients/Workers/Services/Products**
- **User N:N Salon** (via `user_salons`)
- **Booking N:N Service** (via `booking_services`)
- **Booking N:N Worker** (via `booking_workers`)
- **Income 1:N WorkerShares** (Règle de gestion du CA)

---

## 📐 Vues de Statistiques (Dashboard KPIs)

- `salon_stats`: CA du mois, nombre de RDV, dépenses.
- `worker_stats`: Performance individuelle (taux d'occupation, CA généré).
- `client_stats`: LTV (Lifetime Value), date du dernier passage.

