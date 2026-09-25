import React from "react";
import { FiCheckCircle, FiAlertOctagon, FiCpu } from "react-icons/fi";

export const VoiceFingerprint = ({ isMatch = false }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
          <FiCpu className="text-blue-600" /> Voice Fingerprint Comparison
        </h4>
        <span
          className={`px-2 py-0.5 rounded font-mono font-bold text-xs ${
            isMatch ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
          }`}
        >
          {isMatch ? "✓ MATCH (AUTHENTIC)" : "⚠️ MISMATCH (SYNTHETIC CLONE)"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Registered Pattern */}
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2">
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block">
            Registered Profile #882 Pattern
          </span>
          <div className="h-16 flex items-center justify-center gap-1 bg-white p-2 rounded border border-slate-200">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{ height: `${Math.sin(i * 0.4) * 40 + 45}%` }}
                className="w-1.5 rounded bg-blue-600"
              />
            ))}
          </div>
          <span className="text-[10px] font-mono text-emerald-700 block">✓ Harmonic Glottal Tremor Present</span>
        </div>

        {/* Analyzed Pattern */}
        <div className={`p-3 rounded-lg border space-y-2 ${isMatch ? "bg-emerald-50/50 border-emerald-200" : "bg-rose-50/50 border-rose-200"}`}>
          <span className="text-[10px] font-mono text-slate-500 font-bold uppercase block">
            Analyzed Stream Pattern
          </span>
          <div className="h-16 flex items-center justify-center gap-1 bg-white p-2 rounded border border-slate-200">
            {Array.from({ length: 24 }).map((_, i) => (
              <div
                key={i}
                style={{
                  height: isMatch
                    ? `${Math.sin(i * 0.4) * 40 + 45}%`
                    : `${Math.random() * 85 + 10}%`
                }}
                className={`w-1.5 rounded ${isMatch ? "bg-emerald-500" : "bg-rose-500"}`}
              />
            ))}
          </div>
          <span className={`text-[10px] font-mono block ${isMatch ? "text-emerald-700" : "text-rose-700"}`}>
            {isMatch ? "✓ Biometric Distance: 0.04 (Identical)" : "⚠️ Biometric Distance: 0.78 (Discrepancy)"}
          </span>
        </div>
      </div>
    </div>
  );
};
