import React from "react";
import { ThreatBadge } from "../common/Badge";
import { FiCheckCircle, FiAlertTriangle, FiShieldOff, FiDatabase, FiFileText } from "react-icons/fi";

export const AnalysisResultsCard = ({ data, onGenerateReport }) => {
  if (!data) return null;

  const isSynthetic = data.verdict !== "AUTHENTIC_HUMAN";

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Top Header Verdict */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">AI Inference Verdict</span>
          <div className="flex items-center gap-3 mt-1">
            <h2 className={`text-xl font-extrabold tracking-tight ${isSynthetic ? "text-rose-600" : "text-emerald-600"}`}>
              {isSynthetic ? "AI DEEPFAKE / IMPERSONATION DETECTED" : "AUTHENTIC HUMAN VOICEPRINT"}
            </h2>
          </div>
        </div>
        <ThreatBadge level={data.riskLevel} size="lg" />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <span className="text-[11px] font-medium text-slate-500 block uppercase">Deepfake Probability</span>
          <span className={`text-2xl font-extrabold mt-1 block font-mono ${data.scores.deepfakeProbability > 60 ? "text-rose-600" : "text-emerald-600"}`}>
            {data.scores.deepfakeProbability}%
          </span>
        </div>

        {/* Metric 2 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <span className="text-[11px] font-medium text-slate-500 block uppercase">Speaker Similarity</span>
          <span className="text-2xl font-extrabold mt-1 block font-mono text-slate-900">
            {data.scores.speakerSimilarity}%
          </span>
        </div>

        {/* Metric 3 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <span className="text-[11px] font-medium text-slate-500 block uppercase">Anti-Spoofing Score</span>
          <span className={`text-2xl font-extrabold mt-1 block font-mono ${data.scores.antiSpoofingScore > 60 ? "text-rose-600" : "text-emerald-600"}`}>
            {data.scores.antiSpoofingScore}%
          </span>
        </div>

        {/* Metric 4 */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
          <span className="text-[11px] font-medium text-slate-500 block uppercase">Audio Quality</span>
          <span className="text-2xl font-extrabold text-indigo-600 mt-1 block font-mono">
            {data.scores.audioQuality}%
          </span>
        </div>
      </div>

      {/* Acoustic Analysis Features */}
      <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
        <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">Acoustic Feature Extraction Diagnostics</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Formant Coherence</span>
            <span className="font-medium text-slate-800">{data.acousticDetails.formantCoherence}</span>
          </div>
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Neural Vocoder Match</span>
            <span className="font-mono font-semibold text-rose-600">{data.acousticDetails.neuralVocoderArtifacts}</span>
          </div>
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Background Ambient Floor</span>
            <span className="font-medium text-slate-800">{data.acousticDetails.backgroundNoiseConsistency}</span>
          </div>
          <div className="p-2.5 bg-white rounded border border-slate-200">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">Pitch Jitter Variance</span>
            <span className="font-mono font-medium text-slate-800">{data.acousticDetails.pitchJitterVariance}</span>
          </div>
        </div>
      </div>

      {/* Blockchain Seal Info */}
      <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-center justify-between text-xs text-indigo-950 font-mono">
        <div className="flex items-center gap-2 truncate">
          <FiDatabase className="text-indigo-600 text-sm shrink-0" />
          <span className="truncate">Blockchain Proof Hash: <strong className="text-indigo-900">{data.blockchainTxHash.substring(0, 20)}...</strong></span>
        </div>
        <span className="bg-indigo-600 text-white px-2 py-0.5 rounded text-[10px] font-sans font-bold shrink-0">VERIFIED SEAL</span>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          onClick={onGenerateReport}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-sm transition-all"
        >
          <FiFileText /> Generate Forensic PDF Report
        </button>
      </div>
    </div>
  );
};
