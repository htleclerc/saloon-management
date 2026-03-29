import { History, User, Clock, FileText } from "lucide-react";
import PaymentStatusBadge from "./PaymentStatusBadge";
import Card from "./Card";
import Button from "./Button";
import { useTranslation } from "@/i18n";
import { PaymentStatusHistory } from "@/lib/services/PayrollService";
import { formatDate } from "date-fns";

interface PaymentHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: PaymentStatusHistory[];
    paymentId: number;
    workerName?: string;
}

export default function PaymentHistoryModal({
    isOpen,
    onClose,
    history,
    paymentId,
    workerName,
}: PaymentHistoryModalProps) {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <History className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">{t("team.paymentHistory")}</h3>
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

                {/* Timeline */}
                <div className="flex-1 overflow-y-auto">
                    {history.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <History className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                            <p>{t("common.noData")}</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {history.map((entry, index) => (
                                <div key={entry.id} className="relative pl-8">
                                    {/* Timeline line */}
                                    {index < history.length - 1 && (
                                        <div className="absolute left-2 top-8 bottom-0 w-px bg-gray-200" />
                                    )}

                                    {/* Timeline dot */}
                                    <div className="absolute left-0 top-2 w-4 h-4 rounded-full bg-blue-500 border-4 border-white z-10" />

                                    {/* Content */}
                                    <div className="bg-gray-50 rounded-lg p-4 transition-all hover:shadow-sm border border-transparent hover:border-blue-100">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    {/* Action Type Badge/Label */}
                                                    {entry.metadata?.action === 'created' || (entry.previousStatus === null && !entry.metadata?.action) ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">
                                                            {t("team.paymentActions.created") || "Created"}
                                                        </span>
                                                    ) : entry.metadata?.action === 'modified' ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-700">
                                                            {t("team.paymentActions.modified") || "Modified"}
                                                        </span>
                                                    ) : entry.newStatus === 'approved' ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700">
                                                            {t("team.paymentStatuses.approved") || "Validated"}
                                                        </span>
                                                    ) : entry.previousStatus ? (
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-orange-100 text-orange-700">
                                                            {t("team.paymentActions.statusChange") || "Status Change"}
                                                        </span>
                                                    ) : null}

                                                    <div className="flex items-center gap-2">
                                                        {entry.previousStatus && (
                                                            <>
                                                                <PaymentStatusBadge status={entry.previousStatus} />
                                                                <span className="text-gray-400">→</span>
                                                            </>
                                                        )}
                                                        <PaymentStatusBadge status={entry.newStatus} />
                                                    </div>
                                                </div>

                                                {entry.metadata && typeof entry.metadata.amount === 'number' && (
                                                    <p className="text-xs font-semibold text-gray-700">
                                                        {t("common.amount")}: <span className="text-[var(--color-primary)]">${entry.metadata.amount}</span>
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-1 text-[11px] text-gray-500 bg-white px-2 py-1 rounded border border-gray-100 shadow-sm">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(new Date(entry.changedAt), 'dd/MM/yyyy HH:mm')}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            {entry.changedByName && (
                                                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center">
                                                        <User className="w-3 h-3 text-gray-500" />
                                                    </div>
                                                    <span className="font-medium text-gray-800">{entry.changedByName}</span>
                                                    {entry.changedByRole && (
                                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">
                                                            {entry.changedByRole.toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {entry.reason && (
                                            <div className="flex items-start gap-2 text-sm text-gray-700 mt-3 p-2 bg-white rounded border border-gray-200">
                                                <FileText className="w-4 h-4 mt-0.5 text-gray-400 flex-shrink-0" />
                                                <p className="italic text-gray-600 font-medium">
                                                    &quot;{entry.reason}&quot;
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
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
