import React from 'react';
import { PlanConfig } from '@/types';
import Button from '@/components/ui/Button';
import {
    Check,
    Edit2,
    Trash2,
    Users,
    Calendar,
    Building,
    BarChart3,
    Code,
    Power,
    PowerOff
} from 'lucide-react';

interface PlanCardProps {
    plan: PlanConfig;
    onEdit: (plan: PlanConfig) => void;
    onToggleStatus: (plan: PlanConfig) => void;
    onDelete: (planId: string) => void;
}

export default function PlanCard({ plan, onEdit, onToggleStatus, onDelete }: PlanCardProps) {
    const isFree = plan.price === 0;

    return (
        <div className={`bg-white rounded-3xl border-2 transition-all duration-300 flex flex-col overflow-hidden ${plan.isActive
                ? 'border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200'
                : 'border-dashed border-gray-200 opacity-75 grayscale-[0.5]'
            }`}>
            {/* Header */}
            <div className={`p-6 ${plan.isActive ? 'bg-gradient-to-br from-gray-50 to-white' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                            {plan.isDefault && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold uppercase rounded-full border border-purple-200">
                                    Default
                                </span>
                            )}
                            {!plan.isActive && (
                                <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold uppercase rounded-full">
                                    Inactive
                                </span>
                            )}
                        </div>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-3xl font-black text-gray-900">{plan.price}€</span>
                            <span className="text-gray-500 text-sm">/month</span>
                        </div>
                    </div>
                    <div className="flex gap-1">
                        <button
                            onClick={() => onEdit(plan)}
                            className="p-2 hover:bg-white rounded-xl text-gray-500 hover:text-purple-600 transition-colors border border-transparent hover:border-purple-100 shadow-sm"
                            title="Edit Plan"
                        >
                            <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onToggleStatus(plan)}
                            className={`p-2 rounded-xl border border-transparent shadow-sm transition-colors ${plan.isActive
                                    ? 'text-amber-500 hover:bg-amber-50 hover:border-amber-100'
                                    : 'text-green-500 hover:bg-green-50 hover:border-green-100'
                                }`}
                            title={plan.isActive ? "Deactivate Plan" : "Activate Plan"}
                        >
                            {plan.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                        </button>
                        {!plan.isDefault && (
                            <button
                                onClick={() => onDelete(plan.id)}
                                className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-600 transition-colors border border-transparent hover:border-red-100 shadow-sm"
                                title="Delete Plan"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Limits */}
            <div className="px-6 py-4 border-y border-gray-50 bg-white grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 group">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        <Building className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Salons</p>
                        <p className="text-sm font-bold text-gray-700">
                            {plan.limits.maxSalons === 999 ? 'Unlimited' : plan.limits.maxSalons}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 group">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Workers</p>
                        <p className="text-sm font-bold text-gray-700">
                            {plan.limits.maxWorkers === 999 ? 'Unlimited' : plan.limits.maxWorkers}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 group">
                    <div className="p-2 bg-amber-50 rounded-lg text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                        <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Bookings</p>
                        <p className="text-sm font-bold text-gray-700">
                            {plan.limits.maxBookingsPerMonth === 99999 ? 'Unlimited' : plan.limits.maxBookingsPerMonth}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 group">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                        <BarChart3 className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Reports</p>
                        <p className="text-sm font-bold text-gray-700">
                            {plan.limits.hasAdvancedReports ? 'Advanced' : 'Basic'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Features */}
            <div className="p-6 flex-1">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-3">Included Features</p>
                <ul className="space-y-2">
                    {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                            <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{feature}</span>
                        </li>
                    ))}
                    {plan.limits.hasAPIAccess && (
                        <li className="flex items-start gap-2 text-sm font-bold text-indigo-600 pt-1 border-t border-gray-50 mt-2">
                            <Code className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>Full API Access</span>
                        </li>
                    )}
                </ul>
            </div>

            {/* Footer */}
            <div className="p-4 bg-gray-50/50 mt-auto border-t border-gray-50 italic">
                <p className="text-[10px] text-gray-400 text-center">
                    Order: {plan.displayOrder} • ID: {plan.id}
                </p>
            </div>
        </div>
    );
}
