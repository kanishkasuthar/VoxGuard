import React from "react";

export const ThreatBadge = ({ level = "LOW", size = "md" }) => {
  const norm = level.toUpperCase();

  const styles = {
    LOW: "bg-emerald-50 text-emerald-700 border-emerald-200",
    MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
    HIGH: "bg-orange-50 text-orange-700 border-orange-200",
    CRITICAL: "bg-rose-50 text-rose-700 border-rose-200 animate-pulse"
  };

  const dots = {
    LOW: "bg-emerald-500",
    MEDIUM: "bg-amber-500",
    HIGH: "bg-orange-500",
    CRITICAL: "bg-rose-600"
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs font-semibold",
    md: "px-2.5 py-1 text-xs font-semibold",
    lg: "px-3 py-1.5 text-sm font-semibold"
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 border rounded-full ${styles[norm] || styles.LOW} ${sizes[size]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dots[norm] || dots.LOW}`} />
      {norm} RISK
    </span>
  );
};
