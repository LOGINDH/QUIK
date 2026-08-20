import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

const ErrorMessage = ({ message, onRetry, className = '' }) => {
  if (!message) return null;

  return (
    <div
      className={`bg-emerald-50/90 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-2xl flex items-start gap-3 shadow-sm ${className}`}
      role="alert"
    >
      <div className="p-1 rounded-lg bg-emerald-100 text-emerald-800 flex-shrink-0 mt-0.5">
        <AlertCircle className="w-5 h-5" />
      </div>
      <div className="flex-1 text-sm">
        <p className="font-semibold text-emerald-900">Attention</p>
        <p className="text-emerald-800/90 mt-0.5 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="flex-shrink-0 text-xs font-semibold px-3 py-1.5 bg-white border border-emerald-300 text-emerald-900 rounded-xl hover:bg-emerald-100/50 transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
