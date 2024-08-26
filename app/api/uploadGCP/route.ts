import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';
import { createWriteStream, WriteStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { promises as fsPromises } from 'fs';

const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || '';
const bucket = storage.bucket(bucketName);

export const config = {
    api: {
        bodyParser: false, // 禁用 body 解析，因為我們手動處理 multipart/form-data
    },
};

export async function POST(req: Request) {
    try {
        const contentType = req.headers.get('content-type') || '';
        if (!contentType.includes('multipart/form-data')) {
            return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
        }

        const boundary = contentType.split('boundary=')[1];
        if (!boundary) {
            return NextResponse.json({ error: 'Boundary not found' }, { status: 400 });
        }

        const reader = req.body?.getReader();
        if (!reader) {
            return NextResponse.json({ error: 'Reader not available' }, { status: 500 });
        }

        const decoder = new TextDecoder();
        let filePath = '';
        let originalFilename = '';
        let isFile = false;
        let fileStream: WriteStream | null = null; // 將 fileStream 初始化為 null

        // 保存數據的變量
        let remainingBuffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            remainingBuffer += chunk;

            if (!isFile) {
                // 檢查是否是文件開始的標記
                const filenameMatch = remainingBuffer.match(/filename="(.+?)"/);
                if (filenameMatch) {
                    originalFilename = filenameMatch[1];
                    filePath = join(tmpdir(), originalFilename);
                    fileStream = createWriteStream(filePath); // 初始化 fileStream
                    isFile = true;

                    // 移除已處理的表單頭部分
                    const fileContentIndex = remainingBuffer.indexOf('\r\n\r\n') + 4;
                    remainingBuffer = remainingBuffer.slice(fileContentIndex);

                    // 開始寫入文件數據
                    if (remainingBuffer && fileStream) {
                        fileStream.write(remainingBuffer);
                        remainingBuffer = '';
                    }
                }
            } else if (fileStream) {
                // 持續寫入文件內容
                fileStream.write(chunk);
            }
        }

        if (fileStream) {
            fileStream.end(); // 結束文件流
        }

        if (!filePath) {
            return NextResponse.json({ error: 'File not found' }, { status: 400 });
        }

        // 上傳到 Google Cloud Storage
        const destination = `uploads/${originalFilename}`;
        await bucket.upload(filePath, {
            destination,
            resumable: false,
            gzip: true,
        });

        // 刪除本地臨時文件
        await fsPromises.unlink(filePath);

        const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
        return NextResponse.json({ message: 'File uploaded successfully', url: publicUrl });

    } catch (error) {
        console.error('Failed to upload file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
