import { redirect } from 'next/navigation';
import RedirectPageClient from './RedirectPageClient';

interface MetadataProps {
    title: string;
    description: string;
    url: string;
    image: string;
}

interface RedirectPageProps {
    params: { shortId: string };
}

async function fetchMetadata(shortId: string): Promise<{ metadata: MetadataProps, longUrl: string } | null> {
    const res = await fetch(`${process.env.BASE_URL}/api/redirect/${shortId}`);

    if (res.ok) {
        const data = await res.json();
        return {
            metadata: {
                title: data.title || 'Tiny URL',
                description: data.description || 'Customizing your URLs for you.',
                url: `${process.env.BASE_URL}/${shortId}`,
                image: data.imageUrl || '/default-image.png',
            },
            longUrl: data.longUrl,
        };
    } else {
        return null;
    }
}

export async function generateMetadata({ params }: RedirectPageProps) {
    const { shortId } = params;
    const data = await fetchMetadata(shortId);

    if (!data) {
        redirect('/404');
    }

    return {
        title: data.metadata.title,
        description: data.metadata.description,
        openGraph: {
            type: 'website',
            url: data.metadata.url,
            title: data.metadata.title,
            description: data.metadata.description,
            images: [data.metadata.image],
        },
        twitter: {
            card: 'summary_large_image',
            url: data.metadata.url,
            title: data.metadata.title,
            description: data.metadata.description,
            image: data.metadata.image,
        },
    };
}

export default async function Page({ params }: RedirectPageProps) {
    const { shortId } = params;
    const data = await fetchMetadata(shortId);

    if (!data) {
        redirect('/404');
    }

    return (
        <RedirectPageClient metadata={data.metadata} longUrl={data.longUrl} />
    );
}
