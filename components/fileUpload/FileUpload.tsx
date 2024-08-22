'use client'
import { useState, ChangeEvent, useRef, DragEvent } from 'react';
import { Button } from "@/components/ui/button";
import { CloudUploadIcon } from '@/icons/CloudUploadIcon';
import FileArea from '@/components/fileUpload/FileArea';
import { formatFileSize } from '@/utils/fileSize';
import useFileUpload from '@/utils/useFileUpload'; // 引入文件切割和上傳邏輯

const FileUpload = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
    const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { handleUpload, progresses, uploadedFiles } = useFileUpload(); // 使用 useFileUpload hook來上傳檔案

    const handleFileChange = (e: ChangeEvent<HTMLInputElement> | DragEvent<HTMLDivElement>) => {
        let selectedFiles: File[] = [];

        if ('dataTransfer' in e) {
            selectedFiles = Array.from(e.dataTransfer.files);
        } else if (e.target.files) {
            selectedFiles = Array.from(e.target.files);
        }

        // 過濾掉已經上傳的文件
        const newFiles = selectedFiles.filter(file => !uploadedFiles.includes(file.name));
        setFiles([...files, ...newFiles]);
    };

    const deleteFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
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

    const triggerFileInput = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const totalFileSize = files.reduce((total, file) => total + file.size, 0);

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragOver(false);
        handleFileChange(event);
    };

    return (
        <div className="min-h-screen p-4">
            <div className="container mx-auto">
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
                <div className='my-4 flex items-center justify-end'>
                    <span>已新增檔案：</span>
                    <span className='text-blue-500 mx-4'>{files.length}</span>
                    <span>個 / 總檔案大小：</span>
                    <span className='text-blue-500'>{formatFileSize(totalFileSize)}</span>
                </div>
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
                    <Button
                        variant="destructive"
                        onClick={() => handleUpload(files)}
                    >
                        上傳檔案
                    </Button>
                </div>
                {/* 已上傳的文件列表 */}
                <div>
                    {uploadedFiles.length > 0 ? (
                        <div>
                            <h3>已上傳的檔案：</h3>
                            <ul>
                                {uploadedFiles.map((fileName, index) => (
                                    <li key={index}>{fileName}</li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
