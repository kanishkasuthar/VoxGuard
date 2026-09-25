import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiShieldOff,
  FiPhoneOff,
  FiCheckCircle,
  FiLock,
  FiHelpCircle,
  FiMessageSquare,
  FiX
} from "react-icons/fi";
import { useToast } from "../../context/NotificationContext";
import { useVoxBot } from "../../context/VoxBotContext";
import { VoiceTrustLine } from "../../components/visualizations/VoiceTrustLine";

export const RiskAlertPage = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { sendMessage, setIsCollapsed } = useVoxBot();
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);

  const handleVerifyCaller = () => {
    setIsVerifying(true);
    addToast("Initiated secondary out-of-band verification challenge...", "info");
    
    setTimeout(() => {
      setIsVerifying(false);
      setVerifySuccess(true);
      addToast("Caller verified identity via out-of-band security token.", "success");
    }, 1500);
  };

  const handleEndCall = () => {
    addToast("High risk call blocked and terminated.", "warning");
    navigate("/call-report");
  };

  const handleAskVoxBot = () => {
    setIsCollapsed(false);
    sendMessage("Why is the current call risky?", { route: "/risk-alert", isCallActive: true });
    setShowWhyModal(false);
    addToast("Asked VoxBot about the call risk breakdown.", "info");
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 font-sans space-y-6">
      
      {/* Risk Alert Container */}
      <div className="bg-white rounded-3xl border border-[#D8E3E8] p-8 md:p-10 space-y-8 shadow-md">
        
        {/* Red Warning Badge & Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[#E45B5B] text-xs font-mono font-bold tracking-wider uppercase">
            <FiAlertTriangle className="text-base" /> HIGH RISK DETECTED
          </div>

          <h1 className="text-3xl font-serif text-[#0B3047] font-bold">
            Possible Voice Impersonation
          </h1>

          <p className="text-xs text-[#66737C] font-mono max-w-md mx-auto">
            VoxGuard real-time acoustic inspection detected neural voice clone signatures during active call stream.
          </p>
        </div>

        {/* Big Risk Score Gauge Box */}
        <div className="p-6 bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-mono text-[#66737C] uppercase font-bold">
              RISK LEVEL
            </span>
            <div className="text-4xl font-serif font-bold text-[#E45B5B]">
              HIGH THREAT
            </div>
            <span className="text-xs text-[#66737C] font-mono block">
              Policy Threshold: &gt;70 / 100
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-28 h-28 rounded-full bg-white border-4 border-rose-200 flex flex-col items-center justify-center shadow-2xs font-mono">
              <span className="text-3xl font-extrabold text-[#E45B5B]">91</span>
              <span className="text-[10px] text-[#66737C] font-bold">RISK SCORE</span>
            </div>

            <button
              onClick={() => setShowWhyModal(true)}
              className="px-3.5 py-2 bg-white hover:bg-[#EEF7FA] text-[#0B3047] border border-[#D8E3E8] rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 shadow-2xs transition-all"
            >
              <FiHelpCircle className="text-sm text-[#123F59]" /> Why?
            </button>
          </div>
        </div>

        {/* Detection Signals Matrix */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase font-bold text-[#0B3047] tracking-wider">
              DETECTION SIGNALS & METRICS
            </span>
            <button
              onClick={() => setShowWhyModal(true)}
              className="text-xs font-mono text-[#123F59] hover:underline font-bold"
            >
              Explain Signals
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-center">
            <div className="p-3.5 bg-white rounded-xl border border-[#D8E3E8] space-y-1">
              <span className="text-xs text-[#66737C] block font-sans">Voice Authenticity</span>
              <span className="text-xl font-extrabold text-[#E45B5B]">28%</span>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#D8E3E8] space-y-1">
              <span className="text-xs text-[#66737C] block font-sans">Speaker Verification</span>
              <span className="text-xl font-extrabold text-[#E45B5B]">31%</span>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#D8E3E8] space-y-1">
              <span className="text-xs text-[#66737C] block font-sans">Voice Clone Prob</span>
              <span className="text-xl font-extrabold text-[#E45B5B]">89%</span>
            </div>

            <div className="p-3.5 bg-white rounded-xl border border-[#D8E3E8] space-y-1">
              <span className="text-xs text-[#66737C] block font-sans">Anti-Spoofing</span>
              <span className="text-xs font-bold text-[#E45B5B] block mt-1 uppercase">FAILED</span>
            </div>
          </div>
        </div>

        {/* Signature Voice Trust Line */}
        <div className="pt-2">
          <VoiceTrustLine currentState="HIGH_RISK" riskScore={91} showScoreContinuum={true} />
        </div>

        {/* Verification Alert Banner if Verified */}
        {verifySuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-sans text-[#3FA66B] flex items-center gap-3">
            <FiCheckCircle className="text-xl shrink-0" />
            <div>
              <span className="font-bold block">Secondary Verification Passed</span>
              Caller completed out-of-band passphrase authentication. Risk downgraded for current session.
            </div>
          </div>
        )}

        {/* Action Buttons: VERIFY CALLER & END CALL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#D8E3E8] font-sans">
          <button
            onClick={handleVerifyCaller}
            disabled={isVerifying || verifySuccess}
            className={`py-3.5 px-6 rounded-2xl font-bold text-xs border transition-all flex items-center justify-center gap-2 ${
              verifySuccess
                ? "bg-emerald-50 text-[#3FA66B] border-emerald-200 cursor-default"
                : "bg-[#EEF7FA] hover:bg-[#DCECF4] text-[#0B3047] border-[#D8E3E8]"
            }`}
          >
            <FiLock /> {isVerifying ? "Verifying Token..." : verifySuccess ? "Caller Verified ✓" : "VERIFY CALLER"}
          </button>

          <button
            onClick={handleEndCall}
            className="py-3.5 px-6 bg-[#E45B5B] hover:bg-rose-700 text-white font-bold text-xs rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <FiPhoneOff /> END & BLOCK CALL
          </button>
        </div>

      </div>

      {/* WHY THIS CALL IS RISKY MODAL */}
      {showWhyModal && (
        <div className="fixed inset-0 z-50 bg-[#0B3047]/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-3xl border border-[#D8E3E8] p-6 space-y-6 shadow-xl animate-fade-in font-sans">
            <div className="flex items-center justify-between border-b border-[#D8E3E8] pb-4">
              <div className="flex items-center gap-2">
                <FiAlertTriangle className="text-[#E45B5B] text-xl" />
                <h3 className="font-serif text-xl font-bold text-[#0B3047]">
                  Why This Call is Risky
                </h3>
              </div>
              <button
                onClick={() => setShowWhyModal(false)}
                className="text-[#66737C] hover:text-[#0B3047] p-1 rounded-lg hover:bg-[#FAF7F2]"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <p className="text-xs text-[#66737C] font-sans">
                The overall Risk Score of <strong className="text-[#E45B5B]">91 / 100</strong> was computed from these key security signals:
              </p>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] flex justify-between items-center">
                <span>Voice Clone Signal</span>
                <span className="font-bold text-[#E45B5B]">HIGH (89%)</span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] flex justify-between items-center">
                <span>Speaker Match</span>
                <span className="font-bold text-[#E45B5B]">LOW (31%)</span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] flex justify-between items-center">
                <span>Anti-Spoofing Check</span>
                <span className="font-bold text-[#E45B5B]">FAILED</span>
              </div>

              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#D8E3E8] flex justify-between items-center">
                <span>Voice Consistency</span>
                <span className="font-bold text-[#E45B5B]">LOW (28%)</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleAskVoxBot}
                className="w-full py-3 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center justify-center gap-2"
              >
                <FiMessageSquare /> ASK VOXBOT TO EXPLAIN
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
