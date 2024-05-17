import { NextRequest, NextResponse } from 'next/server';
import { getUrlByShortId, deleteUrl } from '@/services/urlService';
import { HttpStatusEnum } from '@/utils/httpStatusEnum';

export async function GET(req: NextRequest, { params }: { params: { shortId: string } }) {
    const { shortId } = params;

    try {
        const urlDoc = await getUrlByShortId(shortId);

        if (!urlDoc) {
            return NextResponse.json({ error: 'URL not found' }, { status: HttpStatusEnum.NotFound });
        }

        return NextResponse.redirect(urlDoc.longUrl, HttpStatusEnum.MovedPermanently);
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Failed to fetch URL', error.message);
            return NextResponse.json({ error: `Failed to fetch URL: ${error.message}` }, { status: HttpStatusEnum.InternalServerError });
        } else {
            console.error('An unknown error occurred while fetching URL');
            return NextResponse.json({ error: 'An unknown error occurred while fetching URL' }, { status: HttpStatusEnum.InternalServerError });
        }
    }
}
export async function DELETE(req: Request, { params }: { params: { shortId: string } }) {
    const { shortId } = params;

    try {
        const deletedUrl = await deleteUrl(shortId);

        if (!deletedUrl) {
            return NextResponse.json({ error: 'URL not found' }, { status: HttpStatusEnum.NotFound });
        }

        return NextResponse.json({ message: 'URL deleted successfully' }, { status: HttpStatusEnum.OK });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete URL' }, { status: HttpStatusEnum.InternalServerError });
    }
}
