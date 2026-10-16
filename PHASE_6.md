# PHASE 6 - Tests & Intégration

> **Statut : ⏳ EN COURS** (phase active de consolidation)
> **Contexte Agent** : À lire avec [CONTEXT.md](CONTEXT.md)

---

## 🎯 Objectif

Sécuriser le produit existant par des tests automatisés sur les parcours critiques, une CI et une documentation de déploiement.

---

## 📊 État Actuel

### Tests unitaires (Vitest)
- ✅ Services couverts : Booking, Client, Expense, Income, Invoice, Notification, Payroll, Salon, Service, Stats, Tips, Worker
- ✅ `lib/permissions.test.ts`
- ✅ Composants : PaymentHistoryModal, PaymentStatusBadge, WorkerPaymentsModal
- ✅ Page : `app/income/page.test.tsx`
- ⚠️ Non couverts : PerformanceStats, Product, PromoCode, RevenueStats, Storage, Token services ; providers ; la plupart des pages

### Tests E2E (Playwright)
- ⚠️ Un seul fichier `e2e/smoke.spec.ts` (titre + accès à la page login)
- ⚠️ Contient un chemin local Windows en dur pour les captures d'écran : à retirer

### CI / Déploiement
- ❌ Aucune CI
- ❌ Aucun guide de déploiement production

---

## 📦 Livrables

### 1. Tests E2E des parcours critiques
- [ ] Login / logout / reset mot de passe
- [ ] Onboarding d'un salon
- [ ] Création d'un worker et d'un client
- [ ] Prise de rendez-vous → confirmation → revenu généré
- [ ] Saisie d'une dépense et export d'un rapport
- [ ] Parcours billing (checkout en mode test Stripe)
- [ ] Exécution sur les modes `demo-local` et `demo-supabase`

### 2. Couverture unitaire
- [ ] Services restants
- [ ] `StorageProviderFactory` et `LocalStorageProvider`
- [ ] Règles `lib/domain/rules`
- [ ] Objectif : > 70 % sur `lib/`

### 3. CI
- [ ] Workflow GitHub Actions : `lint`, `type-check`, `test` sur chaque PR
- [ ] Job E2E optionnel (nightly ou sur label)

### 4. Documentation
- [ ] Guide de déploiement (variables d'environnement, Supabase, Stripe, Brevo)
- [ ] Documentation utilisateur (par rôle)
- [ ] Nettoyage : retirer `debug_output.txt`, `playwright-report/`, `test-results/` du dépôt

---

## ✅ Critères de Succès

1. `npm run lint && npm run type-check && npm run test` passent en CI
2. Les parcours critiques E2E passent sur `demo-local`
3. Un nouveau développeur peut déployer en suivant le guide

---

**Dernière mise à jour** : 2026-10-16
