import React from "react";

export const MetricCard = ({ title, value, subtitle, icon: Icon, color = "blue", status = "neutral" }) => {
  const colorMap = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-100",
    amber: "text-amber-600 bg-amber-50 border-amber-100",
    rose: "text-rose-600 bg-rose-50 border-rose-100"
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 p-5 shadow-2xs flex items-start justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">{title}</span>
        <div className="text-2xl font-bold text-slate-900 tracking-tight font-mono">{value}</div>
        {subtitle && <p className="text-[11px] font-medium text-slate-500 mt-1">{subtitle}</p>}
      </div>

      {Icon && (
        <div className={`p-2.5 rounded-lg border ${colorMap[color] || colorMap.blue}`}>
          <Icon className="text-lg" />
        </div>
      )}
    </div>
  );
};
