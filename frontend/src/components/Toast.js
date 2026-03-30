import React, { useEffect } from 'react';

export function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] space-y-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), toast.duration || 3500);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onRemove]);

  const styles = {
    success: 'bg-green-500 text-white',
    error: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    warning: 'bg-yellow-400 text-gray-900',
  };

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  };

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg min-w-[260px] max-w-sm ${styles[toast.type] || styles.info}`}
      style={{ animation: 'slideIn 0.2s ease-out' }}
    >
      <span className="text-lg font-bold">{icons[toast.type] || icons.info}</span>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="opacity-75 hover:opacity-100 text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}

// Hook para manejar toasts
let toastId = 0;
export function useToast() {
  const [toasts, setToasts] = React.useState([]);

  const addToast = React.useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const removeToast = React.useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = React.useMemo(() => ({
    success: (msg) => addToast(msg, 'success'),
    error: (msg) => addToast(msg, 'error'),
    info: (msg) => addToast(msg, 'info'),
    warning: (msg) => addToast(msg, 'warning'),
  }), [addToast]);

  return { toasts, removeToast, toast };
}
