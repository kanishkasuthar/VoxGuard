export const MOCK_VOICE_IDENTITIES = [
  {
    id: "VG-001",
    personName: "Kanishka",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80",
    verificationStatus: "Verified Voice",
    confidence: 96,
    knownNumbers: ["+91 XXXXX 1234", "+91 XXXXX 7890", "+91 XXXXX 4821"],
    callsObserved: 12,
    lastDetected: "Today",
    threatCount: 2,
    department: "SIH 2026 Core Team",
    enrolledAt: "2026-08-01",
    history: [
      { date: "TODAY 14:42", status: "Safe", number: "+91 XXXXX 1234", riskScore: 18 },
      { date: "YESTERDAY 11:03", status: "Safe", number: "+91 XXXXX 7890", riskScore: 12 },
      { date: "SEP 10 18:21", status: "Suspicious", number: "+91 XXXXX 4821", riskScore: 67 },
      { date: "SEP 07 09:42", status: "Blocked (Deepfake)", number: "+91 XXXXX 4821", riskScore: 91 }
    ]
  },
  {
    id: "VG-002",
    personName: "Dr. Aris Thorne",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80",
    verificationStatus: "Verified Voice",
    confidence: 98,
    knownNumbers: ["+1 XXXXX 9910", "+1 XXXXX 4412"],
    callsObserved: 34,
    lastDetected: "2 mins ago",
    threatCount: 0,
    department: "DevOps & Core Infra",
    enrolledAt: "2026-07-01",
    history: [
      { date: "TODAY 19:40", status: "Safe", number: "+1 XXXXX 9910", riskScore: 4 },
      { date: "SEP 14 10:15", status: "Safe", number: "+1 XXXXX 4412", riskScore: 5 }
    ]
  },
  {
    id: "VG-003",
    personName: "Marcus Vance (CFO Profile)",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80",
    verificationStatus: "Targeted (Under Watch)",
    confidence: 34,
    knownNumbers: ["+1 XXXXX 2834"],
    callsObserved: 8,
    lastDetected: "5 mins ago",
    threatCount: 3,
    department: "Executive CFO Desk",
    enrolledAt: "2026-06-15",
    history: [
      { date: "TODAY 19:34", status: "Blocked (Deepfake)", number: "+1 XXXXX 2834", riskScore: 96 },
      { date: "SEP 12 16:10", status: "Blocked (Replay)", number: "+1 XXXXX 2834", riskScore: 84 }
    ]
  }
];
