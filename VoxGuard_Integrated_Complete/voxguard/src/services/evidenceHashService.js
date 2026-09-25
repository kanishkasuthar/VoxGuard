/**
 * Web Crypto API SHA-256 Evidence Hashing Engine for VoxGuard.AI
 * 
 * Computes deterministic SHA-256 cryptographic hashes for audio files and evidence payloads.
 * Same unchanged file -> Same SHA-256 hash
 * Modified file -> Different SHA-256 hash (Tamper Detection)
 */

export const evidenceHashService = {
  /**
   * Compute SHA-256 hash of audio File or Blob using browser Web Crypto API
   * @param {File|Blob} fileOrBlob 
   * @returns {Promise<string>} 64-character lowercase hex string
   */
  async computeAudioHash(fileOrBlob) {
    if (!fileOrBlob) {
      throw new Error("Cannot compute hash: No audio file provided.");
    }

    const arrayBuffer = await fileOrBlob.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", arrayBuffer);
    
    // Convert ArrayBuffer to 64-character hex string
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toLowerCase();

    console.log("[EVIDENCE HASH DEBUG]");
    console.log("Original file name:", fileOrBlob.name || "audio_sample.wav");
    console.log("Original file type:", fileOrBlob.type || "unknown");
    console.log("Original file size:", fileOrBlob.size ? `${fileOrBlob.size} bytes` : "unknown");
    console.log("Hash input type: RAW ORIGINAL FILE BYTES (ArrayBuffer)");
    console.log("Hash input byte length:", arrayBuffer.byteLength);
    console.log("SHA-256:", hexHash);
    console.log("Hash creation timestamp:", new Date().toISOString());

    return hexHash;
  },

  /**
   * Compare two 64-character SHA-256 hashes normalized (trimmed, lowercase)
   * @param {string} storedHash 
   * @param {string} calculatedHash 
   * @returns {boolean}
   */
  verifyHashesEqual(storedHash, calculatedHash) {
    if (!storedHash || !calculatedHash) return false;
    const normStored = String(storedHash).trim().toLowerCase();
    const normCalc = String(calculatedHash).trim().toLowerCase();
    return normStored === normCalc;
  },

  /**
   * Compute SHA-256 digest of structured metadata payload
   * @param {Object} metadata 
   * @returns {Promise<string>}
   */
  async computeMetadataHash(metadata) {
    const rawString = JSON.stringify({
      evidenceId: metadata.evidenceId,
      evidenceHash: metadata.evidenceHash,
      verdict: metadata.verdict,
      riskLevel: metadata.riskLevel,
      modelVersion: metadata.modelVersion,
      timestamp: metadata.timestamp
    });

    const encoder = new TextEncoder();
    const data = encoder.encode(rawString);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("").toLowerCase();
  },

  /**
   * Helper to format full 64-character hex hash into shortened string (e.g. "a81f...92bc")
   * @param {string} fullHash 
   * @returns {string}
   */
  shortenHash(fullHash) {
    if (!fullHash || fullHash.length < 12) return fullHash || "";
    return `${fullHash.substring(0, 6)}...${fullHash.substring(fullHash.length - 6)}`;
  }
};
