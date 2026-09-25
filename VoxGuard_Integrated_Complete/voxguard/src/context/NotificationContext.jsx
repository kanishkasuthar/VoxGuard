import React, { createContext, useContext, useState } from "react";
import { FiCheckCircle, FiAlertTriangle, FiInfo, FiX, FiAlertOctagon } from "react-icons/fi";


const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info", duration = 4000) => {
    const id = `${Date.now()}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      removeToast(id);
    }, duration);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <NotificationContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl shadow-lg border text-sm font-medium transition-all transform duration-300 animate-slide-in ${
              toast.type === "success"
                ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                : toast.type === "error" || toast.type === "threat"
                ? "bg-rose-50 border-rose-200 text-rose-900"
                : toast.type === "warning"
                ? "bg-amber-50 border-amber-200 text-amber-900"
                : "bg-indigo-50 border-indigo-200 text-indigo-900"
            }`}
          >
            <div className="text-lg mt-0.5 shrink-0">
              {toast.type === "success" && <FiCheckCircle className="text-emerald-600" />}
              {(toast.type === "error" || toast.type === "threat") && <FiAlertOctagon className="text-rose-600" />}
              {toast.type === "warning" && <FiAlertTriangle className="text-amber-600" />}

              {toast.type === "info" && <FiInfo className="text-indigo-600" />}
            </div>
            <div className="flex-1">{toast.message}</div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 p-1"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useToast = () => useContext(NotificationContext);
