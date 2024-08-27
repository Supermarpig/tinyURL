import { useState, useEffect, useRef } from 'react';

// const CHUNK_SIZE = 1 * 1024 * 1024; // 每個文件塊大小設為1MB
const CHUNK_SIZE = 1 * 512 * 1024; // 每個文件塊大小設為512KB
const MAX_CONCURRENT_UPLOADS = 3; // 最多允許同時上傳 3 個分片

const useFileUpload = () => {
    const [progresses, setProgresses] = useState<Record<string, number>>({}); // 使用文件名作為key
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [uploadedSize, setUploadedSize] = useState(0); // 保存已上傳大小
    const workersRef = useRef<Worker[]>([]); // 使用 useRef 來儲存 worker

    useEffect(() => {
        return () => {
            workersRef.current.forEach(worker => worker.terminate());
        };
    }, []);

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;

        for (const file of files) {
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const chunkPromises: Promise<void>[] = [];

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.slice(start, end);

                const worker = new Worker('/workers/fileWorker.js');
                workersRef.current.push(worker);

                const uploadPromise = new Promise<void>((resolve, reject) => {
                    worker.postMessage({ file, chunk, chunkIndex, totalChunks, apiUrl: '/api/upload-chunk' });

                    worker.onmessage = (e) => {
                        const { success, chunkIndex } = e.data;

                        if (success) {
                            // 更新已上傳大小
                            setUploadedSize((prevUploadedSize) => prevUploadedSize + chunk.size);

                            // 更新進度，使用文件名作為 key
                            setProgresses(prevProgresses => ({
                                ...prevProgresses,
                                [file.name]: Math.round(((chunkIndex + 1) / totalChunks) * 100)
                            }));

                            resolve();
                        } else {
                            reject(`Failed to upload chunk ${chunkIndex}`);
                        }
                    };

                    worker.onerror = (error) => {
                        console.error('Worker error:', error);
                        reject(error);
                    };
                });

                chunkPromises.push(uploadPromise);

                if (chunkPromises.length >= MAX_CONCURRENT_UPLOADS) {
                    await Promise.all(chunkPromises);
                    chunkPromises.length = 0;
                }
            }

            if (chunkPromises.length > 0) {
                await Promise.all(chunkPromises);
            }

            // 文件上傳完成後將其添加到已上傳列表
            setUploadedFiles(prev => [...prev, file.name]);
        }

        // 清理所有 Worker
        workersRef.current.forEach(worker => worker.terminate());
        workersRef.current = [];
    };

    return {
        handleUpload,
        progresses,
        uploadedFiles,
        uploadedSize, // 返回已上傳文件的總大小
    };
};

export default useFileUpload;
