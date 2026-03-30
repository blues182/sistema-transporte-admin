import React from 'react';

export function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', confirmClass = 'btn btn-danger' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl mt-0.5">⚠️</span>
          <div>
            <h3 className="text-lg font-bold text-gray-800">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onCancel} className="btn btn-secondary">
            Cancelar
          </button>
          <button onClick={onConfirm} className={confirmClass}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
