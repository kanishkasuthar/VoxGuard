import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { voiceIdentityService } from "../../services/voiceIdentityService";
import { useToast } from "../../context/NotificationContext";
import { FiArrowLeft, FiPhone, FiCheckCircle, FiShield, FiClock, FiLink, FiHelpCircle } from "react-icons/fi";
import { useVoxBot } from "../../context/VoxBotContext";

export const VoiceIdentityDetailPage = () => {
  const { id } = useParams();
  const [identity, setIdentity] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { addToast } = useToast();
  const { sendMessage, setIsCollapsed } = useVoxBot();

  useEffect(() => {
    loadDetail();
  }, [id]);

  const loadDetail = async () => {
    setIsLoading(true);
    const data = await voiceIdentityService.getIdentityById(id || "VG-001");
    setIdentity(data);
    setIsLoading(false);
  };

  const handleAskVoxBotIdentity = () => {
    setIsCollapsed(false);
    sendMessage(`Who is Voice ID ${identity?.id || "VG-001"} and why did the new number match with 96% similarity?`, {
      route: `/voice-identities/${identity?.id || "VG-001"}`,
      voiceId: identity?.id,
      similarity: "96%"
    });
  };

  if (isLoading || !identity) {
    return <div className="p-12 text-center text-[#66737C] font-mono text-xs">Loading voice identity profile...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 font-sans">
      {/* Back Link */}
      <Link to="/voice-identities" className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-[#66737C] hover:text-[#0B3047]">
        <FiArrowLeft /> BACK TO VOICE IDENTITIES DIRECTORY
      </Link>

      {/* Editorial Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D8E3E8] pb-6">
        <div>
          <span className="text-xs font-mono uppercase font-bold text-[#123F59] tracking-widest block">
            BIOMETRIC VOICEPRINT RECORD
          </span>
          <h1 className="text-3xl font-serif text-[#0B3047] font-bold">
            {identity.personName} ({identity.id})
          </h1>
          <p className="text-xs text-[#66737C] font-mono mt-0.5">
            Likely Same Voice • {identity.confidence}% Match Rating
          </p>
        </div>

        <button
          onClick={handleAskVoxBotIdentity}
          className="px-4 py-2 bg-white hover:bg-[#EEF7FA] text-[#0B3047] border border-[#D8E3E8] rounded-xl text-xs font-mono font-bold flex items-center gap-2 self-start sm:self-auto shadow-2xs transition-all"
        >
          <FiHelpCircle className="text-sm text-[#123F59]" /> Ask VoxBot
        </button>
      </div>

      {/* CONCEPT SUMMARY BOX */}
      <div className="p-4 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] space-y-1 font-mono text-xs">
        <span className="font-bold text-[#0B3047] uppercase text-[10px] tracking-wider block">VOXGUARD IDENTITY CONCEPT</span>
        <p className="text-[#66737C] font-sans text-xs leading-relaxed">
          "The phone number is not the identity. The voice is the identity. VoxGuard compares acoustic embeddings across incoming calls to recognize repeat callers even from new or spoofed phone numbers."
        </p>
      </div>

      {/* VISUAL VOICE HISTORY CONTINUUM */}
      <div className="bg-white p-8 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-8">
        <div className="text-center text-xs font-mono uppercase font-bold text-[#66737C] tracking-widest">
          VOICE IDENTITY TIMELINE & HISTORY
        </div>

        {/* Tree Flow Representation */}
        <div className="flex flex-col items-center space-y-6 font-mono">
          {/* Root Node */}
          <div className="p-4 bg-[#0B3047] text-white rounded-2xl border border-[#123F59] text-center space-y-1 w-64 shadow-sm">
            <span className="text-[10px] text-[#DCECF4] font-bold uppercase tracking-wider block">VOICE PROFILE ROOT</span>
            <div className="text-base font-extrabold">{identity.personName}</div>
            <div className="text-xs text-[#DCECF4]">{identity.id} • Enrolled Profile</div>
          </div>

          {/* Vertical Branch Line */}
          <div className="w-0.5 h-8 bg-[#D8E3E8]" />

          {/* Connected Call Nodes */}
          <div className="w-full relative">
            <div className="absolute top-0 left-12 right-12 h-0.5 bg-[#D8E3E8]" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-center">
              {identity.history.map((call, idx) => (
                <div key={idx} className="flex flex-col items-center space-y-2">
                  <div className="w-0.5 h-4 bg-[#D8E3E8] -mt-4 hidden sm:block" />
                  <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] text-left space-y-1 w-full text-xs">
                    <span className="text-[10px] text-[#66737C] font-bold block">CALL {idx + 1} • {call.date}</span>
                    <div className="font-bold text-[#0B3047]">{call.number}</div>
                    <div className="flex items-center justify-between text-[10px] pt-1">
                      <span className="text-[#66737C]">Risk: {call.riskScore}</span>
                      <span className={`font-bold px-2 py-0.5 rounded-full ${
                        call.status.includes("Blocked") ? "bg-rose-50 text-[#E45B5B] border border-rose-200" : "bg-emerald-50 text-[#3FA66B] border border-emerald-200"
                      }`}>
                        {call.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vertical Branch Line to New Number Discovery */}
          <div className="w-0.5 h-8 bg-[#123F59]" />

          {/* Same Voice / New Number Matched Node */}
          <div className="p-5 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] text-center space-y-2 w-80">
            <span className="text-[10px] text-[#123F59] font-bold uppercase tracking-wider block flex items-center justify-center gap-1">
              <FiLink /> NEW NUMBER MATCHED IN REAL-TIME
            </span>
            <div className="text-base font-extrabold text-[#0B3047]">+91 XXXXX 4821</div>
            <p className="text-[11px] text-[#66737C] font-sans">
              Cross-telephony voice fingerprint match verified at <strong className="text-[#0B3047]">96% acoustic similarity</strong>.
            </p>
          </div>
        </div>
      </div>

      {/* SAME VOICE / NEW NUMBER STEP-BY-STEP FLOW DIAGRAM */}
      <div className="bg-[#0B3047] text-white p-6 rounded-3xl border border-[#123F59] space-y-6">
        <div className="text-xs font-mono uppercase font-bold text-[#DCECF4] tracking-widest text-center">
          SAME VOICE / NEW NUMBER DETECTION CONTINUUM
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 font-mono text-center text-xs">
          <div className="p-3 bg-[#123F59]/60 rounded-2xl border border-[#123F59] space-y-1">
            <span className="text-[10px] text-[#DCECF4] block">STEP 1</span>
            <span className="font-bold text-white block">NEW NUMBER</span>
            <span className="text-[11px] text-[#DCECF4] block">+91 XXXXX 4821</span>
          </div>

          <div className="p-3 bg-[#123F59]/60 rounded-2xl border border-[#123F59] space-y-1">
            <span className="text-[10px] text-[#DCECF4] block">STEP 2</span>
            <span className="font-bold text-white block">VOICE ANALYSIS</span>
            <span className="text-[11px] text-[#3FA66B] block">STFT Feature Vector</span>
          </div>

          <div className="p-3 bg-[#123F59]/60 rounded-2xl border border-[#123F59] space-y-1">
            <span className="text-[10px] text-[#DCECF4] block">STEP 3</span>
            <span className="font-bold text-white block">VOICE MATCHING</span>
            <span className="text-[11px] text-[#E8A23A] font-bold block">96% SIMILARITY</span>
          </div>

          <div className="p-3 bg-white text-[#0B3047] rounded-2xl border border-[#DCECF4] space-y-1">
            <span className="text-[10px] text-[#66737C] block font-bold">STEP 4</span>
            <span className="font-bold block">EXISTING IDENTITY</span>
            <span className="text-[11px] text-[#123F59] font-bold block">{identity.id} ({identity.personName})</span>
          </div>
        </div>
      </div>

    </div>
  );
};
