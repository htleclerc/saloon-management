# Fonctionalités et Description

J'ai un projet de gestion de salon de coiffure couture maquillage, salon de beauté, ou autre petits métiers
- Je veux que le projet soit multi-tenant, un owner peut avoir plusieurs salons et chaque salon peut avoir plusieurs employés
- Je veux avoir aussi un mode démo pour que les utilisateurs puissent tester le projet sans s'inscrire. Les données de la démo doivent etre supprimées après 72h et ne sont pas pris en compte dans les statistiques
- Je veux un système d'agenda propre et aussi intégré avec google calendar ou un autre système agenda via api qui va se synchroniser avec l'agenda du projet
- Je veux que le client puisse réserver via un agenda et avoir un compte anonyme ou connecté
- Meme anonyme le client doit avoir un compte pour pouvoir reserver et ses activités sont enregistrées dès qu'il a un mail
- Un systeme de rapprochement d'un client via son mail ou Nom Prénom
- Un systeme de notification pour informer le client de ses rendez-vous
- Le système d'agenda doit être indépendant de l'application en général (propre accès et sous domaine)
- Chaque salon peut créer un lien de calendrier indépendant pour prendre rendez vous rapidement sans se connecter
- Chaque fois que le client prends rendez vous son compte est initialisé et lié automatiquement au salon
- Après chaque prestation un lien de notation et commentaire est envoyé au client par mail (par défaut ou selon ses paramètres de notification)

# Demo Mode

## Caractéristiques du Mode Démo
- **Durée de vie des données** : 72 heures après création
- **Isolation des données** : Les données démo sont complètement isolées des données de production
- **Aucun impact sur les statistiques** : Les données démo ne sont jamais incluses dans les rapports ou statistiques principales
- **Indicateur visuel** : Badge ou bannière visible indiquant "Mode Démo" dans toute l'interface
- **Accès simplifié** : Pas de connexion requise, création automatique d'un compte temporaire
- **Données pré-remplies** : Le mode démo contient des données fictives pour faciliter les tests
- **Auto-nettoyage** : Un processus backend supprime automatiquement les données après 72h

## Types d'utilisateurs démo
- **Démo Owner** : Accès complet à toutes fonctionnalités en mode démo
- **Démo Admin** : Gestion d'un salon fictif
- **Démo Employee** : Vue limitée aux données du worker
- **Démo Client** : Réservation et gestion de rendez-vous

# User Roles (réel et demo)

## Roles de Production
- **Super Admin** (système) : Gestion globale de la plateforme
- **Owner** : Propriétaire de plusieurs salons
- **Admin** : Gestionnaire d'un ou plusieurs salons
- **Employee/Worker** : Employé d'un salon
- **Client** : Client du salon (authentifié ou anonyme)

## Roles de Démo
- **Demo Owner** : Mode démo avec tous les privilèges
- **Demo Admin** : Mode démo avec privilèges admin
- **Demo Employee** : Mode démo avec privilèges employee
- **Demo Client** : Mode démo avec privilèges client


# Multi-tenancy 

- Le super admin peut voir tous les salons et tous les employés. Il peut choisir un admin pour chaque salon et chaque admin peut avoir plusieurs employés
- Le super admin peut ajouter, modifier, supprimer des employés, des services, des produits, des fournisseurs, des stocks, des caisses, des rapports, des paramètres
- Le super admin peut décider si un employé peut avoir un compte ou non et s'il peut ajouter une prestation ou non

- Le Owner a les memes roles que le super admin mais seulement sur ses salons. Il peut choisir ses salons et basculer sur chaque salon et voir le détail de chaque solon alors.
- Quand il bascule zur un saon il aura la vue d'un admin alors.

- Un admin peut être admihn sur plusieurs salons et un salon peut avoir plusieurs admin
- Qaund un admin se connecte il bascule directement sur le dernier salon au quel il s'est connecté (s'il en a plusieurs)
- Un admin peut basculer d'un salon à un autre si possible
- Chaque salon est indépendant, il a son propre agenda, ses propres clients, ses propres employés, ses propres services, ses propres produits, ses propres fournisseurs, ses propres stocks, ses propres caisses, ses propres rapports, ses propres paramètres, etc.
- Chaque employé est indépendant, il a son propre agenda, ses propres clients, ses propres services, ses propres produits, ses propres fournisseurs, ses propres stocks, ses propres caisses, ses propres rapports, ses propres paramètres, etc.
- Le propriétaire peut voir tous les salons et tous les employés. Il peut choisir un admin pour chaque salon et chaque admin peut avoir plusieurs employés

- Un admin peut voir tous les employés de son salon et tous les clients de son salon. Il peut choisir un employé pour chaque service ou plusieurs employés pour chaque service. S'il ne fait rien tout les services sont assignés à tous les employés
- Un admin peut voir tous les services et tous les produits de son salon. Il peut choisir un employé pour chaque service ou plusieurs employés pour chaque service. S'il ne fait rien tout les services sont assignés à tous les employés
- Un admin peut voir tous le dashboaerd de son salon et les statistiques de son salon
- Un admin peut voir tous les paiements de son salon et les statistiques de son salon
- Un admin peut voir tous les stocks de son salon et les statistiques de son salon
- Un admin peut voir tous les rapports de son salon et les statistiques de son salon
- Un admin peut voir tous les paramètres de son salon et les statistiques de son salon
- L'admin peut ajouter, modifier, supprimer des employés, des services, des produits, des fournisseurs, des stocks, des caisses, des rapports, des paramètres
- L'admin peut décider si un employé peut avoir un compte ou non et s'il peut ajouter une prestation ou non

- Un employé ne peut voir que les bilan de son travail, ses revenus et les statistiques de son travail
- Si un employé ajoute un income (revenu), une dépense ou un produit, il doit être validé par l'admin pour être définitif.

### Workflow des Revenus (Income) - Règles Complètes

> [!IMPORTANT]
> **Income Sharing Part ≠ Salon Sharing Key**
> - **Income Sharing Part** : Répartition personnalisée POUR CE REVENU entre les workers (définie à la création)
> - **Salon Sharing Key** : Pourcentage global du worker appliqué APRÈS la répartition du revenu

#### Statuts du Revenu
1. **Draft** : Brouillon (cache local uniquement, visible par le créateur seul)
2. **Pending** : Créé, en attente de validation admin
3. **Validated** : Validé et comptabilisé dans les statistiques réelles
4. **In Review** : Conflit (refus ou demande de correction)
5. **Closed** : Supprimé/Annulé

#### Statut Brouillon (Draft) - Règles Spéciales

> [!IMPORTANT]
> **Les brouillons ne sont PAS stockés en base de données**
> 
> Ils existent uniquement dans le **cache local de l'utilisateur** (localStorage).

- **Visibilité** : Uniquement dans la "bannette" personnelle du créateur
- **Stockage** : Cache client (pas en DB)
- **Expiration** : Auto-suppression après **72h** (paramètre configurable par admin)
- **Après 72h** : Statut → `Cancel` (supprimé du cache)
- **Notifications** : Rappel envoyé uniquement au créateur avant expiration
- **Actions** :
  - ✅ Reprendre : Continuer l'édition et soumettre en `Pending`
  - ✅ Annuler : Supprimer manuellement le brouillon
  - ❌ Invisible pour les autres (même admins)
  - ❌ Non comptabilisé dans les statistiques

#### Création et Partage
- **Visibilité** : Un worker peut voir TOUS les workers du salon pour les inclure (SANS leurs données confidentielles : revenus, sharing key, etc.)
- **Inclusion de collègues** : Le créateur peut inclure d'autres workers sur son income
- **Sharing Part** :
  - **Par défaut** : Répartition égale (recalculée automatiquement quand un worker est ajouté/retiré)
  - **Override manuel** : Le créateur peut modifier les pourcentages (total doit = 100%)
  - **Différent du Sharing Key** : Cette répartition est appliquée AVANT le sharing key du salon

#### Permissions et Actions

**Worker (Auteur) :**
- ✅ Créer, modifier, supprimer (si Pending)
- ✅ Ajouter d'autres workers (redémarre le workflow)
- ✅ Se retirer si Pending ET sole worker → suppression
- ❌ Ne peut PAS changer le statut
- ❌ Ne peut PAS modifier les incomes créés par d'autres

**Worker (Concerné, non-auteur) :**
- ✅ Voir l'income dans sa liste
- ✅ **Accepter** (implicite si aucune action)
- ✅ **Refuser** → déclenche "In Review" (alerte admin)
- ✅ **Se retirer (Withdraw)** si Pending → recalcul automatique des parts
- ✅ **Demander correction** dans les 72h après validation → "In Review"
- ✅ Commenter à tout moment (sauf si Closed)
- ❌ Ne peut PAS modifier l'income
- ❌ Ne peut PAS changer le statut

**Admin/Owner :**
- ✅ **Valider** ou **Rejeter** les incomes Pending
- ✅ **Auto-validation** : Si créé par admin → validé automatiquement
- ✅ **Résoudre les conflits** : Autorité finale sur les "In Review"
- ✅ **Re-valider** après correction (max 1 fois)
- ✅ **Supprimer** à tout moment → statut "Closed"
- ✅ Commenter à tout moment

#### Transitions de Statut

```
[Pending]
├─→ Worker refuse → [In Review] → Admin résout → [Validated]
├─→ Worker accepte → reste Pending jusqu'à validation admin
├─→ Admin valide → [Validated]
└─→ Auteur supprime → [Closed]

[Validated]
├─→ Worker demande correction (≤72h) → [In Review] → Admin re-valide → [Validated]
└─→ Admin supprime → [Closed]

[In Review]
├─→ Admin résout → [Validated]
└─→ Admin supprime → [Closed]
```

#### Règles de Retrait et Suppression

**Retrait (Withdraw) :**
- Disponible **uniquement si Pending**
- Le worker se retire de l'income
- **Recalcul automatique** des parts entre les workers restants
- Si 1 seul worker reste → 100%

**Suppression par Auteur :**
- Possible si **Pending** ET **sole worker**
- Sinon, demande d'approbation admin requise

**Suppression par Admin :**
- Possible à tout stade → statut "Closed"
- Tous les concernés notifiés

#### Workflow et Transparence
- **Historique** : Toutes les actions trackées (qui, quoi, quand)
- **Visible** par tous les workers concernés et admins
- **Commentaires** : Disponibles à tous les stades (sauf Closed)
- **Notifications** : Envoyées à chaque action (création, validation, refus, etc.)
- Il n'a accès qu'a un dashboard quui est son profil par défaut et il n'accès qu'à son travail
- L'agenda est partagé entre tous les employés et le propriétaire et l'admin
- Chaque employé peut voir tous les clients et tous les services
- L'employe doit pouvoir ajouter des rendez-vous pour un client
- L'employe peut paramétrer son profil, son apparence, ses motifications, ses heures de présence ou son calendrier
- L'employe peut paramétrer ses heures de présence ou son calendrier

- Le client peut prendre rendez-vous avec un employé spécifique ou avec n'importe quel employé disponible ou sans employé
- Le client peut voir tous les services et prendre rendez-vous
- Le client peut etre anonyme ou connecté
- Le client peut noter les services et les employés
- Le client peut laisser des commentaires sur les services et les employés

# Technologies

- Next.js
- TypeScript
- Tailwind CSS
- Prisma
- PostgreSQL
- NextAuth.js
- Shadcn UI

# Backend 
- Google Calendar
- Go
- Docker
- Kubernetes
- Nginx
- keycloack
- PostGreSQL

