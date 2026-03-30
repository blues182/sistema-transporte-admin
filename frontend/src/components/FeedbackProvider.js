import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

const FeedbackContext = createContext(null);

let toastCounter = 0;

function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: '',
    message: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    tone: 'danger',
    resolve: null,
  });

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toastCounter;
    setToasts((prev) => [...prev, { id, message, type }]);

    window.setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, duration);
  }, []);

  const confirmAction = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setConfirmState({
        open: true,
        title: options.title || 'Confirmar accion',
        message: options.message || 'Esta accion no se puede deshacer.',
        confirmText: options.confirmText || 'Confirmar',
        cancelText: options.cancelText || 'Cancelar',
        tone: options.tone || 'danger',
        resolve,
      });
    });
  }, []);

  const closeConfirm = useCallback((accepted) => {
    if (confirmState.resolve) {
      confirmState.resolve(accepted);
    }

    setConfirmState((prev) => ({
      ...prev,
      open: false,
      resolve: null,
    }));
  }, [confirmState]);

  const value = useMemo(() => ({
    showToast,
    confirmAction,
  }), [showToast, confirmAction]);

  const toastStyles = {
    success: 'bg-green-600 text-white',
    error: 'bg-red-600 text-white',
    warning: 'bg-amber-500 text-white',
    info: 'bg-slate-700 text-white',
  };

  const confirmButtonClass = confirmState.tone === 'danger'
    ? 'bg-red-600 hover:bg-red-700'
    : 'bg-blue-600 hover:bg-blue-700';

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="fixed top-4 right-4 z-[100] space-y-3 w-[90vw] max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`rounded-xl shadow-lg px-4 py-3 text-sm font-medium animate-[fadeIn_200ms_ease-out] ${toastStyles[toast.type] || toastStyles.info}`}
          >
            {toast.message}
          </div>
        ))}
      </div>

      {confirmState.open && (
        <div className="fixed inset-0 bg-black/45 z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-800">{confirmState.title}</h3>
            <p className="text-gray-600 mt-2">{confirmState.message}</p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => closeConfirm(false)}
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                className={`btn text-white ${confirmButtonClass}`}
                onClick={() => closeConfirm(true)}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </FeedbackContext.Provider>
  );
}

function useFeedback() {
  const context = useContext(FeedbackContext);

  if (!context) {
    throw new Error('useFeedback debe usarse dentro de FeedbackProvider');
  }

  return context;
}

export { FeedbackProvider, useFeedback };
