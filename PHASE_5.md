# PHASE 5 - Backend Go API

> **Statut : ❌ ABANDONNÉE** (décision actée le 2026-10-16, voir [CONTEXT.md](CONTEXT.md))
> **Contexte Agent** : Document conservé comme historique. Ne pas démarrer cette phase sans nouvelle décision.

---

## 🎯 Objectif Initial

Développer une API REST complète en Go avec Gin, PostgreSQL, Redis et Keycloak, et brancher un `ApiProvider` côté frontend.

---

## 📦 Livrables Prévus (non réalisés)

- [ ] Structure Clean Architecture backend
- [ ] Endpoints CRUD Workers, Clients, Bookings
- [ ] Middleware Auth (Keycloak JWT)
- [ ] Cache Redis
- [ ] `frontend/lib/providers/api.provider.ts`
- [ ] Tests unitaires backend

---

## 🔁 Ce qui a remplacé cette phase

Le mode `normal` s'appuie directement sur **Supabase** (PostgreSQL + Auth + Storage + RLS) via `SupabaseProvider`. Les besoins serveur sont couverts par :

| Besoin initial | Solution en place |
|----------------|-------------------|
| API REST CRUD | Supabase client + RLS (`frontend/supabase/schema_v2.sql`, `policies_v2.sql`) |
| Auth Keycloak JWT | Supabase Auth + `frontend/middleware.ts` |
| Cache Redis | Non nécessaire à ce stade |
| Logique serveur | Routes API Next.js (`frontend/app/api/`) : paiement, emails, invitations |
| Webhooks | `frontend/app/api/payment/webhook/{stripe,paypal}` |

Keycloak et Redis restent présents dans `docker-compose.dev.yml` mais ne sont pas utilisés par l'application.

---

## 🔮 Conditions de Réouverture

Un backend dédié sera reconsidéré si l'un de ces cas se présente :
- Logique métier lourde impossible à exprimer en RLS ou en fonctions Postgres
- Besoin d'intégrations serveur longues (files d'attente, batchs, IA avec cache)
- Exigence d'hébergement on-premise sans Supabase

Dans ce cas, créer un ADR dans `docs/adr/` avant de commencer.

---

**Dernière mise à jour** : 2026-10-16
