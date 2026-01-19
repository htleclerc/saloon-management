# Vidéo 05 - Dashboard Avancé avec Recharts

## 🎬 Durée: 10 minutes

---

## Script Condensé

### 0:00-2:00 | KPI Cards Dynamiques avec useKpiCardStyle

```tsx
import { useKpiCardStyle } from '@/hooks/useKpiCardStyle';
import { useAuth } from '@/context/AuthProvider';

const { getCardStyle } = useKpiCardStyle();
const { isWorker, canAddIncome, canAddExpenses } = useAuth();

// KPI Cards avec styles dynamiques
<div style={getCardStyle(0)} className="rounded-2xl p-6 text-white shadow-lg">
  <p className="text-sm mb-1">{isWorker ? "My Revenue" : "Total Revenue"}</p>
  <h3 className="text-3xl font-bold">€{isWorker ? "18,356" : "45,890"}</h3>
  <span className="bg-white/20 px-2 py-1 rounded">+12%</span>
</div>
```

### 2:00-4:00 | Quick Actions Conditionnelles

```tsx
<div className="grid grid-cols-3 gap-4">
  {canAddIncome() && (
    <Link href="/income/add">
      <button className="bg-purple-600 text-white py-4 rounded-xl">
        Add Revenue
      </button>
    </Link>
  )}
  {canAddExpenses() && (
    <Link href="/expenses/add">
      <button className="bg-pink-500 text-white py-4 rounded-xl">
        Add Expense
      </button>
    </Link>
  )}
  {hasPermission(['manager', 'admin']) && (
    <Link href="/workers/add">
      <button className="bg-orange-500 text-white py-4 rounded-xl">
        Add Worker
      </button>
    </Link>
  )}
</div>
```

### 4:00-6:00 | Recharts: BarChart

```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={250}>
  <BarChart data={monthlyRevenueData}>
    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
    <YAxis axisLine={false} tickLine={false} />
    <Tooltip cursor={{ fill: '#F3E8FF', opacity: 0.5 }} />
    <Bar dataKey="value" fill="#8B5CF6" radius={[4,4,4,4]} barSize={20} />
  </BarChart>
</ResponsiveContainer>
```

### 6:00-8:00 | Filtrage Données Worker

```tsx
const isWorker = user?.role === 'worker';
const workerName = user?.name;

// Filtrer les sessions pour le worker
const filteredTodaysSessions = isWorker
  ? todaysSessions.filter(s => s.worker === workerName)
  : todaysSessions;

// Filtrer les top performers
const filteredTopPerformers = isWorker
  ? topPerformers.filter(p => p.name === workerName)
  : topPerformers;

// Adapter les graphiques avec données réduites
const workerMonthlyRevenue = isWorker
  ? monthlyRevenueData.map(d => ({ ...d, value: Math.round(d.value * 0.4) }))
  : monthlyRevenueData;
```

### 8:00-10:00 | Top Performers et Sessions Table

```tsx
// Top Performers Grid
<div className="grid grid-cols-4 gap-4">
  {filteredTopPerformers.map((worker, idx) => (
    <Card className={`p-4 ${idx === 0 ? 'bg-purple-50/30' : ''}`}>
      <div className={`w-12 h-12 rounded-full ${worker.bg} flex items-center justify-center`}>
        {worker.avatar}
      </div>
      <p className="font-bold">{worker.name}</p>
      <p className="text-purple-600">€{worker.revenue.toLocaleString()}</p>
      <div className="text-yellow-500">{"★".repeat(Math.round(worker.rating))}</div>
    </Card>
  ))}
</div>

// Today's Sessions Table
<table className="w-full">
  <thead>
    <tr>
      <th>Time</th><th>Client</th><th>Service</th><th>Status</th><th>Price</th>
    </tr>
  </thead>
  <tbody>
    {filteredTodaysSessions.map((session, idx) => (
      <tr key={idx} className="hover:bg-purple-50/40">
        <td>{session.time}</td>
        <td>{session.client}</td>
        <td>{session.type}</td>
        <td>
          <span className={session.statusColor}>{session.status}</span>
        </td>
        <td>{session.price}</td>
      </tr>
    ))}
  </tbody>
</table>
```

---

## Points Clés

- **useKpiCardStyle**: Styles dynamiques selon design type
- **Recharts 3.6**: BarChart, LineChart, PieChart
- **Filtrage par rôle**: Workers voient seulement leurs données
- **Conditional rendering**: canAddIncome(), canAddExpenses()

---

## ➡️ Vidéo Suivante

[Vidéo 06: Responsive & Rôles Avancés](./06-responsive-roles-avances.md)
