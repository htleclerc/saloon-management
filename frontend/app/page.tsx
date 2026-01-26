'use client';

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { useTranslation } from "@/i18n";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth } from "@/context/AuthProvider";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  Plus,
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Briefcase,
  Calendar,
  Wallet,
  Receipt,
  ChevronRight,
  History,
  Loader2,
} from "lucide-react";
import HistoryModal, { HistoryEvent } from "@/components/ui/HistoryModal";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import ClientDashboard from "@/components/dashboard/ClientDashboard";
import WorkerDashboard from "@/components/dashboard/WorkerDashboard";
import { useBooking } from "@/context/BookingProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { format } from "date-fns";
import { useActionPermissions } from "@/lib/permissions";
import { BookingStatus, SalonStats, DashboardAnalytics } from "@/types";
import OnboardingGuard from "@/components/guards/OnboardingGuard";
import { salonService } from "@/lib/services/SalonService";
import { statsService } from "@/lib/services/StatsService";

export default function Dashboard() {
  const { t } = useTranslation();
  const { getCardStyle } = useKpiCardStyle();
  const { user, isClient, isSuperAdmin, canModify, activeSalonId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { bookings, startBooking } = useBooking();
  const { confirm } = useConfirm();
  const auth = useAuth();
  const permissions = useActionPermissions(auth as any);

  const [loading, setLoading] = useState(true);
  const [salonStats, setSalonStats] = useState<SalonStats | null>(null);
  const [analytics, setAnalytics] = useState<DashboardAnalytics | null>(null);

  useEffect(() => {
    if (isSuperAdmin && pathname === "/" && !auth.readOnlySalonInfo) {
      router.push("/superadmin");
      return;
    }

    async function loadDashboardData() {
      if (!activeSalonId) return;
      setLoading(true);
      try {
        const salonId = Number(activeSalonId);

        // Parallel loading of stats and analytics
        const [stats, analyticsData] = await Promise.all([
          salonService.getStats(salonId),
          statsService.getDashboardAnalytics(salonId)
        ]);

        setSalonStats(stats);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, [isSuperAdmin, pathname, router, auth.readOnlySalonInfo, activeSalonId]);

  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<{ title: string, subtitle: string, events: HistoryEvent[] }>({
    title: "", subtitle: "", events: []
  });

  const isWorker = user?.role === 'worker';
  const workerName = user?.name || t("common.worker");

  const handleStartBooking = async (bookingId: number) => {
    const isConfirmed = await confirm({
      title: t("dialogs.confirmStartBooking") || "Start Appointment?",
      message: t("dialogs.confirmStartBookingMsg") || "Do you want to start this appointment? A draft income will be created automatically.",
      type: "info",
      confirmText: t("common.confirm"),
      cancelText: t("common.cancel")
    });

    if (isConfirmed) {
      startBooking(bookingId);
    }
  };

  const handleViewBookingHistory = (session: any) => {
    setSelectedHistory({
      title: t("appointments.viewHistory"),
      subtitle: `${t("common.client")}: ${session.clientName || session.clientId} | ${t("common.service")}: ${session.type || '#' + session.id}`,
      events: session.history || []
    });
    setHistoryModalOpen(true);
  };

  // Filter Data for Today
  const today = format(new Date(), "yyyy-MM-dd");
  const todaysBookings = useMemo(() => {
    return (Array.isArray(bookings) ? bookings : []).filter(b => b.date === today);
  }, [bookings, today]);

  // Handle chart fallbacks
  const displayRevenueTrend = useMemo(() => {
    if (analytics?.revenueTrend && analytics.revenueTrend.length > 0) return analytics.revenueTrend;
    return [
      { name: "Jan", value: 0 }, { name: "Feb", value: 0 }, { name: "Mar", value: 0 },
      { name: "Apr", value: 0 }, { name: "May", value: 0 }, { name: "Jun", value: 0 },
    ];
  }, [analytics]);

  const displayExpenseCategories = useMemo(() => {
    if (analytics?.expenseDistribution && analytics.expenseDistribution.length > 0) {
      return analytics.expenseDistribution.map(item => ({
        ...item,
        name: t(item.key)
      }));
    }
    return [];
  }, [analytics, t]);

  if (isClient) {
    return (
      <OnboardingGuard>
        <MainLayout>
          <ClientDashboard />
        </MainLayout>
      </OnboardingGuard>
    );
  }

  if (isWorker) {
    return (
      <OnboardingGuard>
        <MainLayout>
          <WorkerDashboard
            workerName={workerName}
            revenueData={displayRevenueTrend}
            sessions={todaysBookings.map((b: any) => ({
              id: b.id,
              time: b.time,
              client: b.clientName || `Client #${b.clientId}`,
              type: t("common.service"),
              status: b.status,
              statusColor: b.status === "Finished" ? "bg-green-100 text-green-700" : b.status === "Started" ? "bg-blue-100 text-blue-700" : "bg-yellow-100 text-yellow-700",
              price: b.totalPrice ? `€${b.totalPrice}` : "€--",
              worker: workerName
            }))}
            activities={[]}
            notifications={[]}
            userActivities={[]}
            onStartBooking={handleStartBooking}
            userRole={user?.role}
          />
        </MainLayout>
      </OnboardingGuard>
    );
  }

  if (loading && activeSalonId) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px]">
          <Loader2 className="w-10 h-10 text-[var(--color-primary)] animate-spin mb-4" />
          <p className="text-gray-500 italic animate-pulse">{t("dashboard.loadingDashboard")}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <OnboardingGuard>
      <MainLayout>
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{t("dashboard.title")}</h1>
              <p className="text-gray-500 text-sm md:text-base mt-1">
                {t("dashboard.welcomeUser", { name: user?.name || t("common.name") })}
              </p>
            </div>
            <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow-sm border border-gray-100">
              <Calendar className="w-4 h-4 text-[var(--color-primary)]" />
              <span className="text-sm font-bold text-gray-700">{format(new Date(), "EEEE d MMMM")}</span>
            </div>
          </div>

          {/* --- Stats Gradient Cards --- */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Revenue */}
            <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-purple-500/20" style={getCardStyle(0)}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{t("dashboard.totalRevenueDesc")}</p>
                  <h3 className="text-2xl sm:text-3xl font-black">€{salonStats?.monthRevenue?.toLocaleString() || "0"}</h3>
                  <p className="text-xs text-white/90 mt-2 flex items-center gap-1 bg-white/20 w-fit px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" /> {t("dashboard.revenueGrowth")}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner"><DollarSign className="w-6 h-6 text-white" /></div>
              </div>
            </div>

            {/* Expenses */}
            <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-pink-500/20" style={getCardStyle(1)}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{t("dashboard.expenses")}</p>
                  <h3 className="text-2xl sm:text-3xl font-black">€{salonStats?.totalExpenses?.toLocaleString() || "0"}</h3>
                  <p className="text-xs text-white/90 mt-2 flex items-center gap-1 bg-white/20 w-fit px-2 py-0.5 rounded-full">
                    <TrendingDown className="w-3 h-3" /> {t("dashboard.expenseStable")}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner"><Wallet className="w-6 h-6 text-white" /></div>
              </div>
            </div>

            {/* Net Profit */}
            <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-orange-500/20" style={getCardStyle(2)}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{t("dashboard.netProfit")}</p>
                  <h3 className="text-2xl sm:text-3xl font-black">€{((salonStats?.monthRevenue || 0) - (salonStats?.totalExpenses || 0)).toLocaleString()}</h3>
                  <p className="text-xs text-white/90 mt-2 flex items-center gap-1 bg-white/20 w-fit px-2 py-0.5 rounded-full">
                    <TrendingUp className="w-3 h-3" /> {t("dashboard.optimalPerformance")}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner"><TrendingUp className="w-6 h-6 text-white" /></div>
              </div>
            </div>

            {/* Clients */}
            <div className="rounded-2xl p-6 text-white shadow-lg relative overflow-hidden transition-all hover:scale-[1.02] hover:shadow-green-500/20" style={getCardStyle(3)}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-wider mb-1">{t("dashboard.totalWorkers")}</p>
                  <h3 className="text-2xl sm:text-3xl font-black">{salonStats?.totalClients || "0"}</h3>
                  <p className="text-xs text-white/90 mt-2 flex items-center gap-1 bg-white/20 w-fit px-2 py-0.5 rounded-full">
                    <Users className="w-3 h-3" /> {t("dashboard.newClients")}
                  </p>
                </div>
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm shadow-inner"><Users className="w-6 h-6 text-white" /></div>
              </div>
            </div>
          </div>

          {/* --- Quick Actions --- */}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <div className="w-1.5 h-6 bg-[var(--color-primary)] rounded-full"></div>
              {t("dashboard.quickActions")}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {permissions.isManager && (
                <Link href="/income/add" className="group">
                  <button className="w-full flex items-center justify-center gap-3 bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)] text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-purple-500/20 active:scale-95 text-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full transition-transform group-hover:scale-125"></div>
                    <Plus className="w-7 h-7" />
                    <span>{t("dashboard.newIncome")}</span>
                  </button>
                </Link>
              )}
              {permissions.isManager && (
                <Link href="/expenses/add" className="group">
                  <button className="w-full flex items-center justify-center gap-3 bg-[var(--color-secondary)] hover:bg-[var(--color-secondary-dark)] text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-pink-500/20 active:scale-95 text-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full transition-transform group-hover:scale-125"></div>
                    <Wallet className="w-7 h-7" />
                    <span>{t("dashboard.newExpense")}</span>
                  </button>
                </Link>
              )}
              {permissions.isManager && canModify && (
                <Link href="/team/add" className="group">
                  <button className="w-full flex items-center justify-center gap-3 bg-[var(--color-warning)] hover:bg-[var(--color-warning-dark)] text-white py-5 rounded-2xl font-black transition-all shadow-xl shadow-orange-500/20 active:scale-95 text-lg overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-bl-full transition-transform group-hover:scale-125"></div>
                    <Users className="w-7 h-7" />
                    <span>{t("dashboard.addMember")}</span>
                  </button>
                </Link>
              )}
            </div>
          </div>

          {/* --- Charts Section --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Monthly Revenue Chart */}
            <Card className="p-8 border-none bg-white shadow-md hover:shadow-xl transition-shadow group">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-[var(--color-primary)] transition-colors">{t("dashboard.revenueTrend")}</h3>
                  <p className="text-xs text-gray-400 font-medium italic">{t("dashboard.monthlyEvolution")}</p>
                </div>
                <div className="p-2 bg-[var(--color-primary-light)] rounded-xl"><DollarSign className="w-5 h-5 text-[var(--color-primary)]" /></div>
              </div>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={displayRevenueTrend}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF', fontWeight: 600 }} />
                  <Tooltip
                    cursor={{ fill: 'var(--color-primary-light)', opacity: 0.4 }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', padding: '12px' }}
                  />
                  <Bar dataKey="value" fill="var(--color-primary)" radius={[6, 6, 6, 6]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            {/* Cost Distribution Chart */}
            <Card className="p-8 border-none bg-white shadow-md hover:shadow-xl transition-shadow group">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-gray-900 text-lg group-hover:text-[var(--color-secondary)] transition-colors">{t("dashboard.costDistribution")}</h3>
                  <p className="text-xs text-gray-400 font-medium italic">{t("dashboard.distributionByCategory")}</p>
                </div>
                <div className="p-2 bg-[var(--color-secondary-light)] rounded-xl"><Receipt className="w-5 h-5 text-[var(--color-secondary)]" /></div>
              </div>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-full md:w-1/2 relative h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={displayExpenseCategories}
                        cx="50%" cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={8}
                        dataKey="value"
                      >
                        {displayExpenseCategories.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="text-center">
                      <p className="text-2xl font-black text-gray-900">€{salonStats?.totalExpenses?.toLocaleString() || "0"}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{t("dashboard.totalExpenses")}</p>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 space-y-4">
                  {displayExpenseCategories.map((cat: any) => (
                    <div key={cat.name} className="flex items-center justify-between text-sm group/item">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: cat.color }}></div>
                        <span className="text-gray-600 font-medium group-hover/item:text-gray-900 transition-colors uppercase text-[11px] tracking-wide">{cat.name}</span>
                      </div>
                      <span className="font-bold text-gray-900 tracking-tight">€{cat.value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* --- Top Performers --- */}
          {analytics?.topPerformers && analytics.topPerformers.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                <div className="w-1.5 h-6 bg-[var(--color-secondary)] rounded-full"></div>
                {t("dashboard.topPerformers")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {analytics.topPerformers.map((worker, idx) => (
                  <Card key={idx} className="p-6 border-none bg-white shadow-md hover:shadow-xl transition-all group overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                      <TrendingUp className="w-12 h-12" />
                    </div>
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${worker.bg} ${worker.text} flex items-center justify-center font-black shadow-inner`}>
                        {worker.avatar}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 group-hover:text-[var(--color-primary)] transition-colors">{worker.name}</h4>
                        <p className="text-xs text-gray-500 font-medium italic">{worker.role}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-50">
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{t("dashboard.revenueShort")}</p>
                        <p className="font-black text-gray-900 text-sm">€{worker.revenue.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{t("common.clients")}</p>
                        <p className="font-black text-gray-900 text-sm">{worker.clients}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{t("dashboard.rating")}</p>
                        <p className="font-black text-[var(--color-warning)] text-sm flex items-center gap-0.5">
                          {worker.rating} <span className="text-[10px] opacity-70">★</span>
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* --- Today's Sessions (Manager Only Full Width) --- */}
          <Card className="p-8 border-none bg-white shadow-md">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="font-black text-gray-900 text-xl tracking-tight">{t("dashboard.todaysSessions")}</h3>
                <p className="text-sm text-gray-400 italic">{t("dashboard.todaysSessionsSubtitle")}</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-[var(--color-success-light)] text-[var(--color-success)] text-xs font-black px-4 py-1.5 rounded-full shadow-sm border border-[var(--color-success-light)]">
                  {t("dashboard.sessionsCount", { completed: todaysBookings.filter(b => b.status === "Finished").length, total: todaysBookings.length })}
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4 pl-2 italic">{t("common.time")}</th>
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4 italic">{t("common.client")}</th>
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4 italic">{t("common.service")}</th>
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4 italic">{t("common.worker")}</th>
                    <th className="text-left text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4 italic">{t("common.status")}</th>
                    <th className="text-center text-[10px] font-black text-gray-400 uppercase tracking-widest pb-4 italic">{t("common.actions")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {todaysBookings.length > 0 ? todaysBookings.map((session, index) => (
                    <tr key={index} className="group hover:bg-gray-50/80 transition-all duration-300">
                      <td className="py-5 pl-2 text-sm font-black text-gray-900 tabular-nums">{session.time}</td>
                      <td className="py-5">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-xs font-black text-gray-600 shadow-inner group-hover:scale-110 transition-transform`}>
                            {session.clientName?.charAt(0) || "C"}
                          </div>
                          <span className="text-sm text-gray-900 font-bold group-hover:text-[var(--color-primary)] transition-colors">{session.clientName || `Client #${session.clientId}`}</span>
                        </div>
                      </td>
                      <td className="py-5 text-sm font-medium text-gray-500 italic">{t("common.service")} #{session.id}</td>
                      <td className="py-5 text-sm font-bold text-gray-700">{t("dashboard.teamStats")}</td>
                      <td className="py-5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl border ${session.status === 'Finished' ? 'bg-green-50 text-green-700 border-green-100' :
                            session.status === 'Started' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                              session.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                'bg-yellow-50 text-yellow-700 border-yellow-100'
                            }`}>
                            {t(`dashboard.${session.status.toLowerCase()}`)}
                          </span>
                        </div>
                      </td>
                      <td className="py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {permissions.booking(session, "start") && (
                            <button
                              onClick={() => handleStartBooking(session.id)}
                              className="p-2 bg-[var(--color-primary-light)] text-[var(--color-primary)] rounded-xl hover:bg-[var(--color-primary)] hover:text-white transition-all shadow-sm active:scale-90"
                              title={t("dashboard.start")}
                            >
                              <Clock size={18} className="font-black" />
                            </button>
                          )}
                          <button
                            onClick={() => handleViewBookingHistory(session)}
                            className="p-2 bg-gray-100 text-gray-500 rounded-xl hover:bg-gray-900 hover:text-white transition-all shadow-sm active:scale-90"
                            title={t("dashboard.history")}
                          >
                            <History size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-12 text-center text-gray-400 italic font-medium">
                        {t("dashboard.noSessions")}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* History Modal */}
          <HistoryModal
            isOpen={historyModalOpen}
            onClose={() => setHistoryModalOpen(false)}
            title={selectedHistory.title}
            itemSubtitle={selectedHistory.subtitle}
            events={selectedHistory.events}
          />
        </div>
      </MainLayout>
    </OnboardingGuard>
  );
}
