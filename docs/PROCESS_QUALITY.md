# PROCESS QUALITY - Standards & Canevas

> **Usage Obligatoire** : Ce document doit être utilisé avant tout développement de nouvelle fonctionnalité.

---

## 🛡️ Questionnaire RG (Validation Formulaires)

**À remplir avant de coder tout formulaire pour garantir le "Zero Bug".**

### 1. Champs & Contraintes
- [ ] Quels champs sont **strictement obligatoires** ?
- [ ] Formats spécifiques (Regex téléphone, email pro, IBAN...) ?
- [ ] Longueur min/max ?

### 2. Immutabilité & Sécurité
- [ ] Quand cet objet devient-il **non-modifiable** ? (ex: Facture émise)
- [ ] Quels champs sont `readonly` en édition ? (ex: ID, Date création)
- [ ] Qui a le droit de modifier ? (RBAC)

### 3. Logique & Dépendances
- [ ] La valeur de A modifie-t-elle B ? (ex: Statut "Inactif" cache le Planning)
- [ ] Unicité : Globale ou par Tenant ?

### 4. White Label / Multi-Tenant
- [ ] Ce champ est-il masquable selon le plan d'abonnement ?
- [ ] Le label est-il personnalisable par le Tenant ?

---

## 🚀 Canevas Nouvelle Fonctionnalité

**Copier/Coller ce modèle pour toute demande de feature.**

```markdown
# FEATURE REQUEST: [Nom Fonctionnalité]

## 1. Définition
**Acteurs** : (SuperAdmin, Manager...)
**Objectif** : (Pourquoi ?)

## 2. Règles de Gestion (Cœur du Système)
- **RG-01** : 
- **RG-02** : 
- **Immutabilité** : (Champs figés ?)

## 3. UI/UX & White Label
**Emplacement** : 
**Adaptabilité** : (Configurable par Tenant ?)

## 4. Données
**Entités impactées** : 
**Nouveaux champs** : 

## 5. Mockup / Stubs (Phase 0)
**Actions à bouchonner** : 
```

---

## 🏭 Architecture "Centrale RG"

### Principes
1. **Schema-First** : La vérité est dans `lib/domain/rules`, pas dans l'UI.
2. **Hook Unique** : Utiliser `useFormValidator(schema, context)` partout.
3. **White Label Native** : Le `TenantConfig` pilote l'affichage des champs.

### Structure Dossiers
```
lib/
└── domain/
    └── rules/
        ├── worker.rules.ts   # RG pures (Zod)
        ├── client.rules.ts
        └── billing.rules.ts
```

---

**Dernière mise à jour** : 2026-01-21
