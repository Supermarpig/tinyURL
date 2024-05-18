import { NextResponse } from 'next/server';
import { getUrlByShortId } from '@/services/urlService';

export async function GET(req: Request, { params }: { params: { shortId: string } }) {
    const { shortId } = params;

    try {
        const urlDoc = await getUrlByShortId(shortId);

        if (!urlDoc) {
            return NextResponse.json({ error: 'URL not found' }, { status: 404 });
        }

        return NextResponse.json(urlDoc, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch URL', error);
        return NextResponse.json({ error: 'Failed to fetch URL' }, { status: 500 });
    }
}
