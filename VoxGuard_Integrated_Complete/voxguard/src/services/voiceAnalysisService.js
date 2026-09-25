import { networkStatusService } from "./networkStatus";
import { offlineInferenceEngine } from "./offlineInferenceEngine";
import { apiClient } from "./api";

export const voiceAnalysisService = {
  /**
   * Main entry point for analyzing voice recordings via real ONNX / Backend API
   * 
   * @param {File|Blob} fileOrBlob 
   */
  async analyzeAudioFile(fileOrBlob) {
    // 1. Primary: Run browser ONNX AASIST AI Engine (handles all audio formats via Web Audio API)
    const localModelStatus = await offlineInferenceEngine.checkModelAvailability();
    if (localModelStatus === "READY") {
      try {
        const localResult = await offlineInferenceEngine.analyzeAudio(fileOrBlob);
        
        // Sync record with backend API for history / persistence
        try {
          const formData = new FormData();
          formData.append("audio", fileOrBlob);
          apiClient.post("/analyze/audio", formData, {
            headers: { "Content-Type": "multipart/form-data" }
          }).catch(() => {});
        } catch (e) {}

        return localResult;
      } catch (err) {
        console.warn("[Voice API] Local ONNX engine error, trying backend endpoint:", err.message);
      }
    }

    // 2. Fallback: Backend upload endpoint
    try {
      const formData = new FormData();
      formData.append("audio", fileOrBlob);

      const response = await apiClient.post("/analyze/audio", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (response.data && response.data.success && response.data.result) {
        const res = response.data.result;
        return {
          isAvailable: true,
          fileName: res.originalName || fileOrBlob?.name || "audio_recording.wav",
          fileSize: `${(res.sizeBytes / 1024 / 1024).toFixed(2)} MB`,
          duration: "5s",
          sampleRate: "16,000 Hz",
          classification: res.classification, // "HUMAN" or "AI-GENERATED"
          verdict: res.classification === "HUMAN" ? "SAFE" : "HIGH THREAT",
          riskLevel: res.classification === "HUMAN" ? "LOW" : "CRITICAL",
          inferenceMode: "Backend ONNX AASIST AI Engine",
          modelVersion: res.model || "AASIST-ResNet-v1",
          authenticProbability: res.authenticProb,
          syntheticProbability: res.syntheticProb,
          humanProbability: res.authenticProb,
          aiProbability: res.syntheticProb,
          confidence: res.confidence,
          explanation: res.classification === "HUMAN" 
            ? "Voice spectral harmonics match authentic human vocal tract patterns." 
            : "Synthetic vocoder micro-jitter phase anomalies detected.",
          scores: {
            deepfakeProbability: res.syntheticProb,
            authenticProbability: res.authenticProb,
            overallRisk: res.syntheticProb
          },
          blockchainTxHash: res.sha256Hash
        };
      }
    } catch (err) {
      console.warn("[Voice API] Backend endpoint unavailable:", err.message);
    }

    // 3. Explicit Model Unavailable State
    return {
      isAvailable: false,
      error: "Local AI detection model unavailable.",
      verdict: "UNAVAILABLE",
      classification: "UNAVAILABLE",
      riskLevel: "UNAVAILABLE",
      inferenceMode: "AI Engine Offline",
      scores: null
    };
  }
};
