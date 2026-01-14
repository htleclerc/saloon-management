# Workshop Manager - Formation Frontend Complète

## 🎬 Cours Vidéo en 6 Parties (60 minutes)

Cette formation vous guide à travers la création d'une application de gestion professionnelle en utilisant **Next.js**, **TypeScript**, et **Tailwind CSS**, avec un focus sur la **méthodologie de développement frontend**.

> **"Build in Public"** - Chaque vidéo montre le processus réel de développement, y compris la réflexion méthodologique avant le code.

---

## 🎯 Objectifs d'apprentissage

À la fin de cette formation, vous saurez:
- ✅ Appliquer une méthodologie structurée de développement frontend
- ✅ Créer une application Next.js 16 avec TypeScript
- ✅ Implémenter un système de thèmes personnalisables (dark/light mode)
- ✅ Ajouter le support multi-langue (i18n)
- ✅ Créer des tableaux de bord interactifs avec graphiques
- ✅ Concevoir des interfaces responsives mobile-first
- ✅ Implémenter un contrôle d'accès basé sur les rôles

---

## 📚 Structure du Cours

| Vidéo | Durée | Titre | Focus Principal |
|:-----:|:-----:|-------|-----------------|
| 01 | 10 min | [Méthodologie Frontend](./01-methodologie.md) | Les 5 étapes du développement |
| 02 | 10 min | [Architecture Next.js](./02-architecture.md) | Structure, providers, fichiers clés |
| 03 | 10 min | [Système de Thèmes](./03-themes.md) | Context API, CSS variables, dark mode |
| 04 | 10 min | [Internationalisation](./04-i18n.md) | Multi-langue, organisation du code |
| 05 | 10 min | [Dashboard Avancé](./05-dashboard.md) | Composants, graphiques, données |
| 06 | 10 min | [Responsive & Rôles](./06-responsive-roles.md) | Mobile-first, permissions |

**Durée totale:** 60 minutes

---

## 🛠️ La Méthodologie des 5 Étapes

Cette formation enseigne une approche structurée du développement frontend:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  1. ANALYSER │ → │ 2. STRUCTURER│ → │ 3. STYLISER │ → │ 4. INTERAGIR│ → │ 5. OPTIMISER│
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
   Comprendre        Organiser          Appliquer          Ajouter            Améliorer
   les besoins       les fichiers       le design          les états          performance
```

---

## 📋 Prérequis

- **Node.js 18+** installé sur votre machine
- **Connaissances de base** en React (composants, props, state)
- **Éditeur de code** (VS Code recommandé)
- **Terminal** / Ligne de commande

---

## 🚀 Technologies Utilisées

| Technologie | Version | Rôle |
|-------------|---------|------|
| Next.js | 16 | Framework React avec App Router |
| TypeScript | 5.x | Typage statique |
| Tailwind CSS | 4.x | Styles utilitaires |
| Lucide React | - | Bibliothèque d'icônes |
| Recharts | 2.x | Graphiques et visualisation de données |

---

## 📁 Architecture du Projet

```
frontend/
├── app/                    # Pages (App Router)
│   ├── page.tsx           # Dashboard principal
│   ├── layout.tsx         # Layout racine
│   ├── providers.tsx      # Contextes React
│   ├── globals.css        # Styles globaux
│   ├── dashboard/         # Dashboards
│   ├── workers/           # Gestion travailleurs
│   └── settings/          # Paramètres
├── components/            # Composants réutilisables
│   ├── layout/           # Sidebar, Header, MainLayout
│   └── ui/               # Button, Card, etc.
├── context/              # Providers React Context
│   ├── ThemeProvider.tsx # Gestion thème
│   └── AuthProvider.tsx  # Authentification/rôles
├── i18n/                 # Internationalisation
│   ├── index.tsx         # Provider i18n
│   └── translations/     # Fichiers JSON (en, fr, es)
└── docs/                 # Cette documentation
```

---

## 🔗 Ressources

- [Code source du projet](file:///c:/Users/lecle/Workspace/saloon-management/frontend)
- [Documentation Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev)

---

## 📝 Notes pour le Formateur

1. **Timing précis** - Chaque vidéo a un script avec timing détaillé
2. **Live coding** - Montrez le code en temps réel, pas de copier-coller
3. **Erreurs intentionnelles** - Montrez les erreurs courantes et leurs solutions
4. **Récap à chaque fin** - Résumez les points clés en 30 secondes

---

## ▶️ Commencer la Formation

1. [Vidéo 1: Méthodologie Frontend](./01-methodologie.md) ← **Commencez ici!**
