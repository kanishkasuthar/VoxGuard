import { mockDelay } from "./api";
import { DASHBOARD_STATS, THREAT_TREND_DATA } from "../data/mockAnalytics";

export const reportsService = {
  async getReportOverview() {
    await mockDelay(400);
    return {
      stats: DASHBOARD_STATS,
      trends: THREAT_TREND_DATA,
      complianceStatus: {
        soc2Type2: "Compliant",
        iso27001: "Certified",
        gdprPrivacy: "Zero Raw Audio Retention Policy Active",
        hipaaVault: "Encrypted Audio Hash Anchoring"
      }
    };
  },

  async exportReport(format = "pdf", dateRange = "last30") {
    await mockDelay(800);
    return {
      downloadUrl: `#download-report-${dateRange}.${format}`,
      fileName: `VoxGuard_Security_Audit_${dateRange}.${format}`,
      format: format.toUpperCase(),
      size: format === "pdf" ? "3.4 MB" : "412 KB",
      timestamp: new Date().toISOString()
    };
  }
};
