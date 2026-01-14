# Vidéo 05 - Dashboard Avancé

## 🎬 Durée: 10 minutes

---

## 📋 Script Vidéo Détaillé

### ⏱️ 0:00 - 2:00 | Layout du Dashboard (2 min)

**À dire:**
> "On va construire un dashboard complet avec des stats, graphiques et tableaux. Voici la structure qu'on va créer."

**Structure visuelle (basée sur l'implémentation réelle):**
```
┌─────────────────────────────────────────────────────────────┐
│  Stats: Revenue │ Expenses │ Net Profit │ Clients          │
│  (Gradient Cards avec icônes et % de changement)            │
├─────────────────────────────────────────────────────────────┤
│  Quick Actions: [+ Revenue] [+ Expense] [+ Worker]          │
├────────────────────────────┬────────────────────────────────┤
│  📊 Monthly Revenue Chart  │  📊 Monthly Expenses Chart     │
├────────────────────────────┴────────────────────────────────┤
│  📈 Profit Analysis (Revenue vs Expenses vs Profit)         │
├─────────────────────────────────────────────────────────────┤
│  👥 Top Performing Team (4 cartes avec avatars)             │
├────────────────────────────┬────────────────────────────────┤
│  📋 Today's Services       │  🥧 Cost Distribution (Pie)    │
├────────────────────────────┴────────────────────────────────┤
│  📊 Weekly Attendance │ 🔔 Recent Activities                │
└─────────────────────────────────────────────────────────────┘
```

**Code de base:**
```tsx
// app/page.tsx
"use client";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import { useTranslation } from "@/i18n";
import { DollarSign, Wallet, TrendingUp, Users, Plus } from "lucide-react";

export default function Dashboard() {
  const { t } = useTranslation();

  return (
    <MainLayout>
      <div className="space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm md:text-base mt-1">
              Welcome back! Here's what's happening today.
            </p>
          </div>
        </div>

        {/* Stats Gradient Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Cards ici */}
        </div>

        {/* Quick Actions */}
        <section>{/* Boutons d'action */}</section>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar charts avec Recharts */}
        </div>

        {/* Top Performers */}
        <section>{/* Cartes performers */}</section>

        {/* Sessions Table + Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Table et Pie */}
        </div>
      </div>
    </MainLayout>
  );
}
```

---

### ⏱️ 2:00 - 5:00 | Cartes de Statistiques Gradient (3 min)

**À dire:**
> "Les cartes de stats utilisent des gradients avec `bg-gradient-to-r` pour un effet moderne. Chaque carte a une couleur distincte."

**Implémentation réelle des Stat Cards:**
```tsx
{/* Revenue Card */}
<div className="bg-gradient-to-r from-purple-600 to-purple-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-transform hover:scale-[1.01]">
  <div className="flex justify-between items-start">
    <div>
      <p className="text-purple-100 text-sm font-medium mb-1">Total Revenue</p>
      <h3 className="text-2xl sm:text-3xl font-bold">€45,890</h3>
      <p className="text-xs text-purple-100 mt-2 flex items-center gap-1">
        <span className="bg-white/20 px-1.5 py-0.5 rounded text-white font-semibold">+12%</span> 
        vs last month
      </p>
    </div>
    <div className="bg-white/20 p-3 rounded-full">
      <DollarSign className="w-6 h-6 text-white" />
    </div>
  </div>
</div>

{/* Expenses Card - Pink gradient */}
<div className="bg-gradient-to-r from-pink-600 to-pink-500 rounded-2xl p-6 text-white shadow-lg ...">
  {/* Structure identique avec Wallet icon */}
</div>

{/* Net Profit Card - Orange gradient */}
<div className="bg-gradient-to-r from-orange-500 to-orange-400 rounded-2xl p-6 text-white shadow-lg ...">
  {/* Structure identique avec TrendingUp icon */}
</div>

{/* Clients Card - Teal gradient */}
<div className="bg-gradient-to-r from-teal-500 to-teal-400 rounded-2xl p-6 text-white shadow-lg ...">
  {/* Structure identique avec Users icon */}
</div>
```

**Les 4 variantes de couleurs utilisées:**
```tsx
const gradients = {
  revenue: "from-purple-600 to-purple-500",  // Purple
  expenses: "from-pink-600 to-pink-500",     // Pink
  profit: "from-orange-500 to-orange-400",   // Orange
  clients: "from-teal-500 to-teal-400",      // Teal
};
```

**Quick Actions (boutons colorés):**
```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
  <Link href="/revenus/add">
    <button className="w-full flex items-center justify-center gap-3 bg-purple-600 hover:bg-purple-700 text-white py-4 rounded-xl font-medium transition-all shadow-md hover:shadow-lg">
      <Plus className="w-5 h-5" />
      <span>Add Revenue</span>
    </button>
  </Link>
  {/* Expense button - bg-pink-500 */}
  {/* Worker button - bg-orange-500 */}
</div>
```

---

### ⏱️ 5:00 - 8:00 | Graphiques avec Recharts (3 min)

**À dire:**
> "On utilise Recharts pour des graphiques professionnels. Voici comment créer des bar charts élégants."

**Installation:**
```bash
npm install recharts
```

**Import des composants Recharts:**
```tsx
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
```

**Monthly Revenue Chart:**
```tsx
const monthlyRevenueData = [
  { name: "Jan", value: 45 }, { name: "Feb", value: 52 }, { name: "Mar", value: 49 },
  { name: "Apr", value: 63 }, { name: "May", value: 58 }, { name: "Jun", value: 72 },
  // ...
];

<Card className="p-6 border-t-4 border-purple-500 bg-purple-50/10">
  <div className="flex justify-between items-center mb-6">
    <div>
      <h3 className="font-bold text-gray-900">Monthly Revenue</h3>
      <p className="text-xs text-gray-500">Year 2026</p>
    </div>
    <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-1 rounded">
      Yearly
    </span>
  </div>
  <ResponsiveContainer width="100%" height={250}>
    <BarChart data={monthlyRevenueData}>
      <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
      <XAxis dataKey="name" axisLine={false} tickLine={false} 
             tick={{ fontSize: 12, fill: '#9CA3AF' }} />
      <YAxis axisLine={false} tickLine={false} 
             tick={{ fontSize: 12, fill: '#9CA3AF' }} />
      <Tooltip 
        cursor={{ fill: '#F3E8FF', opacity: 0.5 }} 
        contentStyle={{ borderRadius: '12px', border: 'none', 
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} 
      />
      <Bar dataKey="value" fill="#8B5CF6" radius={[4, 4, 4, 4]} barSize={20} />
    </BarChart>
  </ResponsiveContainer>
</Card>
```

**Profit Analysis (Line Chart):**
```tsx
const profitData = [
  { name: "Jan", revenue: 40, expenses: 25, profit: 15 },
  { name: "Feb", revenue: 45, expenses: 30, profit: 15 },
  // ...
];

<ResponsiveContainer width="100%" height={300}>
  <LineChart data={profitData}>
    <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
    <XAxis dataKey="name" axisLine={false} tickLine={false} />
    <YAxis axisLine={false} tickLine={false} />
    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
    <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={3} dot={false} />
    <Line type="monotone" dataKey="expenses" stroke="#EC4899" strokeWidth={3} dot={false} />
    <Line type="monotone" dataKey="profit" stroke="#F59E0B" strokeWidth={3} dot={false} />
  </LineChart>
</ResponsiveContainer>

{/* Légende */}
<div className="flex justify-center gap-6 mt-4">
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <div className="w-3 h-3 rounded-full bg-purple-500"></div> Revenue
  </div>
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <div className="w-3 h-3 rounded-full bg-pink-500"></div> Expenses
  </div>
  <div className="flex items-center gap-2 text-sm text-gray-600">
    <div className="w-3 h-3 rounded-full bg-orange-500"></div> Profit
  </div>
</div>
```

---

### ⏱️ 8:00 - 10:00 | Top Performers & Tableaux (2 min)

**Top Performing Team:**
```tsx
const topPerformers = [
  { name: "Isabelle", role: "Hair Stylist", revenue: 4250, rating: 4.9, 
    avatar: "I", bg: "bg-purple-100", text: "text-purple-600" },
  { name: "Fatima S", role: "Nail Artist", revenue: 3890, rating: 4.8, 
    avatar: "F", bg: "bg-pink-100", text: "text-pink-600" },
  // ...
];

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {topPerformers.map((worker, idx) => (
    <Card key={worker.name} className={`p-4 flex flex-col gap-3 transition-all border ${
      idx === 0 ? "bg-purple-50/30 border-purple-100 hover:shadow-lg" :
      idx === 1 ? "bg-pink-50/30 border-pink-100 hover:shadow-lg" :
      idx === 2 ? "bg-orange-50/30 border-orange-100 hover:shadow-lg" :
                  "bg-teal-50/30 border-teal-100 hover:shadow-lg"
    }`}>
      <div className="flex gap-3">
        <div className={`w-12 h-12 rounded-full ${worker.bg} flex items-center justify-center ${worker.text} font-bold text-lg`}>
          {worker.avatar}
        </div>
        <div>
          <p className="font-bold text-gray-900">{worker.name}</p>
          <p className="text-xs text-gray-500">{worker.role}</p>
        </div>
      </div>
      <div className="mt-2 pt-3 border-t flex justify-between">
        <div>
          <p className="text-xs text-gray-400">Revenue</p>
          <p className="font-bold text-gray-900">€{worker.revenue.toLocaleString()}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Rating</p>
          <div className="text-yellow-500 text-xs">{"★".repeat(Math.round(worker.rating))}</div>
        </div>
      </div>
    </Card>
  ))}
</div>
```

**Today's Services Table:**
```tsx
const todaysSessions = [
  { time: "09:00 AM", client: "Marie Anderson", type: "Box Braids", 
    worker: "Orphelia", price: "€120", status: "Completed", 
    statusColor: "bg-green-100 text-green-700" },
  // ...
];

<table className="w-full">
  <thead>
    <tr className="border-b border-gray-100">
      <th className="text-left text-xs font-semibold text-gray-500 pb-3">Time</th>
      <th className="text-left text-xs font-semibold text-gray-500 pb-3">Client</th>
      <th className="text-left text-xs font-semibold text-gray-500 pb-3">Service</th>
      <th className="text-left text-xs font-semibold text-gray-500 pb-3">Worker</th>
      <th className="text-left text-xs font-semibold text-gray-500 pb-3">Status</th>
      <th className="text-right text-xs font-semibold text-gray-500 pb-3">Price</th>
    </tr>
  </thead>
  <tbody className="divide-y divide-gray-50">
    {todaysSessions.map((session, index) => (
      <tr key={index} className={`transition-colors ${
        index % 5 === 0 ? "bg-purple-50/20 hover:bg-purple-50/40" :
        index % 5 === 1 ? "bg-pink-50/20 hover:bg-pink-50/40" : "..."
      }`}>
        <td className="py-4 text-sm font-medium">{session.time}</td>
        <td className="py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold">
              {session.client.charAt(0)}
            </div>
            <span className="text-sm font-medium">{session.client}</span>
          </div>
        </td>
        <td className="py-4 text-sm text-gray-600">{session.type}</td>
        <td className="py-4 text-sm text-gray-600">{session.worker}</td>
        <td className="py-4">
          <span className={`text-xs font-bold px-3 py-1 rounded-full ${session.statusColor}`}>
            {session.status}
          </span>
        </td>
        <td className="py-4 text-right font-bold">{session.price}</td>
      </tr>
    ))}
  </tbody>
</table>
```

**Conclusion:**
> "Notre dashboard est complet avec toutes les sections! Il est responsive, thémable, et affiche des données visuellement attractives."

---

## 📝 Points Clés à Retenir

| Concept | Description |
|---------|-------------|
| **Gradient Cards** | `bg-gradient-to-r from-X to-Y` avec `hover:scale-[1.01]` |
| **Recharts** | Bibliothèque de graphiques React (BarChart, LineChart, PieChart) |
| **ResponsiveContainer** | Rend les graphiques adaptatifs à la taille du conteneur |
| **Border-t-4** | Accent coloré en haut des cartes |
| **Status badges** | Couleurs sémantiques (green/blue/yellow pour completed/in-progress/pending) |

---

## 🎯 Exercice Pratique

1. Ajoutez une 5ème stat card "Sessions Today" avec un gradient bleu
2. Créez un graphique Pie Chart pour la distribution des services
3. Ajoutez des animations au hover sur les lignes du tableau

---

## ➡️ Vidéo Suivante

[Vidéo 06: Responsive & Rôles](./06-responsive-roles.md)
