import React from "react";

export const StatCard = ({ title, value, change, icon: Icon, color = "indigo" }) => {
  const colorStyles = {
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100"
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-start justify-between">
      <div className="space-y-1">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</span>
        <div className="text-2xl font-black text-slate-900 tracking-tight font-mono">{value}</div>
        {change && (
          <p className="text-[11px] font-medium text-slate-500 mt-1">
            <span className={change.includes("+") ? "text-emerald-600 font-semibold" : "text-slate-600"}>
              {change}
            </span>
          </p>
        )}
      </div>

      <div className={`p-3 rounded-xl border ${colorStyles[color] || colorStyles.indigo}`}>
        <Icon className="text-xl" />
      </div>
    </div>
  );
};
