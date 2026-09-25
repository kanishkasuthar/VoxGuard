export const INITIAL_CHAT_MESSAGES = [
  {
    id: 1,
    sender: "bot",
    text: "Hello, I am VoxBot — your VoxGuard.AI Cyber Security Assistant. I monitor real-time acoustic telemetry, threat vectors, and blockchain audit integrity. How can I assist you with today's security posture?",
    timestamp: "19:40 UTC"
  }
];

export const SUGGESTED_PROMPTS = [
  "Explain latest voice cloning attack vectors",
  "How does VoxGuard verify speaker biometrics?",
  "Summarize active Incident #INC-9042",
  "How are audit hashes stored on the blockchain?",
  "What is VoxGuard's deepfake detection latency?"
];

export const KNOWLEDGE_BASE = {
  "voice cloning": "VoxGuard detects voice cloning by analyzing micro-formant shifts, phase discontinuities in neural vocoders (like XTTS and Bark), pitch jitter variations, and high-frequency glottal sub-harmonics that human vocal cords produce naturally but AI synthesis models miss.",
  "speaker biometrics": "Speaker verification extracts 256-dimensional acoustic embeddings (ECAPA-TDNN architecture) from incoming stream segments and calculates cosine distance against enrolled caller voiceprints stored in encrypted SOC vaults.",
  "blockchain": "VoxGuard uses a zero-knowledge audit chain where raw audio is NEVER written to the blockchain to uphold privacy (GDPR / HIPAA). Only SHA-256 hashes of the spectral fingerprint, detection timestamps, risk scores, and enforcement actions are sealed into tamper-evident blocks.",
  "latency": "VoxGuard operates at ultra-low inference latency: average spectral frame processing takes 14ms - 18ms, enabling real-time call interception before financial or authentication damage occurs.",
  "incident #inc-9042": "Incident #INC-9042 was a Critical voice cloning attack (Risk Score 96/100) targeting Treasury Operations. The attacker used a synthetic clone of CFO Marcus Vance. VoxGuard detected high spectral phase divergence and automatically isolated the call at 19:34:12 UTC."
};
