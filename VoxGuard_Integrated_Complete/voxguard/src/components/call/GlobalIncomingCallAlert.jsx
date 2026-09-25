import React from "react";
import { useNavigate } from "react-router-dom";
import {
  FiPhoneCall,
  FiPhoneOff,
  FiShield,
  FiAlertTriangle,
  FiCheckCircle,
  FiRadio,
  FiMaximize2
} from "react-icons/fi";
import { useCall } from "../../context/CallContext";

export const GlobalIncomingCallAlert = () => {
  const navigate = useNavigate();
  const { callState, currentCall, acceptCall, declineCall } = useCall();

  if (callState !== "RINGING_INCOMING" || !currentCall) {
    return null;
  }

  const caller = currentCall.remoteUser || {
    name: "Unknown Caller",
    phone: "+91 98765 00000",
    relationship: "Incoming Call",
    isKnown: false
  };

  const isKnownContact = caller.isKnown !== false && caller.name !== "Unknown Caller" && !caller.name?.includes("Flagged");

  const handleAccept = async () => {
    await acceptCall();
    navigate("/incoming-call");
  };

  const handleDecline = () => {
    declineCall();
  };

  const handleOpenCallPage = () => {
    navigate("/incoming-call");
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md w-full animate-bounce-short">
      <div className="bg-[#0B3047] text-white rounded-3xl p-5 shadow-2xl border-2 border-emerald-400/40 backdrop-blur-md relative overflow-hidden">
        
        {/* Glowing Background Pulse */}
        <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/20 rounded-full blur-2xl animate-pulse pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
            </span>
            <span className="text-[11px] font-mono font-extrabold tracking-wider text-emerald-400 uppercase flex items-center gap-1">
              <FiShield className="text-xs" /> VoxGuard Real-Time Interception
            </span>
          </div>

          <button
            onClick={handleOpenCallPage}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer p-1"
            title="Expand Full Monitor"
          >
            <FiMaximize2 className="text-sm" />
          </button>
        </div>

        {/* Caller Info Section */}
        <div className="py-4 flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-900 border border-slate-600 flex items-center justify-center text-xl font-serif font-bold text-white shadow-inner">
              {caller.name ? caller.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full text-slate-900 shadow">
              <FiRadio className="text-[10px] animate-pulse" />
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-white truncate">
                {caller.name}
              </h3>
            </div>
            <p className="font-mono text-xs text-slate-300 font-semibold">
              {caller.phone}
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              {isKnownContact ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 font-mono text-[9px] font-bold">
                  <FiCheckCircle className="text-[10px]" /> Known Trusted Contact
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-950/80 border border-rose-500/40 text-rose-300 font-mono text-[9px] font-bold">
                  <FiAlertTriangle className="text-[10px]" /> Unknown / Unverified Caller
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Protection Note */}
        <p className="text-[11px] text-slate-300 font-sans bg-slate-800/60 rounded-xl p-2.5 mb-4 border border-slate-700/50">
          🛡️ <span className="font-semibold text-white">Live AI Screening:</span> Ingesting audio through AASIST Anti-Spoofing & Multi-Signal Fraud Detection.
        </p>

        {/* Call Actions */}
        <div className="grid grid-cols-2 gap-3 font-mono text-xs font-bold">
          <button
            onClick={handleDecline}
            className="py-3 px-4 rounded-xl bg-rose-600/90 hover:bg-rose-600 text-white flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-rose-900/30 cursor-pointer"
          >
            <FiPhoneOff className="text-sm" /> DECLINE
          </button>

          <button
            onClick={handleAccept}
            className="py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-900/40 cursor-pointer animate-pulse"
          >
            <FiPhoneCall className="text-sm" /> ACCEPT WITH AI
          </button>
        </div>

      </div>
    </div>
  );
};
