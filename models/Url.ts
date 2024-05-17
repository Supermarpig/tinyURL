import mongoose, { Schema, Document } from 'mongoose';

export interface IUrl extends Document {
    title: string;
    description: string;
    imageUrl: string;
    longUrl: string;
    shortUrl: string;
    createdAt: Date;
    updatedAt: Date;
}

const UrlSchema: Schema = new Schema({
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    imageUrl: { type: String, default: '' },
    longUrl: { type: String, required: true },
    shortUrl: { type: String, required: true, unique: true },
}, {
    timestamps: true, // 自動添加 createdAt 和 updatedAt 欄位
    collection: 'datas' // 指定集合名稱
});

export default mongoose.models.Url || mongoose.model<IUrl>('Url', UrlSchema);
