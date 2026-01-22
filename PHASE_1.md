# PHASE 1 - Frontend Providers Architecture

> **Contexte Agent** : À lire avec [CONTEXT.md](file:///c:/Users/lecle/Workspace/saloon-management/CONTEXT.md) avant de démarrer

---

## 🎯 Objectif de cette Phase

Créer l'architecture de providers flexible permettant de switcher entre 3 modes de données (localStorage, Supabase, Go API) sans changer le code métier.

---

## 📋 Prérequis

### À Lire Avant de Commencer
1. ✅ [CONTEXT.md](file:///c:/Users/lecle/Workspace/saloon-management/CONTEXT.md) - Contexte global du projet
2. ✅ [AGENT.md](file:///c:/Users/lecle/Workspace/saloon-management/AGENT.md) - Conventions actuelles
3. ✅ [implementation_plan.md](file:///c:/Users/lecle/.gemini/antigravity/brain/d7f8c1ac-84d4-4922-a475-886faf2f608e/implementation_plan.md) - Détails Phase 1

### Connaissances Requises
- TypeScript strict mode
- React Context API
- Factory Pattern
- Service Layer Pattern

---

## 📦 Livrables de cette Phase

### 1. Conception & Data Model
- [ ] `docs/MCD.md` - Modèle Conceptuel de Données (validé par le Front)
- [ ] `docs/PROCESS_QUALITY.md` - Standards Qualité & Canevas (FAIT)
- [ ] `frontend/lib/providers/types.ts` - Interfaces IDataProvider

### 2. Architecture RG (Centralisée)
- [ ] `frontend/lib/domain/rules/` - Initialisation structure
- [ ] Création Hook `useFormValidator`

### 3. Context Provider
- [ ] `frontend/context/DataModeProvider.tsx` - Context React pour mode switching

### 3. Factory
- [ ] `frontend/lib/providers/factory.ts` - Factory pour créer le bon provider

### 4. Services Métier
- [ ] `frontend/lib/services/worker.service.ts` - Service Workers
- [ ] `frontend/lib/services/client.service.ts` - Service Clients
- [ ] `frontend/lib/services/booking.service.ts` - Service Bookings (basique)

### 5. Tests
- [ ] `frontend/lib/providers/__tests__/factory.test.ts`
- [ ] `frontend/lib/services/__tests__/worker.service.test.ts`

---

## 🏗️ Architecture Cible

```
frontend/
├── lib/
│   ├── providers/
│   │   ├── types.ts           # NEW - Interfaces
│   │   ├── factory.ts         # NEW - Factory
│   │   ├── local.provider.ts  # Phase 2
│   │   ├── supabase.provider.ts # Phase 4
│   │   └── api.provider.ts    # Phase 5
│   │
│   └── services/              # NEW
│       ├── worker.service.ts
│       ├── client.service.ts
│       └── booking.service.ts
│
├── context/
│   └── DataModeProvider.tsx   # NEW
│
└── app/
    └── layout.tsx             # MODIFY - Ajouter DataModeProvider
```

---

## 📝 Détails d'Implémentation

### Étape 1.1 : Types & Interfaces

#### Fichier : `frontend/lib/providers/types.ts`

```typescript
import { Worker, Client, Booking } from '@/types';

/**
 * Interface commune pour tous les data providers
 * Chaque provider (localStorage, Supabase, API) doit implémenter cette interface
 */
export interface IDataProvider {
  // Workers CRUD
  getWorkers(): Promise<Worker[]>;
  getWorker(id: number): Promise<Worker | null>;
  createWorker(data: Omit<Worker, 'id'>): Promise<Worker>;
  updateWorker(id: number, data: Partial<Worker>): Promise<Worker>;
  deleteWorker(id: number): Promise<void>;

  // Clients CRUD
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | null>;
  createClient(data: Omit<Client, 'id'>): Promise<Client>;
  updateClient(id: number, data: Partial<Client>): Promise<Client>;
  deleteClient(id: number): Promise<void>;

  // Bookings CRUD (simplifié pour MVP)
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | null>;
  createBooking(data: Omit<Booking, 'id'>): Promise<Booking>;
  
  // Metadata
  readonly isDemo: boolean;
  cleanup?(): Promise<void>;
}

/**
 * Modes de données disponibles
 */
export type DataMode = 'demo-local' | 'demo-supabase' | 'normal';

/**
 * Configuration pour créer un provider
 */
export interface ProviderConfig {
  mode: DataMode;
  apiUrl?: string;        // Pour mode 'normal'
  supabaseUrl?: string;   // Pour mode 'demo-supabase'
  supabaseKey?: string;   // Pour mode 'demo-supabase'
}
```

**Points d'attention** :
- ✅ Respecter TypeScript strict (pas d'`any`)
- ✅ Toutes les méthodes retournent des Promises (async par défaut)
- ✅ Utiliser `Omit` pour exclure l'`id` dans les create
- ✅ `Partial` pour les updates (pas tous les champs obligatoires)

---

### Étape 1.2 : Factory

#### Fichier : `frontend/lib/providers/factory.ts`

```typescript
import { IDataProvider, ProviderConfig, DataMode } from './types';
import { LocalStorageProvider } from './local.provider';
import { SupabaseProvider } from './supabase.provider';
import { ApiProvider } from './api.provider';

/**
 * Factory pour créer le bon provider selon le mode
 */
export class DataProviderFactory {
  static create(config: ProviderConfig): IDataProvider {
    const { mode } = config;

    // Mode local (dev uniquement)
    if (mode === 'demo-local') {
      // Désactiver en production
      if (process.env.NODE_ENV === 'production') {
        throw new Error('demo-local mode is not available in production');
      }
      return new LocalStorageProvider();
    }

    // Mode Supabase (démo cloud)
    if (mode === 'demo-supabase') {
      if (!config.supabaseUrl || !config.supabaseKey) {
        throw new Error('Supabase credentials required for demo-supabase mode');
      }
      return new SupabaseProvider(config.supabaseUrl, config.supabaseKey);
    }

    // Mode normal (Go API)
    if (mode === 'normal') {
      if (!config.apiUrl) {
        throw new Error('API URL required for normal mode');
      }
      return new ApiProvider(config.apiUrl);
    }

    throw new Error(`Unknown data mode: ${mode}`);
  }
}
```

**Points d'attention** :
- ✅ Valider les configs avant de créer les providers
- ✅ Lever des erreurs explicites si config manquante
- ✅ Classes Provider créées en Phase 2, 4, 5 (stub OK pour l'instant)

---

### Étape 1.3 : Context Provider

#### Fichier : `frontend/context/DataModeProvider.tsx`

```typescript
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IDataProvider, DataMode, ProviderConfig } from '@/lib/providers/types';
import { DataProviderFactory } from '@/lib/providers/factory';

interface DataModeContextType {
  mode: DataMode;
  provider: IDataProvider;
  switchMode: (newMode: DataMode) => void;
  isDemo: boolean;
}

const DataModeContext = createContext<DataModeContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
  defaultMode?: DataMode;
}

export function DataModeProvider({ children, defaultMode = 'demo-local' }: Props) {
  // Charger le mode depuis localStorage au montage
  const [mode, setMode] = useState<DataMode>(() => {
    if (typeof window === 'undefined') return defaultMode;
    const saved = localStorage.getItem('dataMode') as DataMode | null;
    return saved || defaultMode;
  });

  // Créer le provider une seule fois au montage
  const [provider] = useState<IDataProvider>(() => {
    const config: ProviderConfig = {
      mode,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    return DataProviderFactory.create(config);
  });

  // Fonction pour changer de mode
  const switchMode = (newMode: DataMode) => {
    localStorage.setItem('dataMode', newMode);
    setMode(newMode);
    // Recharger la page pour recréer le provider (simplifié pour MVP)
    window.location.reload();
  };

  const value = {
    mode,
    provider,
    switchMode,
    isDemo: mode.startsWith('demo'),
  };

  return (
    <DataModeContext.Provider value={value}>
      {children}
    </DataModeContext.Provider>
  );
}

/**
 * Hook pour accéder au mode et provider actifs
 */
export function useDataMode(): DataModeContextType {
  const context = useContext(DataModeContext);
  if (!context) {
    throw new Error('useDataMode must be used within DataModeProvider');
  }
  return context;
}
```

**Points d'attention** :
- ✅ "use client" obligatoire (Next.js 14 App Router)
- ✅ Gestion SSR (vérifier `typeof window`)
- ✅ Reload page lors du switch (simplifié MVP, optimiser en V2)
- ✅ Hook `useDataMode()` pour faciliter l'usage

---

### Étape 1.4 : Services Métier

#### Fichier : `frontend/lib/services/worker.service.ts`

```typescript
import { IDataProvider } from '@/lib/providers/types';
import { Worker } from '@/types';
import { z } from 'zod';

/**
 * Schema de validation Zod pour Workers
 */
const WorkerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  avatar: z.string().url('Invalid avatar URL'),
  status: z.enum(['Active', 'Inactive']),
  sharingKey: z.number().min(0).max(100),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
});

/**
 * Service métier pour la gestion des Workers
 * Encapsule la logique métier et utilise le provider actif
 */
export class WorkerService {
  constructor(private provider: IDataProvider) {}

  async getAll(): Promise<Worker[]> {
    return this.provider.getWorkers();
  }

  async getById(id: number): Promise<Worker | null> {
    return this.provider.getWorker(id);
  }

  async create(data: Omit<Worker, 'id'>): Promise<Worker> {
    // Validation avant création
    WorkerSchema.parse(data);
    return this.provider.createWorker(data);
  }

  async update(id: number, data: Partial<Worker>): Promise<Worker> {
    // Validation partielle
    if (Object.keys(data).length === 0) {
      throw new Error('No data provided for update');
    }
    return this.provider.updateWorker(id, data);
  }

  async delete(id: number): Promise<void> {
    return this.provider.deleteWorker(id);
  }

  /**
   * Logique métier spécifique
   */
  async calculateRevenue(workerId: number, period: 'month' | 'year'): Promise<number> {
    const worker = await this.getById(workerId);
    if (!worker) throw new Error('Worker not found');

    // TODO: Implémenter calcul réel (Phase 2)
    return 0;
  }
}
```

**Points d'attention** :
- ✅ Validation avec Zod
- ✅ Logique métier dans le service (pas dans le provider)
- ✅ Répéter le pattern pour `ClientService` et `BookingService`

---

### Étape 1.5 : Intégration dans App

#### Fichier : `frontend/app/layout.tsx` (MODIFY)

```typescript
import { DataModeProvider } from '@/context/DataModeProvider';
import { AuthProvider } from '@/context/AuthProvider';
import { ThemeProvider } from '@/context/ThemeProvider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <DataModeProvider defaultMode="demo-local">
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </DataModeProvider>
      </body>
    </html>
  );
}
```

---

## ✅ Acceptance Criteria

### Tests à Valider
1. **Factory**
   - ✅ Crée LocalStorageProvider en mode `demo-local`
   - ✅ Lève une erreur si config manquante
   - ✅ Bloque `demo-local` en production

2. **Context**
   - ✅ Mode persiste dans localStorage
   - ✅ Hook `useDataMode()` fonctionne
   - ✅ Erreur si utilisé hors Provider

3. **Services**
   - ✅ Validation Zod fonctionne
   - ✅ Service appelle le provider correctement

---

## 🎯 Checklist de Fin de Phase

- [ ] Tous les fichiers créés et compilent sans erreur
- [ ] TypeScript strict (tsc --noEmit passe)
- [ ] ESLint sans warnings
- [ ] Tests unitaires écrits et passent
- [ ] Documentation inline (JSDoc)
- [ ] Commit avec message conventionnel
- [ ] **Mettre à jour CONTEXT.md** (phase terminée)
- [ ] **Mettre à jour task.md** (cocher Phase 1)

---

## 🔗 Phase Suivante

**Phase 2 : Mode Démo localStorage**
- Lire `PHASE_2.md`
- Implémenter `LocalStorageProvider`
- CRUD Workers complet

---

**Dernière mise à jour** : 2026-01-18
