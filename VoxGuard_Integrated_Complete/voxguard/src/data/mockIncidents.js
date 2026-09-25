export const MOCK_INCIDENTS = [
  {
    id: "INC-9042",
    timestamp: "2026-09-15 19:34:12 UTC",
    caller: "Marcus Vance (CFO Impersonation)",
    callerPhone: "+1 (555) 019-2834",
    targetDepartment: "Treasury Operations",
    threatType: "Real-time Voice Cloning",
    riskStatus: "CRITICAL",
    riskScore: 96,
    actionTaken: "Blocked & Isolated",
    blockchainTx: "0x8f3b2c9a1d4e7f6a5b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a",
    evidenceHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    neuralFingerprint: "Model-XTTS-v2-Clone-Signature-9941",
    acousticAnomalies: [
      "Missing High-Frequency Glottal Micro-Tremors (99.2% Confidence)",
      "Neural Vocoder Phase Discontinuity at 2.4 kHz",
      "Synthetic Spectral Envelope Smoothing"
    ],
    audioDuration: "00:01:42",
    investigatorNotes: "Attack targeted wire transfer authorization. The caller utilized a voice sample extracted from a public earnings call to clone the CFO's voice in real-time."
  },
  {
    id: "INC-9041",
    timestamp: "2026-09-15 18:12:05 UTC",
    caller: "Helpdesk Voice Bot impersonator",
    callerPhone: "+44 20 7946 0192",
    targetDepartment: "Customer Service Hotline",
    threatType: "Replay & Voice Synthesis",
    riskStatus: "HIGH",
    riskScore: 84,
    actionTaken: "Re-Authentication Required",
    blockchainTx: "0x4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b",
    evidenceHash: "a4f8e219b40d6c1e5927a4e69b82193f54817a02e6b77c1d42a98f123c5e884b",
    neuralFingerprint: "Bark-v1.4-Speech-Gen",
    acousticAnomalies: [
      "Acoustic Reverberation Mismatch with SIP Endpoint",
      "Artificial Pitch Flattening during Vowels",
      "Formant Discrepancy"
    ],
    audioDuration: "00:00:54",
    investigatorNotes: "Caller attempted to bypass voice biometric PIN using synthesized voice snippets."
  },
  {
    id: "INC-9040",
    timestamp: "2026-09-15 16:45:22 UTC",
    caller: "DevOps Lead (Fake Identity)",
    callerPhone: "+1 (555) 881-2094",
    targetDepartment: "IT Support & SSO Reset",
    threatType: "Deepfake Voice Spoofing",
    riskStatus: "HIGH",
    riskScore: 79,
    actionTaken: "Blocked & Isolated",
    blockchainTx: "0x1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e",
    evidenceHash: "7c9e128f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d",
    neuralFingerprint: "Vall-E-ZeroShot-Clone-V3",
    acousticAnomalies: [
      "Zero-Shot Latent Space Artifacts",
      "Inconsistent Background Noise Floor"
    ],
    audioDuration: "00:02:15",
    investigatorNotes: "Attempted administrative password reset via phone. Blocked automatically by policy rule #7."
  },
  {
    id: "INC-9039",
    timestamp: "2026-09-15 14:20:00 UTC",
    caller: "Authentic Client (Verified)",
    callerPhone: "+1 (555) 234-5678",
    targetDepartment: "VIP Wealth Client Desk",
    threatType: "Natural Voice (False Alarm Check)",
    riskStatus: "LOW",
    riskScore: 8,
    actionTaken: "Allowed",
    blockchainTx: "0x9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a",
    evidenceHash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    neuralFingerprint: "Verified-Human-Print-CL-882",
    acousticAnomalies: [],
    audioDuration: "00:04:12",
    investigatorNotes: "Legitimate VIP client call verified with 99.1% speaker biometric confidence."
  },
  {
    id: "INC-9038",
    timestamp: "2026-09-15 11:05:44 UTC",
    caller: "Executive Assistant Impersonator",
    callerPhone: "+1 (555) 902-1143",
    targetDepartment: "HR Benefits & Payroll",
    threatType: "Voice Cloning & Social Engineering",
    riskStatus: "MEDIUM",
    riskScore: 62,
    actionTaken: "Re-Authentication Required",
    blockchainTx: "0x3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b2c",
    evidenceHash: "9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba",
    neuralFingerprint: "ElevenLabs-V1-Clone",
    acousticAnomalies: [
      "Micro-pause Timing Anomalies",
      "Synthetic Respiratory Pattern"
    ],
    audioDuration: "00:01:10",
    investigatorNotes: "Suspicious request for direct deposit routing changes."
  }
];
