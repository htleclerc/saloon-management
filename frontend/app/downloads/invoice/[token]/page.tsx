"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { tokenService } from "@/lib/services/TokenService";
import { invoiceService } from "@/lib/services/InvoiceService";
import { incomeService } from "@/lib/services";
import MainLayout from "@/components/layout/MainLayout";
import { FileText, CheckCircle, XCircle } from "lucide-react";
import Card from "@/components/ui/Card";
import { useTranslation } from "@/i18n";

export default function InvoiceDownloadPage() {
    const { t } = useTranslation();
    const { token } = useParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
    const [message, setMessage] = useState(t("downloads.verifyingSecureLink"));
    const processedRef = useRef(false);

    useEffect(() => {
        if (!token || processedRef.current) return;
        processedRef.current = true;

        const processDownload = async () => {
            try {
                // 1. Consume Token
                const payload = await tokenService.consumeToken(token as string);

                if (!payload || !payload.incomeId) {
                    setStatus('expired');
                    setMessage(t("downloads.linkExpiredMsg"));
                    return;
                }

                setStatus('success');
                setMessage(t("downloads.linkVerified"));

                // 2. Fetch Income Data
                const income = await incomeService.getWithRelations(payload.incomeId);

                if (!income) {
                    setStatus('error');
                    setMessage(t("downloads.downloadFailed"));
                    return;
                }

                // 3. Generate PDF
                setMessage(t("downloads.downloadingInvoice"));
                invoiceService.generatePdf(income);
                setMessage(t("downloads.downloadStarted"));
            } catch (error: any) {
                console.error("Download failed:", error);

                let errorMessage = t("downloads.errorProcessing");
                if (error instanceof Error) {
                    errorMessage = `${error.message}`;
                } else if (typeof error === 'string') {
                    errorMessage = error;
                }

                if (errorMessage.includes("permission denied")) {
                    errorMessage = t("downloads.dbPermissionError");
                }

                setStatus('error');
                setMessage(errorMessage);
            }
        };

        processDownload();
    }, [token]);

    return (
        <MainLayout>
            <div className="flex items-center justify-center min-h-[60vh]">
                <Card className="max-w-md w-full text-center p-8">
                    <div className="mb-6 flex justify-center">
                        {status === 'loading' && <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-color-primary"></div>}
                        {status === 'success' && <CheckCircle className="w-16 h-16 text-green-500" />}
                        {(status === 'error' || status === 'expired') && <XCircle className="w-16 h-16 text-red-500" />}
                    </div>

                    <h1 className="text-2xl font-bold mb-2">
                        {status === 'loading' && t("downloads.verifyingLink")}
                        {status === 'success' && t("downloads.downloadSuccessful")}
                        {status === 'error' && t("downloads.downloadFailed")}
                        {status === 'expired' && t("downloads.linkExpired")}
                    </h1>

                    <p className="text-gray-600 mb-6">
                        {message}
                    </p>

                    <div className="text-xs text-gray-400 mt-8">
                        {t("downloads.secureDownloads")}
                        <br />
                        <span className="flex items-center justify-center gap-1 mt-1">
                            <FileText className="w-3 h-3" /> {t("downloads.secureOneTimeLink")}
                        </span>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
