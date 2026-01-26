# Guide d'Utilisation - Services Métier

## 📚 Vue d'Ensemble

Les **services métier** sont une couche d'abstraction qui simplifie l'interaction avec les providers de données. Ils encapsulent la logique business et offrent une API simple et cohérente.

---

## 🏗️ Architecture

```
Components (pages/app)
         ↓
   React Hooks (useWorkers, useClients, etc.)
         ↓
Business Services (WorkerService, ClientService, etc.)
         ↓
   Data Providers (LocalStorage, Supabase, API)
         ↓
      Data Storage
```

---

## 🎯 Services Disponibles

### 1. **WorkerService**

```typescript
import { workerService } from '@/lib/services';

// CRUD Operations
const workers = await workerService.getAll();
const worker = await workerService.getById(1);
const newWorker = await workerService.create({ name: 'John', ... });
await workerService.update(1, { name: 'Jane' });
await workerService.delete(1);

// Business Logic
const activeWorkers = await workerService.getActive();
const searchResults = await workerService.search('john');
const topPerformers = await workerService.getTopPerformers(5);
```

### 2. **ClientService**

```typescript
import { clientService } from '@/lib/services';

// CRUD Operations
const clients = await clientService.getAll();
const newClient = await clientService.create({
  name: 'Sophie',
  email: 'sophie@example.com',
  phone: '1234567890'
});

// Business Logic (avec validation automatique)
const searchResults = await clientService.search('sophie');
const companyClients = await clientService.getByEmailDomain('company.com');
```

### 3. **BookingService**

```typescript
import { bookingService } from '@/lib/services';

// CRUD Operations
const bookings = await bookingService.getAll();
const newBooking = await bookingService.create({
  date: '2026-01-25',
  time: '14:00',
  serviceIds: [1, 2],
  workerIds: [3],
  // ... autres champs
});

// Business Logic
const upcoming = await bookingService.getUpcoming(10);
const todayBookings = await bookingService.getByDate('2026-01-22');
const workerBookings = await bookingService.getByWorker(3);

// Avec détection de conflit automatique
const hasConflict = await bookingService.checkConflict(
  '2026-01-22',
  '14:00',
  [3]
);

// Mise à jour avec historique
await bookingService.updateStatus(1, 'Confirmed', 'Confirmed by phone');
await bookingService.addComment(1, 'Client requested late arrival');
```

---

## ⚛️ Utilisation dans React (Hooks)

### Exemple 1 : Liste de Workers

```typescript
import { useWorkers } from '@/hooks/useServices';

export default function WorkersPage() {
  const { workers, loading, error, createWorker, deleteWorker } = useWorkers();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {workers.map(worker => (
        <div key={worker.id}>
          <h3>{worker.name}</h3>
          <button onClick={() => deleteWorker(worker.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Exemple 2 : Créer un Client

```typescript
import { useClients } from '@/hooks/useServices';

export default function AddClientForm() {
  const { createClient, loading, error } = useClients();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    try {
      await createClient({
        name: 'New Client',
        email: 'client@example.com',
        phone: '1234567890'
      });
      // Success!
    } catch (err) {
      // Error handled automatically in hook
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="error">{error}</div>}
      {/* Form fields */}
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Client'}
      </button>
    </form>
  );
}
```

---

## ✨ Avantages

### 1. **Validation Automatique**
```typescript
// ClientService valide automatiquement l'email
await clientService.create({
  name: 'Test',
  email: 'invalid-email', // ❌ Erreur: "Valid email is required"
  phone: '123'
});

// WorkerService valide le sharing key
await workerService.create({
  name: 'Test',
  sharingKey: 150 // ❌ Erreur: "Sharing key must be between 0 and 100"
});
```

### 2. **Détection de Doublons**
```typescript
// ClientService vérifie les emails dupliqués
await clientService.create({
  name: 'Client 1',
  email: 'test@example.com',
  phone: '123'
}); // ✅

await clientService.create({
  name: 'Client 2',
  email: 'test@example.com', // ❌ Erreur: "Client with email ... already exists"
  phone: '456'
});
```

### 3. **Logique Métier Centralisée**
```typescript
// BookingService détecte automatiquement les conflits
const booking = await bookingService.create({
  date: '2026-01-22',
  time: '14:00',
  workerIds: [1], // Worker déjà booké à 14h
  // ...
});
// ✅ Créé mais marqué comme isSensitive: true
```

### 4. **Gestion d'Erreurs Simplifiée**
```typescript
const { workers, error } = useWorkers();

// Pas besoin de try/catch, l'erreur est dans le hook
if (error) {
  return <div>Error: {error}</div>;
}
```

---

## 🔄 Mode-Agnostic

Les services fonctionnent avec **tous les modes de données** :

```typescript
// Le service utilise automatiquement le bon provider
// selon le mode actuel (demo-local, demo-supabase, normal)

const workers = await workerService.getAll();
// ↓
// Mode demo-local → LocalStorageProvider
// Mode demo-supabase → SupabaseProvider (Phase 2)
// Mode normal → APIProvider (Phase 4)
```

---

## 📝 Bonnes Pratiques

### ✅ À FAIRE
```typescript
// Utiliser les hooks dans les composants React
const { workers, createWorker } = useWorkers();

// Utiliser les services dans les fonctions utilitaires
import { workerService } from '@/lib/services';
const topWorkers = await workerService.getTopPerformers();
```

### ❌ À ÉVITER
```typescript
// Ne pas accéder directement aux providers
import { DataProviderFactory } from '@/lib/providers/types';
const provider = DataProviderFactory.create('demo-local'); // ❌

// Utiliser les services à la place
import { workerService } from '@/lib/services'; // ✅
```

---

## 🎓 Exemple Complet

```typescript
// pages/workers/add.tsx
'use client';

import { useState } from 'react';
import { useWorkers } from '@/hooks/useServices';
import { useRouter } from 'next/navigation';

export default function AddWorkerPage() {
  const router = useRouter();
  const { createWorker, loading, error } = useWorkers();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    sharingKey: 50,
    status: 'Active' as const,
    avatar: '',
    color: '#8B5CF6'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createWorker(formData);
      router.push('/workers');
    } catch (err) {
      // Error déjà capturé par le hook
      console.error('Failed to create worker:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && (
        <div className="error-banner">{error}</div>
      )}
      
      <input
        type="text"
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        placeholder="Worker name"
        required
      />
      
      <input
        type="email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        placeholder="Email"
      />
      
      <input
        type="number"
        value={formData.sharingKey}
        onChange={(e) => setFormData({ ...formData, sharingKey: Number(e.target.value) })}
        min="0"
        max="100"
        required
      />
      
      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Worker'}
      </button>
    </form>
  );
}
```

---

## 🚀 Prochaines Étapes

1. Migrer les composants existants pour utiliser les nouveaux services
2. Ajouter plus de logique métier aux services (calculs, validations)
3. Implémenter cache côté service pour améliorer performance
4. Ajouter support offline avec synchronisation
