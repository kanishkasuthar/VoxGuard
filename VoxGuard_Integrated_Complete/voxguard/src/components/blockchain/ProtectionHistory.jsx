import React from "react";
import { FiCheckCircle, FiShield, FiCheck } from "react-icons/fi";

export const ProtectionHistory = ({ onVerify }) => {
  const records = [
    {
      action: "CALL BLOCKED",
      actionType: "blocked",
      time: "10:42",
      detail: "Voice Clone Detected",
      risk: 91,
      incidentId: "VG-1042",
      evidence: "3f9a...2c4d",
      status: "VERIFIED"
    },
    {
      action: "CALL VERIFIED",
      actionType: "verified",
      time: "10:18",
      detail: "Speaker Match",
      risk: 12,
      incidentId: "VG-1041",
      evidence: "81ac...91ef",
      status: "VERIFIED"
    }
  ];

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-3xl border border-[#D8E3E8] shadow-2xs font-mono space-y-8 text-center text-xs">
      
      {/* Editorial Title */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-[#66737C] tracking-widest uppercase block">
          VOXGUARD
        </span>
        <h2 className="text-2xl font-serif font-bold text-[#0B3047] tracking-tight">
          PROTECTION HISTORY
        </h2>
        <p className="text-xs text-[#66737C] max-w-sm mx-auto font-sans">
          Every important security decision receives a tamper-evident proof.
        </p>
      </div>

      <div className="border-t border-[#D8E3E8]" />

      {/* Record Entries */}
      <div className="space-y-8 text-left">
        {records.map((rec, idx) => (
          <div key={idx} className="space-y-4">
            
            {/* Header Status & Time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  rec.actionType === "blocked" ? "bg-rose-50 text-[#E45B5B] border border-rose-200" : "bg-emerald-50 text-[#3FA66B] border border-emerald-200"
                }`}>
                  ✓
                </span>
                <span className="font-extrabold text-[#0B3047] text-sm tracking-wide">
                  {rec.action}
                </span>
              </div>
              <span className="text-[#66737C] font-bold">{rec.time}</span>
            </div>

            {/* Details & Risk */}
            <div className="pl-7 space-y-1">
              <div className="text-[#66737C] font-sans font-medium text-xs">{rec.detail}</div>
              <div className="text-[#0B3047] font-bold">Risk {rec.risk}</div>
            </div>

            {/* Metadata Fields */}
            <div className="pl-7 pt-2 grid grid-cols-3 gap-2 text-[11px] text-[#66737C] bg-[#FAF7F2] p-3 rounded-2xl border border-[#D8E3E8]">
              <div>
                <span className="text-[10px] uppercase block font-sans">Incident</span>
                <strong className="text-[#0B3047]">{rec.incidentId}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase block font-sans">Evidence</span>
                <strong className="text-[#123F59]">{rec.evidence}</strong>
              </div>
              <div>
                <span className="text-[10px] uppercase block font-sans">Status</span>
                <strong className="text-[#3FA66B]">{rec.status}</strong>
              </div>
            </div>

            {idx < records.length - 1 && <div className="border-t border-[#D8E3E8] pt-4" />}
          </div>
        ))}
      </div>

      <div className="border-t border-[#D8E3E8]" />

      {/* Audit Integrity Footer */}
      <div className="space-y-3 pt-2">
        <span className="text-xs font-bold text-[#66737C] uppercase tracking-widest block">
          AUDIT INTEGRITY
        </span>
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-[#3FA66B] font-bold text-xs border border-emerald-200">
          <FiCheckCircle className="text-sm" /> VERIFIED
        </div>

        <p className="text-xs text-[#66737C] max-w-xs mx-auto font-sans">
          Security records are protected against unauthorized alteration.
        </p>
      </div>

    </div>
  );
};
