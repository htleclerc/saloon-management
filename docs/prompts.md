# Prompts de développement

## Review complet de l'application
@draft.md
A l'aide de ce draft verifie moi toute l'application et dis moi ce qui manque et ce qui doit etre ameliore
- Ne touche pas le contenu de ce qui est deja fait
- Améliore juste les pages en respectant le style et le design de l'application
- Rajoute les pages manquantes en respectant le style et le design de l'application
- Rajoute les fonctionnalités manquantes en respectant le style et le design de l'application
- Améliore le code en respectant le style et le design de l'application
- Améliore les tables en rajoutant des filtres, des tris, des recherches, des pagination, etc. si nécéssaire
- N'oublie pas de mettre à jour le instruction.md avec les modifications que tu as apportées
- Ajoute en meme temps les prompts pour les pages manquantes et les fonctionnalités manquantes dans le prompts.md
- Ajoute en meme temps la logique pour le mode démo dans le draft.md et le instruction.md
- Ajoute en meme temps la logique d'authenitfication et d'autorisation dans le draft.md et le instruction.md
- N'oublie que c'est une application multi-tenant et que chaque tenant est indépendant
- N'oublie pas que c'est une application avec plusieurs rôles et que chaque rôle a ses propres fonctionnalités
- N'oublie pas que c'est une application avec plusieurs utilisateurs et que chaque utilisateur a ses propres fonctionnalités
- N'oublie pas c'est une application multi-utilisateurs et multi-langues
- N'oublie pas c'est une application mutli support et responsive
- J'ai rajouté des images dans le dossier screens/rendez-vous. Inspire toi de ses images aussi
- Un employee est la même chose que worker et n'oublie pas que tout est en Anglais par défaut les titres les variables les constantes et les noms de classe et composant
- N'intègre pas encore le backend mais n'oublie pas qu'à la fin on doit faire appel à un un système de cache de cdn et de base de données. Donc adapte le front et les composants pour etre facilement modifiables réutilisables et qui correspnd à une entité logique et cohérente
- Je répète pour le moment on s'occupe uniquement du front et des composants mais on doit appeler un backend et une base de données et un cdn après
- N'oublie pas de faire une revue complète du code existant avant de commencer

## Appointments - Gestion des rendez-vous
Crée une page de gestion des rendez-vous complète avec:
- Liste des rendez-vous avec filtres (statut, date, worker, client)
- Recherche par client, service, ou worker
- Pagination (10 éléments par page)
- Cards de statistiques (Total, Confirmés, En attente, Aujourd'hui)
- Actions: Voir, Modifier, Supprimer
- Respect du design purple/pink avec gradients

## Appointments Booking - Flux de réservation
Crée un flux de réservation multi-étapes:
- Étape 1: Sélection du service (grille de cards avec icons, prix, durée)
- Étape 2: Choix du worker (option "Any Available" + liste des workers disponibles)
- Étape 3: Sélection date/heure (calendrier + créneaux horaires)
- Étape 4: Informations client (choix authentifié/anonyme)
- Indicateur de progression visuel en haut
- Résumé de la réservation
- Boutons Next/Previous avec validation

## Demo Mode - Implémentation
Ajoute le mode démo à l'AuthProvider:
- Flag `isDemo` dans le User interface
- Méthode `enableDemoMode()` qui crée un compte temporaire
- Badge visuel "DEMO MODE" dans le header quand actif
- Timestamp de création pour nettoyage après 72h
- Isolation des données (prefix "demo_" sur tous les IDs)

## Multi-tenancy - TenantId
Ajoute la gestion multi-tenant:
- Ajoute `tenantId` à l'interface User
- Ajoute `currentTenantId` au AuthContext
- Méthode `switchTenant(tenantId)` pour les Owners
- Filtre toutes les requêtes par tenantId
- Selector de salon dans le header pour les Owners/Admins

## Table Improvements - Filtres avancés
Améliore toutes les tables de données:
- Filtres multi-colonnes fonctionnels
- Tri ascendant/descendant par colonne
- Recherche en temps réel
- Pagination avec choix du nombre d'éléments
- Export CSV/PDF
- Actions groupées (sélection multiple)

## Backend Integration Preparation
Prépare les composants pour l'intégration backend:
- Create service layer avec fonctions async (getAppointments, createAppointment, etc.)
- Utilise React Query ou SWR pour cache et fetching
- Loading states et error handling partout
- Optimistic updates pour UX fluide
- Type safety avec TypeScript interfaces
- Gestion des tokens d'authentification