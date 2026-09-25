import React, { useState } from "react";
import { FiPlay, FiRotateCcw } from "react-icons/fi";

export const AttackReplay = ({ incidentId = "VG-1042" }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const replaySteps = [
    { time: "00:00", text: "Normal voice stream established", status: "SAFE", risk: 8 },
    { time: "00:03", text: "Acoustic micro-jitter anomaly detected", status: "SUSPICIOUS", risk: 42 },
    { time: "00:05", text: "XTTS-v2 synthetic vocoder pattern identified", status: "HIGH RISK", risk: 84 },
    { time: "00:07", text: "Risk score breached threshold (91/100)", status: "CRITICAL", risk: 91 },
    { time: "00:08", text: "Call terminated & isolated by VoxGuard policy", status: "BLOCKED", risk: 91 },
  ];

  const currStep = replaySteps[currentStepIndex];

  const handleNext = () => {
    setCurrentStepIndex((prev) => (prev + 1) % replaySteps.length);
  };

  return (
    <div className="bg-[#FAF7F2] rounded-2xl p-5 border border-[#D8E3E8] space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-[#D8E3E8] pb-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E45B5B] animate-pulse" />
          <h4 className="font-bold text-xs font-mono uppercase text-[#0B3047]">
            ATTACK REPLAY TIMELINE PLAYER: {incidentId}
          </h4>
        </div>
        <span className="text-[10px] font-mono font-bold text-[#123F59]">Step {currentStepIndex + 1} of 5</span>
      </div>

      {/* Step Info Display */}
      <div className="p-4 bg-white rounded-xl border border-[#D8E3E8] space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between">
          <span className="text-[#123F59] font-bold">Timestamp: {currStep.time}</span>
          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            currStep.status === "BLOCKED" || currStep.status === "CRITICAL"
              ? "bg-rose-50 text-[#E45B5B]"
              : currStep.status === "HIGH RISK" || currStep.status === "SUSPICIOUS"
              ? "bg-amber-50 text-[#E8A23A]"
              : "bg-emerald-50 text-[#3FA66B]"
          }`}>
            {currStep.status}
          </span>
        </div>
        <p className="text-xs text-[#0B3047] font-sans font-medium">{currStep.text}</p>
      </div>

      {/* Step Progress Bar Slider */}
      <div className="space-y-1 font-mono">
        <div className="flex items-center justify-between text-[10px] text-[#66737C]">
          <span>00:00 (Start)</span>
          <span>00:08 (Termination)</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5 cursor-pointer">
          {replaySteps.map((step, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStepIndex(idx)}
              className={`h-2 rounded-full transition-all ${
                idx <= currentStepIndex ? "bg-[#0B3047]" : "bg-[#D8E3E8]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Play Controls */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={handleNext}
          className="px-4 py-2 rounded-xl bg-[#0B3047] hover:bg-[#123F59] text-white font-mono text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <FiPlay className="text-xs" /> Next Step (▶)
        </button>
        <button
          onClick={() => setCurrentStepIndex(0)}
          className="p-2 text-[#66737C] hover:text-[#0B3047] hover:bg-[#EEF7FA] rounded-xl transition-colors cursor-pointer"
          title="Restart Playback"
        >
          <FiRotateCcw className="text-sm" />
        </button>
      </div>
    </div>
  );
};
