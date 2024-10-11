import React, { useState } from 'react';
import { CheckCircle, Clipboard, Eye } from 'lucide-react';
import TinyUrlMoreInfo from '@/components/TinyUrlMoreInfo'
import { toast } from "sonner";

interface ShortUrlDisplayProps {
    shortUrl: string;
}

const ShortUrlDisplay: React.FC<ShortUrlDisplayProps> = ({ shortUrl }) => {
    const [copied, setCopied] = useState(false);
    const [clickCount, setClickCount] = useState<number | null>(null);
    const [createdAt, setCreatedAt] = useState<string | null>(null);
    const [detailedInfo, setDetailedInfo] = useState<any | null>(null);

    // 使用正則表達式提取 shortId
    const shortId = shortUrl.split('/').pop();

    const handleCopy = () => {
        navigator.clipboard.writeText(shortUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
        toast("Copy successful🥳🙌🌟")
    };

    const handleShowClicks = async () => {
        const response = await fetch('/api/getClickCount', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ shortId }),
        });

        const data = await response.json();
        if (response.ok) {
            setClickCount(data.clickCount);
            setCreatedAt(data.createdAt);
            setDetailedInfo(data.detailedInfo); // 存儲更多詳細信息
            toast("Success! More detailed information acquired! 🎉📈🙌")
            console.log(data,"===============detailedInfo")
        } else {
            console.error('Error fetching click count:', data.error);
        }
    };

    if (!shortId) return null;

    return (
        shortUrl && (
            <div className="flex flex-col items-center mt-4 pixel-art-url-container">
                <span className="text-gray-700 font-semibold pixel-art-font">Your shortened URL:</span>
                <div className="flex items-center mt-2 w-full flex-col">
                    <a href={shortUrl} className="text-pixel-green font-bold pixel-art-font bg-gray-100 border border-black p-4 rounded-md truncate w-full">
                        {shortUrl}
                    </a>
                    <div className='flex gap-4 mt-4'>
                        <button onClick={handleCopy} className="ml-2 p-2 bg-gray-100 border border-black rounded-md pixel-art-button">
                            {copied ? <CheckCircle className="h-6 w-6" /> : <Clipboard className="h-6 w-6" />}
                        </button>
                        <button onClick={handleShowClicks} className="ml-2 p-2 bg-gray-100 border border-black rounded-md pixel-art-button">
                            <Eye className="h-6 w-6" />
                        </button>
                    </div>
                </div>
                {clickCount !== null && createdAt && (
                    <div className="mt-2 text-gray-700 pixel-art-font">
                        From <span className="text-lg font-bold">{new Date(createdAt).toLocaleDateString()}</span> to today, there have been <span className="text-lg font-bold">{clickCount}</span> clicks💕💕💕!
                        <TinyUrlMoreInfo shortUrl={shortUrl} visits={detailedInfo} />
                    </div>
                )}
            </div>
        )
    );
};

export default ShortUrlDisplay;