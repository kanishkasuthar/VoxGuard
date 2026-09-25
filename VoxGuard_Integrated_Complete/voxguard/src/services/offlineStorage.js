/**
 * Native IndexedDB Local Storage for VoxGuard Offline Analysis Records
 * Database: voxguard-offline-db (v1)
 * Store: analysis_records
 * 
 * SECURITY NOTICE: Never stores passwords, tokens, API keys, or sensitive credentials.
 */

const DB_NAME = "voxguard-offline-db";
const DB_VERSION = 1;
const STORE_NAME = "analysis_records";

const openDB = () => {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB is not supported in this environment"));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("syncStatus", "syncStatus", { unique: false });
      }
    };

    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
};

export const offlineStorage = {
  /**
   * Save analysis result to IndexedDB
   * @param {Object} record 
   */
  async saveAnalysisRecord(record) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const recordToSave = {
        id: record.id || record.evidenceId || `offline-rec-${Date.now()}-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Date.now().toString(36)}`,
        evidenceId: record.evidenceId || record.id || `VG-EV-${Date.now()}`,
        timestamp: record.timestamp || new Date().toISOString(),
        fileName: record.fileName || "recorded_audio_sample.wav",
        fileSize: record.fileSize || "1.2 MB",
        classification: record.classification || "HUMAN",
        verdict: record.verdict || "AUTHENTIC_HUMAN",
        riskLevel: record.riskLevel || "LOW",
        overallRisk: record.overallRisk || record.syntheticProbability || 10,
        deepfakeProbability: record.deepfakeProbability || record.syntheticProbability || 10,
        authenticProbability: record.authenticProbability || record.humanProbability || 90,
        syntheticProbability: record.syntheticProbability || record.aiProbability || 10,
        humanProbability: record.humanProbability || record.authenticProbability || 90,
        aiProbability: record.aiProbability || record.syntheticProbability || 10,
        confidence: record.confidence || 95,
        explanation: record.explanation || "",
        inferenceMode: record.inferenceMode || "Offline Local AI",
        modelVersion: record.modelVersion || "voice_antispoof_v1.onnx",
        evidenceHash: record.evidenceHash || null,
        shortHash: record.shortHash || null,
        syncStatus: record.syncStatus || record.blockchainStatus || "pending_sync",
        blockchainStatus: record.blockchainStatus || record.syncStatus || "PENDING_SYNC",
        blockchainTxHash: record.blockchainTxHash || record.transactionHash || null,
        transactionHash: record.transactionHash || record.blockchainTxHash || null,
        blockNumber: record.blockNumber || null
      };

      await new Promise((resolve, reject) => {
        const req = store.put(recordToSave);
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      });

      return recordToSave;
    } catch (err) {
      console.warn("VoxGuard IndexedDB Storage Notice:", err.message);
      return null;
    }
  },

  /**
   * Get all offline stored records
   */
  async getAllRecords() {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const req = store.getAll();
        req.onsuccess = () => resolve(req.result || []);
        req.onerror = () => reject(req.error);
      });
    } catch (err) {
      return [];
    }
  },

  /**
   * Get pending sync records
   */
  async getPendingSyncRecords() {
    const all = await this.getAllRecords();
    return all.filter((r) => r.syncStatus === "pending_sync");
  },

  /**
   * Update sync status of a record
   */
  async updateSyncStatus(id, syncStatus) {
    try {
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);

      const getReq = store.get(id);
      getReq.onsuccess = () => {
        const data = getReq.result;
        if (data) {
          data.syncStatus = syncStatus;
          store.put(data);
        }
      };
    } catch (err) {
      // Graceful ignore
    }
  }
};
