import React from "react";

export const TrustTimeline = ({ currentState = "HIGH RISK" }) => {
  const steps = [
    { time: "00:00", label: "TRUSTED", status: "safe", desc: "Acoustic baseline established" },
    { time: "00:03", label: "ANOMALY", status: "warning", desc: "Formant micro-jitter shift" },
    { time: "00:05", label: "SUSPICIOUS", status: "warning", desc: "Vocoder phase discontinuity" },
    { time: "00:08", label: "BLOCKED", status: "threat", desc: "Call isolated by policy" },
  ];

  return (
    <div className="bg-[#FAF7F2] rounded-2xl border border-[#D8E3E8] p-5 space-y-4 font-sans">
      <div className="flex items-center justify-between border-b border-[#D8E3E8] pb-2 font-mono text-xs">
        <h4 className="font-bold text-[#0B3047] uppercase tracking-wider">
          Voice Trust Progression Timeline
        </h4>
        <span className="text-[10px] text-[#66737C]">Acoustic Decay Tracking</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {steps.map((step, i) => (
          <div key={i} className="p-3 rounded-xl bg-white border border-[#D8E3E8] space-y-1 font-mono text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#66737C] font-bold">{step.time}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                step.status === "threat" ? "bg-rose-50 text-[#E45B5B]" : step.status === "warning" ? "bg-amber-50 text-[#E8A23A]" : "bg-emerald-50 text-[#3FA66B]"
              }`}>
                {step.label}
              </span>
            </div>
            <p className="text-[11px] font-sans font-medium text-[#0B3047] leading-tight">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
