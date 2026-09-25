export const DASHBOARD_STATS = {
  callsMonitored: "128,490",
  callsMonitoredTrend: "+14.2% from last week",
  threatsDetected: "1,429",
  threatsTrend: "-8.5% from last week",
  callsAllowed: "127,061",
  callsBlocked: "1,429",
  avgLatency: "14.8 ms",
  blockchainVerifiedRate: "100%",
  activeProtocols: "SIP, WebRTC, VoLTE, SRTP"
};

export const THREAT_TREND_DATA = [
  { time: "00:00", legitimate: 450, syntheticDeepfake: 12, spoofReplay: 4 },
  { time: "04:00", legitimate: 220, syntheticDeepfake: 5, spoofReplay: 2 },
  { time: "08:00", legitimate: 980, syntheticDeepfake: 45, spoofReplay: 18 },
  { time: "12:00", legitimate: 1840, syntheticDeepfake: 89, spoofReplay: 32 },
  { time: "16:00", legitimate: 1620, syntheticDeepfake: 64, spoofReplay: 24 },
  { time: "20:00", legitimate: 1100, syntheticDeepfake: 28, spoofReplay: 10 }
];

export const THREAT_TYPE_DISTRIBUTION = [
  { name: "Zero-Shot AI Clone", value: 48, color: "#6366F1" },
  { name: "Neural Vocoder Resynthesis", value: 27, color: "#3B82F6" },
  { name: "Acoustic Replay Attack", value: 15, color: "#F59E0B" },
  { name: "Text-to-Speech Injection", value: 10, color: "#EF4444" }
];

export const RISK_DISTRIBUTION = [
  { level: "Low (0-25)", count: 127061, color: "#10B981" },
  { level: "Medium (26-60)", count: 842, color: "#F59E0B" },
  { level: "High (61-85)", count: 421, color: "#F97316" },
  { level: "Critical (86-100)", count: 166, color: "#EF4444" }
];
