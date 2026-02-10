"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { ArrowLeft, Edit, Trash2, Calendar, Clock, User, Euro, CreditCard, Scissors, ShoppingBag, MessageSquare, FileText, Download, Archive } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { incomeService, serviceService, productService } from "@/lib/services";
import { invoiceService } from "@/lib/services/InvoiceService";
import { tokenService } from "@/lib/services/TokenService";
import { useTranslation } from "@/i18n";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthProvider";
import { ReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";
import { useConfirm } from "@/context/ConfirmProvider";
import { useToast } from "@/context/ToastProvider";
import { useActionPermissions } from "@/lib/permissions";
import { Users, Lock } from "lucide-react";

export default function IncomeDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const { t } = useTranslation();
    const auth = useAuth();
    const { activeSalonId, canModify, user } = auth;
    const { confirm } = useConfirm();
    const { showToast } = useToast();
    const permissions = useActionPermissions(auth);

    const handleDownloadInvoice = () => {
        if (!income) return;
        invoiceService.generatePdf(income);
    };
    const [income, setIncome] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [servicesList, setServicesList] = useState<any[]>([]);
    const [productsList, setProductsList] = useState<any[]>([]);
    const [downloadToken, setDownloadToken] = useState<string | null>(null);
    const [tokenError, setTokenError] = useState(false);

    useEffect(() => {
        if (!id || !activeSalonId) return;
        // ... fetch data
        const fetchData = async () => {
            try {
                const [incomeData, sList, pList] = await Promise.all([
                    incomeService.getWithRelations(Number(id)),
                    serviceService.getAll(Number(activeSalonId)),
                    productService.getAll(Number(activeSalonId))
                ]);
                setIncome(incomeData);
                setServicesList(sList);
                setProductsList(pList);

                if (incomeData && incomeData.status === 'Validated') {
                    console.log("[Debug] Attempting to create token for income:", incomeData.id);
                    try {
                        const token = await tokenService.createToken('invoice_download', { incomeId: incomeData.id });
                        console.log("[Debug] Token creation result:", token);

                        if (token) {
                            setDownloadToken(token);
                            setTokenError(false);
                        } else {
                            console.warn("[Debug] Token creation returned null");
                            setTokenError(true);
                        }
                    } catch (err) {
                        console.error("[Debug] Token creation threw error:", err);
                        setTokenError(true);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, activeSalonId]);

    const handleDelete = async () => {
        if (!income) return;

        const isArchive = income.status === 'Validated';
        const isConfirmed = await confirm({
            title: isArchive ? (t("income.archiveConfirmTitle") || "Archive Record?") : (t("income.deleteConfirmTitle") || "Delete Income?"),
            message: isArchive ? (t("income.archiveConfirmMessage") || "This will archive the income.") : (t("income.deleteConfirmMessage") || "This will set the status to Cancelled."),
            type: "warning",
            confirmText: isArchive ? (t("common.archive") || "Archive") : (t("common.delete") || "Delete"),
            cancelText: t("common.cancel")
        });

        if (isConfirmed) {
            try {
                if (isArchive) {
                    // For Validated: set status to 'Archived'
                    await incomeService.update(income.id, { status: 'Archived' as any });
                } else {
                    // For Draft/Pending: set status to 'Cancelled'
                    await incomeService.update(income.id, { status: 'Cancelled' as any });
                }
                showToast(t("common.success"), isArchive ? (t("income.archiveSuccess") || "Archived") : (t("income.deleteSuccess") || "Deleted"), "success");
                router.push("/income");
            } catch (error) {
                console.error("Failed to delete/archive", error);
                showToast(t("common.error"), isArchive ? (t("income.archiveError") || "Failed to archive") : (t("income.deleteError") || "Failed to delete"), "error");
            }
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="flex h-[50vh] items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
                </div>
            </MainLayout>
        );
    }

    if (!income) {
        return (
            <MainLayout>
                <div className="text-center py-12">
                    <h2 className="text-xl font-bold text-gray-700">{t("errors.notFound")}</h2>
                    <Button variant="outline" className="mt-4" onClick={() => router.push("/income")}>
                        {t("common.backToList")}
                    </Button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="space-y-6 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={() => router.back()}>
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{t("income.details")} #{income.id}</h1>
                            <p className="text-gray-500 text-sm">{format(new Date(income.date), "EEEE d MMMM yyyy")}</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        {/* Status-based delete/archive */}
                        {(income.status === 'Draft' || income.status === 'Pending') && (
                            <>
                                <ReadOnlyGuard>
                                    <Button
                                        variant="outline"
                                        className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {t("common.delete")}
                                    </Button>
                                </ReadOnlyGuard>
                                <ReadOnlyGuard>
                                    <Button
                                        variant="primary"
                                        onClick={() => router.push(`/income/add?edit=${income.id}`)}
                                    >
                                        <Edit className="w-4 h-4 mr-2" />
                                        {t("common.edit")}
                                    </Button>
                                </ReadOnlyGuard>
                            </>
                        )}
                        {income.status === 'Validated' && (
                            <ReadOnlyGuard>
                                <Button
                                    variant="outline"
                                    className="text-orange-500 hover:bg-orange-50 hover:text-orange-600 border-orange-200"
                                    onClick={handleDelete}
                                >
                                    <Archive className="w-4 h-4 mr-2" />
                                    {t("common.archive")}
                                </Button>
                            </ReadOnlyGuard>
                        )}
                    </div>
                </div>

                {/* Status Card */}
                <Card className={`border-l-4 ${income.status === 'Validated' ? 'border-green-500' : 'border-yellow-500'}`}>
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-sm font-bold text-gray-500 uppercase">{t("common.status")}</p>
                            <p className={`text-lg font-black ${income.status === 'Validated' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {income.status}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-gray-500 uppercase">{t("common.totalAmount")}</p>
                            <p className="text-3xl font-black text-purple-600">€{income.amount}</p>
                        </div>
                    </div>
                </Card>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Client Info */}
                    <Card>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-gray-400" />
                            {t("common.client")}
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-gray-500 uppercase font-bold">{t("common.name")}</p>
                                <p className="font-medium text-gray-900">{income.clientName || "Unknown"}</p>
                            </div>
                            {/* Add more client fields if available in income object */}
                        </div>
                    </Card>

                    {/* Payment Info */}
                    <Card>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            {t("common.payment")}
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <p className="text-xs text-gray-500 uppercase font-bold">{t("income.method")}</p>
                                <p className="font-medium text-gray-900 capitalize">{income.paymentMethod}</p>
                            </div>
                            {income.discountAmount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <p className="text-xs uppercase font-bold">{t("income.discount")}</p>
                                    <p className="font-bold">-€{income.discountAmount}</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Worker Split */}
                <Card className="border-l-4 border-l-pink-500">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-gray-400" />
                        {t("income.staffDetails")}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {(income.workers || income.workerShares)?.map((item: any, idx: number) => {
                            // Handle both IncomeWithRelations (item = { worker, share }) and flat structure (item = share)
                            const share = item.share || item;
                            const worker = item.worker || { id: share.workerId, name: share.workerName };

                            const canView = permissions.canViewSensitiveWorkerFinancials(worker.id);
                            return (
                                <div key={idx} className="p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200">
                                        <p className="font-bold text-gray-900">{worker.name || worker.firstName ? `${worker.firstName} ${worker.lastName}` : `Worker #${worker.id}`}</p>
                                        <span className="text-xs bg-gray-200 px-2 py-1 rounded-full font-medium">{share.percentage}%</span>
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">{t("income.service")} {t("team.share")}</span>
                                            {canView ? (
                                                <span className="font-mono font-bold text-gray-900">€{((share.amount || 0)).toFixed(2)}</span>
                                            ) : (
                                                <div className="flex items-center gap-1 text-gray-400 bg-gray-100 px-2 py-0.5 rounded text-xs select-none">
                                                    <Lock className="w-3 h-3" /> {t("common.secure")}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">{t("income.tips")}</span>
                                            {canView ? (
                                                <span className="font-mono font-bold text-emerald-600">+€{((share.tips || 0)).toFixed(2)}</span>
                                            ) : (
                                                <div className="flex items-center gap-1 text-gray-400 bg-gray-100 px-2 py-0.5 rounded text-xs select-none">
                                                    <Lock className="w-3 h-3" /> {t("common.secure")}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {canView && (
                                        <div className="pt-2 mt-auto border-t border-gray-200 flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase text-gray-400 border-gray-200">{t("common.total")}</span>
                                            <span className="font-black text-lg text-purple-700">€{((share.amount || 0) + (share.tips || 0)).toFixed(2)}</span>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Services */}
                    <Card>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Scissors className="w-5 h-5 text-gray-400" />
                            {t("services.title")}
                        </h3>
                        {income.serviceIds && income.serviceIds.length > 0 ? (
                            <div className="space-y-3">
                                {income.serviceIds.map((sId: number) => {
                                    const service = servicesList.find(s => s.id === sId);
                                    return (
                                        <div key={sId} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <span className="font-bold text-gray-900">{service?.name || `Service #${sId}`}</span>
                                            <span className="font-bold text-purple-600">€{service?.price || "?"}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-sm">{t("common.noData")}</p>
                        )}
                    </Card>

                    {/* Products */}
                    <Card>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-gray-400" />
                            {t("dashboard.expenseCategories.products")}
                        </h3>
                        {income.products && income.products.length > 0 ? (
                            <div className="space-y-3">
                                {income.products.map((p: any, idx: number) => {
                                    const product = p.product || productsList.find((prod: any) => prod.id === p.productId);
                                    const productName = product?.name || (p.name ? p.name : `Product #${p.productId || idx}`);
                                    const productPrice = product?.price || p.price || 0;

                                    return (
                                        <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                            <div>
                                                <p className="font-bold text-gray-900">{productName}</p>
                                                <p className="text-xs text-gray-500">x {p.quantity}</p>
                                            </div>
                                            <span className="font-bold text-purple-600">€{(productPrice * p.quantity).toFixed(2)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 italic text-sm">{t("common.noData")}</p>
                        )}
                    </Card>
                </div>

                {/* Notes */}
                <Card>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-gray-400" />
                        {t("common.notes")}
                    </h3>
                    {(income.notes || (income.comments && income.comments.length > 0)) ? (
                        <div className="space-y-4">
                            {income.notes && (
                                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 text-purple-900 text-sm whitespace-pre-wrap font-medium">
                                    <div className="flex items-center gap-2 mb-2 text-purple-700 font-bold uppercase text-[10px] tracking-wider">
                                        <MessageSquare size={12} /> {t("common.notes")}
                                    </div>
                                    {income.notes}
                                </div>
                            )}

                            {income.comments && income.comments.length > 0 && (
                                <div className="space-y-2">
                                    {income.comments.map((c: any, idx: number) => (
                                        <div key={idx} className="p-3 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-900 text-sm">
                                            <div className="flex justify-between items-center mb-1 text-[10px] font-bold text-yellow-700">
                                                <span>{c.user || "System"}</span>
                                                <span>{c.date}</span>
                                            </div>
                                            {c.text || c}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic text-sm">{t("common.noComments")}</p>
                    )}
                </Card>

                {/* Invoice Section */}
                {income.status === 'Validated' && (
                    <Card className="bg-blue-50 border-blue-200">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white rounded-xl shadow-sm border border-blue-100">
                                    {downloadToken ? (
                                        <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : ''}/downloads/invoice/${downloadToken}`} size={80} />
                                    ) : tokenError ? (
                                        <div className="flex flex-col items-center justify-center text-center">
                                            <span className="text-xs text-red-500 font-bold">Unavailable</span>
                                            <span className="text-[10px] text-gray-400">DB Setup Required</span>
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 bg-blue-100 animate-pulse rounded"></div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                        <FileText className="w-5 h-5" />
                                        {t("income.invoiceReady")}
                                    </h3>
                                    <p className="text-sm text-blue-600 mb-3">{t("income.scanQr")}</p>
                                    <Button onClick={handleDownloadInvoice} className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
                                        <Download className="w-4 h-4" />
                                        {t("income.downloadInvoice")}
                                    </Button>
                                    <p className="text-xs text-blue-400 mt-2 italic flex items-center gap-1">
                                        <FileText className="w-3 h-3" /> Secure One-Time Link
                                    </p>
                                </div>
                            </div>

                            <div className="text-right hidden md:block">
                                <p className="text-xs font-mono text-blue-400 mb-1">INVOICE ID</p>
                                <p className="text-xl font-black text-blue-900">#INV-{income.id}</p>
                            </div>
                        </div>
                    </Card>
                )}


                {/* Services Info - Reuse logic from add page if needed or just list IDs/Names if available */}
                {/* Note: income object structure depends on backend response. Assuming basic fields are there. */}
            </div>
        </MainLayout>
    );
}
