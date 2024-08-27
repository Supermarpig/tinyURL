import { NextResponse } from 'next/server';
import { createWriteStream, promises as fsPromises, existsSync, mkdirSync, unlinkSync, createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { getUniqueFilename } from './getUniqueFilename';
import { Storage } from '@google-cloud/storage';

const pump = promisify(pipeline);
const { writeFile } = fsPromises;

let googleCloudCredentials;
// 解碼 base64 編碼的 GOOGLE_CLOUD_CREDENTIALS 環境變數
try {
    // 解碼並解析 GOOGLE_CLOUD_CREDENTIALS
    const credentialsBase64 = process.env.GOOGLE_CLOUD_CREDENTIALS!;
    const decodedCredentials = Buffer.from(credentialsBase64, 'base64').toString('utf-8');

    // 確保解碼後的內容是有效的 JSON
    googleCloudCredentials = JSON.parse(decodedCredentials);
} catch (error) {
    console.error("Failed to parse Google Cloud credentials:", error);
}
// 創建 Storage 實例，使用已解析的 credentials 和 projectId
const storage = new Storage({
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    credentials: googleCloudCredentials,  // 使用解析後的 JSON 作為 credentials
});

const bucketName = process.env.GOOGLE_CLOUD_BUCKET_NAME || '';
const bucket = storage.bucket(bucketName);

export const runtime = 'nodejs';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const files = formData.getAll('file') as Blob[];
        const filenames = formData.getAll('filename') as string[];
        const chunkIndexes = formData.getAll('chunkIndex') as string[];
        const totalChunksArray = formData.getAll('totalChunks') as string[];

        if (files.length === 0 || filenames.length === 0 || chunkIndexes.length === 0 || totalChunksArray.length === 0) {
            throw new Error('Missing file or metadata');
        }

        // 使用 Promise.all 實現併發處理
        const uploadPromises = files.map(async (file, i) => {
            const originalFilename = filenames[i];
            const chunkIndex = chunkIndexes[i];
            const totalChunks = totalChunksArray[i];

            const uploadDir = join(tmpdir(), 'uploads');
            if (!existsSync(uploadDir)) {
                mkdirSync(uploadDir, { recursive: true });
            }

            const uniqueFilename = getUniqueFilename(uploadDir, originalFilename);

            const tempDir = join(tmpdir(), 'chunks');
            if (!existsSync(tempDir)) {
                mkdirSync(tempDir, { recursive: true });
            }

            const tempFilePath = join(tempDir, `${uniqueFilename}.part${chunkIndex}`);
            console.log(`Saving chunk at: ${tempFilePath}`);

            if (!existsSync(tempFilePath)) {
                const buffer = Buffer.from(await file.arrayBuffer());
                await writeFile(tempFilePath, buffer);
                console.log(`Received chunk ${Number(chunkIndex) + 1}/${totalChunks} for file ${uniqueFilename}`);
            } else {
                console.log(`Chunk ${chunkIndex} already exists for file ${uniqueFilename}, skipping upload.`);
            }

            // 如果最後一個分片到達，檢查是否所有分片都存在，然後合併
            if (parseInt(chunkIndex) + 1 === parseInt(totalChunks)) {
                const allChunksExist = (totalChunks: number, uniqueFilename: string, tempDir: string) => {
                    for (let j = 0; j < totalChunks; j++) {
                        const chunkFilePath = join(tempDir, `${uniqueFilename}.part${j}`);
                        if (!existsSync(chunkFilePath)) {
                            return false;
                        }
                    }
                    return true;
                };

                if (allChunksExist(parseInt(totalChunks), uniqueFilename, tempDir)) {
                    const completeFilePath = join(uploadDir, uniqueFilename);

                    try {
                        await new Promise<void>((resolve, reject) => {
                            const writeStream = createWriteStream(completeFilePath);
                            writeStream.on('finish', resolve);
                            writeStream.on('error', reject);

                            (async () => {
                                for (let j = 0; j < parseInt(totalChunks); j++) {
                                    const chunkFilePath = join(tempDir, `${uniqueFilename}.part${j}`);
                                    const readStream = createReadStream(chunkFilePath);
                                    await pump(readStream, writeStream);
                                    unlinkSync(chunkFilePath); // 刪除已合併的分片
                                }
                                writeStream.end(); // 確保寫入流結束
                            })();
                        });

                        console.log(`File upload complete for ${uniqueFilename}`);

                        // 將合併後的文件上傳到 Google Cloud Storage
                        const destination = `uploads/${uniqueFilename}`;
                        await bucket.upload(completeFilePath, {
                            destination,
                            resumable: true,
                            gzip: true,
                        });

                        // 刪除本地臨時文件
                        await fsPromises.unlink(completeFilePath);

                        const publicUrl = `https://storage.googleapis.com/${bucketName}/${destination}`;
                        console.log(`File successfully uploaded to ${publicUrl}`);

                    } catch (error) {
                        console.error(`Failed to merge and upload chunks for file ${uniqueFilename}:`, error);
                        throw error;
                    }
                } else {
                    console.error(`Some chunks are missing for file ${uniqueFilename}, cannot merge.`);
                    throw new Error('Missing chunks, cannot merge');
                }
            }
        });

        // 等待所有併發上傳完成
        await Promise.all(uploadPromises);

        return NextResponse.json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to upload file chunks' }, { status: 500 });
    }
}
