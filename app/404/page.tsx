'use client';

import Link from 'next/link';
import ClientRedirect from './ClientRedirect';

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
            <p className="text-lg text-gray-600 mb-4">Sorry, the page you are looking for does not exist.</p>
            <ClientRedirect />
            <Link href="/" className="bg-blue-500 text-white px-4 py-2 rounded">
                Go Back Home
            </Link>
        </div>
    );
}
