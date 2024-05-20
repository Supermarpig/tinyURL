import mongoose, { Schema, Document } from 'mongoose';

export interface Click {
    date: Date;
    referrer?: string;
    ipAddress?: string;
    userAgent?: string;
    location?: string;
    os?: string;
    browser?: string;
}

export interface Count {
    type: string;
    value: string;
    count: number;
}

export interface IUrl extends Document {
    title: string;
    description: string;
    imageUrl: string;
    longUrl: string;
    shortUrl: string;
    clicks: Click[];
    clickCount: number; // 用於快速統計總點擊數
    counts: Count[]; // 用於存儲不同類型的計數
}

const ClickSchema = new Schema<Click>({
    date: { type: Date, required: true },
    referrer: String,
    ipAddress: String,
    userAgent: String,
    location: String,
    os: String,
    browser: String
});

const CountSchema = new Schema<Count>({
    type: { type: String, required: true },
    value: { type: String, required: true },
    count: { type: Number, default: 0 }
});

const UrlSchema = new Schema<IUrl>({
    title: String,
    description: String,
    imageUrl: String,
    longUrl: String,
    shortUrl: String,
    clicks: { type: [ClickSchema], default: [] },
    clickCount: { type: Number, default: 0 },
    counts: { type: [CountSchema], default: [] }
}, {
    timestamps: true, // 自動添加 createdAt 和 updatedAt 欄位
    collection: 'data' // 指定集合名稱
});

// 在保存之前檢查 counts 是否為數組
UrlSchema.pre('save', function (next) {
    if (!Array.isArray(this.counts)) {
        this.counts = [];
    }
    next();
});

export default mongoose.models.Url || mongoose.model<IUrl>('Url', UrlSchema);
