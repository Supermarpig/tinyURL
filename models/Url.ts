// models/Url.ts
import mongoose from 'mongoose';

const UrlSchema = new mongoose.Schema({
    originalUrl: {
        type: String,
        required: true,
    },
    shortId: {
        type: String,
        required: true,
        unique: true,
    },
});

export default mongoose.models.Url || mongoose.model('Url', UrlSchema);
