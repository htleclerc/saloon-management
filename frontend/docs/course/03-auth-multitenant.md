# Vidéo 03 - Authentification Multi-Tenant

## 🎬 Durée: 10 minutes

---

## 📋 Script Vidéo Détaillé

### ⏱️ 0:00 - 3:00 | AuthProvider avec 6 Rôles (3 min)

**À dire:**
> "Notre app supporte 6 rôles différents avec hiérarchie: super_admin > owner > admin > manager > worker > client."

**Structure AuthProvider:**
```tsx
// context/AuthProvider.tsx
"use client";

export type UserRole = "super_admin" | "owner" | "admin" | "manager" | "worker" | "client";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  tenants?: Tenant[];      // Pour multi-salon
  workerId?: string;       // ID worker pour filtrage
  permissions?: WorkerPermissions;  // Permissions spécifiques workers
  isDemo: boolean;
}

const roleHierarchy: Record<UserRole, number> = {
  super_admin: 6,
  owner: 5,
  admin: 4,
  manager: 3,
  worker: 2,
  client: 1,
};

// Permission check avec hiérarchie
const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
  if (!user) return false;
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const userLevel = roleHierarchy[user.role];
  return roles.some((role) => userLevel >= roleHierarchy[role]);
};
```

**À dire:**
> "La hiérarchie signifie qu'un admin peut faire tout ce qu'un manager peut faire, etc."

---

### ⏱️ 3:00 - 5:00 | Système Multi-Tenant (2 min)

**Interface Tenant:**
```tsx
interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  primaryColor?: string;           // Couleur du logo
  customPrimaryColor?: string;     // Couleur personnalisée
  customSecondaryColor?: string;
  useCustomColorOverride?: boolean; // Priorité custom ou palette
}

// Switcher de tenant
const switchTenant = (tenantId: string) => {
  if (user && user.tenants) {
    const tenant = user.tenants.find(t => t.id === tenantId);
    if (tenant) {
      setUser({ ...user, tenantId });
    }
  }
};

// Update des couleurs custom du tenant
const updateTenantColors = (primaryColor?: string, secondaryColor?: string, useOverride?: boolean) => {
  if (!user || !currentTenant) return;
  
  const updatedTenants = user.tenants.map(t => {
    if (t.id === currentTenant.id) {
      return {
        ...t,
        customPrimaryColor: primaryColor,
        customSecondaryColor: secondaryColor,
        useCustomColorOverride: useOverride ?? false,
      };
    }
    return t;
  });
  
  setUser({ ...user, tenants: updatedTenants });
};
```

---

### ⏱️ 5:00 - 7:00 | Worker Permissions (2 min)

**Permissions granulaires pour workers:**
```tsx
interface WorkerPermissions {
  canAddIncome: boolean;
  canAddExpenses: boolean;
  canAddServices: boolean;
}

// Utility functions
const canAddIncome = (): boolean => {
  if (!user) return false;
  if (hasPermission(['manager', 'admin'])) return true;
  return user.permissions?.canAddIncome ?? false;
};

const canAddExpenses = (): boolean => {
  if (!user) return false;
  if (hasPermission(['manager', 'admin'])) return true;
  return user.permissions?.canAddExpenses ?? false;
};

const getWorkerId = (): string | null => {
  if (!user) return null;
  return user.workerId ?? null;
};
```

**Utilisation dans l'interface:**
```tsx
// Quick Actions conditionnelles
{canAddIncome() && (
  <Link href="/income/add">
    <button>Add Revenue</button>
  </Link>
)}

{canAddExpenses() && (
  <Link href="/expenses/add">
    <button>Add Expense</button>
  </Link>
)}

{hasPermission(['manager', 'admin']) && (
  <Link href="/workers/add">
    <button>Add Worker</button>
  </Link>
)}
```

---

### ⏱️ 7:00 - 10:00 | RequirePermission et Mode Démo (3 min)

**Composant de protection:**
```tsx
export function RequirePermission({ 
  role, 
  children, 
  fallback = null 
}: {
  role: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const { hasPermission } = useAuth();

  if (!hasPermission(role)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
```

**Mode Démo avec expiration:**
```tsx
const demoLogin = (role: UserRole) => {
  const demoUser: User = {
    id: `demo_${Date.now()}`,
    name: `Demo ${role}`,
    email: `demo.${role}@workshop.demo`,
    role,
    tenantId: "tenant_1",
    isDemo: true,
    demoCreatedAt: new Date().toISOString(), // Expire après 72h
    workerId: role === 'worker' ? 'worker_demo_1' : undefined,
    permissions: role === 'worker' ? {
      canAddIncome: true,
      canAddExpenses: false,
      canAddServices: true
    } : undefined
  };
  setUser(demoUser);
};

// Vérification expiration au mount
useEffect(() => {
  if (user?.isDemo && user?.demoCreatedAt) {
    const createdAt = new Date(user.demoCreatedAt);
    const hoursDiff = (new Date().getTime() - createdAt.getTime()) / (1000 * 60 * 60);
    if (hoursDiff > 72) {
      logout(); // Demo expired
    }
  }
}, []);
```

**Utilisation pratique:**
```tsx
// Protéger une page
<RequirePermission role="admin" fallback={<AccessDenied />}>
  <AdvancedDashboard />
</RequirePermission>

// Protéger un bouton
<RequirePermission role={["admin", "manager"]}>
  <button>Delete Worker</button>
</RequirePermission>

// Dans la sidebar
{menuItems.map(item => (
  <RequirePermission key={item.path} role={item.role || "worker"}>
    <Link href={item.path}>{item.name}</Link>
  </RequirePermission>
))}
```

**Conclusion:**
> "On a maintenant un système d'auth complet: 6 rôles hiérarchiques, multi-tenant, permissions granulaires workers, et mode démo. Prochaine vidéo: l'internationalisation!"

---

## 📝 Points Clés à Retenir

| Concept | Description |
|---------|-------------|
| **6 Rôles** | super_admin > owner > admin > manager > worker > client |
| **Multi-Tenant** | Un utilisateur peut gérer plusieurs salons |
| **Worker Permissions** | canAddIncome, canAddExpenses, canAddServices |
| **RequirePermission** | Composant pour protéger UI conditionnellement |
| **Mode Démo** | Auto-expiration après 72 heures |

---

## 🎯 Exercice Pratique

1. Créez un rôle "viewer" avec permissions lecture seule
2. Ajoutez une permission `canViewReports` pour workers
3. Créez une page protégée admin-only

---

## ➡️ Vidéo Suivante

[Vidéo 04: Internationalisation](./04-i18n.md)
