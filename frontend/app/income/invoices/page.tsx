"use client";

import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { FileText, Download, Search, Calendar, ArrowLeft } from "lucide-react";
import { useIncome } from "@/context/IncomeProvider";
import { jsPDF } from "jspdf";

import { useSearchParams } from "next/navigation";
import React, { Suspense } from "react";

function InvoicesContent() {
    const { incomes } = useIncome();
    const searchParams = useSearchParams();
    const searchId = searchParams.get('search');

    const validatedIncomes = incomes.filter(inc => {
        const isValidated = inc.status === 'Validated';
        if (!isValidated) return false;
        if (searchId) {
            return inc.id.toString().includes(searchId);
        }
        return true;
    });

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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="p-2.5 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Button>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Invoice Management</h1>
                            <p className="text-gray-500 mt-1">Manage and export client invoices</p>
                        </div>
                    </div>
                </div>

                <Card>
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by client or invoice number..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                defaultValue={searchId || ""}
                            />
                        </div>
                        <Button variant="outline" size="md">
                            <Calendar className="w-5 h-5 mr-2" />
                            Filter Date
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Invoice #</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {validatedIncomes.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-500 italic">No validated invoices found.</td>
                                    </tr>
                                ) : (
                                    validatedIncomes.map((inc) => (
                                        <tr key={inc.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-4 text-sm font-medium text-purple-600">#INV-{inc.id}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{inc.date}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{inc.clientName}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">€{inc.amount}</td>
                                            <td className="px-4 py-4 text-center">
                                                <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(inc)}>
                                                    <Download className="w-4 h-4 mr-1" /> PDF
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}

export default function InvoicesPage() {
    return (
        <Suspense fallback={<div className="p-8 text-center">Loading Invoices...</div>}>
            <InvoicesContent />
        </Suspense>
    );
}
