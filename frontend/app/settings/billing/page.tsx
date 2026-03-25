"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { CreditCard, Download, CheckCircle, Star, TrendingUp, Zap, ExternalLink, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useCurrency } from "@/hooks/useCurrency";
import { useTranslation } from "@/i18n";
import { useState, useEffect } from "react";
import { getPlanConfig } from "@/lib/utils/subscriptionHelpers";
import { workerService } from "@/lib/services/WorkerService";
import { usePayment } from "@/hooks/usePayment";
import { useToast } from "@/context/ToastProvider";
import type { PaymentMethodInfo, InvoiceInfo } from "@/types/payment";
import Link from "next/link";

export default function BillingSettingsPage() {
    const { format } = useCurrency();
    const { t } = useTranslation();
    const { currentTenant, activeSalonId } = useAuth();
    const { showToast } = useToast();
    const { isDemoMode, openPortal, getPaymentMethods, getInvoices } = usePayment();
    const [workerCount, setWorkerCount] = useState(0);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethodInfo[]>([]);
    const [realInvoices, setRealInvoices] = useState<InvoiceInfo[]>([]);
    const [loadingPortal, setLoadingPortal] = useState(false);

    const currentPlanId = currentTenant?.subscriptionPlan || 'free';
    const planConfig = getPlanConfig(currentPlanId);
    const planName = planConfig?.name || 'Free';
    const planPrice = planConfig?.price || 0;
    const maxWorkers = planConfig?.limits?.maxWorkers || 5;
    const maxBookings = planConfig?.limits?.maxBookingsPerMonth || 100;

    useEffect(() => {
        if (activeSalonId) {
            workerService.getAll(Number(activeSalonId)).then(workers => {
                setWorkerCount(workers.length);
            }).catch(() => {});
        }
    }, [activeSalonId]);

    // Fetch real payment data
    useEffect(() => {
        async function fetchPaymentData() {
            try {
                const [methods, invoices] = await Promise.all([
                    getPaymentMethods(),
                    getInvoices(),
                ]);
                setPaymentMethods(methods);
                setRealInvoices(invoices);
            } catch {
                // Silently fail — will show demo data
            }
        }
        fetchPaymentData();
    }, [getPaymentMethods, getInvoices]);

    const handleManageSubscription = async () => {
        if (isDemoMode) {
            showToast(t("common.info"), t("settings.billing.demoModeActive"), "info");
            return;
        }
        setLoadingPortal(true);
        try {
            await openPortal();
        } catch (err) {
            showToast(t("common.error"), (err as Error).message, "error");
        } finally {
            setLoadingPortal(false);
        }
    };

    // Use real invoices if available, otherwise generate demo invoices
    const now = new Date();
    const demoInvoices = Array.from({ length: 3 }, (_, i) => {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        return {
            id: `INV-${year}-${month}`,
            date: `01/${month}/${year}`,
            amount: planPrice,
            pdfUrl: undefined as string | undefined,
        };
    });
    const invoices = realInvoices.length > 0
        ? realInvoices.map(inv => ({
            id: inv.id,
            date: new Date(inv.date).toLocaleDateString(),
            amount: inv.amount,
            pdfUrl: inv.pdfUrl,
        }))
        : demoInvoices;

    // Use real payment methods if available
    const displayMethod = paymentMethods.length > 0 ? paymentMethods[0] : null;

    const workerPct = maxWorkers > 0 ? Math.min((workerCount / maxWorkers) * 100, 100) : 0;

    return (
        <SettingsLayout
            title={t("settings.billingPage.title")}
            description={t("settings.billingPage.description")}
        >
            {/* Current Plan */}
            <Card className="bg-gradient-to-br from-primary to-[var(--color-primary)] text-white border-0">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm font-medium text-color-primary">{t("settings.billingPage.currentPlan")}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">{planName}</h3>
                        <p className="text-color-primary text-sm mb-4">{planPrice > 0 ? `${format(planPrice)}${t("settings.billingPage.perMonth")}` : t("settings.billing.free")}</p>
                        <div className="flex gap-3">
                            <ReadOnlyGuard>
                                <Link href="/settings/billing/upgrade">
                                    <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                                        {t("settings.billingPage.changePlan")}
                                    </Button>
                                </Link>
                            </ReadOnlyGuard>
                            <ReadOnlyGuard>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                                    onClick={handleManageSubscription}
                                    disabled={loadingPortal}
                                >
                                    {loadingPortal ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <ExternalLink className="w-3 h-3 mr-1" />
                                            {t("settings.billingPage.manageSubscription")}
                                        </>
                                    )}
                                </Button>
                            </ReadOnlyGuard>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-bold">{planPrice > 0 ? format(planPrice) : t("settings.billing.free")}</p>
                        {planPrice > 0 && <p className="text-color-primary text-sm">{t("settings.billingPage.perMonth")}</p>}
                    </div>
                </div>
            </Card>

            {/* Usage Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{maxBookings}</p>
                            <p className="text-xs text-gray-500">{t("settings.billingPage.servicesThisMonth")}</p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "50%" }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t("settings.billingPage.included", { used: Math.round(maxBookings * 0.5), total: maxBookings })}</p>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">{workerCount}</p>
                            <p className="text-xs text-gray-500">{t("settings.billingPage.activeWorkers")}</p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: `${workerPct}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t("settings.billingPage.included", { used: workerCount, total: maxWorkers })}</p>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-light rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-color-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">50%</p>
                            <p className="text-xs text-gray-500">{t("settings.billingPage.storageUsed")}</p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: "50%" }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">2.5 GB / 5 GB</p>
                </Card>
            </div>

            {/* Payment Method */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("settings.billingPage.paymentMethod")}</h3>
                            <p className="text-xs text-gray-500">{t("settings.billingPage.paymentMethodDesc")}</p>
                        </div>
                    </div>
                    <ReadOnlyGuard>
                        <Button variant="outline" size="sm">{t("settings.billingPage.addCard")}</Button>
                    </ReadOnlyGuard>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            {(displayMethod?.brand || 'VISA').toUpperCase()}
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">
                                &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; &bull;&bull;&bull;&bull; {displayMethod?.last4 || '4242'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {t("settings.billingPage.expiresOn", {
                                    date: displayMethod
                                        ? `${String(displayMethod.expiryMonth).padStart(2, '0')}/${displayMethod.expiryYear}`
                                        : "12/2028"
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {(displayMethod?.isDefault ?? true) && (
                            <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                {t("settings.billingPage.default")}
                            </span>
                        )}
                        <ReadOnlyGuard>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleManageSubscription}
                            >
                                {t("settings.billingPage.edit")}
                            </Button>
                        </ReadOnlyGuard>
                    </div>
                </div>
            </Card>

            {/* Invoices */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{t("settings.billingPage.invoiceHistory")}</h3>
                        <p className="text-xs text-gray-500">{t("settings.billingPage.invoiceHistoryDesc")}</p>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                        {t("settings.billingPage.downloadAll")}
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">{t("settings.billingPage.invoice")}</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">{t("settings.billingPage.date")}</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">{t("settings.billingPage.amount")}</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">{t("settings.billingPage.status")}</th>
                                <th className="text-right py-3 px-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 px-2 font-medium text-gray-900">{invoice.id}</td>
                                    <td className="py-3 px-2 text-gray-600">{invoice.date}</td>
                                    <td className="py-3 px-2 text-gray-900 font-semibold">{format(invoice.amount)}</td>
                                    <td className="py-3 px-2">
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                            {t("settings.billingPage.paid")}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        {invoice.pdfUrl ? (
                                            <a
                                                href={invoice.pdfUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-color-primary hover:text-color-primary text-sm font-medium inline-flex items-center"
                                            >
                                                <Download className="w-4 h-4 inline mr-1" />
                                                PDF
                                            </a>
                                        ) : (
                                            <button className="text-color-primary hover:text-color-primary text-sm font-medium">
                                                <Download className="w-4 h-4 inline mr-1" />
                                                PDF
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </SettingsLayout>
    );
}
