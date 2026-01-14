# Instructions - Adorable Braids Salon Management System

## Vue d'ensemble

Système de gestion complet pour un salon de coiffure spécialisé dans les tresses (braids) avec gestion des salaires, revenus, dépenses et profits. Système multi-tenant permettant la gestion de plusieurs salons avec leurs propres utilisateurs et données.

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

### 3. Calcul des salaires

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

2. **Administrateur (Admin)**
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

## Interface utilisateur

### Pages principales

1. **Tableau de bord** (`/`) : Vue d'ensemble des revenus, dépenses, profits
2. **Mon Espace Braider** (`/braider/profile`) : Page personnelle du braider avec ses revenus
3. **Clients** (`/clients`) : Gestion de la base de clients
4. **Rendez-vous** (`/rendez-vous`) : Gestion des rendez-vous avec intégration calendrier
5. **Braiders** (`/braiders`) : CRUD avec taux de partage (owner/admin uniquement)
6. **Revenus** (`/revenus`) : Saisie et suivi des revenus quotidiens
7. **Dépenses** (`/depenses`) : Gestion des dépenses par catégorie (owner/admin uniquement)
8. **Salaires** (`/salaires`) : Vue hebdomadaire et mensuelle des salaires
9. **Tax & Profit** (`/profits`) : Vue d'ensemble annuelle avec calculs automatiques (owner/admin uniquement)
10. **Paramètres** (`/parametres`) : Configuration de l'application
11. **Gestion des utilisateurs** (`/parametres/utilisateurs`) : Gestion des utilisateurs (propriétaire uniquement)

### Fonctionnalités avancées

- **Création rapide de client** : Depuis le formulaire de revenu, possibilité de créer un nouveau client directement
- **Recherche de clients** : Autocomplétion lors de la saisie d'un revenu
- **Modification de mot de passe** : Depuis la page de connexion
- **Intégration calendrier** : Infrastructure prête pour Google Calendar, Outlook, Calendly (à venir)
- **Mode sombre** : Support complet du thème sombre/clair
- **Multi-tenant** : Support de plusieurs salons avec isolation des données

## Sécurité et permissions

- **Isolation des données** : Chaque salon (tenant) a ses propres données
- **Permissions par rôle** : Accès restreint selon le rôle de l'utilisateur
- **Protection des données** : Les braiders ne voient que leurs propres données
- **Gestion centralisée** : Seul le propriétaire peut gérer les utilisateurs
