import { NextResponse } from 'next/server';
import { updateUrl } from '@/services/urlService';
import { HttpStatusEnum } from '@/utils/httpStatusEnum';

export async function PATCH(req: Request, { params }: { params: { shortId: string } }) {
    const { shortId } = params;
    const updateData = await req.json();

    try {
        const updatedUrl = await updateUrl(shortId, updateData);

        if (!updatedUrl) {
            return NextResponse.json({ error: 'URL not found' }, { status: HttpStatusEnum.NotFound });
        }

        return NextResponse.json(updatedUrl, { status: HttpStatusEnum.OK });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update URL' }, { status: HttpStatusEnum.InternalServerError });
    }
}
