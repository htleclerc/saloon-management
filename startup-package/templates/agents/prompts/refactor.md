# Template: Refactoring

## Refactoring: {{REFACTOR_NAME}}

### Objectif
{{REFACTOR_OBJECTIVE}}

### Motivation
{{REFACTOR_MOTIVATION}}

---

## Scope

### Fichiers Concernés
- `{{FILE_1}}`
- `{{FILE_2}}`
- `{{FILE_3}}`

### Hors Scope (Ne PAS toucher)
- `{{EXCLUDED_FILE_1}}`
- `{{EXCLUDED_FILE_2}}`

---

## Instructions pour l'Agent

### Règle d'Or du Refactoring
```
⚠️ AUCUN CHANGEMENT DE COMPORTEMENT
Le code doit faire EXACTEMENT la même chose avant et après.
Seule la structure/organisation change.
```

### Étape 1: Préparation
1. S'assurer que TOUS les tests passent AVANT de commencer
```bash
npm run test
# Doit être 100% vert
```
2. Créer une branche
```bash
git checkout -b refactor/{{BRANCH_NAME}}
```
3. Comprendre le code existant à 100%

### Étape 2: Planification
1. Utiliser TodoWrite pour lister les changements
2. Ordonner du plus simple au plus complexe
3. Chaque étape doit être atomique (commit possible)

### Étape 3: Refactoring Incrémental

Pour CHAQUE changement:

```bash
# 1. Faire le changement minimal
# 2. Vérifier la compilation
npm run type-check

# 3. Exécuter les tests
npm run test

# 4. Si tout est vert, commit
git add .
git commit -m "refactor({{SCOPE}}): {{STEP_DESCRIPTION}}"

# 5. Passer au changement suivant
```

### Étape 4: Validation Finale
```bash
# Tous les tests passent
npm run test

# Pas de régression de couverture
npm run test:cov

# Linting OK
npm run lint

# Types OK
npm run type-check

# Build OK
npm run build
```

### Étape 5: Review
1. Comparer le comportement avant/après
2. Vérifier que les interfaces publiques n'ont pas changé
3. S'assurer que les tests existants n'ont pas été modifiés (sauf renommage)

---

## Type de Refactoring

### Extraction
- [ ] Extract Function
- [ ] Extract Variable
- [ ] Extract Class
- [ ] Extract Interface
- [ ] Extract Hook (React)
- [ ] Extract Component (React)

### Renommage
- [ ] Rename Variable
- [ ] Rename Function
- [ ] Rename Class
- [ ] Rename File
- [ ] Rename Module

### Restructuration
- [ ] Move Function
- [ ] Move Class
- [ ] Inline Variable
- [ ] Inline Function
- [ ] Replace Conditional with Polymorphism

### Simplification
- [ ] Remove Dead Code
- [ ] Simplify Conditional
- [ ] Remove Duplication (DRY)
- [ ] Reduce Complexity

---

## Patterns à Appliquer

### Avant
```typescript
{{BEFORE_CODE}}
```

### Après
```typescript
{{AFTER_CODE}}
```

---

## Métriques à Améliorer

| Métrique | Avant | Cible | Après |
|----------|-------|-------|-------|
| Complexité cyclomatique | {{BEFORE}} | {{TARGET}} | - |
| Lignes de code | {{BEFORE}} | {{TARGET}} | - |
| Duplication | {{BEFORE}} | {{TARGET}} | - |
| Couverture tests | {{BEFORE}} | {{TARGET}} | - |

---

## Checklist

### Préparation
- [ ] Tous les tests passent avant refactoring
- [ ] Code compris à 100%
- [ ] Branche créée

### Exécution
- [ ] Changements incrémentaux
- [ ] Tests après chaque étape
- [ ] Commits atomiques

### Validation
- [ ] Comportement identique
- [ ] Tous les tests passent
- [ ] Pas de régression de couverture
- [ ] Lint OK
- [ ] Types OK
- [ ] Build OK

### Documentation
- [ ] Commentaires mis à jour si nécessaire
- [ ] ADR créé si changement architectural

---

## Rollback Plan

Si quelque chose ne va pas:
```bash
# Revenir au dernier commit fonctionnel
git reset --hard HEAD~1

# Ou annuler tout le refactoring
git checkout main
git branch -D refactor/{{BRANCH_NAME}}
```

---

## Notes

{{ADDITIONAL_NOTES}}
