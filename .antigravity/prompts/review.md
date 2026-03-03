# Template: Code Review

## Review: {{PR_TITLE}}

### PR/MR
- **URL**: {{PR_URL}}
- **Auteur**: {{AUTHOR}}
- **Branch**: {{BRANCH_NAME}} → {{TARGET_BRANCH}}

---

## Instructions pour l'Agent

### Objectif
Effectuer une review de code complète en vérifiant:
1. Qualité du code
2. Respect des conventions
3. Sécurité
4. Performance
5. Tests
6. Documentation

---

## Checklist de Review

### 1. Compréhension Générale
- [ ] Je comprends l'objectif de ce changement
- [ ] Le changement résout effectivement le problème décrit
- [ ] La solution est appropriée pour le problème

### 2. Architecture & Design
- [ ] Respecte l'architecture existante (hexagonale, etc.)
- [ ] Pas de couplage inapproprié entre modules
- [ ] Responsabilités bien séparées (SRP)
- [ ] Interfaces et abstractions appropriées
- [ ] Pas de sur-ingénierie

### 3. Qualité du Code
- [ ] Nommage clair et descriptif
- [ ] Fonctions courtes et focalisées
- [ ] Pas de code dupliqué
- [ ] Complexité raisonnable
- [ ] Gestion d'erreurs appropriée
- [ ] Pas de code mort ou commenté

### 4. TypeScript
- [ ] Pas de `any` (sauf justifié)
- [ ] Types explicites quand nécessaire
- [ ] Interfaces/Types bien définis
- [ ] Null/undefined correctement gérés
- [ ] Generics utilisés à bon escient

### 5. React (si applicable)
- [ ] Hooks utilisés correctement
- [ ] Pas de re-renders inutiles
- [ ] Keys uniques pour les listes
- [ ] Effects avec dépendances correctes
- [ ] Composants bien décomposés

### 6. Sécurité
- [ ] Pas de secrets hardcodés
- [ ] Inputs utilisateur validés
- [ ] Pas de failles XSS
- [ ] Pas de failles injection
- [ ] Données sensibles protégées
- [ ] Autorisations vérifiées

### 7. Performance
- [ ] Pas de N+1 queries
- [ ] Memoization si nécessaire
- [ ] Lazy loading approprié
- [ ] Pas de memory leaks potentiels
- [ ] Bundle size raisonnable

### 8. Tests
- [ ] Tests unitaires présents
- [ ] Tests couvrent les cas nominaux
- [ ] Tests couvrent les cas d'erreur
- [ ] Tests lisibles et maintenables
- [ ] Couverture acceptable

### 9. Documentation
- [ ] Code auto-documenté
- [ ] Commentaires pour logique complexe
- [ ] README mis à jour si nécessaire
- [ ] Changelog mis à jour si nécessaire

### 10. Conventions
- [ ] Respect des conventions de nommage
- [ ] Format de commit correct
- [ ] Structure de fichiers respectée
- [ ] Imports ordonnés

---

## Analyse des Fichiers

### Fichiers Modifiés

| Fichier | Lignes | Verdict | Notes |
|---------|--------|---------|-------|
| `{{FILE_1}}` | +{{ADDED}}/-{{REMOVED}} | ✅/⚠️/❌ | {{NOTES}} |
| `{{FILE_2}}` | +{{ADDED}}/-{{REMOVED}} | ✅/⚠️/❌ | {{NOTES}} |

---

## Commentaires de Review

### 🔴 Bloquants (Must Fix)
```
Aucun changement bloquant identifié.
OU
1. [Fichier:Ligne] Description du problème bloquant
   Suggestion: ...
```

### 🟡 Suggestions (Should Fix)
```
Aucune suggestion majeure.
OU
1. [Fichier:Ligne] Description de l'amélioration suggérée
   Suggestion: ...
```

### 🟢 Nitpicks (Nice to Have)
```
Aucun nitpick.
OU
1. [Fichier:Ligne] Petite amélioration possible
   Suggestion: ...
```

### 💡 Questions
```
Aucune question.
OU
1. [Fichier:Ligne] Question sur le choix d'implémentation
```

---

## Résumé

### Verdict Global
- [ ] ✅ **Approved** - Prêt à merger
- [ ] 🟡 **Approved with comments** - Merger après corrections mineures
- [ ] ⚠️ **Request changes** - Nécessite des modifications
- [ ] ❌ **Rejected** - Approche fondamentale à revoir

### Points Positifs
- {{POSITIVE_1}}
- {{POSITIVE_2}}

### Points à Améliorer
- {{IMPROVEMENT_1}}
- {{IMPROVEMENT_2}}

### Score
| Critère | Note |
|---------|------|
| Qualité du code | ⭐⭐⭐⭐⭐ |
| Tests | ⭐⭐⭐⭐⭐ |
| Documentation | ⭐⭐⭐⭐⭐ |
| Sécurité | ⭐⭐⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐⭐ |

---

## Notes

{{ADDITIONAL_NOTES}}
