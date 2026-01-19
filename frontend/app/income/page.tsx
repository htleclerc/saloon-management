"use client";

import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { Plus, Filter, Download, Calendar, BarChart2, MessageSquare, History, Check, X, CornerDownRight } from "lucide-react";
import { useKpiCardStyle } from "@/hooks/useKpiCardStyle";
import { useAuth } from "@/context/AuthProvider";
import { useState } from "react";

const incomes = [
    {
        id: 1,
        date: "2026-01-12",
        client: "Marie Dubois",
        service: "Box Braids",
        workers: ["Orphelia"],
        author: "Admin",
        amount: 120,
        status: "Validated",
        history: [
            { date: "2026-01-12 09:00", action: "Created", user: "Admin", comment: "" },
            { date: "2026-01-12 10:30", action: "Validated", user: "Admin", comment: "Auto-validated by admin" }
        ],
        comments: []
    },
    {
        id: 2,
        date: "2026-01-12",
        client: "Jean Martin",
        service: "Cornrows",
        workers: ["Worker 2", "Orphelia"],
        author: "Worker 2",
        amount: 85,
        status: "Pending",
        history: [
            { date: "2026-01-12 11:15", action: "Created", user: "Worker 2", comment: "" }
        ],
        comments: [
            { date: "2026-01-12 11:20", user: "Worker 2", text: "Difficult client, but everything went well." }
        ]
    },
    {
        id: 3,
        date: "2026-01-11",
        client: "Sophie Laurent",
        service: "Twists",
        workers: ["Orphelia"],
        author: "Orphelia",
        amount: 95,
        status: "Validated",
        history: [
            { date: "2026-01-11 14:00", action: "Created", user: "Orphelia", comment: "" },
            { date: "2026-01-11 15:45", action: "Validated", user: "Admin", comment: "" }
        ],
        comments: []
    },
    {
        id: 5,
        date: "2026-01-10",
        client: "Amélie Bernard",
        service: "Senegalese Twists",
        workers: ["Worker 2"],
        author: "Worker 2",
        amount: 110,
        status: "In Review",
        history: [
            { date: "2026-01-10 10:00", action: "Created", user: "Worker 2", comment: "" },
            { date: "2026-01-10 11:30", action: "Refused", user: "Worker 2", comment: "Wrong amount calculation" }
        ],
        comments: [
            { date: "2026-01-10 11:30", user: "Worker 2", text: "The base amount should be €120, not €110." }
        ]
    },
];

export default function IncomePage() {
    const { getCardStyle } = useKpiCardStyle();
    const { user, isWorker, getWorkerId } = useAuth();
    const workerId = getWorkerId();
    const [expandedRows, setExpandedRows] = useState<number[]>([]);

    const toggleRow = (id: number) => {
        setExpandedRows(prev =>
            prev.includes(id) ? prev.filter(rid => rid !== id) : [...prev, id]
        );
    };

    // Filter incomes for workers: entries they created or are involved in
    const filteredIncomes = isWorker
        ? incomes.filter(r => r.workers.includes(user?.name || "Orphelia") || r.author === user?.name)
        : incomes;

    const totalIncome = filteredIncomes.filter(r => r.status !== "Closed").reduce((sum, r) => sum + r.amount, 0);
    const validatedIncome = filteredIncomes.filter(r => r.status === "Validated").reduce((sum, r) => sum + r.amount, 0);
    const pendingIncome = filteredIncomes.filter(r => r.status === "Pending" || r.status === "In Review").reduce((sum, r) => sum + r.amount, 0);

    return (
        <MainLayout>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Income Management</h1>
                        <p className="text-gray-500 mt-1">Track and manage all income streams</p>
                    </div>
                    <div className="flex flex-nowrap gap-2">
                        <Link href="/income/dashboard">
                            <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50">
                                <BarChart2 className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Dashboard</span>
                            </Button>
                        </Link>
                        <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 md:mr-2" />
                            <span className="hidden md:inline">Export</span>
                        </Button>
                        <Link href="/income/add">
                            <Button variant="primary" size="sm">
                                <Plus className="w-4 h-4 md:mr-2" />
                                <span className="hidden md:inline">Add Income</span>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card className="text-white" style={getCardStyle(0)}>
                        <p className="text-sm opacity-90 mb-1">Total Income</p>
                        <h3 className="text-3xl font-bold">€{totalIncome.toLocaleString()}</h3>
                        <p className="text-sm opacity-80 mt-1">All transactions</p>
                    </Card>
                    <Card className="text-white" style={getCardStyle(1)}>
                        <p className="text-sm opacity-90 mb-1">Validated</p>
                        <h3 className="text-3xl font-bold">€{validatedIncome.toLocaleString()}</h3>
                        <p className="text-sm opacity-80 mt-1">{filteredIncomes.filter(r => r.status === "Validated").length} transactions</p>
                    </Card>
                    <Card className="text-white" style={getCardStyle(2)}>
                        <p className="text-sm opacity-90 mb-1">Pending/Review</p>
                        <h3 className="text-3xl font-bold">€{pendingIncome.toLocaleString()}</h3>
                        <p className="text-sm opacity-80 mt-1">{filteredIncomes.filter(r => r.status === "Pending" || r.status === "In Review").length} transactions</p>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex-1 min-w-[200px]">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="date"
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>
                        </div>
                        {!isWorker && (
                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Worker</label>
                                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                    <option value="">All Workers</option>
                                    <option value="orphelia">Orphelia</option>
                                    <option value="worker2">Worker 2</option>
                                    <option value="worker3">Worker 3</option>
                                </select>
                            </div>
                        )}
                        <div className={`flex-1 min-w-[200px] ${isWorker ? "md:max-w-xs" : ""}`}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500">
                                <option value="">All Status</option>
                                <option value="Validated">Validated</option>
                                <option value="Pending">Pending</option>
                                <option value="In Review">In Review</option>
                                <option value="Closed">Closed</option>
                            </select>
                        </div>
                        <div className="self-end">
                            <Button variant="outline" size="md">
                                <Filter className="w-5 h-5" />
                                Apply Filters
                            </Button>
                        </div>
                    </div>
                </Card>

                {/* Income Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">ID</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Client</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Service</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Workers</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Author</th>
                                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase w-48">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredIncomes.map((income) => (
                                    <>
                                        <tr key={income.id} className={`hover:bg-gray-50 transition cursor-pointer ${expandedRows.includes(income.id) ? 'bg-purple-50/30' : ''}`} onClick={() => toggleRow(income.id)}>
                                            <td className="px-4 py-4 text-sm text-gray-500">#{income.id}</td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.date}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                                                        {income.client.charAt(0)}
                                                    </div>
                                                    <span className="font-medium text-gray-900">{income.client}</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-900">{income.service}</td>
                                            <td className="px-4 py-4">
                                                <div className="flex flex-wrap gap-1">
                                                    {income.workers.map(w => (
                                                        <span key={w} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                            {w}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-500">{income.author}</td>
                                            <td className="px-4 py-4 text-right font-semibold text-gray-900">€{income.amount}</td>
                                            <td className="px-4 py-4 text-center">
                                                <span
                                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${income.status === "Validated"
                                                        ? "bg-[var(--color-success-light)] text-[var(--color-success)]"
                                                        : income.status === "Pending"
                                                            ? "bg-[var(--color-warning-light)] text-[var(--color-warning)]"
                                                            : income.status === "In Review"
                                                                ? "bg-[var(--color-error-light)] text-[var(--color-error)]"
                                                                : "bg-gray-100 text-gray-800"
                                                        }`}
                                                >
                                                    {income.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-center">
                                                <div className="flex flex-wrap items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                    {/* Admin Actions */}
                                                    {!isWorker && income.status !== "Validated" && income.status !== "Closed" && (
                                                        <button className="text-[var(--color-success)] hover:opacity-80 text-xs font-bold uppercase tracking-wider">Validate</button>
                                                    )}

                                                    {/* Worker Actions */}
                                                    {isWorker && income.status === "Pending" && (
                                                        <>
                                                            {income.workers.includes(user?.name || "Orphelia") && income.author !== (user?.name || "Orphelia") && (
                                                                <>
                                                                    <button className="text-[var(--color-success)] hover:opacity-80 text-xs font-bold">Accept</button>
                                                                    <button className="text-[var(--color-error)] hover:opacity-80 text-xs font-bold">Refuse</button>
                                                                    <button className="text-[var(--color-warning)] hover:opacity-80 text-xs font-bold">Withdraw</button>
                                                                </>
                                                            )}
                                                            {income.author === (user?.name || "Orphelia") && (
                                                                <Link href={`/income/edit/${income.id}`}>
                                                                    <button className="text-purple-600 hover:text-purple-800 text-xs font-bold">Edit</button>
                                                                </Link>
                                                            )}
                                                        </>
                                                    )}

                                                    {/* Correction Request (72h - simulated) */}
                                                    {income.status === "Validated" && (
                                                        <button className="text-purple-600 hover:text-purple-800 text-xs font-medium">Correction</button>
                                                    )}

                                                    {/* History toggle (icon) */}
                                                    <button className="text-gray-400 hover:text-gray-600" onClick={() => toggleRow(income.id)}>
                                                        <History className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                        {/* Expanded Row: History & Comments */}
                                        {expandedRows.includes(income.id) && (
                                            <tr className="bg-gray-50/50">
                                                <td colSpan={9} className="px-8 py-6 border-b border-gray-100">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                        {/* Workflow History */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                                                                <History className="w-4 h-4" />
                                                                Workflow History
                                                            </div>
                                                            <div className="space-y-4 relative before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
                                                                {income.history?.map((event, idx) => (
                                                                    <div key={idx} className="relative pl-8">
                                                                        <div className={`absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${event.action === 'Created' ? 'bg-[var(--color-info)]' :
                                                                            event.action === 'Validated' ? 'bg-[var(--color-success)]' :
                                                                                event.action === 'Refused' ? 'bg-[var(--color-error)]' : 'bg-gray-400'
                                                                            }`}>
                                                                            {event.action === 'Validated' && <Check className="w-2.5 h-2.5 text-white" />}
                                                                            {event.action === 'Refused' && <X className="w-2.5 h-2.5 text-white" />}
                                                                        </div>
                                                                        <div className="text-xs text-gray-500">{event.date}</div>
                                                                        <div className="text-sm">
                                                                            <span className="font-bold text-gray-900">{event.action}</span> by <span className="font-medium text-purple-600">{event.user}</span>
                                                                        </div>
                                                                        {event.comment && (
                                                                            <div className="mt-1 text-sm text-gray-600 italic">"{event.comment}"</div>
                                                                        )}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Comments Section */}
                                                        <div>
                                                            <div className="flex items-center gap-2 mb-4 text-sm font-bold text-gray-700 uppercase tracking-wider">
                                                                <MessageSquare className="w-4 h-4" />
                                                                Comments
                                                            </div>
                                                            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-2">
                                                                {income.comments?.length === 0 ? (
                                                                    <p className="text-sm text-gray-400 italic">No comments yet.</p>
                                                                ) : (
                                                                    income.comments?.map((comment, idx) => (
                                                                        <div key={idx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                                            <div className="flex justify-between items-center mb-1">
                                                                                <span className="text-xs font-bold text-purple-600">{comment.user}</span>
                                                                                <span className="text-[10px] text-gray-400">{comment.date}</span>
                                                                            </div>
                                                                            <p className="text-sm text-gray-700">{comment.text}</p>
                                                                        </div>
                                                                    ))
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <input
                                                                    type="text"
                                                                    placeholder="Add a comment..."
                                                                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                                                />
                                                                <Button variant="primary" size="sm">Send</Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </MainLayout>
    );
}
