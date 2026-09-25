import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiFileText,
  FiDownload,
  FiShield,
  FiArrowRight,
  FiClock,
  FiCheckCircle,
  FiXCircle
} from "react-icons/fi";
import { useToast } from "../../context/NotificationContext";
import { VoiceTrustLine } from "../../components/visualizations/VoiceTrustLine";

export const CallReportPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const reportData = {
    id: "REP-2026-0915-1042",
    incidentId: "VG-1042",
    dateTime: "15 Sep 2026, 10:24 AM",
    caller: "+91 XXXXX 3210",
    claimedIdentity: "Rahul",
    duration: "02:14",
    riskLevel: "High",
    riskScore: 91,
    result: "Blocked",
    reason: "Voice-cloning characteristics detected",
    metrics: {
      speakerMatch: "31%",
      cloneProbability: "89%",
      antiSpoofing: "Failed",
      synthesizerDetected: "XTTS v2 Neural Vocoder"
    }
  };

  const handleDownload = () => {
    addToast(`Downloading forensic PDF report ${reportData.id}...`, "success");
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans space-y-6">
      
      {/* Call Report Main Card */}
      <div className="bg-white rounded-3xl border border-[#D8E3E8] p-8 md:p-10 space-y-8 shadow-md">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#D8E3E8]">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#123F59] uppercase">
              <FiFileText /> VOXGUARD FORENSIC AUDIT
            </div>
            <h1 className="text-3xl font-serif text-[#0B3047] font-bold">
              CALL REPORT
            </h1>
            <p className="text-xs text-[#66737C] font-mono">
              Report ID: {reportData.id}
            </p>
          </div>

          <button
            onClick={handleDownload}
            className="px-5 py-2.5 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-2 self-start sm:self-auto"
          >
            <FiDownload /> Download Report
          </button>
        </div>

        {/* Call Summary Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-xs">
          
          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8]">
            <span className="text-[#66737C] block text-[10px] uppercase font-sans">Date & Time</span>
            <span className="font-bold text-[#0B3047] block mt-1">{reportData.dateTime}</span>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8]">
            <span className="text-[#66737C] block text-[10px] uppercase font-sans">Caller Phone</span>
            <span className="font-bold text-[#0B3047] block mt-1">{reportData.caller}</span>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8]">
            <span className="text-[#66737C] block text-[10px] uppercase font-sans">Claimed Identity</span>
            <span className="font-bold text-[#0B3047] block mt-1">{reportData.claimedIdentity}</span>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8]">
            <span className="text-[#66737C] block text-[10px] uppercase font-sans">Call Duration</span>
            <span className="font-bold text-[#0B3047] block mt-1">{reportData.duration}</span>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8]">
            <span className="text-[#66737C] block text-[10px] uppercase font-sans">Risk Level</span>
            <span className="font-bold text-[#E45B5B] block mt-1">{reportData.riskLevel} (Score: {reportData.riskScore})</span>
          </div>

          <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8]">
            <span className="text-[#66737C] block text-[10px] uppercase font-sans">Enforcement Result</span>
            <span className="font-bold text-[#E45B5B] block mt-1 uppercase flex items-center gap-1">
              <FiXCircle /> {reportData.result}
            </span>
          </div>

        </div>

        {/* Reason Box */}
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1 font-sans">
          <span className="text-xs font-mono font-bold text-[#E45B5B] uppercase block">
            INTERCEPTION REASON:
          </span>
          <p className="text-xs text-[#0B3047] font-semibold">
            {reportData.reason}
          </p>
        </div>

        {/* Detection Summary Matrix */}
        <div className="space-y-3">
          <span className="text-xs font-mono font-bold text-[#0B3047] uppercase tracking-wider block">
            DETECTION SUMMARY
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="p-3.5 bg-white rounded-2xl border border-[#D8E3E8] space-y-1">
              <span className="text-[11px] text-[#66737C] block font-sans">Speaker Match</span>
              <span className="text-lg font-extrabold text-[#E45B5B]">{reportData.metrics.speakerMatch}</span>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-[#D8E3E8] space-y-1">
              <span className="text-[11px] text-[#66737C] block font-sans">Clone Probability</span>
              <span className="text-lg font-extrabold text-[#E45B5B]">{reportData.metrics.cloneProbability}</span>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-[#D8E3E8] space-y-1">
              <span className="text-[11px] text-[#66737C] block font-sans">Anti-Spoofing</span>
              <span className="text-xs font-bold text-[#E45B5B] block mt-1 uppercase">{reportData.metrics.antiSpoofing}</span>
            </div>

            <div className="p-3.5 bg-white rounded-2xl border border-[#D8E3E8] space-y-1">
              <span className="text-[11px] text-[#66737C] block font-sans">Risk Score</span>
              <span className="text-lg font-extrabold text-[#E45B5B]">{reportData.riskScore}</span>
            </div>
          </div>
        </div>

        {/* Signature Voice Trust Continuum */}
        <div className="pt-2">
          <VoiceTrustLine currentState="HIGH_RISK" riskScore={91} showScoreContinuum={true} />
        </div>

        {/* Action Button: View Incident */}
        <div className="pt-4 border-t border-[#D8E3E8] flex justify-end font-sans">
          <Link
            to={`/incidents/${reportData.incidentId}`}
            className="px-6 py-3 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-2"
          >
            <FiShield /> View Incident {reportData.incidentId} <FiArrowRight />
          </Link>
        </div>

      </div>

    </div>
  );
};
