# Vidéo 01 - Méthodologie Frontend

## 🎬 Durée: 10 minutes

---

## 📋 Script Vidéo Détaillé

### ⏱️ 0:00 - 1:00 | Introduction au Cours (1 min)

**À dire:**
> "Bienvenue dans cette formation sur le développement frontend avec Next.js! Aujourd'hui, on va apprendre à créer une application professionnelle de gestion d'atelier, mais surtout, je vais vous enseigner une MÉTHODOLOGIE qui vous servira pour tous vos projets."

**À montrer:**
- L'application finale en fonctionnement
- Navigation rapide entre les pages
- Démonstration du dark mode et du changement de langue

---

### ⏱️ 1:00 - 4:00 | Les 5 Étapes du Développement Frontend (3 min)

**À dire:**
> "Avant de coder, il faut comprendre comment PENSER en développeur frontend. Je vais vous présenter les 5 étapes que je suis systématiquement."

#### Étape 1: ANALYSER (30 sec)
```
🔍 Questions à se poser:
- Quel est le besoin de l'utilisateur?
- Quelles données vais-je afficher?
- Y a-t-il une maquette ou un design à suivre?
```

**Exemple concret:**
> "Pour notre dashboard, l'utilisateur veut voir ses revenus, dépenses, et les performances de son équipe. Les données viennent d'une API."

#### Étape 2: STRUCTURER (30 sec)
```
📁 Organisation:
- Quels composants créer?
- Comment organiser mes fichiers?
- Quelles dépendances entre composants?
```

**Exemple concret:**
> "Je vais créer un composant StatCard réutilisable, un composant ChartBar, et un MainLayout qui englobe tout."

#### Étape 3: STYLISER (30 sec)
```
🎨 Design:
- Quelles couleurs et typographies?
- Mode sombre/clair?
- Animations et transitions?
```

**Exemple concret:**
> "J'utilise Tailwind CSS avec des variables CSS pour les thèmes. Les couleurs principales sont purple et pink."

#### Étape 4: INTERAGIR (30 sec)
```
🖱️ Comportements:
- Quels états gérer (loading, error, success)?
- Quelles actions utilisateur?
- Navigation entre pages?
```

**Exemple concret:**
> "L'utilisateur peut changer de langue, basculer le thème, et naviguer via la sidebar."

#### Étape 5: OPTIMISER (30 sec)
```
⚡ Performance:
- Le site est-il rapide?
- Est-il accessible (a11y)?
- Fonctionne-t-il sur mobile?
```

**Exemple concret:**
> "Je vérifie le responsive, j'optimise les images, et je teste sur différents navigateurs."

---

### ⏱️ 4:00 - 6:00 | Outils Essentiels (2 min)

**À montrer:**

#### VS Code + Extensions
```
Extensions recommandées:
├── ES7+ React/Redux/React-Native snippets
├── Tailwind CSS IntelliSense
├── TypeScript Vue Plugin
├── Prettier - Code formatter
└── Auto Rename Tag
```

#### Terminal
```bash
# Commandes de base qu'on utilisera
npm create next-app@latest     # Créer un projet
npm run dev                    # Lancer le serveur
npm install <package>          # Installer une dépendance
```

#### Navigateur
```
DevTools essentiels:
├── Elements    → Inspecter le DOM
├── Console     → Voir les erreurs
├── Network     → Analyser les requêtes
└── React DevTools → Débugger les composants
```

---

### ⏱️ 6:00 - 8:00 | Workflow de Développement (2 min)

**À dire:**
> "Voici mon workflow quotidien quand je développe une nouvelle fonctionnalité."

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKFLOW FRONTEND                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. 📝 Lire la spec/maquette                               │
│     ↓                                                       │
│  2. 📁 Créer les fichiers nécessaires                      │
│     ↓                                                       │
│  3. 🧱 Coder le composant (structure HTML)                 │
│     ↓                                                       │
│  4. 🎨 Appliquer les styles (Tailwind)                     │
│     ↓                                                       │
│  5. ⚙️ Ajouter la logique (useState, useEffect)            │
│     ↓                                                       │
│  6. 🔗 Connecter aux données (API, props)                  │
│     ↓                                                       │
│  7. ✅ Tester dans le navigateur                           │
│     ↓                                                       │
│  8. 📱 Vérifier le responsive                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Conseil pratique:**
> "Faites des petits pas! Testez après chaque modification. N'attendez pas d'avoir tout codé pour vérifier."

---

### ⏱️ 8:00 - 10:00 | Présentation du Projet (2 min)

**À dire:**
> "Maintenant que vous connaissez la méthodologie, voyons le projet qu'on va construire ensemble."

#### Workshop Manager - Fonctionnalités

```
┌─────────────────────────────────────────────────────────────┐
│  WORKSHOP MANAGER - Application de Gestion d'Atelier       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 Dashboard                                               │
│     • Statistiques en temps réel                           │
│     • Graphiques de revenus/dépenses                       │
│     • Top performers                                        │
│                                                             │
│  👥 Gestion des Travailleurs                               │
│     • Liste avec performances                              │
│     • Ajout/modification                                   │
│                                                             │
│  💰 Revenus & Dépenses                                     │
│     • Suivi financier                                      │
│     • Catégories                                           │
│                                                             │
│  ⚙️ Paramètres                                             │
│     • Thèmes (dark/light)                                  │
│     • Langues (FR/EN/ES)                                   │
│     • Rôles utilisateur                                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Conclusion de la vidéo:**
> "Dans la prochaine vidéo, on va mettre en place l'architecture Next.js et voir comment organiser tous ces fichiers. À tout de suite!"

---

## 📝 Points Clés à Retenir

| Concept | Description |
|---------|-------------|
| **5 Étapes** | Analyser → Structurer → Styliser → Interagir → Optimiser |
| **Outils** | VS Code, Terminal, DevTools |
| **Workflow** | Petits pas, tests fréquents |
| **Projet** | Workshop Manager avec dashboard, thèmes, i18n |

---

## 🎯 Exercice Pratique

1. Installez VS Code et les extensions recommandées
2. Installez Node.js 18+ si ce n'est pas fait
3. Ouvrez un terminal et vérifiez: `node --version`
4. Notez 3 fonctionnalités que vous aimeriez créer pour votre propre projet

---

## ➡️ Vidéo Suivante

[Vidéo 02: Architecture Next.js](./02-architecture.md)
