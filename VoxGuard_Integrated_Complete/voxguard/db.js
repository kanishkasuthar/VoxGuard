import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "data", "voxguard_db.json");

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, "data"))) {
  fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });
}

// Initial Database Seed Data
const defaultDB = {
  users: [
    {
      id: "USR-9901",
      name: "Officer Sarah Jenkins",
      email: "sarah.jenkins@voxguard.ai",
      phone: "+91 98765 43210",
      passwordHash: crypto.createHash("sha256").update("password123").digest("hex"),
      role: "Level-3 SOC Commander",
      voiceId: "VG-001",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      createdAt: new Date().toISOString()
    },
    {
      id: "USR-B-1042",
      name: "Rahul",
      email: "rahul@email.com",
      phone: "+91 98765 3210",
      passwordHash: crypto.createHash("sha256").update("password123").digest("hex"),
      role: "Brother / Family Contact",
      voiceId: "VG-104",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
      createdAt: new Date().toISOString()
    }
  ],
  settings: {
    "USR-9901": {
      voiceDetection: true,
      callerVerification: true,
      suspiciousAlerts: true,
      autoBlocking: false,
      protectionLevel: "Enhanced"
    },
    "USR-B-1042": {
      voiceDetection: true,
      callerVerification: true,
      suspiciousAlerts: true,
      autoBlocking: false,
      protectionLevel: "Standard"
    }
  },
  contacts: [
    {
      id: "CNT-101",
      userId: "USR-9901",
      name: "Rahul Suthar",
      phone: "+91 98765 3210",
      relationship: "Brother / Family",
      voiceId: "VG-104",
      isTrusted: true,
      verified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: "CNT-102",
      userId: "USR-9901",
      name: "Dr. Ananya Sharma",
      phone: "+91 98123 45678",
      relationship: "Primary Physician",
      voiceId: "VG-208",
      isTrusted: true,
      verified: true,
      createdAt: new Date().toISOString()
    }
  ],
  calls: [
    {
      callId: "VG-CALL-1042",
      callerId: "USR-B-1042",
      caller: {
        id: "USR-B-1042",
        name: "Rahul",
        phone: "+91 98765 3210",
        relationship: "Brother / Family"
      },
      receiverId: "USR-9901",
      status: "ended",
      startedAt: new Date(Date.now() - 3600000).toISOString(),
      endedAt: new Date(Date.now() - 3500000).toISOString(),
      duration: 100,
      authenticScore: 92,
      riskLevel: "LOW",
      createdAt: new Date(Date.now() - 3600000).toISOString()
    }
  ],
  incidents: [
    {
      id: "VG-1042",
      userId: "USR-9901",
      title: "Voice Clone Attack Intercepted",
      desc: "Incoming call from +91 XXXXX 3210 blocked (Risk 91)",
      threatType: "Voice Clone Attack",
      riskScore: 91,
      status: "BLOCKED",
      callerPhone: "+91 XXXXX 3210",
      createdAt: new Date(Date.now() - 7200000).toISOString()
    }
  ],
  notifications: [
    {
      id: "n1",
      userId: "USR-9901",
      title: "Voice Clone Attack Intercepted",
      desc: "Incoming call from +91 XXXXX 3210 blocked (Risk 91)",
      time: "10:42 AM",
      type: "threat",
      link: "/incidents/VG-1042",
      read: false
    },
    {
      id: "n2",
      userId: "USR-9901",
      title: "Same Voice / New Number Match",
      desc: "+91 XXXXX 4821 matched existing identity VG-001 (96%)",
      time: "09:54 AM",
      type: "match",
      link: "/voice-identities/VG-001",
      read: false
    }
  ],
  evidenceHashes: [
    {
      id: "EV-9901",
      userId: "USR-9901",
      callId: "VG-CALL-1042",
      sha256Hash: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      metadata: { audioFile: "call_1042_spectral.wav", duration: 100 },
      status: "VERIFIED_IMMUTABLE",
      createdAt: new Date().toISOString()
    }
  ]
};

// Load database from file or initialize
export const getDB = () => {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
    return defaultDB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("[DB Error] Failed to parse DB file, resetting:", err.message);
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultDB, null, 2));
    return defaultDB;
  }
};

// Save database state
export const saveDB = (data) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("[DB Error] Failed to write DB file:", err.message);
  }
};
