"use client";

import { useTranslation } from "@/i18n";
import { useState, useEffect, useMemo, useRef } from "react";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useCurrency } from "@/hooks/useCurrency";
import { useAuth } from "@/context/AuthProvider";
import { useBooking } from "@/context/BookingProvider";
import { useConfirm } from "@/context/ConfirmProvider";
import { format, addDays, subDays } from "date-fns";
import { workerService, incomeService, serviceService } from "@/lib/services";
import { SalonWorker, Income, Service } from "@/types";
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Clock,
    User,
    Scissors,
    DollarSign,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    PlayCircle
} from "lucide-react";

export default function DailyPage() {
    const { t } = useTranslation();
    const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
    const { getCardStyle } = useKpiCardStyle();
    const { format: formatCurrency } = useCurrency();
    const { user, hasPermission, getWorkerId, canModify, activeSalonId } = useAuth();
    const { bookings, startBooking } = useBooking();
    const { confirm } = useConfirm();
    const [workers, setWorkers] = useState<SalonWorker[]>([]);
    const [servicesMap, setServicesMap] = useState<Record<number, string>>({});
    const [draftIncome, setDraftIncome] = useState(0);
    const dateInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (activeSalonId) {
            workerService.getAll(Number(activeSalonId)).then(setWorkers);

            // Fetch services for mapping IDs to Names
            serviceService.getAll(Number(activeSalonId)).then((salonServices: Service[]) => {
                const map: Record<number, string> = {};
                salonServices.forEach(s => { map[s.id] = s.name; });
                setServicesMap(map);
            });

            incomeService.getAll(Number(activeSalonId), {
                startDate: selectedDate,
                endDate: selectedDate,
                status: 'Draft'
            }).then((incomes: Income[]) => {
                const total = incomes.reduce((sum, inc) => sum + inc.finalAmount, 0);
                setDraftIncome(total);
            });
        }
    }, [activeSalonId, selectedDate]);

    const workerId = getWorkerId();
    const isWorker = user?.role === 'worker';

    // Simple date filter: only selected date bookings
    const dailyBookings = bookings.filter(b => b.date === selectedDate);

    const filteredAppointments = useMemo(() => {
        return isWorker
            ? dailyBookings.filter(apt => (apt.workerIds || []).includes(Number(workerId) || 0))
            : dailyBookings;
    }, [isWorker, dailyBookings, workerId]);

    const availableWorkers = useMemo(() => {
        if (isWorker) return [user?.name || t('common.worker')];
        return workers.map(w => w.name);
    }, [isWorker, user, workers, t]);

    const handleStart = async (id: number) => {
        const isConfirmed = await confirm({
            title: t('dialogs.confirmStartBooking'),
            message: t('dialogs.confirmStartBookingMsg'),
            type: "info",
            confirmText: t('common.dailyOverview.schedule.start'),
            cancelText: t('common.cancel')
        });
        if (isConfirmed) {
            startBooking(id);
        }
    };

    const handlePrevDay = () => {
        setSelectedDate(prev => format(subDays(new Date(prev), 1), "yyyy-MM-dd"));
    };

    const handleNextDay = () => {
        setSelectedDate(prev => format(addDays(new Date(prev), 1), "yyyy-MM-dd"));
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {t('common.dailyOverview.title')}
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            {t('common.dailyOverview.subtitle')}
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-card p-2 rounded-xl border border-border shadow-sm mr-4">
                        <Button variant="outline" size="sm" className="p-2" onClick={handlePrevDay}>
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <div
                            className="relative flex items-center gap-2 px-4 font-semibold text-foreground cursor-pointer hover:bg-accent transition-colors rounded-lg"
                            onClick={() => dateInputRef.current?.showPicker()}
                        >
                            <Calendar className="w-5 h-5 text-primary pointer-events-none" />
                            <input
                                ref={dateInputRef}
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                            />
                            <span className="z-0 pointer-events-none">{selectedDate}</span>
                        </div>
                        <Button variant="outline" size="sm" className="p-2" onClick={handleNextDay}>
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Daily Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title={t('common.dailyOverview.stats.bookings')}
                        value={filteredAppointments.length.toString()}
                        subtitle={t('common.dailyOverview.stats.bookingsSubtitle')}
                        icon={Calendar}
                        gradient=""
                        style={getCardStyle(0)}
                    />
                    <StatCard
                        title={t('common.dailyOverview.stats.completed')}
                        value={filteredAppointments.filter(b => b.status === 'Closed' || b.status === 'Finished').length.toString()}
                        subtitle={t('common.dailyOverview.stats.completedSubtitle')}
                        icon={CheckCircle}
                        gradient=""
                        style={getCardStyle(1)}
                    />
                    <StatCard
                        title={t('common.dailyOverview.stats.inProgress')}
                        value={filteredAppointments.filter(b => b.status === 'Started').length.toString()}
                        subtitle={t('common.dailyOverview.stats.inProgressSubtitle')}
                        icon={Clock}
                        gradient=""
                        style={getCardStyle(2)}
                    />
                    <StatCard
                        title={t('common.dailyOverview.stats.incomeDraft')}
                        value={formatCurrency(draftIncome)}
                        subtitle={t('common.dailyOverview.stats.incomeDraftSubtitle')}
                        icon={DollarSign}
                        gradient=""
                        style={getCardStyle(3)}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-2">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold text-foreground">
                                {t('common.dailyOverview.schedule.title')}
                            </h3>
                            <Button variant="outline" size="sm">
                                {t('common.dailyOverview.schedule.print')}
                            </Button>
                        </div>
                        <div className="space-y-6">
                            {filteredAppointments.length > 0 ? filteredAppointments.sort((a, b) => a.time.localeCompare(b.time)).map((apt) => (
                                <div key={apt.id} className="relative pl-8 border-l-2 border-primary-100 pb-6 last:pb-0">
                                    <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-background ${apt.status === 'Started' ? 'bg-blue-500' :
                                        apt.status === 'Closed' || apt.status === 'Finished' ? 'bg-green-500' : 'bg-primary-500'
                                        }`}></div>
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-muted/50 rounded-xl hover:bg-background hover:shadow-md transition">
                                        <div className="flex items-center gap-4">
                                            <div className="text-lg font-bold text-primary w-16">{apt.time}</div>
                                            <div>
                                                <p className="font-bold text-foreground">{apt.clientName}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {(apt.serviceIds && apt.serviceIds.length > 0)
                                                        ? apt.serviceIds.map(id => servicesMap[id] || `${t('common.service')}: #${id}`).join(", ")
                                                        : t('common.service')}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <span className={`text-xs px-2 py-1 rounded-full font-medium ${apt.status === 'Closed' || apt.status === 'Finished' ? 'bg-green-100 text-green-700' :
                                                    apt.status === 'Started' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-orange-100 text-orange-700'
                                                    }`}>
                                                    {apt.status}
                                                </span>
                                            </div>
                                            {canModify && (apt.status === 'Pending' || apt.status === 'Confirmed') && (
                                                <Button size="sm" onClick={() => handleStart(apt.id)} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                                    <PlayCircle className="w-4 h-4" /> {t('common.dailyOverview.schedule.start')}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <p className="text-center text-muted-foreground py-12">
                                    {t('common.dailyOverview.schedule.noAppointments')}
                                </p>
                            )}
                        </div>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <h3 className="text-lg font-bold text-foreground mb-4">
                                {t('common.dailyOverview.staffStatus')}
                            </h3>
                            <div className="space-y-4">
                                {availableWorkers.map((worker, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xs">
                                                {worker.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-foreground">{worker}</span>
                                        </div>
                                        <span className={`w-3 h-3 rounded-full bg-green-500`}></span>
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card className="bg-gradient-to-br from-primary-700 to-primary-900 text-white">
                            <div className="flex items-center gap-2 mb-4">
                                <AlertCircle className="w-6 h-6" />
                                <h3 className="text-lg font-bold">
                                    {t('common.dailyOverview.quickNote.title')}
                                </h3>
                            </div>
                            <p className="text-sm opacity-90 leading-relaxed mb-4">
                                {t('common.dailyOverview.quickNote.content')}
                            </p>
                        </Card>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
