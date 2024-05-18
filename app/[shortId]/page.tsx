import { notFound } from 'next/navigation';
import Head from 'next/head';
import { Metadata } from 'next';
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

export default async function Page({ params }: RedirectPageProps) {
    const { shortId } = params;
    const data = await fetchMetadata(shortId);

    if (!data) {
        notFound();
    }

    return (
        <>
            <Head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>{data.metadata.title}</title>
                <meta name="description" content={data.metadata.description} />
                <meta property="og:type" content="website" />
                <meta property="og:url" content={data.metadata.url} />
                <meta property="og:title" content={data.metadata.title} />
                <meta property="og:description" content={data.metadata.description} />
                <meta property="og:image" content={data.metadata.image} />
            </Head>
            <RedirectPageClient metadata={data.metadata} longUrl={data.longUrl} />
        </>
    );
}
