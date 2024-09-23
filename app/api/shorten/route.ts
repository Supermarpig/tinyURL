import { NextResponse } from 'next/server';
import { createUrl, getUrlByLongUrl, updateUrl, getUrlByShortId } from '@/services/urlService';
import { HttpStatusEnum } from '@/utils/httpStatusEnum';
import { validateUrl } from '@/utils/validateUrl';

export async function POST(req: Request) {
    try {
        const { longUrl, title, description, imageUrl } = await req.json();

        if (!longUrl) {
            return NextResponse.json({ error: 'URL is required' }, { status: HttpStatusEnum.BadRequest });
        }

        // 檢查是否已經有存在的短網址
        const url = new URL(longUrl);
        const baseUrl = process.env.BASE_URL;

        if (url.origin === baseUrl) {
            const shortId = url.pathname.slice(1);
            const existingShortUrl = await getUrlByShortId(shortId);
            if (existingShortUrl) {
                return NextResponse.json({ shortUrl: `${baseUrl}/${existingShortUrl.shortUrl}` }, { status: HttpStatusEnum.OK });
            }
        }

        // 檢查是否已存在相同的長網址
        const existingUrl = await getUrlByLongUrl(longUrl);

        if (existingUrl) {
            // 檢查是否需要更新的字段
            const needsUpdate = (title && existingUrl.title !== title) ||
                (description && existingUrl.description !== description) ||
                (imageUrl && existingUrl.imageUrl !== imageUrl);

            if (needsUpdate) {
                // 更新短網址
                const updateData: Partial<{ title: string; description: string; imageUrl: string }> = {};
                if (title) updateData.title = title;
                if (description) updateData.description = description;
                if (imageUrl) updateData.imageUrl = imageUrl;

                const updatedUrl = await updateUrl(existingUrl.shortUrl, updateData);
                return NextResponse.json({ shortUrl: `${process.env.BASE_URL}/${updatedUrl.shortUrl}` }, { status: HttpStatusEnum.OK });
            }
            // 如果字段沒有變更，返回已存在的短網址
            return NextResponse.json({ shortUrl: `${process.env.BASE_URL}/${existingUrl.shortUrl}` }, { status: HttpStatusEnum.OK });
        }

        // 創建新的短網址
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
