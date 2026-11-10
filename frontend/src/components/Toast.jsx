import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showSuccess = (msg) => addToast(msg, 'success');
  const showError = (msg) => addToast(msg, 'error');
  const showInfo = (msg) => addToast(msg, 'info');
  const showWarning = (msg) => addToast(msg, 'warning');

  return (
    <ToastContext.Provider value={{ showSuccess, showError, showInfo, showWarning, addToast }}>
      {children}
      {/* Floating Toast Notification Container */}
      <div className="fixed top-5 right-5 z-[9999] flex flex-col space-y-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start p-4 rounded-xl shadow-2xl border transition-all duration-300 transform animate-in slide-in-from-top-3 ${
              toast.type === 'success'
                ? 'bg-emerald-900/95 text-emerald-100 border-emerald-500/40 backdrop-blur-md'
                : toast.type === 'error'
                ? 'bg-rose-900/95 text-rose-100 border-rose-500/40 backdrop-blur-md'
                : toast.type === 'warning'
                ? 'bg-amber-900/95 text-amber-100 border-amber-500/40 backdrop-blur-md'
                : 'bg-slate-900/95 text-slate-100 border-slate-700 backdrop-blur-md'
            }`}
          >
            <div className="mr-3 mt-0.5 flex-shrink-0">
              {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400" />}
              {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              {toast.type === 'info' && <Info className="w-5 h-5 text-sky-400" />}
            </div>
            <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
              {toast.message}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-3 text-slate-400 hover:text-white transition-colors focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
