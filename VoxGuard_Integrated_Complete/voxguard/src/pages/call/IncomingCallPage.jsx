import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPhoneCall,
  FiPhoneOff,
  FiShield,
  FiActivity,
  FiCheckCircle,
  FiAlertTriangle,
  FiCpu,
  FiChevronDown,
  FiChevronUp,
  FiLock,
  FiClock,
  FiX,
  FiAlertCircle,
  FiMic,
  FiMicOff,
  FiUserCheck,
  FiRadio
} from "react-icons/fi";
import { useToast } from "../../context/NotificationContext";
import { useVoxBot } from "../../context/VoxBotContext";
import { useCall } from "../../context/CallContext";

// Compact SVG Donut Chart Component
const DonutChart = ({
  percent = 100,
  color = "#3FA66B",
  trackColor = "#E8EFE9",
  size = 90,
  strokeWidth = 6,
  centerPrimary = "",
  centerSecondary = "",
  hero = false
}) => {
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center transition-all ${hero ? 'scale-105' : ''}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-1">
        <span className="text-xs font-mono font-extrabold text-[#0B3047] leading-none">
          {centerPrimary}
        </span>
        {centerSecondary && (
          <span className="text-[9px] font-mono font-bold text-[#66737C] tracking-tighter uppercase mt-0.5">
            {centerSecondary}
          </span>
        )}
      </div>
    </div>
  );
};

export const IncomingCallPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { sendMessage, setIsCollapsed } = useVoxBot();

  const {
    currentUser,
    onlineUsers,
    callState,
    currentCall,
    isMuted,
    callDuration,
    audioLevel,
    voiceAuth,
    contentRisk,
    initiateCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    switchUser,
    simulateIncomingCall,
    startLiveMicDetection,
    triggerDefenseAction
  } = useCall();

  // Modal inspection state: null, 'VOICE', 'CONTENT'
  const [activeModal, setActiveModal] = useState(null);
  const [expandedTimeline, setExpandedTimeline] = useState(false);

  // Default Fallback Caller info if no call active
  const defaultRemoteUser = {
    id: "USR-B-1042",
    name: "Rahul",
    phone: "+91 98765 3210",
    relationship: "Brother / Family • New Delhi, IN"
  };

  const activeCaller = currentCall?.remoteUser || defaultRemoteUser;

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  const getRiskColor = (level) => {
    switch (level) {
      case "CRITICAL":
        return "#C53030";
      case "HIGH":
        return "#E45B5B";
      case "MEDIUM":
        return "#E8A23A";
      case "LOW":
      default:
        return "#3FA66B";
    }
  };

  const getRiskPercent = (level) => {
    switch (level) {
      case "CRITICAL":
        return 100;
      case "HIGH":
        return 80;
      case "MEDIUM":
        return 50;
      case "LOW":
      default:
        return 15;
    }
  };

  // Demo user options for identity switching during dual-session testing
  const userOptionA = {
    id: "USR-A-9901",
    name: "Officer Sarah Jenkins",
    phone: "+91 98765 43210",
    role: "Level-3 SOC Commander"
  };

  const userOptionB = {
    id: "USR-B-1042",
    name: "Rahul",
    phone: "+91 98765 3210",
    role: "Brother / Family Contact"
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 space-y-4 font-sans">
      
      {/* IDENTITY SWITCHER FOR DUAL-BROWSER TESTING */}
      <div className="bg-white dark:bg-[#0B2638] rounded-2xl border border-[#D8E3E8] dark:border-[#234255] p-3 flex items-center justify-between shadow-2xs font-mono text-xs">
        <div className="flex items-center gap-2">
          <FiRadio className="text-[#3FA66B] animate-pulse text-sm" />
          <span className="text-[#66737C] dark:text-[#AAB8C2] font-bold">ACTIVE SESSION:</span>
          <span className="font-extrabold text-[#0B3047] dark:text-[#F5F7F8]">{currentUser?.name} ({currentUser?.id})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#66737C] dark:text-[#AAB8C2]">Switch User:</span>
          <button
            onClick={() => switchUser(userOptionA)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${currentUser?.id === userOptionA.id ? 'bg-[#0B3047] dark:bg-[#123F59] text-white' : 'bg-[#FAF7F2] dark:bg-[#071A27] text-[#0B3047] dark:text-[#F5F7F8] hover:bg-[#DCECF4] dark:hover:bg-[#102F42]'}`}
          >
            User A (Sarah)
          </button>
          <button
            onClick={() => switchUser(userOptionB)}
            className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${currentUser?.id === userOptionB.id ? 'bg-[#0B3047] dark:bg-[#123F59] text-white' : 'bg-[#FAF7F2] dark:bg-[#071A27] text-[#0B3047] dark:text-[#F5F7F8] hover:bg-[#DCECF4] dark:hover:bg-[#102F42]'}`}
          >
            User B (Rahul)
          </button>
        </div>
      </div>

      {/* REAL-TIME INCOMING CALL DETECTION & TEST CONTROLS */}
      <div className="bg-white dark:bg-[#0B2638] rounded-2xl border-2 border-dashed border-[#123F59]/30 dark:border-[#6FA8C5]/30 p-3.5 space-y-2.5 shadow-2xs font-mono">
        <div className="flex items-center justify-between text-xs border-b border-[#D8E3E8] dark:border-[#234255] pb-2">
          <div className="flex items-center gap-1.5 font-bold text-[#0B3047] dark:text-[#F5F7F8]">
            <FiShield className="text-emerald-500 text-sm" />
            <span>REAL-TIME INCOMING CALL DETECTOR & SIMULATOR:</span>
          </div>
          <span className="text-[10px] text-[#66737C] dark:text-[#AAB8C2]">Instant Detection Testing</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs font-bold">
          <button
            onClick={() => simulateIncomingCall("DEEPFAKE_SCAM")}
            className="py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FiAlertTriangle /> SIMULATE SCAM CALL
          </button>

          <button
            onClick={() => simulateIncomingCall("AUTHENTIC_CONTACT")}
            className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FiCheckCircle /> SIMULATE TRUSTED CALL
          </button>

          <button
            onClick={startLiveMicDetection}
            className="py-2.5 px-3 rounded-xl bg-[#0B3047] dark:bg-[#123F59] hover:bg-[#123F59] dark:hover:bg-[#1a5273] text-white flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <FiMic /> LIVE MIC SNIFFER
          </button>
        </div>
      </div>

      {/* MAIN CALL CARD CONTAINER */}
      <div className="bg-white dark:bg-[#0B2638] rounded-3xl border border-[#D8E3E8] dark:border-[#234255] p-5 space-y-4 shadow-md text-center">
        
        {/* TOP STATUS INDICATOR */}
        <div className="flex items-center justify-between border-b border-[#D8E3E8] dark:border-[#234255] pb-2.5 font-mono text-xs">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EEF7FA] dark:bg-[#102F42] border border-[#DCECF4] dark:border-[#234255] text-[#0B3047] dark:text-[#F5F7F8] font-bold uppercase text-[10px]">
            <span className={`w-2 h-2 rounded-full ${callState === "CONNECTED" ? "bg-[#3FA66B] animate-pulse" : "bg-amber-400 animate-ping"}`} />
            {callState === "CONNECTED" ? "● LIVE WEBRTC MONITORING" : callState === "RINGING_INCOMING" || callState === "RINGING_OUTGOING" ? "VOXGUARD PROTECTION ON" : "VOXGUARD STANDBY"}
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-[#66737C] dark:text-[#AAB8C2] font-bold">
              {callState === "CONNECTED" ? `${formatTime(callDuration)} ● LIVE` : callState === "RINGING_INCOMING" ? "RINGING INCOMING..." : callState === "RINGING_OUTGOING" ? "CALLING PEER..." : "READY"}
            </span>
          </div>
        </div>

        {/* CALLER INFORMATION HEADER */}
        <div className="space-y-0.5 py-1 relative">
          <span className="absolute right-0 top-0 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-mono text-[9px] font-extrabold uppercase">
            <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 text-[10px]" /> KNOWN CONTACT
          </span>

          <div className="relative w-16 h-16 mx-auto mb-1 flex items-center justify-center">
            <div className={`absolute inset-0 rounded-full border border-[#DCECF4] dark:border-[#234255] ${callState.includes("RINGING") ? "animate-ping opacity-40" : ""}`} />
            <div className="w-14 h-14 rounded-full bg-[#0B3047] dark:bg-[#102F42] text-white flex items-center justify-center shadow-md font-serif text-xl font-bold border border-transparent dark:border-[#234255]">
              {activeCaller.name ? activeCaller.name.charAt(0).toUpperCase() : "R"}
            </div>
          </div>

          <span className="text-[9px] font-mono font-bold text-[#66737C] dark:text-[#AAB8C2] uppercase tracking-widest block">
            {callState === "CONNECTED" ? "LIVE VOICE CALL" : "INCOMING CALL"}
          </span>
          <h1 className="text-2xl font-serif text-[#0B3047] dark:text-[#F5F7F8] font-bold tracking-tight">
            {activeCaller.name}
          </h1>
          <p className="text-xs font-mono text-[#123F59] dark:text-[#6FA8C5] font-bold">
            {activeCaller.phone}
          </p>
          <div className="flex items-center justify-center gap-2 text-xs text-[#66737C] dark:text-[#AAB8C2] font-sans">
            <span>{activeCaller.relationship}</span>
          </div>
        </div>

        {/* ================================================== */}
        {/* LIVE SECURITY ANALYSIS CONTAINER (2 DONUTS ONLY) */}
        {/* ================================================== */}
        <div className="bg-[#FAF7F2] dark:bg-[#071A27] p-4 rounded-2xl border border-[#D8E3E8] dark:border-[#234255] space-y-3 text-left shadow-2xs">
          
          <div className="flex items-center justify-between border-b border-[#D8E3E8] dark:border-[#234255] pb-1.5 font-mono">
            <div>
              <h2 className="text-[11px] font-bold text-[#0B3047] dark:text-[#F5F7F8] uppercase tracking-wider flex items-center gap-1.5">
                <FiCpu className="text-[#123F59] dark:text-[#6FA8C5]" /> LIVE SECURITY ANALYSIS
              </h2>
              <p className="text-[9px] text-[#66737C] dark:text-[#AAB8C2] font-sans">
                Real-time voice and conversation monitoring
              </p>
            </div>

            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-white dark:bg-[#0B2638] border border-[#D8E3E8] dark:border-[#234255] text-[#0B3047] dark:text-[#F5F7F8]">
              {callState === "CONNECTED" ? "● ANALYZING LIVE" : "ANALYSIS STANDBY"}
            </span>
          </div>

          {/* TWO SECURITY METRICS SIDE-BY-SIDE IN ONE UNIFIED PANEL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-1 items-stretch">
            
            {/* 1. VOICE AUTHENTICITY (LEFT HALF) */}
            <div
              onClick={() => setActiveModal("VOICE")}
              className="p-3 bg-white rounded-xl border border-[#D8E3E8] hover:border-[#0B3047] transition-all cursor-pointer flex flex-col justify-between space-y-2 group shadow-2xs"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-extrabold text-[#0B3047] uppercase tracking-wider">
                  VOICE AUTHENTICITY
                </span>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${voiceAuth.classification === "HUMAN" ? "bg-emerald-100 text-emerald-800" : voiceAuth.classification === "AI-GENERATED" ? "bg-rose-100 text-rose-800" : "bg-slate-100 text-slate-700"}`}>
                  {voiceAuth.classification}
                </span>
              </div>

              <div className="flex items-center justify-around gap-2">
                <DonutChart
                  percent={voiceAuth.classification === "ANALYZING..." ? 50 : voiceAuth.authenticProb}
                  color={voiceAuth.classification === "HUMAN" ? "#3FA66B" : voiceAuth.classification === "AI-GENERATED" ? "#E45B5B" : "#A0AEC0"}
                  size={84}
                  strokeWidth={5}
                  centerPrimary={voiceAuth.classification === "ANALYZING..." ? "..." : `${voiceAuth.authenticProb}%`}
                  centerSecondary={voiceAuth.classification}
                />
                
                {/* Legend */}
                <div className="text-[10px] font-mono space-y-1 text-left">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#66737C]">Authentic</span>
                    <span className="font-bold text-[#0B3047]">{voiceAuth.classification === "ANALYZING..." ? "..." : `${voiceAuth.authenticProb}%`}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[#66737C]">Synthetic</span>
                    <span className="font-bold text-[#66737C]">{voiceAuth.classification === "ANALYZING..." ? "..." : `${voiceAuth.syntheticProb}%`}</span>
                  </div>
                </div>
              </div>

              <div className="pt-1.5 border-t border-[#F0F4F6] text-[10px] font-mono flex flex-col gap-0.5">
                {voiceAuth.classification === "HUMAN" ? (
                  <>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <FiCheckCircle className="text-emerald-600 text-xs" /> ✓ Voice appears authentic
                    </span>
                    <span className="text-[9px] text-[#66737C] font-sans">
                      No signs of AI generation detected.
                    </span>
                  </>
                ) : voiceAuth.classification === "AI-GENERATED" ? (
                  <>
                    <span className="text-rose-700 font-bold flex items-center gap-1">
                      <FiAlertTriangle className="text-rose-600 text-xs" /> ⚠ Synthetic voice detected
                    </span>
                    <span className="text-[9px] text-rose-600 font-sans">
                      High probability of synthetic AI vocal features.
                    </span>
                  </>
                ) : (
                  <span className="text-slate-500 font-bold text-[9px]">
                    ANALYZING REMOTE AUDIO STREAM...
                  </span>
                )}
              </div>
            </div>

            {/* 2. CONVERSATION RISK (RIGHT HALF) */}
            <div
              onClick={() => setActiveModal("CONTENT")}
              className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 group shadow-2xs ${
                contentRisk.level === "CRITICAL"
                  ? "bg-rose-50 border-rose-300 ring-2 ring-rose-200"
                  : contentRisk.level === "HIGH"
                  ? "bg-amber-50 border-amber-300 ring-2 ring-amber-200"
                  : "bg-white border-[#D8E3E8] hover:border-[#0B3047]"
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-extrabold text-[#0B3047] uppercase tracking-wider flex items-center gap-1">
                  CONVERSATION RISK
                </span>
                <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded ${
                  contentRisk.level === "CRITICAL" ? "bg-rose-600 text-white" :
                  contentRisk.level === "HIGH" ? "bg-amber-500 text-white" :
                  contentRisk.level === "MEDIUM" ? "bg-amber-200 text-amber-900" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {contentRisk.level} RISK
                </span>
              </div>

              <div className="flex items-center justify-around gap-2">
                <DonutChart
                  percent={getRiskPercent(contentRisk.level)}
                  color={getRiskColor(contentRisk.level)}
                  size={92}
                  strokeWidth={6}
                  centerPrimary={contentRisk.level}
                  centerSecondary="RISK"
                  hero={true}
                />

                {/* Compact Breakdown */}
                <div className="text-[9px] font-mono space-y-0.5 text-left min-w-[105px]">
                  <div className="flex justify-between text-[#66737C]">
                    <span>Normal</span>
                    <span className="font-bold text-[#0B3047]">{contentRisk.level === "LOW" ? "72%" : "10%"}</span>
                  </div>
                  <div className="flex justify-between text-[#66737C]">
                    <span>Suspicious</span>
                    <span className="font-bold text-[#0B3047]">{contentRisk.level === "LOW" ? "18%" : "25%"}</span>
                  </div>
                  <div className="flex justify-between text-[#66737C]">
                    <span>High</span>
                    <span className="font-bold text-[#0B3047]">{contentRisk.level === "HIGH" ? "75%" : contentRisk.level === "LOW" ? "7%" : "25%"}</span>
                  </div>
                  <div className="flex justify-between text-[#66737C]">
                    <span>Critical</span>
                    <span className="font-bold text-[#0B3047]">{contentRisk.level === "CRITICAL" ? "95%" : contentRisk.level === "LOW" ? "3%" : "40%"}</span>
                  </div>
                </div>
              </div>

              <div className="pt-1.5 border-t border-[#F0F4F6] text-[10px] font-mono flex flex-col gap-0.5">
                {contentRisk.level === "LOW" ? (
                  <>
                    <span className="text-emerald-700 font-bold flex items-center gap-1">
                      <FiCheckCircle className="text-emerald-600 text-xs" /> ✓ No suspicious signals detected
                    </span>
                    <span className="text-[9px] text-[#66737C] font-sans">
                      Conversation appears safe at this time.
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-rose-700 font-bold flex items-center gap-1">
                      <FiAlertTriangle className="text-rose-600 text-xs" /> ⚠ {contentRisk.signals.length} threat signals detected
                    </span>
                    <span className="text-[9px] text-rose-600 font-sans">
                      {contentRisk.reason || "Suspicious financial or credential request detected."}
                    </span>
                  </>
                )}
              </div>
            </div>

          </div>

          {/* REAL LIVE AUDIO STREAM WAVEFORM */}
          <div className="pt-2 border-t border-[#D8E3E8] space-y-1">
            <div className="flex justify-between items-center text-[9px] font-mono font-bold text-[#0B3047]">
              <span className="uppercase flex items-center gap-1 text-[#123F59]">
                <FiActivity className="text-[#3FA66B]" /> LIVE AUDIO STREAM
              </span>
              <span className="text-[#66737C]">
                {callState === "CONNECTED" ? "Listening..." : "Standby"}
              </span>
            </div>

            <div className="h-9 bg-white rounded-lg border border-[#D8E3E8] px-3 flex items-center justify-center gap-0.5 overflow-hidden">
              {callState === "CONNECTED" ? (
                Array.from({ length: 28 }).map((_, i) => {
                  // Real RMS Audio Level drives dynamic waveform bar height
                  const baseHeight = Math.max(15, audioLevel * (0.4 + Math.sin((callDuration * 2) + i) * 0.5));
                  return (
                    <div
                      key={i}
                      className="w-1 rounded-full transition-all duration-150"
                      style={{
                        height: `${Math.min(100, baseHeight)}%`,
                        backgroundColor: contentRisk.level === "CRITICAL" ? "#E45B5B" : contentRisk.level === "HIGH" ? "#E8A23A" : "#0B3047"
                      }}
                    />
                  );
                })
              ) : (
                Array.from({ length: 28 }).map((_, i) => (
                  <div key={i} className="w-1 h-1 bg-[#D8E3E8] rounded-full" />
                ))
              )}
            </div>
          </div>

        </div>

        {/* ================================================== */}
        {/* SIDE-BY-SIDE PANELS: CONVERSATION ANALYZER + RISK MANAGEMENT */}
        {/* ================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left font-sans">
          
          {/* LEFT PANEL: CONVERSATION ANALYZER */}
          <div className="p-3.5 bg-white rounded-xl border border-[#D8E3E8] space-y-2 flex flex-col justify-between shadow-2xs">
            <div>
              <div className="flex justify-between items-center border-b border-[#D8E3E8] pb-1.5 font-mono">
                <span className="text-[10px] font-bold text-[#0B3047] uppercase tracking-wider flex items-center gap-1">
                  CONVERSATION ANALYZER
                </span>
                <span className="text-[9px] text-[#66737C]">REAL-TIME SPEECH-TO-TEXT</span>
              </div>

              <div className="p-2 bg-[#FAF7F2] rounded-lg border border-[#D8E3E8] text-[11px] font-mono text-[#0B3047] mt-2 max-h-16 overflow-y-auto leading-tight">
                <p className="italic">"{contentRisk.transcript}"</p>
              </div>
            </div>

            <div className="space-y-1 font-mono text-[10px] pt-1">
              <span className="font-bold text-[#66737C] uppercase block text-[9px]">DETECTED SIGNALS:</span>
              {contentRisk.signals.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {contentRisk.signals.map((sig, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-50 border border-rose-200 text-rose-800 font-bold"
                    >
                      ⚠ {sig.category || sig}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="space-y-0.5">
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold">
                    <FiCheckCircle className="text-emerald-600" />
                    ✓ Normal conversation
                  </div>
                  <div className="text-[9px] text-slate-500 block">
                    ✓ No sensitive requests detected
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT PANEL: RISK MANAGEMENT */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 flex flex-col justify-between shadow-2xs transition-all ${
              contentRisk.level === "CRITICAL"
                ? "bg-rose-50/90 border-rose-300"
                : contentRisk.level === "HIGH"
                ? "bg-amber-50/90 border-amber-300"
                : contentRisk.level === "MEDIUM"
                ? "bg-amber-50/40 border-amber-200"
                : "bg-emerald-50/60 border-emerald-200"
            }`}
          >
            <div>
              <div className="flex justify-between items-center border-b border-slate-200/80 pb-1.5 font-mono">
                <span className="text-[10px] font-bold uppercase text-[#0B3047] flex items-center gap-1">
                  <FiLock /> RISK MANAGEMENT
                </span>
                <span
                  className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                    contentRisk.level === "CRITICAL"
                      ? "bg-rose-200 text-rose-900"
                      : contentRisk.level === "HIGH"
                      ? "bg-amber-200 text-amber-900"
                      : "bg-emerald-200 text-emerald-900"
                  }`}
                >
                  {contentRisk.level === "LOW" ? "🟢 LOW RISK" : `🔴 ${contentRisk.level} RISK`}
                </span>
              </div>

              <div className="space-y-1 text-[11px] mt-2 font-mono">
                {contentRisk.level === "CRITICAL" ? (
                  <div className="space-y-1 text-[10px]">
                    <p className="font-extrabold text-rose-800">🔴 CRITICAL THREAT DETECTED</p>
                    <p className="text-slate-700 font-sans text-[11px]">
                      Multiple suspicious signals detected.
                    </p>
                    <p className="font-bold text-rose-700 text-[10px]">
                      Recommended: End call and do not share sensitive information.
                    </p>
                  </div>
                ) : contentRisk.level === "HIGH" ? (
                  <div className="space-y-1 text-[10px]">
                    <p className="font-extrabold text-amber-900">🔴 HIGH RISK DETECTED</p>
                    <p className="text-slate-700 font-sans text-[11px]">
                      Sensitive information request detected.
                    </p>
                    <p className="font-bold text-rose-700 text-[10px]">
                      Recommended: Do not share OTP or verification codes.
                    </p>
                  </div>
                ) : (
                  <div className="font-sans text-[11px] text-emerald-900 space-y-0.5">
                    <p className="font-bold">🟢 LOW RISK</p>
                    <p className="text-slate-600 text-[10px]">No suspicious activity detected.</p>
                    <p className="text-emerald-800 font-bold text-[10px] mt-1">
                      Recommended: You can safely continue this call.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* REAL-TIME AUTOMATED DEFENSE ACTIONS */}
        {callState === "CONNECTED" && (
          <div className="bg-[#0B3047] text-white p-3.5 rounded-2xl border border-slate-700 space-y-2 text-left font-mono">
            <div className="flex justify-between items-center text-[10px]">
              <span className="uppercase font-bold text-emerald-400 flex items-center gap-1">
                <FiShield /> Real-Time Defense Enforcement:
              </span>
              <span className="text-slate-400">Shield Active</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold">
              <button
                onClick={() => triggerDefenseAction("OTP_CHALLENGE")}
                className="py-2 px-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <FiLock /> Issue OTP Challenge
              </button>
              <button
                onClick={() => triggerDefenseAction("BLOCK_CALLER")}
                className="py-2 px-2.5 rounded-lg bg-rose-700 hover:bg-rose-600 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <FiX /> Block & Blacklist
              </button>
              <button
                onClick={() => triggerDefenseAction("HANG_UP")}
                className="py-2 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <FiPhoneOff /> Auto-Hangup
              </button>
            </div>
          </div>
        )}

        {/* PROMINENT WEBRTC CALL CONTROLS */}
        <div className="space-y-2 pt-1 font-sans">
          
          {callState === "CONNECTED" ? (
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <button
                onClick={toggleMute}
                className={`w-full py-3 font-mono font-extrabold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer tracking-wider ${isMuted ? 'bg-amber-600 hover:bg-amber-700 text-white' : 'bg-slate-800 hover:bg-slate-900 text-white'}`}
              >
                {isMuted ? <FiMicOff /> : <FiMic />} {isMuted ? "MIC MUTED" : "MUTE"}
              </button>

              <button
                onClick={endCall}
                className="w-full py-3 bg-[#E45B5B] hover:bg-rose-700 text-white font-mono font-extrabold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer tracking-wider"
              >
                <FiPhoneOff className="text-sm" /> END CALL
              </button>
            </div>
          ) : callState === "RINGING_INCOMING" ? (
            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto">
              <button
                onClick={declineCall}
                className="w-full py-3 bg-[#E45B5B] hover:bg-rose-700 text-white font-mono font-extrabold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer tracking-wider"
              >
                <FiPhoneOff className="text-sm" /> DECLINE
              </button>

              <button
                onClick={acceptCall}
                className="w-full py-3 bg-[#3FA66B] hover:bg-emerald-600 text-white font-mono font-extrabold text-xs uppercase rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer tracking-wider animate-pulse"
              >
                <FiPhoneCall className="text-sm" /> ACCEPT
              </button>
            </div>
          ) : callState === "RINGING_OUTGOING" ? (
            <button
              onClick={endCall}
              className="w-full max-w-xs mx-auto py-3 bg-[#E45B5B] hover:bg-rose-700 text-white font-mono font-extrabold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <FiPhoneOff /> CANCEL CALL
            </button>
          ) : (
            <button
              onClick={() => initiateCall(defaultRemoteUser)}
              className="w-full max-w-sm mx-auto py-3 bg-[#0B3047] hover:bg-[#123F59] text-white font-mono font-extrabold text-xs uppercase rounded-xl transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer tracking-wider"
            >
              <FiPhoneCall className="text-emerald-400" /> START LIVE WEBRTC CALL TO RAHUL
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
