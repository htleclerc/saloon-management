# Vidéo 06 - Responsive & Rôles

## 🎬 Durée: 10 minutes

---

## 📋 Script Vidéo Détaillé

### ⏱️ 0:00 - 2:00 | Breakpoints et useResponsive (2 min)

**À dire:**
> "Pour que notre app fonctionne sur tous les écrans, on va créer un hook qui détecte la taille de l'écran."

**Les breakpoints Tailwind:**
```
sm  = 640px   → Téléphones larges
md  = 768px   → Tablettes portrait
lg  = 1024px  → Tablettes paysage / petits laptops
xl  = 1280px  → Desktops
2xl = 1536px  → Grands écrans
```

**Créer le hook useResponsive:**
```tsx
// context/ThemeProvider.tsx (ajouter ce hook)

export function useResponsive() {
  const [dimensions, setDimensions] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
  });

  useEffect(() => {
    const checkSize = () => {
      const width = window.innerWidth;
      setDimensions({
        isMobile: width < 640,      // < sm
        isTablet: width >= 640 && width < 1024,  // sm → lg
        isDesktop: width >= 1024,   // lg+
      });
    };

    // Vérifier au montage
    checkSize();

    // Écouter les changements
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  return dimensions;
}
```

**Utilisation:**
```tsx
function MyComponent() {
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div>
      {isMobile && <MobileView />}
      {isTablet && <TabletView />}
      {isDesktop && <DesktopView />}
    </div>
  );
}
```

---

### ⏱️ 2:00 - 5:00 | Sidebar Mobile (3 min)

**À dire:**
> "Sur mobile, on cache la sidebar et on la remplace par un menu hamburger."

**Modifier le Sidebar:**
```tsx
// components/layout/Sidebar.tsx
"use client";
import { useResponsive } from "@/context/ThemeProvider";
import { useState } from "react";
import { Menu, X, Home, Users, DollarSign, Settings } from "lucide-react";
import Link from "next/link";

export default function Sidebar() {
  const { isMobile, isTablet } = useResponsive();
  const [mobileOpen, setMobileOpen] = useState(false);

  const menuItems = [
    { name: "Dashboard", path: "/", icon: Home },
    { name: "Workers", path: "/workers", icon: Users },
    { name: "Revenues", path: "/revenus", icon: DollarSign },
    { name: "Settings", path: "/settings", icon: Settings },
  ];

  // Version mobile: menu hamburger
  if (isMobile) {
    return (
      <>
        {/* Bouton hamburger fixe */}
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Overlay sombre */}
        <div
          className={`fixed inset-0 bg-black/50 z-40 transition-opacity ${
            mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setMobileOpen(false)}
        />

        {/* Sidebar qui glisse */}
        <aside
          className={`fixed left-0 top-0 h-screen w-72 bg-gray-900 z-50 transform transition-transform ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {/* Bouton fermer */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 text-white"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Menu items */}
          <nav className="mt-16 px-4">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 rounded-lg"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </aside>
      </>
    );
  }

  // Version desktop/tablet: sidebar fixe
  const sidebarWidth = isTablet ? "w-[72px]" : "w-64";

  return (
    <aside className={`fixed left-0 top-0 h-screen ${sidebarWidth} bg-gray-900`}>
      <nav className="mt-16 px-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="flex items-center gap-3 px-4 py-3 text-white hover:bg-gray-800 rounded-lg"
          >
            <item.icon className="w-5 h-5" />
            {!isTablet && <span>{item.name}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
```

**À montrer:**
- Redimensionner le navigateur
- Sur mobile: hamburger → clic → sidebar glisse
- Sur tablet: sidebar compacte (icônes seulement)
- Sur desktop: sidebar complète

---

### ⏱️ 5:00 - 8:00 | Système de Rôles (3 min)

**À dire:**
> "Maintenant, on protège certaines pages. Seuls les admins peuvent voir le dashboard avancé."

**Créer le AuthProvider:**
```tsx
// context/AuthProvider.tsx
"use client";
import { createContext, useContext, useState, ReactNode } from "react";

// Types
type UserRole = "admin" | "manager" | "worker";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  hasPermission: (requiredRole: UserRole | UserRole[]) => boolean;
  isAdmin: boolean;
}

// Hiérarchie des rôles
const roleHierarchy: Record<UserRole, number> = {
  admin: 3,
  manager: 2,
  worker: 1,
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utilisateur par défaut (pour la démo)
const defaultUser: User = {
  id: "1",
  name: "Admin User",
  email: "admin@workshop.com",
  role: "admin",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(defaultUser);

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!user) return false;

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const userLevel = roleHierarchy[user.role];

    return roles.some((role) => userLevel >= roleHierarchy[role]);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        hasPermission,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
```

**Créer le composant RequirePermission:**
```tsx
// context/AuthProvider.tsx (ajouter)
interface RequirePermissionProps {
  role: UserRole | UserRole[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function RequirePermission({ 
  role, 
  children, 
  fallback = null 
}: RequirePermissionProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(role)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

**Utilisation pour protéger une page:**
```tsx
// app/dashboard/advanced/page.tsx
import { RequirePermission } from "@/context/AuthProvider";

export default function AdvancedDashboard() {
  return (
    <RequirePermission
      role="admin"
      fallback={
        <div className="p-8 text-center">
          <h1 className="text-2xl font-bold text-red-500">Accès Refusé</h1>
          <p className="mt-2 text-gray-600">
            Vous devez être administrateur pour accéder à cette page.
          </p>
        </div>
      }
    >
      <MainLayout>
        {/* Contenu du dashboard admin */}
      </MainLayout>
    </RequirePermission>
  );
}
```

**Protéger un élément de navigation:**
```tsx
// Dans Sidebar.tsx
<RequirePermission role="admin">
  <Link href="/dashboard/advanced">
    Dashboard Avancé
  </Link>
</RequirePermission>
```

---

### ⏱️ 8:00 - 10:00 | Conclusion et Prochaines Étapes (2 min)

**À dire:**
> "Félicitations! Vous avez maintenant une application complète avec thèmes, langues, dashboard, responsive et permissions!"

**Récapitulatif du cours:**
```
┌─────────────────────────────────────────────────────────────┐
│  CE QUE VOUS AVEZ APPRIS                                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ Méthodologie des 5 étapes                              │
│     Analyser → Structurer → Styliser → Interagir → Optimiser│
│                                                             │
│  ✅ Architecture Next.js                                   │
│     App Router, providers, layout                          │
│                                                             │
│  ✅ Système de thèmes                                      │
│     Context API, CSS variables, dark mode                  │
│                                                             │
│  ✅ Internationalisation                                   │
│     Multi-langue avec fichiers JSON                        │
│                                                             │
│  ✅ Dashboard avancé                                       │
│     Stat cards, graphiques CSS, tableaux                   │
│                                                             │
│  ✅ Responsive et rôles                                    │
│     Mobile-first, permissions hiérarchiques                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Prochaines étapes suggérées:**
```
🚀 POUR ALLER PLUS LOIN

1. Base de données
   → Connecter à PostgreSQL ou MongoDB
   → Utiliser Prisma comme ORM

2. Authentification réelle
   → NextAuth.js pour le login
   → JWT pour les tokens

3. Graphiques avancés
   → Chart.js ou Recharts
   → Animations complexes

4. Déploiement
   → Vercel pour le frontend
   → Railway ou Render pour le backend
```

**Conclusion finale:**
> "Merci d'avoir suivi ce cours! N'hésitez pas à expérimenter, casser des choses, et apprendre de vos erreurs. C'est comme ça qu'on devient un bon développeur. À bientôt!"

---

## 📝 Points Clés à Retenir

| Concept | Description |
|---------|-------------|
| **useResponsive** | Détecte mobile/tablet/desktop |
| **Sidebar mobile** | Hamburger + overlay + slide |
| **Hiérarchie des rôles** | admin > manager > worker |
| **RequirePermission** | Composant pour protéger le contenu |

---

## 🎯 Exercice Final

1. Changez le rôle de l'utilisateur en "worker" et testez l'accès aux pages
2. Ajoutez un rôle "viewer" avec moins de permissions que worker
3. Créez une page "Admin Only" accessible uniquement aux admins

---

## 🎉 Fin du Cours!

Vous êtes maintenant équipé pour construire des applications frontend professionnelles avec Next.js!

**Ressources complémentaires:**
- [Documentation Next.js](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [React DevTools](https://react.dev/learn/react-developer-tools)

---

*Retour au [README](./README.md)*
