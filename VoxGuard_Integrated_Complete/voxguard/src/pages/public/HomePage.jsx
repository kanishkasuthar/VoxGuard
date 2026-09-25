import React from "react";
import { Link } from "react-router-dom";
import { FiShield, FiRadio, FiCpu, FiArrowRight, FiCheckCircle, FiLock, FiDatabase, FiAlertTriangle } from "react-icons/fi";
import { VoiceTrustLine } from "../../components/visualizations/VoiceTrustLine";

export const HomePage = () => {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-16 font-sans">
      
      {/* Hero Section */}
      <section className="bg-white rounded-3xl border border-[#D8E3E8] p-8 md:p-12 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column Text */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EEF7FA] border border-[#DCECF4] text-[#0B3047] text-xs font-mono font-bold tracking-wider uppercase">
              <FiShield className="text-[#123F59]" /> AI-POWERED VOICE SECURITY • SIH26104
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-[#0B3047] tracking-tight leading-none">
              Can you trust the voice <br />
              <span className="text-[#123F59] italic font-normal">on the other end?</span>
            </h1>

            <p className="text-sm sm:text-base text-[#66737C] leading-relaxed max-w-lg">
              VoxGuard.AI analyzes voices in real time, detects possible voice-cloning impersonation, assesses risk, and helps prevent fraudulent calls.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 font-sans">
              <Link 
                to="/dashboard" 
                className="px-6 py-3 bg-[#0B3047] hover:bg-[#123F59] text-white font-bold text-xs rounded-xl shadow-2xs transition-all flex items-center gap-2"
              >
                Explore VoxGuard <FiArrowRight />
              </Link>
              <Link 
                to="/about" 
                className="px-6 py-3 bg-[#EEF7FA] hover:bg-[#DCECF4] text-[#0B3047] font-bold text-xs rounded-xl border border-[#D8E3E8] transition-all flex items-center gap-2"
              >
                How It Works
              </Link>
            </div>
          </div>

          {/* Right Column Abstract Voice Waveform Art */}
          <div className="lg:col-span-5 bg-[#FAF7F2] rounded-2xl p-6 border border-[#D8E3E8] space-y-6 text-center">
            <div className="flex items-center justify-between text-xs font-mono text-[#66737C]">
              <span>VOICE STREAM ANALYSIS</span>
              <span className="text-[#0B3047] font-bold">REAL-TIME INSPECTION</span>
            </div>

            <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border border-[#DCECF4] animate-ping opacity-25" />
              <div className="absolute inset-4 rounded-full border-2 border-dashed border-[#123F59]/30" />
              
              <div className="w-28 h-28 rounded-full bg-[#EEF7FA] border border-[#DCECF4] flex items-center justify-center p-3">
                <div className="h-12 w-full flex items-center justify-center gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div 
                      key={i} 
                      style={{ height: `${Math.sin(i * 0.5) * 40 + 50}%` }} 
                      className="w-1 rounded-full bg-[#0B3047]" 
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-[#D8E3E8] text-xs font-mono text-[#0B3047] flex items-center justify-between">
              <span className="font-bold">VOICE TRUST STATUS:</span>
              <span className="text-[#3FA66B] font-bold flex items-center gap-1">
                <FiCheckCircle /> AUTHENTIC STREAM
              </span>
            </div>
          </div>

        </div>

        {/* Compact Metrics Row Below Hero */}
        <div className="grid grid-cols-3 gap-6 pt-8 mt-8 border-t border-[#D8E3E8] text-center font-mono">
          <div className="space-y-1">
            <span className="text-3xl font-extrabold text-[#0B3047]">24</span>
            <span className="text-xs text-[#66737C] block uppercase font-sans font-medium">Calls Protected</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-extrabold text-[#E45B5B]">3</span>
            <span className="text-xs text-[#66737C] block uppercase font-sans font-medium">Threats Detected</span>
          </div>
          <div className="space-y-1">
            <span className="text-3xl font-extrabold text-[#3FA66B]">99.8%</span>
            <span className="text-xs text-[#66737C] block uppercase font-sans font-medium">Safer Conversations</span>
          </div>
        </div>
      </section>

      {/* Signature Voice Trust Continuum Section */}
      <section className="bg-white p-8 rounded-3xl border border-[#D8E3E8] space-y-4 shadow-2xs">
        <div className="flex justify-between items-center text-xs font-mono font-bold text-[#66737C] uppercase tracking-wider">
          <span>Continuous Voice Trust Path</span>
          <span className="text-[#0B3047]">VOICE → TRUST → RISK → DECISION</span>
        </div>
        <VoiceTrustLine currentState="TRUSTED" riskScore={18} showScoreContinuum={true} />
      </section>

      {/* 5-Step "How VoxGuard Works" Flow */}
      <section className="space-y-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-serif text-[#0B3047]">How VoxGuard Works</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-left font-sans">
          
          <div className="p-5 bg-white rounded-2xl border border-[#D8E3E8] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#123F59] block">01 / LISTEN</span>
            <h3 className="font-bold text-[#0B3047] text-sm">Real-time Analysis</h3>
            <p className="text-xs text-[#66737C] leading-relaxed">
              Streams continuous RTP audio for spectral features.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#D8E3E8] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#123F59] block">02 / VERIFY</span>
            <h3 className="font-bold text-[#0B3047] text-sm">Speaker Match</h3>
            <p className="text-xs text-[#66737C] leading-relaxed">
              Compares ECAPA-TDNN biometric voiceprints.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#D8E3E8] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#123F59] block">03 / ASSESS</span>
            <h3 className="font-bold text-[#0B3047] text-sm">Risk Evaluation</h3>
            <p className="text-xs text-[#66737C] leading-relaxed">
              Evaluates clone probability & anti-spoofing score.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#D8E3E8] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#123F59] block">04 / PROTECT</span>
            <h3 className="font-bold text-[#0B3047] text-sm">Warn or Block</h3>
            <p className="text-xs text-[#66737C] leading-relaxed">
              Enforces real-time policy action to block fakes.
            </p>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-[#D8E3E8] space-y-2">
            <span className="text-[10px] font-mono font-bold text-[#123F59] block">05 / PROVE</span>
            <h3 className="font-bold text-[#0B3047] text-sm">Audit Record</h3>
            <p className="text-xs text-[#66737C] leading-relaxed">
              Anchors Merkle SHA-256 evidence digests.
            </p>
          </div>

        </div>
      </section>

      {/* CTA Box */}
      <section className="bg-[#0B3047] text-white rounded-3xl p-8 md:p-10 text-center space-y-4 font-sans">
        <h2 className="text-2xl sm:text-3xl font-serif">Secure Your Telephony Infrastructure Today</h2>
        <p className="text-xs text-[#DCECF4] max-w-md mx-auto">
          SIH 2026 Problem Statement SIH26104 • AI-Powered Real-Time Voice Impersonation Defense Prototype.
        </p>
        <div className="pt-2 flex justify-center font-sans">
          <Link 
            to="/live-call" 
            className="px-6 py-3 bg-[#EEF7FA] text-[#0B3047] font-bold text-xs rounded-xl hover:bg-white transition-all flex items-center gap-2"
          >
            <FiRadio /> LAUNCH LIVE CALL DASHBOARD
          </Link>
        </div>
      </section>

    </div>
  );
};
