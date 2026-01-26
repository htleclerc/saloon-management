# Instructions - Adorable Braids Salon Management System

## Vue d'ensemble

Système de gestion complet pour un salon de coiffure spécialisé dans les tresses (braids) avec gestion des salaires, revenus, dépenses et profits. Système multi-tenant permettant la gestion de plusieurs salons avec leurs propres utilisateurs et données.

> [!NOTE]
> **Status**: Cleanup & Optimization (Pre-Phase 3)
> **Goal**: Strict type safety, no `any`, full i18n, and robust documentation.

## Fonctionnalités principales

### 1. Gestion des Braiders (Coiffeuses)

- **Liste des braiders** : Orphelia, Braider 2, Braider 3, etc. (jusqu'à 17 braiders)
- **Taux de partage (Sharing Key)** : Chaque braider a un pourcentage de partage des revenus
  - Exemples : Orphelia (0.7 = 70%), Braider 2 (0.55 = 55%), Braider 3 (0.6 = 60%)
- **Statut actif/inactif**

### 2. Suivi quotidien des revenus (Daily & Incomes)

- **Enregistrement quotidien** : Date, Client, Prix
- **Attribution aux braiders** : Chaque revenu est attribué à un ou plusieurs braiders
- **Calcul automatique du salaire** : Prix × Sharing Key = Salaire du braider
- **Vue par semaine** : Organisation par semaines (Week 1, Week 2, etc.)

### 3. Workflow des Revenus (Income Workflow)

Le système gère un cycle de vie complet pour chaque entrée de revenu (Income) afin de garantir la transparence entre les workers et l'administration.

#### État des revenus (Statuses)
- **Pending (Created)** : État initial lors de la création par un admin ou un worker.
- **Validated** : Revenu validé par l'admin. Seul ce statut est pris en compte dans le bilan réel du salon.
- **In Review** : État de conflit ou de demande de correction. Déclenché par une contestation ou un refus d'un worker.
- **Closed (Supprimé)** : Revenu annulé ou supprimé. Plus aucune action possible.

#### Règles de création et d'édition
- **Créateur (Author)** : Peut être un Admin ou un Worker (avec permission `canAddIncome`).
- **Included Workers** : Un revenu peut impliquer plusieurs workers. Le créateur peut voir tous les workers du salon pour les ajouter (données confidentielles masquées).
- **Sharing Part (Répartition)** :
    *   Le créateur définit la part de chaque worker sur la portion "Commission Worker" de l'income.
    *   **Par défaut** : Répartition égale entre tous les workers impliqués (recalculé automatiquement à chaque ajout).
    *   **Manuel** : Le créateur peut outrepasser la répartition manuellement (Total = 100%).
    *   *Note* : Différent du "Sharing Key" (commission salon/worker).
- **Édition (Pending)** : Tant qu'il est `Pending`, le créateur peut modifier ou supprimer l'income (s'il est l'auteur). S'il n'est plus l'auteur, il ne peut que se retirer (voir ci-dessous).

#### Actions des Workers (Non-créateurs)
- **Notification** : Les workers impliqués reçoivent une notification et voient l'income dans leur tableau de bord.
- **Acceptation/Refus** :
    *   Un worker peut accepter explicitement ou rester passif (acceptation tacite n'empêche pas la validation).
    *   Un worker peut **refuser** l'income (peu importe le statut). L'income passe alors en **In Review** et génère une alerte de conflit pour l'admin.
- **Commentaires** : Les workers peuvent ajouter des commentaires à tout moment (sauf si `Closed`).
- **Retrait (Withdrawal)** : En statut `Pending`, un worker peut se retirer d'un income. Les parts des autres workers associés sont alors recalculées automatiquement.
- **Demande de Correction** : Après validation, un worker a **72 heures** pour demander une correction. L'income repasse en **In Review**.

#### Pouvoir de l'Administration (Admin/Owner)
- **Validation** : L'admin valide les revenus `Pending` ou résout les conflits `In Review`.
- **Validation Automatique** : Tout income saisi par un admin est validé automatiquement.
- **Dernier Mot** : L'admin a le pouvoir décisionnel final. Une fois qu'un conflit `In Review` est résolu par l'admin, il ne peut plus être remis en revue.
- **Suppression** : L'admin peut supprimer n'importe quel income (Statut `Closed`).

#### Suivi et Workflow
- **Journal d'activité** : Un graphique/liste des actions (création, validation, refus, commentaires) est consultable pour chaque income par les personnes concernées.
- **Notifications** : Les auteurs des actions sont notifiés à chaque étape clé du workflow.

### 4. Calcul des salaires

- **Salaires hebdomadaires** : Calcul par semaine (W1, W2, ..., W52)
- **Salaires mensuels** : Agrégation par mois (Jan, Feb, Mar, ..., Dec)
- **Vue d'ensemble** : Tableau récapitulatif pour l'année

### 4. Gestion des dépenses (Expenses)

Catégories de dépenses :
- Office rental (Loyer du bureau)
- Rental relative Expenses (Frais liés au loyer)
- Electricity (Électricité)
- IG & Facebook & Google (Marketing social media)
- Google (Publicité Google)
- Office cleaning (Nettoyage)
- Internet
- TV
- Other expenses (Autres dépenses)
- Beauty supply (Fournitures de beauté)

### 5. Calcul des profits et taxes (Tax & Profit)

- **Revenus** : Total des revenus mensuels (Braids)
- **Dépenses** : Total des dépenses mensuelles
- **Salaires des braiders** : Total des salaires mensuels
- **Profit** : Revenus - Dépenses - Salaires
- **Taxes** : Calcul des taxes sur les profits

### 6. Support multi-salons

- **Salon 1** : Premier salon
- **Salon 1 & 2** : Gestion combinée des deux salons

## Gestion des utilisateurs et rôles

### Rôles disponibles

1. **Propriétaire (Owner)**
   - Accès complet à toutes les fonctionnalités
   - Peut gérer les utilisateurs (ajouter, supprimer)
   - Peut attribuer des rôles (admin, user)
   - Peut associer un braider à un utilisateur
   - Accès à toutes les données du salon

2. **Manager**
   - Accès à la plupart des fonctionnalités
   - Peut gérer les braiders, revenus, dépenses
   - Ne peut pas gérer les utilisateurs
   - Peut être associé à un braider

3. **Utilisateur/Braider (User)**
   - Accès limité à son espace personnel
   - Peut voir ses propres revenus et salaires
   - Peut ajouter des prestations depuis son espace
   - Ne voit pas les données des autres braiders
   - Ne voit pas les données globales du salon

### Gestion des utilisateurs (Propriétaire uniquement)

- **Ajout d'utilisateur** : Via email, nom, mot de passe
- **Association braider** : Lier un utilisateur à un braider existant
- **Attribution de rôle** : Admin ou User
- **Suppression** : Le propriétaire peut supprimer n'importe quel utilisateur (sauf lui-même)

## Espace Braider

### Page personnelle du braider (`/braider/profile`)
Chaque braider (utilisateur avec braiderId) a accès à :
- **Vue détaillée de ses revenus** : Toutes ses prestations
- **Statistiques personnelles** : Revenus totaux, salaires, nombre de prestations
- **Revenus par semaine** : Organisation des prestations par semaine
- **Ajout de prestations** : Possibilité d'ajouter des prestations directement depuis son espace
- **Détails des prestations** : Date, client, prix brut, salaire calculé

### Page d'activité d'un braider (`/braider/[id]`)
Les administrateurs et propriétaires peuvent accéder à la page d'activité de n'importe quel braider :
- **Vue complète de l'activité** : Toutes les prestations du braider sélectionné
- **Statistiques détaillées** : Revenus totaux, salaires totaux, nombre de prestations
- **Informations du braider** : Nom, prénom, téléphone, email, taux de partage, statut
- **Revenus par semaine** : Organisation des prestations par semaine avec totaux
- **Détails des prestations** : Date, client, prix brut, salaire calculé
- **Accès depuis la liste des braiders** : Bouton "Voir l'activité" sur chaque carte braider

## Structure des données

### Client
- **nomComplet** : Nom complet du client (obligatoire)
- **telephone** : Numéro de téléphone (optionnel)
- **email** : Adresse email (optionnel)
- **dateCreation** : Date de création
- **notes** : Notes additionnelles (optionnel)

### Braider
- Nom
- Prénom (optionnel)
- Téléphone (optionnel)
- Email (optionnel)
- Taux de partage (Sharing Key) - entre 0 et 1
- Statut actif/inactif
- Notes (optionnel)

### Revenu quotidien
- Date
- Client (nom complet)
- Prix
- Braider(s) assigné(s) - support multiple braiders
- Salaires détaillés par braider
- Salaire calculé (Prix × Sharing Key)
- Semaine (Week 1, Week 2, etc.)

### Dépense
- Date
- Catégorie
- Montant
- Description (optionnelle)
- Salon (salon1, salon2, salon1_2)

### Utilisateur
- Email (unique)
- Nom
- Mot de passe (hashé)
- Rôle (owner, admin, user)
- TenantId (salon associé)
- BraiderId (optionnel - si l'utilisateur est un braider)
- Date de création

### Vue d'ensemble
- Période (hebdomadaire ou mensuelle)
- Revenus totaux
- Dépenses totales
- Salaires totaux
- Profit net

## Income Workflow (Revenue Management)

### Overview
The Income system implements a sophisticated multi-step validation workflow to ensure transparency and collaboration between workers and administrators. Each income entry progresses through defined statuses with role-specific actions and permissions.

### Income Statuses

1. **Draft** - Saved as draft (cache only, visible only to creator)
2. **Pending (Created)** - Initial state after creation, awaiting validation
3. **Validated** - Approved by admin and counted in salon statistics
4. **In Review** - Conflict raised (refusal or correction request)
5. **Closed** - Deleted/Cancelled

### Draft Status - Special Rules

> [!NOTE]
> **Draft incomes are NOT stored in the database**
> 
> They exist only in the **user's local cache/session** to allow quick work-in-progress saves.

**Draft Behavior:**
- **Visibility**: Only visible to the creator in their personal "Drafts" section
- **Storage**: Client-side cache/localStorage (NOT in database)
- **Auto-Expiration**: Automatically deleted after **72 hours** (configurable by admin)
- **Status Change**: After 72h, status becomes `Cancel` (removed from cache)
- **Notifications**: Reminder sent only to creator before expiration
- **Actions Available**:
  - ✅ **Resume**: Continue editing and submit as Pending
  - ✅ **Cancel**: Manually delete the draft
  - ❌ NOT visible to other users (even admins)
  - ❌ NOT counted in statistics

**Use Cases:**
- Save incomplete income entries
- Return later to finish missing information
- Avoid losing work if interrupted
- Quick save before verifying details with client

### Sharing Logic

> [!IMPORTANT]
> **Income Sharing Part ≠ Salon Sharing Key**
> 
> - **Income Sharing Part**: Custom distribution among workers for THIS specific income (set during creation, default: equal parts)
> - **Salon Sharing Key**: Applied AFTER income distribution to calculate final worker salary (global worker percentage)

**Sharing Part Behavior:**
- **Default**: Equal distribution (auto-calculated when workers added/removed)
- **Manual Override**: Creator can customize percentages (must total 100%)
- **Auto-Recalculation**: Triggered when workers join/leave the income

### Worker Visibility & Permissions

**When Creating Income:**
- Workers can **see all salon workers** (for collaboration)
- **Cannot see confidential data**: Other workers' revenues, global sharing keys, or earnings
- **Can include colleagues** in their income entry
- **Can customize sharing parts** for that specific entry

### Creation & Editing Rules

**Worker (Author):**
- ✅ Create income and include other workers
- ✅ Modify/Delete if status is **Pending**
- ✅ Add other workers (restarts workflow notifications)
- ❌ Cannot change income status
- ❌ Cannot modify incomes created by others

**Worker (Involved, Non-Author):**
- ✅ View income in their list
- ✅ **Accept** (implicit if no action taken)
- ✅ **Refuse** → triggers "In Review" status (admin alert)
- ✅ **Withdraw** (if Pending) → remove self, shares auto-recalculated
- ✅ **Request Correction** (within 72h of validation) → "In Review"
- ✅ Add comments anytime (except if Closed)
- ❌ Cannot modify the income entry
- ❌ Cannot change status

**Admin/Owner:**
- ✅ **Validate** or **Reject** Pending incomes
- ✅ **Auto-validation**: Incomes created by admin are automatically validated
- ✅ **Resolve conflicts**: Final authority on "In Review" items
- ✅ **Re-validate**: Can re-validate after correction (max once)
- ✅ **Delete**: Can delete anytime → status becomes "Closed"
- ✅ Add comments anytime

### Status Transition Rules

```
[Created/Pending]
    ↓
    ├─→ [Worker Refuses] → [In Review] → [Admin Resolves] → [Validated]
    ├─→ [Worker Accepts] → (stays Pending until Admin validates)
    ├─→ [Admin Validates] → [Validated]
    └─→ [Author Deletes] → [Closed]

[Validated]
    ↓
    ├─→ [Worker Requests Correction (≤72h)] → [In Review] → [Admin Re-validates] → [Validated]
    └─→ [Admin Deletes] → [Closed]

[In Review]
    ↓
    ├─→ [Admin Resolves] → [Validated]
    └─→ [Admin Deletes] → [Closed]
```

### Validation Workflow Details

**Pending State:**
- Only **Admin/Owner can validate** to move to "Validated"
- **Author** can edit, delete (if sole worker), or withdraw
- **Other workers** can accept, refuse, withdraw, or comment
- Without action, income remains Pending indefinitely

**Validated State:**
- Counts towards **real salon statistics**
- Workers notified
- **72-hour correction window** starts
- Any involved worker can request correction → moves to "In Review"

**In Review State (Conflict):**
- Triggered by: Worker refusal OR correction request
- **Admin must resolve**: Can re-validate or delete
- **One-time re-validation**: After admin resolves, cannot be put back to Review
- Workers can request deletion (admin approval required → Closed)

**Closed State:**
- Final state (income deleted)
- No further actions possible
- No comments allowed

### Withdrawal & Deletion Rules

**Worker Withdrawal:**
- Available **only if status is Pending**
- Worker removes themselves from the income
- **Automatic recalculation** of shares among remaining workers
- If only one worker remains, they get 100%

**Author Deletion:**
- Can delete if **Pending** AND they are the **sole worker**
- Otherwise, must wait for admin approval

**Admin Deletion:**
- Can delete at any stage
- Sets status to **Closed**
- All involved parties notified

### Notifications & Transparency

**Workflow History:**
- **Every action tracked**: Who, what, when
- **Visible to all involved**: Workers and admins
- **Timeline view**: Creation → Acceptance → Validation → etc.

**Comments System:**
- Available at all stages except **Closed**
- Visible to all involved workers and admins
- Used for clarifications, disputes, or feedback

**Notifications Sent:**
- Income created → all involved workers notified
- Worker added → newly added worker notified
- Income validated → all involved workers notified
- Refusal/Correction request → admin alerted
- Conflict resolved → all involved workers notified
- Income deleted → all involved workers notified

### Examples

**Scenario 1: Simple Approval**
1. Worker A creates income including Worker B (50/50 split)
2. Worker B sees it in list (Pending)
3. Worker B accepts (or takes no action)
4. Admin validates → Status: **Validated**
5. Income counted in salon stats

**Scenario 2: Refusal & Resolution**
1. Worker A creates income including Worker B
2. Worker B refuses (comment: "Wrong amount")
3. Status → **In Review**, admin alerted
4. Admin reviews, corrects, re-validates
5. Status → **Validated** (cannot be contested again)

**Scenario 3: Post-Validation Correction**
1. Income validated yesterday
2. Worker notices error within 72h
3. Requests correction → **In Review**
4. Admin reviews and re-validates → **Validated** (final)

**Scenario 4: Withdrawal**
1. Worker A creates income: A (50%), B (25%), C (25%)
2. Worker B withdraws (Pending status)
3. Shares recalculated: A (66.67%), C (33.33%)
4. Admin validates with new shares

## Interface utilisateur

### Pages principales

1. **Tableau de bord** (`/`) : Vue d'ensemble des revenus, dépenses, profits
2. **Mon Espace Worker** (`/workers/profile`) : Page personnelle du worker avec ses revenus
3. **Clients** (`/clients`) : Gestion de la base de clients avec filtres et recherche
4. **Appointments** (`/appointments`) : Gestion des rendez-vous avec intégration calendrier
   - **Booking Flow** (`/appointments/book`) : Processus de réservation multi-étapes
   - Étape 1: Sélection du service
   - Étape 2: Choix du worker (ou "any available")
   - Étape 3: Date et heure
   - Étape 4: Informations client (authentifié ou anonyme)
5. **Workers** (`/workers`) : CRUD avec taux de partage (owner/admin uniquement)
6. **Income** (`/income`) : Saisie et suivi des revenus quotidiens
7. **Expenses** (`/expenses`) : Gestion des dépenses par catégorie (owner/admin uniquement)
8. **Services** (`/services`) : Gestion du catalogue de services
9. **Reports** (`/reports`) : Vue d'ensemble annuelle avec calculs automatiques (owner/admin uniquement)
10. **Settings** (`/settings`) : Configuration de l'application (le sous-menu horizontal est activé par défaut)
11. **User Management** (`/settings/users`) : Gestion des utilisateurs (propriétaire uniquement)

### Fonctionnalités avancées

- **Création rapide de client** : Depuis le formulaire de revenu, possibilité de créer un nouveau client directement
- **Recherche de clients** : Autocomplétion lors de la saisie d'un revenu
- **Modification de mot de passe** : Depuis la page de connexion
- **Intégration calendrier** : Infrastructure prête pour Google Calendar, Outlook, Calendly (à venir)
- **Mode sombre** : Support complet du thème sombre/clair
- **Multi-tenant** : Support de plusieurs salons avec isolation des données

## Gestion des Rendez-vous

### Processus de réservation
1. **Sélection du service** : Le client choisit parmi les services disponibles
2. **Choix du worker** : Option de choisir un worker spécifique ou "premier disponible"
3. **Date et heure** : Sélection sur calendrier avec créneaux disponibles
4. **Informations client** : 
   - Mode authentifié : utilise les données du compte
   - Mode anonyme : création automatique d'un compte temporaire avec email/téléphone

### Gestion administrative
- Filtres par statut (Confirmé, En attente, Terminé, Annulé)
- Recherche par client, service, ou worker
- Pagination pour gérer de grandes listes
- Actions: Voir, Modifier, Supprimer

## Mode Démo

### Caractéristiques
- **Durée de vie** : 72 heures automatiques
- **Isolation totale** : Aucun impact sur données de production
- **Pré-remplissage** : Données fictives pour tests
- **Indicateur visuel** : Badge "DEMO" visible partout
- **Accès** : Bouton "Essayer la démo" sur page de connexion

### Nettoyage automatique
- Job CRON qui s'exécute toutes les heures
- Supprime les comptes démo > 72h
- Supprime toutes les données associées (rendez-vous, revenus, etc.)

## Sécurité et permissions

- **Multi-tenancy** : Isolation stricte des données par tenant (salon)
- **Permissions par rôle** : Accès restreint selon le rôle de l'utilisateur
- **Protection des données** : Les workers ne voient que leurs propres données
- **Gestion centralisée** : Seul le propriétaire peut gérer les utilisateurs
- **Comptes anonymes** : Conversion automatique en compte réel si email fourni

## Tech Stack & Rules

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4
- **State**: React 19 / Context API
- **DB (Local)**: LocalStorage + Supabase (mock)
- **i18n**: Fully implemented (Fr/En/Es)

### Coding Standards
1. **No `any`**: Use proper types from `@/types`
2. **No Hardcoded Strings**: Use `t()` for all text
3. **No Hardcoded Colors**: Use `bg-primary`, `text-destructive` etc.
4. **DDD**: Domain Driven Design for Services/Providers
5. **Atomic Commits**: Small, meaningful changes

## User Rules Recap (Memory)
1. **Context & AGENT.md**: Always follow global context.
2. **Language**: English for code (vars/files), French/i18n for text.
3. **Data**: No hardcoded data in views. Use mocks/providers.
4. **Colors**: Use ThemeProvider/Tailwind tokens.
5. **Business Rules**: Always verify against this doc.
6. **Instructions**: Update this file regularly.
7. **DDD**: Architecture best practices.
8. **Modularity**: Reusable components.
9. **Recap**: `docs/recap.md` for prompt history.
10. **Startup**: Build & Restart on open.
11. **Enums/Codes**: Use codes (e.g., `VALIDATED`) not strings (`Validated`).
