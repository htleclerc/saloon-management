'use client';

import { useState, useEffect } from 'react';
import { Plus, RefreshCw, Layers, ShieldCheck, Building, Users } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { PlanConfig } from '@/types';
import { getPlans, savePlans, resetPlans } from '@/lib/data/defaultPlans';
import PlanCard from '@/components/superadmin/plans/PlanCard';
import PlanModal from '@/components/superadmin/plans/PlanModal';

export default function SuperAdminPlansPage() {
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPlans();
    }, []);

    const loadPlans = () => {
        setIsLoading(true);
        const data = getPlans();
        // Sort by display order
        setPlans([...data].sort((a, b) => a.displayOrder - b.displayOrder));
        setIsLoading(false);
    };

    const handleCreatePlan = () => {
        setSelectedPlan(null);
        setIsModalOpen(true);
    };

    const handleEditPlan = (plan: PlanConfig) => {
        setSelectedPlan(plan);
        setIsModalOpen(true);
    };

    const handleSavePlan = (updatedPlan: PlanConfig) => {
        let newPlans: PlanConfig[];

        const existingIndex = plans.findIndex(p => p.id === updatedPlan.id);

        if (existingIndex > -1) {
            newPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
        } else {
            newPlans = [...plans, updatedPlan];
        }

        // If this plan is set as default, unset others
        if (updatedPlan.isDefault) {
            newPlans = newPlans.map(p => p.id !== updatedPlan.id ? { ...p, isDefault: false } : p);
        }

        savePlans(newPlans);
        loadPlans();
        setIsModalOpen(false);
    };

    const handleToggleStatus = (plan: PlanConfig) => {
        const updatedPlans = plans.map(p =>
            p.id === plan.id ? { ...p, isActive: !p.isActive } : p
        );
        savePlans(updatedPlans);
        loadPlans();
    };

    const handleDeletePlan = (planId: string) => {
        if (window.confirm('Are you sure you want to delete this plan? This may affect users. (Not recommended for system plans)')) {
            const updatedPlans = plans.filter(p => p.id !== planId);
            savePlans(updatedPlans);
            loadPlans();
        }
    };

    const handleResetToDefaults = () => {
        if (window.confirm('Reset all plans to factory defaults? All custom plans and modifications will be lost.')) {
            resetPlans();
            loadPlans();
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="p-2 bg-purple-600 rounded-xl shadow-lg shadow-purple-500/20">
                            <Layers className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Plan Management</h1>
                    </div>
                    <p className="text-gray-500 font-medium">Configure subscription tiers, limits and access rights for the entire platform.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleResetToDefaults}
                        className="rounded-2xl border-gray-200 bg-white text-gray-500 uppercase tracking-widest text-[10px] font-black h-12 px-6"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restore Defaults
                    </Button>
                    <Button
                        variant="primary"
                        onClick={handleCreatePlan}
                        className="rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 shadow-xl shadow-purple-500/25 h-12 px-8 uppercase tracking-widest text-[10px] font-black"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Create New Plan
                    </Button>
                </div>
            </div>

            {/* Stats / Info Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-l-4 border-l-green-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Plans</p>
                            <p className="text-2xl font-black text-gray-900">{plans.filter(p => p.isActive).length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-purple-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                            <Layers className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Tiers</p>
                            <p className="text-2xl font-black text-gray-900">{plans.length}</p>
                        </div>
                    </div>
                </Card>
                <Card className="border-l-4 border-l-amber-500">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                            <RefreshCw className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Sync Status</p>
                            <p className="text-sm font-bold text-amber-700">Demo persistence active</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Plans Grid */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50 rounded-[40px] border-4 border-dashed border-gray-100">
                    <RefreshCw className="w-12 h-12 text-purple-300 animate-spin mb-4" />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Synchronizing platform configurations...</p>
                </div>
            ) : plans.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                        <PlanCard
                            key={plan.id}
                            plan={plan}
                            onEdit={handleEditPlan}
                            onToggleStatus={handleToggleStatus}
                            onDelete={handleDeletePlan}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-white rounded-[40px] border-4 border-dashed border-gray-100 italic text-gray-400 font-medium">
                    No tiers configured. Click "Create New Plan" to start.
                </div>
            )}

            {/* Help / Docs Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-800 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full group-hover:bg-purple-600/20 transition-all duration-700" />
                    <h3 className="text-xl font-black mb-4 flex items-center gap-3">
                        <ShieldCheck className="w-6 h-6 text-purple-400" />
                        System Tiers Guide
                    </h3>
                    <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                        <p>
                            System tiers (<strong>free</strong>, <strong>pro</strong>, <strong>enterprise</strong>) are the backbone of the application's access control.
                            Modifying these will affect all tenants using these specific IDs.
                        </p>
                        <div className="grid grid-cols-2 gap-4 pt-4 font-bold">
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-[10px] text-purple-400 uppercase mb-1">New Tenants</p>
                                <p className="text-white">Assigned the "Default" marked plan immediately.</p>
                            </div>
                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                <p className="text-[10px] text-purple-400 uppercase mb-1">Enforcement</p>
                                <p className="text-white">Limits are checked during salon creation and booking.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-8 bg-white border-2 border-gray-100 rounded-[32px] shadow-sm">
                    <h3 className="text-xl font-black mb-6 text-gray-900">Platform Limits Logic</h3>
                    <div className="space-y-6">
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Building className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">Max Salons</p>
                                <p className="text-xs text-gray-500 mt-1">Controls the multi-salon dashboard access for owners and admins.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">Max Workers</p>
                                <p className="text-xs text-gray-500 mt-1">Limits how many staff profiles can be created per individual salon.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <RefreshCw className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800 text-sm">Monthly Resync</p>
                                <p className="text-xs text-gray-500 mt-1">Booking quotas are evaluated vs the current month's usage stats.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <PlanModal
                isOpen={isModalOpen}
                plan={selectedPlan}
                onSave={handleSavePlan}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
