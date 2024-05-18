'use client';

import { useState, FormEvent } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function Home() {
  const [longUrl, setLongUrl] = useState<string>('');
  const [shortUrl, setShortUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); // 设置加载状态为 true

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl }),
      });

      const data = await res.json();
      setShortUrl(data.shortUrl);
    } catch (error) {
      console.error('Error shortening URL:', error);
    } finally {
      setLoading(false); // 请求完成后设置加载状态为 false
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
            className="border p-2 mb-4 w-full text-gray-200"
            required
          />
          <button type="submit" className="bg-green-500 text-white p-2 rounded w-full flex items-center justify-center">
            Shorten {loading && <LoadingSpinner />}
          </button>
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
