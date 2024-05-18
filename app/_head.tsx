import Head from 'next/head';

interface CustomHeadProps {
    title: string;
    description: string;
    url: string;
    image: string;
}

const CustomHead = ({ title, description, url, image }: CustomHeadProps) => {
    console.log('CustomHead rendered with:', { title, description, url, image }); // 调试日志

    return (
        <Head>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>{title}</title>
            <meta name="description" content={description} />
            <meta property="og:type" content="website" />
            <meta property="og:url" content={url} />
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={image} />
        </Head>
    );
};

export default CustomHead;
