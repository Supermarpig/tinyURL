'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import InfoDialog from '@/components/InfoDialog';
import ShortUrlDisplay from '@/components/ShortUrlDisplay ';

const schema = z.object({
  longUrl: z.string().url('Invalid URL format').nonempty('URL is required'),
  title: z.string().optional(),
  description: z.string().optional(),
  imageUrl: z.string().optional()
});

type FormData = z.infer<typeof schema>;

export default function Home() {
  const [shortUrl, setShortUrl] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const { register, handleSubmit, formState: { errors }, trigger } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    setLoading(true);

    const updateData: Partial<FormData> = {};
    if (title) updateData.title = title;
    if (description) updateData.description = description;
    if (imageUrl) updateData.imageUrl = imageUrl;

    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ longUrl: data.longUrl, ...updateData }),
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
    <div className="flex items-center justify-center min-h-screen p-8">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-xl pixel-art-border">
        <h1 className="text-2xl font-bold mb-4 text-pixel-red text-center pixel-art-font">Short URL Service</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="mb-4 flex flex-col items-center">
          <div className="mb-4 w-full">
            <span className="text-gray-700 font-semibold pixel-art-font">URL:</span>
            <input
              type="url"
              {...register('longUrl', { onBlur: () => trigger('longUrl') })}
              placeholder="Enter your URL"
              className="w-full border p-2 text-gray-600 rounded-md bg-gray-100 pixel-art-input truncate"
              required
            />
            {errors.longUrl && <p className="text-pixel-red">{errors.longUrl.message}</p>}
          </div>
          {title && (
            <div className="mb-4 w-full">
              <span className="text-gray-700 font-semibold pixel-art-font">Title:</span>
              <div className="border p-2 text-gray-600 rounded-md bg-gray-100 pixel-art-input">{title}</div>
            </div>
          )}
          {description && (
            <div className="mb-4 w-full">
              <span className="text-gray-700 font-semibold pixel-art-font">Description:</span>
              <div className="border p-2 text-gray-600 rounded-md bg-gray-100 pixel-art-input">{description}</div>
            </div>
          )}
          {imageUrl && (
            <div className="mb-4 w-full">
              <span className="text-gray-700 font-semibold pixel-art-font">Image URL:</span>
              <div className="border p-2 text-gray-600 rounded-md bg-gray-100 overflow-hidden text-ellipsis whitespace-nowrap pixel-art-input">{imageUrl}</div>
            </div>
          )}
          <Button type="submit" className="bg-pixel-green text-white p-2 rounded w-full flex items-center justify-center pixel-art-button">
            Shorten {loading && <LoadingSpinner />}
          </Button>
        </form>

        <InfoDialog onSubmit={handleMoreInfoSubmit} initialValues={{ title, description, imageUrl }} />

        {shortUrl && (
          <ShortUrlDisplay shortUrl={shortUrl} />
        )}

      </div>
      <Toaster />
    </div>
  );
}