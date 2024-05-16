import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Url from '@/models/Url';

export async function GET(req: Request, { params }: { params: { shortId: string } }) {
    await dbConnect();

    const { shortId } = params;

    const urlDoc = await Url.findOne({ shortId });

    if (!urlDoc) {
        return NextResponse.json({ error: 'URL not found' }, { status: 404 });
    }

    return NextResponse.redirect(urlDoc.originalUrl);
}
