'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage({ params }: { params: { shortId: string } }) {
    const router = useRouter();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUrl() {
            const res = await fetch(`/api/redirect/${params.shortId}`);
            if (res.ok) {
                const data = await res.json();
                router.replace(data.longUrl);
            } else {
                router.replace('/404'); // or another error page
            }
            setLoading(false);
        }

        fetchUrl();
    }, [params.shortId, router]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            {loading && (
                <div className="flex flex-col items-center">
                    <div className="loader animate-spin rounded-full h-32 w-32 border-t-4 border-blue-500 mb-4"></div>
                    <p className="text-xl text-gray-700">Redirecting...</p>
                </div>
            )}
        </div>
    );
}
