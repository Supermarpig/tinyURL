import { NextResponse } from 'next/server';
import { createUrl, getUrlByLongUrl, updateUrl } from '@/services/urlService';
import { HttpStatusEnum } from '@/utils/httpStatusEnum';
import { validateUrl } from '@/utils/validateUrl';

export async function POST(req: Request) {
    try {
        const { longUrl, title, description, imageUrl } = await req.json();

        if (!longUrl) {
            return NextResponse.json({ error: 'URL is required' }, { status: HttpStatusEnum.BadRequest });
        }

        // 檢查 URL 是否可連接
        const isValidUrl = await validateUrl(longUrl);
        if (!isValidUrl) {
            return NextResponse.json({ error: 'Invalid or unreachable URL' }, { status: HttpStatusEnum.BadRequest });
        }


        // 檢查是否已存在相同的長網址
        const existingUrl = await getUrlByLongUrl(longUrl);

        if (existingUrl) {
            // 檢查是否需要更新的字段
            const needsUpdate = existingUrl.title !== title || existingUrl.description !== description || existingUrl.imageUrl !== imageUrl;
            if (needsUpdate) {
                // 更新短網址
                const updatedUrl = await updateUrl(existingUrl.shortUrl, { title, description, imageUrl });
                return NextResponse.json({ shortUrl: `${process.env.BASE_URL}/${updatedUrl.shortUrl}` }, { status: HttpStatusEnum.OK });
            }
            // 如果字段沒有變更，返回已存在的短網址
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
