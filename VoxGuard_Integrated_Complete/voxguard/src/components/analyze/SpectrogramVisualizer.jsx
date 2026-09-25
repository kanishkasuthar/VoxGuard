import React, { useState } from "react";
import { FiPlay, FiPause, FiVolume2, FiActivity } from "react-icons/fi";

export const SpectrogramVisualizer = ({ analysisData }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#D8E3E8] shadow-2xs space-y-4 font-sans">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between text-xs font-mono text-[#66737C]">
        <div className="flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-[#0B3047] hover:bg-[#123F59] text-white flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
          >
            {isPlaying ? <FiPause /> : <FiPlay className="ml-0.5" />}
          </button>
          <div>
            <span className="text-[#0B3047] font-bold block">
              {analysisData?.fileName || "audio_waveform_sample.wav"}
            </span>
            <span className="text-[#66737C] text-[10px]">
              {analysisData?.sampleRate || "48.0 kHz"} • {analysisData?.duration || "00:00:24"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4 text-[#123F59] text-[11px] font-bold">
          <span className="flex items-center gap-1"><FiActivity /> SPECTROGRAM VERIFIED</span>
        </div>
      </div>

      {/* Frequency Spectrogram Visual Matrix */}
      <div className="relative h-40 rounded-2xl overflow-hidden bg-[#0B3047] border border-[#123F59] flex items-end justify-between px-3 py-3">
        {/* Frequency Grid Markers */}
        <div className="absolute left-3 top-2 text-[9px] font-mono text-[#DCECF4] space-y-1 z-10 pointer-events-none">
          <div>24 kHz (Nyquist)</div>
          <div>12 kHz</div>
          <div>4.0 kHz (Formant)</div>
          <div>0.0 kHz</div>
        </div>

        {/* Waveform Line Pattern */}
        {Array.from({ length: 56 }).map((_, i) => {
          const height = Math.abs(Math.sin(i * 0.35) * 40 + Math.cos(i * 0.15) * 40 + 20);
          const isHighArtifact = analysisData?.verdict !== "AUTHENTIC_HUMAN" && (i > 20 && i < 35);
          return (
            <div key={i} className="flex flex-col items-center justify-end h-full w-1.5 gap-0.5">
              <div
                style={{ height: `${height}%` }}
                className={`w-full rounded-full transition-all ${
                  isHighArtifact
                    ? "bg-[#E45B5B]"
                    : "bg-[#DCECF4]"
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Legend Notice */}
      <div className="flex items-center justify-between text-[11px] font-mono text-[#66737C] pt-1">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#DCECF4] inline-block" /> Natural Formants
          <span className="w-2.5 h-2.5 rounded-full bg-[#E45B5B] inline-block ml-2" /> Vocoder Artifact
        </div>
        <span>STFT Window: 1024</span>
      </div>
    </div>
  );
};
