import { NextResponse } from 'next/server';
import { createUrl } from '@/services/urlService';
import { HttpStatusEnum } from '@/utils/httpStatusEnum';

export async function POST(req: Request) {
    const { longUrl, title, description, imageUrl } = await req.json();

    if (!longUrl) {
        return NextResponse.json({ error: 'URL is required' }, { status: HttpStatusEnum.BadRequest });
    }

    try {
        const newUrl = await createUrl(longUrl, title, description, imageUrl);
        return NextResponse.json({ shortUrl: `${process.env.BASE_URL}/${newUrl.shortUrl}` }, { status: HttpStatusEnum.OK });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create URL' }, { status: HttpStatusEnum.InternalServerError });
    }
}
