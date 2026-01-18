# Template: Correction de Bug

## Bug: {{BUG_TITLE}}

### Symptôme
{{BUG_DESCRIPTION}}

### Comportement Attendu
{{EXPECTED_BEHAVIOR}}

### Comportement Actuel
{{ACTUAL_BEHAVIOR}}

---

## Étapes de Reproduction

1. {{STEP_1}}
2. {{STEP_2}}
3. {{STEP_3}}

### Environnement
- **Navigateur**: {{BROWSER}}
- **OS**: {{OS}}
- **Version**: {{APP_VERSION}}

---

## Instructions pour l'Agent

### Étape 1: Reproduction
1. Reproduis le bug localement
2. Confirme que le bug existe
3. Identifie le composant/module responsable

### Étape 2: Investigation
1. Utilise `Grep` pour trouver le code concerné
2. Lis les fichiers pertinents
3. Comprends le flux de données
4. Identifie la cause racine

### Étape 3: Test Qui Échoue (TDD)
```typescript
// Écris d'abord un test qui reproduit le bug
describe('{{TEST_DESCRIBE}}', () => {
  it('should {{EXPECTED_BEHAVIOR}}', () => {
    // Arrange
    // Act
    // Assert - Ce test doit ÉCHOUER avant le fix
  });
});
```

### Étape 4: Correction
1. Applique le fix minimal
2. Évite les changements non liés au bug
3. Ne pas introduire de régression

### Étape 5: Vérification
```bash
# Le test doit maintenant passer
npm run test -- --testPathPattern="{{TEST_FILE}}"

# Aucune régression
npm run test

# Vérifications de qualité
npm run lint
npm run type-check
```

### Étape 6: Validation Manuelle
1. Reproduis les étapes de reproduction
2. Confirme que le bug est corrigé
3. Teste les cas limites

### Étape 7: Commit
```bash
git add .
git commit -m "fix({{SCOPE}}): {{FIX_DESCRIPTION}}

Closes #{{ISSUE_NUMBER}}"
```

---

## Analyse de Cause Racine

### Cause Identifiée
{{ROOT_CAUSE}}

### Pourquoi ce Bug est Apparu
{{WHY_BUG_OCCURRED}}

### Comment Éviter à l'Avenir
{{PREVENTION_MEASURES}}

---

## Fichiers Modifiés

- [ ] `{{FILE_1}}` - {{CHANGE_DESCRIPTION_1}}
- [ ] `{{FILE_2}}` - {{CHANGE_DESCRIPTION_2}}

---

## Checklist

- [ ] Bug reproduit localement
- [ ] Cause racine identifiée
- [ ] Test écrit qui échoue avant fix
- [ ] Fix appliqué
- [ ] Test passe après fix
- [ ] Aucune régression (tous les tests passent)
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de warnings ESLint
- [ ] Validation manuelle effectuée
- [ ] Commit avec référence au ticket

---

## Notes

{{ADDITIONAL_NOTES}}
