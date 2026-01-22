'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { Shield } from 'lucide-react';

export default function SuperAdminDemoPage() {
    const router = useRouter();
    const { demoLogin } = useAuth();

    useEffect(() => {
        // Auto-login as super admin
        demoLogin('super_admin');

        // Redirect to admin dashboard after 1.5s
        setTimeout(() => {
            router.push('/admin/plans');
        }, 1500);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-600 via-red-500 to-orange-500">
            <div className="text-center text-white max-w-md px-6">
                <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-ping"></div>
                    <Shield className="w-20 h-20 mx-auto relative z-10 drop-shadow-2xl" strokeWidth={2.5} />
                </div>
                <h1 className="text-4xl font-bold mb-3 drop-shadow-lg">Super Admin Demo</h1>
                <p className="text-red-100 text-lg mb-2">Initializing super admin environment...</p>
                <div className="flex items-center justify-center gap-2 mt-6">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
            </div>
        </div>
    );
}
