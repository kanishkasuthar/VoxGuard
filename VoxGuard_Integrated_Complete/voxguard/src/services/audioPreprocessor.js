/**
 * Web Audio API Browser Preprocessor & Quality Inspector for VoxGuard.AI
 * Validates audio integrity and resamples raw PCM audio buffers.
 */

export const audioPreprocessor = {
  /**
   * Decode audio file/blob into AudioBuffer using Web Audio API
   * @param {File|Blob} fileOrBlob 
   * @returns {Promise<AudioBuffer>}
   */
  async decodeAudio(fileOrBlob) {
    if (!fileOrBlob || fileOrBlob.size === 0) {
      throw new Error("Audio file is empty or corrupted.");
    }

    const arrayBuffer = await fileOrBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    try {
      const decodedData = await audioCtx.decodeAudioData(arrayBuffer);
      await audioCtx.close();
      if (!decodedData || decodedData.length === 0 || decodedData.duration === 0) {
        throw new Error("No audio stream found in this file.");
      }
      return decodedData;
    } catch (err) {
      await audioCtx.close();
      if (err.message && err.message.includes("No audio stream")) {
        throw err;
      }
      const ext = fileOrBlob.name ? fileOrBlob.name.split(".").pop().toLowerCase() : "";
      throw new Error(
        `Browser cannot decode .${ext || "media"} format directly. Please connect online for backend conversion or convert to WAV/MP3.`
      );
    }
  },

  /**
   * Resample audio buffer to 16,000 Hz Mono Float32Array
   * @param {AudioBuffer} audioBuffer 
   * @param {number} targetSampleRate - Defaults to 16000 Hz
   * @returns {Promise<Float32Array>}
   */
  async resampleToMonoPCM(audioBuffer, targetSampleRate = 16000) {
    const offlineCtx = new OfflineAudioContext(
      1, // Mono output
      Math.ceil(audioBuffer.duration * targetSampleRate),
      targetSampleRate
    );

    const source = offlineCtx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    return renderedBuffer.getChannelData(0);
  },

  /**
   * Perform basic audio quality & acoustic signal validation and statistics
   * @param {AudioBuffer} audioBuffer 
   * @param {Float32Array} pcmData 
   */
  validateAudioQuality(audioBuffer, pcmData) {
    // 1. Duration check
    if (audioBuffer.duration < 0.3) {
      throw new Error("Audio recording is too short for voice feature extraction (minimum 0.3s required).");
    }

    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let sumSquares = 0;

    for (let i = 0; i < pcmData.length; i++) {
      const val = pcmData[i];
      if (val < min) min = val;
      if (val > max) max = val;
      sum += val;
      sumSquares += val * val;
    }

    const mean = sum / pcmData.length;
    const rms = Math.sqrt(sumSquares / pcmData.length);

    if (rms < 0.0005) {
      throw new Error("Audio recording appears to be silent or contains no audible speech signal.");
    }

    return { min, max, mean, rms, isUsable: true };
  },

  /**
   * Format PCM samples array to exact AASIST window size (64600 samples)
   * Tile/pad if shorter than 64600, or crop if longer.
   * @param {Float32Array} pcmData 
   * @param {number} targetLength - Default 64600
   * @returns {Float32Array}
   */
  formatPcmWindow(pcmData, targetLength = 64600) {
    if (pcmData.length >= targetLength) {
      return pcmData.slice(0, targetLength);
    }
    const padded = new Float32Array(targetLength);
    let offset = 0;
    while (offset < targetLength) {
      const chunk = pcmData.slice(0, Math.min(pcmData.length, targetLength - offset));
      padded.set(chunk, offset);
      offset += chunk.length;
    }
    return padded;
  },

  /**
   * Complete pipeline: File/Blob -> Decoded 16kHz Mono Float32 PCM with Quality Verification
   * @param {File|Blob} fileOrBlob 
   * @returns {Promise<{ pcmData: Float32Array, formattedPcm: Float32Array, duration: number, sampleRate: number, numberOfChannels: number, min: number, max: number, mean: number, rms: number }>}
   */
  async processAudioFile(fileOrBlob) {
    console.log("[VOXGUARD DEBUG] File name:", fileOrBlob?.name || "audio.wav");
    console.log("[VOXGUARD DEBUG] File type:", fileOrBlob?.type || "unknown");
    console.log("[VOXGUARD DEBUG] File size:", fileOrBlob?.size ? `${fileOrBlob.size} bytes` : "unknown");

    const audioBuffer = await this.decodeAudio(fileOrBlob);

    console.log("[VOXGUARD DEBUG] Decoded sample rate:", audioBuffer.sampleRate, "Hz");
    console.log("[VOXGUARD DEBUG] Decoded channels:", audioBuffer.numberOfChannels);
    console.log("[VOXGUARD DEBUG] Decoded duration:", audioBuffer.duration.toFixed(3), "s");
    console.log("[VOXGUARD DEBUG] Original PCM sample count:", audioBuffer.length);

    const pcmData = await this.resampleToMonoPCM(audioBuffer, 16000);
    console.log("[VOXGUARD DEBUG] Resampled sample count (16kHz Mono):", pcmData.length);

    const { min, max, mean, rms } = this.validateAudioQuality(audioBuffer, pcmData);
    console.log("[VOXGUARD DEBUG] Minimum PCM value:", min.toFixed(6));
    console.log("[VOXGUARD DEBUG] Maximum PCM value:", max.toFixed(6));
    console.log("[VOXGUARD DEBUG] Mean PCM value:", mean.toFixed(6));
    console.log("[VOXGUARD DEBUG] RMS Energy:", rms.toFixed(6));

    const formattedPcm = this.formatPcmWindow(pcmData, 64600);

    return {
      pcmData,
      formattedPcm,
      duration: audioBuffer.duration,
      sampleRate: 16000,
      originalSampleRate: audioBuffer.sampleRate,
      numberOfChannels: audioBuffer.numberOfChannels,
      min,
      max,
      mean,
      rms
    };
  }
};
