import React from "react";
import { FiX } from "react-icons/fi";

export const Modal = ({ isOpen, onClose, title, children, footer, maxWidth = "max-w-xl" }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className={`bg-white rounded-2xl w-full ${maxWidth} border border-slate-200 shadow-xl overflow-hidden animate-slide-in`}>
        {title && (
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <h3 className="font-bold text-slate-900 text-base">{title}</h3>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
            >
              <FiX className="text-lg" />
            </button>
          </div>
        )}

        <div className="p-6 max-h-[75vh] overflow-y-auto">{children}</div>

        {footer && <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-end gap-3">{footer}</div>}
      </div>
    </div>
  );
};
