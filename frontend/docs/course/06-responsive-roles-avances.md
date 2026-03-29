# Vidéo 06 - Responsive & Rôles Avancés

## 🎬 Durée: 10 minutes

---

## Script Condensé

### 0:00-2:00 | useResponsive Hook

```tsx
// Déjà dans ThemeProvider
const { isMobile, isTablet, isDesktop } = useResponsive();

// Utilisation
{isMobile && <MobileMenu />}
{!isMobile && <DesktopSidebar />}

<div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-4'} gap-6`}>
  {/* KPI Cards */}
</div>
```

### 2:00-4:00 | Sidebar Responsive

```tsx
function Sidebar() {
  const { isMobile } = useResponsive();
  const { mobileMenuOpen, setMobileMenuOpen } = useTheme();

  if (isMobile) {
    return (
      <>
        {/* Hamburger Button */}
        <button onClick={() => setMobileMenuOpen(true)}>
          <Menu className="w-6 h-6" />
        </button>

        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-black/50 ${mobileMenuOpen ? '' : 'hidden'}`}
          onClick={() => setMobileMenuOpen(false)}
        />

        {/* Sidebar Drawer */}
        <aside className={`fixed left-0 top-0 h-screen w-72 bg-gray-900 transform transition ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          {/* Menu Items */}
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return <aside className="fixed left-0 w-64 h-screen">...</aside>;
}
```

### 4:00-6:00 | Dashboard Filtré par Rôle Complet

```tsx
export default function Dashboard() {
  const { user, isClient, isWorker, hasPermission, canAddIncome, canAddExpenses } = useAuth();

  // Client Dashboard séparé
  if (isClient) {
    return (
      <MainLayout>
        <ClientDashboard />
      </MainLayout>
    );
  }

  // Worker: filtrer toutes les données
  const workerName = user?.name;
  const filteredSessions = isWorker 
    ? sessions.filter(s => s.worker === workerName)
    : sessions;
  
  const filteredPerformers = isWorker
    ? performers.filter(p => p.name === workerName)
    : performers;

  // Masquer certaines sections pour workers
  const showExpensePie = !isWorker;
  const showTopRevenue = hasPermission(['manager', 'admin']);

  return (
    <MainLayout>
      {/* KPI Cards */}
      {/* Charts */}
      {/* Sessions filtrées */}
      {showExpensePie && <ExpensePieChart />}
      {showTopRevenue && <TopRevenueGenerators />}
    </MainLayout>
  );
}
```

### 6:00-8:00 | ClientDashboard Séparé

```tsx
// components/dashboard/ClientDashboard.tsx
export default function ClientDashboard() {
  const { user } = useAuth();
  
  return (
    <div className="space-y-6">
      <h1>Welcome, {user?.name}!</h1>
      
      {/* Client-specific views */}
      <div className="grid grid-cols-3 gap-6">
        <Card>
          <h3>My Appointments</h3>
          <p>3 upcoming</p>
        </Card>
        <Card>
          <h3>My Invoices</h3>
          <p>€245 this month</p>
        </Card>
        <Card>
          <h3>Loyalty Points</h3>
          <p>450 points</p>
        </Card>
      </div>

      <UpcomingAppointments />
      <InvoiceHistory />
    </div>
  );
}
```

### 8:00-10:00 | Récap et Démo Complète

**Features implémentées:**
✅ 8 palettes de couleurs
✅ 4 types de design (minimal, modern, gradient, glassmorphism)
✅ useKpiCardStyle hook
✅ 6 rôles hiérarchiques
✅ Multi-tenant support
✅ Worker permissions granulaires
✅ Dashboard filtré par rôle
✅ ClientDashboard séparé
✅ Responsive complet
✅ Recharts charts
✅ i18n (3 langues)

**Prochaines étapes:**
- Backend API integration
- Real-time notifications (WebSockets)
- Advanced analytics
- Mobile app with React Native

---

## Points Clés

- **useResponsive**: isMobile, isTablet, isDesktop
- **Mobile Sidebar**: Drawer avec overlay
- **Role-based UI**: Filtrage complet par rôle
- **ClientDashboard**: Vue spécifique pour clients
- **Conditional Rendering**: showExpensePie, canAddIncome, etc.

---

## 🎉 Fin du Cours!

Vous avez maintenant une application complète professionnelle avec toutes les fonctionnalités avancées!

[Retour au README](./README.md)
