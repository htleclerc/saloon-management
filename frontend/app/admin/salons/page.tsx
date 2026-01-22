'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
    Building, Eye, Settings, Lock, CheckCircle,
    Search, Filter, ArrowUpDown, Users, Calendar, Shield
} from 'lucide-react';

interface Salon {
    id: string;
    name: string;
    owner: string;
    ownerEmail: string;
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'trial' | 'suspended' | 'expired';
    users: number;
    createdAt: string;
    lastActivity: string;
}

export default function AdminSalonsPage() {
    const { isSuperAdmin, enterReadOnlyMode, canManageSalon, exitReadOnlyMode, user, switchTenant } = useAuth();
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPlan, setFilterPlan] = useState<string>('all');
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        if (!isSuperAdmin) {
            router.push('/');
        }
    }, [isSuperAdmin, router]);

    if (!isSuperAdmin) return null;

    // Mock data - will be replaced with real API
    const mockSalons: Salon[] = [
        {
            id: 'salon-1',
            name: 'Salon Élégance Paris',
            owner: 'Marie Dubois',
            ownerEmail: 'marie@elegance-paris.fr',
            plan: 'pro',
            status: 'active',
            users: 12,
            createdAt: '2024-01-15',
            lastActivity: 'Il y a 2 heures'
        },
        {
            id: 'salon-2',
            name: 'Beauty Lounge Lyon',
            owner: 'Sophie Martin',
            ownerEmail: 'sophie@beauty-lounge.fr',
            plan: 'free',
            status: 'trial',
            users: 3,
            createdAt: '2024-03-20',
            lastActivity: 'Il y a 1 jour'
        },
        {
            id: 'salon-3',
            name: 'Premium Spa Nice',
            owner: 'Jean Dupont',
            ownerEmail: 'jean@premium-spa.fr',
            plan: 'enterprise',
            status: 'active',
            users: 45,
            createdAt: '2023-11-10',
            lastActivity: 'Il y a 30 minutes'
        },
        {
            id: 'salon-4',
            name: 'Coiffure Moderne',
            owner: 'Claire Bernard',
            ownerEmail: 'claire@coiffure-moderne.fr',
            plan: 'pro',
            status: 'active',
            users: 18,
            createdAt: '2024-02-05',
            lastActivity: 'Il y a 3 heures'
        },
        {
            id: 'test-lab-salon',
            name: '🧪 Test Lab (Gérable par Super Admin)',
            owner: 'Admin Test',
            ownerEmail: 'admin@test-lab.fr',
            plan: 'enterprise',
            status: 'active',
            users: 5,
            createdAt: '2024-01-01',
            lastActivity: 'Il y a 1 heure'
        },
    ];

    const getPlanBadge = (plan: string) => {
        const styles = {
            free: 'bg-gray-100 text-gray-700',
            pro: 'bg-purple-100 text-purple-700',
            enterprise: 'bg-amber-100 text-amber-700',
        };
        return styles[plan as keyof typeof styles] || styles.free;
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            active: 'bg-green-100 text-green-700',
            trial: 'bg-blue-100 text-blue-700',
            suspended: 'bg-red-100 text-red-700',
            expired: 'bg-gray-100 text-gray-700',
        };
        return styles[status as keyof typeof styles] || styles.active;
    };

    const handleViewSalon = (salon: Salon) => {
        // Enter read-only mode for this salon
        enterReadOnlyMode(salon.id, salon.name, salon.owner);
        router.push('/');
    };

    const handleManageSalon = (salon: Salon) => {
        // Check if super admin has manage rights
        if (!canManageSalon(salon.id)) {
            alert(`❌ Accès refusé\n\nVous n'avez pas les droits de gestion sur ce salon.\n\nPour obtenir l'accès, demandez au propriétaire (${salon.owner}) de vous ajouter comme administrateur.`);
            return;
        }

        // Exit read-only mode and switch to this salon as admin
        exitReadOnlyMode();
        switchTenant(salon.id);
        router.push('/');
    };

    const filteredSalons = mockSalons.filter(salon => {
        const matchesSearch = salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            salon.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
            salon.ownerEmail.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesPlan = filterPlan === 'all' || salon.plan === filterPlan;
        const matchesStatus = filterStatus === 'all' || salon.status === filterStatus;
        return matchesSearch && matchesPlan && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Gestion des Salons
                        </h1>
                        <p className="text-gray-600">
                            {filteredSalons.length} salon{filteredSalons.length > 1 ? 's' : ''} trouvé{filteredSalons.length > 1 ? 's' : ''}
                        </p>
                    </div>
                    <Button
                        variant="primary"
                        className="bg-gradient-to-r from-purple-600 to-pink-500"
                        onClick={() => router.push('/admin')}
                    >
                        ← Retour au Dashboard
                    </Button>
                </div>

                {/* Filters & Search */}
                <Card>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Rechercher par nom, propriétaire, email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        {/* Filter by Plan */}
                        <div>
                            <select
                                value={filterPlan}
                                onChange={(e) => setFilterPlan(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">Tous les plans</option>
                                <option value="free">Free</option>
                                <option value="pro">Pro</option>
                                <option value="enterprise">Enterprise</option>
                            </select>
                        </div>

                        {/* Filter by Status */}
                        <div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            >
                                <option value="all">Tous les statuts</option>
                                <option value="active">Actif</option>
                                <option value="trial">Trial</option>
                                <option value="suspended">Suspendu</option>
                                <option value="expired">Expiré</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Salons Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Salon</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Propriétaire</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Plan</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Statut</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Utilisateurs</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Créé le</th>
                                    <th className="text-left py-3 px-4 font-semibold text-gray-700">Activité</th>
                                    <th className="text-right py-3 px-4 font-semibold text-gray-700">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredSalons.map((salon) => (
                                    <tr key={salon.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                                    <Building className="w-5 h-5 text-purple-600" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{salon.name}</p>
                                                    <p className="text-xs text-gray-500">{salon.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <p className="font-medium text-gray-900">{salon.owner}</p>
                                            <p className="text-xs text-gray-500">{salon.ownerEmail}</p>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPlanBadge(salon.plan)}`}>
                                                {salon.plan.toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(salon.status)}`}>
                                                {salon.status}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Users className="w-4 h-4 text-gray-400" />
                                                <span className="font-semibold text-gray-900">{salon.users}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{salon.createdAt}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className="text-sm text-gray-600">{salon.lastActivity}</span>
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {/* View button - Always available in read-only mode */}
                                                <button
                                                    onClick={() => handleViewSalon(salon)}
                                                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors group"
                                                    title="Voir en mode lecture seule"
                                                >
                                                    <Eye className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                                </button>

                                                {/* Manage button - Only if super admin has rights */}
                                                <button
                                                    onClick={() => handleManageSalon(salon)}
                                                    className={`p-2 rounded-lg transition-colors group ${canManageSalon(salon.id)
                                                        ? 'hover:bg-green-50'
                                                        : 'hover:bg-gray-100 opacity-50'
                                                        }`}
                                                    title={
                                                        canManageSalon(salon.id)
                                                            ? "Gérer en tant qu'administrateur"
                                                            : "Vous n'avez pas les droits de gestion sur ce salon"
                                                    }
                                                >
                                                    <Shield className={`w-5 h-5 group-hover:scale-110 transition-transform ${canManageSalon(salon.id)
                                                        ? 'text-green-600'
                                                        : 'text-gray-400'
                                                        }`} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredSalons.length === 0 && (
                            <div className="text-center py-12">
                                <Building className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Aucun salon trouvé</p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    );
}
