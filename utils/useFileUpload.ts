import { useState, useEffect } from 'react';

const CHUNK_SIZE = 1 * 1024 * 1024; // 每個文件塊大小設為1MB
const MAX_CONCURRENT_UPLOADS = 3; // 最多允許同時上傳 3 個分片

const useFileUpload = () => {
    const [progresses, setProgresses] = useState<number[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]); // 保存已上傳文件的名稱

    // 在組件卸載時終止所有 workers
    useEffect(() => {
        return () => {
            workers.forEach(worker => worker.terminate());
        };
    }, []);

    const workers: Worker[] = []; // 初始化 workers 數組

    const handleUpload = async (files: File[]) => {
        if (files.length === 0) return;

        for (const [fileIndex, file] of Array.from(files.entries())) {
            const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
            const chunkPromises: Promise<void>[] = []; // 儲存當前正在上傳的分片

            for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
                const start = chunkIndex * CHUNK_SIZE;
                const end = Math.min(file.size, start + CHUNK_SIZE);
                const chunk = file.slice(start, end);

                const worker = new Worker('/workers/fileWorker.js'); // 創建 Web Worker

                // console.log(worker,"=============worker😍😍😍")
                workers.push(worker); // 將 worker 保存到 workers 數組中
                // console.log(workers,"=============workers🤣🤣🤣")

                const uploadPromise = new Promise<void>((resolve, reject) => {
                    worker.postMessage({ file, chunk, chunkIndex, totalChunks });

                    worker.onmessage = (e) => {
                        const { success, chunkIndex } = e.data;

                        if (success) {
                            // 使用 setProgresses 的回調函數，確保基於最新狀態更新進度
                            setProgresses((prevProgresses) => {
                                const newProgresses = [...prevProgresses];
                                newProgresses[fileIndex] = Math.round(((chunkIndex + 1) / totalChunks) * 100);
                                return newProgresses;
                            });
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

        // 所有分片完成後清理 Worker
        workers.forEach(worker => worker.terminate());
    };

    return {
        handleUpload,
        progresses,
        uploadedFiles, // 返回已上傳文件列表，方便在前端過濾
    };
};

export default useFileUpload;
