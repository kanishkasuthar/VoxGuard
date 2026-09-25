import React from "react";

export const Badge = ({ status = "SAFE", size = "md", className = "" }) => {
  const norm = status.toUpperCase();

  const styles = {
    SAFE: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    SUSPICIOUS: "bg-amber-50 text-amber-800 border-amber-200/80",
    MEDIUM: "bg-amber-50 text-amber-800 border-amber-200/80",
    "HIGH RISK": "bg-rose-50 text-rose-700 border-rose-200/80",
    HIGH: "bg-rose-50 text-rose-700 border-rose-200/80",
    CRITICAL: "bg-rose-50 text-rose-700 border-rose-200/80 font-bold",
    BLOCKED: "bg-rose-100 text-rose-800 border-rose-300 font-bold",
    ANALYZING: "bg-blue-50 text-blue-700 border-blue-200/80 animate-pulse",
    CONNECTING: "bg-blue-50 text-blue-700 border-blue-200/80"
  };

  const dots = {
    SAFE: "bg-emerald-500",
    LOW: "bg-emerald-500",
    SUSPICIOUS: "bg-amber-500",
    MEDIUM: "bg-amber-500",
    "HIGH RISK": "bg-rose-500",
    HIGH: "bg-rose-500",
    CRITICAL: "bg-rose-600 animate-ping",
    BLOCKED: "bg-rose-600",
    ANALYZING: "bg-blue-500 animate-ping",
    CONNECTING: "bg-blue-400"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[11px] font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-xs font-bold"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full font-mono ${styles[norm] || styles.SAFE} ${sizes[size]} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[norm] || dots.SAFE}`} />
      {norm}
    </span>
  );
};
