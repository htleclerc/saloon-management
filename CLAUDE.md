# CLAUDE.md - Instructions pour l'Agent de Développement

> Ce fichier résume le contexte, les conventions et les bonnes pratiques pour ce projet.
> L'agent DOIT lire ce fichier puis [CONTEXT.md](CONTEXT.md) au début de chaque session.

---

## 📋 Informations Projet

### Projet
- **Nom** : Saloon Management System
- **Type** : Web App SaaS multi-tenant (gestion de salons de coiffure / tressage)
- **Stack** : Next.js 16 (App Router) / React 19 / TypeScript strict / Tailwind CSS 4 / Supabase / Zod
- **Version** : 1.2.0
- **Statut** : Produit fonctionnel en consolidation

---

## 📚 Documentation de Référence

**TOUJOURS consulter ces fichiers avant de faire des modifications :**

1. **[CONTEXT.md](CONTEXT.md)** - État réel du projet, architecture, modes de données, avancement
2. **[AGENT.md](AGENT.md)** - Conventions de code et patterns détaillés
3. **[docs/PROCESS_QUALITY.md](docs/PROCESS_QUALITY.md)** - Questionnaire RG et canevas de feature
4. **[startup-package/README.md](startup-package/README.md)** - Bonnes pratiques génériques
5. **[startup-package/docs/standards/ENTERPRISE_STANDARDS.md](startup-package/docs/standards/ENTERPRISE_STANDARDS.md)** - Standards enterprise

---

## 🎯 Règles Impératives

### TOUJOURS ✅
1. Utiliser TypeScript strict mode
2. Valider les inputs avec Zod
3. Écrire des tests pour le nouveau code (services, règles métier)
4. Utiliser `TodoWrite` pour les tâches complexes (> 3 étapes)
5. Faire des commits atomiques avec messages conventionnels
6. Lire le code existant avant de créer du nouveau
7. Passer par `lib/services` et `lib/permissions.ts` pour les données et les droits
8. Écrire le code en anglais et afficher les textes via i18n (`t('key.path')`)

### JAMAIS ❌
1. Utiliser `any` en TypeScript
2. Committer des secrets
3. Ignorer les erreurs TypeScript ou ESLint
4. Push sur main/master directement
5. Appeler Supabase directement depuis une page ou un composant
6. Mettre du texte, des couleurs ou des données en dur dans les pages

---

## 🛠️ Conventions de Code

### Nommage
| Type | Convention | Exemple |
|------|------------|---------|
| Variables | camelCase | `userName` |
| Constantes | UPPER_SNAKE | `API_URL` |
| Classes/Types | PascalCase | `UserService` |
| Fichiers composants | PascalCase | `UserProfile.tsx` |
| Hooks | camelCase + use | `useAuth()` |
| Services | PascalCase + Service | `WorkerService.ts` |

### Git Commits
```
type(scope): description

Types: feat, fix, docs, style, refactor, test, chore
```

---

## 🔧 Commandes Disponibles (dans `frontend/`)

```bash
npm run dev            # Développement (port 3000)
npm run build          # Build production
npm run lint           # ESLint
npm run lint:fix       # ESLint avec auto-fix
npm run type-check     # tsc --noEmit
npm run format         # Prettier
npm run test           # Vitest (unitaires)
npm run test:coverage  # Vitest + couverture
npm run test:e2e       # Playwright (E2E)
```

Avant tout commit : `npm run lint && npm run type-check && npm run test`.

---

## ⚠️ Points d'Attention

- Trois modes de données : `demo-local`, `demo-supabase`, `normal` (voir CONTEXT.md)
- Rôles : `super_admin`, `owner`, `manager`, `worker`, `client` (pas de rôle `admin`)
- Le backend Go prévu initialement n'existe pas : Supabase est le backend
- Respecter l'architecture existante (pages → services → providers)
- Documenter les décisions importantes dans `docs/adr/`
- Mettre à jour `CONTEXT.md` quand une décision ou un module change

---

**Dernière mise à jour** : 2026-10-16
**Version** : 2.0
