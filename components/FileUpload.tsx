'use client'
import React, { useState, ChangeEvent, useRef, useEffect } from 'react';

const FileUpload: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [progresses, setProgresses] = useState<number[]>([]);
    const [tooltipIndex, setTooltipIndex] = useState<number | null>(null);
    const [tooltipTimer, setTooltipTimer] = useState<NodeJS.Timeout | null>(null);


    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
        setFiles(selectedFiles);
        setProgresses(new Array(selectedFiles.length).fill(0));
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

    const shouldShowTooltip = (fileName: string) => {
        return fileName.length > 20; // 如果文件名長度超過 20 個字符，則顯示 tooltip
    };

    return (
        <div className="min-h-screen p-4">
            <div className="container mx-auto">
                {/* 文件上傳部分 */}
                <div className="pixel-art-border h-64 flex flex-col items-center justify-center mb-8">
                    <input
                        type="file"
                        onChange={handleFileChange}
                        className="pixel-art-input mb-4"
                        multiple
                    />
                    <button
                        onClick={handleUpload}
                        className="pixel-art-button px-4 py-2"
                    >
                        上傳檔案
                    </button>
                </div>

                {/* 進度部分 */}
                <div className="pixel-art-border p-4">
                    {files.map((file, index) => (
                        <div key={index} className="mb-4">
                            <div className="flex items-center relative">
                                {/* 文件名 */}
                                <div
                                    className="w-64 h-12 pixel-art-border mr-4 flex items-center px-4 truncate"
                                    onMouseEnter={() => shouldShowTooltip(file.name) && showTooltip(index)}
                                    onMouseLeave={hideTooltip}
                                >
                                    <span className="truncate">{file.name}</span>
                                    {/* Tooltip */}
                                    {tooltipIndex === index && shouldShowTooltip(file.name) && (
                                        <div className="absolute left-0 bottom-full mb-2 flex items-center justify-start p-2 bg-gray-800 text-white text-lg rounded w-max">
                                            {file.name}
                                        </div>
                                    )}
                                </div>
                                {/* 進度部分 */}
                                <div className="w-full h-12 pixel-art-border flex items-center justify-center">
                                    <p className="pixel-art-font text-lg">{progresses[index]}%</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FileUpload;
