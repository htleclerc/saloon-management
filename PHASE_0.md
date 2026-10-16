# PHASE 0 - Audit & Mockup Fonctionnel

> **Statut : ✅ TERMINÉE** (mockup fonctionnel livré, puis dépassé par les versions 1.0 → 1.2). Document conservé comme historique ; les cases non cochées ne reflètent pas l'état du code. Voir [CONTEXT.md](CONTEXT.md).
> **Contexte Agent** : Phase préparatoire avant refactoring. À lire avec [CONTEXT.md](CONTEXT.md)

---

## 🎯 Objectif de cette Phase

**Auditer l'UI actuelle et implémenter toutes les actions manquantes** pour que le mockup soit 100% fonctionnel avant de commencer le refactoring vers l'architecture providers.

### Philosophie
- ✅ Tous les boutons doivent faire quelque chose (même si c'est un stub)
- ✅ Toutes les interactions doivent avoir un feedback visuel
- ✅ Préparer les "hooks" (fonctions vides) pour les phases futures
- ✅ Données mock locales pour l'instant (pas d'API)

---

## 📋 Prérequis

### À Lire Avant
1. ✅ [CONTEXT.md](CONTEXT.md)
2. ✅ [AGENT.md](AGENT.md)
3. ✅ Parcourir l'UI existante dans le navigateur

### Projet Actuel
- Frontend Next.js 14 fonctionnel
- Pages existantes : Dashboard, Team, Clients, Income, Settings
- Données mockées dans les pages (hardcodées)

---

## 📦 Livrables de cette Phase

### 1. Audit Complet
- [ ] **Document d'audit** : Liste de tous les boutons/actions
- [ ] Identifier actions manquantes
- [ ] Identifier composants incomplets

### 2. Actions à Implémenter
- [ ] Boutons "Ajouter Worker/Client"
- [ ] Boutons "Editer Worker/Client"
- [ ] Boutons "Supprimer Worker/Client"
- [ ] Filtres et recherches
- [ ] Exports (CSV/PDF) - si non complets
- [ ] Formulaires de création/édition
- [ ] Modales de confirmation

### 3. Stubs pour Phases Futures
- [ ] `frontend/lib/api/stubs.ts` - Fonctions API (à remplir en Phase 5)
- [ ] `frontend/lib/storage/stubs.ts` - Fonctions storage (à remplir Phase 2)
- [ ] Commentaires `// TODO: Phase X` partout où nécessaire

---

## 🏗️ Structure à Créer

```
frontend/
├── lib/
│   ├── api/
│   │   └── stubs.ts           # NEW - Stubs API (Phase 5)
│   ├── storage/
│   │   └── stubs.ts           # NEW - Stubs Storage (Phase 2)
│   └── actions/               # NEW
│       ├── worker.actions.ts  # Actions Workers
│       ├── client.actions.ts  # Actions Clients
│       └── booking.actions.ts # Actions Bookings
│
├── components/
│   ├── modals/                # NEW
│   │   ├── ConfirmModal.tsx
│   │   ├── WorkerFormModal.tsx
│   │   └── ClientFormModal.tsx
│   └── forms/                 # NEW
│       ├── WorkerForm.tsx
│       └── ClientForm.tsx
│
└── docs/
    └── AUDIT_PHASE_0.md       # NEW - Résultat de l'audit
```

---

## 📝 Étape par Étape

### Étape 0.1 : Audit de l'UI Existante

#### Créer : `frontend/docs/AUDIT_PHASE_0.md`

Parcourir toutes les pages et lister :

```markdown
# Audit UI - Phase 0

## Dashboard
- [x] Affichage KPI cards
- [ ] Bouton "Voir plus" sur chaque KPI → **À implémenter**
- [ ] Graphiques interactifs → **Vérifier tooltips**

## Page Team (/team)
- [x] Liste des workers
- [ ] Bouton "+ Ajouter Worker" → **MANQUANT - À créer**
- [ ] Bouton "Éditer" sur chaque card → **MANQUANT**
- [ ] Bouton "Supprimer" → **MANQUANT**
- [x] Recherche → Vérifier si fonctionnelle
- [ ] Filtres (Status: Active/Inactive) → **À vérifier**

## Page Worker Detail (/team/detail/[id])
- [x] Affichage détails worker
- [ ] Bouton "Éditer" → **À implémenter**
- [ ] Bouton "Supprimer" → **À implémenter**
- [x] Onglets (Vue d'ensemble, Planning, Clients, Revenus)
- [ ] Actions dans les onglets → **À vérifier un par un**

## Page Clients (/clients)
- [x] Liste clients
- [ ] Bouton "+ Ajouter Client" → **MANQUANT**
- [ ] Bouton "Éditer" → **MANQUANT**
- [ ] Bouton "Supprimer" → **MANQUANT**

## Page Income (/income)
- [x] Tableau revenus
- [x] Export CSV → Vérifier
- [x] Export PDF → Vérifier
- [ ] Filtres période → **À vérifier**

## Page Settings (/settings)
- [ ] Tous les formulaires → **À auditer**
- [ ] Boutons "Sauvegarder" → **À implémenter**
```

**Action** : Compléter cet audit en testant manuellement l'app.

---

### Étape 0.2 : Créer les Stubs API

#### Fichier : `frontend/lib/api/stubs.ts`

```typescript
/**
 * STUBS API - Phase 0
 * Ces fonctions seront implémentées en Phase 5 (Backend Go)
 * Pour l'instant, elles retournent des données mock ou des promesses vides
 */

import { Worker, Client, Booking } from '@/types';

// ============================================================
// WORKERS
// ============================================================

/**
 * TODO: Phase 5 - Implémenter l'appel API réel
 */
export async function fetchWorkers(): Promise<Worker[]> {
  console.warn('⚠️ fetchWorkers: Using stub (Phase 0)');
  // Retourner les workers actuels du mockup pour l'instant
  return [];
}

/**
 * TODO: Phase 5 - Implémenter l'appel API réel
 */
export async function createWorker(data: Omit<Worker, 'id'>): Promise<Worker> {
  console.warn('⚠️ createWorker: Using stub (Phase 0)');
  // Simuler la création
  return { ...data, id: Date.now() } as Worker;
}

/**
 * TODO: Phase 5 - Implémenter l'appel API réel
 */
export async function updateWorker(id: number, data: Partial<Worker>): Promise<Worker> {
  console.warn('⚠️ updateWorker: Using stub (Phase 0)');
  return { id, ...data } as Worker;
}

/**
 * TODO: Phase 5 - Implémenter l'appel API réel
 */
export async function deleteWorker(id: number): Promise<void> {
  console.warn('⚠️ deleteWorker: Using stub (Phase 0)');
  console.log(`Worker ${id} would be deleted`);
}

// ============================================================
// CLIENTS (même pattern)
// ============================================================

export async function fetchClients(): Promise<Client[]> {
  console.warn('⚠️ fetchClients: Using stub (Phase 0)');
  return [];
}

export async function createClient(data: Omit<Client, 'id'>): Promise<Client> {
  console.warn('⚠️ createClient: Using stub (Phase 0)');
  return { ...data, id: Date.now() } as Client;
}

// ... autres méthodes
```

**Points clés** :
- ✅ Console warnings pour savoir qu'on utilise des stubs
- ✅ TODO commentaires pour les phases futures
- ✅ Signatures correctes (types, params, return)

---

### Étape 0.3 : Créer les Actions Locales

#### Fichier : `frontend/lib/actions/worker.actions.ts`

```typescript
'use client';

/**
 * Actions Workers - Phase 0
 * Gèrent les opérations CRUD avec données locales (state React)
 * TODO: Phase 2 - Migrer vers localStorage
 * TODO: Phase 5 - Migrer vers API
 */

import { Worker } from '@/types';
import { createWorker as createWorkerStub } from '@/lib/api/stubs';

/**
 * Action pour créer un worker (local pour l'instant)
 */
export async function createWorkerAction(
  data: Omit<Worker, 'id'>,
  onSuccess?: (worker: Worker) => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // TODO: Phase 2 - Utiliser localStorage provider
    // TODO: Phase 5 - Utiliser API provider
    const newWorker = await createWorkerStub(data);
    
    if (onSuccess) {
      onSuccess(newWorker);
    }
  } catch (error) {
    console.error('Failed to create worker:', error);
    if (onError) {
      onError(error as Error);
    }
  }
}

/**
 * Action pour supprimer un worker
 */
export async function deleteWorkerAction(
  id: number,
  onSuccess?: () => void,
  onError?: (error: Error) => void
): Promise<void> {
  try {
    // TODO: Phase 2/5 - Utiliser provider approprié
    console.log(`Deleting worker ${id}`);
    
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error('Failed to delete worker:', error);
    if (onError) {
      onError(error as Error);
    }
  }
}

// ... autres actions (update, etc.)
```

---

### Étape 0.4 : Créer les Modales

#### Fichier : `frontend/components/modals/WorkerFormModal.tsx`

```typescript
'use client';

import { useState } from 'react';
import { Worker } from '@/types';
import { createWorkerAction } from '@/lib/actions/worker.actions';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (worker: Worker) => void;
}

export function WorkerFormModal({ isOpen, onClose, onSuccess }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    avatar: '',
    status: 'Active' as const,
    sharingKey: 50,
    color: '#9333EA',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createWorkerAction(
      {
        ...formData,
        totalRevenue: '$0',
        totalSalary: '$0',
        clients: 0,
        rating: 0,
        services: 0,
      },
      (worker) => {
        if (onSuccess) onSuccess(worker);
        onClose();
      },
      (error) => {
        alert(`Erreur: ${error.message}`);
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Ajouter un Worker</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">URL Avatar</label>
            <input
              type="url"
              value={formData.avatar}
              onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Partage (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.sharingKey}
              onChange={(e) => setFormData({ ...formData, sharingKey: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded-md"
              required
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-md"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md"
            >
              Créer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

---

### Étape 0.5 : Intégrer dans une Page Existante

#### Fichier : `frontend/app/team/page.tsx` (MODIFY)

```typescript
'use client';

import { useState } from 'react';
import { Worker } from '@/types';
import { WorkerFormModal } from '@/components/modals/WorkerFormModal';

export default function TeamPage() {
  const [workers, setWorkers] = useState<Worker[]>([/* données mock actuelles */]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleWorkerCreated = (newWorker: Worker) => {
    setWorkers([...workers, newWorker]);
  };

  return (
    <div>
      {/* Header avec bouton Ajouter */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Équipe</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-purple-600 text-white rounded-md"
        >
          + Ajouter Worker
        </button>
      </div>

      {/* Liste workers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workers.map(worker => (
          <div key={worker.id}>
            {/* Card worker existante */}
          </div>
        ))}
      </div>

      {/* Modale */}
      <WorkerFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleWorkerCreated}
      />
    </div>
  );
}
```

---

## ✅ Acceptance Criteria

### Tests Manuels à Valider

1. **Page Team**
   - ✅ Bouton "+ Ajouter Worker" visible et cliquable
   - ✅ Modale s'ouvre correctement
   - ✅ Formulaire valide les données
   - ✅ Worker ajouté apparaît dans la liste (localement)
   - ✅ Console warnings visibles (stubs utilisés)

2. **Toutes les Pages**
   - ✅ Aucun bouton sans action
   - ✅ Tous les formulaires fonctionnent
   - ✅ Feedback visuel sur toutes les actions

3. **Code**
   - ✅ Tous les stubs ont des `// TODO: Phase X`
   - ✅ Console warnings pour les stubs
   - ✅ TypeScript strict OK

---

## 🎯 Checklist de Fin de Phase 0

- [ ] Audit complet documenté (AUDIT_PHASE_0.md)
- [ ] Tous les stubs créés (api/stubs.ts, storage/stubs.ts)
- [ ] Actions locales implémentées (worker, client, booking)
- [ ] Modales créées (Worker, Client, Confirm)
- [ ] Formulaires fonctionnels
- [ ] Au moins 2 pages migrées (Team + Clients)
- [ ] Tests manuels OK
- [ ] Aucun bouton sans action
- [ ] Console warnings visibles
- [ ] Commit Phase 0
- [ ] **Mettre à jour CONTEXT.md**
- [ ] **Mettre à jour task.md**

---

## 🔗 Phase Suivante

**Phase 1 : Frontend Providers**
- Lire `PHASE_1.md`
- Remplacer les stubs par les providers
- Architecture flexible pour 3 modes

---

## 💡 Notes Importantes

### Philosophie des Stubs
- ⚠️ **Ne PAS implémenter la logique complète** : juste simuler
- ✅ **Console warnings obligatoires** : savoir qu'on est en mode stub
- ✅ **TODO comments partout** : indiquer quelle phase implémentera
- ✅ **Signatures correctes** : types, params, return values

### Différence avec Phase 1+
- **Phase 0** : Mockup fonctionnel, données locales (state React)
- **Phase 1** : Architecture providers (abstraction)
- **Phase 2** : localStorage (persistance locale)
- **Phase 5** : API (backend réel)

---

**Dernière mise à jour** : 2026-10-16
