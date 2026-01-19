# CONTEXT.md - Contexte Global du Projet

> **Fichier de référence centrale** : À lire au début de chaque session agent, quelle que soit la phase

---

## 📋 Informations Projet

### Identité
- **Nom** : Saloon Management System
- **Type** : Application Web SaaS Multi-Mode
- **Version Actuelle** : MVP V1 (en développement)
- **Statut** : Phase de développement initial

### Stack Technique

#### Frontend
- **Framework** : Next.js 14 (App Router)
- **Langage** : TypeScript 5 (strict mode)
- **Styling** : TailwindCSS 4
- **État** : Context API (pas de Redux/Zustand pour MVP)
- **Icons** : Lucide React
- **Charts** : Recharts
- **i18n** : Custom (EN, FR, ES)

#### Backend (V1 - Mode Normal)
- **Langage** : Go 1.21+
- **Framework** : Gin
- **Database** : PostgreSQL 15
- **Cache** : Redis 7
- **Auth** : Keycloak (IdP complet)

#### Infrastructure
- **Dev** : Docker Compose
- **Prod** : VPS Hostinger + Docker Compose
- **CI/CD** : Jenkins (V2)
- **Monitoring** : Prometheus + Grafana (V2)
- **Logging** : Splunk (V2)

---

## 🎯 Architecture Multi-Mode

### Modes de Données (3 modes)

```
┌─────────────────────────────────────────────────────────┐
│                   FRONTEND (Next.js)                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  DataModeProvider (Context)                      │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                       │
│     ┌───────────┼───────────┐                          │
│     │           │           │                          │
│ ┌───▼────┐  ┌───▼────┐  ┌──▼─────┐                    │
│ │ Local  │  │Supabase│  │Go API  │                    │
│ │Provider│  │Provider│  │Provider│                    │
│ └────────┘  └────────┘  └────┬───┘                    │
└──────────────────────────────┼────────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │  Backend Go/Gin     │
                    │  + PostgreSQL       │
                    │  + Redis            │
                    │  + Keycloak         │
                    └─────────────────────┘
```

#### 1. Mode Démo - localStorage (dev/test)
- **Usage** : Développement local uniquement
- **Stockage** : localStorage navigateur
- **Persistance** : Tant que le cache n'est pas vidé
- **Désactivé en prod** : Automatiquement

#### 2. Mode Démo - Supabase (production démo)
- **Usage** : Démos publiques, tests utilisateurs
- **Stockage** : Supabase PostgreSQL
- **Cleanup** : Automatique après 7 jours
- **RLS** : Public (pas d'auth requise)

#### 3. Mode Normal - Go API (production)
- **Usage** : Clients payants, données réelles
- **Stockage** : PostgreSQL (persistent)
- **Auth** : Keycloak obligatoire (JWT + RBAC)
- **Cache** : Redis pour performances

---

## 📐 Standards de Développement

### Règles Impératives

✅ **TOUJOURS**
- TypeScript strict mode (pas d'`any`)
- Validation inputs avec Zod
- Tests pour nouveau code
- Commits atomiques (Conventional Commits)
- Lire code existant avant d'écrire

❌ **JAMAIS**
- Utiliser `any` en TypeScript
- Committer des secrets
- Ignorer erreurs TypeScript/ESLint
- Push direct sur main

### Conventions Nommage

| Type | Convention | Exemple |
|------|------------|---------|
| Variables | camelCase | `userName` |
| Constantes | UPPER_SNAKE | `API_URL` |
| Classes/Types | PascalCase | `UserService` |
| Composants | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase + use | `useAuth()` |

### Git Commits
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
Scope: frontend, backend, infra, docs
```

---

## 🏗️ Architecture Actuelle

### Structure Frontend

```
frontend/
├── app/              # Next.js App Router
│   ├── page.tsx     # Dashboard
│   ├── team/        # Workers management
│   ├── clients/     # Clients management
│   ├── income/      # Revenue tracking
│   └── settings/    # Settings
├── components/
│   ├── layout/      # Header, Sidebar, MainLayout
│   ├── ui/          # Button, Card, StatCard
│   └── dashboard/   # ClientDashboard
├── context/
│   ├── AuthProvider.tsx     # Auth + RBAC
│   ├── ThemeProvider.tsx    # Theme + Responsive
│   └── DataModeProvider.tsx # Mode switching (NEW)
├── lib/
│   ├── providers/   # Data providers (NEW)
│   ├── services/    # Business logic (NEW)
│   └── export.ts    # CSV/PDF utils
├── types/           # Types centralisés
└── i18n/            # Traductions (EN, FR, ES)
```

### Structure Backend (À créer)

```
backend/
├── cmd/api/                # Entry point
├── internal/
│   ├── config/            # Configuration
│   ├── domain/            # Business logic
│   ├── application/       # Handlers, middleware
│   └── infrastructure/    # DB, Redis, Keycloak
└── deployments/           # Docker, scripts
```

---

## 🎯 Fonctionnalités Principales

### Actuellement Implémentées
- ✅ Dashboard KPI
- ✅ Workers list & detail
- ✅ Clients management
- ✅ Income tracking (basique)
- ✅ Reports & exports (CSV/PDF)
- ✅ i18n (EN, FR, ES)
- ✅ RBAC basique (rôles hardcodés)
- ✅ Dark mode
- ✅ Responsive design

### À Implémenter (MVP V1)
- [ ] Architecture providers (Phase 1)
- [ ] Mode démo localStorage (Phase 2)
- [ ] Infrastructure Docker (Phase 3)
- [ ] Mode démo Supabase (Phase 4)
- [ ] Backend Go API (Phase 5)
- [ ] Tests E2E (Phase 6)

### V2 Post-MVP
- [ ] Nginx + SSL
- [ ] Jenkins CI/CD
- [ ] Prometheus/Grafana
- [ ] Splunk logging
- [ ] RBAC complet

---

## 🔐 Sécurité & Authentification

### Keycloak Setup (À venir)
- **Realm** : saloon-management
- **Clients** : saloon-frontend (Public), saloon-backend (Confidential)
- **Rôles** : super_admin, admin, owner, manager, worker, client
- **Flow** : Authorization Code + PKCE
- **Tokens** : JWT avec refresh rotation

### RBAC Hiérarchie
```
super_admin > admin > owner > manager > worker > client
```

---

## 📦 Dépendances Importantes

### Frontend (package.json)
```json
{
  "dependencies": {
    "next": "16.1.1",
    "react": "19.2.3",
    "tailwindcss": "^4",
    "date-fns": "^4.1.0",
    "lucide-react": "^0.562.0",
    "recharts": "^3.6.0",
    "@supabase/supabase-js": "^2.39.0", // À ajouter
    "zod": "^3.22.4"  // À ajouter
  }
}
```

### Backend (go.mod - À créer)
```
github.com/gin-gonic/gin
gorm.io/gorm
github.com/go-redis/redis/v8
github.com/Nerzal/gocloak/v13
```

---

## 📚 Documentation de Référence

### Toujours Consulter
1. **[AGENT.md](file:///c:/Users/lecle/Workspace/saloon-management/AGENT.md)** - Conventions projet actuelles
2. **[ENTERPRISE_STANDARDS.md](file:///c:/Users/lecle/Workspace/saloon-management/startup-package/docs/standards/ENTERPRISE_STANDARDS.md)** - Standards enterprise
3. **[DOCUMENTATION.md](file:///c:/Users/lecle/Workspace/saloon-management/DOCUMENTATION.md)** - Build in Public & Formation
4. **[task.md](file:///c:/Users/lecle/.gemini/antigravity/brain/d7f8c1ac-84d4-4922-a475-886faf2f608e/task.md)** - Checklist MVP
5. **[implementation_plan.md](file:///c:/Users/lecle/.gemini/antigravity/brain/d7f8c1ac-84d4-4922-a475-886faf2f608e/implementation_plan.md)** - Plan détaillé MVP
6. **[implementation_plan_v2.md](file:///c:/Users/lecle/.gemini/antigravity/brain/d7f8c1ac-84d4-4922-a475-886faf2f608e/implementation_plan_v2.md)** - Plan V2 post-MVP

---

## 🚀 Timeline & Avancement

### MVP V1 : 1 Semaine
| Jour | Phase | Statut |
|------|-------|--------|
| 0.5  | Phase 0 : Mockup Fonctionnel | ⏳ En cours |
| 1-2  | Phase 1 : Providers | ⏸️ À venir |
| 2.5  | Phase IA : Booster Intelligence | ⏸️ À venir |
| 3    | Phase 2 : localStorage | ⏸️ À venir |
| 3    | Phase 3 : Infra Docker | ⏸️ À venir |
| 4    | Phase 4 : Supabase | ⏸️ À venir |
| 5-6  | Phase 5 : Backend Go | ⏸️ À venir |
| 7    | Phase 6 : Tests E2E | ⏸️ À venir |

### V2 : 3-4 Semaines
- Semaine 1 : Nginx + SSL
- Semaine 2 : Jenkins CI/CD  
- Semaine 3 : Monitoring
- Semaine 4 : RBAC complet + Tests

### 📹 Build in Public : Documentation Temps Réel
- **Objectif** : Créer une formation "SaaS Multi-Tenant de A à Z"
- **Format** : Articles (Medium) + Vidéos (YouTube) + Code (GitHub)
- **Workflow** : Après chaque phase → Publier documentation
- **Détails** : Voir [DOCUMENTATION.md](file:///c:/Users/lecle/Workspace/saloon-management/DOCUMENTATION.md)

---

## 🎯 Objectifs par Phase

### Phase 0 : Mockup Fonctionnel (CURRENT)
**Objectif** : Auditer l'UI et implémenter toutes les actions manquantes avec stubs
**Livrables** :
- Audit complet (AUDIT_PHASE_0.md)
- Stubs API (à remplir Phase 5)
- Actions locales (workers, clients)
- Modales et formulaires fonctionnels
- Aucun bouton sans action

### Phase 1 : Frontend Providers
**Objectif** : Architecture provider flexible et formalisation du MCD
**Livrables** :
- MCD validé (basé sur l'UI)
- Types & interfaces providers
- DataModeProvider context
- Factory pattern
- Services métier (Worker, Client, Booking)

### Phase IA : Booster Intelligence (NOUVEAU)
**Objectif** : Couche d'intelligence optionnelle et modulaire
**Livrables** :
- AIProvider (Frontend) pour gestion statut/modèles
- Proxy IA Backend (Go) supportant multiples providers
- Assistant de commande (Smart Add, Analytics)
- Système de fallback (le SaaS fonctionne sans IA)

### Phase 2 : Mode Démo localStorage
**Objectif** : Mode démo local fonctionnel
**Livrables** :
- LocalStorage provider
- CRUD Workers complet
- CRUD Clients complet
- UI mode switcher

### Phase 3 : Infrastructure Locale
**Objectif** : Environnement dev complet avec Docker
**Livrables** :
- docker-compose.dev.yml
- PostgreSQL, Redis, Keycloak
- Scripts d'initialisation
- Documentation setup

### Phase 4 : Mode Démo Supabase
**Objectif** : Mode démo cloud avec cleanup auto
**Livrables** :
- Projet Supabase configuré
- Schéma SQL + RLS
- Supabase provider
- Script cleanup (7 jours)

### Phase 5 : Backend Go API
**Objectif** : API REST complète en Go
**Livrables** :
- Structure Clean Architecture
- CRUD Workers, Clients, Bookings
- Auth Keycloak (middleware)
- Cache Redis
- Tests unitaires

### Phase 6 : Tests & Integration
**Objectif** : Tests E2E et validation complète
**Livrables** :
- Tests E2E (3 modes)
- Documentation utilisateur
- Guide déploiement
- MVP livrable

---

## 💡 Notes Importantes

### Décisions Architecturales
1. **Pas de Kubernetes pour MVP** : Docker Compose suffit (simplicité)
2. **Supabase pour démo cloud** : Plus simple que backend dédié pour demos
3. **Keycloak obligatoire** : Solution IdP professionnelle (SSO, RBAC)
4. **Go pour backend** : Performance + typage natif
5. **Context API pour state** : Pas de Redux/Zustand avant nécessité réelle

### Points d'Attention
- Mode demo-local **désactivé en prod** automatiquement
- Cleanup Supabase nécessite **cron externe** (Vercel Cron ou GitHub Actions)
- RBAC simplifié en MVP, complet en V2
- Tests > 80% coverage reporté en V2
- Monitoring basique (logs console) en MVP, Prometheus/Grafana en V2

---

## 📞 Utilisation de ce Fichier

### Pour un Agent Démarrant une Phase
1. **TOUJOURS** lire ce fichier en premier
2. Lire le fichier de phase spécifique (ex: `PHASE_1.md`)
3. Vérifier `task.md` pour l'avancement global
4. Commencer le travail en restant cohérent avec l'existant

### Mise à Jour de ce Fichier

⚠️ **Mettre à jour** quand :
- Changement de phase active
- Décision architecturale importante
- Dépendance ajoutée/supprimée
- Stack technique modifiée

✅ **Ne PAS mettre à jour** pour :
- Détails d'implémentation spécifiques
- Code snippets
- Bugs fixes
- Features mineures

---

**Dernière mise à jour** : 2026-01-18
**Phase active** : Phase 0 - Mockup Fonctionnel
**Version** : MVP V1 (Semaine 1)
