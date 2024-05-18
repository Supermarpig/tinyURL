'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Metadata {
    title: string;
    description: string;
    url: string;
    image: string;
}

interface RedirectPageClientProps {
    metadata: Metadata;
    longUrl: string;
}

export default function RedirectPageClient({ metadata, longUrl }: RedirectPageClientProps) {
    const router = useRouter();

    useEffect(() => {
        console.log('Redirecting to:', longUrl); // 调试日志
        router.replace(longUrl);
    }, [longUrl, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="flex flex-col items-center">
                <div className="loader animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500 mb-4"></div>
                <p className="text-xl text-gray-700">Redirecting...</p>
            </div>
        </div>
    );
}
