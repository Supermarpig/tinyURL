import mongoose, { Schema, Document } from 'mongoose';

export interface Click {
    date: Date;
    referrer?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    os?: string;
    browser?: string;
    deviceType?: string; // 添加 deviceType 欄位
}

export interface IUrl extends Document {
    title: string;
    description: string;
    imageUrl: string;
    longUrl: string;
    shortUrl: string;
    clicks: Click[];
    clickCount: number; // 用於快速統計總點擊數
}

const ClickSchema = new Schema<Click>({
    date: { type: Date, required: true },
    referrer: String,
    ipAddress: String,
    userAgent: String,
    location: String,
    os: String,
    browser: String,
    deviceType: String // 添加 deviceType 欄位
});

const UrlSchema = new Schema<IUrl>({
    title: String,
    description: String,
    imageUrl: String,
    longUrl: String,
    shortUrl: String,
    clicks: { type: [ClickSchema], default: [] },
    clickCount: { type: Number, default: 0 }
}, {
    timestamps: true, // 自動添加 createdAt 和 updatedAt 欄位
    collection: 'data' // 指定集合名稱
});

export default mongoose.models.Url || mongoose.model<IUrl>('Url', UrlSchema);
