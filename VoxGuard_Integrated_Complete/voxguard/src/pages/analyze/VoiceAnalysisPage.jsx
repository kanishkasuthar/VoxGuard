import React, { useState, useEffect } from "react";
import { SpectrogramVisualizer } from "../../components/analyze/SpectrogramVisualizer";
import { voiceAnalysisService } from "../../services/voiceAnalysisService";
import { offlineInferenceEngine } from "../../services/offlineInferenceEngine";
import { useNetworkStatus } from "../../services/networkStatus";
import { useToast } from "../../context/NotificationContext";
import { AudioUploader } from "../../components/analyze/AudioUploader";
import {
  FiCpu,
  FiUploadCloud,
  FiMic,
  FiPlay,
  FiPause,
  FiTrash2,
  FiFileText,
  FiCheckCircle,
  FiHelpCircle,
  FiX,
  FiWifi,
  FiWifiOff,
  FiAlertCircle,
  FiShield,
  FiAlertTriangle,
  FiArrowRight,
  FiHelpCircle as FiQuestion,
  FiClock,
  FiInfo,
  FiChevronDown,
  FiChevronUp
} from "react-icons/fi";

export const VoiceAnalysisPage = () => {
  const isOnline = useNetworkStatus();
  const { addToast } = useToast();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [modelStatus, setModelStatus] = useState("UNCHECKED");
  const [processingTime, setProcessingTime] = useState(null);
  const [showSetupDetails, setShowSetupDetails] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  useEffect(() => {
    offlineInferenceEngine.checkModelAvailability().then((status) => {
      setModelStatus(status);
    });
  }, []);

  const [selectedFileMetadata, setSelectedFileMetadata] = useState(null);

  const handleSelectFile = (fileObj, metadata) => {
    setSelectedFile(fileObj);
    setSelectedFileMetadata(metadata || null);
    setAnalysisResult(null);
    setProcessingTime(null);
  };

  const handleRunAnalysis = async () => {
    if (!selectedFile) {
      addToast("Please upload or record an audio sample first.", "warning");
      return;
    }

    setIsAnalyzing(true);
    const startTime = performance.now();
    addToast("Decoding audio PCM & executing voice anti-spoofing analysis...", "info");

    try {
      const res = await voiceAnalysisService.analyzeAudioFile(selectedFile);
      const endTime = performance.now();
      const elapsedSeconds = ((endTime - startTime) / 1000).toFixed(2);
      
      setProcessingTime(`${elapsedSeconds}s`);
      setAnalysisResult(res);
      setIsAnalyzing(false);

      if (res.isAvailable === false) {
        addToast("Local AI detection model is not installed.", "warning");
      } else if (res.classification === "AI-GENERATED") {
        addToast(`CLASSIFICATION: AI-GENERATED VOICE (AI Prob: ${res.syntheticProbability}%)`, "threat");
      } else if (res.classification === "HUMAN") {
        addToast(`CLASSIFICATION: HUMAN VOICE (Human Prob: ${res.authenticProbability}%)`, "success");
      } else if (res.classification === "INCONCLUSIVE") {
        addToast("CLASSIFICATION: INCONCLUSIVE ACOUSTIC SIGNATURE", "info");
      }
    } catch (err) {
      setIsAnalyzing(false);
      addToast(err.message || "Error inspecting audio file.", "error");
    }
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    setSelectedFileMetadata(null);
    setAnalysisResult(null);
    setProcessingTime(null);
    addToast("Cleared selected audio sample.", "info");
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-8 font-sans">
      
      {/* Title & Network Status Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-mono uppercase font-bold text-[#123F59] tracking-widest">
            FORENSIC ACOUSTIC LAB
          </span>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
              isOnline
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-amber-50 text-amber-800 border-amber-200"
            }`}
          >
            {isOnline ? "ONLINE ENGINE" : "OFFLINE ENGINE"}
          </span>
        </div>
        <h1 className="text-3xl font-serif text-[#0B3047]">Analyze Voice</h1>
        <p className="text-xs text-[#66737C] font-mono max-w-md mx-auto">
          Real acoustic feature decoding and neural voice anti-spoofing deepfake classification.
        </p>
      </div>

      {/* COMPACT PROFESSIONAL MODEL STATUS BAR */}
      <div className="bg-[#FAF7F2] border border-[#D8E3E8] rounded-xl p-3 text-xs font-mono space-y-2 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <FiCpu className="text-[#0B3047] text-sm" />
            <span className="font-bold text-[#0B3047]">OFFLINE AI ENGINE</span>
            <span className="text-[#66737C]">●</span>
            {modelStatus === "READY" ? (
              <span className="text-emerald-800 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                <FiCheckCircle className="text-emerald-600" /> Model Ready
              </span>
            ) : modelStatus === "LOADING" ? (
              <span className="text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                Initializing...
              </span>
            ) : (
              <span className="text-slate-700 font-bold bg-slate-100 border border-slate-300 px-2 py-0.5 rounded flex items-center gap-1">
                Model not installed
              </span>
            )}
          </div>

          <button
            onClick={() => setShowSetupDetails(!showSetupDetails)}
            className="text-[11px] text-[#123F59] font-bold hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            {showSetupDetails ? "[ Hide Details ]" : "[ Model Details ]"}
            {showSetupDetails ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        <p className="text-[11px] text-[#66737C] font-sans">
          {modelStatus === "READY"
            ? "Real AASIST neural voice anti-spoofing model (MIT License) active for offline HUMAN vs AI-GENERATED classification."
            : "The local voice detection model is required for offline HUMAN vs AI-GENERATED classification."}
        </p>

        {/* Expandable Model Setup Information */}
        {showSetupDetails && (
          <div className="pt-3 border-t border-[#D8E3E8] space-y-2 text-[11px] text-[#66737C]">
            <p className="font-sans">
              Real offline voice deepfake detection using AASIST (Audio Anti-Spoofing using Integrated Spectro-Temporal Graph Attention Networks).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-3 rounded-lg border border-[#D8E3E8] font-mono">
              <div>
                <span className="font-bold text-[#0B3047]">Active Model:</span>{" "}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-bold">voice_antispoof_v1.onnx (AASIST)</code>
              </div>
              <div>
                <span className="font-bold text-[#0B3047]">Location:</span>{" "}
                <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-900 font-bold">public/models/voice_antispoof_v1.onnx</code>
              </div>
              <div>
                <span className="font-bold text-[#0B3047]">License:</span> MIT License (NAVER Corp)
              </div>
              <div>
                <span className="font-bold text-[#0B3047]">Runtime:</span> ONNX Runtime Web (WASM / WebGPU)
              </div>
              <div>
                <span className="font-bold text-[#0B3047]">Status:</span>{" "}
                {modelStatus === "READY" ? "Installed & Operational" : "Model not installed"}
              </div>
              <div>
                <span className="font-bold text-[#0B3047]">Input Signature:</span> wav [1, 64600] Float32 PCM @ 16kHz
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Audio Uploader Component */}
      <AudioUploader onFileSelected={handleSelectFile} isAnalyzing={isAnalyzing} />

      {/* ANALYZE VOICE ACTION BUTTON */}
      {selectedFile && !isAnalyzing && !analysisResult && (
        <div className="bg-white border border-[#D8E3E8] rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="text-xs font-mono">
            <span className="text-[#66737C] block font-bold">SELECTED AUDIO SAMPLE:</span>
            <span className="font-bold text-[#0B3047] text-sm flex items-center gap-1.5">
              <FiCheckCircle className="text-emerald-600" /> {selectedFile.name}
            </span>
            {selectedFileMetadata && (
              <span className="text-[11px] text-[#66737C] block mt-0.5">
                Size: {selectedFileMetadata.size} • Duration: {selectedFileMetadata.duration} • Sample Rate: {selectedFileMetadata.sampleRate}
              </span>
            )}
          </div>

          <button
            onClick={handleRunAnalysis}
            className="w-full sm:w-auto px-6 py-2.5 bg-[#0B3047] hover:bg-[#123F59] text-white rounded-xl font-mono text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            ANALYZE VOICE <FiArrowRight />
          </button>
        </div>
      )}

      {/* Analysis Loading State */}
      {isAnalyzing && (
        <div className="bg-white border border-[#D8E3E8] rounded-2xl p-8 text-center space-y-4 shadow-sm animate-pulse">
          <FiCpu className="text-3xl text-[#0B3047] mx-auto animate-spin" />
          <p className="font-serif font-bold text-[#0B3047] text-lg">Decoding Audio PCM & Running Inference...</p>
          <p className="text-xs text-[#66737C] font-mono">
            Validating audio signal, resampling to 16kHz mono Float32 PCM, and executing neural anti-spoofing model graph.
          </p>
        </div>
      )}

      {/* Result Display */}
      {analysisResult && !isAnalyzing && (
        <div className="space-y-6">
          {/* Compact Honest Model Missing State */}
          {analysisResult.isAvailable === false ? (
            <div className="bg-[#FAF7F2] border border-[#D8E3E8] rounded-2xl p-6 text-center space-y-3 font-mono shadow-xs">
              <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-bold border border-slate-200">
                <FiInfo className="text-slate-500" /> OFFLINE AI ENGINE ● Model not installed
              </div>
              <p className="text-xs text-[#0B3047] font-sans max-w-lg mx-auto leading-relaxed font-semibold">
                Add the trained voice anti-spoofing model to enable offline HUMAN vs AI-GENERATED detection.
              </p>
              <p className="text-[11px] text-[#66737C] font-mono">
                Place model binary into: <code className="bg-white px-2 py-0.5 rounded border border-[#D8E3E8] font-bold text-[#0B3047]">public/models/voice_antispoof_v1.onnx</code>
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#D8E3E8] rounded-2xl p-6 shadow-sm space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#D8E3E8] pb-4 gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#66737C]">ANALYSIS COMPLETE</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        analysisResult.inferenceMode.includes("Offline") || analysisResult.inferenceMode.includes("Local")
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-blue-100 text-blue-900 border border-blue-300"
                      }`}
                    >
                      [{analysisResult.inferenceMode.includes("Offline") || analysisResult.inferenceMode.includes("Local") ? "ANALYZED LOCALLY" : "ANALYZED ONLINE"}]
                    </span>
                  </div>
                  <h3 className="text-lg font-serif font-bold text-[#0B3047] mt-0.5">
                    {analysisResult.fileName}
                  </h3>
                  <p className="text-xs text-[#66737C] font-mono">
                    {analysisResult.fileSize} • {analysisResult.sampleRate} • Duration: {analysisResult.duration}
                  </p>
                </div>

                <button
                  onClick={handleClearFile}
                  className="px-3 py-1.5 rounded-lg border border-[#D8E3E8] text-xs font-mono font-bold text-[#66737C] hover:text-[#E45B5B] hover:border-[#E45B5B] transition-colors flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <FiTrash2 /> Clear File
                </button>
              </div>

              {/* VOICE AUTHENTICITY RESULT CARD */}
              <div
                className={`p-6 rounded-2xl border ${
                  analysisResult.classification === "HUMAN"
                    ? "bg-emerald-50/70 border-emerald-300 text-emerald-950"
                    : analysisResult.classification === "AI-GENERATED"
                    ? "bg-rose-50/70 border-rose-300 text-rose-950"
                    : "bg-amber-50/70 border-amber-300 text-amber-950"
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left: Classification Badge */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-mono uppercase font-bold tracking-widest text-[#66737C] block">
                      VOICE AUTHENTICITY
                    </span>
                    <div className="flex items-center gap-3">
                      {analysisResult.classification === "HUMAN" && (
                        <FiCheckCircle className="text-3xl text-emerald-600 shrink-0" />
                      )}
                      {analysisResult.classification === "AI-GENERATED" && (
                        <FiAlertTriangle className="text-3xl text-rose-600 shrink-0" />
                      )}
                      {analysisResult.classification === "INCONCLUSIVE" && (
                        <FiQuestion className="text-3xl text-amber-600 shrink-0" />
                      )}

                      <div>
                        <h2 className="text-2xl font-black font-mono tracking-tight">
                          {analysisResult.classification === "HUMAN" && "HUMAN / AUTHENTIC"}
                          {analysisResult.classification === "AI-GENERATED" && "AI-GENERATED / SYNTHETIC"}
                          {analysisResult.classification === "INCONCLUSIVE" && "INCONCLUSIVE"}
                        </h2>
                        {analysisResult.explanation && (
                          <p className="text-xs font-sans mt-1 text-slate-700">
                            {analysisResult.explanation}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Forensic Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono border-t md:border-t-0 md:border-l border-slate-200/80 pt-4 md:pt-0 md:pl-6 text-xs">
                    <div>
                      <span className="text-[10px] text-[#66737C] block uppercase font-bold">Confidence</span>
                      <span className="text-base font-extrabold text-[#0B3047]">
                        {analysisResult.confidence}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#66737C] block uppercase font-bold">Human Probability</span>
                      <span className="text-base font-extrabold text-emerald-700">
                        {analysisResult.humanProbability ?? analysisResult.authenticProbability}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#66737C] block uppercase font-bold">AI Probability</span>
                      <span className="text-base font-extrabold text-rose-700">
                        {analysisResult.aiProbability ?? analysisResult.syntheticProbability}%
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#66737C] block uppercase font-bold">Risk Level</span>
                      <span
                        className={`text-xs font-extrabold px-2 py-0.5 rounded inline-block mt-0.5 ${
                          analysisResult.riskLevel === "LOW"
                            ? "bg-emerald-200 text-emerald-900"
                            : analysisResult.riskLevel === "MEDIUM"
                            ? "bg-amber-200 text-amber-900"
                            : "bg-rose-200 text-rose-900"
                        }`}
                      >
                        {analysisResult.riskLevel}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#66737C] block uppercase font-bold">Analysis Mode</span>
                      <span className="text-xs font-bold text-[#0B3047]">
                        {analysisResult.inferenceMode || "Offline Local AI"}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-[#66737C] block uppercase font-bold">Model</span>
                      <span className="text-xs font-bold text-[#0B3047] block truncate">
                        {analysisResult.modelVersion || "voice_antispoof_v1.onnx"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Acoustic Spectrogram Feature Visualization Component */}
              <SpectrogramVisualizer analysisData={analysisResult} />

              {/* Collapsible Technical Detection Diagnostics Panel */}
              {analysisResult.diagnostics && (
                <div className="bg-[#FAF7F2] border border-[#D8E3E8] rounded-2xl p-4 font-mono text-xs space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-[#D8E3E8] pb-2">
                    <div className="flex items-center gap-2">
                      <FiCpu className="text-[#0B3047]" />
                      <span className="font-bold text-[#0B3047] uppercase tracking-wider">
                        DETECTION DIAGNOSTICS
                      </span>
                    </div>

                    <button
                      onClick={() => setShowDiagnostics(!showDiagnostics)}
                      className="text-[11px] text-[#123F59] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      {showDiagnostics ? "[ Hide Diagnostics ]" : "[ View Technical Diagnostics ]"}
                      {showDiagnostics ? <FiChevronUp /> : <FiChevronDown />}
                    </button>
                  </div>

                  {showDiagnostics && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] bg-white p-4 rounded-xl border border-[#D8E3E8]">
                      <div>
                        <span className="text-[#66737C] block font-bold">File Name:</span>
                        <span className="text-[#0B3047] font-bold">{analysisResult.diagnostics.fileName}</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">File Size:</span>
                        <span className="text-[#0B3047] font-bold">{analysisResult.diagnostics.fileSize}</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">Original Sample Rate:</span>
                        <span className="text-[#0B3047] font-bold">{analysisResult.diagnostics.originalSampleRate}</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">Resampled Format:</span>
                        <span className="text-[#0B3047] font-bold">{analysisResult.diagnostics.resampledSampleRate}</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">Channels / Duration:</span>
                        <span className="text-[#0B3047] font-bold">Mono ({analysisResult.diagnostics.channels}ch) • {analysisResult.diagnostics.duration}</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">16kHz Sample Count:</span>
                        <span className="text-[#0B3047] font-bold">{analysisResult.diagnostics.sampleCount} samples</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">PCM Min / Max / Mean:</span>
                        <span className="text-[#0B3047] font-bold">[{analysisResult.diagnostics.minPcm}, {analysisResult.diagnostics.maxPcm}] • μ={analysisResult.diagnostics.meanPcm}</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">RMS Signal Energy:</span>
                        <span className="text-[#0B3047] font-bold">{analysisResult.diagnostics.rmsPcm}</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">ONNX Input Signature:</span>
                        <span className="text-[#0B3047] font-bold">{analysisResult.diagnostics.inputName} {analysisResult.diagnostics.inputShape}</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">ONNX Output Signature:</span>
                        <span className="text-[#0B3047] font-bold">{analysisResult.diagnostics.outputName} {analysisResult.diagnostics.outputShape}</span>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[#66737C] block font-bold">Raw Model Output Logits [Index 0, Index 1]:</span>
                        <code className="bg-slate-100 text-slate-900 px-2 py-1 rounded font-bold block mt-0.5 border border-slate-200">
                          {analysisResult.diagnostics.rawLogits}
                        </code>
                      </div>
                      <div className="sm:col-span-2">
                        <span className="text-[#66737C] block font-bold">Semantic Class Mapping:</span>
                        <span className="text-[#0B3047] font-bold">{analysisResult.diagnostics.classMapping}</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">Human Prob / AI Prob:</span>
                        <span className="text-emerald-700 font-bold">{analysisResult.diagnostics.authenticProbability}</span> / <span className="text-rose-700 font-bold">{analysisResult.diagnostics.syntheticProbability}</span>
                      </div>
                      <div>
                        <span className="text-[#66737C] block font-bold">Inference Time / Windows:</span>
                        <span className="text-[#0B3047] font-bold">{analysisResult.diagnostics.inferenceTime} ({analysisResult.diagnostics.evaluatedWindows} window{analysisResult.diagnostics.evaluatedWindows > 1 ? "s" : ""})</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
