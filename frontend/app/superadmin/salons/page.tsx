'use client';

import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Building2, Search, Eye, ChevronRight, Users, TrendingUp, Calendar, MapPin, Settings, Lock, AlertCircle, ChevronLeft } from 'lucide-react';

interface Salon {
    id: string;
    name: string;
    owner: string;
    address: string;
    createdAt: string;
    status: 'active' | 'inactive' | 'archived';
    users: number;
    monthlyRevenue: number;
    canManage: boolean;
}

export default function SuperAdminSalonsPage() {
    const { enterReadOnlyMode, enterManageMode } = useAuth();
    const router = useRouter();
    const [salons, setSalons] = useState<Salon[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'archived'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Mock data including inactive and archived salons
        setSalons([
            {
                id: 'salon-elegance-paris',
                name: 'Salon Élégance Paris',
                owner: 'Demo Owner',
                address: '123 Rue de la Paix, Paris',
                createdAt: '2024-01-15',
                status: 'active',
                users: 12,
                monthlyRevenue: 8500,
                canManage: true,
            },
            {
                id: 'salon-moderne-lyon',
                name: 'Coiffure Moderne Lyon',
                owner: 'Demo Owner',
                address: '45 Avenue des Champs, Lyon',
                createdAt: '2024-02-20',
                status: 'active',
                users: 8,
                monthlyRevenue: 5200,
                canManage: false,
            },
            {
                id: 'salon-retro-bordeaux',
                name: 'Rétro Barber Bordeaux',
                owner: 'Ancien Proprio',
                address: '12 Cours de l\'Intendance, Bordeaux',
                createdAt: '2023-11-10',
                status: 'inactive',
                users: 0,
                monthlyRevenue: 0,
                canManage: true,
            },
            {
                id: 'salon-ferme-marseille',
                name: 'Marseille Beauty (Archived)',
                owner: 'M. Jean',
                address: '50 Rue de Rome, Marseille',
                createdAt: '2023-05-01',
                status: 'archived',
                users: 0,
                monthlyRevenue: 0,
                canManage: false,
            },
            {
                id: 'salon-zen-strasbourg',
                name: 'Salon Zen Strasbourg',
                owner: 'Sarah Meyer',
                address: '15 Petite France, Strasbourg',
                createdAt: '2024-03-05',
                status: 'active',
                users: 5,
                monthlyRevenue: 3800,
                canManage: true,
            },
            {
                id: 'salon-urban-nantes',
                name: 'Urban Cut Nantes',
                owner: 'Marc Dupont',
                address: '8 Quai de la Fosse, Nantes',
                createdAt: '2024-03-12',
                status: 'active',
                users: 10,
                monthlyRevenue: 6100,
                canManage: false,
            },
            {
                id: 'salon-vintage-lille',
                name: 'Vintage Coiff Lille',
                owner: 'Julie Martin',
                address: '22 Rue Basse, Lille',
                createdAt: '2024-04-01',
                status: 'active',
                users: 4,
                monthlyRevenue: 2900,
                canManage: true,
            }
        ]);
    }, []);

    const handleAction = (salon: Salon, mode: 'view' | 'manage') => {
        setLoading(true);
        try {
            if (mode === 'manage') {
                if (!salon.canManage) {
                    alert("Manage rights for this salon are currently restricted. Contact the salon owner to grant access.");
                    return;
                }
                enterManageMode(salon.id, salon.name, salon.owner);
            } else {
                enterReadOnlyMode(salon.id, salon.name, salon.owner);
            }
            router.push('/');
        } catch (error) {
            console.error('Failed to enter salon:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSalons = salons.filter(salon => {
        const matchesSearch =
            salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            salon.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
            salon.address.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || salon.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredSalons.length / itemsPerPage);
    const paginatedSalons = filteredSalons.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="mb-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Manage Salons
                        </h1>
                        <p className="text-gray-600">
                            {filteredSalons.length} salon(s) match your filters
                        </p>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit">
                        {(['all', 'active', 'inactive', 'archived'] as const).map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setStatusFilter(status);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${statusFilter === status
                                    ? 'bg-white text-purple-600 shadow-sm'
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setCurrentPage(1);
                            }}
                            placeholder="Search salon, owner or address..."
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Salons List */}
            <div className="space-y-4">
                {paginatedSalons.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                        <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all' ? 'No salon found with current filters' : 'No salon registered'}
                        </p>
                    </div>
                ) : (
                    paginatedSalons.map((salon) => (
                        <div
                            key={salon.id}
                            className={`bg-white rounded-xl p-6 shadow-lg border transition-all ${salon.status === 'archived' ? 'opacity-75 grayscale-[0.3]' : ''
                                } hover:border-purple-400 border-gray-200`}
                        >
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                {/* Salon Info */}
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="p-3 bg-purple-100 rounded-xl">
                                            <Building2 className="w-6 h-6 text-purple-600" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-gray-900">
                                                    {salon.name}
                                                </h3>
                                                {!salon.canManage && (
                                                    <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded uppercase tracking-wider">
                                                        <Lock className="w-3 h-3" />
                                                        Restricted
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                By {salon.owner}
                                            </p>
                                        </div>
                                        <span
                                            className={`ml-auto px-3 py-1 rounded-full text-xs font-medium ${salon.status === 'active'
                                                ? 'bg-green-100 text-green-700'
                                                : salon.status === 'archived'
                                                    ? 'bg-red-100 text-red-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}
                                        >
                                            {salon.status.charAt(0).toUpperCase() + salon.status.slice(1)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <MapPin className="w-4 h-4" />
                                            {salon.address}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Users className="w-4 h-4" />
                                            {salon.users} user(s)
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4" />
                                            Created on {new Date(salon.createdAt).toLocaleDateString('en-US')}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                            {salon.monthlyRevenue.toLocaleString('en-US')}€
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            / month
                                        </span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-row lg:flex-col gap-2">
                                    <button
                                        onClick={() => handleAction(salon, 'view')}
                                        disabled={loading}
                                        className="flex-1 flex items-center justify-between gap-2 px-4 py-2 bg-white border border-purple-200 text-purple-600 rounded-xl hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed group lg:min-w-[140px]"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4" />
                                            <span className="font-medium text-sm">Visit</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </button>
                                    <button
                                        onClick={() => handleAction(salon, 'manage')}
                                        disabled={loading}
                                        className={`flex-1 flex items-center justify-between gap-2 px-4 py-2 rounded-xl transition-all group lg:min-w-[140px] ${salon.canManage
                                            ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:shadow-lg'
                                            : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {salon.canManage ? <Settings className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                                            <span className="font-medium text-sm">Manage</span>
                                        </div>
                                        {salon.canManage && <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 py-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1
                                ? 'bg-purple-600 text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
