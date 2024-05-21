'use client';

import { useEffect, useRef } from 'react';
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
    shortId: string;
}

async function trackClick(shortId: string) {
    const baseUrl = process.env.BASE_URL;
    await fetch(`${baseUrl}/api/trackClick`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ shortId }),
    });
}

export default function RedirectPageClient({ longUrl, shortId }: RedirectPageClientProps) {
    const router = useRouter();
    const hasTracked = useRef(false);

    useEffect(() => {
        if (!hasTracked.current) {
            hasTracked.current = true;
            trackClick(shortId).then(() => {
                router.replace(longUrl);
            });
        }
    }, [shortId, longUrl, router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="flex flex-col items-center pixel-art-border p-8 bg-white">
                <div className="loader animate-spin rounded-full h-32 w-32 border-t-4 border-pixel-green mb-4"></div>
                <p className="text-xl text-gray-700 pixel-art-font">Redirecting...</p>
            </div>
        </div>
    );
}
