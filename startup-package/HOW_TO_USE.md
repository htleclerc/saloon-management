# 📘 Comment Utiliser ce Package - Guide Complet

> Guide pratique pour appliquer les bonnes pratiques sur vos projets

---

## 🎯 Scénarios d'Utilisation

### Scénario 1 : Nouveau Projet from Scratch

**Vous démarrez un tout nouveau projet**

#### Étapes

1. **Initialisation automatique (Linux/Mac)**
   ```bash
   cd ~/mes-projets
   bash /chemin/vers/startup-package/scripts/init-project.sh mon-app
   cd mon-app
   ```

2. **Ou initialisation manuelle (Windows/Toutes plateformes)**
   ```bash
   # Créer le projet Next.js
   npx create-next-app@latest mon-app --typescript --tailwind --app
   cd mon-app

   # Copier les configs
   cp /chemin/vers/startup-package/templates/configs/* .

   # Copier les templates
   cp /chemin/vers/startup-package/templates/checklists/PROJECT_PLAN_TEMPLATE.md ./PROJECT_PLAN.md
   cp /chemin/vers/startup-package/templates/checklists/ARCHITECTURE_TEMPLATE.md ./ARCHITECTURE.md

   # Créer la structure
   mkdir -p components/{ui,features,layout}
   mkdir -p lib/{services,hooks,utils,validations}
   mkdir -p types config tests
   ```

3. **Planification avec Claude Code**
   ```
   Je démarre un nouveau projet : [DESCRIPTION].

   Utilise startup-package/docs/01-PLANNING.md pour m'aider à :
   1. Remplir PROJECT_PLAN.md
   2. Définir l'architecture dans ARCHITECTURE.md
   3. Valider ma stack technique

   Suis la méthodologie étape par étape.
   ```

4. **Configuration**
   ```bash
   cp .env.example .env.local
   # Éditer .env.local
   ```

5. **Validation**
   ```bash
   npm run type-check
   npm run lint
   npm run build
   ```

6. **Développement**
   ```bash
   npm run dev
   ```

---

### Scénario 2 : Projet Existant à Améliorer

**Vous avez un projet existant et voulez adopter les bonnes pratiques**

#### Approche Progressive

##### Phase 1 : Documentation (1-2 heures)

```bash
# 1. Copier les templates de documentation
cp startup-package/templates/checklists/PROJECT_PLAN_TEMPLATE.md ./PROJECT_PLAN.md
cp startup-package/templates/checklists/ARCHITECTURE_TEMPLATE.md ./ARCHITECTURE.md

# 2. Documenter l'existant avec Claude Code
```

**Prompt Claude Code :**
```
J'ai un projet Next.js existant. Aide-moi à :

1. Analyser la structure actuelle
2. Remplir PROJECT_PLAN.md en documentant ce qui existe
3. Compléter ARCHITECTURE.md avec les choix techniques actuels
4. Identifier les améliorations possibles

Voici la structure de mon projet actuel :
[Coller la sortie de `tree -L 3` ou `ls -R`]
```

##### Phase 2 : Configuration (30 min - 1 heure)

```bash
# 1. Améliorer TypeScript
cp startup-package/templates/configs/tsconfig.json .
npm run type-check # Corriger les erreurs

# 2. Ajouter ESLint/Prettier
cp startup-package/templates/configs/.eslintrc.json .
cp startup-package/templates/configs/.prettierrc .
npm install -D prettier eslint-config-prettier
npm run lint:fix
npm run format

# 3. Sécuriser les configs
cp startup-package/templates/configs/next.config.js .
# Adapter à votre projet
```

##### Phase 3 : Refactoring Progressif (1-2 semaines)

**Semaine 1 : Organiser les composants**

```bash
# Créer la nouvelle structure
mkdir -p components/{ui,features,layout}

# Avec Claude Code, refactoriser progressivement
```

**Prompt Claude Code :**
```
Aide-moi à refactoriser mes composants selon la structure recommandée :
startup-package/templates/project-structure/nextjs-14/STRUCTURE.md

Commençons par les composants UI de base.
Voici mes composants actuels dans components/ :
[Liste vos fichiers]

Propose un plan de refactoring.
```

**Semaine 2 : Organiser la logique métier**

```bash
# Créer la structure lib/
mkdir -p lib/{services,hooks,utils,validations}

# Extraire la logique des composants vers lib/
```

**Prompt Claude Code :**
```
Aide-moi à extraire la logique métier de mes composants vers lib/services/ et lib/hooks/.

Feature à refactoriser : [NOM DE LA FEATURE]

Suis les patterns de startup-package/docs/01-PLANNING.md section "Layers et Responsabilités".
```

##### Phase 4 : Tests et Validation (En continu)

```bash
# Ajouter des tests au fur et à mesure
mkdir -p tests/{unit,integration}

# Valider régulièrement
npm run type-check
npm run lint
npm run build
```

---

### Scénario 3 : Formation d'Équipe

**Vous voulez former votre équipe aux bonnes pratiques**

#### Plan de Formation

##### Semaine 1 : Introduction

- **Jour 1-2** : Lecture de `startup-package/README.md` et `docs/01-PLANNING.md`
- **Jour 3** : Atelier pratique : Remplir un `PROJECT_PLAN.md` ensemble
- **Jour 4** : Atelier : Définir une `ARCHITECTURE.md` pour un projet fictif
- **Jour 5** : Créer un projet pilote avec le script d'init

##### Semaine 2 : Pratique

- **Projet pilote** : Chaque membre crée un petit projet en suivant le package
- **Code review quotidienne** : Vérifier l'application des bonnes pratiques
- **Documentation** : Chacun documente ses patterns préférés

##### Semaine 3 : Application

- **Refactoring d'un projet existant** : Par équipe de 2-3
- **Présentation** : Partage des apprentissages

#### Checklist de Formation

- [ ] Tous les membres ont lu la documentation
- [ ] Chaque membre a créé un projet test avec le package
- [ ] L'équipe a défini ses conventions (ajouts au package)
- [ ] Un projet pilote a été refactoré avec succès
- [ ] Les bonnes pratiques sont documentées dans le wiki équipe

---

## 🔄 Utilisation avec Claude Code

### Prompts par Phase

#### Phase Planification

```
Je veux planifier un nouveau projet : [TYPE DE PROJET]

Contexte :
- Public cible : [QUI]
- Problème résolu : [QUOI]
- Contraintes : [CONTRAINTES]

Utilise EnterPlanMode et suis startup-package/docs/01-PLANNING.md pour :
1. M'aider à affiner la vision
2. Définir le MVP
3. Choisir la stack technique
4. Remplir PROJECT_PLAN.md

Posez-moi des questions pour clarifier au besoin.
```

#### Phase Architecture

```
J'ai terminé la planification (PROJECT_PLAN.md ci-dessous).

[COLLER VOTRE PROJECT_PLAN.md]

Aide-moi maintenant à :
1. Choisir la stack technique optimale
2. Concevoir l'architecture
3. Remplir ARCHITECTURE.md

Utilise startup-package/templates/checklists/ARCHITECTURE_TEMPLATE.md comme guide.
```

#### Phase Développement

```
Je commence le développement de [FEATURE].

Mon plan : [RÉSUMÉ DE PROJECT_PLAN.md]
Mon architecture : [RÉSUMÉ DE ARCHITECTURE.md]

Utilise TodoWrite pour décomposer cette feature en tâches.
Suis la structure de startup-package/templates/project-structure/nextjs-14/

Commençons !
```

#### Phase Refactoring

```
J'ai ce code existant à refactoriser selon les bonnes pratiques :

[COLLER LE CODE]

Refactorise-le en suivant :
- Structure de startup-package/templates/project-structure/nextjs-14/
- Patterns de séparation UI/Logique
- TypeScript strict

Explique les changements.
```

---

## 📁 Personnalisation du Package

### Ajouter Vos Patterns

```
startup-package/
└── custom/                    # Créez ce dossier
    ├── my-patterns/
    │   ├── auth-pattern.md
    │   └── api-pattern.md
    ├── my-configs/
    │   └── custom-eslint.json
    └── my-checklists/
        └── pre-deploy.md
```

### Adapter à Votre Stack

Si vous n'utilisez pas Next.js :

1. **Créez votre structure**
   ```bash
   mkdir -p startup-package/templates/project-structure/[votre-stack]/
   ```

2. **Documentez-la**
   ```bash
   touch startup-package/templates/project-structure/[votre-stack]/STRUCTURE.md
   ```

3. **Créez vos configs**
   ```bash
   mkdir -p startup-package/templates/configs/[votre-stack]/
   ```

4. **Partagez avec votre équipe**

---

## 🎓 Cas d'Usage Avancés

### Cas 1 : Multi-Projets (Monorepo)

```bash
# Structure
my-monorepo/
├── packages/
│   ├── web-app/          # Initialisé avec startup-package
│   ├── mobile-app/       # Initialisé avec startup-package
│   └── shared/           # Logique partagée
└── startup-package/      # Une seule copie pour tous les projets
```

**Utilisation** :
- Chaque sous-projet a son `PROJECT_PLAN.md` et `ARCHITECTURE.md`
- Référencez le startup-package depuis la racine
- Configs partagées dans `/packages/shared/configs/`

### Cas 2 : Template d'Entreprise

1. **Forkez le startup-package**
2. **Ajoutez vos spécificités** :
   - Configs ESLint de l'entreprise
   - Composants UI corporate
   - Patterns obligatoires
3. **Distribuez en interne**

```bash
# Vos employés utilisent
git clone git@github.com:votre-entreprise/startup-package.git
bash startup-package/scripts/init-project.sh nouveau-projet
```

### Cas 3 : Projet Open Source

1. **Incluez le startup-package dans votre repo**
   ```
   mon-projet/
   ├── .github/
   ├── src/
   ├── docs/
   │   ├── PROJECT_PLAN.md
   │   └── ARCHITECTURE.md
   └── CONTRIBUTING.md  # Référence le package
   ```

2. **Dans CONTRIBUTING.md** :
   ```markdown
   # Contributing

   Ce projet suit les bonnes pratiques du startup-package.

   Avant de contribuer :
   1. Lisez PROJECT_PLAN.md
   2. Consultez ARCHITECTURE.md
   3. Suivez la structure définie
   ```

---

## ✅ Checklist d'Utilisation

### Pour Chaque Nouveau Projet

- [ ] **Initialisation**
  - [ ] Créer avec script ou manuellement
  - [ ] Copier les templates
  - [ ] Installer les dépendances

- [ ] **Planification**
  - [ ] Remplir PROJECT_PLAN.md (avec Claude Code)
  - [ ] Définir ARCHITECTURE.md (avec Claude Code)
  - [ ] Valider avec l'équipe/client

- [ ] **Configuration**
  - [ ] Copier les configs (TypeScript, ESLint, etc.)
  - [ ] Configurer .env.local
  - [ ] Adapter les configs à vos besoins

- [ ] **Structure**
  - [ ] Créer les dossiers selon template
  - [ ] Documenter toute variation

- [ ] **Validation**
  - [ ] `npm run type-check` ✅
  - [ ] `npm run lint` ✅
  - [ ] `npm run build` ✅
  - [ ] Git init + premier commit ✅

- [ ] **Développement**
  - [ ] Lire docs/02-DEVELOPMENT.md (Phase 2)
  - [ ] Utiliser TodoWrite pour tracer les tâches
  - [ ] Commiter régulièrement

---

## 🆘 Résolution de Problèmes

### "Je ne sais pas par où commencer"

➡️ Suivez [QUICK_START.md](QUICK_START.md) à la lettre

### "Mon projet est différent, cette structure ne convient pas"

➡️ C'est normal ! Adaptez-la :
1. Lisez [templates/project-structure/nextjs-14/STRUCTURE.md](templates/project-structure/nextjs-14/STRUCTURE.md)
2. Identifiez ce qui s'applique
3. Documentez vos variations dans un fichier `STRUCTURE_CUSTOM.md`

### "Mon équipe résiste au changement"

➡️ Approche progressive :
1. Commencez par un projet pilote
2. Démontrez les bénéfices (moins de bugs, plus de maintenabilité)
3. Formez progressivement
4. Ajustez le package aux retours

### "Trop de configuration, je veux coder !"

➡️ Le temps investi en planification économise 10x en développement :
- Phase 1 (Planning) : 2-4 heures
- Économie sur 3 mois de dev : 20-40 heures (moins de refactoring, moins de bugs)

---

## 📚 Ressources par Rôle

### Développeur Solo

Fichiers clés :
- [QUICK_START.md](QUICK_START.md)
- [docs/01-PLANNING.md](docs/01-PLANNING.md)
- Utilisez Claude Code pour tout

### Tech Lead

Fichiers clés :
- Tous les fichiers docs/
- [templates/checklists/ARCHITECTURE_TEMPLATE.md](templates/checklists/ARCHITECTURE_TEMPLATE.md)
- Adaptez pour votre équipe

### Product Manager

Fichiers clés :
- [templates/checklists/PROJECT_PLAN_TEMPLATE.md](templates/checklists/PROJECT_PLAN_TEMPLATE.md)
- Section "User Stories"
- Collaborez avec Claude Code pour affiner

### CTO / Architect

Fichiers clés :
- [ARCHITECTURE_TEMPLATE.md](templates/checklists/ARCHITECTURE_TEMPLATE.md)
- Section "ADRs" (Architecture Decision Records)
- Créez vos propres templates dans `custom/`

---

## 🎯 Prochaines Étapes

Maintenant que vous savez utiliser le package :

1. **Testez-le** sur un petit projet
2. **Adaptez-le** à vos besoins
3. **Partagez-le** avec votre équipe
4. **Améliorez-le** au fil de vos projets

**Questions ?** Demandez à Claude Code en référençant ce package !

---

**Bon développement ! 🚀**
