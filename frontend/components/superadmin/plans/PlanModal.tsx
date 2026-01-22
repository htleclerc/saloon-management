import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { X, Save, AlertCircle, BarChart3, Code, Info, Plus, Trash2, Globe } from 'lucide-react';
import { PlanConfig } from '@/types';

interface PlanModalProps {
    isOpen: boolean;
    plan: PlanConfig | null;
    onSave: (plan: PlanConfig) => void;
    onClose: () => void;
}

export default function PlanModal({ isOpen, plan, onSave, onClose }: PlanModalProps) {
    const [formData, setFormData] = useState<PlanConfig | null>(null);

    useEffect(() => {
        if (plan) {
            setFormData({ ...plan });
        } else {
            // Default values for a new plan
            setFormData({
                id: `plan_${Date.now()}`,
                name: '',
                price: 0,
                currency: 'EUR',
                limits: {
                    maxSalons: 1,
                    maxWorkers: 5,
                    maxBookingsPerMonth: 100,
                    hasAdvancedReports: false,
                    hasAPIAccess: false,
                },
                features: [],
                isActive: true,
                isDefault: false,
                displayOrder: 10,
            });
        }
    }, [plan, isOpen]);

    if (!isOpen || !formData) return null;

    const updateField = (field: string, value: any) => {
        setFormData({ ...formData, [field]: value });
    };

    const updateLimit = (field: string, value: number) => {
        setFormData({
            ...formData,
            limits: { ...formData.limits, [field]: value }
        });
    };

    const updateLimitBoolean = (field: string, value: boolean) => {
        setFormData({
            ...formData,
            limits: { ...formData.limits, [field]: value }
        });
    };

    const updateFeature = (index: number, value: string) => {
        const newFeatures = [...formData.features];
        newFeatures[index] = value;
        setFormData({ ...formData, features: newFeatures });
    };

    const addFeature = () => {
        setFormData({ ...formData, features: [...formData.features, ''] });
    };

    const removeFeature = (index: number) => {
        const newFeatures = formData.features.filter((_, i) => i !== index);
        setFormData({ ...formData, features: newFeatures });
    };

    const handleSave = () => {
        if (!formData.name) {
            alert('Plan name is required');
            return;
        }
        if (formData.price < 0) {
            alert('Price cannot be negative');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-white">
                            {plan ? `Edit Plan: ${plan.name}` : 'Create New Subscription Plan'}
                        </h2>
                        <p className="text-purple-100 text-sm opacity-80 mt-1">
                            Define limits, features and pricing for this tier.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all text-white"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-purple-600 mb-2">
                            <Info className="w-5 h-5" />
                            <h3 className="font-black uppercase tracking-wider text-xs">General Settings</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-1">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Plan Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Professional"
                                    value={formData.name}
                                    onChange={(e) => updateField('name', e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Monthly Price (€)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Display Order</label>
                                <input
                                    type="number"
                                    value={formData.displayOrder}
                                    onChange={(e) => updateField('displayOrder', parseInt(e.target.value) || 0)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-medium"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Limits Section */}
                    <div className="space-y-4 pt-4 border-t border-gray-50">
                        <div className="flex items-center gap-2 text-blue-600 mb-2">
                            <BarChart3 className="w-5 h-5" />
                            <h3 className="font-black uppercase tracking-wider text-xs">Access Limits</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Max Salons</label>
                                <input
                                    type="number"
                                    value={formData.limits.maxSalons}
                                    onChange={(e) => updateLimit('maxSalons', parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold"
                                    min="1"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 font-bold italic">Use 999 for unlimited</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Max Workers / Salon</label>
                                <input
                                    type="number"
                                    value={formData.limits.maxWorkers}
                                    onChange={(e) => updateLimit('maxWorkers', parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold"
                                    min="1"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 font-bold italic">Use 999 for unlimited</p>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Bookings / Month</label>
                                <input
                                    type="number"
                                    value={formData.limits.maxBookingsPerMonth}
                                    onChange={(e) => updateLimit('maxBookingsPerMonth', parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all font-bold"
                                    min="1"
                                />
                                <p className="text-[10px] text-gray-400 mt-1 font-bold italic">Use 99999 for unlimited</p>
                            </div>
                        </div>
                    </div>

                    {/* Features Sections & Toggles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-gray-50">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600 mb-2">
                                <Code className="w-5 h-5" />
                                <h3 className="font-black uppercase tracking-wider text-xs">Premium Features</h3>
                            </div>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 cursor-pointer group hover:border-purple-200 transition-all">
                                    <span className="text-sm font-bold text-gray-700">Advanced Analytics & Reports</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.limits.hasAdvancedReports}
                                        onChange={(e) => updateLimitBoolean('hasAdvancedReports', e.target.checked)}
                                        className="w-6 h-6 text-purple-600 rounded-lg focus:ring-purple-500 transition-all cursor-pointer"
                                    />
                                </label>
                                <label className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200 cursor-pointer group hover:border-purple-200 transition-all">
                                    <span className="text-sm font-bold text-gray-700">Full API Access (Developer Tools)</span>
                                    <input
                                        type="checkbox"
                                        checked={formData.limits.hasAPIAccess}
                                        onChange={(e) => updateLimitBoolean('hasAPIAccess', e.target.checked)}
                                        className="w-6 h-6 text-purple-600 rounded-lg focus:ring-purple-500 transition-all cursor-pointer"
                                    />
                                </label>
                            </div>

                            <div className="flex items-center gap-2 text-gray-600 pt-4">
                                <Globe className="w-5 h-5" />
                                <h3 className="font-black uppercase tracking-wider text-xs">Global Visibility</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isActive}
                                        onChange={(e) => updateField('isActive', e.target.checked)}
                                        className="w-5 h-5 text-green-600 rounded-md focus:ring-green-500"
                                    />
                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Active Plan</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.isDefault}
                                        onChange={(e) => updateField('isDefault', e.target.checked)}
                                        className="w-5 h-5 text-purple-600 rounded-md focus:ring-purple-500"
                                    />
                                    <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">Default Tier</span>
                                </label>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-amber-600 mb-2">
                                <Plus className="w-5 h-5" />
                                <h3 className="font-black uppercase tracking-wider text-xs">Included Features List</h3>
                            </div>
                            <div className="space-y-2">
                                {formData.features.map((feature, index) => (
                                    <div key={index} className="flex items-center gap-2 animate-in slide-in-from-left-2 duration-200">
                                        <div className="flex-1 relative">
                                            <input
                                                type="text"
                                                value={feature}
                                                onChange={(e) => updateFeature(index, e.target.value)}
                                                className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:border-purple-500 outline-none text-sm font-medium"
                                                placeholder="Feature description..."
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm shadow-green-200" />
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => removeFeature(index)}
                                            className="p-3 text-red-400 hover:text-red-600 bg-red-50 hover:bg-red-100 rounded-2xl transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    variant="outline"
                                    size="md"
                                    onClick={addFeature}
                                    className="w-full rounded-2xl border-dashed border-2 hover:border-purple-400 hover:bg-purple-50 hover:text-purple-600 font-bold"
                                >
                                    + Add Feature Description
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Operational Warning */}
                    <div className="bg-orange-50 border-l-4 border-orange-500 rounded-2xl p-6 flex items-start gap-4 shadow-sm">
                        <div className="p-2 bg-orange-100 rounded-xl">
                            <AlertCircle className="w-6 h-6 text-orange-600 flex-shrink-0" />
                        </div>
                        <div className="text-sm">
                            <p className="font-black text-orange-900 uppercase tracking-widest text-xs mb-1">Critical Change Warning</p>
                            <p className="text-orange-800 leading-relaxed font-medium">
                                Changes to subscription plans take effect immediately for all active tenants.
                                <span className="block mt-1 opacity-70 italic font-normal text-xs">
                                    Current modifications are stored in localStorage for the demo environment.
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="bg-gray-50 px-8 py-6 flex items-center justify-end gap-3 border-t border-gray-100">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="rounded-2xl border-gray-200 bg-white text-gray-600 font-black uppercase tracking-widest text-xs px-6 py-3"
                    >
                        Discard Changes
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        className="rounded-2xl shadow-xl shadow-purple-500/30 font-black uppercase tracking-widest text-xs px-8 py-3 flex items-center gap-2"
                    >
                        <Save className="w-4 h-4" />
                        Save Configuration
                    </Button>
                </div>
            </div>
        </div>
    );
}
