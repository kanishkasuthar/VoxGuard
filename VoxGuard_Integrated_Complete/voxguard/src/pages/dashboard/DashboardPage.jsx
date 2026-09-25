import React from "react";
import { Link } from "react-router-dom";
import { VoiceTrustLine } from "../../components/visualizations/VoiceTrustLine";
import { ThreatTrendChart } from "../../components/dashboard/ThreatTrendChart";
import { THREAT_TREND_DATA } from "../../data/mockAnalytics";
import { FiRadio, FiCheckCircle, FiArrowRight, FiShield, FiAlertTriangle, FiUsers, FiHelpCircle } from "react-icons/fi";
import { useVoxBot } from "../../context/VoxBotContext";

export const DashboardPage = () => {
  const { sendMessage, setIsCollapsed } = useVoxBot();

  const trustTimeline = [
    { label: "Mom", time: "08:30 AM", status: "TRUSTED", color: "text-[#3FA66B] bg-emerald-50 border-emerald-200" },
    { label: "Office HR", time: "09:15 AM", status: "TRUSTED", color: "text-[#3FA66B] bg-emerald-50 border-emerald-200" },
    { label: "+91 XXXXX 7890", time: "09:54 AM", status: "CHECKING", color: "text-[#123F59] bg-[#EEF7FA] border-[#DCECF4]" },
    { label: "+91 XXXXX 4821", time: "10:20 AM", status: "SUSPICIOUS", color: "text-[#E8A23A] bg-amber-50 border-amber-200" },
    { label: "+91 XXXXX 3210", time: "10:42 AM", status: "BLOCKED", color: "text-[#E45B5B] bg-rose-50 border-rose-200" }
  ];

  const recentEvents = [
    { type: "Voice clone detected", time: "10:42:15", caller: "+91 XXXXX 3210", status: "BLOCKED", risk: 91, color: "text-[#E45B5B] bg-rose-50 border-rose-200" },
    { type: "Verified caller identity", time: "10:31:04", caller: "+91 XXXXX 1234", status: "TRUSTED", risk: 8, color: "text-[#3FA66B] bg-emerald-50 border-emerald-200" },
    { type: "Same voice / New number match", time: "09:54:20", caller: "+91 XXXXX 7890", status: "CHECKING", risk: 42, color: "text-[#E8A23A] bg-amber-50 border-amber-200" }
  ];

  const voiceIdentities = [
    { id: "VG-001", name: "Kanishka", similarity: 96, status: "Likely Same Voice", threats: 2 },
    { id: "VG-002", name: "Dr. Ananya", similarity: 91, status: "Verified Voice", threats: 0 },
    { id: "VG-003", name: "Rohan", similarity: 88, status: "Verified Voice", threats: 0 }
  ];

  const handleAskVoxBotDashboard = () => {
    setIsCollapsed(false);
    sendMessage("Explain the current VoxGuard security overview and active protection status.", { route: "/dashboard" });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Calm Security Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D8E3E8]">
        <div>
          <span className="text-xs font-mono uppercase font-bold text-[#123F59] tracking-widest block">
            GOOD MORNING, KANISHKA
          </span>
          <h1 className="text-3xl font-serif text-[#0B3047] font-bold">
            Your voice protection is active.
          </h1>
        </div>

        <button
          onClick={handleAskVoxBotDashboard}
          className="px-4 py-2 bg-white hover:bg-[#EEF7FA] text-[#0B3047] border border-[#D8E3E8] rounded-xl text-xs font-mono font-bold flex items-center gap-2 self-start sm:self-auto shadow-2xs transition-all"
        >
          <FiHelpCircle className="text-sm text-[#123F59]" /> Ask VoxBot
        </button>
      </div>

      {/* CENTRAL PROTECTION ACTIVE HUB */}
      <div className="bg-white p-8 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-6 text-center">
        <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-[#DCECF4] animate-ping opacity-30" />
          <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#123F59]/20" />
          <div className="w-32 h-32 rounded-full bg-[#0B3047] text-white flex flex-col items-center justify-center p-3 space-y-1 shadow-md z-10">
            <span className="w-2.5 h-2.5 rounded-full bg-[#3FA66B] animate-pulse" />
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase text-[#DCECF4]">PROTECTION</span>
            <span className="font-serif text-base font-bold">ACTIVE</span>
          </div>
        </div>

        {/* Signature Voice Trust Line */}
        <div className="pt-2">
          <VoiceTrustLine currentState="TRUSTED" riskScore={18} showScoreContinuum={true} />
        </div>
      </div>

      {/* CALL NEEDS ATTENTION CARD (IF RISKY EVENT DETECTED) */}
      <div className="bg-white p-6 rounded-3xl border-2 border-amber-200 bg-amber-50/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-[#E8A23A] flex items-center justify-center text-xl shrink-0">
            <FiAlertTriangle />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#E8A23A] uppercase tracking-wider block">
              CALL NEEDS ATTENTION
            </span>
            <h3 className="font-bold text-[#0B3047] text-sm">
              Possible voice impersonation detected from +91 XXXXX 4821
            </h3>
            <span className="text-xs font-mono text-[#66737C]">Risk Score: <strong className="text-[#E45B5B]">78 / 100</strong></span>
          </div>
        </div>

        <Link
          to="/risk-alert"
          className="px-5 py-2.5 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-1.5 shrink-0"
        >
          REVIEW CALL <FiArrowRight />
        </Link>
      </div>

      {/* TRUST ACTIVITY FLOWING TIMELINE */}
      <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#D8E3E8] pb-3 text-xs font-mono">
          <span className="font-bold text-[#0B3047] uppercase tracking-wider">TRUST ACTIVITY TIMELINE</span>
          <span className="text-[#66737C]">Real-Time Call Stream</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 font-mono text-center">
          {trustTimeline.map((item, i) => (
            <div key={i} className={`p-3 rounded-2xl border ${item.color} space-y-1`}>
              <span className="text-[10px] text-[#66737C] block font-sans">{item.time}</span>
              <span className="font-bold text-xs block text-[#0B3047] truncate">{item.label}</span>
              <span className="text-[10px] font-extrabold uppercase block">{item.status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* VOICE IDENTITIES SUMMARY */}
      <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-4">
        <div className="flex justify-between items-center border-b border-[#D8E3E8] pb-3 text-xs font-mono">
          <span className="font-bold text-[#0B3047] uppercase tracking-wider flex items-center gap-1.5">
            <FiUsers className="text-[#123F59]" /> VOICE IDENTITIES
          </span>
          <Link to="/voice-identities" className="text-[#123F59] font-bold hover:underline">
            View All Catalog →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono text-xs">
          {voiceIdentities.map((vid) => (
            <Link
              key={vid.id}
              to={`/voice-identities/${vid.id}`}
              className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] hover:border-[#0B3047] transition-all space-y-2 block"
            >
              <div className="flex justify-between items-start">
                <span className="font-bold text-[#0B3047]">{vid.id} ({vid.name})</span>
                <span className="text-xs font-extrabold text-[#3FA66B]">{vid.similarity}%</span>
              </div>
              <span className="text-[11px] text-[#66737C] block font-sans">{vid.status}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* RECENT PROTECTION SECURITY EVENTS */}
      <div className="space-y-3">
        <div className="flex justify-between items-center pb-2 border-b border-[#D8E3E8]">
          <span className="text-xs font-mono uppercase font-bold text-[#66737C] tracking-widest">
            RECENT PROTECTION LOGS
          </span>
          <Link to="/incidents" className="text-xs font-mono font-bold text-[#123F59] hover:underline flex items-center gap-1">
            VIEW ALL INCIDENTS <FiArrowRight />
          </Link>
        </div>

        <div className="space-y-2.5 font-mono text-xs">
          {recentEvents.map((evt, idx) => (
            <div key={idx} className="flex items-center justify-between py-3 px-4 bg-white rounded-2xl border border-[#D8E3E8]">
              <div className="flex items-center gap-3">
                <span className="text-xs text-[#66737C]">{evt.time}</span>
                <span className="font-bold text-[#0B3047]">{evt.type}</span>
                <span className="text-[#66737C]">({evt.caller})</span>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase border ${evt.color}`}>
                  {evt.status}
                </span>
                <span className="text-xs text-[#66737C]">Risk {evt.risk}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
