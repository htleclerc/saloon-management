import React from 'react';
import { CreditCard, Calendar, Clock, FileText } from "lucide-react";
import PaymentStatusBadge from "./PaymentStatusBadge";
import Card from "./Card";
import Button from "./Button";
import { useTranslation } from "@/i18n";
import { SalaryPayment } from "@/lib/services/PayrollService";
import { formatDate } from "date-fns";
import { useCurrency } from "@/hooks/useCurrency";

interface WorkerPaymentsModalProps {
    isOpen: boolean;
    onClose: () => void;
    payments: SalaryPayment[];
    workerName?: string;
}

export default function WorkerPaymentsModal({
    isOpen,
    onClose,
    payments,
    workerName,
}: WorkerPaymentsModalProps) {
    const { t } = useTranslation();
    const { format } = useCurrency();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <CreditCard className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("team.paymentDetails") || "Payment Details"}</h3>
                            {workerName && (
                                <p className="text-xs text-gray-500">{workerName}</p>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-y-auto">
                    {payments.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <CreditCard className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>{t("common.noData")}</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50 sticky top-0">
                                    <tr className="border-b">
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t("common.date")}</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-right">{t("common.amount")}</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase text-center">{t("common.status")}</th>
                                        <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase">{t("team.notes") || "Notes"}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-4 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    {formatDate(new Date(payment.paidDate), 'dd/MM/yyyy')}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm font-bold text-gray-900 text-right">
                                                {format(payment.paidAmount)}
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <PaymentStatusBadge status={payment.status || 'pending'} />
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500 italic max-w-xs truncate">
                                                <div className="flex items-center gap-1.5">
                                                    <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                                                    {payment.notes || '-'}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end mt-4 pt-4 border-t">
                    <Button variant="outline" onClick={onClose}>
                        {t("common.close")}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
