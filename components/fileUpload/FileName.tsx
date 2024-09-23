'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PDFIcon, ExcelIcon, WordIcon, PPTIcon, TXTIcon, AudioIcon, HelpSquareIcon, ImageIcon } from '@/icons';

interface FileNameProps {
    fileName?: string; // 可選，當僅顯示文件名時使用
    file?: File; // 可選，當需要顯示文件預覽時使用
    showTooltip?: () => void;
    hideTooltip?: () => void;
    tooltipVisible?: boolean;
}

const FileName: React.FC<FileNameProps> = ({
    fileName,
    file,
    showTooltip,
    hideTooltip,
    tooltipVisible,
}) => {
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [IconComponent, setIconComponent] = useState<React.FC | null>(null);
    const [name, setName] = useState<string>('');
    const [extension, setExtension] = useState<string>('');

    useEffect(() => {
        if (file) {
            const fileParts = file.name.split('.');
            setName(fileParts[0]);
            setExtension(fileParts[1].toUpperCase());

            if (file.type.startsWith('image/')) {
                const objectUrl = URL.createObjectURL(file);
                setPreviewUrl(objectUrl);
                return () => URL.revokeObjectURL(objectUrl);
            }

            if (file.type) {
                assignIcon(file.type);
            }
        } else if (fileName) {
            const fileParts = fileName.split('.');
            setName(fileParts[0]);
            setExtension(fileParts[1] ? fileParts[1].toUpperCase() : '');

            assignIconFromExtension(fileParts[1]);
        }
    }, [file, fileName]);

    const assignIcon = (fileType: string) => {
        let icon = null;

        if (fileType.startsWith('application/pdf')) {
            icon = PDFIcon;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileType === 'application/vnd.ms-excel') {
            icon = ExcelIcon;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileType === 'application/msword') {
            icon = WordIcon;
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation' || fileType === 'application/vnd.ms-powerpoint') {
            icon = PPTIcon;
        } else if (fileType === 'text/plain') {
            icon = TXTIcon;
        } else if (fileType.startsWith('audio/')) {
            icon = AudioIcon;
        } else {
            icon = HelpSquareIcon;
        }

        setIconComponent(() => icon);
    };

    const assignIconFromExtension = (fileExtension: string) => {
        let icon = null;

        switch (fileExtension.toLowerCase()) {
            case 'pdf':
                icon = PDFIcon;
                break;
            case 'xlsx':
            case 'xls':
                icon = ExcelIcon;
                break;
            case 'docx':
            case 'doc':
                icon = WordIcon;
                break;
            case 'pptx':
            case 'ppt':
                icon = PPTIcon;
                break;
            case 'txt':
                icon = TXTIcon;
                break;
            case 'mp3':
            case 'mp4':
            case 'wav':
                icon = AudioIcon;
                break;
            case 'png':
            case 'jpg':
            case 'jpeg':
            case 'gif':
            case 'svg':
                icon = ImageIcon;
                break;
            default:
                icon = HelpSquareIcon;
                break;
        }

        setIconComponent(() => icon);
    };

    const shouldShowTooltip = (name: string) => {
        return name.length > 15;
    };

    return (
        <div
            className="w-1/4 pixel-art-border mr-4 flex flex-col items-start p-2 relative"
            onMouseEnter={shouldShowTooltip(name) ? showTooltip : undefined}
            onMouseLeave={hideTooltip}
        >
            <div className="flex items-center w-full">
                <div className='w-16'>
                    {previewUrl ? (
                        <Image src={previewUrl} alt={fileName!} layout="intrinsic" width={500} height={500} />
                    ) : (
                        IconComponent && <IconComponent />
                    )}
                </div>
                <div className="grid w-full ml-4">
                    <span className="truncate">{name}</span>
                    <span>{extension}</span>
                </div>
            </div>

            {tooltipVisible && shouldShowTooltip(name) && (
                <div className="absolute left-0 bottom-full mb-2 flex items-center justify-start p-2 bg-gray-800 text-white text-lg rounded w-max">
                    {name}
                </div>
            )}
        </div>
    );
};

export default FileName;
