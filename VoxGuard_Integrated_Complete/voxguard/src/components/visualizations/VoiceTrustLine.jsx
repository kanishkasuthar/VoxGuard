import React from "react";
import { motion } from "framer-motion";

export const VoiceTrustLine = ({ 
  currentState = "TRUSTED", // TRUSTED, ANALYZING, SUSPICIOUS, HIGH_RISK, BLOCKED
  riskScore = 18, 
  showScoreContinuum = true,
  className = "" 
}) => {
  const states = [
    { key: "TRUSTED", label: "TRUSTED", color: "bg-emerald-500", textColor: "text-emerald-700", borderColor: "border-emerald-500" },
    { key: "ANALYZING", label: "ANALYZING", color: "bg-blue-500", textColor: "text-blue-700", borderColor: "border-blue-500" },
    { key: "SUSPICIOUS", label: "SUSPICIOUS", color: "bg-amber-500", textColor: "text-amber-700", borderColor: "border-amber-500" },
    { key: "HIGH_RISK", label: "HIGH RISK", color: "bg-rose-500", textColor: "text-rose-700", borderColor: "border-rose-500" },
    { key: "BLOCKED", label: "BLOCKED", color: "bg-slate-900", textColor: "text-slate-900", borderColor: "border-slate-900" }
  ];

  const activeIndex = states.findIndex(s => s.key === currentState) !== -1 
    ? states.findIndex(s => s.key === currentState) 
    : 0;

  // Normalized score percentage (0-100) for continuum
  const scorePercent = Math.min(Math.max(riskScore, 0), 100);

  return (
    <div className={`w-full py-3 space-y-4 ${className}`}>
      {/* Signature Path Flow */}
      <div className="relative">
        {/* Background Track */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 bg-slate-200" />
        
        {/* Active Progress Segment */}
        <motion.div 
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 bg-slate-800 transition-all duration-500"
          style={{ width: `${(activeIndex / (states.length - 1)) * 100}%` }}
        />

        {/* Dynamic Nodes */}
        <div className="relative flex justify-between items-center z-10">
          {states.map((st, idx) => {
            const isActive = idx === activeIndex;
            const isPassed = idx < activeIndex;

            return (
              <div key={st.key} className="flex flex-col items-center group">
                <div 
                  className={`w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 flex items-center justify-center ${
                    isActive 
                      ? `${st.color} border-white ring-4 ring-slate-100 scale-125` 
                      : isPassed 
                        ? "bg-slate-700 border-slate-700" 
                        : "bg-white border-slate-300"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      animate={{ scale: [1, 1.4, 1] }} 
                      transition={{ repeat: Infinity, duration: 2 }} 
                      className="w-full h-full rounded-full bg-current opacity-40"
                    />
                  )}
                </div>

                <span className={`mt-2 text-[10px] font-mono tracking-wider font-semibold ${
                  isActive ? st.textColor : "text-slate-400"
                }`}>
                  {st.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Trust -> Risk Continuum Slider (Subtle Line) */}
      {showScoreContinuum && (
        <div className="pt-2 border-t border-slate-100">
          <div className="flex justify-between items-center text-[10px] font-mono font-medium text-slate-400 mb-1">
            <span className="text-emerald-600 font-bold">TRUSTED (0)</span>
            <span className="text-slate-600 font-bold">RISK CONTINUUM</span>
            <span className="text-rose-600 font-bold">HIGH RISK (100)</span>
          </div>

          <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden">
            {/* Gradient Bar */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 opacity-30" />
            
            {/* Position Marker */}
            <motion.div 
              className="absolute top-0 bottom-0 w-2.5 bg-slate-900 rounded-full shadow-xs -ml-1.25"
              initial={false}
              animate={{ left: `${scorePercent}%` }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
          </div>

          <div className="flex justify-between items-center mt-1 text-[11px] font-mono text-slate-500">
            <span>Score: <strong className="text-slate-900">{riskScore} / 100</strong></span>
            <span className="uppercase text-[10px] tracking-wide font-semibold text-slate-700">
              {riskScore < 30 ? "LOW RISK" : riskScore < 70 ? "MODERATE ANOMALY" : "HIGH THREAT"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
