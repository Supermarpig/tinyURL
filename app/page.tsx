'use client';

import { useState, FormEvent } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from "@/components/ui/button"
import ErrorAlert from '@/components/ErrorAlert';
import { toast } from "sonner"

export default function Home() {
  const [longUrl, setLongUrl] = useState<string>('');
  const [shortUrl, setShortUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);// 重置錯誤狀態

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl }),
      });

      if (res.ok) {
        const data = await res.json();
        setShortUrl(data.shortUrl);
      } else {
        const data = await res.json();
        toast(
          (data.error || 'Failed to shorten URL'), 
          (data.error || 'Failed to shorten URL', {
            description: "這個網站有問題呀呀呀~~~😦😧😨😰😥😱",
            action: {
              label: "Undo",
              onClick: () => console.log("Undo"),
            },
          })
        );
      }
    } catch (error) {
      console.error('Error shortening URL:', error);
      toast('Error shortening URL');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-green-500">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-blue-600 text-center">Short URL Service</h1>
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col items-center">
          <input
            type="url"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            placeholder="Enter your URL"
            className="border p-2 mb-4 w-full text-gray-400 font-bold"
            required
          />
          <Button type="submit" className="bg-green-500 text-white p-2 rounded w-full flex items-center justify-center">
            Shorten {loading && <LoadingSpinner />}
          </Button>
        </form>
        {shortUrl && (
          <div className="flex items-center justify-end">
            <a href={shortUrl} className="text-green-600 underline font-bold">{shortUrl}</a>
          </div>
        )}
      </div>
    </div>
  );
}
