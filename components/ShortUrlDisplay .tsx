import React, { useState } from 'react';
import { CheckCircle, Clipboard, Eye } from 'lucide-react';

interface ShortUrlDisplayProps {
    shortUrl: string;
}

const ShortUrlDisplay: React.FC<ShortUrlDisplayProps> = ({ shortUrl }) => {
    const [copied, setCopied] = useState(false);
    const [clickCount, setClickCount] = useState<number | null>(null);
    const [createdAt, setCreatedAt] = useState<string | null>(null);

    // 使用正則表達式提取 shortId
    const shortId = shortUrl.split('/').pop();

    const handleCopy = () => {
        navigator.clipboard.writeText(shortUrl).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
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
        } else {
            console.error('Error fetching click count:', data.error);
        }
    };

    return (
        shortUrl && (
            <div className="flex flex-col items-center mt-4 pixel-art-url-container">
                <span className="text-gray-700 font-semibold pixel-art-font">Your shortened URL:</span>
                <div className="flex items-center mt-2">
                    <a href={shortUrl} className="text-pixel-green font-bold pixel-art-font bg-gray-100 border border-black p-4 rounded-md">
                        {shortUrl}
                    </a>
                    <button onClick={handleCopy} className="ml-2 p-2 bg-gray-100 border border-black rounded-md pixel-art-button">
                        {copied ? <CheckCircle className="h-6 w-6" /> : <Clipboard className="h-6 w-6" />}
                    </button>
                    <button onClick={handleShowClicks} className="ml-2 p-2 bg-gray-100 border border-black rounded-md pixel-art-button">
                        <Eye className="h-6 w-6" />
                    </button>
                </div>
                {clickCount !== null && createdAt && (
                    <div className="mt-2 text-gray-700 pixel-art-font">
                        From <span className="text-lg font-bold">{new Date(createdAt).toLocaleDateString()}</span> to today, there have been <span className="text-lg font-bold">{clickCount}</span> clicks💕💕💕!
                    </div>
                )}
            </div>
        )
    );
};

export default ShortUrlDisplay;
