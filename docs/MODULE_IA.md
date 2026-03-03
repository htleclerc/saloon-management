# MODULE IA - Intégration de l'Intelligence Artificielle

> **Sujet** : Comment booster son SaaS avec l'IA tout en restant fiable et low-cost.

---

## 🎯 Objectif du Module

Démontrer que l'IA peut être un levier de productivité énorme même si elle n'est pas au "coeur" vital de l'application.

---

## 📚 Contenu du Module

### 1. Stratégie d'Architecture
- [ ] **IA comme Service Togeable** : Pourquoi et comment séparer l'IA des fonctions vitales.
- [ ] **The AI Proxy Pattern** : Sécuriser les API keys et permettre le changement de modèle côté serveur.
- [ ] **Dégradation gracieuse** : Concevoir une UI qui vit sans IA.

### 2. Implémentation Pratique
- [ ] **Smart Actions** : Transformer du texte libre en appels d'API structurés.
- [ ] **RAG simplifié** : Donner du contexte à l'IA sur les données du salon sans exploser les tokens.
- [ ] **Prompt Engineering** : Créer des prompts robustes pour des sorties JSON garanties.

### 3. Business & Coût
- [ ] **Choisir son modèle** : Comparaison prix/performance (GPT-4o vs Claude vs Models locaux).
- [ ] **Abonnement IA** : Comment monétiser ces fonctionnalités "Smart" auprès des clients du salon.

---

##  Leçons Clés
1. **L'IA est instable** : Toujours avoir une UI d'édition manuelle derrière chaque action IA.
2. **Le coût est linéaire** : Utiliser le cache Redis pour les questions récurrentes.
3. **Le choix de l'utilisateur** : Permettre au client d'apporter sa propre clé API (BYOK) ou d'utiliser celle du SaaS.

---

**Dernière mise à jour** : 2026-01-18
