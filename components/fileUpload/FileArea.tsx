'use client'

import Image from 'next/image';
import { DeleteIcon, PDFIcon, ExcelIcon, WordIcon, PPTIcon, TXTIcon, AudioIcon, HelpSquareIcon } from '@/icons';
import { useEffect, useState } from 'react';

interface FileAreaProps {
    file: File;
    index: number;
    progress: number;
    deleteFile: () => void;
    showTooltip: () => void;
    hideTooltip: () => void;
    tooltipVisible: boolean;
}

const FileArea: React.FC<FileAreaProps> = ({
    file,
    index,
    progress,
    deleteFile,
    showTooltip,
    hideTooltip,
    tooltipVisible,
}) => {

    //分割名稱跟副檔名
    const fileParts = file.name.split('.');

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [IconComponent, setIconComponent] = useState<React.FC | null>(null);

    useEffect(() => {
        // console.log(file.type, "======file.type")
        if (file && file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);

            // 清除URL，當組件卸載或文件更改時
            return () => URL.revokeObjectURL(objectUrl);
        }
    }, [file]);

    useEffect(() => {
        if (file && file.type) {
            let icon = null;

            // 檢查文件類型並分配相應的圖標
            if (file.type.startsWith('application/pdf')) {
                icon = PDFIcon;
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || file.type === 'application/vnd.ms-excel') {
                icon = ExcelIcon;
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword') {
                icon = WordIcon;
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || file.type === 'application/vnd.ms-powerpoint') {
                icon = PPTIcon;
            } else if (file.type === 'text/plain') {
                icon = TXTIcon;
            } else if (file.type.startsWith('audio/')) {
                icon = AudioIcon;
            } else {
                icon = HelpSquareIcon; 
            }

            setIconComponent(() => icon); 
        }
    }, [file]);

    const shouldShowTooltip = (fileName: string) => {
        return fileName.length > 15; // 如果文件名長度超過 15 個字符，則顯示 tooltip
    };

    return (
        <div key={index} className="mb-4">
            <div className="flex items-center relative">
                {/* 文件名 */}
                <div
                    className="w-1/4 pixel-art-border mr-4 flex flex-col items-start p-2 relative"
                    onMouseEnter={shouldShowTooltip(file.name) ? showTooltip : undefined}
                    onMouseLeave={hideTooltip}
                >
                    <div className="flex items-center w-full">
                        <div className='w-16 '>
                            {previewUrl ? (
                                <Image src={previewUrl} alt={file.name} layout="intrinsic" width={500} height={500} />
                            ) : (
                                IconComponent && <IconComponent />

                            )}
                        </div>
                        <div className="grid w-full ml-4">
                            <span className="truncate">{fileParts[0]}</span>
                            <span>{fileParts && fileParts[1].toUpperCase()}</span>
                        </div>
                    </div>

                    {/* Tooltip */}
                    {tooltipVisible && shouldShowTooltip(file.name) && (
                        <div className="absolute left-0 bottom-full mb-2 flex items-center justify-start p-2 bg-gray-800 text-white text-lg rounded w-max">
                            {fileParts[0]}
                        </div>
                    )}
                </div>
                {/* 進度部分 */}
                <div className="w-full h-12 pixel-art-border flex items-center justify-center">
                    <p className="pixel-art-font text-lg">{progress}%</p>
                </div>
                {/* 刪除按鈕 */}
                <button onClick={deleteFile} className='ml-4 w-10'>
                    <DeleteIcon />
                </button>
            </div>
        </div>
    );
};

export default FileArea;
