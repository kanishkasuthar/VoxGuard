import React from "react";

export const RiskScore = ({ score = 0, state = "SAFE" }) => {
  const getBadgeStyle = () => {
    if (score >= 80 || state === "BLOCKED" || state === "HIGH RISK") {
      return "bg-rose-600 text-white";
    }
    if (score >= 50 || state === "SUSPICIOUS") {
      return "bg-amber-500 text-slate-950";
    }
    return "bg-emerald-600 text-white";
  };

  const getLabel = () => {
    if (state === "BLOCKED") return "VOICE CLONING DETECTED";
    if (score >= 80 || state === "HIGH RISK") return "HIGH RISK THREAT";
    if (score >= 50 || state === "SUSPICIOUS") return "SUSPICIOUS PATTERN";
    return "SAFE / AUTHENTIC";
  };

  return (
    <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm flex items-center justify-between">
      <div>
        <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Risk Score Rating</span>
        <div className="flex items-baseline gap-2 mt-1">
          <span className="text-3xl font-extrabold font-mono tracking-tight">{score}</span>
          <span className="text-xs text-slate-400 font-mono">/ 100</span>
        </div>
      </div>

      <div className="text-right">
        <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold font-mono uppercase tracking-wider ${getBadgeStyle()}`}>
          {getLabel()}
        </span>
        <p className="text-[10px] text-slate-400 mt-1 font-mono">Latency: 14ms • 48kHz Stream</p>
      </div>
    </div>
  );
};
