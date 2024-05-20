import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Url from '@/models/Url';
import { HttpStatusEnum } from '@/utils/httpStatusEnum';

export async function POST(request: Request) {
    let body;
    try {
        body = await request.json();
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: HttpStatusEnum.BadRequest });
    }

    const { shortId }: { shortId: string } = body;

    if (!shortId) {
        return NextResponse.json({ error: 'ShortId is required' }, { status: HttpStatusEnum.BadRequest });
    }

    await dbConnect();

    // 設置當地時間的今天日期，時間設置為當天的開始時間
    const localToday = new Date();
    localToday.setHours(0, 0, 0, 0);

    // 將當地時間轉換為UTC時間
    const utcToday = new Date(localToday.getTime() - localToday.getTimezoneOffset() * 60000);

    const headers = request.headers;
    const referrer = headers.get('referer') || '';
    const ipAddress = headers.get('x-forwarded-for')?.split(',')[0].trim() || '';
    const userAgent = headers.get('user-agent') || '';

    // 使用 MongoDB 的原子操作來更新計數
    const result = await Url.findOneAndUpdate(
        { shortUrl: shortId, 'clicks.date': utcToday },
        { $inc: { 'clicks.$.count': 1 } },
        { new: true }
    );

    if (!result) {
        // 如果沒有匹配的文檔，插入新的點選記錄
        await Url.updateOne(
            { shortUrl: shortId },
            {
                $push: {
                    clicks: {
                        date: utcToday,
                        count: 1,
                        referrer,
                        ipAddress,
                        userAgent,
                        location: '' // 可以使用第三方API來獲取基於IP的地理位置
                    }
                }
            }
        );
    } else {
        // 更新附加信息
        await Url.updateOne(
            { shortUrl: shortId, 'clicks.date': utcToday },
            {
                $set: {
                    'clicks.$.referrer': referrer,
                    'clicks.$.ipAddress': ipAddress,
                    'clicks.$.userAgent': userAgent
                }
            }
        );
    }

    return NextResponse.json({ message: 'Click tracked' }, { status: HttpStatusEnum.OK });
}
