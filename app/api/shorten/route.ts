import { NextResponse } from 'next/server';
import { createUrl, getUrlByLongUrl } from '@/services/urlService';
import { HttpStatusEnum } from '@/utils/httpStatusEnum';

export async function POST(req: Request) {
    try {
        const { longUrl, title, description, imageUrl } = await req.json();

        if (!longUrl) {
            return NextResponse.json({ error: 'URL is required' }, { status: HttpStatusEnum.BadRequest });
        }

        // 檢查是否已存在相同的長網址
        const existingUrl = await getUrlByLongUrl(longUrl);

        if (existingUrl) {
            // 如果已存在，返回已存在的短網址
            return NextResponse.json({ shortUrl: `${process.env.BASE_URL}/${existingUrl.shortUrl}` }, { status: HttpStatusEnum.OK });
        }

        // 如果不存在，創建新短網址
        const newUrl = await createUrl(longUrl, title, description, imageUrl);
        return NextResponse.json({ shortUrl: `${process.env.BASE_URL}/${newUrl.shortUrl}` }, { status: HttpStatusEnum.OK });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Failed to create URL', error.message);
            return NextResponse.json({ error: `Failed to create URL: ${error.message}` }, { status: HttpStatusEnum.InternalServerError });
        } else {
            console.error('An unknown error occurred while creating URL');
            return NextResponse.json({ error: 'An unknown error occurred while creating URL' }, { status: HttpStatusEnum.InternalServerError });
        }
    }
}
