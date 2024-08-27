'use client'
import { useState, ChangeEvent, useRef, DragEvent, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CloudUploadIcon } from '@/icons/CloudUploadIcon';
import FileArea from '@/components/fileUpload/FileArea';
import { formatFileSize } from '@/utils/fileSize';
import useFileUpload from '@/utils/useFileUpload'; // 引入文件切割和上傳邏輯
import FileName from './FileName'

const FileUpload = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
    const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const { handleUpload, progresses, uploadedFiles, uploadedSize } = useFileUpload(); // 使用 useFileUpload hook來上傳檔案

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

    // 刪除上傳完成的檔案
    useEffect(() => {
        const uniqueFiles = files.filter(
            (file) => !uploadedFiles.includes(file.name)
        );
        setFiles(uniqueFiles);
    }, [uploadedFiles]);

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
                {files.map((file, index) => {
                    const fileProgress = progresses[file.name];
                    return (
                        <FileArea
                            key={file.name}
                            file={file}
                            index={index}
                            progress={fileProgress}
                            showTooltip={() => showTooltip(index)}
                            deleteFile={() => deleteFile(index)}
                            hideTooltip={hideTooltip}
                            tooltipVisible={tooltipIndex === index}
                            fileSize={file.size}
                        />
                    );
                })}
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
                            <h3 className='flex justify-center items-center text-2xl font-bold text-center my-4'>已上傳的檔案</h3>
                            <div className='flex justify-end items-center'>
                                <span>已上傳：{formatFileSize(uploadedSize)}</span>
                            </div>
                            <ul>
                                {uploadedFiles.map((fileName, index) => (
                                    <li key={index} className='flex mb-4 gap-4'>
                                        {/* <span className="w-1/4 text-2xl font-bold justify-center items-center">{fileName}</span> */}
                                        <FileName fileName={fileName} />
                                        {/* 進度部分 */}
                                        <div className="w-3/4 h-12 pixel-art-border flex items-center justify-center relative">
                                            <div className="w-full h-full bg-gray-200 rounded">
                                                {/* 直接渲染 100% 的進度 */}
                                                <div className="h-full bg-green-400" style={{ width: '100%' }} />
                                            </div>
                                            <p className="pixel-art-font text-lg absolute">100%</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </div >
        </div >
    );
};

export default FileUpload;
