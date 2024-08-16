import { Metadata } from 'next';

export const metadata: Metadata = {
    title: '檔案上傳',
    description: '大文件上傳 Big size file uploading',
};
export default async function Layout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className='mx-auto h-full'>
            {children}
        </div>
    );
}
