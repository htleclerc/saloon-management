# Tester le booking

> Guide pratique pour vérifier le parcours de réservation : page publique sans compte, réservation connectée, extras, acompte, prestation partagée. Toutes les commandes se lancent dans `frontend/`.

---

## 1. Les trois niveaux de test

| Niveau | Commande | Ce qui est couvert | Prérequis |
|--------|----------|--------------------|-----------|
| Unitaires (Vitest) | `npm run test` | Règles de prix et d'acompte, calcul des créneaux, services métier (add-ons, acompte, équipe), validation Zod | Aucun |
| E2E page publique (Playwright, API mockées) | `npx playwright test e2e/public-booking.spec.ts` | Parcours complet d'une cliente sur `/book/[slug]` : prestation → extra → styliste → créneau → coordonnées → mentions → confirmation | Node + Chromium Playwright, variables Supabase factices (voir § 3) |
| Manuel sur données réelles | navigateur | Création en base, acompte Stripe, webhook, affichage côté salon | Projet Supabase + migrations, clés Stripe test |

Les tests unitaires du booking :

```
lib/domain/rules/pricingRules.test.ts        totaux, snapshots, acompte
lib/domain/rules/availabilityRules.test.ts   créneaux, stylistes occupées, « n'importe qui », passé, dernière heure de début
lib/services/BookingService.addons.test.ts   extras figés sur la réservation
lib/services/BookingService.deposit.test.ts  règle d'acompte et confirmation au paiement
lib/services/BookingService.team.test.ts     seconde styliste, disponibilité, synchronisation des jonctions
lib/services/ServiceService.addons.test.ts   catalogue d'extras
```

---

## 2. Page publique de réservation (sans compte)

Chaque salon a une page publique à l'adresse **`/book/<slug-du-salon>`**, par exemple `https://votre-domaine/book/demo-salon`. Le lien et son QR code sont affichés dans **Configuration > Atelier > Votre lien public de réservation**.

Fonctionnement :
- La page lit `GET /api/public/salons/<slug>` : fiche du salon, règles (acompte, mentions, horaires, intervalle de créneau), prestations actives avec leurs extras, stylistes actives.
- Les créneaux viennent de `GET /api/public/salons/<slug>/availability?date=&duration=&workerId=` et tiennent compte des réservations existantes, des horaires d'ouverture, de la durée totale (prestations + extras) et de la styliste choisie.
- La réservation est créée par `POST /api/public/salons/<slug>/bookings`. Le serveur recalcule prix, durée et acompte, vérifie que le créneau est encore libre (409 sinon), retrouve ou crée la cliente (e-mail ou téléphone), et renvoie une URL de paiement Stripe si un acompte est dû.
- Ces routes utilisent la clé service Supabase côté serveur : `SUPABASE_SERVICE_ROLE_KEY` doit être définie. Le mode `demo-local` (localStorage) ne s'applique pas à la page publique, qui lit toujours Supabase.

Scénario manuel :
1. Dans l'application, aller dans Configuration > Atelier, régler l'acompte (ex. 25 %) et ajouter deux mentions, enregistrer.
2. Configuration > Extras : créer « Lower back » (+30, +60 min). Prestations > modifier une prestation > cocher l'extra.
3. Ouvrir le lien public dans une fenêtre privée (aucune session).
4. Choisir la prestation, l'extra, une styliste, une date : les créneaux déjà pris doivent être barrés.
5. Saisir prénom, nom, téléphone, cocher les mentions, confirmer.
   - Sans fournisseur de paiement configuré : écran « Réservation reçue », acompte signalé « simulé » ou « à encaisser ».
   - Avec Stripe test : redirection vers Checkout, carte `4242 4242 4242 4242`, retour sur `/book/<slug>?deposit=success`.
6. Côté salon, Rendez-vous : la réservation apparaît en `Pending` avec le badge d'acompte ; après le webhook Stripe elle passe en `Confirmed`.

---

## 3. Lancer le test E2E de la page publique

Le test mocke les trois routes API : pas besoin de Supabase ni de Stripe, mais le serveur Next doit démarrer, et le middleware exige des variables Supabase (des valeurs factices suffisent).

```bash
cd frontend
npm install
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321 NEXT_PUBLIC_SUPABASE_ANON_KEY=dummy \
  npx playwright test e2e/public-booking.spec.ts
```

Playwright démarre `npm run dev` tout seul (voir `playwright.config.ts`). Pour voir le navigateur : ajouter `--headed`, ou `--ui`.

Ce que le test vérifie : sélection d'une prestation, ajout d'un extra, choix d'une styliste, créneau indisponible désactivé, total recalculé (240 + 30 = 270), bouton bloqué tant que les mentions ne sont pas cochées, libellé « payer l'acompte 67,50 », écran de confirmation, et le corps exact envoyé à l'API.

---

## 4. Tester l'acompte avec Stripe en mode test

1. `.env.local` : `PAYMENT_PROVIDERS=stripe`, `STRIPE_SECRET_KEY=sk_test_...`, `STRIPE_WEBHOOK_SECRET=whsec_...`.
2. Rediriger les webhooks vers la machine locale :
   ```bash
   stripe listen --forward-to localhost:3000/api/payment/webhook/stripe
   ```
   et copier le `whsec_` affiché dans `STRIPE_WEBHOOK_SECRET`.
3. Réserver depuis la page publique ou depuis `/appointments/book` en tant que cliente connectée.
4. Payer avec `4242 4242 4242 4242` (succès) ou `4000 0000 0000 9995` (refus).
5. Vérifier en base : `bookings.deposit_status = 'paid'`, `status = 'Confirmed'`, une ligne `interaction_history` « deposit_paid », et une ligne `payment_events` pour l'idempotence.

Événements Stripe écoutés : `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`. Les sessions portent `metadata.kind = booking_deposit` et `metadata.booking_id`.

---

## 5. Réservation connectée (cliente avec compte ou salon)

- Cliente connectée : `/appointments/book`. Salon listé avec ville et adresse (auto-sélection s'il n'y en a qu'un), prestations + extras, styliste ou « n'importe qui », date, récapitulatif avec mentions et acompte. En mode `demo-local` l'acompte est simulé ; sinon redirection Stripe.
- Salon (manager ou owner) : même page, l'étape cliente en premier, pas d'acompte.
- Rendez-vous > détail : ajouter une seconde styliste (prestation longue). Une styliste déjà prise sur le créneau est refusée avec un message.

---

## 6. Prérequis base de données

Exécuter dans l'ordre sur Supabase :
```
supabase/migrations/20261017_service_addons.sql
supabase/migrations/20261018_booking_deposit.sql
supabase/migrations/20261019_booking_team.sql
```
Les seeds `seed_v2.sql` créent le salon `demo-salon` (slug utilisable sur la page publique).

---

## 7. Points connus

- Pas de limitation de débit sur les routes publiques : à ajouter avant une exposition à grande échelle (middleware ou proxy).
- La page publique ne gère pas encore la liste d'attente ni la reprogrammation par la cliente.
- Les rappels SMS/e-mail ne sont pas branchés sur les réservations publiques.

**Dernière mise à jour** : 2026-10-16
