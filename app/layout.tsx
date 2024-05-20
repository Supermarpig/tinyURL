import { Inter } from 'next/font/google';
import { Toaster } from "@/components/ui/sonner";
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  metadataBase: new URL(process.env.BASE_URL || 'http://localhost:3000'),
  title: 'Fast, Secure URL Shortener',
  description: 'Generate and manage short URLs with powerful analytics.',
  openGraph: {
    type: 'website',
    url: process.env.BASE_URL || 'http://localhost:3000',
    title: 'Fast, Secure URL Shortener',
    description: 'Generate and manage short URLs with powerful analytics.',
    images: [
      {
        url: '/default-og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fast, Secure URL Shortener',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    url: process.env.BASE_URL || 'http://localhost:3000',
    title: 'Fast, Secure URL Shortener',
    description: 'Generate and manage short URLs with powerful analytics.',
    image: '/default-twitter-image.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
      <Toaster />
    </html>
  );
}
