'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import InfoDialog from '@/components/InfoDialog';

const schema = z.object({
  longUrl: z.string().url('Invalid URL format').nonempty('URL is required'),
});

type FormData = z.infer<typeof schema>;

export default function Home() {
  const [shortUrl, setShortUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl: data.longUrl, title, description, imageUrl }),
      });

      if (res.ok) {
        const result = await res.json();
        setShortUrl(result.shortUrl);
      } else {
        const result = await res.json();
        toast.error(result.error || 'Failed to shorten URL', {
          description: 'Please check the URL and try again.',
        });
      }
    } catch (error) {
      console.error('Error shortening URL:', error);
      toast.error('Failed to shorten URL', {
        description: 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMoreInfoSubmit = (data: { title: string, description: string, imageUrl: string }) => {
    setTitle(data.title);
    setDescription(data.description);
    setImageUrl(data.imageUrl);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-green-500">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-blue-600 text-center">Short URL Service</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 flex flex-col items-center">
          <div className="mb-4 w-full">
            <span className="text-gray-700 font-semibold">URL:</span>
            <input
              type="url"
              {...register('longUrl', { onBlur: () => trigger('longUrl') })}
              placeholder="Enter your URL"
              className="w-full border p-2 text-gray-600 rounded-md bg-gray-100"
              required
            />
            {errors.longUrl && <p className="text-red-500">{errors.longUrl.message}</p>}
          </div>
          {title && (
            <div className="mb-4 w-full">
              <span className="text-gray-700 font-semibold">Title:</span>
              <div className="border p-2 text-gray-600 rounded-md bg-gray-100">{title}</div>
            </div>
          )}
          {description && (
            <div className="mb-4 w-full">
              <span className="text-gray-700 font-semibold">Description:</span>
              <div className="border p-2 text-gray-600 rounded-md bg-gray-100">{description}</div>
            </div>
          )}
          {imageUrl && (
            <div className="mb-4 w-full">
              <span className="text-gray-700 font-semibold">Image URL:</span>
              <div className="border p-2 text-gray-600 rounded-md bg-gray-100 overflow-hidden text-ellipsis whitespace-nowrap">{imageUrl}</div>
            </div>
          )}
          <Button type="submit" className="bg-green-500 text-white p-2 rounded w-full flex items-center justify-center">
            Shorten {loading && <LoadingSpinner />}
          </Button>
        </form>

        <InfoDialog onSubmit={handleMoreInfoSubmit} initialValues={{ title, description, imageUrl }} />

        {shortUrl && (
          <div className="flex items-center justify-end">
            <a href={shortUrl} className="text-green-600 underline font-bold">{shortUrl}</a>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}
