import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { VoiceTrustLine } from "../../components/visualizations/VoiceTrustLine";
import { useToast } from "../../context/NotificationContext";
import { FiRadio, FiShield, FiMessageSquare, FiRefreshCw, FiInfo, FiArrowRight, FiPhone } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export const LiveMonitorPage = () => {
  const [scenario, setScenario] = useState("SAFE CALL"); // SAFE CALL, SIMULATE VOICE CLONE, SAME VOICE + NEW NUMBER
  const [callDuration, setCallDuration] = useState(8);
  const [seqStage, setSeqStage] = useState("ANALYZING VOICE"); // CONNECTING -> LISTENING -> ANALYZING VOICE -> VERIFYING SPEAKER -> ASSESSING RISK -> FINAL
  const { addToast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => setCallDuration(d => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const getScenarioData = () => {
    if (scenario === "SIMULATE VOICE CLONE") {
      return {
        phone: "+91 XXXXX 43210",
        speakerMatch: "61%",
        cloneProb: "94%",
        antiSpoof: "FAIL",
        consistency: "LOW",
        score: 91,
        trustState: "BLOCKED",
        statusText: "VOICE CLONING DETECTED — CALL BLOCKED",
        liveNotes: [
          { time: "00:00", text: "Call connected" },
          { time: "00:03", text: "Voice micro-jitter anomaly" },
          { time: "00:05", text: "Synthetic vocoder signature flagged" },
          { time: "00:07", text: "Risk score breached threshold (91/100)" },
          { time: "00:08", text: "SIP Trunk isolated & call blocked" }
        ],
        timeline: [
          { time: "00:00", label: "Trusted", state: "SAFE" },
          { time: "00:03", label: "Voice Anomaly", state: "WARNING" },
          { time: "00:05", label: "Synthetic Characteristics", state: "THREAT" },
          { time: "00:07", label: "Risk Increased", state: "THREAT" },
          { time: "00:08", label: "Blocked", state: "THREAT" }
        ]
      };
    }

    if (scenario === "SAME VOICE + NEW NUMBER") {
      return {
        phone: "+91 XXXXX 32109",
        speakerMatch: "96%",
        cloneProb: "6%",
        antiSpoof: "PASS",
        consistency: "HIGH",
        score: 38,
        trustState: "ANALYZING",
        statusText: "POSSIBLE EXISTING VOICE IDENTITY (VG-001)",
        liveNotes: [
          { time: "00:00", text: "New phone line connected" },
          { time: "00:03", text: "Acoustic fingerprint match verified" },
          { time: "00:05", text: "96% similarity with VG-001 (Kanishka)" },
          { time: "00:08", text: "Possible match flagged for review" }
        ],
        timeline: [
          { time: "00:00", label: "New Call", state: "SAFE" },
          { time: "00:03", label: "Voice Match 96%", state: "SAFE" },
          { time: "00:05", label: "Identity VG-001 Found", state: "SAFE" },
          { time: "00:08", label: "History Linked", state: "SAFE" }
        ]
      };
    }

    // Default SAFE CALL
    return {
      phone: "+91 XXXXX 43210",
      speakerMatch: "94%",
      cloneProb: "8%",
      antiSpoof: "PASS",
      consistency: "HIGH",
      score: 18,
      trustState: "TRUSTED",
      statusText: "VOICE APPEARS SAFE — CALL IN PROGRESS",
      liveNotes: [
        { time: "00:00", text: "Call connected" },
        { time: "00:03", text: "Voice recognized" },
        { time: "00:05", text: "No anomaly detected" },
        { time: "00:08", text: "Call in progress" }
      ],
      timeline: [
        { time: "00:00", label: "Trusted", state: "SAFE" },
        { time: "00:03", label: "Spectrogram Normal", state: "SAFE" },
        { time: "00:05", label: "Speaker Matched", state: "SAFE" },
        { time: "00:08", label: "Call Allowed", state: "SAFE" }
      ]
    };
  };

  const curr = getScenarioData();

  const handleSimulateClone = () => {
    setScenario("SIMULATE VOICE CLONE");
    setSeqStage("CONNECTING");
    addToast("Initiating Live Attack Simulation...", "info");

    setTimeout(() => setSeqStage("LISTENING"), 600);
    setTimeout(() => setSeqStage("ANALYZING VOICE"), 1200);
    setTimeout(() => setSeqStage("VERIFYING SPEAKER"), 1800);
    setTimeout(() => setSeqStage("ASSESSING RISK"), 2400);
    setTimeout(() => {
      setSeqStage("FINAL");
      addToast("🚨 VOICE CLONING DETECTED — CALL BLOCKED", "threat");
    }, 3000);
  };

  return (
    <div className="max-w-5xl mx-auto py-4 px-4 space-y-8 font-sans">
      
      {/* Top Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#D8E3E8]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-bold text-[#0B3047] flex items-center gap-2">
              <FiRadio className="text-[#123F59]" /> Live Call Monitor
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-[#EEF7FA] text-[#0B3047] text-[10px] font-mono font-bold border border-[#DCECF4]">
              ● Live Prototype
            </span>
          </div>
          <p className="text-xs text-[#66737C] font-mono mt-0.5">
            Real-time telephony stream analysis and SOC decision engine.
          </p>
        </div>

        {/* Action Controls & VoxBot Launcher */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleSimulateClone}
            className="px-4 py-2 bg-[#E45B5B] hover:bg-rose-600 text-white font-mono text-xs font-bold rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            SIMULATE VOICE CLONE
          </button>
          
          <button
            onClick={() => setScenario("SAFE CALL")}
            className="px-3 py-2 bg-white text-[#0B3047] hover:bg-[#FAF7F2] font-mono text-xs font-bold rounded-xl border border-[#D8E3E8] transition-all cursor-pointer"
          >
            Reset Safe
          </button>
        </div>
      </div>

      {/* Same Voice / New Number Scenario Banner */}
      {scenario === "SAME VOICE + NEW NUMBER" && (
        <div className="p-4 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs font-mono">
          <div>
            <div className="font-bold text-[#0B3047] flex items-center gap-2 text-sm font-sans">
              <FiInfo className="text-[#123F59]" /> POSSIBLE EXISTING VOICE IDENTITY DETECTED
            </div>
            <div className="text-[#66737C] mt-0.5">
              Incoming call from <strong className="text-[#0B3047]">+91 XXXXX 32109</strong> matches voiceprint <strong className="text-[#0B3047]">VG-001 (Kanishka)</strong> at <strong>96% similarity</strong>.
            </div>
          </div>
          <Link 
            to="/voice-identities/VG-001" 
            className="px-3.5 py-1.5 bg-[#0B3047] text-white rounded-xl text-xs font-bold shrink-0 hover:bg-[#123F59] transition-all flex items-center gap-1"
          >
            Review Identity <FiArrowRight />
          </Link>
        </div>
      )}

      {/* MAIN TWO-COLUMN MONITOR WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT / CENTER MONITOR AREA (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Main Call Header Box */}
          <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-6">
            
            <div className="flex items-center justify-between text-xs font-mono border-b border-[#D8E3E8] pb-4">
              <div>
                <span className="text-[#66737C] block text-[10px]">INCOMING PHONE STREAM</span>
                <span className="text-base font-extrabold text-[#0B3047]">{curr.phone}</span>
              </div>
              <div className="text-right">
                <span className="text-[#66737C] block text-[10px]">CALL DURATION</span>
                <span className="text-base font-bold text-[#123F59]">{formatTime(callDuration)}</span>
              </div>
            </div>

            {/* LIVE VOICE WAVEFORM CANVAS */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-[#66737C]">
                <span className="font-bold uppercase text-[#0B3047]">LIVE VOICE WAVEFORM</span>
                <span>{seqStage !== "FINAL" ? seqStage : "ANALYSIS COMPLETE"}</span>
              </div>

              <div className="h-44 bg-[#0B3047] rounded-2xl p-4 flex flex-col justify-between overflow-hidden relative border border-[#123F59]">
                {/* Thin Waveform Animation Bars */}
                <div className="relative z-10 h-28 flex items-center justify-center gap-1 px-2">
                  {Array.from({ length: 48 }).map((_, i) => {
                    const height = scenario === "SIMULATE VOICE CLONE"
                      ? Math.sin(i * 0.5) * 45 + Math.random() * 45 + 10
                      : Math.sin(i * 0.3) * 35 + Math.random() * 20 + 15;

                    return (
                      <div
                        key={i}
                        style={{ height: `${height}%` }}
                        className={`w-1.5 rounded-full transition-all duration-150 ${
                          scenario === "SIMULATE VOICE CLONE"
                            ? "bg-[#E45B5B]"
                            : scenario === "SAME VOICE + NEW NUMBER"
                            ? "bg-[#E8A23A]"
                            : "bg-[#DCECF4]"
                        }`}
                      />
                    );
                  })}
                </div>

                <div className="relative z-10 text-center text-xs font-mono text-[#DCECF4]">
                  Analyzing voice in real time...
                </div>
              </div>
            </div>

            {/* THREE ANALYSIS VALUES */}
            <div className="grid grid-cols-3 gap-4 text-center font-mono py-2 border-y border-[#D8E3E8]">
              <div className="space-y-0.5">
                <span className="text-[#66737C] text-[11px] block font-sans">Speaker Match</span>
                <span className="text-2xl font-extrabold text-[#0B3047]">{curr.speakerMatch}</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[#66737C] text-[11px] block font-sans">Clone Probability</span>
                <span className={`text-2xl font-extrabold ${scenario === "SIMULATE VOICE CLONE" ? "text-[#E45B5B]" : "text-[#0B3047]"}`}>
                  {curr.cloneProb}
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[#66737C] text-[11px] block font-sans">Anti-Spoofing</span>
                <span className={`text-2xl font-extrabold ${curr.antiSpoof === "FAIL" ? "text-[#E45B5B]" : "text-[#3FA66B]"}`}>
                  {curr.antiSpoof}
                </span>
              </div>
            </div>

            {/* VOICE CONSISTENCY & TRUST LEVEL */}
            <div className="space-y-4 pt-2">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-[#66737C] font-sans">Voice Consistency:</span>
                <span className="font-extrabold text-[#0B3047]">{curr.consistency}</span>
              </div>

              <div className="text-center space-y-1 pt-2 border-t border-[#D8E3E8]">
                <span className="text-[10px] font-mono text-[#66737C] uppercase font-bold tracking-widest block">
                  TRUST LEVEL
                </span>
                <div className="text-5xl font-extrabold font-mono text-[#0B3047]">{curr.score}</div>
                <div className={`text-xs font-mono font-bold uppercase tracking-wider ${
                  curr.score > 70 ? "text-[#E45B5B]" : curr.score > 30 ? "text-[#E8A23A]" : "text-[#3FA66B]"
                }`}>
                  {curr.trustState}
                </div>
              </div>

              {/* Signature Voice Trust Line */}
              <VoiceTrustLine currentState={curr.trustState} riskScore={curr.score} showScoreContinuum={true} />
            </div>

          </div>

          {/* VOICE TRUST TIMELINE (Desktop Horizontal, Mobile Vertical) */}
          <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-4">
            <div className="text-xs font-mono uppercase font-bold text-[#66737C] tracking-widest">
              VOICE TRUST TIMELINE
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-center">
              {curr.timeline.map((step, idx) => (
                <div key={idx} className="p-3 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-1">
                  <span className="text-[10px] text-[#66737C] block font-bold">{step.time}</span>
                  <span className={`text-xs font-bold block ${
                    step.state === "THREAT" ? "text-[#E45B5B]" : step.state === "WARNING" ? "text-[#E8A23A]" : "text-[#0B3047]"
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR: LIVE NOTES (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-4 font-mono">
          <div className="flex items-center justify-between border-b border-[#D8E3E8] pb-3">
            <span className="font-bold text-xs uppercase tracking-wider text-[#0B3047]">
              LIVE NOTES & EVENT LOG
            </span>
            <span className="w-2 h-2 rounded-full bg-[#3FA66B] animate-pulse" />
          </div>

          <div className="space-y-3 text-xs">
            {curr.liveNotes.map((note, idx) => (
              <div key={idx} className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] space-y-0.5">
                <span className="text-[10px] text-[#66737C] font-bold block">{note.time}</span>
                <span className="text-[#0B3047] font-sans font-medium text-xs block">{note.text}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#D8E3E8]">
            <Link 
              to="/incidents" 
              className="w-full py-2.5 bg-[#0B3047] text-white rounded-xl text-xs font-bold text-center block hover:bg-[#123F59] transition-all"
            >
              View Full Incident Logs
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};
