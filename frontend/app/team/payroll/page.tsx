"use client";

import TeamLayout from "@/components/layout/TeamLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import StatCard from "@/components/ui/StatCard";
import { DollarSign, TrendingUp, CreditCard, FileText, Download, Calendar } from "lucide-react";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";

const payrollData = [
    { name: "Orphelia", baseSalary: 2000, commission: 1281, tips: 150, total: 3431, status: "paid" },
    { name: "Team Member 2", baseSalary: 1800, commission: 958, tips: 120, total: 2878, status: "pending" },
    { name: "Team Member 3", baseSalary: 1900, commission: 1020, tips: 100, total: 3020, status: "paid" },
    { name: "Team Member 4", baseSalary: 1700, commission: 810, tips: 80, total: 2590, status: "pending" },
    { name: "Team Member 5", baseSalary: 1600, commission: 587, tips: 60, total: 2247, status: "paid" },
    { name: "Team Member 6", baseSalary: 1850, commission: 1003, tips: 130, total: 2983, status: "pending" },
];

export default function TeamPayrollPage() {
    const { getCardStyle } = useKpiCardStyle();
    const totalPayroll = payrollData.reduce((sum, w) => sum + w.total, 0);
    const totalCommissions = payrollData.reduce((sum, w) => sum + w.commission, 0);
    const pendingPayments = payrollData.filter((w) => w.status === "pending").length;

    return (
        <TeamLayout
            title="Payroll"
            description="Manage salaries, commissions and payments"
        >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <StatCard
                    title="Total Payroll"
                    value={`€${totalPayroll.toLocaleString()}`}
                    subtitle="This month"
                    icon={DollarSign}
                    gradient=""
                    style={getCardStyle(0)}
                />
                <StatCard
                    title="Commissions"
                    value={`€${totalCommissions.toLocaleString()}`}
                    icon={TrendingUp}
                    gradient=""
                    style={getCardStyle(1)}
                />
                <StatCard
                    title="Pending Payments"
                    value={pendingPayments}
                    subtitle="Team"
                    icon={CreditCard}
                    gradient=""
                    style={getCardStyle(2)}
                />
                <StatCard
                    title="Payslips"
                    value={payrollData.length}
                    subtitle="generated"
                    icon={FileText}
                    gradient=""
                    style={getCardStyle(3)}
                />
            </div>

            {/* Payroll Table */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-primary-dark)] rounded-lg flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Salary Details</h3>
                            <p className="text-xs text-gray-500">January 2026</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                            <Calendar className="w-4 h-4" />
                            Period
                        </Button>
                        <Button variant="primary" size="sm">
                            <Download className="w-4 h-4" />
                            Export
                        </Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Team Member</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Base Salary</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Commissions</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Tips</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Total</th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payrollData.map((worker) => (
                                <tr key={worker.name} className="hover:bg-gray-50">
                                    <td className="px-4 py-4 font-medium text-gray-900">{worker.name}</td>
                                    <td className="px-4 py-4 text-right text-gray-600">€{worker.baseSalary.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-right text-[var(--color-success)] font-medium">+€{worker.commission.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-right text-[var(--color-primary)]">+€{worker.tips}</td>
                                    <td className="px-4 py-4 text-right font-bold text-gray-900">€{worker.total.toLocaleString()}</td>
                                    <td className="px-4 py-4 text-center">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.status === "paid" ? "bg-[var(--color-success-light)] text-[var(--color-success)]" : "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                                            }`}>
                                            {worker.status === "paid" ? "Paid" : "Pending"}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="outline" size="sm">
                                                <FileText className="w-4 h-4" />
                                            </Button>
                                            {worker.status === "pending" && (
                                                <Button variant="primary" size="sm">Pay</Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot className="bg-[var(--color-primary-light)]">
                            <tr>
                                <td className="px-4 py-4 font-bold text-[var(--color-primary)]">Total</td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    €{payrollData.reduce((sum, w) => sum + w.baseSalary, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    €{totalCommissions.toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
                                    €{payrollData.reduce((sum, w) => sum + w.tips, 0).toLocaleString()}
                                </td>
                                <td className="px-4 py-4 text-right font-bold text-[var(--color-primary)]">
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
                <h3 className="font-semibold text-gray-900 text-lg mb-4">Payment History</h3>
                <div className="space-y-3">
                    {[
                        { date: "31/12/2025", amount: 16500, workers: 6, status: "completed" },
                        { date: "30/11/2025", amount: 15800, workers: 6, status: "completed" },
                        { date: "31/10/2025", amount: 16200, workers: 6, status: "completed" },
                    ].map((payment, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900 text-sm">{payment.date}</p>
                                <p className="text-xs text-gray-500">Team: {payment.workers}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-gray-900">€{payment.amount.toLocaleString()}</p>
                                <span className="text-xs text-[var(--color-success)] font-medium">Completed</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </TeamLayout>
    );
}
