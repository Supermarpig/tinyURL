'use client'
import { useState, ChangeEvent, useRef, useEffect, DragEvent } from 'react';
import { Button } from "@/components/ui/button";
import { CloudUploadIcon } from '@/icons/CloudUploadIcon'
import FileArea from '@/components/fileUpload/FileArea';
import { formatFileSize } from '@/utils/fileSize'

const FileUpload = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [progresses, setProgresses] = useState<number[]>([]);
    const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
    const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);
    const [isDragOver, setIsDragOver] = useState(false); // 新增狀態來跟蹤拖曳行為
    const fileInputRef = useRef<HTMLInputElement | null>(null);


    const handleFileChange = (e: ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>) => {
        let selectedFiles: File[] = [];

        if ('dataTransfer' in e) {
            // 處理拖曳事件
            selectedFiles = Array.from(e.dataTransfer.files);
        } else if (e.target.files) {
            // 處理文件選擇器
            selectedFiles = Array.from(e.target.files);
        }

        setFiles([...files, ...selectedFiles]);
        setProgresses(prevProgresses => [
            ...prevProgresses,
            ...new Array(selectedFiles.length).fill(0)
        ]);
    };

    const deleteFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        setProgresses(prevProgresses => prevProgresses.filter((_, i) => i !== index));
    };


    // 後端 api上傳
    const handleUpload = async () => {
        if (files.length === 0) return;

        const uploadPromises = files.map((file, index) => {
            const formData = new FormData();
            formData.append('file', file);

            return fetch('/api/upload', {
                method: 'POST',
                body: formData,
            }).then((response) => {
                if (response.ok) {
                    const newProgresses = [...progresses];
                    newProgresses[index] = 100;
                    setProgresses(newProgresses);
                } else {
                    alert(`Failed to upload ${file.name}`);
                }
            }).catch((error) => {
                console.error('Upload error:', error);
                alert(`Error occurred during upload of ${file.name}`);
            });
        });

        await Promise.all(uploadPromises);
    };

    const showTooltip = (index: number) => {
        if (tooltipTimer) clearTimeout(tooltipTimer);
        const timer = setTimeout(() => setTooltipIndex(index), 500); // 500ms 延遲
        setTooltipTimer(timer);
    };

    const hideTooltip = () => {
        if (tooltipTimer) clearTimeout(tooltipTimer);
        setTooltipIndex(null);
    };

    useEffect(() => {
        return () => {
            if (tooltipTimer) clearTimeout(tooltipTimer);
        };
    }, [tooltipTimer]);

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    // 計算檔案大小
    const totalFileSize = files.reduce((total, file) => total + file.size, 0);

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // 防止瀏覽器預設行為
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false); // 當拖曳離開時，恢復為 false
    };
    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault(); // 防止瀏覽器預設行為
        setIsDragOver(false);
        handleFileChange(event); // 處理文件拖曳
    };


    return (
        <div className="min-h-screen p-4">
            <div className="container mx-auto">
                {/* 文件上傳部分 */}
                <div
                    className={`h-64 flex flex-col items-center justify-center transition-all duration-300 ease-in-out 
                         ${isDragOver ? 'border-dance' : 'pixel-art-border border-black'}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        onChange={handleFileChange}
                        ref={fileInputRef}
                        className="hidden"
                        multiple
                    />
                    <div onClick={triggerFileInput} className="cursor-pointer w-full h-full flex flex-col items-center justify-center gap-4">
                        <CloudUploadIcon />
                        <span>點擊新增或拖曳檔案到此區塊</span>
                    </div>
                </div>
                {/* 上傳至後端api 然後寫進資料庫 */}
                <div className='my-4 flex items-center justify-end'>
                    <span>已新增檔案：</span>
                    <span className='text-blue-500 mx-4'>{files.length}</span>
                    <span>個 / 總檔案大小：</span>
                    <span className='text-blue-500'>{formatFileSize(totalFileSize)}</span>
                </div>
                {/* 檔案區塊 */}
                {files.map((file, index) => (
                    <FileArea
                        key={index}
                        file={file}
                        index={index}
                        progress={progresses[index]}
                        deleteFile={() => deleteFile(index)}
                        showTooltip={() => showTooltip(index)}
                        hideTooltip={hideTooltip}
                        tooltipVisible={tooltipIndex === index}
                        fileSize={file.size}
                    />
                ))}
                <div className='flex items-center justify-center my-8'>
                    {/* 統計檔案數量 跟大小 */}
                    <Button
                        variant="destructive"
                        onClick={handleUpload}

                    >
                        上傳檔案
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
