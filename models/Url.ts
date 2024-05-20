import mongoose, { Schema, Document } from 'mongoose';

export interface Click {
    date: Date;
    count: number;
}

export interface IUrl extends Document {
    title: string;
    description: string;
    imageUrl: string;
    longUrl: string;
    shortUrl: string;
    clicks: Click[];
}

const ClickSchema = new Schema<Click>({
    date: { type: Date, required: true },
    count: { type: Number, required: true, default: 1 }
});

const UrlSchema = new Schema<IUrl>({
    title: String,
    description: String,
    imageUrl: String,
    longUrl: String,
    shortUrl: String,
    clicks: { type: [ClickSchema], default: [] }
}, {
    timestamps: true, // 自動添加 createdAt 和 updatedAt 欄位
    collection: 'data' // 指定集合名稱
});

export default mongoose.models.Url || mongoose.model<IUrl>('Url', UrlSchema);
