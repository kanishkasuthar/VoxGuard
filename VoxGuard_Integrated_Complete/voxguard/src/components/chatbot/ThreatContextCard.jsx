import React from "react";
import { ThreatBadge } from "../common/Badge";
import { FiAlertOctagon, FiActivity, FiLock } from "react-icons/fi";


export const ThreatContextCard = () => {
  return (
    <div className="bg-slate-900 text-slate-300 rounded-xl p-4 border border-slate-800 shadow-xs space-y-3">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="text-xs font-mono text-indigo-400 font-bold flex items-center gap-1.5">
          <FiActivity /> ACTIVE INCIDENT CONTEXT
        </span>
        <ThreatBadge level="CRITICAL" size="sm" />
      </div>

      <div className="text-xs space-y-1.5 font-mono">
        <div><span className="text-slate-500">Target:</span> Corporate Wire Transfer Desk</div>
        <div><span className="text-slate-500">Attacker Vector:</span> XTTS-v2 Voice Clone</div>
        <div><span className="text-slate-500">Confidence:</span> <strong className="text-rose-400">96% Deepfake Score</strong></div>
        <div><span className="text-slate-500">Block ID:</span> #1049281 (Anchored)</div>
      </div>

      <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
        Ask VoxBot for detailed acoustic breakdown or remediation steps.
      </div>
    </div>
  );
};
