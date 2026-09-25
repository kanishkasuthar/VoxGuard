import { offlineInferenceEngine } from "./offlineInferenceEngine";
import { riskEngine } from "./riskEngine";

/**
 * LiveAudioAnalyzer processes the remote WebRTC MediaStream.
 * It routes the remote audio into:
 * 1. AudioContext -> AnalyserNode for real waveform levels
 * 2. ScriptProcessor/AudioWorklet -> 16kHz PCM buffer -> AASIST ONNX Model (Voice Authenticity)
 * 3. Web Speech API (SpeechRecognition) -> Live STT Transcript -> Risk Engine (Conversation Risk)
 */
export class LiveAudioAnalyzer {
  constructor(options = {}) {
    this.audioCtx = null;
    this.sourceNode = null;
    this.analyserNode = null;
    this.processorNode = null;
    this.recognition = null;
    this.isAnalyzing = false;

    this.onAudioLevel = options.onAudioLevel || (() => {});
    this.onVoiceAuth = options.onVoiceAuth || (() => {});
    this.onContentRisk = options.onContentRisk || (() => {});
    this.onTranscript = options.onTranscript || (() => {});

    this.pcmBuffer = [];
    this.targetSampleRate = 16000;
  }

  async startAnalysis(mediaStream) {
    if (!mediaStream) return;
    this.stopAnalysis();

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      this.sourceNode = this.audioCtx.createMediaStreamSource(mediaStream);
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.sourceNode.connect(this.analyserNode);

      // Start Audio Level polling for waveform
      this.isAnalyzing = true;
      this._pollAudioLevel();

      // Audio Processor for PCM extraction & AASIST ONNX Voice Anti-Spoofing
      const bufferSize = 4096;
      this.processorNode = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);
      
      this.processorNode.onaudioprocess = (e) => {
        if (!this.isAnalyzing) return;
        const inputData = e.inputBuffer.getChannelData(0);
        this._resampleAndBuffer(inputData, this.audioCtx.sampleRate);
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioCtx.destination);

      // Web Speech API for Real Speech-to-Text
      this._initSpeechRecognition();

    } catch (err) {
      console.error("[LiveAudioAnalyzer] Error initializing audio context:", err);
    }
  }

  async startAnalysisFromElement(audioElement) {
    if (!audioElement) return;
    this.stopAnalysis();

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.audioCtx = new AudioCtx();
      if (this.audioCtx.state === "suspended") {
        await this.audioCtx.resume();
      }

      this.sourceNode = this.audioCtx.createMediaElementSource(audioElement);
      this.analyserNode = this.audioCtx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.sourceNode.connect(this.analyserNode);

      this.isAnalyzing = true;
      this._pollAudioLevel();

      const bufferSize = 4096;
      this.processorNode = this.audioCtx.createScriptProcessor(bufferSize, 1, 1);
      this.processorNode.onaudioprocess = (e) => {
        if (!this.isAnalyzing) return;
        const inputData = e.inputBuffer.getChannelData(0);
        this._resampleAndBuffer(inputData, this.audioCtx.sampleRate);
      };

      this.sourceNode.connect(this.processorNode);
      this.processorNode.connect(this.audioCtx.destination);
      this.sourceNode.connect(this.audioCtx.destination); // Playback through speakers
    } catch (err) {
      console.error("[LiveAudioAnalyzer] Error connecting audio element:", err);
    }
  }

  pushTranscript(text) {
    if (!text || !text.trim()) return;
    this.onTranscript(text.trim());
    const riskAssessment = riskEngine.evaluateTranscript(text);
    this.onContentRisk({
      level: riskAssessment.level,
      score: riskAssessment.score,
      transcript: text.trim(),
      signals: riskAssessment.signals,
      reason: riskAssessment.reason
    });
  }

  _pollAudioLevel() {
    if (!this.isAnalyzing || !this.analyserNode) return;

    const dataArray = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const avg = sum / dataArray.length;
    const normalizedLevel = Math.min(100, Math.round((avg / 255) * 100));

    this.onAudioLevel(normalizedLevel);

    requestAnimationFrame(() => this._pollAudioLevel());
  }

  _resampleAndBuffer(float32Array, inputSampleRate) {
    // Resample to 16kHz
    const ratio = inputSampleRate / this.targetSampleRate;
    const newLength = Math.floor(float32Array.length / ratio);
    
    for (let i = 0; i < newLength; i++) {
      const idx = Math.floor(i * ratio);
      this.pcmBuffer.push(float32Array[idx]);
    }

    // Every 16,000 samples (~1 second of 16kHz audio), trigger AASIST inference
    if (this.pcmBuffer.length >= 16000) {
      const chunkToAnalyze = new Float32Array(this.pcmBuffer.splice(0, 16000));
      this._runAASISTInference(chunkToAnalyze);
    }
  }

  async _runAASISTInference(float32Array) {
    try {
      const result = await offlineInferenceEngine.analyzeAudioBuffer(float32Array, 16000);
      if (result && result.classification) {
        this.onVoiceAuth({
          classification: result.classification,
          authenticProb: Math.round(result.authenticProb * 10) / 10,
          syntheticProb: Math.round(result.syntheticProb * 10) / 10,
          confidence: Math.round(result.confidence * 10) / 10,
          model: result.model || "AASIST v1.0 (ONNX WebGPU)",
          assessment: result.assessment || "Acoustic spectral feature verification active."
        });
      }
    } catch (err) {
      console.warn("[LiveAudioAnalyzer] AASIST ONNX inference warning:", err);
    }
  }

  _initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("[LiveAudioAnalyzer] SpeechRecognition API not supported in this browser.");
      return;
    }

    try {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = "en-US";

      this.recognition.onresult = (event) => {
        let transcript = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          this.onTranscript(transcript.trim());
          const riskAssessment = riskEngine.evaluateTranscript(transcript);
          this.onContentRisk({
            level: riskAssessment.level,
            score: riskAssessment.score,
            transcript: transcript.trim(),
            signals: riskAssessment.signals,
            reason: riskAssessment.reason
          });
        }
      };

      this.recognition.onerror = (e) => {
        console.warn("[LiveAudioAnalyzer] SpeechRecognition error:", e.error);
      };

      this.recognition.onend = () => {
        if (this.isAnalyzing && this.recognition) {
          try {
            this.recognition.start();
          } catch (e) {}
        }
      };

      this.recognition.start();
    } catch (err) {
      console.warn("[LiveAudioAnalyzer] Failed to start SpeechRecognition:", err);
    }
  }

  stopAnalysis() {
    this.isAnalyzing = false;
    this.pcmBuffer = [];

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {}
      this.recognition = null;
    }

    if (this.processorNode) {
      try {
        this.processorNode.disconnect();
      } catch (e) {}
      this.processorNode = null;
    }

    if (this.sourceNode) {
      try {
        this.sourceNode.disconnect();
      } catch (e) {}
      this.sourceNode = null;
    }

    if (this.audioCtx && this.audioCtx.state !== "closed") {
      try {
        this.audioCtx.close();
      } catch (e) {}
      this.audioCtx = null;
    }
  }
}
