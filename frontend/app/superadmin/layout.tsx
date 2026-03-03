'use client';

import MainLayout from '@/components/layout/MainLayout';
import { useAuth } from '@/context/AuthProvider';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Shield, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function SuperAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSuperAdmin, isDemoMode, isLoading } = useAuth();
    const router = useRouter();
    const [mounted, setMounted] = useState(false);
    const [password, setPassword] = useState('');
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Check session storage for existing authorization
        const auth = sessionStorage.getItem('superadmin_authorized');
        if (auth === 'true') {
            setIsAuthorized(true);
        }
    }, []);

    useEffect(() => {
        if (mounted && !isLoading && !isSuperAdmin) {
            router.push('/');
        }
    }, [isSuperAdmin, isLoading, mounted, router]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        // Placeholder password for demo mode
        if (password === 'admin123') {
            setIsAuthorized(true);
            sessionStorage.setItem('superadmin_authorized', 'true');
            setError(false);
        } else {
            setError(true);
            setTimeout(() => setError(false), 3000);
        }
    };

    if (!mounted || isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium animate-pulse text-sm">Validating administrative credentials...</p>
                </div>
            </div>
        );
    }

    if (!isSuperAdmin) {
        return null;
    }

    // Protection for Demo Mode
    if (isDemoMode && !isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-purple-100 p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Restricted Access</h1>
                    <p className="text-gray-600 mb-8 text-sm">
                        Please enter the administrator password to access the SaaS management dashboard.
                    </p>

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter password..."
                                className={`w-full pl-12 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${error ? 'border-red-500 bg-red-50' : 'border-gray-200'
                                    }`}
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-red-600 text-xs font-medium animate-shake">
                                <AlertCircle className="w-4 h-4" />
                                <span>Invalid password. Please try again.</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-purple-200 flex items-center justify-center gap-2 group"
                        >
                            Confirm Access
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <button
                        onClick={() => router.push('/')}
                        className="mt-6 text-sm text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        Go back to main dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <MainLayout>
            {children}
        </MainLayout>
    );
}
