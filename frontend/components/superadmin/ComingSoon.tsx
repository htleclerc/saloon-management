'use client';

import { Construction, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function GenericComingSoonPage({ title }: { title: string }) {
    const router = useRouter();

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6">
                <Construction className="w-10 h-10 text-purple-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-600 max-w-md mb-8">
                This feature is currently under development. It will allow you to manage the global configuration of the SaaS platform.
            </p>
            <button
                onClick={() => router.back()}
                className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
                <ArrowLeft className="w-4 h-4" />
                Go Back
            </button>
        </div>
    );
}
