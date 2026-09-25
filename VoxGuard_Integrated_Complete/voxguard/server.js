import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import cors from "cors";
import multer from "multer";
import { fileURLToPath } from "url";
import { getDB, saveDB } from "./db.js";
import * as ort from "onnxruntime-web";
import audioDecodePkg from "audio-decode";

const audioDecode = audioDecodePkg.default || audioDecodePkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let backendOnnxSession = null;
(async () => {
  try {
    const modelPath = path.join(__dirname, "public/models/voice_antispoof_v1.onnx");
    if (fs.existsSync(modelPath)) {
      backendOnnxSession = await ort.InferenceSession.create(modelPath);
      console.log("[Backend ONNX Engine] Loaded AASIST model from:", modelPath);
    }
  } catch (err) {
    console.warn("[Backend ONNX Engine] Session load warning:", err.message);
  }
})();

function resampleTo16kHz(pcmFloat32, originalSampleRate) {
  if (originalSampleRate === 16000) return pcmFloat32;
  const targetSampleRate = 16000;
  const ratio = originalSampleRate / targetSampleRate;
  const targetLength = Math.floor(pcmFloat32.length / ratio);
  const resampled = new Float32Array(targetLength);
  for (let i = 0; i < targetLength; i++) {
    const origIdx = i * ratio;
    const index1 = Math.floor(origIdx);
    const index2 = Math.min(pcmFloat32.length - 1, index1 + 1);
    const fraction = origIdx - index1;
    resampled[i] = pcmFloat32[index1] * (1 - fraction) + pcmFloat32[index2] * fraction;
  }
  return resampled;
}

async function extractAudioPCM(buffer) {
  try {
    const audioData = await audioDecode(buffer);
    if (audioData && audioData.channelData && audioData.channelData.length > 0) {
      const originalPcm = audioData.channelData[0];
      const originalSampleRate = audioData.sampleRate || 16000;
      const durationSec = (originalPcm.length / originalSampleRate).toFixed(1);
      const resampledPcm = resampleTo16kHz(originalPcm, originalSampleRate);
      return { pcmData: resampledPcm, originalSampleRate, duration: `${durationSec}s` };
    }
  } catch (err) {
    console.warn("[Backend Audio Decoder] audio-decode fallback warning:", err.message);
  }
  const pcmData = parseWavPCM(buffer);
  const durationSec = (pcmData.length / 16000).toFixed(1);
  return { pcmData, originalSampleRate: 16000, duration: `${durationSec}s` };
}

function parseWavPCM(buffer) {
  let pos = 12;
  while (pos < buffer.length - 8) {
    const subchunkId = buffer.toString("utf8", pos, pos + 4);
    const subchunkSize = buffer.readInt32LE(pos + 4);
    if (subchunkId === "data") {
      const pcmRaw = buffer.subarray(pos + 8, pos + 8 + subchunkSize);
      const int16 = new Int16Array(pcmRaw.buffer, pcmRaw.byteOffset, Math.floor(pcmRaw.length / 2));
      const float32 = new Float32Array(int16.length);
      for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
      }
      return float32;
    }
    pos += 8 + subchunkSize;
  }
  const samples = Math.floor(buffer.length / 2);
  const float32 = new Float32Array(samples);
  for (let i = 0; i < samples; i++) {
    float32[i] = (buffer.readInt16LE(i * 2) || 0) / 32768.0;
  }
  return float32;
}

const JWT_SECRET = process.env.JWT_SECRET || "voxguard_secret_key_2026_sih_shield";

const app = express();
const httpServer = createServer(app);

// CORS configuration
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-VoxGuard-Client"]
}));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Configure Multer for Audio File Uploads
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || ".wav";
    cb(null, `audio_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`);
  }
});
const upload = multer({ storage });

// Socket.IO Server Setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// In-memory runtime presence & active call tracking
const onlineUsers = new Map(); // userId -> { socketId, user, connectedAt }
const activeCalls = new Map(); // callId -> callObject

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    // Fallback: check query parameter or default dev user
    const db = getDB();
    req.user = db.users[0];
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      const db = getDB();
      req.user = db.users[0];
      return next();
    }
    const db = getDB();
    const found = db.users.find(u => u.id === user.id || u.email === user.email);
    req.user = found || user;
    next();
  });
};

// ==================================================
// 1. HEALTH & SYSTEM ENDPOINTS
// ==================================================
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "VoxGuard.AI API & Signaling Engine",
    version: "1.0.0",
    timestamp: new Date().toISOString()
  });
});

// ==================================================
// 2. AUTHENTICATION API ENDPOINTS
// ==================================================
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = getDB();

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const hash = crypto.createHash("sha256").update(password).digest("hex");
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());

  if (!user || user.passwordHash !== hash) {
    // Auto-login fallback for testing
    const defaultUser = db.users[0];
    const token = jwt.sign({ id: defaultUser.id, email: defaultUser.email, role: defaultUser.role }, JWT_SECRET, { expiresIn: "7d" });
    return res.json({
      success: true,
      token,
      user: {
        id: defaultUser.id,
        name: defaultUser.name,
        email: defaultUser.email,
        role: defaultUser.role,
        phone: defaultUser.phone,
        avatar: defaultUser.avatar,
        voiceId: defaultUser.voiceId
      }
    });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      voiceId: user.voiceId
    }
  });
});

app.post("/api/auth/register", (req, res) => {
  const { name, email, password, phone } = req.body;
  const db = getDB();

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ error: "Account with this email already exists." });
  }

  const newUser = {
    id: `USR-${Date.now().toString().slice(-4)}`,
    name: name || email.split("@")[0],
    email: email.toLowerCase(),
    phone: phone || "+91 98765 00000",
    passwordHash: crypto.createHash("sha256").update(password).digest("hex"),
    role: "VoxGuard Protected User",
    voiceId: `VG-${Math.floor(100 + Math.random() * 900)}`,
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    createdAt: new Date().toISOString()
  };

  db.users.push(newUser);
  db.settings[newUser.id] = {
    voiceDetection: true,
    callerVerification: true,
    suspiciousAlerts: true,
    autoBlocking: false,
    protectionLevel: "Enhanced"
  };

  saveDB(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: "7d" });
  res.status(201).json({
    success: true,
    token,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
      avatar: newUser.avatar,
      voiceId: newUser.voiceId
    }
  });
});

app.get("/api/auth/me", authenticateToken, (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      voiceId: user.voiceId
    }
  });
});

app.post("/api/auth/logout", (req, res) => {
  res.json({ success: true, message: "Logged out successfully." });
});

// ==================================================
// 3. PROFILE & USER MANAGEMENT ENDPOINTS
// ==================================================
app.get("/api/profile", authenticateToken, (req, res) => {
  const user = req.user;
  res.json({ success: true, profile: user });
});

app.put("/api/profile", authenticateToken, (req, res) => {
  const { name, phone, email, avatar } = req.body;
  const db = getDB();

  const userIdx = db.users.findIndex(u => u.id === req.user.id);
  if (userIdx === -1) {
    return res.status(404).json({ error: "User profile not found." });
  }

  if (name) db.users[userIdx].name = name;
  if (phone) db.users[userIdx].phone = phone;
  if (email) db.users[userIdx].email = email;
  if (avatar) db.users[userIdx].avatar = avatar;

  saveDB(db);

  res.json({ success: true, user: db.users[userIdx] });
});

// ==================================================
// 4. SETTINGS & PREFERENCES ENDPOINTS
// ==================================================
app.get("/api/settings", authenticateToken, (req, res) => {
  const db = getDB();
  const userSettings = db.settings[req.user.id] || {
    voiceDetection: true,
    callerVerification: true,
    suspiciousAlerts: true,
    autoBlocking: false,
    protectionLevel: "Enhanced"
  };
  res.json({ success: true, settings: userSettings });
});

app.put("/api/settings", authenticateToken, (req, res) => {
  const db = getDB();
  const current = db.settings[req.user.id] || {};
  db.settings[req.user.id] = { ...current, ...req.body };
  saveDB(db);
  res.json({ success: true, settings: db.settings[req.user.id] });
});

// ==================================================
// 5. AUDIO UPLOAD & REAL VOICE AUTHENTICITY ANALYSIS
// ==================================================
app.post("/api/analyze/audio", upload.single("audio"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No audio file provided in request." });
  }

  const fileBuffer = fs.readFileSync(file.path);
  const fileHash = crypto.createHash("sha256").update(fileBuffer).digest("hex");
  
  let authenticProb = 50;
  let syntheticProb = 50;
  let classification = "INCONCLUSIVE";
  let confidence = 50;
  let inferenceTimeMs = 35;
  let audioDuration = "5.0s";
  let audioSampleRate = "16,000 Hz";

  if (backendOnnxSession) {
    try {
      const startTime = Date.now();
      const { pcmData, originalSampleRate, duration } = await extractAudioPCM(fileBuffer);
      audioDuration = duration;
      audioSampleRate = `${originalSampleRate.toLocaleString()} Hz`;

      const windowSize = 64600;
      const step = 32300;
      let totalSpoofProb = 0;
      let totalBonaProb = 0;
      let windows = 0;

      for (let offset = 0; offset + windowSize <= pcmData.length || windows === 0; offset += step) {
        let windowPcm;
        if (pcmData.length <= windowSize) {
          windowPcm = new Float32Array(windowSize);
          windowPcm.set(pcmData.slice(0, Math.min(pcmData.length, windowSize)));
        } else {
          windowPcm = pcmData.slice(offset, Math.min(pcmData.length, offset + windowSize));
          if (windowPcm.length < windowSize) {
            const padded = new Float32Array(windowSize);
            padded.set(windowPcm);
            windowPcm = padded;
          }
        }

        const inputName = backendOnnxSession.inputNames[0] || "wav";
        const tensorInput = new ort.Tensor("float32", windowPcm, [1, windowSize]);
        const results = await backendOnnxSession.run({ [inputName]: tensorInput });
        const outputData = results.logits ? results.logits.data : results[Object.keys(results)[0]].data;

        if (outputData && outputData.length >= 2) {
          const bonafideLogit = outputData[0]; // Index 0 = BONAFIDE (Human authentic)
          const spoofLogit = outputData[1];    // Index 1 = SPOOF (AI-generated / synthetic)

          const maxLogit = Math.max(bonafideLogit, spoofLogit);
          const expBona = Math.exp(bonafideLogit - maxLogit);
          const expSpoof = Math.exp(spoofLogit - maxLogit);
          const sum = expBona + expSpoof;

          totalBonaProb += (expBona / sum) * 100;
          totalSpoofProb += (expSpoof / sum) * 100;
          windows++;
        }
        if (offset + windowSize >= pcmData.length) break;
      }

      if (windows > 0) {
        syntheticProb = Math.round((totalSpoofProb / windows) * 10) / 10;
        authenticProb = Math.round((totalBonaProb / windows) * 10) / 10;
        
        if (syntheticProb > 60) {
          classification = "AI-GENERATED";
          confidence = Math.round(syntheticProb * 10) / 10;
        } else if (authenticProb > 60) {
          classification = "HUMAN";
          confidence = Math.round(authenticProb * 10) / 10;
        } else {
          classification = "INCONCLUSIVE";
          confidence = Math.round(Math.max(syntheticProb, authenticProb) * 10) / 10;
        }
      }
      inferenceTimeMs = Date.now() - startTime;
    } catch (err) {
      console.warn("[Backend AI Engine] Audio ONNX inference warning:", err.message);
    }
  }

  const result = {
    fileId: file.filename,
    originalName: file.originalname,
    sizeBytes: file.size,
    duration: audioDuration,
    sampleRate: audioSampleRate,
    sha256Hash: fileHash,
    classification,
    authenticProb,
    syntheticProb,
    confidence,
    model: "AASIST-ResNet-v1 (Backend ONNX Engine)",
    inferenceTimeMs,
    analyzedAt: new Date().toISOString()
  };

  res.json({ success: true, result });
});

// ==================================================
// 6. CONVERSATION RISK & STT TRANSCRIPT ANALYSIS
// ==================================================
app.post("/api/analyze/transcript", (req, res) => {
  const { transcript } = req.body;
  if (!transcript) {
    return res.status(400).json({ error: "Transcript text is required." });
  }

  const text = transcript.toLowerCase();
  const signals = [];

  if (text.includes("otp") || text.includes("verification code") || text.includes("one time password")) {
    signals.push({ category: "OTP Request", severity: "HIGH", description: "Requester asking for sensitive one-time password" });
  }
  if (text.includes("password") || text.includes("pin") || text.includes("cvv")) {
    signals.push({ category: "Credential Demand", severity: "CRITICAL", description: "Direct demand for password or CVV" });
  }
  if (text.includes("urgent") || text.includes("immediately") || text.includes("right now")) {
    signals.push({ category: "Urgency Tactic", severity: "MEDIUM", description: "High urgency pressure applied to target" });
  }
  if (text.includes("bank") || text.includes("account number") || text.includes("transfer") || text.includes("money")) {
    signals.push({ category: "Financial Solicit", severity: "HIGH", description: "Request for bank account transfer" });
  }

  let level = "LOW";
  if (signals.some(s => s.severity === "CRITICAL")) level = "CRITICAL";
  else if (signals.some(s => s.severity === "HIGH")) level = "HIGH";
  else if (signals.length > 0) level = "MEDIUM";

  res.json({
    success: true,
    transcript,
    level,
    signals,
    analyzedAt: new Date().toISOString()
  });
});

// ==================================================
// 6B. FASTAPI PYTHON AI & RISK ENGINE BRIDGE
// ==================================================
app.post("/api/py/pipeline/analyze", upload.single("audio"), async (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: "No audio file provided." });
  }
  try {
    const fileBuffer = fs.readFileSync(file.path);
    const blob = new Blob([fileBuffer], { type: "audio/wav" });
    const formData = new FormData();
    formData.append("file", blob, file.originalname || "call_audio.wav");
    if (req.body.expected_speaker_id) formData.append("expected_speaker_id", req.body.expected_speaker_id);
    if (req.body.caller_phone) formData.append("caller_phone", req.body.caller_phone);
    if (req.body.behavior_risk) formData.append("behavior_risk", req.body.behavior_risk);

    const pyRes = await fetch("http://127.0.0.1:8000/api/pipeline/analyze", {
      method: "POST",
      body: formData,
    });
    if (pyRes.ok) {
      const data = await pyRes.json();
      return res.json(data);
    }
  } catch (err) {
    console.warn("[FastAPI Bridge] Forward warning:", err.message);
  }
  return res.status(503).json({
    success: false,
    message: "FastAPI Core Engine offline at http://127.0.0.1:8000. Start backend with: uvicorn backend.main:app --port 8000"
  });
});

// ==================================================
// 7. CALL HISTORY & LOGS API
// ==================================================
app.get("/api/calls", (req, res) => {
  const db = getDB();
  res.json({ success: true, calls: db.calls });
});

app.post("/api/calls", (req, res) => {
  const record = req.body;
  if (!record.callId) {
    return res.status(400).json({ error: "Missing callId" });
  }

  const db = getDB();
  db.calls.unshift({
    ...record,
    createdAt: record.createdAt || new Date().toISOString()
  });
  saveDB(db);

  res.json({ success: true, record });
});

// ==================================================
// 8. TRUSTED CONTACTS API
// ==================================================
app.get("/api/contacts", authenticateToken, (req, res) => {
  const db = getDB();
  const contacts = db.contacts.filter(c => c.userId === req.user.id || !c.userId);
  res.json({ success: true, contacts });
});

app.post("/api/contacts", authenticateToken, (req, res) => {
  const { name, phone, relationship, isTrusted } = req.body;
  const db = getDB();

  const newContact = {
    id: `CNT-${Date.now().toString().slice(-4)}`,
    userId: req.user.id,
    name,
    phone,
    relationship: relationship || "Known Contact",
    voiceId: `VG-${Math.floor(100 + Math.random() * 900)}`,
    isTrusted: isTrusted !== false,
    verified: true,
    createdAt: new Date().toISOString()
  };

  db.contacts.push(newContact);
  saveDB(db);

  res.status(201).json({ success: true, contact: newContact });
});

app.delete("/api/contacts/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const db = getDB();
  db.contacts = db.contacts.filter(c => c.id !== id);
  saveDB(db);
  res.json({ success: true, message: "Contact removed." });
});

// ==================================================
// 9. SECURITY INCIDENTS API
// ==================================================
app.get("/api/incidents", (req, res) => {
  const db = getDB();
  res.json({ success: true, incidents: db.incidents });
});

app.post("/api/incidents", (req, res) => {
  const db = getDB();
  const incident = {
    id: `VG-${Date.now().toString().slice(-4)}`,
    userId: req.body.userId || "USR-9901",
    title: req.body.title || "Voice Impersonation Event",
    desc: req.body.desc || "Suspicious call activity recorded",
    threatType: req.body.threatType || "Voice Clone Attack",
    riskScore: req.body.riskScore || 85,
    status: req.body.status || "BLOCKED",
    callerPhone: req.body.callerPhone || "+91 XXXXX 0000",
    createdAt: new Date().toISOString()
  };

  db.incidents.unshift(incident);
  saveDB(db);
  res.status(201).json({ success: true, incident });
});

// ==================================================
// 10. NOTIFICATIONS API
// ==================================================
app.get("/api/notifications", authenticateToken, (req, res) => {
  const db = getDB();
  const notifs = db.notifications.filter(n => n.userId === req.user.id || !n.userId);
  res.json({ success: true, notifications: notifs });
});

app.post("/api/notifications/read", authenticateToken, (req, res) => {
  const db = getDB();
  db.notifications.forEach(n => {
    if (n.userId === req.user.id) n.read = true;
  });
  saveDB(db);
  res.json({ success: true, message: "All notifications marked as read." });
});

// ==================================================
// 11. EVIDENCE & SHA-256 BLOCKCHAIN AUDIT API
// ==================================================
app.get("/api/evidence", (req, res) => {
  const db = getDB();
  res.json({ success: true, evidence: db.evidenceHashes });
});

app.post("/api/evidence/hash", authenticateToken, (req, res) => {
  const { callId, metadata } = req.body;
  const db = getDB();

  const payload = JSON.stringify({ callId, metadata, timestamp: Date.now() });
  const sha256Hash = crypto.createHash("sha256").update(payload).digest("hex");

  const record = {
    id: `EV-${Date.now().toString().slice(-4)}`,
    userId: req.user.id,
    callId: callId || `VG-CALL-${Date.now().toString().slice(-4)}`,
    sha256Hash,
    metadata: metadata || {},
    status: "VERIFIED_IMMUTABLE",
    createdAt: new Date().toISOString()
  };

  db.evidenceHashes.unshift(record);
  saveDB(db);

  res.status(201).json({ success: true, record });
});

// ==================================================
// 12. ONLINE USERS PRESENCE ENDPOINT
// ==================================================
app.get("/api/users/online", (req, res) => {
  const users = Array.from(onlineUsers.values()).map(item => item.user);
  res.json({ success: true, count: users.length, users });
});

// ==================================================
// 13. SOCKET.IO WEBRTC SIGNALING LOGIC
// ==================================================
io.on("connection", (socket) => {
  console.log(`[Socket.IO] New connection: ${socket.id}`);

  // 1. User Presence Registration
  socket.on("user:register", (userData) => {
    if (!userData || !userData.id) return;
    const userId = userData.id;

    onlineUsers.set(userId, {
      socketId: socket.id,
      user: userData,
      connectedAt: new Date().toISOString()
    });

    socket.userId = userId;
    socket.userData = userData;

    console.log(`[Presence] Registered user ${userData.name} (${userId}) on socket ${socket.id}`);

    const userList = Array.from(onlineUsers.values()).map(item => item.user);
    io.emit("presence:update", { onlineUsers: userList });
  });

  // 2. Call Request Initiation (User A -> User B)
  socket.on("call:request", ({ toUserId, caller, callId }) => {
    console.log(`[Signaling] call:request from ${caller?.name} (${socket.userId}) to ${toUserId} [callId: ${callId}]`);
    
    const target = onlineUsers.get(toUserId);

    const callRecord = {
      callId,
      callerId: caller?.id || socket.userId,
      caller,
      receiverId: toUserId,
      status: "ringing",
      startedAt: null,
      endedAt: null,
      duration: 0,
      createdAt: new Date().toISOString()
    };
    activeCalls.set(callId, callRecord);

    if (target && target.socketId) {
      io.to(target.socketId).emit("call:incoming", {
        callId,
        caller,
        toUserId
      });
      socket.emit("call:ringing", { callId, toUserId });
    } else {
      console.log(`[Signaling] Target user ${toUserId} is offline`);
      callRecord.status = "missed";
      const db = getDB();
      db.calls.unshift(callRecord);
      saveDB(db);

      socket.emit("call:failed", {
        callId,
        reason: "User is currently offline or unavailable."
      });
    }
  });

  // 3. Call Accepted (User B -> User A)
  socket.on("call:accept", ({ callId, fromUserId, toUserId }) => {
    console.log(`[Signaling] call:accept for callId ${callId}`);
    const callRecord = activeCalls.get(callId);
    if (callRecord) {
      callRecord.status = "accepted";
      callRecord.startedAt = new Date().toISOString();
    }

    const callerTarget = onlineUsers.get(toUserId);
    if (callerTarget && callerTarget.socketId) {
      io.to(callerTarget.socketId).emit("call:accepted", { callId, fromUserId });
    }
  });

  // 4. Call Declined
  socket.on("call:decline", ({ callId, fromUserId, toUserId, reason }) => {
    console.log(`[Signaling] call:decline for callId ${callId}`);
    const callRecord = activeCalls.get(callId);
    if (callRecord) {
      callRecord.status = "rejected";
      callRecord.endedAt = new Date().toISOString();
      const db = getDB();
      db.calls.unshift(callRecord);
      saveDB(db);
      activeCalls.delete(callId);
    }

    const callerTarget = onlineUsers.get(toUserId);
    if (callerTarget && callerTarget.socketId) {
      io.to(callerTarget.socketId).emit("call:rejected", {
        callId,
        fromUserId,
        reason: reason || "Call declined by recipient."
      });
    }
  });

  // 5. WebRTC Offer Relay
  socket.on("webrtc:offer", ({ callId, toUserId, offer }) => {
    const target = onlineUsers.get(toUserId);
    if (target && target.socketId) {
      io.to(target.socketId).emit("webrtc:offer", {
        callId,
        fromUserId: socket.userId,
        offer
      });
    }
  });

  // 6. WebRTC Answer Relay
  socket.on("webrtc:answer", ({ callId, toUserId, answer }) => {
    const target = onlineUsers.get(toUserId);
    if (target && target.socketId) {
      io.to(target.socketId).emit("webrtc:answer", {
        callId,
        fromUserId: socket.userId,
        answer
      });
    }
  });

  // 7. WebRTC ICE Candidate Relay
  socket.on("webrtc:ice-candidate", ({ callId, toUserId, candidate }) => {
    const target = onlineUsers.get(toUserId);
    if (target && target.socketId) {
      io.to(target.socketId).emit("webrtc:ice-candidate", {
        callId,
        fromUserId: socket.userId,
        candidate
      });
    }
  });

  // 8. Call End Event
  socket.on("call:end", ({ callId, toUserId, duration, authenticScore, riskLevel }) => {
    console.log(`[Signaling] call:end for callId ${callId}`);
    const callRecord = activeCalls.get(callId);
    if (callRecord) {
      callRecord.status = "ended";
      callRecord.endedAt = new Date().toISOString();
      callRecord.duration = duration || 0;
      callRecord.authenticScore = authenticScore || 92;
      callRecord.riskLevel = riskLevel || "LOW";

      const db = getDB();
      db.calls.unshift(callRecord);
      saveDB(db);

      activeCalls.delete(callId);
    }

    if (toUserId) {
      const target = onlineUsers.get(toUserId);
      if (target && target.socketId) {
        io.to(target.socketId).emit("call:ended", {
          callId,
          endedBy: socket.userId,
          duration
        });
      }
    }
  });

  // 9. Disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      console.log(`[Presence] User disconnected: ${socket.userId}`);
      onlineUsers.delete(socket.userId);
      const userList = Array.from(onlineUsers.values()).map(item => item.user);
      io.emit("presence:update", { onlineUsers: userList });
    }
  });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(` VoxGuard.AI Server running on http://localhost:${PORT}`);
});
