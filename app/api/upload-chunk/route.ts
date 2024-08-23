import { NextResponse } from 'next/server';
import { createWriteStream, promises as fsPromises, existsSync, mkdirSync, unlinkSync, createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { getUniqueFilename } from './getUniqueFilename'

const pump = promisify(pipeline);
const { writeFile } = fsPromises;

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

            const uploadDir = join(process.cwd(), 'uploads');
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

            // 合併之前檢查所有分片是否存在
            if (parseInt(chunkIndex) + 1 === parseInt(totalChunks)) {
                const completeFilePath = join(uploadDir, uniqueFilename);
                const writeStream = createWriteStream(completeFilePath);

                try {
                    await new Promise<void>((resolve, reject) => {
                        writeStream.on('finish', resolve);
                        writeStream.on('error', reject);

                        (async () => {
                            for (let j = 0; j < parseInt(totalChunks); j++) {
                                const chunkFilePath = join(tempDir, `${uniqueFilename}.part${j}`);

                                // 檢查每個分片是否存在，並進行重試或錯誤處理
                                if (!existsSync(chunkFilePath)) {
                                    console.error(`Chunk ${j} does not exist for file ${uniqueFilename}`);
                                    reject(new Error(`Missing chunk ${j}`));
                                    return;
                                }

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
                } catch (error) {
                    console.error(`Failed to merge chunks for file ${uniqueFilename}:`, error);
                }
            }
        }

        return NextResponse.json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to upload file chunks' }, { status: 500 });
    }
}
