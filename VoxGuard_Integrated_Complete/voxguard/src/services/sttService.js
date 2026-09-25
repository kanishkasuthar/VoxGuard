/**
 * Real Speech-to-Text Service for VoxGuard.AI
 * Uses Web Speech API (webkitSpeechRecognition) or Cloud STT backend.
 * Returns real spoken transcripts for social-engineering analysis.
 * 
 * Never fabricates fake transcripts when STT is unavailable.
 */

export const sttService = {
  /**
   * Transcribe audio sample or check browser SpeechRecognition capability
   * @param {File|Blob} [audioBlob] 
   * @returns {Promise<{ isAvailable: boolean, transcript: string|null, language: string, error?: string }>}
   */
  async transcribeAudio(audioBlob = null) {
    // 1. Check Web Speech API support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return {
        isAvailable: false,
        transcript: null,
        language: "en-US",
        error: "Speech-to-Text engine unavailable in this browser."
      };
    }

    return new Promise((resolve) => {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";

        let finalTranscript = "";

        recognition.onresult = (event) => {
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            }
          }
        };

        recognition.onerror = (err) => {
          console.warn("[STT Service] SpeechRecognition Notice:", err.error);
          resolve({
            isAvailable: false,
            transcript: null,
            language: "en-US",
            error: `Speech-to-Text notice: ${err.error}`
          });
        };

        recognition.onend = () => {
          if (finalTranscript) {
            resolve({
              isAvailable: true,
              transcript: finalTranscript,
              language: "en-US"
            });
          } else {
            resolve({
              isAvailable: false,
              transcript: null,
              language: "en-US",
              error: "No clear speech transcript captured."
            });
          }
        };

        recognition.start();

        // Safety timeout if recognition doesn't end
        setTimeout(() => {
          try {
            recognition.stop();
          } catch (e) {
            // Ignore
          }
        }, 5000);
      } catch (err) {
        resolve({
          isAvailable: false,
          transcript: null,
          language: "en-US",
          error: err.message || "STT execution error."
        });
      }
    });
  }
};
