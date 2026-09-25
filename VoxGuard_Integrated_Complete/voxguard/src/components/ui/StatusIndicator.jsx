import React from "react";

export const StatusIndicator = ({ label = "LIVE", state = "active", size = "sm" }) => {
  const stateStyles = {
    active: { dot: "bg-emerald-500", text: "text-emerald-800", bg: "bg-emerald-50 border-emerald-200/80" },
    warning: { dot: "bg-amber-500", text: "text-amber-800", bg: "bg-amber-50 border-amber-200/80" },
    threat: { dot: "bg-rose-500", text: "text-rose-800", bg: "bg-rose-50 border-rose-200/80" },
    neutral: { dot: "bg-slate-400", text: "text-slate-700", bg: "bg-slate-100 border-slate-200" }
  };

  const curr = stateStyles[state] || stateStyles.active;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${curr.bg} ${curr.text}`}>
      <span className={`w-2 h-2 rounded-full ${curr.dot} ${state === "active" ? "animate-pulse" : ""}`} />
      <span>{label}</span>
    </div>
  );
};
