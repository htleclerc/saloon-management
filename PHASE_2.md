# PHASE 2 - Mode Démo localStorage

> **Contexte Agent** : À lire avec [CONTEXT.md](file:///c:/Users/lecle/Workspace/saloon-management/CONTEXT.md) et [PHASE_1.md](file:///c:/Users/lecle/Workspace/saloon-management/PHASE_1.md) avant de démarrer

---

## 🎯 Objectif de cette Phase

Implémenter le provider localStorage et rendre fonctionnel le mode démo local (dev uniquement) avec CRUD complet Workers, Clients, Bookings.

---

## 📋 Prérequis

### Phase Précédente TERMINÉE
- ✅ Phase 1 : Architecture providers (types, factory, context, services)

### À Vérifier
- [ ] `DataModeProvider` fonctionne
- [ ] Services (WorkerService, ClientService) existent
- [ ] Tests Phase 1 passent

---

## 📦 Livrables de cette Phase

### 1. LocalStorage Provider
- [ ] `frontend/lib/providers/local.provider.ts` - Implémentation complète

### 2. Mock Data
- [ ] `frontend/lib/mock/data.ts` - Données de démo centralisées

### 3. UI Mode Switcher
- [ ] `frontend/components/ModeSwitcher.tsx` - Composant pour changer de mode

### 4. Intégration
- [ ] Migrer pages existantes vers les services
- [ ] Tester CRUD complet en mode local

---

## 🏗️ Fichiers à Créer/Modifier

```
frontend/
├── lib/
│   ├── providers/
│   │   └── local.provider.ts      # NEW
│   └── mock/
│       └── data.ts                # NEW
│
└── components/
    └── ModeSwitcher.tsx           # NEW
```

---

## 📝 Détails d'Implémentation

### Étape 2.1 : Mock Data

#### Fichier : `frontend/lib/mock/data.ts`

```typescript
import { Worker, Client, Booking } from '@/types';

export const MOCK_WORKERS: Worker[] = [
  {
    id: 1,
    name: 'Sophie Martin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie',
    status: 'Active',
    sharingKey: 60,
    totalRevenue: '$45,230',
    totalSalary: '$27,138',
    clients: 87,
    rating: 4.8,
    services: 245,
    color: '#9333EA',
  },
  {
    id: 2,
    name: 'Marie Dubois',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marie',
    status: 'Active',
    sharingKey: 55,
    totalRevenue: '$38,920',
    totalSalary: '$21,406',
    clients: 72,
    rating: 4.6,
    services: 198,
    color: '#EC4899',
  },
  // Ajouter 3-5 workers de plus
];

export const MOCK_CLIENTS: Client[] = [
  {
    id: 1,
    name: 'Emma Johnson',
    email: 'emma.j@example.com',
    phone: '+33 6 12 34 56 78',
  },
  {
    id: 2,
    name: 'Lucas Bernard',
    email: 'lucas.b@example.com',
    phone: '+33 6 23 45 67 89',
  },
  // Ajouter 5-10 clients
];

export const MOCK_BOOKINGS: Booking[] = [
  // À définir selon le type Booking existant
];
```

---

### Étape 2.2 : LocalStorage Provider

#### Fichier : `frontend/lib/providers/local.provider.ts`

```typescript
import { IDataProvider } from './types';
import { Worker, Client, Booking } from '@/types';
import { MOCK_WORKERS, MOCK_CLIENTS, MOCK_BOOKINGS } from '@/lib/mock/data';

interface LocalStorageData {
  workers: Worker[];
  clients: Client[];
  bookings: Booking[];
}

/**
 * Provider utilisant localStorage (mode démo dev uniquement)
 */
export class LocalStorageProvider implements IDataProvider {
  readonly isDemo = true;
  private readonly STORAGE_KEY = 'saloon-demo-data';

  constructor() {
    this.initializeStorage();
  }

  /**
   * Initialise localStorage avec des données de démo si vide
   */
  private initializeStorage(): void {
    const existing = localStorage.getItem(this.STORAGE_KEY);
    if (!existing) {
      const initialData: LocalStorageData = {
        workers: MOCK_WORKERS,
        clients: MOCK_CLIENTS,
        bookings: MOCK_BOOKINGS,
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
    }
  }

  private getData(): LocalStorageData {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : { workers: [], clients: [], bookings: [] };
  }

  private saveData(data: LocalStorageData): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
  }

  // ============================================================
  // WORKERS
  // ============================================================

  async getWorkers(): Promise<Worker[]> {
    const data = this.getData();
    return data.workers || [];
  }

  async getworker(id: number): Promise<Worker | null> {
    const workers = await this.getWorkers();
    return workers.find(w => w.id === id) || null;
  }

  async createWorker(worker: Omit<Worker, 'id'>): Promise<Worker> {
    const data = this.getData();
    const newWorker: Worker = {
      ...worker,
      id: Date.now(), // Simple ID generation (OK pour localStorage)
    };
    data.workers.push(newWorker);
    this.saveData(data);
    return newWorker;
  }

  async updateWorker(id: number, updates: Partial<Worker>): Promise<Worker> {
    const data = this.getData();
    const index = data.workers.findIndex(w => w.id === id);
    
    if (index === -1) {
      throw new Error(`Worker with id ${id} not found`);
    }

    data.workers[index] = { ...data.workers[index], ...updates };
    this.saveData(data);
    return data.workers[index];
  }

  async deleteWorker(id: number): Promise<void> {
    const data = this.getData();
    data.workers = data.workers.filter(w => w.id !== id);
    this.saveData(data);
  }

  // ============================================================
  // CLIENTS (même pattern)
  // ============================================================

  async getClients(): Promise<Client[]> {
    const data = this.getData();
    return data.clients || [];
  }

  async getClient(id: number): Promise<Client | null> {
    const clients = await this.getClients();
    return clients.find(c => c.id === id) || null;
  }

  async createClient(client: Omit<Client, 'id'>): Promise<Client> {
    const data = this.getData();
    const newClient: Client = { ...client, id: Date.now() };
    data.clients.push(newClient);
    this.saveData(data);
    return newClient;
  }

  async updateClient(id: number, updates: Partial<Client>): Promise<Client> {
    const data = this.getData();
    const index = data.clients.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error(`Client with id ${id} not found`);
    }

    data.clients[index] = { ...data.clients[index], ...updates };
    this.saveData(data);
    return data.clients[index];
  }

  async deleteClient(id: number): Promise<void> {
    const data = this.getData();
    data.clients = data.clients.filter(c => c.id !== id);
    this.saveData(data);
  }

  // ============================================================
  // BOOKINGS (basique pour MVP)
  // ============================================================

  async getBookings(): Promise<Booking[]> {
    const data = this.getData();
    return data.bookings || [];
  }

  async getBooking(id: number): Promise<Booking | null> {
    const bookings = await this.getBookings();
    return bookings.find(b => b.id === id) || null;
  }

  async createBooking(booking: Omit<Booking, 'id'>): Promise<Booking> {
    const data = this.getData();
    const newBooking: Booking = { ...booking, id: Date.now() } as Booking;
    data.bookings.push(newBooking);
    this.saveData(data);
    return newBooking;
  }

  /**
   * Nettoie toutes les données et réinitialise
   */
  async cleanup(): Promise<void> {
    localStorage.removeItem(this.STORAGE_KEY);
    this.initializeStorage();
  }
}
```

**Points d'attention** :
- ✅ ID généré avec `Date.now()` (suffisant pour localStorage)
- ✅ Gestion d'erreurs explicite (worker/client not found)
- ✅ Méthode `cleanup()` pour réinitialiser

---

### Étape 2.3 : UI Mode Switcher

#### Fichier : `frontend/components/ModeSwitcher.tsx`

```typescript
'use client';

import { useDataMode } from '@/context/DataModeProvider';

export function ModeSwitcher() {
  const { mode, switchMode, isDemo } = useDataMode();

  return (
    <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <span className="text-sm font-medium">Mode:</span>
      
      <select
        value={mode}
        onChange={(e) => switchMode(e.target.value as any)}
        className="px-3 py-2 border rounded-md bg-white dark:bg-gray-700"
      >
        {process.env.NODE_ENV !== 'production' && (
          <option value="demo-local">Démo Local (Dev)</option>
        )}
        <option value="demo-supabase">Démo Cloud</option>
        <option value="normal">Mode Normal</option>
      </select>

      {isDemo && (
        <span className="text-xs text-amber-600 dark:text-amber-400">
          🧪 Mode Démo Actif
        </span>
      )}
    </div>
  );
}
```

---

### Étape 2.4 : Migrer une Page Existante (Exemple)

#### Fichier : `frontend/app/team/page.tsx` (MODIFY)

Avant :
```typescript
const workers = [/* données hardcodées */];
```

Après :
```typescript
'use client';

import { useEffect, useState } from 'react';
import { useDataMode } from '@/context/DataModeProvider';
import { WorkerService } from '@/lib/services/worker.service';

export default function TeamPage() {
  const { provider } = useDataMode();
  const [workers, setWorkers] = useState([]);

  useEffect(() => {
    const service = new WorkerService(provider);
    service.getAll().then(setWorkers);
  }, [provider]);

  // Reste du composant...
}
```

---

## ✅ Acceptance Criteria

### Tests à Valider

1. **LocalStorage Provider**
   - ✅ Données initialisées au premier chargement
   - ✅ CRUD workers fonctionne
   - ✅ CRUD clients fonctionne
   - ✅ Données persistent après refresh
   - ✅ cleanup() réinitialise correctement

2. **Mode Switcher**
   - ✅ Affiche seulement `demo-local` en dev
   - ✅ Change le mode dans localStorage
   - ✅ Reload la page après switch

3. **Intégration**
   - ✅ Au moins 1 page migrée vers les services
   - ✅ CRUD complet workers testé manuellement

---

## 🎯 Checklist de Fin de Phase

- [ ] LocalStorageProvider implémenté
- [ ] Mock data créées
- [ ] ModeSwitcher fonctionnel
- [ ] Au moins 1 page (team) migrée
- [ ] Tests manuels CRUD OK
- [ ] TypeScript strict OK
- [ ] Commit Phase 2
- [ ] **Mettre à jour CONTEXT.md**
- [ ] **Mettre à jour task.md**

---

## 🔗 Phase Suivante

**Phase 3 : Infrastructure Locale (Docker)**
- Lire `PHASE_3.md`
- Setup postgres, redis, keycloak avec docker-compose

---

**Dernière mise à jour** : 2026-01-18
