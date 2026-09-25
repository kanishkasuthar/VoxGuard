import React from "react";
import { Link } from "react-router-dom";
import { FiShield, FiLock, FiCheckCircle, FiArrowRight } from "react-icons/fi";

export const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-12 font-sans">
      
      {/* Title */}
      <div className="text-center space-y-2">
        <span className="text-xs font-mono uppercase font-bold text-[#123F59] tracking-widest block">
          ABOUT VOXGUARD.AI
        </span>
        <h1 className="text-4xl font-serif font-bold text-[#0B3047] tracking-tight">
          AI Voice Impersonation Defense Architecture
        </h1>
        <p className="text-xs text-[#66737C] font-mono max-w-lg mx-auto">
          SIH 2026 Problem Statement SIH26104 • AI-Powered Real-Time Detection and Prevention of Voice Cloning Impersonation Attacks.
        </p>
      </div>

      {/* Section 1: The Problem */}
      <section className="bg-white p-8 rounded-3xl border border-[#D8E3E8] space-y-3 shadow-2xs">
        <span className="text-xs font-mono font-bold text-[#E45B5B] uppercase tracking-wider block">THE PROBLEM</span>
        <h2 className="text-2xl font-serif text-[#0B3047]">Voice Cloning & Impersonation Scams</h2>
        <p className="text-xs text-[#66737C] leading-relaxed">
          Modern generative neural audio models can clone human voices using only a few seconds of sample audio. Scammers and attackers misuse voice cloning technology to impersonate family members, corporate executives, or wire transfer authorities in real-time phone calls.
        </p>
      </section>

      {/* Section 2: The Solution */}
      <section className="bg-white p-8 rounded-3xl border border-[#D8E3E8] space-y-3 shadow-2xs">
        <span className="text-xs font-mono font-bold text-[#3FA66B] uppercase tracking-wider block">THE SOLUTION</span>
        <h2 className="text-2xl font-serif text-[#0B3047]">Continuous Acoustic Verification & Interception</h2>
        <p className="text-xs text-[#66737C] leading-relaxed">
          VoxGuard analyzes voice stream characteristics in real time. It verifies speaker biometrics, detects synthetic vocoder phase anomalies, assesses dynamic risk scores (0–100), and automatically isolates suspicious SIP telephony trunks before damage occurs.
        </p>
      </section>

      {/* Section 3: How It Works */}
      <section className="bg-white p-8 rounded-3xl border border-[#D8E3E8] space-y-6 shadow-2xs text-center">
        <span className="text-xs font-mono font-bold text-[#0B3047] uppercase tracking-widest block">HOW IT WORKS</span>
        
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] space-y-1">
            <span className="text-[10px] text-[#66737C] block font-bold">STAGE 1</span>
            <span className="font-bold text-[#0B3047] block">Detect</span>
          </div>
          <div className="p-3 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] space-y-1">
            <span className="text-[10px] text-[#66737C] block font-bold">STAGE 2</span>
            <span className="font-bold text-[#0B3047] block">Verify</span>
          </div>
          <div className="p-3 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] space-y-1">
            <span className="text-[10px] text-[#66737C] block font-bold">STAGE 3</span>
            <span className="font-bold text-[#0B3047] block">Assess</span>
          </div>
          <div className="p-3 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] space-y-1">
            <span className="text-[10px] text-[#66737C] block font-bold">STAGE 4</span>
            <span className="font-bold text-[#0B3047] block">Prevent</span>
          </div>
          <div className="p-3 bg-[#EEF7FA] rounded-2xl border border-[#DCECF4] space-y-1">
            <span className="text-[10px] text-[#66737C] block font-bold">STAGE 5</span>
            <span className="font-bold text-[#0B3047] block">Audit</span>
          </div>
        </div>
      </section>

      {/* Section 4: Blockchain Audit & Privacy */}
      <section className="bg-[#0B3047] text-white p-8 rounded-3xl space-y-4 shadow-md font-sans">
        <div className="flex items-center gap-2 text-[#DCECF4] font-mono text-xs uppercase font-bold">
          <FiLock /> BLOCKCHAIN AUDIT & PRIVACY GUARANTEE
        </div>
        <h2 className="text-2xl font-serif text-white">Tamper-Evident Immutable Proofs</h2>
        <p className="text-xs text-[#EEF7FA] leading-relaxed">
          Security events, risk ratings, and policy actions are anchored onto a tamper-evident audit ledger using SHA-256 evidence digests.
        </p>
        
        <div className="p-4 bg-white/10 rounded-2xl border border-white/20 text-xs font-mono text-emerald-300 font-bold flex items-center gap-2">
          <FiCheckCircle className="text-lg shrink-0" />
          PRIVACY ASSURANCE: Raw voice/audio is NOT stored on the blockchain. Only cryptographic evidence hashes are sealed.
        </div>
      </section>

      {/* CTA */}
      <div className="text-center pt-2">
        <Link 
          to="/live-monitor" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0B3047] text-white rounded-xl text-xs font-bold hover:bg-[#123F59] transition-all shadow-2xs"
        >
          Open Live Call Monitor <FiArrowRight />
        </Link>
      </div>

    </div>
  );
};
