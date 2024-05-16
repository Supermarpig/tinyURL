import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Url from '@/models/Url';
import { nanoid } from 'nanoid';

export async function POST(req: Request) {
    await dbConnect();

    const { originalUrl } = await req.json();

    if (!originalUrl) {
        return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const shortId = nanoid(7);
    const newUrl = new Url({ originalUrl, shortId });
    await newUrl.save();

    return NextResponse.json({ shortUrl: `${process.env.BASE_URL}/${shortId}` }, { status: 200 });
}
