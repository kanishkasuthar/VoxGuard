import React from "react";
import { ThreatBadge } from "../common/Badge";
import { FiPhone, FiGlobe, FiLock, FiUser, FiMapPin, FiCpu } from "react-icons/fi";

export const CallerCard = ({ callSession }) => {
  if (!callSession) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img
              src={callSession.callerAvatar}
              alt={callSession.callerName}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100 shadow-xs"
            />
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {callSession.callerName}
              </h3>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-mono">
                <FiPhone className="text-slate-400" /> {callSession.callerPhone}
              </p>
            </div>
          </div>
          <ThreatBadge level={callSession.threatLevel} size="md" />
        </div>

        {/* Telephony Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
          <div>
            <span className="text-slate-400 block text-[10px] font-medium uppercase">Target Desk</span>
            <span className="font-semibold text-slate-800">{callSession.targetAccount}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-medium uppercase">Origin Node</span>
            <span className="font-semibold text-slate-800 flex items-center gap-1">
              <FiMapPin className="text-indigo-500" /> {callSession.callerLocation}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-medium uppercase">IP Address</span>
            <span className="font-mono text-slate-700">{callSession.originIP}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[10px] font-medium uppercase">Protocol</span>
            <span className="font-semibold text-indigo-700 flex items-center gap-1">
              <FiLock className="text-xs text-emerald-600" /> {callSession.protocol}
            </span>
          </div>
        </div>

        {/* Neural Model Pattern match if deepfake */}
        <div className="text-xs bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
          <div className="flex items-center gap-1.5 text-indigo-900 font-semibold mb-1">
            <FiCpu className="text-indigo-600" /> AI Neural Fingerprint Analysis:
          </div>
          <p className="text-slate-700 font-mono text-[11px]">
            {callSession.audioFeatures.neuralModelMatch}
          </p>
        </div>
      </div>

      {/* Transcript snippet */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
          Live Audio Speech Transcript
        </span>
        <p className="text-xs text-slate-600 italic font-mono bg-slate-50 p-2.5 rounded border border-slate-200/60 leading-relaxed">
          "{callSession.transcriptSnippet}"
        </p>
      </div>
    </div>
  );
};
