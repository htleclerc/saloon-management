"use client";

import WorkersLayout from "@/components/layout/WorkersLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { DollarSign, TrendingUp, CreditCard, FileText, Download, Calendar } from "lucide-react";

const payrollData = [
    { name: "Orphelia", baseSalary: 2000, commission: 1281, tips: 150, total: 3431, status: "paid" },
    { name: "Worker 2", baseSalary: 1800, commission: 958, tips: 120, total: 2878, status: "pending" },
    { name: "Worker 3", baseSalary: 1900, commission: 1020, tips: 100, total: 3020, status: "paid" },
    { name: "Worker 4", baseSalary: 1700, commission: 810, tips: 80, total: 2590, status: "pending" },
    { name: "Worker 5", baseSalary: 1600, commission: 587, tips: 60, total: 2247, status: "paid" },
    { name: "Worker 6", baseSalary: 1850, commission: 1003, tips: 130, total: 2983, status: "pending" },
];

export default function WorkersPayrollPage() {
    const totalPayroll = payrollData.reduce((sum, w) => sum + w.total, 0);
    const totalCommissions = payrollData.reduce((sum, w) => sum + w.commission, 0);
    const pendingPayments = payrollData.filter((w) => w.status === "pending").length;

    return (
        <WorkersLayout
            title="Payroll"
            description="Gérez les salaires, commissions et paiements"
        >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Masse Salariale"
                    value={`€${totalPayroll.toLocaleString()}`}
                    subtitle="Ce mois"
                    icon={DollarSign}
                    gradient="bg-gradient-to-br from-purple-600 to-purple-700"
                />
                <StatCard
                    title="Commissions"
                    value={`€${totalCommissions.toLocaleString()}`}
                    icon={TrendingUp}
                    gradient="bg-gradient-to-br from-green-500 to-green-600"
                />
                <StatCard
                    title="Paiements en attente"
                    value={pendingPayments}
                    subtitle="travailleurs"
                    icon={CreditCard}
                    gradient="bg-gradient-to-br from-orange-500 to-orange-600"
                />
                <StatCard
                    title="Fiches de paie"
                    value={payrollData.length}
                    subtitle="générées"
                    icon={FileText}
                    gradient="bg-gradient-to-br from-blue-500 to-blue-600"
                />
            </div>

            {/* Payroll Table */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Détails des Salaires</h3>
                            <p className="text-xs text-gray-500">Janvier 2026</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Calendar className="w-4 h-4" />
                            Période
                        </Button>
                        <Button variant="primary" size="sm">
                            <Download className="w-4 h-4" />
                            Exporter
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Travailleur</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Salaire Base</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Commissions</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Pourboires</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Statut</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payrollData.map((worker) => (
                                <tr key={worker.name} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 font-medium text-gray-900">{worker.name}</td>
                                    <td className="px-4 py-4 text-right text-gray-600">€{worker.baseSalary.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-right text-green-600 font-medium">+€{worker.commission.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-right text-blue-600">+€{worker.tips}</td>
                                    <td className="px-4 py-4 text-right font-bold text-gray-900">€{worker.total.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.status === "paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                            }`}>
                                            {worker.status === "paid" ? "Payé" : "En attente"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm">
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                            {worker.status === "pending" && (
                                                <Button variant="primary" size="sm">Payer</Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-purple-50">
                            <tr>
                                <td className="px-4 py-4 font-bold text-purple-700">Total</td>
                                <td className="px-4 py-4 text-right font-bold text-purple-700">
                                    €{payrollData.reduce((sum, w) => sum + w.baseSalary, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-purple-700">
                                    €{totalCommissions.toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-purple-700">
                                    €{payrollData.reduce((sum, w) => sum + w.tips, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-purple-700">
                                    €{totalPayroll.toLocaleString()}
                                </td>
                                <td colSpan={2}></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </Card>

            {/* Payment History */}
            <Card>
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Historique des Paiements</h3>
                <div className="space-y-3">
                    {[
                        { date: "31/12/2025", amount: 16500, workers: 6, status: "completed" },
                        { date: "30/11/2025", amount: 15800, workers: 6, status: "completed" },
                        { date: "31/10/2025", amount: 16200, workers: 6, status: "completed" },
                    ].map((payment, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900 text-sm">{payment.date}</p>
                                <p className="text-xs text-gray-500">{payment.workers} travailleurs</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">€{payment.amount.toLocaleString()}</p>
                                <span className="text-xs text-green-600">Complété</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </WorkersLayout>
    );
}
