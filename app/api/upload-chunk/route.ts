import { NextResponse } from 'next/server';
import { createWriteStream, promises as fsPromises, existsSync, mkdirSync, unlinkSync, createReadStream } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';
import { pipeline } from 'stream';
import { promisify } from 'util';
import { getUniqueFilename } from './getUniqueFilename '

const pump = promisify(pipeline);
const { writeFile } = fsPromises;

export const config = {
    runtime: 'nodejs', // 確保運行在 Node.js 環境中
};

export async function POST(req: Request) {
    try {
        const formData = await req.formData();

        const files = formData.getAll('file') as Blob[]; // 獲取所有上傳的文件
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
            if (!existsSync(tempDir)) {
                mkdirSync(tempDir, { recursive: true });
            }

            const tempFilePath = join(tempDir, `${uniqueFilename}.part${chunkIndex}`);
            if (!existsSync(tempFilePath)) {
                const buffer = Buffer.from(await file.arrayBuffer());
                await writeFile(tempFilePath, buffer);
                console.log(`Received chunk ${Number(chunkIndex) + 1}/${totalChunks} for file ${uniqueFilename}`);
            } else {
                console.log(`Chunk ${chunkIndex} already exists for file ${uniqueFilename}, skipping upload.`);
            }

            if (parseInt(chunkIndex) + 1 === parseInt(totalChunks)) {
                const completeFilePath = join(uploadDir, uniqueFilename);
                const writeStream = createWriteStream(completeFilePath);

                for (let j = 0; j < parseInt(totalChunks); j++) {
                    const chunkFilePath = join(tempDir, `${uniqueFilename}.part${j}`);
                    const readStream = createReadStream(chunkFilePath);
                    await pump(readStream, writeStream);
                    unlinkSync(chunkFilePath); // 刪除已合併的分片
                }

                writeStream.end();
                console.log(`File upload complete for ${uniqueFilename}`);
            }
        }

        return NextResponse.json({ message: 'Files uploaded successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to upload file chunks' }, { status: 500 });
    }
}
