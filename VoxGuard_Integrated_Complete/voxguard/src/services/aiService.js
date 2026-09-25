import { mockDelay } from "./api";

/**
 * SYSTEM PROMPT & KNOWLEDGE BASE FOR VOXGUARD.AI (SIH PROBLEM STATEMENT SIH26104)
 */
export const VOXGUARD_SYSTEM_INSTRUCTION = `
You are VoxBot, the built-in AI Voice Security Assistant for VoxGuard.AI.

PRODUCT DEFINITION:
VoxGuard.AI is an AI-powered real-time detection and prevention system for voice cloning impersonation attacks (Smart India Hackathon Problem Statement SIH26104).

CORE SYSTEM FLOW:
Call Arrives -> Real-Time Voice Analysis -> Speaker Verification (ECAPA-TDNN) -> Voice Clone Detection -> Anti-Spoofing Filters -> Risk Assessment (0-100) -> Action (Allow / Verify / Block) -> Incident Creation -> Tamper-Evident Blockchain Audit.

KEY CAPABILITIES & SECURITY CONCEPTS:
1. Real-Time Telephony Monitoring: Analyzes incoming RTP call audio streams for acoustic anomalies with sub-20ms inference latency.
2. Speaker Verification: Compares 256-dimensional acoustic embeddings against enrolled voiceprints to estimate speaker identity.
3. Voice Clone & Deepfake Detection: Identifies AI-generated voice characteristics produced by neural vocoders (like XTTS, Bark, ElevenLabs).
4. Anti-Spoofing: Detects phase incoherence, micro-formant shifts, and sub-harmonic glottal artifacts.
5. Risk Score Continuum: 0-30 = LOW RISK (Trusted), 31-70 = MODERATE ANOMALY (Suspicious), 71-100 = HIGH THREAT (Blocked).
6. Same Voice / Different Number: Detects cross-stream voice fingerprint similarity (e.g. 96% match) when an attacker calls from a spoofed or new number. ALWAYS use cautious confidence-based language: "Likely same voice", "Possible match", "Further verification recommended". NEVER claim 100% absolute identity.
7. Blockchain Audit & Privacy: Seals SHA-256 evidence digests and incident metadata on an immutable ledger. PRIVACY GUARANTEE: Raw voice audio is NEVER stored on the blockchain.
8. Prototype vs Production: Clarify that the current website is a high-fidelity SIH frontend prototype simulating real-time AI inference and backend endpoints.

TONE & STYLE:
Conversational, natural, intelligent, concise, helpful, and security-focused. Adapt tone to beginner explanations when requested ("explain simply", "for beginners").
`;

export const aiService = {
  /**
   * Process natural language query using conversation history and active page context
   */
  async generateResponse(userQuery, messagesHistory = [], pageContext = {}) {
    await mockDelay(450);

    const q = userQuery.toLowerCase().trim();
    const route = pageContext.route || "";
    const lastUserMsg = messagesHistory.length > 1 ? messagesHistory[messagesHistory.length - 2]?.text?.toLowerCase() || "" : "";
    const lastBotMsg = messagesHistory.length > 1 ? messagesHistory[messagesHistory.length - 1]?.text?.toLowerCase() || "" : "";

    // 1. GENERAL CONVERSATIONAL / MATH / OUT-OF-SCOPE FLEXIBILITY
    if (/^\d+\s*[\+\-\*\/]\s*\d+$/.test(q) || q.startsWith("what is ") && !isNaN(eval?.(q.replace("what is", "").replace("?", "").trim()) || NaN)) {
      try {
        const mathExpr = q.replace("what is", "").replace("?", "").trim();
        const result = Function(`'use strict'; return (${mathExpr})`)();
        return `${result}. (If you're wondering how this relates to VoxGuard, risk scores are calculated from multi-dimensional acoustic vectors rather than basic arithmetic!)`;
      } catch (e) {
        // Fallback
      }
    }

    if (q === "hi" || q === "hello" || q === "hey" || q.includes("who are you")) {
      return "Hello! I'm VoxBot, your voice security AI assistant. You can ask me anything about VoxGuard, voice cloning, risk scores, incidents, or what's happening on your current screen.";
    }

    // 2. BEGINNER / SIMPLE EXPLANATION REQUESTS ("explain like I'm a beginner", "simple words", "shorter")
    const isBeginnerMode = q.includes("beginner") || q.includes("simple") || q.includes("simply") || q.includes("easier") || q.includes("short");

    if (isBeginnerMode) {
      if (q.includes("speaker verification") || lastUserMsg.includes("speaker verification") || lastBotMsg.includes("speaker verification")) {
        return "Think of speaker verification like a digital voice-print check. Just as your fingerprint is unique, your voice has subtle pitch and acoustic patterns. VoxGuard compares a caller's voice with a saved voice profile to check if they sound like the same person.";
      }
      if (q.includes("anti-spoofing") || lastUserMsg.includes("anti-spoofing") || lastBotMsg.includes("anti-spoofing")) {
        return "Anti-spoofing is a test to check if a voice is real or fake. It checks for robotic AI artifacts or recordings that human vocal cords don't produce.";
      }
      if (q.includes("voice cloning") || lastUserMsg.includes("voice cloning") || lastBotMsg.includes("voice cloning")) {
        return "Voice cloning is software that can make fake speech using someone else's voice. VoxGuard listens to calls in real time to catch these fakes and protect people from scam calls.";
      }
    }

    // 3. MULTI-TURN FOLLOW-UP CONTEXT ("how does it know that?", "why is it important?", "what happened in this call?", "why did it fail?")
    const isFollowUp = q.includes("it") || q.includes("that") || q.includes("this call") || q.includes("why did it") || q.includes("how does it");

    if (isFollowUp) {
      // Follow-up after voice cloning query
      if (lastBotMsg.includes("voice cloning") || lastUserMsg.includes("voice cloning") || q.includes("know that")) {
        return "VoxGuard detects voice clones by examining three signals at once:\n\n• Formant frequency jitter & pitch stability\n• ECAPA-TDNN speaker vector matching\n• Neural vocoder phase inconsistencies that AI generators leave behind";
      }

      // Follow-up on why anti-spoofing is important or failed
      if (lastBotMsg.includes("anti-spoofing") || lastUserMsg.includes("anti-spoofing")) {
        return "Anti-spoofing is crucial because a voice clone might sound convincing to human ears, but AI generators create unnatural mathematical phase patterns that anti-spoofing filters detect instantly.";
      }

      // Follow-up on current live call / incident
      if (route.includes("monitor") || route.includes("incident") || pageContext.isCallActive) {
        return "In the current call telemetry, the anti-spoofing check failed because artificial vocoder phase signatures were detected, spikng the risk score to 91 and triggering an automatic block.";
      }
    }

    // 4. NATURAL LANGUAGE MATCHING FOR CALL BLOCK / STOP / PREVENT QUERIES
    const isBlockQuery = 
      q.includes("block") || q.includes("stopped") || q.includes("reject") || 
      q.includes("prevent") || q.includes("didn't go through") || q.includes("why call");

    if (isBlockQuery) {
      if (route.includes("monitor") || pageContext.isCallActive) {
        return "The call was blocked because real-time acoustic analysis detected synthetic voice characteristics:\n\n" +
               "• Voice clone probability spiked to 94%\n" +
               "• Speaker verification was low (61%)\n" +
               "• Anti-spoofing failed due to phase artifacts\n" +
               "• Overall risk score reached 91 / 100 (Threshold: 70)";
      }
      return "VoxGuard automatically blocks calls when the overall risk score breaches policy thresholds (typically 70/100). This happens when voice cloning probability is high or anti-spoofing checks fail.";
    }

    // 5. NATURAL LANGUAGE FOR RISK SCORE QUERIES
    if (q.includes("risk") || q.includes("score")) {
      if (route.includes("monitor")) {
        return "The risk score is currently 91/100 (High Threat). It rose because the incoming stream exhibited synthetic neural vocoder signatures and a 61% low speaker verification match.";
      }
      return "VoxGuard's risk score ranges from 0 to 100:\n\n" +
             "• 0–30: LOW RISK (Legitimate human caller)\n" +
             "• 31–70: SUSPICIOUS (Acoustic anomaly detected)\n" +
             "• 71–100: HIGH THREAT (Likely voice clone — automatic block)";
    }

    // 6. VOICE IDENTITIES & SAME VOICE / NEW NUMBER QUERIES
    if (q.includes("same voice") || q.includes("different number") || q.includes("new number") || q.includes("vg-001") || route.includes("identities")) {
      return "When a call arrives from an unknown phone number (+91 XXXXX 32109), VoxGuard extracts its 256-dimensional acoustic fingerprint. If it matches an enrolled voice profile (like VG-001 Kanishka) at 96% similarity, VoxGuard flags it as a 'Possible Match'.\n\n" +
             "Note: In the current prototype, VoxGuard uses confidence-based matching rather than absolute 100% identity claims.";
    }

    // 7. BLOCKCHAIN AUDIT & PRIVACY QUERIES
    if (q.includes("blockchain") || q.includes("audit") || q.includes("hash") || q.includes("stored") || q.includes("privacy")) {
      return "No. Raw voice or audio is NEVER stored on the blockchain to uphold strict privacy (GDPR / HIPAA compliance).\n\n" +
             "VoxGuard uses the blockchain strictly for tamper-evident security records: SHA-256 evidence hashes, threat timestamps, and enforcement action logs.";
    }

    // 8. TECHNICAL & ARCHITECTURE INQUIRIES
    if (q.includes("tech") || q.includes("architecture") || q.includes("model") || q.includes("ecapa") || q.includes("websocket")) {
      return "VoxGuard's architecture comprises:\n\n" +
             "• Biometrics: ECAPA-TDNN acoustic speaker embeddings\n" +
             "• Deepfake Detection: Spectral STFT phase analysis & neural vocoder filters\n" +
             "• Telephony Ingestion: Real-time RTP audio stream processing (simulated via WebSockets in prototype)\n" +
             "• Audit: SHA-256 Merkle tree evidence anchoring\n\n" +
             "(Note: In a full production deployment, FastAPI endpoints and PyTorch models process live telephony trunks.)";
    }

    // 9. GENERAL VOXGUARD PRODUCT & PAGE GUIDANCE
    if (q.includes("trusted") || q.includes("contact")) {
      return "The 'Trusted Contacts' page manages verified individuals (like Mom, Dad, Office HR) linked to enrolled VoxGuard Voice Identities (e.g. VG-008). When an incoming call arrives, VoxGuard compares the caller's voice against their enrolled voice identity to prevent impersonation.";
    }

    if (q.includes("incoming") || route.includes("incoming")) {
      return "The 'Incoming Call' screen shows that VoiceGuard Protection is ON and actively analyzing caller voice stream in real time before you choose to Accept or Decline.";
    }

    if (q.includes("live call") || route.includes("live-call")) {
      return "On the 'Live Call Dashboard', VoxGuard streams continuous audio spectral waveforms and updates real-time metrics: Voice Authenticity (92%), Speaker Match (94%), Anti-Spoofing (PASSED), and Conversation Intent.";
    }

    if (q.includes("risk alert") || route.includes("risk-alert")) {
      return "The 'Risk Alert' screen is triggered when suspicious voice cloning signatures or phase anomalies spike the Risk Score (e.g. 91/100). It allows you to challenge the caller with out-of-band verification or immediately end and block the call.";
    }

    if (q.includes("report") || route.includes("call-report")) {
      return "The 'Call Report' page compiles post-call forensic audit logs detailing caller phone (+91 XXXXX 3210), claimed identity (Rahul), call duration, risk score (91), enforcement result (Blocked), and detection summary metrics.";
    }

    if (q.includes("dashboard") || q.includes("home")) {
      return "The Dashboard provides a high-level overview of VoxGuard telemetry: the central 'Protection Active' hub, overall monitored calls (24), detected threats (3), blocked calls (2), and recent event logs.";
    }

    if (q.includes("analyze") || q.includes("upload") || q.includes("record")) {
      return "On the 'Analyze Voice' page, you can drag and drop audio files (WAV, MP3) or record live vocal samples to inspect spectral waveforms and view Registered vs Analyzed Voice Fingerprints.";
    }

    if (q.includes("incident") || q.includes("incidents")) {
      return "The 'Incidents' page lists all intercepted voice impersonation attacks. Selecting an incident reveals its Attack Replay timeline player and lets you export a forensic PDF report.";
    }

    // Default conversational AI fallback
    return "VoxGuard is actively monitoring incoming telephony streams for voice cloning impersonation attacks. You can ask me to explain any detection metric, walk through an incident timeline, or clarify how our biometric speaker verification works!";
  }
};
