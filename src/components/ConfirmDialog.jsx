import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ConfirmDialog = ({
  isOpen,
  title = 'Confirm Action',
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-emerald-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-white border border-emerald-100 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isDestructive ? 'bg-emerald-100 text-emerald-900' : 'bg-emerald-50 text-emerald-800'}`}>
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-emerald-950">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="p-1 rounded-xl text-emerald-700 hover:bg-emerald-50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-sm text-emerald-900/80 leading-relaxed pl-1">{message}</p>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-emerald-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all cursor-pointer ${
              isDestructive
                ? 'bg-emerald-900 hover:bg-emerald-950'
                : 'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
