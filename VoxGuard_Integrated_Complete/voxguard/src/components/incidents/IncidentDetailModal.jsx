import React from "react";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import { AttackReplay } from "../visualizations/AttackReplay";
import { TrustTimeline } from "../visualizations/TrustTimeline";
import { FiX, FiFileText, FiDatabase, FiAlertOctagon, FiActivity, FiCheckCircle } from "react-icons/fi";

export const IncidentDetailModal = ({ incident, onClose, onGenerateReport }) => {
  if (!incident) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-2xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-black text-base">
              <FiAlertOctagon />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                Incident Details: <span className="font-mono text-blue-600">{incident.id}</span>
              </h3>
              <p className="text-xs text-slate-500 font-mono">{incident.timestamp}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Caller Identity</span>
              <span className="font-bold text-slate-900">{incident.caller}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Threat Vector</span>
              <span className="font-semibold text-slate-800">{incident.threatType}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Action Taken</span>
              <span className="font-bold text-rose-700 font-mono">{incident.actionTaken}</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
              <span className="text-slate-400 block text-[10px] font-semibold uppercase">Risk Status</span>
              <div className="mt-0.5">
                <Badge status={incident.riskStatus} size="sm" />
              </div>
            </div>
          </div>

          {/* Attack Replay Timeline Component */}
          <AttackReplay incidentId={incident.id} />

          {/* Trust Timeline Component */}
          <TrustTimeline currentState={incident.riskStatus} />

          {/* Detection Signals */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider font-mono">
              Detection Signals & Anomalies
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {incident.acousticAnomalies.map((anom, i) => (
                <div key={i} className="p-2.5 rounded-lg bg-rose-50 border border-rose-200/80 text-rose-900 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                  {anom}
                </div>
              ))}
            </div>
          </div>

          {/* Blockchain Seal Info */}
          <div className="p-4 rounded-xl bg-slate-900 text-white text-xs space-y-2 font-mono border border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="flex items-center gap-2 font-bold text-blue-400">
                <FiDatabase /> BLOCKCHAIN AUDIT ANCHOR PROOF
              </span>
              <span className="text-emerald-400 flex items-center gap-1 font-sans font-bold text-[10px]">
                <FiCheckCircle /> VERIFIED IMMUTABLE
              </span>
            </div>
            <div className="space-y-1 text-[11px] text-slate-300">
              <div><strong className="text-slate-400">Evidence Hash:</strong> {incident.evidenceHash}</div>
              <div><strong className="text-slate-400">Tx Hash:</strong> {incident.blockchainTx}</div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-mono">Incident Sealed</span>
          <Button
            variant="primary"
            size="md"
            icon={FiFileText}
            onClick={() => onGenerateReport(incident.id)}
          >
            Generate PDF Forensic Report
          </Button>
        </div>
      </div>
    </div>
  );
};
