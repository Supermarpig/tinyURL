// components/LoadingSpinner.tsx
import React from 'react';

const LoadingSpinner: React.FC = () => {
    return (
        <div className="flex items-center justify-center space-x-2 ml-4">
            <div className="w-4 h-4 border-2 border-white border-t-transparent border-t-4 rounded-full animate-spin"></div>
        </div>
    );
};

export default LoadingSpinner;
