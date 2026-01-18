# Template: Nouvelle Feature

## Feature: {{FEATURE_NAME}}

### Description
{{FEATURE_DESCRIPTION}}

---

## Instructions pour l'Agent

### Étape 1: Préparation
1. Consulte `AGENT.md` pour les conventions du projet
2. Consulte `startup-package/docs/` pour les best practices pertinentes
3. Identifie les fichiers existants similaires à cette feature
4. Vérifie s'il existe déjà du code réutilisable

### Étape 2: Planification
1. Utilise `TodoWrite` pour créer une liste de tâches détaillée
2. Décompose en étapes de maximum 30 minutes chacune
3. Identifie les dépendances entre les tâches

### Étape 3: Architecture
Respecte l'architecture existante:
- **Domain**: Entités, Value Objects, Interfaces Repository
- **Application**: Use Cases / Services
- **Infrastructure**: Implémentations concrètes
- **Presentation**: Composants React, Pages

### Étape 4: Implémentation
Pour chaque étape:
1. Lire le code existant pertinent
2. Implémenter le changement minimal
3. Vérifier que ça compile (`npm run type-check`)
4. Tester manuellement si applicable

### Étape 5: Tests
1. Écrire les tests unitaires pour la logique métier
2. Écrire les tests d'intégration si nécessaire
3. Vérifier la couverture de code
4. S'assurer que tous les tests passent

### Étape 6: Validation Finale
```bash
npm run lint
npm run type-check
npm run test
npm run build  # Si modification importante
```

### Étape 7: Commit
```bash
git add .
git commit -m "feat({{SCOPE}}): {{COMMIT_MESSAGE}}"
```

---

## Critères d'Acceptation

- [ ] {{CRITERION_1}}
- [ ] {{CRITERION_2}}
- [ ] {{CRITERION_3}}
- [ ] Tests unitaires écrits et passent
- [ ] Pas d'erreurs TypeScript
- [ ] Pas de warnings ESLint
- [ ] Code documenté si complexe
- [ ] PR prête avec description

---

## Contexte Additionnel

### Fichiers Concernés (estimation)
- `{{FILE_1}}`
- `{{FILE_2}}`
- `{{FILE_3}}`

### Dépendances
- {{DEPENDENCY_1}}
- {{DEPENDENCY_2}}

### Risques / Points d'Attention
- {{RISK_1}}
- {{RISK_2}}

---

## Notes

{{ADDITIONAL_NOTES}}
