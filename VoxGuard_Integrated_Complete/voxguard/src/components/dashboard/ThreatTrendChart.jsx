import React from "react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export const ThreatTrendChart = ({ data }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">24-Hour Acoustic Threat Volatility</h3>
          <p className="text-xs text-slate-500">Real-time telecommunication traffic & deepfake attack frequency</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium">
          <span className="flex items-center gap-1.5 text-indigo-600">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" /> Legitimate
          </span>
          <span className="flex items-center gap-1.5 text-rose-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> Synthetic Deepfake
          </span>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorLegit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorSynthetic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="time" stroke="#94A3B8" fontSize={11} tickLine={false} />
            <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0F172A", borderRadius: "8px", color: "#FFF", fontSize: "12px" }}
              itemStyle={{ color: "#FFF" }}
            />
            <Area type="monotone" dataKey="legitimate" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#colorLegit)" />
            <Area type="monotone" dataKey="syntheticDeepfake" stroke="#EF4444" strokeWidth={2} fillOpacity={1} fill="url(#colorSynthetic)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
