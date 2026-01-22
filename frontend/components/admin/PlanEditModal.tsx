import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import { X, Save, AlertCircle, BarChart3, Code } from 'lucide-react';
import { PlanConfig } from '@/types';

interface PlanEditModalProps {
    isOpen: boolean;
    plan: PlanConfig | null;
    onSave: (plan: PlanConfig) => void;
    onClose: () => void;
}

export default function PlanEditModal({ isOpen, plan, onSave, onClose }: PlanEditModalProps) {
    const [formData, setFormData] = useState<PlanConfig | null>(null);

    useEffect(() => {
        if (plan) {
            setFormData({ ...plan });
        }
    }, [plan]);

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
        if (formData.price < 0) {
            alert('Le prix ne peut pas être négatif');
            return;
        }
        if (formData.limits.maxSalons <= 0) {
            alert('Le nombre de salons doit être supérieur à 0');
            return;
        }
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">Modifier le plan: {formData.name}</h2>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nom du plan
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => updateField('name', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Prix (€/mois)
                            </label>
                            <input
                                type="number"
                                value={formData.price}
                                onChange={(e) => updateField('price', parseFloat(e.target.value) || 0)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                min="0"
                                step="0.01"
                            />
                        </div>
                    </div>

                    {/* Limits */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5" />
                            Limites
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Salons max
                                </label>
                                <input
                                    type="number"
                                    value={formData.limits.maxSalons}
                                    onChange={(e) => updateLimit('maxSalons', parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    min="1"
                                />
                                <p className="text-xs text-gray-500 mt-1">999 = illimité</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employés max
                                </label>
                                <input
                                    type="number"
                                    value={formData.limits.maxWorkers}
                                    onChange={(e) => updateLimit('maxWorkers', parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    min="1"
                                />
                                <p className="text-xs text-gray-500 mt-1">999 = illimité</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Réservations/mois
                                </label>
                                <input
                                    type="number"
                                    value={formData.limits.maxBookingsPerMonth}
                                    onChange={(e) => updateLimit('maxBookingsPerMonth', parseInt(e.target.value) || 1)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                    min="1"
                                />
                                <p className="text-xs text-gray-500 mt-1">99999 = illimité</p>
                            </div>
                        </div>
                    </div>

                    {/* Feature Toggles */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            <Code className="w-5 h-5" />
                            Fonctionnalités avancées
                        </h3>
                        <div className="space-y-3">
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.limits.hasAdvancedReports}
                                    onChange={(e) => updateLimitBoolean('hasAdvancedReports', e.target.checked)}
                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Rapports avancés</span>
                            </label>
                            <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.limits.hasAPIAccess}
                                    onChange={(e) => updateLimitBoolean('hasAPIAccess', e.target.checked)}
                                    className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Accès API</span>
                            </label>
                        </div>
                    </div>

                    {/* Features List */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Liste des fonctionnalités</h3>
                        <div className="space-y-2">
                            {formData.features.map((feature, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={feature}
                                        onChange={(e) => updateFeature(index, e.target.value)}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        placeholder="Description de la fonctionnalité"
                                    />
                                    <button
                                        onClick={() => removeFeature(index)}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={addFeature}
                                className="w-full"
                            >
                                + Ajouter une fonctionnalité
                            </Button>
                        </div>
                    </div>

                    {/* Other Settings */}
                    <div className="grid grid-cols-2 gap-4">
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isActive}
                                onChange={(e) => updateField('isActive', e.target.checked)}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Plan actif</span>
                        </label>
                        <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.isDefault}
                                onChange={(e) => updateField('isDefault', e.target.checked)}
                                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Plan par défaut</span>
                        </label>
                    </div>

                    {/* Warning */}
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-800">
                            <strong>Attention:</strong> Les modifications prendront effet immédiatement pour tous les utilisateurs.
                            Les changements sont stockés localement en mode démo.
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose}>
                        Annuler
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleSave}
                        className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
                    >
                        <Save className="w-4 h-4 mr-2" />
                        Enregistrer
                    </Button>
                </div>
            </div>
        </div>
    );
}
