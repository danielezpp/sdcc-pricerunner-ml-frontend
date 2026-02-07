import React, { useState, useCallback } from "react";
import { ToastContext } from "./ToastContext";
import { IconCheck, IconAlert, IconZap } from "./icons";

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((type, title, message) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const toastValue = {
    success: (title, msg) => addToast("success", title, msg),
    error: (title, msg) => addToast("error", title, msg),
    info: (title, msg) => addToast("info", title, msg),
  };

  return (
    <ToastContext.Provider value={toastValue}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            <div style={{ color: t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--primary)' }}>
               {t.type === 'success' && <IconCheck />}
               {t.type === 'error' && <IconAlert />}
               {t.type === 'info' && <IconZap />}
            </div>
            <div className="toast-content">
              <div className="toast-title">{t.title}</div>
              {t.message && <div className="toast-message">{t.message}</div>}
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}