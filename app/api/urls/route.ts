import { NextResponse } from 'next/server';
import { getAllUrls } from '@/services/urlService';
import { HttpStatusEnum } from '@/utils/httpStatusEnum';
import dbConnect from '@/lib/mongodb'; // 確保已導入 dbConnect

export async function GET() {
    try {
        await dbConnect();
        const urls = await getAllUrls();
        console.log('Fetched URLs:', urls); // 用於調試
        return NextResponse.json(urls, { status: HttpStatusEnum.OK });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Failed to fetch URLs', error.message);
            return NextResponse.json({ error: 'Failed to fetch URLs: ' + error.message }, { status: HttpStatusEnum.InternalServerError });
        } else {
            console.error('An unknown error occurred while fetching URLs');
            return NextResponse.json({ error: 'An unknown error occurred while fetching URLs' }, { status: HttpStatusEnum.InternalServerError });
        }
    }
}
