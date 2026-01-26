"use client";

import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FileText, Download } from "lucide-react";
import { useAuth } from "@/context/AuthProvider";
import { jsPDF } from "jspdf";

import React, { useState, useEffect } from "react";
import { incomeService } from "@/lib/services";

export default function ClientInvoicesPage() {
    const [incomes, setIncomes] = useState<any[]>([]);
    const { user, activeSalonId } = useAuth();

    useEffect(() => {
        if (activeSalonId) {
            incomeService.getAll(Number(activeSalonId)).then(setIncomes);
        }
    }, [activeSalonId]);

    const clientInvoices = incomes.filter(inc =>
        inc.status === 'Validated' &&
        (inc.clientName === user?.name || inc.clientId === parseInt(user?.id || '0'))
    );

    const handleDownloadInvoice = (income: any) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("INVOICE", 105, 20, { align: "center" });
        doc.setFontSize(12);
        doc.text(`Invoice #: INV-${income.id}`, 20, 40);
        doc.text(`Date: ${income.date}`, 20, 47);
        doc.text("BILLED TO:", 20, 65);
        doc.text(income.clientName, 20, 72);
        doc.line(20, 85, 190, 85);
        doc.text("DESCRIPTION", 20, 95);
        doc.text("TOTAL", 170, 95);
        doc.text("Salon Services", 20, 105);
        doc.text(`€${income.amount}`, 170, 105);
        doc.line(20, 115, 190, 115);
        doc.setFontSize(14);
        doc.text(`TOTAL DUE: €${income.amount}`, 170, 125, { align: "right" });
        doc.save(`Invoice_${income.id}.pdf`);
    };

    return (
        <MainLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Invoices</h1>
                    <p className="text-gray-500 mt-1">View and download your past service invoices</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clientInvoices.length === 0 ? (
                        <div className="col-span-full">
                            <Card className="p-8 text-center text-gray-500 italic">
                                You have no invoices available for download.
                            </Card>
                        </div>
                    ) : (
                        clientInvoices.map((inc) => (
                            <Card key={inc.id} className="p-6 flex flex-col gap-4 border-t-4 border-purple-500">
                                <div className="flex justify-between items-start">
                                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Amount</p>
                                        <p className="text-xl font-bold text-gray-900">€{inc.amount}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">Invoice #INV-{inc.id}</p>
                                    <p className="text-sm text-gray-500">{inc.date}</p>
                                </div>
                                <Button
                                    className="mt-2 w-full flex items-center justify-center gap-2"
                                    onClick={() => handleDownloadInvoice(inc)}
                                >
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </Button>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </MainLayout>
    );
}
