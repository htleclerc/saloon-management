# PHASE IA - Booster Intelligence Artificielle

> **Philosophie** : L'IA est un **boost**, pas une nécessité. Le système doit être 100% fonctionnel sans elle.
> **Contexte Agent** : À lire avec [CONTEXT.md](file:///c:/Users/lecle/Workspace/saloon-management/CONTEXT.md)

---

## 🎯 Objectif de cette Phase

Intégrer une couche d'intelligence artificielle transversale qui simplifie la gestion du salon :
1. **Assistant de Gestion** (Langage naturel pour lancer des actions)
2. **Smart Scheduling** (Optimisation des rendez-vous)
3. **Insights & Business Intelligence** (Analyse des revenus et prévisions)
4. **Génération de contenu** (Avatars, descriptions de services)

---

## 🏗️ Architecture "AI-Ready" (Modularité & Fiabilité)

### 1. Graceful Degradation (Fonctionnement sans IA)
- **Feature Toggles** : Chaque fonctionnalité IA est activable/désactivable dans les paramètres.
- **Null Object Pattern** : Si l'IA est désactivée ou les tokens absents, le système utilise un `NullAIService` qui ne fait rien ou renvoie des réponses par défaut, sans bloquer l'interface.
- **Fail-safe UI** : Les boutons "IA" sont masqués ou grisés si le service est indisponible.

### 2. Modèle de Coût & Choix des LLM
- **Backend Proxy** : Le frontend ne parle pas directement aux API (OpenAI/Anthropic). Tout passe par le backend Go.
- **Model Selection** : L'utilisateur peut choisir son modèle dans les paramètres (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5, ou des modèles locaux/low-cost via Ollama).
- **Caching** : Les réponses IA coûteuses sont mises en cache dans Redis.

---

## 📦 Livrables de cette Phase

### 1. Infrastructure IA (Backend Go)
- [ ] `internal/infrastructure/ai/` : Client générique supportant plusieurs fournisseurs (OpenAI, Anthropic, Google).
- [ ] `internal/infrastructure/ai/factory.go` : Pour switcher de modèle à la volée.
- [ ] Endpoint `/api/v1/ai/chat` : Interface de commande en langage naturel.

### 2. UI IA (Frontend)
- [ ] `frontend/context/AIContext.tsx` : Gère le statut de l'IA (active/inactive), les erreurs de tokens et le modèle choisi.
- [ ] `frontend/components/ai/AICommandCenter.tsx` : Barre de commande rapide (CMD+K) pour piloter le salon.
- [ ] `frontend/components/ui/AIBadge.tsx` : Indicateur visuel pour les suggestions intelligentes.

### 3. Fonctionnalités "Smart"
- [ ] **Smart Add** : "Ajoute un client nommé David avec le numéro 06..." (Parse via LLM puis appel API).
- [ ] **Insight Summary** : "Résume moi la journée de demain" (Analyse des bookings).
- [ ] **Data Cleansing** : Détection des doublons dans les clients.

---

## 📝 Étape par Étape

### Étape IA.1 : Configuration & Context

#### Fichier : `frontend/context/AIContext.tsx`

```typescript
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AIConfig {
  isEnabled: boolean;
  provider: 'openai' | 'anthropic' | 'gemini' | 'ollama';
  model: string;
  hasValidToken: boolean;
}

const AIContext = createContext<{ config: AIConfig; updateConfig: (c: Partial<AIConfig>) => void } | undefined>(undefined);

export function AIProvider({ children }: { children: React.ReactNode }) {
  const [config, setConfig] = useState<AIConfig>({
    isEnabled: false,
    provider: 'openai',
    model: 'gpt-4o-mini', // Option low-cost par défaut
    hasValidToken: false,
  });

  // TODO: Charger la config depuis le backend/localStorage au montage

  const updateConfig = (newConfig: Partial<AIConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  return (
    <AIContext.Provider value={{ config, updateConfig }}>
      {children}
    </AIContext.Provider>
  );
}

export const useAI = () => {
  const ctx = useContext(AIContext);
  if (!ctx) throw new Error('useAI must be used within AIProvider');
  return ctx;
};
```

### Étape IA.2 : Le Proxy IA (Backend Go)

#### Structure : `backend/internal/infrastructure/ai/`
L'interface `LLMClient` définit les méthodes communes (GenerateText, ParseSchema).

```go
type LLMProvider interface {
    Chat(ctx context.Context, prompt string) (string, error)
}
```

---

## ✅ Critères de Succès

1. **Vérification "Off"** : Si je coupe l'IA, je peux toujours créer un client manuellement sans aucune erreur console.
2. **Modularité** : Je peux passer de GPT-4o à Claude 3 sur une simple option de réglage.
3. **Erreurs propres** : Si le token est expiré, une notification discrète informe l'utilisateur mais ne bloque pas l'app.
4. **Productivité** : L'ajout d'un client complexe par la barre de commande IA prend moins de 5 secondes.

---

## 💡 Cas d'usage "Boost" (Le quotidien)

- **Le matin** : "Bonjour, quels sont mes 3 créneaux vides les plus importants à remplir aujourd'hui ?"
- **Face au client** : L'IA suggère : "Ce client n'est pas venu depuis 3 mois, proposez-lui la promotion X."
- **Fin de mois** : "Analyse la baisse de revenu du Worker Marie et suggère des actions."

---

**Dernière mise à jour** : 2026-01-18
**Phase active** : S'intercale entre la Phase 1 et 2 (Init core IA).
