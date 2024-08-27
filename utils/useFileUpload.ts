import { useState, useEffect, useRef } from 'react';

// const CHUNK_SIZE = 1 * 1024 * 1024; // 每個文件塊大小設為1MB
const CHUNK_SIZE = 1 * 512 * 1024; // 每個文件塊大小設為512KB
const MAX_CONCURRENT_UPLOADS = 3; // 最多允許同時上傳 3 個分片

const useFileUpload = () => {
    const [progresses, setProgresses] = useState<Record<string, number>>({});
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const [uploadedSize, setUploadedSize] = useState(0);
    const workersRef = useRef<Worker[]>([]);

    useEffect(() => {
        return () => {
            workersRef.current.forEach(worker => worker.terminate());
        };
    }, []);

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;

        const uploadChunk = (file: File, chunk: Blob, chunkIndex: number, totalChunks: number, worker: Worker) => {
            return new Promise<void>((resolve, reject) => {
                worker.postMessage({ file, chunk, chunkIndex, totalChunks, apiUrl: '/api/upload-chunk' });

                worker.onmessage = (e) => {
                    const { success } = e.data;
                    if (success) {
                        setUploadedSize((prevUploadedSize) => prevUploadedSize + chunk.size);
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
        };

        for (const file of files) {
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const uploadQueue: Promise<void>[] = [];

            // 使用 Worker 池來重用 Worker
            const workerPool: Worker[] = Array.from({ length: MAX_CONCURRENT_UPLOADS }, () => {
                const worker = new Worker('/workers/fileWorker.js');
                workersRef.current.push(worker);
                return worker;
            });

            let currentWorkerIndex = 0;

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.slice(start, end);

                // 從 worker 池中選取一個 Worker
                const worker = workerPool[currentWorkerIndex % MAX_CONCURRENT_UPLOADS];
                currentWorkerIndex++;

                const uploadPromise = uploadChunk(file, chunk, chunkIndex, totalChunks, worker);
                uploadQueue.push(uploadPromise);

                if (uploadQueue.length >= MAX_CONCURRENT_UPLOADS) {
                    await Promise.all(uploadQueue);
                    uploadQueue.length = 0;
                }
            }

            if (uploadQueue.length > 0) {
                await Promise.allSettled(uploadQueue);
            }

            setUploadedFiles(prev => [...prev, file.name]);
        }

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
