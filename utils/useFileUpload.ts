import { useState } from 'react';

const CHUNK_SIZE = 5 * 1024 * 1024; // 每個文件塊大小設為5MB

const useFileUpload = () => {
    const [progresses, setProgresses] = useState<number[]>([]);

    const uploadChunk = async (file: File, chunk: Blob, chunkIndex: number, totalChunks: number) => {
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('filename', file.name);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());

        try {
            const response = await fetch('/api/upload-chunk', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error(`Failed to upload chunk ${chunkIndex}`);
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    };
    // const files = new Map<number, File>();
    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;

        for (const [fileIndex, file] of Array.from(files.entries())) {
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.slice(start, end);

                try {
                    await uploadChunk(file, chunk, chunkIndex, totalChunks);

                    // 更新進度
                    const newProgresses = [...progresses];
                    newProgresses[fileIndex] = Math.round(((chunkIndex + 1) / totalChunks) * 100);
                    setProgresses(newProgresses);
                } catch (error) {
                    alert(`Failed to upload ${file.name}`);
                    break; // 停止上傳當前文件
                }
            }
        }
    };

    return {
        handleUpload,
        progresses,
    };
};

export default useFileUpload;
