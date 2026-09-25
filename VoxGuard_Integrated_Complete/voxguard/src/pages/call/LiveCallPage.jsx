import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiRadio,
  FiMicOff,
  FiGrid,
  FiVolume2,
  FiPhoneOff,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiCpu,
  FiX,
  FiDelete,
  FiHelpCircle,
  FiUser,
  FiActivity
} from "react-icons/fi";
import { VoiceTrustLine } from "../../components/visualizations/VoiceTrustLine";
import { useToast } from "../../context/NotificationContext";
import { useVoxBot } from "../../context/VoxBotContext";

export const LiveCallPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { sendMessage, setIsCollapsed } = useVoxBot();

  const [seconds, setSeconds] = useState(34);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [showKeypad, setShowKeypad] = useState(false);
  const [dialDigits, setDialDigits] = useState("");
  
  const [analysisStage, setAnalysisStage] = useState("Assessing Risk");
  const [trustStatus, setTrustStatus] = useState("TRUSTED"); // TRUSTED, CHECKING, SUSPICIOUS, HIGH RISK, BLOCKED
  const [trustScore, setTrustScore] = useState(82);

  // Real-time fluctuating prototype values
  const [authenticity, setAuthenticity] = useState(92);
  const [speakerMatch, setSpeakerMatch] = useState(94);
  const [antiSpoofing, setAntiSpoofing] = useState("PASSED");
  const [matchedVoiceId, setMatchedVoiceId] = useState("VG-001 (Kanishka)");
  const [matchConfidence, setMatchConfidence] = useState(96);

  const [liveTimeline, setLiveTimeline] = useState([
    { time: "10:42:00", text: "Call connected via RTP stream" },
    { time: "10:42:03", text: "Voice embedding extracted (ECAPA-TDNN)" },
    { time: "10:42:05", text: "No anomaly detected — Stream authentic" }
  ]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`;
  };

  const handleToggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    addToast(nextState ? "Microphone muted." : "Microphone active.", "info");
  };

  const handleToggleSpeaker = () => {
    const nextState = !isSpeakerOn;
    setIsSpeakerOn(nextState);
    addToast(nextState ? "Speakerphone ON." : "Speakerphone OFF.", "info");
  };

  const handleKeypadPress = (digit) => {
    setDialDigits((prev) => prev + digit);
  };

  const handleBackspace = () => {
    setDialDigits((prev) => prev.slice(0, -1));
  };

  const handleSimulateAttack = () => {
    addToast("SIMULATED ANOMALY: Neural voice clone signature detected!", "warning");
    
    // Transition stage 1: Anomaly
    setAnalysisStage("ANOMALY DETECTED");
    setTrustStatus("SUSPICIOUS");
    setTrustScore(48);
    setLiveTimeline((prev) => [...prev, { time: "10:42:05", text: "Voice anomaly detected — Spectral phase shift" }]);

    setTimeout(() => {
      // Transition stage 2: High Risk
      setAnalysisStage("SYNTHETIC PATTERN DETECTED");
      setTrustStatus("HIGH RISK");
      setAuthenticity(28);
      setSpeakerMatch(31);
      setAntiSpoofing("FAILED");
      setTrustScore(18);
      setLiveTimeline((prev) => [...prev, { time: "10:42:07", text: "Synthetic neural vocoder characteristics increased" }]);
    }, 400);

    setTimeout(() => {
      // Transition stage 3: Blocked & Redirect
      setTrustStatus("BLOCKED");
      setLiveTimeline((prev) => [...prev, { time: "10:42:08", text: "Policy threshold breached — Call blocked" }]);
      navigate("/risk-alert");
    }, 1000);
  };

  const handleEndCall = () => {
    addToast("Call ended. Generating VoxGuard Call Report...", "info");
    navigate("/call-report");
  };

  const handleAskVoxBotLiveCall = () => {
    setIsCollapsed(false);
    sendMessage("Why is speaker match 94% and anti-spoofing passed in the current live call?", {
      route: "/live-call",
      isCallActive: true,
      speakerMatch: `${speakerMatch}%`,
      authenticity: `${authenticity}%`,
      antiSpoofing,
      trustScore
    });
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#EEF7FA] text-[#0B3047] flex items-center justify-center font-bold text-lg border border-[#DCECF4]">
            <FiRadio className="animate-pulse text-[#123F59]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif text-[#0B3047] font-bold">LIVE CALL</h1>
              <span className="w-2 h-2 rounded-full bg-[#3FA66B] animate-ping" />
            </div>
            <p className="text-xs text-[#66737C] font-mono">
              Caller: <span className="font-bold text-[#0B3047]">Rahul (+91 XXXXX 3210)</span>
            </p>
          </div>
        </div>

        {/* Live Call Duration Timer */}
        <div className="text-right">
          <span className="text-2xl font-mono font-extrabold text-[#0B3047]">
            {formatTime(seconds)}
          </span>
          <span className="text-[10px] text-[#66737C] block font-mono uppercase font-bold">
            SESSION DURATION
          </span>
        </div>
      </div>

      {/* Main Central Voice Waveform Container */}
      <div className="bg-white p-8 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-8 text-center">
        
        {/* Stage & Status Header */}
        <div className="flex items-center justify-between border-b border-[#D8E3E8] pb-4 font-mono text-xs">
          <div className="flex items-center gap-2 text-[#0B3047]">
            <FiCpu className="text-[#123F59]" />
            <span>STAGE: <strong className="text-[#123F59]">{analysisStage}</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[#66737C]">TRUST STATUS:</span>
            <span className={`px-3 py-1 border rounded-full font-bold uppercase flex items-center gap-1 ${
              trustStatus === "TRUSTED" ? "bg-emerald-50 text-[#3FA66B] border-emerald-200" : "bg-rose-50 text-[#E45B5B] border-rose-200"
            }`}>
              <FiCheckCircle /> {trustStatus}
            </span>
          </div>
        </div>

        {/* Large Elegant Live Waveform Visualizer */}
        <div className="space-y-4 py-4">
          <div className="h-28 w-full bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] p-4 flex items-end justify-center gap-1.5 overflow-hidden">
            {Array.from({ length: 48 }).map((_, i) => {
              const height = Math.abs(Math.sin((i + seconds) * 0.4) * 80 + Math.cos(i * 0.3) * 20) + 15;
              return (
                <div
                  key={i}
                  style={{ height: `${height}%` }}
                  className="w-1.5 rounded-full bg-[#0B3047] transition-all duration-300 opacity-90"
                />
              );
            })}
          </div>
          <span className="text-xs font-mono text-[#66737C] uppercase font-bold tracking-widest block">
            LIVE AUDIO STREAM SPECTRAL WAVEFORM (RTP INGEST)
          </span>
        </div>

        {/* THREE ESSENTIAL QUESTIONS DISPLAY */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left font-sans">
          
          {/* Question 1: WHO IS SPEAKING? */}
          <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#123F59] uppercase tracking-wider block">
              01 / WHO IS SPEAKING?
            </span>
            <div className="text-xs text-[#66737C]">
              Possible Match: <strong className="text-[#0B3047]">{matchedVoiceId}</strong>
            </div>
            <div className="text-xs text-[#66737C]">
              Match Confidence: <strong className="text-[#3FA66B] font-mono">{matchConfidence}%</strong>
            </div>
          </div>

          {/* Question 2: DOES THE VOICE APPEAR GENUINE? */}
          <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#123F59] uppercase tracking-wider block">
              02 / DOES VOICE APPEAR GENUINE?
            </span>
            <div className="text-xs text-[#66737C]">
              Voice Authenticity: <strong className="text-[#0B3047] font-mono">{authenticity}%</strong>
            </div>
            <div className="text-xs text-[#66737C]">
              Anti-Spoofing Check: <strong className={antiSpoofing === "PASSED" ? "text-[#3FA66B]" : "text-[#E45B5B]"}>{antiSpoofing}</strong>
            </div>
          </div>

          {/* Question 3: SHOULD THIS CALL BE TRUSTED? */}
          <div className="p-5 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#123F59] uppercase tracking-wider block">
              03 / SHOULD CALL BE TRUSTED?
            </span>
            <div className="text-xs text-[#66737C]">
              Trust Level: <strong className="text-[#0B3047] font-mono">{trustScore} / 100</strong>
            </div>
            <div className="text-xs text-[#66737C]">
              System Status: <strong className="text-[#3FA66B] font-mono uppercase">{trustStatus}</strong>
            </div>
          </div>

        </div>

        {/* Signature Voice Trust Continuum */}
        <div className="pt-4 border-t border-[#D8E3E8] text-left">
          <VoiceTrustLine currentState={trustStatus === "TRUSTED" ? "TRUSTED" : "HIGH_RISK"} riskScore={100 - trustScore} showScoreContinuum={true} />
        </div>

        {/* Live Timeline Events Box */}
        <div className="p-4 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] space-y-2 text-left font-mono text-xs">
          <div className="flex items-center justify-between border-b border-[#D8E3E8] pb-2 text-[10px] font-bold text-[#66737C]">
            <span>LIVE EVENT STREAM</span>
            <span>RTP TIMELINE</span>
          </div>
          <div className="space-y-1">
            {liveTimeline.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-[11px]">
                <span className="text-[#66737C]">{item.time}</span>
                <span className="text-[#0B3047]">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Minimal Call Controls */}
      <div className="bg-white p-6 rounded-3xl border border-[#D8E3E8] shadow-2xs space-y-6 text-center font-sans">
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={handleToggleMute}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-lg transition-all ${
              isMuted ? "bg-rose-50 text-[#E45B5B] border-rose-200" : "bg-[#FAF7F2] text-[#0B3047] border-[#D8E3E8] hover:bg-[#EEF7FA]"
            }`}
            title={isMuted ? "Unmute Call" : "Mute Call"}
          >
            <FiMicOff />
          </button>

          <button
            onClick={() => setShowKeypad(true)}
            className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#0B3047] border border-[#D8E3E8] hover:bg-[#EEF7FA] flex items-center justify-center text-lg transition-all"
            title="Open Keypad"
          >
            <FiGrid />
          </button>

          <button
            onClick={handleToggleSpeaker}
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center text-lg transition-all ${
              isSpeakerOn ? "bg-[#EEF7FA] text-[#0B3047] border-[#DCECF4]" : "bg-[#FAF7F2] text-[#66737C] border-[#D8E3E8]"
            }`}
            title={isSpeakerOn ? "Turn Speaker Off" : "Turn Speaker On"}
          >
            <FiVolume2 />
          </button>

          <button
            onClick={handleEndCall}
            className="w-14 h-14 rounded-2xl bg-[#E45B5B] hover:bg-rose-700 text-white font-bold flex items-center justify-center text-xl shadow-md transition-all ml-4"
            title="End Call"
          >
            <FiPhoneOff />
          </button>
        </div>

        {/* Action Bar & Simulation Trigger */}
        <div className="pt-4 border-t border-[#D8E3E8] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <button
            onClick={handleAskVoxBotLiveCall}
            className="px-4 py-2 bg-white hover:bg-[#EEF7FA] text-[#0B3047] border border-[#D8E3E8] font-bold rounded-xl transition-all flex items-center gap-2"
          >
            <FiHelpCircle className="text-sm text-[#123F59]" /> Ask VoxBot About Live Call
          </button>

          <button
            onClick={handleSimulateAttack}
            className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-[#E8A23A] font-bold rounded-xl border border-amber-200 transition-all flex items-center gap-2"
          >
            <FiAlertTriangle /> SIMULATE VOICE CLONE
          </button>
        </div>
      </div>

      {/* KEYPAD OVERLAY MODAL */}
      {showKeypad && (
        <div className="fixed inset-0 z-50 bg-[#0B3047]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-xs w-full rounded-3xl border border-[#D8E3E8] p-6 space-y-6 shadow-xl text-center font-mono">
            <div className="flex items-center justify-between border-b border-[#D8E3E8] pb-3">
              <span className="text-xs font-bold text-[#0B3047] uppercase">DTMF KEYPAD</span>
              <button
                onClick={() => setShowKeypad(false)}
                className="text-[#66737C] hover:text-[#0B3047] p-1 rounded-lg"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] flex items-center justify-between h-12">
              <span className="text-lg font-bold text-[#0B3047] tracking-widest">{dialDigits || "—"}</span>
              {dialDigits && (
                <button onClick={handleBackspace} className="text-[#66737C] hover:text-[#E45B5B]">
                  <FiDelete className="text-lg" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((btn) => (
                <button
                  key={btn}
                  onClick={() => handleKeypadPress(btn)}
                  className="h-12 rounded-xl bg-[#EEF7FA] hover:bg-[#DCECF4] text-[#0B3047] font-bold text-lg border border-[#DCECF4] transition-all flex items-center justify-center active:scale-95"
                >
                  {btn}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowKeypad(false)}
              className="w-full py-2.5 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl font-sans"
            >
              Done
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
