import React, { useEffect, useState } from "react";

export const WaveformVisualizer = ({ isAnalyzing = true, threatLevel = "LOW" }) => {
  const [bars, setBars] = useState(
    Array.from({ length: 48 }, () => Math.floor(Math.random() * 60) + 15)
  );

  useEffect(() => {
    if (!isAnalyzing) return;
    const interval = setInterval(() => {
      setBars(
        Array.from({ length: 48 }, () => {
          const isHighThreat = threatLevel === "CRITICAL" || threatLevel === "HIGH";
          const base = isHighThreat ? Math.random() * 85 + 10 : Math.random() * 50 + 10;
          return Math.floor(base);
        })
      );
    }, 150);

    return () => clearInterval(interval);
  }, [isAnalyzing, threatLevel]);

  const getBarColor = (index) => {
    if (threatLevel === "CRITICAL") return "bg-rose-500 shadow-rose-200";
    if (threatLevel === "HIGH") return "bg-orange-500 shadow-orange-200";
    if (threatLevel === "MEDIUM") return "bg-amber-500 shadow-amber-200";
    return index % 3 === 0 ? "bg-indigo-600" : "bg-blue-500";
  };

  return (
    <div className="w-full bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-inner relative overflow-hidden">
      {/* Background Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-30 pointer-events-none" />

      {/* Header Info Bar */}
      <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-4 z-10 relative">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-emerald-400 font-semibold uppercase">LIVE ACOUSTIC STREAM</span>
        </div>
        <div className="flex items-center gap-4">
          <span>SAMPLING: 48.0 kHz</span>
          <span>SPECTRUM: 0Hz - 24kHz</span>
          <span className="text-indigo-400">LATENCY: 14ms</span>
        </div>
      </div>

      {/* Waveform Bars Container */}
      <div className="h-32 flex items-center justify-center gap-1 sm:gap-1.5 px-2 relative z-10">
        {bars.map((height, i) => (
          <div
            key={i}
            style={{ height: `${height}%` }}
            className={`w-1.5 sm:w-2 rounded-full transition-all duration-150 ${getBarColor(i)}`}
          />
        ))}
      </div>

      {/* Anomaly Highlight Overlay */}
      {(threatLevel === "CRITICAL" || threatLevel === "HIGH") && (
        <div className="mt-3 flex items-center justify-between text-xs font-mono px-3 py-1.5 rounded-lg bg-rose-950/80 border border-rose-800 text-rose-300 z-10 relative">
          <span className="font-semibold text-rose-400 flex items-center gap-1.5">
            ⚠️ PHASE DISCONTINUITY DETECTED (2.4 kHz Neural Artifact)
          </span>
          <span>CONFIDENCE: 98.6%</span>
        </div>
      )}
    </div>
  );
};
