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

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
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
    success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    error: 'border-rose-200 bg-rose-50 text-rose-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    info: 'border-blue-200 bg-blue-50 text-blue-900',
  };

  const toastIcons = {
    success: '✓',
    error: 'x',
    warning: '!',
    info: 'i',
  };

  const confirmToneStyles = {
    danger: {
      chip: 'bg-rose-100 text-rose-700 border border-rose-200',
      button: 'bg-rose-600 hover:bg-rose-700',
      icon: '!',
    },
    primary: {
      chip: 'bg-blue-100 text-blue-700 border border-blue-200',
      button: 'bg-blue-600 hover:bg-blue-700',
      icon: 'i',
    },
  };

  const activeConfirmTone = confirmToneStyles[confirmState.tone] || confirmToneStyles.danger;

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      <div className="fixed top-4 right-4 z-[100] space-y-3 w-[92vw] max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`border rounded-xl shadow-lg px-3.5 py-3 text-sm animate-toastIn ${toastStyles[toast.type] || toastStyles.info}`}
          >
            <div className="flex items-start gap-3">
              <div className="h-6 w-6 shrink-0 rounded-full bg-white/80 border border-black/5 flex items-center justify-center text-xs font-bold mt-0.5">
                {toastIcons[toast.type] || toastIcons.info}
              </div>
              <div className="flex-1 pr-1 leading-5 font-medium">{toast.message}</div>
              <button
                type="button"
                className="opacity-70 hover:opacity-100 text-sm leading-none mt-0.5"
                onClick={() => removeToast(toast.id)}
                aria-label="Cerrar notificacion"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>

      {confirmState.open && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-md w-full p-6 animate-modalIn">
            <div className="flex items-start gap-3">
              <div className={`h-10 w-10 shrink-0 rounded-xl flex items-center justify-center font-bold ${activeConfirmTone.chip}`}>
                {activeConfirmTone.icon}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-800 leading-6">{confirmState.title}</h3>
                <p className="text-slate-600 mt-2 leading-6">{confirmState.message}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="btn bg-slate-100 text-slate-700 hover:bg-slate-200"
                onClick={() => closeConfirm(false)}
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                className={`btn text-white ${activeConfirmTone.button}`}
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
