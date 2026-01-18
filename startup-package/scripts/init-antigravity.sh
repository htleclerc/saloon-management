#!/bin/bash
# =============================================================================
# Script d'Initialisation Antigravity
# =============================================================================
# Ce script configure un projet pour être utilisé avec un agent IA
# (Antigravity, Claude Code, Cursor, etc.)
#
# Usage:
#   Pour un nouveau projet:  ./init-antigravity.sh new mon-projet
#   Pour un projet existant: ./init-antigravity.sh migrate
# =============================================================================

set -e

# Couleurs pour le terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logo
print_logo() {
    echo -e "${BLUE}"
    echo "    _          _   _                       _ _         "
    echo "   / \   _ __ | |_(_) __ _ _ __ __ ___   _(_) |_ _   _ "
    echo "  / _ \ | '_ \| __| |/ _\` | '__/ _\` \ \ / / | __| | | |"
    echo " / ___ \| | | | |_| | (_| | | | (_| |\ V /| | |_| |_| |"
    echo "/_/   \_\_| |_|\__|_|\__, |_|  \__,_| \_/ |_|\__|\__, |"
    echo "                     |___/                       |___/ "
    echo -e "${NC}"
    echo "Configuration pour Agent IA de Développement"
    echo "============================================="
    echo ""
}

# Fonction: Afficher un message d'info
info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Fonction: Afficher un succès
success() {
    echo -e "${GREEN}✓${NC} $1"
}

# Fonction: Afficher un warning
warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Fonction: Afficher une erreur
error() {
    echo -e "${RED}✗${NC} $1"
}

# Fonction: Vérifier les prérequis
check_prerequisites() {
    info "Vérification des prérequis..."

    if ! command -v git &> /dev/null; then
        error "Git n'est pas installé"
        exit 1
    fi

    if ! command -v node &> /dev/null; then
        warn "Node.js n'est pas installé (optionnel)"
    fi

    if ! command -v jq &> /dev/null; then
        warn "jq n'est pas installé (recommandé pour l'analyse de package.json)"
    fi

    success "Prérequis vérifiés"
}

# Fonction: Créer la structure Antigravity
create_structure() {
    info "Création de la structure Antigravity..."

    mkdir -p .antigravity/prompts
    mkdir -p .antigravity/memory
    mkdir -p .antigravity/logs
    mkdir -p docs/adr

    success "Structure créée"
}

# Fonction: Copier les templates
copy_templates() {
    local SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local TEMPLATE_DIR="$SCRIPT_DIR/../templates/agents"

    info "Copie des templates..."

    # Config
    if [ -f "$TEMPLATE_DIR/config.yml" ]; then
        cp "$TEMPLATE_DIR/config.yml" .antigravity/
        success "config.yml copié"
    else
        warn "config.yml template non trouvé"
    fi

    # Prompts
    if [ -d "$TEMPLATE_DIR/prompts" ]; then
        cp "$TEMPLATE_DIR/prompts"/*.md .antigravity/prompts/ 2>/dev/null || true
        success "Templates de prompts copiés"
    fi
}

# Fonction: Générer AGENT.md
generate_agent_md() {
    info "Génération de AGENT.md..."

    # Détecter les informations du projet
    local PROJECT_NAME="Mon Projet"
    local PROJECT_TYPE="Web App"
    local TECH_STACK="Next.js / TypeScript / Tailwind CSS"

    if [ -f "package.json" ] && command -v jq &> /dev/null; then
        PROJECT_NAME=$(jq -r '.name // "Mon Projet"' package.json)

        # Détecter la stack
        if jq -e '.dependencies.next' package.json > /dev/null 2>&1; then
            TECH_STACK="Next.js"
        elif jq -e '.dependencies.react' package.json > /dev/null 2>&1; then
            TECH_STACK="React"
        elif jq -e '.dependencies.vue' package.json > /dev/null 2>&1; then
            TECH_STACK="Vue.js"
        fi

        if jq -e '.devDependencies.typescript' package.json > /dev/null 2>&1; then
            TECH_STACK="$TECH_STACK / TypeScript"
        fi

        if jq -e '.dependencies.tailwindcss or .devDependencies.tailwindcss' package.json > /dev/null 2>&1; then
            TECH_STACK="$TECH_STACK / Tailwind CSS"
        fi
    fi

    # Générer AGENT.md
    cat > AGENT.md << EOF
# AGENT.md - Instructions pour l'Agent de Développement

> Ce fichier définit le contexte, les conventions et les bonnes pratiques pour ce projet.
> L'agent DOIT lire ce fichier au début de chaque session.

---

## 📋 Informations Projet

### Projet
- **Nom** : $PROJECT_NAME
- **Type** : $PROJECT_TYPE
- **Stack** : $TECH_STACK
- **Statut** : Développement

---

## 📚 Documentation de Référence

**TOUJOURS consulter ces fichiers avant de faire des modifications :**

1. **[startup-package/README.md](startup-package/README.md)** - Vue d'ensemble des bonnes pratiques
2. **[startup-package/docs/standards/ENTERPRISE_STANDARDS.md](startup-package/docs/standards/ENTERPRISE_STANDARDS.md)** - Standards enterprise

---

## 🎯 Règles Impératives

### TOUJOURS ✅
1. Utiliser TypeScript strict mode
2. Valider les inputs avec Zod
3. Écrire des tests pour le nouveau code
4. Utiliser \`TodoWrite\` pour les tâches complexes (> 3 étapes)
5. Faire des commits atomiques avec messages conventionnels
6. Lire le code existant avant de créer du nouveau

### JAMAIS ❌
1. Utiliser \`any\` en TypeScript
2. Committer des secrets
3. Ignorer les erreurs TypeScript ou ESLint
4. Push sur main/master directement

---

## 🛠️ Conventions de Code

### Nommage
| Type | Convention | Exemple |
|------|------------|---------|
| Variables | camelCase | \`userName\` |
| Constantes | UPPER_SNAKE | \`API_URL\` |
| Classes/Types | PascalCase | \`UserService\` |
| Fichiers composants | PascalCase | \`UserProfile.tsx\` |

### Git Commits
\`\`\`
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
\`\`\`

---

## 🔧 Commandes Disponibles

\`\`\`bash
npm run dev      # Développement
npm run build    # Build production
npm run lint     # ESLint
npm run test     # Tests
\`\`\`

---

## ⚠️ Points d'Attention

- Consulter startup-package/docs/ pour les best practices
- Respecter l'architecture existante
- Documenter les décisions importantes dans docs/adr/

---

**Dernière mise à jour** : $(date +%Y-%m-%d)
**Version** : 1.0
EOF

    success "AGENT.md généré"

    # Créer le symlink CLAUDE.md
    if [ ! -f "CLAUDE.md" ]; then
        ln -s AGENT.md CLAUDE.md
        success "CLAUDE.md créé (symlink vers AGENT.md)"
    fi
}

# Fonction: Ajouter le startup-package
add_startup_package() {
    info "Ajout du startup-package..."

    if [ -d "startup-package" ]; then
        warn "startup-package existe déjà"
        return
    fi

    # Demander la méthode
    echo ""
    echo "Comment souhaitez-vous ajouter le startup-package?"
    echo "1) Git submodule (recommandé pour les mises à jour)"
    echo "2) Copie directe"
    echo "3) Ignorer"
    read -p "Choix [1-3]: " choice

    case $choice in
        1)
            if [ -n "$STARTUP_PACKAGE_REPO" ]; then
                git submodule add "$STARTUP_PACKAGE_REPO" startup-package
                success "startup-package ajouté comme submodule"
            else
                warn "Variable STARTUP_PACKAGE_REPO non définie"
                echo "Définissez-la avec: export STARTUP_PACKAGE_REPO=https://github.com/your-org/startup-package.git"
            fi
            ;;
        2)
            if [ -d "../startup-package" ]; then
                cp -r ../startup-package ./startup-package
                success "startup-package copié"
            else
                warn "startup-package non trouvé dans le répertoire parent"
            fi
            ;;
        3)
            info "startup-package ignoré"
            ;;
        *)
            warn "Choix invalide, startup-package ignoré"
            ;;
    esac
}

# Fonction: Mettre à jour .gitignore
update_gitignore() {
    info "Mise à jour de .gitignore..."

    if [ ! -f ".gitignore" ]; then
        touch .gitignore
    fi

    if ! grep -q ".antigravity/memory" .gitignore 2>/dev/null; then
        echo "" >> .gitignore
        echo "# Antigravity Agent" >> .gitignore
        echo ".antigravity/memory/" >> .gitignore
        echo ".antigravity/logs/" >> .gitignore
        success ".gitignore mis à jour"
    else
        info ".gitignore déjà configuré"
    fi
}

# Fonction: Créer un ADR initial
create_initial_adr() {
    info "Création d'un ADR initial..."

    cat > docs/adr/001-agent-integration.md << EOF
# ADR 001: Intégration Agent de Développement IA

## Statut
Accepté

## Contexte
Nous souhaitons utiliser un agent de développement IA (Antigravity/Claude) pour accélérer le développement tout en maintenant la qualité du code.

## Décision
Nous intégrons le startup-package et configurons l'agent via:
- AGENT.md : Instructions principales
- .antigravity/ : Configuration de l'agent
- startup-package/ : Documentation des best practices

## Conséquences

### Positives
- Développement accéléré
- Standards uniformes
- Documentation toujours à jour
- Contexte persistant entre sessions

### Négatives
- Courbe d'apprentissage pour l'équipe
- Dépendance à l'outil

## Notes
- L'agent doit toujours lire AGENT.md au début de chaque session
- Les décisions importantes doivent être documentées dans ce dossier

---
Date: $(date +%Y-%m-%d)
EOF

    success "ADR initial créé"
}

# Fonction: Afficher les prochaines étapes
print_next_steps() {
    echo ""
    echo -e "${GREEN}=============================================${NC}"
    echo -e "${GREEN}   Configuration terminée avec succès !     ${NC}"
    echo -e "${GREEN}=============================================${NC}"
    echo ""
    echo "Fichiers créés:"
    echo "  - AGENT.md (instructions principales)"
    echo "  - CLAUDE.md (symlink)"
    echo "  - .antigravity/ (configuration)"
    echo "  - docs/adr/ (décisions architecturales)"
    echo ""
    echo "Prochaines étapes:"
    echo -e "  ${BLUE}1.${NC} Personnaliser AGENT.md avec les spécificités de votre projet"
    echo -e "  ${BLUE}2.${NC} Configurer .antigravity/config.yml selon vos besoins"
    echo -e "  ${BLUE}3.${NC} Ajouter startup-package si ce n'est pas fait"
    echo -e "  ${BLUE}4.${NC} Lancer votre agent: ${YELLOW}antigravity start${NC}"
    echo ""
    echo "Documentation:"
    echo "  - startup-package/docs/agents/ANTIGRAVITY_GUIDE.md"
    echo ""
}

# =============================================================================
# MAIN
# =============================================================================

print_logo

# Vérifier les arguments
case "${1:-migrate}" in
    new)
        # Nouveau projet
        if [ -z "$2" ]; then
            error "Usage: $0 new <project-name>"
            exit 1
        fi

        PROJECT_NAME="$2"
        info "Création du projet: $PROJECT_NAME"

        mkdir -p "$PROJECT_NAME"
        cd "$PROJECT_NAME"

        git init

        check_prerequisites
        create_structure
        copy_templates
        generate_agent_md
        add_startup_package
        update_gitignore
        create_initial_adr

        git add .
        git commit -m "chore: initial setup with Antigravity agent configuration"

        print_next_steps
        ;;

    migrate)
        # Projet existant
        if [ ! -f "package.json" ] && [ ! -f ".git/config" ]; then
            error "Ce répertoire ne semble pas être un projet"
            echo "Assurez-vous d'être à la racine de votre projet"
            exit 1
        fi

        info "Migration du projet existant..."

        check_prerequisites
        create_structure
        copy_templates
        generate_agent_md
        add_startup_package
        update_gitignore
        create_initial_adr

        echo ""
        read -p "Voulez-vous commiter les changements? [Y/n] " -n 1 -r
        echo ""
        if [[ $REPLY =~ ^[Yy]$ ]] || [[ -z $REPLY ]]; then
            git add .
            git commit -m "chore: add Antigravity agent configuration"
            success "Changements commités"
        fi

        print_next_steps
        ;;

    *)
        echo "Usage: $0 {new <project-name>|migrate}"
        echo ""
        echo "Commands:"
        echo "  new <name>  Créer un nouveau projet avec configuration Antigravity"
        echo "  migrate     Ajouter Antigravity à un projet existant"
        exit 1
        ;;
esac
