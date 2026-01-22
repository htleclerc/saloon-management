"use client";

import { useState } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { usePromoCode } from "@/context/PromoCodeProvider";
import { useAuth } from "@/context/AuthProvider";
import { Plus, Trash2, Tag, Check, X, Pencil } from "lucide-react";
import { ReadOnlyGuard, useReadOnlyGuard } from "@/components/guards/ReadOnlyGuard";

export default function PromosPage() {
    const { promoCodes, addPromoCode, updatePromoCode, deletePromoCode } = usePromoCode();
    const { canModify } = useAuth();
    const { handleReadOnlyClick } = useReadOnlyGuard();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    // Form State
    const [code, setCode] = useState("");
    const [type, setType] = useState<'percentage' | 'fixed'>("percentage");
    const [value, setValue] = useState(0);
    const [endDate, setEndDate] = useState("");
    const [affectWorkerShare, setAffectWorkerShare] = useState(true);

    const handleOpenModal = (promo?: any) => {
        if (handleReadOnlyClick()) return;
        if (promo) {
            setEditingId(promo.id);
            setCode(promo.code);
            setType(promo.type);
            setValue(promo.value);
            setEndDate(promo.endDate || "");
            setAffectWorkerShare(promo.affectWorkerShare !== undefined ? promo.affectWorkerShare : true);
        } else {
            setEditingId(null);
            setCode("");
            setType("percentage");
            setValue(0);
            setEndDate("");
            setAffectWorkerShare(true);
        }
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (handleReadOnlyClick()) return;
        if (!code || value <= 0) return;

        const promoData = {
            code: code.toUpperCase(),
            type,
            value,
            endDate: endDate || undefined,
            affectWorkerShare
        };

        if (editingId) {
            updatePromoCode(editingId, promoData);
        } else {
            addPromoCode(promoData);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
                    <p className="text-gray-500 text-sm">Manage discount codes for bookings</p>
                </div>
                <Button variant="primary" onClick={() => handleOpenModal()} disabled={!canModify} className="disabled:opacity-50">
                    <Plus className="w-4 h-4 mr-2" />
                    New Promo
                </Button>
            </div>

            <div className="grid gap-4">
                {promoCodes.map((promo) => (
                    <Card key={promo.id} className="flex justify-between items-center p-4">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${promo.isActive ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Tag className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg text-gray-900">{promo.code}</h3>
                                <p className="text-sm text-gray-500">
                                    {promo.type === 'percentage' ? `${promo.value}%` : `€${promo.value}`} discount
                                    {promo.usageCount > 0 && ` • Used ${promo.usageCount} times`}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => { if (!handleReadOnlyClick()) updatePromoCode(promo.id, { isActive: !promo.isActive }); }}
                                disabled={!canModify}
                                className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${promo.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'} disabled:opacity-50`}
                            >
                                {promo.isActive ? 'Active' : 'Inactive'}
                            </button>
                            <ReadOnlyGuard>
                                <button onClick={() => handleOpenModal(promo)} className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </ReadOnlyGuard>
                            <ReadOnlyGuard>
                                <button onClick={() => deletePromoCode(promo.id)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </ReadOnlyGuard>
                        </div>
                    </Card>
                ))}

                {promoCodes.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        <Tag className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>No promo codes created yet</p>
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <Card className="w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-xl font-bold">{editingId ? 'Edit Promo' : 'New Promo Code'}</h2>
                            <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-400" /></button>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                            <input
                                type="text"
                                value={code}
                                onChange={(e) => setCode(e.target.value.toUpperCase())}
                                disabled={!canModify}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold uppercase tracking-wider disabled:opacity-50"
                                placeholder="SUMMER2026"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select
                                    value={type}
                                    onChange={(e) => setType(e.target.value as any)}
                                    disabled={!canModify}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                >
                                    <option value="percentage">Percentage (%)</option>
                                    <option value="fixed">Fixed Amount (€)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                                <input
                                    type="number"
                                    value={value}
                                    onChange={(e) => setValue(Number(e.target.value))}
                                    disabled={!canModify}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-purple-500 font-bold disabled:opacity-50"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    disabled={!canModify}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="flex items-center pt-6">
                                <label className="flex items-center gap-2 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={affectWorkerShare}
                                        onChange={(e) => setAffectWorkerShare(e.target.checked)}
                                        disabled={!canModify}
                                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 disabled:opacity-50"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Affect Worker Share?</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                            <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" className="flex-1" onClick={handleSave} disabled={!canModify}>Save Code</Button>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
