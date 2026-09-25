import React from "react";
import { FiCheckCircle, FiShield, FiSlash, FiLock } from "react-icons/fi";

export const CallActionPanel = ({ onAction, callId }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <FiLock className="text-indigo-600" /> Active Security Enforcement Policy
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">
          Select an instantaneous SOC prevention action for Call ID: <span className="font-mono text-slate-700 font-semibold">{callId}</span>
        </p>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto">
        {/* Allow Button */}
        <button
          onClick={() => onAction("ALLOW")}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
        >
          <FiCheckCircle className="text-sm" /> Allow Call
        </button>

        {/* Verify Button */}
        <button
          onClick={() => onAction("VERIFY")}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs shadow-sm transition-all active:scale-95"
        >
          <FiShield className="text-sm" /> Request Step-Up Auth
        </button>

        {/* Block Button */}
        <button
          onClick={() => onAction("BLOCK")}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-sm transition-all active:scale-95"
        >
          <FiSlash className="text-sm" /> Block & Isolate
        </button>
      </div>
    </div>
  );
};
