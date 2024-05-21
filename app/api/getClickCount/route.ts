import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Url from '@/models/Url';
import { HttpStatusEnum } from '@/utils/httpStatusEnum';

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (error) {
        console.error('Invalid request body:', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: HttpStatusEnum.BadRequest });
    }

    const { shortId }: { shortId: string } = body;

    if (!shortId) {
        console.error('ShortId is required');
        return NextResponse.json({ error: 'ShortId is required' }, { status: HttpStatusEnum.BadRequest });
    }

    await dbConnect();

    try {
        const url = await Url.findOne({ shortUrl: shortId });
        if (!url) {
            console.error('URL not found');
            return NextResponse.json({ error: 'URL not found' }, { status: HttpStatusEnum.NotFound });
        }

        return NextResponse.json({ clickCount: url.clickCount, createdAt: url.createdAt }, { status: HttpStatusEnum.OK });
    } catch (error) {
        console.error('Error fetching click count:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: HttpStatusEnum.InternalServerError });
    }
}
