import { useState } from 'react';

const CHUNK_SIZE = 1 * 1024 * 1024; // 每個文件塊大小設為1MB
const MAX_CONCURRENT_UPLOADS = 3; // 最多允許同時上傳 3 個分片

const useFileUpload = () => {
    const [progresses, setProgresses] = useState<number[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]); // 保存已上傳文件的名稱

    const uploadChunk = async (file: File, chunk: Blob, chunkIndex: number, totalChunks: number) => {
        const formData = new FormData();
        formData.append('file', chunk);
        formData.append('filename', file.name);
        formData.append('chunkIndex', chunkIndex.toString());
        formData.append('totalChunks', totalChunks.toString());

        try {
            console.log(`Sending POST request for chunk ${chunkIndex}`);
            const response = await fetch('/api/upload-chunk', {
                method: 'POST',
                body: formData,
            });
            console.log(`Received response for chunk ${chunkIndex}: ${response.status}`);
        } catch (error) {
            console.error(`Error uploading chunk ${chunkIndex}`, error);
            throw error;
        }
    };

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;

        for (const [fileIndex, file] of Array.from(files.entries())) {
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const chunkPromises: Promise<void>[] = []; // 儲存當前正在上傳的分片

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.slice(start, end);

                const uploadPromise = uploadChunk(file, chunk, chunkIndex, totalChunks);
                chunkPromises.push(uploadPromise);

                if (chunkPromises.length >= MAX_CONCURRENT_UPLOADS) {
                    await Promise.all(chunkPromises);
                    chunkPromises.length = 0;
                }

                const newProgresses = [...progresses];
                newProgresses[fileIndex] = Math.round(((chunkIndex + 1) / totalChunks) * 100);
                setProgresses(prevProgresses => {
                    const newProgresses = [...prevProgresses];
                    newProgresses[fileIndex] = Math.round(((chunkIndex + 1) / totalChunks) * 100);
                    // console.log(newProgresses[0], "==========目前進度為");
                    return newProgresses;
                });
            }



            if (chunkPromises.length > 0) {
                await Promise.all(chunkPromises);
            }

            // 文件上傳完成後將其添加到已上傳列表
            setUploadedFiles(prev => [...prev, file.name]);
        }
    };

    return {
        handleUpload,
        progresses,
        uploadedFiles, // 返回已上傳文件列表，方便在前端過濾
    };
};

export default useFileUpload;
