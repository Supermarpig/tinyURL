
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ClientRedirect: React.FC = () => {
    const [countdown, setCountdown] = useState(5);
    const router = useRouter();

    useEffect(() => {
        const timer = setInterval(() => {
            setCountdown((prevCountdown) => prevCountdown - 1);
        }, 1000);

        if (countdown === 0) {
            router.push('/');
        }

        return () => clearInterval(timer);
    }, [countdown, router]);

    return (
        <p className="text-lg text-gray-600 mb-8">
            Redirecting to home in {countdown} seconds...
        </p>
    );
};

export default ClientRedirect;
