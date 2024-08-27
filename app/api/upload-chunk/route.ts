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

// console.log(googleCloudCredentials,"===========googleCloudCredentials😍😍😍")

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

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const originalFilename = filenames[i];
            const chunkIndex = chunkIndexes[i];
            const totalChunks = totalChunksArray[i];

            // 創建一個本地的資料夾uploads
            // const uploadDir = join(process.cwd(), 'uploads');
            // if (!existsSync(uploadDir)) {
            //     mkdirSync(uploadDir, { recursive: true });
            // }

            const uploadDir = join(tmpdir(), 'uploads');  // 使用臨時目錄
            if (!existsSync(uploadDir)) {
                mkdirSync(uploadDir, { recursive: true });
            }

            const uniqueFilename = getUniqueFilename(uploadDir, originalFilename);

            const tempDir = join(tmpdir(), 'chunks');
            try {
                if (!existsSync(tempDir)) {
                    mkdirSync(tempDir, { recursive: true });
                }
            } catch (err) {
                console.error('Failed to create temp directory:', err);
                throw err;
            }

            const tempFilePath = join(tempDir, `${uniqueFilename}.part${chunkIndex}`);
            console.log(`Saving chunk at: ${tempFilePath}`);
            try {
                if (!existsSync(tempFilePath)) {
                    const buffer = Buffer.from(await file.arrayBuffer());
                    await writeFile(tempFilePath, buffer);
                    console.log(`Received chunk ${Number(chunkIndex) + 1}/${totalChunks} for file ${uniqueFilename}`);
                } else {
                    console.log(`Chunk ${chunkIndex} already exists for file ${uniqueFilename}, skipping upload.`);
                }
            } catch (error) {
                console.error(`Failed to write chunk ${chunkIndex} for file ${uniqueFilename}:`, error);
                throw error;
            }

            const allChunksExist = (totalChunks: number, uniqueFilename: string, tempDir: string) => {
                for (let i = 0; i < totalChunks; i++) {
                    const chunkFilePath = join(tempDir, `${uniqueFilename}.part${i}`);
                    if (!existsSync(chunkFilePath)) {
                        return false;  // 如果任何一個分片缺失，返回 false
                    }
                }
                return true;  // 所有分片都存在，返回 true
            };

            // 合併並上傳之前檢查所有分片是否存在
            if (parseInt(chunkIndex) + 1 === parseInt(totalChunks)) {
                // 檢查所有分片是否存在
                const allChunksPresent = allChunksExist(parseInt(totalChunks), uniqueFilename, tempDir);

                if (!allChunksPresent) {
                    console.error(`Some chunks are missing for file ${uniqueFilename}, cannot merge.`);
                    return NextResponse.json({ error: 'Missing chunks, cannot merge' }, { status: 400 });
                }

                const completeFilePath = join(uploadDir, uniqueFilename);
                const writeStream = createWriteStream(completeFilePath);

                try {
                    await new Promise<void>((resolve, reject) => {
                        writeStream.on('finish', resolve);
                        writeStream.on('error', reject);

                        (async () => {
                            for (let j = 0; j < parseInt(totalChunks); j++) {
                                const chunkFilePath = join(tempDir, `${uniqueFilename}.part${j}`);

                                const readStream = createReadStream(chunkFilePath);
                                try {
                                    await pump(readStream, writeStream);
                                    unlinkSync(chunkFilePath); // 刪除已合併的分片
                                } catch (error) {
                                    console.error(`Error merging chunk ${j}:`, error);
                                    reject(error);
                                    return;
                                }
                            }
                            writeStream.end(); // 確保結束
                        })();
                    });

                    console.log(`File upload complete for ${uniqueFilename}`);

                    // 上傳合併後的文件到 Google Cloud Storage
                    const destination = `uploads/${uniqueFilename}`;
                    await bucket.upload(completeFilePath, {
                        destination,
                        resumable: false,
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
            }
        }

        return NextResponse.json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to upload file chunks' }, { status: 500 });
    }
}
