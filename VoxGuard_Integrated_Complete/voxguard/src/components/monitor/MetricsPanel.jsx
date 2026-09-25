import React from "react";
import { FiAlertOctagon, FiUserCheck, FiCheckCircle, FiActivity, FiZap } from "react-icons/fi";


export const MetricsPanel = ({ metrics, riskScore }) => {
  if (!metrics) return null;

  const getMeterColor = (score, invert = false) => {
    const s = invert ? 100 - score : score;
    if (s > 75) return "bg-rose-500";
    if (s > 45) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <FiActivity className="text-indigo-600" /> Real-time Acoustic & AI Metrics
        </h3>
        <span className="text-xs text-slate-500 font-mono">SOC Engine v4.2</span>
      </div>

      {/* Primary Risk Gauge */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-sm">
        <div>
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider block">Overall Risk Index</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-extrabold tracking-tight">{riskScore}</span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
        </div>
        <div className="text-right">
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              riskScore > 80
                ? "bg-rose-600 text-white"
                : riskScore > 50
                ? "bg-amber-500 text-slate-950"
                : "bg-emerald-500 text-slate-950"
            }`}
          >
            {riskScore > 80 ? "CRITICAL THREAT" : riskScore > 50 ? "SUSPICIOUS" : "NORMAL VOX"}
          </span>
          <p className="text-[10px] text-slate-400 mt-1">Inference Latency: {metrics.latencyMs}ms</p>
        </div>
      </div>

      {/* Individual Metric Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        {/* Metric 1 */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <FiAlertOctagon className="text-rose-500" /> Deepfake Detection
            </span>
            <span className="font-bold font-mono text-slate-900">{metrics.deepfakeScore}%</span>
          </div>

          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${metrics.deepfakeScore}%` }}
              className={`h-full transition-all duration-300 ${getMeterColor(metrics.deepfakeScore)}`}
            />
          </div>
        </div>

        {/* Metric 2 */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <FiUserCheck className="text-emerald-600" /> Speaker Verification
            </span>
            <span className="font-bold font-mono text-slate-900">{metrics.speakerSimilarity}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${metrics.speakerSimilarity}%` }}
              className={`h-full transition-all duration-300 ${getMeterColor(metrics.speakerSimilarity, true)}`}
            />
          </div>
        </div>

        {/* Metric 3 */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <FiZap className="text-amber-500" /> Anti-Spoofing Score
            </span>
            <span className="font-bold font-mono text-slate-900">{metrics.antiSpoofScore}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${metrics.antiSpoofScore}%` }}
              className={`h-full transition-all duration-300 ${getMeterColor(metrics.antiSpoofScore)}`}
            />
          </div>
        </div>

        {/* Metric 4 */}
        <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <FiCheckCircle className="text-blue-600" /> Voice Consistency Index
            </span>
            <span className="font-bold font-mono text-slate-900">{metrics.voiceConsistency}%</span>
          </div>
          <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              style={{ width: `${metrics.voiceConsistency}%` }}
              className={`h-full transition-all duration-300 ${getMeterColor(metrics.voiceConsistency, true)}`}
            />
          </div>
        </div>
      </div>

      {/* Advanced Telemetry Specs */}
      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-600 bg-slate-100/70 p-2.5 rounded-lg border border-slate-200/50 font-mono text-center">
        <div>Jitter: <span className="font-bold text-slate-900">{metrics.pitchJitter}</span></div>
        <div>Spectral Div: <span className="font-bold text-slate-900">{metrics.spectralDivergence}</span></div>
        <div>Phase Coh: <span className="font-bold text-slate-900">{metrics.phaseCoherence}</span></div>
      </div>
    </div>
  );
};
