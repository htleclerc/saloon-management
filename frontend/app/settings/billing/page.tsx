"use client";

import SettingsLayout from "@/components/layout/SettingsLayout";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { CreditCard, Download, CheckCircle, Star, TrendingUp, Zap } from "lucide-react";

const invoices = [
    { id: "INV-2026-001", date: "01/01/2026", amount: "€29.00", status: "Payée" },
    { id: "INV-2025-012", date: "01/12/2025", amount: "€29.00", status: "Payée" },
    { id: "INV-2025-011", date: "01/11/2025", amount: "€29.00", status: "Payée" },
];

export default function BillingSettingsPage() {
    return (
        <SettingsLayout
            title="Billing & Subscription"
            description="Gérez votre abonnement, méthodes de paiement et factures"
        >
            {/* Current Plan */}
            <Card className="bg-gradient-to-br from-purple-600 to-purple-800 text-white border-0">
                <div className="flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-5 h-5 text-yellow-400" />
                            <span className="text-sm font-medium text-purple-200">Plan actuel</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-1">Workshop Pro</h3>
                        <p className="text-purple-200 text-sm mb-4">€29/mois • Renouvelé le 01/02/2026</p>
                        <div className="flex gap-3">
                            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                                Changer de plan
                            </Button>
                            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
                                Annuler l'abonnement
                            </Button>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-bold">€29</p>
                        <p className="text-purple-200 text-sm">/mois</p>
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
                            <p className="text-2xl font-bold text-gray-900">247</p>
                            <p className="text-xs text-gray-500">Prestations ce mois</p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "75%" }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">247 / 500 inclus</p>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                            <Zap className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">12</p>
                            <p className="text-xs text-gray-500">Travailleurs actifs</p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-green-500 rounded-full" style={{ width: "60%" }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">12 / 20 inclus</p>
                </Card>
                <Card>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <CheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-gray-900">50%</p>
                            <p className="text-xs text-gray-500">Stockage utilisé</p>
                        </div>
                    </div>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: "50%" }}></div>
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
                            <h3 className="font-semibold text-gray-900">Méthode de paiement</h3>
                            <p className="text-xs text-gray-500">Gérez vos cartes de paiement</p>
                        </div>
                    </div>
                    <Button variant="outline" size="sm">Ajouter une carte</Button>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-10 bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                            VISA
                        </div>
                        <div>
                            <p className="font-medium text-gray-900 text-sm">•••• •••• •••• 4242</p>
                            <p className="text-xs text-gray-500">Expire 12/2028</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            Par défaut
                        </span>
                        <Button variant="outline" size="sm">Modifier</Button>
                    </div>
                </div>
            </Card>

            {/* Invoices */}
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-lg">Historique des factures</h3>
                        <p className="text-xs text-gray-500">Téléchargez vos factures précédentes</p>
                    </div>
                    <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                        Tout télécharger
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Facture</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Date</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Montant</th>
                                <th className="text-left py-3 px-2 text-xs font-medium text-gray-500 uppercase">Statut</th>
                                <th className="text-right py-3 px-2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {invoices.map((invoice) => (
                                <tr key={invoice.id} className="border-b border-gray-50 hover:bg-gray-50">
                                    <td className="py-3 px-2 font-medium text-gray-900">{invoice.id}</td>
                                    <td className="py-3 px-2 text-gray-600">{invoice.date}</td>
                                    <td className="py-3 px-2 text-gray-900 font-semibold">{invoice.amount}</td>
                                    <td className="py-3 px-2">
                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                            {invoice.status}
                                        </span>
                                    </td>
                                    <td className="py-3 px-2 text-right">
                                        <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                                            <Download className="w-4 h-4 inline mr-1" />
                                            PDF
                                        </button>
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
