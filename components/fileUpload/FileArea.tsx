'use client'

import { DeleteIcon } from '@/icons';
import { formatFileSize } from '@/utils/fileSize'
import FileName from './FileName';

interface FileAreaProps {
    file: File;
    index: number;
    progress: number;
    deleteFile: () => void;
    showTooltip: () => void;
    hideTooltip: () => void;
    tooltipVisible: boolean;
    fileSize: number;
}

const FileArea: React.FC<FileAreaProps> = ({
    file,
    index,
    progress,
    deleteFile,
    showTooltip,
    hideTooltip,
    tooltipVisible,
    fileSize
}) => {

    return (
        <div key={index} className="mb-4">
            <div className="flex items-center relative">
                {/* 文件名 */}
                <FileName
                    file={file}
                    showTooltip={showTooltip}
                    hideTooltip={hideTooltip}
                    tooltipVisible={tooltipVisible}
                />
                {/* 進度部分 */}
                <div className="w-full h-12 pixel-art-border flex items-center justify-center relative">
                    <div className="w-full h-full bg-gray-200 rounded">
                        {progress && <div
                            className="h-full bg-green-400 "
                            style={{ width: `${progress}%` }}
                        />}
                    </div>
                    <p className="pixel-art-font text-lg absolute">{progress ? `${progress}%` : '0%'}</p>
                </div>
                {/* 檔案大小 */}
                <div className='flex items-center justify-end ml-4 w-40 truncate'>{formatFileSize(fileSize)}</div>
                {/* 刪除按鈕 */}
                <button onClick={deleteFile} className='ml-4 w-10'>
                    <DeleteIcon />
                </button>
            </div>
        </div>
    );
};

export default FileArea;
