export const MOCK_CALL_SESSIONS = [
  {
    id: "CALL-8942-NY",
    callerName: "Marcus Vance (CEO Impersonator)",
    callerPhone: "+1 (555) 019-2834",
    callerLocation: "New York, USA (SIP Relay Node #12)",
    originIP: "198.51.100.42",
    protocol: "TLS / SRTP (Encrypted Trunk)",
    targetAccount: "Corporate Wire Transfer Desk",
    callerAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    status: "active",
    threatLevel: "CRITICAL",
    riskScore: 94,
    metrics: {
      deepfakeScore: 96,
      speakerSimilarity: 34,
      antiSpoofScore: 98,
      voiceConsistency: 22,
      latencyMs: 14,
      pitchJitter: "4.8%",
      spectralDivergence: "8.9 dB",
      phaseCoherence: "12%"
    },
    audioFeatures: {
      sampleRate: "48 kHz",
      bitDepth: "24-bit PCM",
      formantShift: "Detected (AI Synthesis Artifacts)",
      neuralModelMatch: "ElevenLabs / XTTS v2 Clone Pattern"
    },
    transcriptSnippet: "...confirming authorization for the immediate wire transfer of $450,000 to the offshore escrow account before end of business...",
    timestamp: "Just now"
  },
  {
    id: "CALL-7721-SF",
    callerName: "Dr. Aris Thorne (CTO Verification)",
    callerPhone: "+1 (555) 382-9910",
    callerLocation: "San Francisco, USA",
    originIP: "203.0.113.88",
    protocol: "WebRTC Secure Direct",
    targetAccount: "DevOps Root Access Hotline",
    callerAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    status: "active",
    threatLevel: "LOW",
    riskScore: 6,
    metrics: {
      deepfakeScore: 3,
      speakerSimilarity: 98,
      antiSpoofScore: 4,
      voiceConsistency: 97,
      latencyMs: 12,
      pitchJitter: "0.4%",
      spectralDivergence: "0.2 dB",
      phaseCoherence: "96%"
    },
    audioFeatures: {
      sampleRate: "48 kHz",
      bitDepth: "24-bit PCM",
      formantShift: "Natural Vocal Micro-Tension",
      neuralModelMatch: "None (Genuine Human Acoustic Print)"
    },
    transcriptSnippet: "...requesting multi-factor code confirmation for deployment pipeline release 4.12...",
    timestamp: "2 mins ago"
  },
  {
    id: "CALL-6109-LD",
    callerName: "Unknown Caller (Finance Desk)",
    callerPhone: "+44 20 7946 0912",
    callerLocation: "London, UK (VoIP Gateway)",
    originIP: "198.51.100.99",
    protocol: "SIP Standard",
    targetAccount: "Accounts Payable",
    callerAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    status: "flagged",
    threatLevel: "HIGH",
    riskScore: 78,
    metrics: {
      deepfakeScore: 82,
      speakerSimilarity: 48,
      antiSpoofScore: 85,
      voiceConsistency: 41,
      latencyMs: 19,
      pitchJitter: "3.1%",
      spectralDivergence: "6.4 dB",
      phaseCoherence: "35%"
    },
    audioFeatures: {
      sampleRate: "16 kHz",
      bitDepth: "16-bit PCM",
      formantShift: "Neural Vocoder Resynthesis Detected",
      neuralModelMatch: "Bark / Vall-E Synthetic Pattern"
    },
    transcriptSnippet: "...urgent invoice payment update for vendor account ending in 9942...",
    timestamp: "5 mins ago"
  }
];

export const MOCK_LIVE_WAVEFORM_DATA = Array.from({ length: 60 }, (_, i) => ({
  time: i,
  amplitude: Math.sin(i * 0.4) * 40 + Math.random() * 35 + 20,
  syntheticArtifact: Math.random() > 0.7 ? Math.random() * 80 + 20 : 5,
  frequency: 200 + Math.sin(i * 0.2) * 150 + Math.random() * 50
}));
