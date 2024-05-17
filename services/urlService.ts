import Url from '@/models/Url';
import { nanoid } from 'nanoid';
import dbConnect from '@/lib/mongodb';

export async function createUrl(longUrl: string, title?: string, description?: string, imageUrl?: string) {
    await dbConnect();

    const shortUrl = nanoid(7);
    const newUrl = new Url({
        title: title || '',
        description: description || '',
        imageUrl: imageUrl || '',
        longUrl,
        shortUrl,
    });

    await newUrl.save();
    return newUrl;
}

export async function getUrlByShortId(shortId: string) {
    await dbConnect();

    const urlDoc = await Url.findOne({ shortUrl: shortId });
    return urlDoc;
}

export async function getUrlByLongUrl(longUrl: string) {
    await dbConnect();

    const urlDoc = await Url.findOne({ longUrl });
    return urlDoc;
}

export async function updateUrl(shortId: string, updateData: Partial<{ longUrl: string; title: string; description: string; imageUrl: string }>) {
    await dbConnect();

    const updatedUrl = await Url.findOneAndUpdate({ shortUrl: shortId }, updateData, { new: true });
    return updatedUrl;
}

export async function deleteUrl(shortId: string) {
    await dbConnect();

    const deletedUrl = await Url.findOneAndDelete({ shortUrl: shortId });
    return deletedUrl;
}

export async function getAllUrls() {
    await dbConnect();

    const urls = await Url.find({});
    return urls;
}
