import { Metadata } from 'next';
import { getUrlByShortId } from '@/services/urlService';

interface HeadProps {
    params: { shortId: string };
}

export async function generateMetadata({ params }: HeadProps): Promise<Metadata> {
    const { shortId } = params;
    const urlDoc = await getUrlByShortId(shortId);

    if (urlDoc) {
        return {
            title: urlDoc.title || 'Tiny URL',
            description: urlDoc.description || 'Customizing your URLs for you.',
            openGraph: {
                type: 'website',
                url: `${process.env.BASE_URL}/${shortId}`,
                title: urlDoc.title || 'Tiny URL',
                description: urlDoc.description || 'Customizing your URLs for you.',
                images: [
                    {
                        url: urlDoc.imageUrl || '/default-image.png',
                        width: 800,
                        height: 600,
                        alt: 'Tiny URL Image',
                    },
                ],
            },
        };
    }

    return {
        title: 'URL Not Found',
        description: 'The URL you are looking for does not exist.',
    };
}
