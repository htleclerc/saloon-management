"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Check, ChevronLeft, ChevronRight, Clock, Layers, MapPin, Phone, Scissors, User, Users, AlertCircle, CreditCard, CheckCircle2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { calculateBookingTotals, calculateDeposit, formatDurationMinutes } from "@/lib/domain/rules/pricingRules";
import type { PublicSalonPayload, PublicService, PublicAddon, PublicBookingResult } from "@/lib/public-booking/server";
import type { AvailabilitySlot } from "@/lib/domain/rules/availabilityRules";

type Step = 'services' | 'extras' | 'stylist' | 'schedule' | 'details' | 'done';

interface ClientForm {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    notes: string;
}

const EMPTY_CLIENT: ClientForm = { firstName: '', lastName: '', phone: '', email: '', notes: '' };

const todayIso = (): string => {
    const d = new Date();
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const addDaysIso = (days: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

export default function PublicBookingPage() {
    const params = useParams();
    const slug = String(params.slug || '');
    const { t, language } = useTranslation();

    const [payload, setPayload] = useState<PublicSalonPayload | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [step, setStep] = useState<Step>('services');
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [selectedAddonIds, setSelectedAddonIds] = useState<number[]>([]);
    const [selectedWorkerId, setSelectedWorkerId] = useState<number | undefined>(undefined);
    const [date, setDate] = useState<string>(todayIso());
    const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [time, setTime] = useState<string>('');
    const [client, setClient] = useState<ClientForm>(EMPTY_CLIENT);
    const [acceptedTerms, setAcceptedTerms] = useState<boolean[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [result, setResult] = useState<(PublicBookingResult & { paymentMode?: string }) | null>(null);
    const [returnNotice, setReturnNotice] = useState<'success' | 'cancel' | null>(null);

    // Load the public catalog
    useEffect(() => {
        if (!slug) return;
        let cancelled = false;
        setLoading(true);
        fetch(`/api/public/salons/${encodeURIComponent(slug)}`)
            .then(async (res) => {
                const data = await res.json().catch(() => ({}));
                if (cancelled) return;
                if (!res.ok) {
                    setLoadError(res.status === 404 ? 'notFound' : (data.error || 'error'));
                    return;
                }
                setPayload(data as PublicSalonPayload);
                setAcceptedTerms(((data as PublicSalonPayload).settings.bookingTerms || []).map(() => false));
            })
            .catch(() => { if (!cancelled) setLoadError('error'); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [slug]);

    // Back from the deposit checkout (?booking=ID&deposit=success|cancel)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const q = new URLSearchParams(window.location.search);
        const outcome = q.get('deposit');
        if (outcome === 'success' || outcome === 'cancel') {
            setReturnNotice(outcome);
            setStep('done');
            window.history.replaceState(null, '', window.location.pathname);
        }
    }, []);

    const currency = payload?.salon.currency || 'USD';
    const formatMoney = useCallback((amount: number) => {
        try {
            return new Intl.NumberFormat(language === 'fr' ? 'fr-FR' : language === 'es' ? 'es-ES' : 'en-US', { style: 'currency', currency }).format(amount);
        } catch {
            return `${amount.toFixed(2)} ${currency}`;
        }
    }, [currency, language]);

    const selectedServices = useMemo<PublicService[]>(
        () => (payload?.services || []).filter(s => selectedServiceIds.includes(s.id)),
        [payload, selectedServiceIds]
    );
    const offeredAddons = useMemo<PublicAddon[]>(() => {
        if (!payload) return [];
        const ids = new Set(selectedServices.flatMap(s => s.addonIds));
        return payload.addons.filter(a => ids.has(a.id));
    }, [payload, selectedServices]);
    const selectedAddons = useMemo(() => offeredAddons.filter(a => selectedAddonIds.includes(a.id)), [offeredAddons, selectedAddonIds]);
    const totals = useMemo(() => calculateBookingTotals(selectedServices, selectedAddons), [selectedServices, selectedAddons]);
    const depositAmount = useMemo(() => calculateDeposit(totals.totalPrice, payload?.settings), [totals.totalPrice, payload]);
    const bookingTerms = payload?.settings.bookingTerms || [];
    const allTermsAccepted = bookingTerms.length === 0 || bookingTerms.every((_, i) => acceptedTerms[i]);

    // Keep only extras still offered when services change
    useEffect(() => {
        setSelectedAddonIds(prev => prev.filter(id => offeredAddons.some(a => a.id === id)));
    }, [offeredAddons]);

    // Availability for the chosen day
    const loadSlots = useCallback(async (day: string) => {
        if (!payload || totals.totalDuration === 0) return;
        setSlotsLoading(true);
        setTime('');
        try {
            const q = new URLSearchParams({ date: day, duration: String(totals.totalDuration) });
            if (selectedWorkerId) q.set('workerId', String(selectedWorkerId));
            const res = await fetch(`/api/public/salons/${encodeURIComponent(slug)}/availability?${q.toString()}`);
            const data = await res.json().catch(() => ({ slots: [] }));
            setSlots(res.ok ? (data.slots as AvailabilitySlot[]) : []);
        } catch {
            setSlots([]);
        } finally {
            setSlotsLoading(false);
        }
    }, [payload, totals.totalDuration, selectedWorkerId, slug]);

    useEffect(() => {
        if (step === 'schedule') loadSlots(date);
    }, [step, date, loadSlots]);

    const steps: Step[] = useMemo(() => {
        const list: Step[] = ['services'];
        if (offeredAddons.length > 0 || selectedServiceIds.length === 0) list.push('extras');
        list.push('stylist', 'schedule', 'details');
        return list;
    }, [offeredAddons.length, selectedServiceIds.length]);
    const visibleSteps = steps.filter(s => s !== 'extras' || offeredAddons.length > 0);
    const stepIndex = visibleSteps.indexOf(step);

    const goNext = () => { const next = visibleSteps[stepIndex + 1]; if (next) setStep(next); };
    const goBack = () => { const prev = visibleSteps[stepIndex - 1]; if (prev) setStep(prev); };

    const canContinue = (): boolean => {
        switch (step) {
            case 'services': return selectedServiceIds.length > 0;
            case 'extras': return true;
            case 'stylist': return true;
            case 'schedule': return !!date && !!time;
            case 'details': return client.firstName.trim().length > 0 && client.lastName.trim().length > 0 && client.phone.replace(/\D/g, '').length >= 8 && allTermsAccepted && !submitting;
            default: return false;
        }
    };

    const submit = async () => {
        if (!payload || !canContinue()) return;
        setSubmitting(true);
        setSubmitError(null);
        try {
            const res = await fetch(`/api/public/salons/${encodeURIComponent(slug)}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    serviceIds: selectedServiceIds,
                    addonIds: selectedAddonIds,
                    workerId: selectedWorkerId,
                    date,
                    time,
                    client: { firstName: client.firstName, lastName: client.lastName, phone: client.phone, email: client.email || '' },
                    notes: client.notes || undefined,
                    termsAccepted: allTermsAccepted,
                }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                setSubmitError(data.error || t('publicBooking.errors.generic'));
                if (res.status === 409) { setStep('schedule'); loadSlots(date); }
                return;
            }
            if (data.checkoutUrl) {
                window.location.href = data.checkoutUrl as string;
                return;
            }
            setResult(data as PublicBookingResult & { paymentMode?: string });
            setStep('done');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch {
            setSubmitError(t('publicBooking.errors.generic'));
        } finally {
            setSubmitting(false);
        }
    };

    // ------------------------------------------------------------
    // Rendering helpers
    // ------------------------------------------------------------

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-primary)]" />
            </div>
        );
    }

    if (loadError || !payload) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md text-center space-y-3">
                    <AlertCircle className="w-12 h-12 text-gray-300 mx-auto" />
                    <h1 className="text-xl font-bold text-gray-900">{loadError === 'notFound' ? t('publicBooking.notFound') : t('publicBooking.errors.generic')}</h1>
                </div>
            </div>
        );
    }

    const { salon, settings } = payload;

    if (!settings.allowOnlineBooking) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
                <div className="max-w-md text-center space-y-3">
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto" />
                    <h1 className="text-xl font-bold text-gray-900">{salon.name}</h1>
                    <p className="text-gray-600">{t('publicBooking.disabled')}</p>
                    {salon.phone && <p className="text-gray-900 font-semibold flex items-center justify-center gap-2"><Phone className="w-4 h-4" /> {salon.phone}</p>}
                </div>
            </div>
        );
    }

    const categories = [...payload.categories].sort((a, b) => a.displayOrder - b.displayOrder);
    const uncategorized = payload.services.filter(s => !s.categoryId || !categories.some(c => c.id === s.categoryId));
    const groupedServices: { key: string; name: string; services: PublicService[] }[] = [
        ...categories.map(c => ({ key: `c${c.id}`, name: c.name, services: payload.services.filter(s => s.categoryId === c.id) })).filter(g => g.services.length > 0),
        ...(uncategorized.length > 0 ? [{ key: 'other', name: t('publicBooking.otherServices'), services: uncategorized }] : []),
    ];
    const morning = slots.filter(s => Number(s.time.slice(0, 2)) < 12);
    const afternoon = slots.filter(s => Number(s.time.slice(0, 2)) >= 12);
    const selectedWorker = payload.workers.find(w => w.id === selectedWorkerId);
    const stepLabel = (s: Step) => t(`publicBooking.steps.${s}`);

    const toggleService = (id: number) => setSelectedServiceIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    const toggleAddon = (id: number) => setSelectedAddonIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

    return (
        <div className="min-h-screen bg-gray-50 pb-32" data-testid="public-booking-page">
            {/* Salon header */}
            <header className="bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto px-4 py-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center overflow-hidden shrink-0">
                        {salon.logoUrl ? <img src={salon.logoUrl} alt={salon.name} className="w-full h-full object-cover" /> : <Scissors className="w-7 h-7" />}
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-xl font-black text-gray-900 truncate">{salon.name}</h1>
                        <p className="text-sm text-gray-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                            {(salon.address || salon.city) && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {[salon.address, salon.city].filter(Boolean).join(', ')}</span>}
                            {salon.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {salon.phone}</span>}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {/* Progress */}
                {step !== 'done' && (
                    <ol className="flex items-center gap-2 overflow-x-auto text-xs font-bold uppercase tracking-wider">
                        {visibleSteps.map((s, idx) => (
                            <li key={s} className={`flex items-center gap-2 whitespace-nowrap ${idx <= stepIndex ? 'text-[var(--color-primary)]' : 'text-gray-400'}`}>
                                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${idx < stepIndex ? 'bg-[var(--color-primary)] text-white' : idx === stepIndex ? 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]' : 'bg-gray-200 text-gray-500'}`}>
                                    {idx < stepIndex ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                                </span>
                                {stepLabel(s)}
                                {idx < visibleSteps.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-gray-300" />}
                            </li>
                        ))}
                    </ol>
                )}

                {/* Step: services */}
                {step === 'services' && (
                    <section className="space-y-6" data-testid="step-services">
                        <h2 className="text-lg font-bold text-gray-900">{t('publicBooking.selectServices')}</h2>
                        {groupedServices.length === 0 && <p className="text-gray-500">{t('publicBooking.noServices')}</p>}
                        {groupedServices.map(group => (
                            <div key={group.key} className="space-y-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-gray-400">{group.name}</h3>
                                <div className="space-y-2">
                                    {group.services.map(service => {
                                        const selected = selectedServiceIds.includes(service.id);
                                        return (
                                            <button
                                                key={service.id}
                                                type="button"
                                                onClick={() => toggleService(service.id)}
                                                aria-pressed={selected}
                                                className={`w-full text-left p-4 rounded-2xl border-2 bg-white transition-all flex items-start gap-3 ${selected ? 'border-[var(--color-primary)] shadow-md' : 'border-gray-100 hover:border-[var(--color-primary-light)]'}`}
                                            >
                                                <span className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${selected ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-gray-300'}`}>
                                                    {selected && <Check className="w-3.5 h-3.5" />}
                                                </span>
                                                <span className="flex-1 min-w-0">
                                                    <span className="flex items-start justify-between gap-3">
                                                        <span className="font-bold text-gray-900">{service.name}</span>
                                                        <span className="font-black text-[var(--color-primary)] shrink-0">{formatMoney(service.price)}</span>
                                                    </span>
                                                    <span className="block text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDurationMinutes(service.duration)}</span>
                                                    {service.description && <span className="block text-sm text-gray-600 mt-2 whitespace-pre-line">{service.description}</span>}
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </section>
                )}

                {/* Step: extras */}
                {step === 'extras' && (
                    <section className="space-y-4" data-testid="step-extras">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]"><Layers className="w-5 h-5" /></div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">{t('publicBooking.addExtras')}</h2>
                                <p className="text-sm text-gray-500">{t('publicBooking.extrasHint')}</p>
                            </div>
                        </div>
                        <div className="space-y-2">
                            {offeredAddons.map(addon => {
                                const selected = selectedAddonIds.includes(addon.id);
                                return (
                                    <button
                                        key={addon.id}
                                        type="button"
                                        onClick={() => toggleAddon(addon.id)}
                                        aria-pressed={selected}
                                        className={`w-full text-left p-4 rounded-2xl border-2 bg-white transition-all flex items-start gap-3 ${selected ? 'border-[var(--color-primary)] shadow-md' : 'border-gray-100 hover:border-[var(--color-primary-light)]'}`}
                                    >
                                        <span className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 ${selected ? 'bg-[var(--color-primary)] border-[var(--color-primary)] text-white' : 'border-gray-300'}`}>
                                            {selected && <Check className="w-3.5 h-3.5" />}
                                        </span>
                                        <span className="flex-1 min-w-0">
                                            <span className="flex items-start justify-between gap-3">
                                                <span className="font-bold text-gray-900">{addon.name}</span>
                                                <span className="font-black text-[var(--color-primary)] shrink-0">+{formatMoney(addon.extraPrice)}</span>
                                            </span>
                                            <span className="block text-xs text-gray-500 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" /> +{formatDurationMinutes(addon.extraDuration)}</span>
                                            {addon.description && <span className="block text-sm text-gray-600 mt-1">{addon.description}</span>}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )}

                {/* Step: stylist */}
                {step === 'stylist' && (
                    <section className="space-y-4" data-testid="step-stylist">
                        <h2 className="text-lg font-bold text-gray-900">{t('publicBooking.selectStylist')}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <button
                                type="button"
                                onClick={() => setSelectedWorkerId(undefined)}
                                className={`p-4 rounded-2xl border-2 bg-white text-center transition-all ${selectedWorkerId === undefined ? 'border-[var(--color-primary)] shadow-md' : 'border-gray-100 hover:border-[var(--color-primary-light)]'}`}
                            >
                                <span className="w-14 h-14 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-500 mb-2"><Users className="w-6 h-6" /></span>
                                <span className="block font-bold text-gray-900 text-sm">{t('publicBooking.anyStylist')}</span>
                                <span className="block text-xs text-gray-500">{t('publicBooking.anyStylistHint')}</span>
                            </button>
                            {payload.workers.map(worker => (
                                <button
                                    key={worker.id}
                                    type="button"
                                    onClick={() => setSelectedWorkerId(worker.id)}
                                    className={`p-4 rounded-2xl border-2 bg-white text-center transition-all ${selectedWorkerId === worker.id ? 'border-[var(--color-primary)] shadow-md' : 'border-gray-100 hover:border-[var(--color-primary-light)]'}`}
                                >
                                    {worker.avatarUrl
                                        ? <img src={worker.avatarUrl} alt="" className="w-14 h-14 mx-auto rounded-full object-cover mb-2" />
                                        : <span className="w-14 h-14 mx-auto rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center font-black text-lg mb-2">{worker.name.charAt(0)}</span>}
                                    <span className="block font-bold text-gray-900 text-sm truncate">{worker.name}</span>
                                    {worker.specialties[0] && <span className="block text-xs text-gray-500 truncate">{worker.specialties[0]}</span>}
                                </button>
                            ))}
                        </div>
                    </section>
                )}

                {/* Step: schedule */}
                {step === 'schedule' && (
                    <section className="space-y-5" data-testid="step-schedule">
                        <h2 className="text-lg font-bold text-gray-900">{t('publicBooking.selectDateTime')}</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-4">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t('publicBooking.date')}</span>
                                <input
                                    type="date"
                                    value={date}
                                    min={todayIso()}
                                    max={addDaysIso(settings.bookingAdvanceDays)}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="mt-1 w-full p-3 rounded-xl border border-gray-200 bg-gray-50 font-semibold focus:ring-2 focus:ring-[var(--color-primary)] outline-none"
                                    data-testid="date-input"
                                />
                            </label>
                            {slotsLoading ? (
                                <p className="text-sm text-gray-500">{t('common.loading')}</p>
                            ) : slots.length === 0 ? (
                                <p className="text-sm text-gray-500">{t('publicBooking.closedDay')}</p>
                            ) : (
                                <>
                                    {[{ label: t('publicBooking.morning'), list: morning }, { label: t('publicBooking.afternoon'), list: afternoon }].filter(g => g.list.length > 0).map(group => (
                                        <div key={group.label}>
                                            <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{group.label}</p>
                                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                                {group.list.map(slot => (
                                                    <button
                                                        key={slot.time}
                                                        type="button"
                                                        disabled={!slot.available}
                                                        onClick={() => setTime(slot.time)}
                                                        className={`py-2 rounded-lg text-sm font-bold transition-all ${time === slot.time ? 'bg-[var(--color-primary)] text-white shadow-md' : slot.available ? 'bg-white border border-gray-200 hover:border-[var(--color-primary)] text-gray-800' : 'bg-gray-100 text-gray-300 line-through cursor-not-allowed'}`}
                                                    >
                                                        {slot.time}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {slots.every(s => !s.available) && <p className="text-sm text-gray-500">{t('publicBooking.noSlot')}</p>}
                                </>
                            )}
                        </div>
                    </section>
                )}

                {/* Step: details + summary */}
                {step === 'details' && (
                    <section className="space-y-5" data-testid="step-details">
                        <h2 className="text-lg font-bold text-gray-900">{t('publicBooking.yourDetails')}</h2>
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t('publicBooking.firstName')} *</span>
                                <input value={client.firstName} onChange={(e) => setClient({ ...client, firstName: e.target.value })} className="mt-1 w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" autoComplete="given-name" data-testid="first-name" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t('publicBooking.lastName')} *</span>
                                <input value={client.lastName} onChange={(e) => setClient({ ...client, lastName: e.target.value })} className="mt-1 w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" autoComplete="family-name" data-testid="last-name" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t('publicBooking.phone')} *</span>
                                <input type="tel" value={client.phone} onChange={(e) => setClient({ ...client, phone: e.target.value })} className="mt-1 w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" autoComplete="tel" data-testid="phone" />
                            </label>
                            <label className="block">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t('publicBooking.email')}</span>
                                <input type="email" value={client.email} onChange={(e) => setClient({ ...client, email: e.target.value })} className="mt-1 w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" autoComplete="email" data-testid="email" />
                            </label>
                            <label className="block sm:col-span-2">
                                <span className="text-xs font-black uppercase tracking-widest text-gray-400">{t('publicBooking.notes')}</span>
                                <textarea value={client.notes} onChange={(e) => setClient({ ...client, notes: e.target.value })} rows={2} className="mt-1 w-full p-3 rounded-xl border border-gray-200 bg-gray-50 focus:ring-2 focus:ring-[var(--color-primary)] outline-none" />
                            </label>
                        </div>

                        {/* Summary */}
                        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3" data-testid="summary">
                            <p className="text-xs font-black uppercase tracking-widest text-gray-400">{t('publicBooking.summary')}</p>
                            <ul className="space-y-1 text-sm">
                                {selectedServices.map(s => (
                                    <li key={`s${s.id}`} className="flex justify-between gap-3"><span className="text-gray-800">{s.name}</span><span className="text-gray-600 shrink-0">{formatDurationMinutes(s.duration)} · {formatMoney(s.price)}</span></li>
                                ))}
                                {selectedAddons.map(a => (
                                    <li key={`a${a.id}`} className="flex justify-between gap-3"><span className="text-gray-800">+ {a.name}</span><span className="text-gray-600 shrink-0">+{formatDurationMinutes(a.extraDuration)} · +{formatMoney(a.extraPrice)}</span></li>
                                ))}
                            </ul>
                            <div className="pt-3 border-t border-gray-100 text-sm space-y-1">
                                <p className="flex items-center gap-2 text-gray-800"><Calendar className="w-4 h-4 text-[var(--color-primary)]" /> {date} {t('booking.at')} {time}</p>
                                <p className="flex items-center gap-2 text-gray-800"><User className="w-4 h-4 text-[var(--color-primary)]" /> {selectedWorker ? selectedWorker.name : t('publicBooking.anyStylist')}</p>
                                <p className="flex items-center gap-2 text-gray-800"><Clock className="w-4 h-4 text-[var(--color-primary)]" /> {formatDurationMinutes(totals.totalDuration)}</p>
                            </div>
                            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                <span className="font-bold text-gray-900">{t('publicBooking.total')}</span>
                                <span className="text-2xl font-black text-[var(--color-primary)]" data-testid="total-price">{formatMoney(totals.totalPrice)}</span>
                            </div>
                            {depositAmount > 0 && (
                                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-900 flex items-start gap-2">
                                    <CreditCard className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>
                                        <strong>{t('publicBooking.depositDue', { amount: formatMoney(depositAmount) })}</strong>{' '}
                                        {t('publicBooking.depositHint', { balance: formatMoney(Math.max(0, totals.totalPrice - depositAmount)) })}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Terms */}
                        {bookingTerms.length > 0 && (
                            <div className="space-y-2" data-testid="terms">
                                <p className="text-sm font-bold text-gray-800">{t('booking.terms.title')}</p>
                                {bookingTerms.map((term, idx) => (
                                    <label key={idx} className={`flex items-start gap-3 p-3 rounded-xl border bg-white cursor-pointer ${acceptedTerms[idx] ? 'border-[var(--color-primary)]' : 'border-gray-200'}`}>
                                        <input type="checkbox" checked={!!acceptedTerms[idx]} onChange={(e) => setAcceptedTerms(prev => prev.map((v, i) => (i === idx ? e.target.checked : v)))} className="mt-0.5 w-5 h-5 rounded border-gray-300 text-[var(--color-primary)]" />
                                        <span className="text-sm text-gray-800">{term}</span>
                                    </label>
                                ))}
                            </div>
                        )}

                        {submitError && (
                            <p className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700 flex items-center gap-2" role="alert"><AlertCircle className="w-4 h-4" /> {submitError}</p>
                        )}
                    </section>
                )}

                {/* Done */}
                {step === 'done' && (
                    <section className="bg-white rounded-3xl border border-gray-100 p-8 text-center space-y-4" data-testid="step-done">
                        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
                        <h2 className="text-2xl font-black text-gray-900">
                            {returnNotice === 'cancel' ? t('publicBooking.done.depositCancelled') : t('publicBooking.done.title')}
                        </h2>
                        {result && (
                            <div className="text-gray-700 space-y-1">
                                <p className="font-bold">#{result.bookingId} · {date} {t('booking.at')} {result.time}</p>
                                <p>{selectedServices.map(s => s.name).join(', ')}{selectedAddons.length > 0 ? ` + ${selectedAddons.map(a => a.name).join(', ')}` : ''}</p>
                                <p>{selectedWorker ? selectedWorker.name : t('publicBooking.anyStylist')}</p>
                                <p className="font-black text-[var(--color-primary)] text-xl">{formatMoney(result.totalPrice)}</p>
                                {result.depositAmount > 0 && result.paymentMode === 'demo' && <p className="text-sm text-amber-700">{t('publicBooking.done.depositDemo', { amount: formatMoney(result.depositAmount) })}</p>}
                                {result.depositAmount > 0 && result.paymentMode === 'none' && <p className="text-sm text-amber-700">{t('publicBooking.done.depositLater', { amount: formatMoney(result.depositAmount) })}</p>}
                            </div>
                        )}
                        {returnNotice === 'success' && <p className="text-gray-700">{t('publicBooking.done.depositReceived')}</p>}
                        {returnNotice === 'cancel' && <p className="text-gray-700">{t('publicBooking.done.depositCancelledHint')}</p>}
                        <p className="text-sm text-gray-500">{t('publicBooking.done.pending')}</p>
                        {salon.phone && <p className="text-sm text-gray-700 font-semibold flex items-center justify-center gap-2"><Phone className="w-4 h-4" /> {salon.phone}</p>}
                        <button type="button" onClick={() => window.location.href = `/book/${slug}`} className="text-sm font-bold text-[var(--color-primary)] hover:underline">{t('publicBooking.done.bookAnother')}</button>
                    </section>
                )}
            </main>

            {/* Sticky footer: running total + navigation */}
            {step !== 'done' && (
                <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                    <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{t('publicBooking.currentTotal')}</p>
                            <p className="font-black text-gray-900 truncate">
                                {formatMoney(totals.totalPrice)}
                                {totals.totalDuration > 0 && <span className="text-gray-500 font-medium text-sm"> · {formatDurationMinutes(totals.totalDuration)}</span>}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            {stepIndex > 0 && (
                                <button type="button" onClick={goBack} className="px-4 py-3 rounded-xl border border-gray-200 font-bold text-gray-700 flex items-center gap-1" data-testid="back-button">
                                    <ChevronLeft className="w-4 h-4" /> {t('common.back')}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={step === 'details' ? submit : goNext}
                                disabled={!canContinue()}
                                className="px-5 py-3 rounded-xl bg-[var(--color-primary)] text-white font-bold flex items-center gap-1 disabled:opacity-40"
                                data-testid="next-button"
                            >
                                {step === 'details'
                                    ? (depositAmount > 0 ? t('publicBooking.confirmAndPay', { amount: formatMoney(depositAmount) }) : t('publicBooking.confirm'))
                                    : t('common.continue')}
                                {step !== 'details' && <ChevronRight className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>
                </footer>
            )}
        </div>
    );
}
