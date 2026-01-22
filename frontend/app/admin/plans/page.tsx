'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Settings, Plus, Shield, TrendingUp, Users, Calendar, BarChart3, Code } from 'lucide-react';
import { getPlans, savePlans } from '@/lib/data/defaultPlans';
import { PlanConfig } from '@/types';
import PlanConfigCard from '@/components/admin/PlanConfigCard';
import PlanEditModal from '@/components/admin/PlanEditModal';

export default function AdminPlansPage() {
    const { isSuperAdmin } = useAuth();
    const router = useRouter();
    const [plans, setPlans] = useState<PlanConfig[]>([]);
    const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);

    useEffect(() => {
        // Redirect if not super admin
        if (!isSuperAdmin) {
            router.push('/');
            return;
        }

        // Load plans
        setPlans(getPlans());
    }, [isSuperAdmin, router]);

    const handleEditPlan = (plan: PlanConfig) => {
        setEditingPlan(plan);
    };

    const handleSavePlan = (updatedPlan: PlanConfig) => {
        const updatedPlans = plans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
        setPlans(updatedPlans);
        savePlans(updatedPlans);
        setEditingPlan(null);
    };

    const handleTogglePlan = (planId: string) => {
        const updatedPlans = plans.map(p =>
            p.id === planId ? { ...p, isActive: !p.isActive } : p
        );
        setPlans(updatedPlans);
        savePlans(updatedPlans);
    };

    const handleReset = () => {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser tous les plans aux valeurs par défaut?')) {
            localStorage.removeItem('plan_configs');
            setPlans(getPlans());
        }
    };

    if (!isSuperAdmin) {
        return null;
    }

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Plan Management</h1>
                            <p className="text-gray-600">Configure subscription plans and limits</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleReset}
                        >
                            <Settings className="w-4 h-4 mr-2" />
                            Reset to Defaults
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/settings/billing/upgrade')}
                        >
                            Preview Pricing Page
                        </Button>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-900">{plans.filter(p => p.isActive).length}</p>
                                <p className="text-xs text-blue-700">Active Plans</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center">
                                <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-900">
                                    {Math.max(...plans.map(p => p.limits.maxSalons).filter(x => x < 999))}
                                </p>
                                <p className="text-xs text-green-700">Max Salons (Non-unlimited)</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-purple-500 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-900">
                                    {Math.max(...plans.map(p => p.limits.maxBookingsPerMonth).filter(x => x < 99999))}
                                </p>
                                <p className="text-xs text-purple-700">Max Bookings/Month</p>
                            </div>
                        </div>
                    </Card>

                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-orange-500 flex items-center justify-center">
                                <Code className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-900">
                                    {plans.filter(p => p.limits.hasAPIAccess).length}
                                </p>
                                <p className="text-xs text-orange-700">Plans with API Access</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Plans Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map(plan => (
                        <PlanConfigCard
                            key={plan.id}
                            plan={plan}
                            onEdit={handleEditPlan}
                            onToggleActive={handleTogglePlan}
                        />
                    ))}
                </div>

                {/* Edit Modal */}
                <PlanEditModal
                    isOpen={editingPlan !== null}
                    plan={editingPlan}
                    onSave={handleSavePlan}
                    onClose={() => setEditingPlan(null)}
                />
            </div>
        </div>
    );
}
