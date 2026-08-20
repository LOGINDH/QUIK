import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingSpinner = ({ size = 'md', message = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-7 h-7',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const content = (
    <div className="flex flex-col items-center justify-center p-6 gap-3 text-center">
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-100/60 animate-ping opacity-75" />
        <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-emerald-800 animate-spin relative z-10`} />
      </div>
      {message && (
        <p className="text-sm font-medium text-emerald-900 tracking-wide">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-[#FAF8F5]/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="bg-white border border-emerald-100 shadow-xl rounded-2xl p-6 max-w-xs mx-4">
          {content}
        </div>
      </div>
    );
  }

  return content;
};

export default LoadingSpinner;
