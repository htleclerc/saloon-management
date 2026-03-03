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
Date: 2026-01-18
