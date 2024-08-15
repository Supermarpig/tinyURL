'use client'
import { useState, ChangeEvent, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { CloudUploadIcon } from '@/icons/CloudUploadIcon'
import FileArea from '@/components/fileUpload/FileArea';

const FileUpload = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [progresses, setProgresses] = useState<number[]>([]);
    const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
    const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        setFiles([...files, ...selectedFiles]);
        setProgresses(prevProgresses => [
            ...prevProgresses,
            ...new Array(selectedFiles.length).fill(0)
        ]);

        console.log(e.target.files, "=========e.target.files")
    };

    const deleteFile = (index: number) => {
        setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
        setProgresses(prevProgresses => prevProgresses.filter((_, i) => i !== index));
    };

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

    return (
        <div className="min-h-screen p-4">
            <div className="container mx-auto">
                {/* 文件上傳部分 */}
                <div className="pixel-art-border h-64 flex flex-col items-center justify-center ">
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
                <div className='flex items-center justify-center my-8'>
                    {/* 統計檔案數量 跟大小 */}
                    <div>

                    </div>
                    <Button
                        variant="destructive"
                        onClick={handleUpload}
                    >
                        上傳檔案
                    </Button>
                </div>
                {/* 進度部分 */}
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
                    />
                ))}
            </div>
        </div>
    );
};

export default FileUpload;
