'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RedirectPage({ params }: { params: { shortId: string } }) {
    const router = useRouter();

    useEffect(() => {
        async function fetchUrl() {
            const res = await fetch(`/api/redirect/${params.shortId}`);
            if (res.ok) {
                const data = await res.json();
                router.replace(data.longUrl);
            } else {
                router.replace('/404'); // or another error page
            }
        }

        fetchUrl();
    }, [params.shortId, router]);

    return null; // This page does not render anything
}
