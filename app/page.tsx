'use client';

import { useState, FormEvent } from 'react';

export default function Home() {
  const [longUrl, setLongUrl] = useState<string>('');
  const [shortUrl, setShortUrl] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/shorten', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ longUrl }),  
    });

    const data = await res.json();
    setShortUrl(data.shortUrl);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-orange-600 text-center">Short URL Service</h1>
        <form onSubmit={handleSubmit} className="mb-4 flex flex-col items-center">
          <input
            type="url"
            value={longUrl}  
            onChange={(e) => setLongUrl(e.target.value)}  
            placeholder="Enter your URL"
            className="border p-2 mb-4 w-full text-gray-400"
            required
          />
          <button type="submit" className="bg-orange-500 text-white p-2 rounded w-full">Shorten</button>
        </form>
        {shortUrl && (
          <div className="flex items-center justify-end">
            <a href={shortUrl} className="text-orange-600 underline">{shortUrl}</a>
          </div>
        )}
      </div>
    </div>
  );
}
