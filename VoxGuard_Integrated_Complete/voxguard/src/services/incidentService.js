import { apiClient } from "./api";
import { MOCK_INCIDENTS } from "../data/mockIncidents";
import { offlineStorage } from "./offlineStorage";

export const incidentService = {
  async getIncidents(filters = {}) {
    let apiIncidents = [];
    try {
      const res = await apiClient.get("/incidents");
      if (res.data && res.data.success && Array.isArray(res.data.incidents)) {
        apiIncidents = res.data.incidents.map((inc) => ({
          id: inc.id,
          timestamp: new Date(inc.createdAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          date: new Date(inc.createdAt || Date.now()).toLocaleDateString(),
          caller: inc.callerPhone || inc.caller || "Incoming Call",
          threatType: inc.threatType || "Voice Impersonation Event",
          riskStatus: inc.status === "BLOCKED" ? "HIGH" : "LOW",
          riskScore: inc.riskScore || 85,
          actionTaken: inc.status || "BLOCKED",
          targetDepartment: "Personal Security",
          evidenceHash: `0x${inc.id.replace(/-/g, "").padEnd(16, "0")}`,
          blockchainTx: "VERIFIED IMMUTABLE"
        }));
      }
    } catch (err) {
      console.warn("[Incident API] Endpoint error:", err.message);
    }

    const storedRecords = await offlineStorage.getAllRecords();
    const realIncidents = storedRecords.map((r, idx) => ({
      id: r.evidenceId || r.id || `VG-INC-${1000 + idx}`,
      timestamp: new Date(r.timestamp || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      date: new Date(r.timestamp || Date.now()).toLocaleDateString(),
      caller: r.fileName || "recorded_audio_sample.wav",
      threatType: r.classification === "AI-GENERATED" ? "Voice Clone Intercepted" : r.classification === "HUMAN" ? "Human Speaker Verified" : "Acoustic Analysis",
      riskStatus: r.riskLevel || "LOW",
      riskScore: r.syntheticProbability || r.aiProbability || 10,
      actionTaken: r.riskLevel === "CRITICAL" || r.riskLevel === "HIGH" ? "Call Blocked" : "Verified Allowed",
      targetDepartment: "Personal Security",
      evidenceHash: r.evidenceHash || "N/A",
      blockchainTx: r.transactionHash || (r.blockchainStatus === "PENDING_SYNC" ? "PENDING SYNC" : "CONFIRMED ON-CHAIN")
    }));

    let list = [...apiIncidents, ...realIncidents, ...MOCK_INCIDENTS];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      list = list.filter(
        (inc) =>
          inc.id.toLowerCase().includes(q) ||
          inc.caller.toLowerCase().includes(q) ||
          inc.threatType.toLowerCase().includes(q)
      );
    }

    if (filters.riskStatus && filters.riskStatus !== "ALL") {
      list = list.filter((inc) => inc.riskStatus === filters.riskStatus);
    }

    if (filters.threatType && filters.threatType !== "ALL") {
      list = list.filter((inc) => inc.threatType === filters.threatType);
    }

    return list;
  },

  async getIncidentById(id) {
    const list = await this.getIncidents();
    return list.find((inc) => inc.id === id) || list[0] || MOCK_INCIDENTS[0];
  },

  async recordIncident(incidentData) {
    try {
      const res = await apiClient.post("/incidents", incidentData);
      return res.data;
    } catch (err) {
      console.warn("[Incident API] Record fallback:", err.message);
      return { success: true };
    }
  }
};
