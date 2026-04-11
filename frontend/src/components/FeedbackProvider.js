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

  /* ── Iconos SVG ──────────────────────────────────────────── */
  const SvgCheck = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
  const SvgX = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
  const SvgWarn = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  );
  const SvgInfo = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  );
  const SvgClose = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  );
  const SvgTrash = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  );
  const SvgShield = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );

  const toastConfig = {
    success: { bar: 'bg-emerald-500', bg: 'bg-white', text: 'text-slate-800', icon: <SvgCheck />, iconBg: 'bg-emerald-100 text-emerald-600' },
    error:   { bar: 'bg-rose-500',    bg: 'bg-white', text: 'text-slate-800', icon: <SvgX />,     iconBg: 'bg-rose-100 text-rose-600' },
    warning: { bar: 'bg-amber-400',   bg: 'bg-white', text: 'text-slate-800', icon: <SvgWarn />,  iconBg: 'bg-amber-100 text-amber-600' },
    info:    { bar: 'bg-blue-500',    bg: 'bg-white', text: 'text-slate-800', icon: <SvgInfo />,  iconBg: 'bg-blue-100 text-blue-600' },
  };

  const confirmToneStyles = {
    danger: {
      iconWrap: 'bg-rose-100 text-rose-600',
      icon: <SvgTrash />,
      button: 'bg-rose-600 hover:bg-rose-700 focus:ring-rose-500',
    },
    primary: {
      iconWrap: 'bg-blue-100 text-blue-600',
      icon: <SvgShield />,
      button: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
    },
  };

  const activeConfirmTone = confirmToneStyles[confirmState.tone] || confirmToneStyles.danger;

  return (
    <FeedbackContext.Provider value={value}>
      {children}

      {/* ── Toasts ─────────────────────────────────────────── */}
      <div className="fixed top-4 right-4 z-[200] flex flex-col gap-2.5 w-[92vw] max-w-[360px] pointer-events-none">
        {toasts.map((toast) => {
          const cfg = toastConfig[toast.type] || toastConfig.info;
          return (
            <div
              key={toast.id}
              className={`pointer-events-auto ${cfg.bg} rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-toastIn`}
            >
              {/* barra de color superior */}
              <div className={`h-1 w-full ${cfg.bar}`} />
              <div className="flex items-start gap-3 px-4 py-3">
                <div className={`h-7 w-7 shrink-0 rounded-full flex items-center justify-center mt-0.5 ${cfg.iconBg}`}>
                  {cfg.icon}
                </div>
                <p className={`flex-1 text-sm font-medium leading-5 ${cfg.text}`}>{toast.message}</p>
                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="shrink-0 mt-0.5 text-slate-400 hover:text-slate-600 transition-colors"
                  aria-label="Cerrar"
                >
                  <SvgClose />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Modal de confirmación ───────────────────────────── */}
      {confirmState.open && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[210] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-modalIn overflow-hidden">

            {/* Header con icono */}
            <div className="px-6 pt-6 pb-4 flex flex-col items-center text-center">
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center mb-4 ${activeConfirmTone.iconWrap}`}>
                {activeConfirmTone.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-800">{confirmState.title}</h3>
              <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">{confirmState.message}</p>
            </div>

            {/* Divisor */}
            <div className="h-px bg-slate-100 mx-4" />

            {/* Botones */}
            <div className="flex gap-3 p-4">
              <button
                type="button"
                className="flex-1 btn bg-slate-100 text-slate-700 hover:bg-slate-200 font-semibold"
                onClick={() => closeConfirm(false)}
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                className={`flex-1 btn text-white font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 ${activeConfirmTone.button}`}
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
