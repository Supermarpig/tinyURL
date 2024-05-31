import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Url, { Count } from '@/models/Url';
import { HttpStatusEnum } from '@/utils/httpStatusEnum';
import useragent from 'useragent';
import maxmind from 'maxmind';
import path from 'path';

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

    // 設置當地時間的今天日期，時間設置為當天的開始時間
    const localToday = new Date();
    localToday.setHours(0, 0, 0, 0);

    // 將當地時間轉換為UTC時間
    const utcToday = new Date(localToday.getTime() - localToday.getTimezoneOffset() * 60000);

    const headers = request.headers;
    const referrer = headers.get('referer') || '';
    const ipAddress = headers.get('x-forwarded-for')?.split(',')[0].trim() || '';
    const userAgentString = headers.get('user-agent') || '';

    const agent = useragent.parse(userAgentString);
    const os = agent.os.toString();
    const browser = agent.toAgent();
    
    // 使用 MaxMind GeoLite2 數據庫獲取地理位置
    let location = 'unknown';
    try {
        const dbPath = path.join(process.cwd(), 'lib', 'GeoLite2-City.mmdb'); // 確保這個路徑是正確的
        const lookup = await maxmind.open(dbPath);
        const geo = lookup.get(ipAddress);

        if (geo) {
            if ('city' in geo && geo.city?.names?.en) {
                location = geo.city.names.en;
            } else if ('country' in geo && geo.country?.names?.en) {
                location = geo.country.names.en;
            } else {
                location = 'unknown';
            }
        }
    } catch (error) {
        console.error('Error fetching location:', error);
    }

    // 新的點擊記錄
    const newClick = {
        date: utcToday,
        referrer,
        ipAddress,
        userAgent: userAgentString,
        os,
        browser,
        location // 使用從 GeoLite2 獲取的地理位置
    };

    // 計算設備類型
    const deviceType = agent.device.toString().toLowerCase().includes('mobile') ? 'mobile' : 'desktop';

    // 查找並更新URL
    const url = await Url.findOne({ shortUrl: shortId });
    if (!url) {
        console.error('URL not found');
        return NextResponse.json({ error: 'URL not found' }, { status: HttpStatusEnum.NotFound });
    }

    // 確保 counts 字段是數組
    if (!Array.isArray(url.counts)) {
        console.error('url.counts is not an array, converting to array.');
        if (url.counts && typeof url.counts === 'object') {
            const newCounts: Count[] = [];
            for (const type in url.counts) {
                if (url.counts.hasOwnProperty(type)) {
                    for (const value in url.counts[type]) {
                        if (url.counts[type].hasOwnProperty(value)) {
                            newCounts.push({
                                type: type,
                                value: value,
                                count: url.counts[type][value]
                            });
                        }
                    }
                }
            }
            url.counts = newCounts;
        } else {
            url.counts = [];
        }
    }

    // 打印調試信息
    console.log('Before updating counts:', url.counts);

    // 更新點擊數和點擊記錄
    url.clickCount += 1;
    url.clicks.push(newClick);

    // 更新計數數組
    const updateCount = (type: string, value: string) => {
        const countIndex = url.counts.findIndex((count: Count) => count.type === type && count.value === value);
        if (countIndex >= 0) {
            url.counts[countIndex].count += 1;
        } else {
            url.counts.push({ type, value, count: 1 });
        }
    };

    updateCount('browser', browser);
    updateCount('device', deviceType);
    updateCount('location', location);

    // 打印調試信息
    console.log('After updating counts:', url.counts);

    try {
        await url.save();
        console.log('Update successful:', url);
        return NextResponse.json({ message: 'Click tracked' }, { status: HttpStatusEnum.OK });
    } catch (error) {
        console.error('Update failed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: HttpStatusEnum.InternalServerError });
    }
}
