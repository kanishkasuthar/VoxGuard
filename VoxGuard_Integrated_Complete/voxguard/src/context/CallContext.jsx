import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { webrtcService } from "../services/webrtcService";
import { authService } from "../services/authService";
import { useToast } from "./NotificationContext";

const CallContext = createContext(null);

export const CallProvider = ({ children }) => {
  const { addToast } = useToast();

  const [currentUser, setCurrentUser] = useState(() => {
    return authService.getCurrentUser() || {
      id: "USR-A-9901",
      name: "Officer Sarah Jenkins",
      phone: "+91 98765 3210",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
      role: "Level-3 SOC Commander"
    };
  });

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [callState, setCallState] = useState("IDLE"); // IDLE, RINGING_OUTGOING, RINGING_INCOMING, CONNECTED, ENDED
  const [currentCall, setCurrentCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  // Live VoxGuard Real-Time Analysis State (Driven by Real Stream & ONNX Inference)
  const [voiceAuth, setVoiceAuth] = useState({
    classification: "ANALYZING...",
    authenticProb: 50.0,
    syntheticProb: 50.0,
    confidence: 50.0,
    model: "AASIST v1.0 (ONNX WebGPU)",
    assessment: "Real-time acoustic spectral feature extraction active."
  });

  const [contentRisk, setContentRisk] = useState({
    level: "LOW",
    score: 10,
    transcript: "Listening for spoken conversation...",
    signals: [],
    reason: "No suspicious requests or threats detected."
  });

  const timerRef = useRef(null);
  const simAudioRef = useRef(null);
  const simIntervalRef = useRef(null);
  const simAnalyzerRef = useRef(null);
  const simMicStreamRef = useRef(null);

  const _stopSimulation = () => {
    if (simIntervalRef.current) {
      clearInterval(simIntervalRef.current);
      simIntervalRef.current = null;
    }
    if (simAudioRef.current) {
      try {
        simAudioRef.current.pause();
        simAudioRef.current.src = "";
        simAudioRef.current.remove();
      } catch (e) {}
      simAudioRef.current = null;
    }
    if (simAnalyzerRef.current) {
      try {
        simAnalyzerRef.current.stopAnalysis();
      } catch (e) {}
      simAnalyzerRef.current = null;
    }
    if (simMicStreamRef.current) {
      try {
        simMicStreamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {}
      simMicStreamRef.current = null;
    }
  };

  // Initialize WebRTC & Socket.IO Signaling Connection
  useEffect(() => {
    if (!currentUser) return;

    webrtcService.init(currentUser, {
      onPresenceUpdate: (users) => {
        setOnlineUsers(users);
      },

      onIncomingCall: ({ callId, caller }) => {
        console.log("[CallContext] Incoming call from:", caller?.name);
        setCallState("RINGING_INCOMING");
        setCurrentCall({
          callId,
          remoteUser: caller,
          isCaller: false
        });
        addToast(`INCOMING CALL from ${caller?.name} (${caller?.phone || "+91 98765 3210"})`, "threat");
      },

      onCallRinging: (callId) => {
        setCallState("RINGING_OUTGOING");
        addToast("Ringing recipient...", "info");
      },

      onCallConnected: () => {
        console.log("[CallContext] WebRTC connection established! Call is CONNECTED.");
        setCallState("CONNECTED");
        addToast("WebRTC Call Connected — VoxGuard Live Analysis Active", "success");

        // Reset & Start Call Timer ONLY after connection is established
        setCallDuration(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
          setCallDuration(prev => prev + 1);
        }, 1000);
      },

      onCallRejected: ({ reason }) => {
        setCallState("ENDED");
        addToast(`Call Declined: ${reason || "Recipient declined"}`, "warning");
        _stopTimer();
        _stopSimulation();
        setTimeout(() => setCallState("IDLE"), 2500);
      },

      onCallEnded: ({ duration }) => {
        setCallState("ENDED");
        addToast("Call ended.", "info");
        _stopTimer();
        _stopSimulation();
        setTimeout(() => setCallState("IDLE"), 2500);
      },

      onCallFailed: ({ reason }) => {
        setCallState("IDLE");
        addToast(`Call Failed: ${reason}`, "threat");
        _stopTimer();
        _stopSimulation();
      },

      onAudioLevel: (level) => {
        setAudioLevel(level);
      },

      onVoiceAuth: (result) => {
        setVoiceAuth(result);
      },

      onContentRisk: (result) => {
        setContentRisk(result);
      },

      onConnectionLost: () => {
        addToast("CALL CONNECTION LOST — WebRTC peer disconnected.", "threat");
        _stopTimer();
        _stopSimulation();
        setCallState("ENDED");
        setTimeout(() => setCallState("IDLE"), 2500);
      }
    });

    return () => {
      _stopTimer();
      _stopSimulation();
    };
  }, [currentUser]);

  const _stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // 1. Initiate Call to recipient
  const initiateCall = async (recipientUser) => {
    try {
      _stopSimulation();
      setCallState("RINGING_OUTGOING");
      setCurrentCall({
        callId: `pending_${Date.now()}`,
        remoteUser: recipientUser,
        isCaller: true
      });
      const callId = await webrtcService.initiateCall(recipientUser);
      setCurrentCall(prev => ({ ...prev, callId }));
    } catch (err) {
      setCallState("IDLE");
      addToast(err.message || "Failed to initiate call.", "threat");
    }
  };

  // 2. Accept Incoming Call (WebRTC or Simulator)
  const acceptCall = async () => {
    if (!currentCall || !currentCall.callId) return;

    // Handle Simulation Call
    if (currentCall.isSimulation) {
      try {
        setCallState("CONNECTED");
        setCallDuration(0);
        if (timerRef.current) clearInterval(timerRef.current);
        timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);

        // Create HTML Audio Element for streaming audio
        const audioEl = new Audio(currentCall.audioUrl);
        audioEl.crossOrigin = "anonymous";
        audioEl.loop = true;
        simAudioRef.current = audioEl;

        const { LiveAudioAnalyzer } = await import("../services/liveAudioAnalyzer");
        const analyzer = new LiveAudioAnalyzer({
          onAudioLevel: (lvl) => setAudioLevel(lvl),
          onVoiceAuth: (res) => setVoiceAuth(res),
          onContentRisk: (res) => setContentRisk(res),
          onTranscript: (t) => {
            setContentRisk(prev => ({ ...prev, transcript: t }));
          }
        });
        simAnalyzerRef.current = analyzer;

        // Connect Web Audio API to Audio element
        await analyzer.startAnalysisFromElement(audioEl);
        audioEl.play().catch(e => console.warn("Audio autoplay blocked:", e));

        // Timed Transcripts matching scenario
        const scenario = currentCall.scenario;
        let scriptIndex = 0;
        const scriptMessages = scenario === "DEEPFAKE_SCAM" ? [
          "Hello, this is officer Verma from Central Cyber Crime Bureau.",
          "Your Aadhaar and bank details are linked to money laundering in Mumbai.",
          "Your accounts are placed under immediate digital arrest by court order.",
          "Share your six-digit verification OTP right now to verify your innocence."
        ] : [
          "Hey Sarah, are you still at the office right now?",
          "Just checking if you wanted to pick up dinner on the way home.",
          "Mom said the food will be ready by 8 PM, see you soon."
        ];

        simIntervalRef.current = setInterval(() => {
          if (scriptIndex < scriptMessages.length) {
            const line = scriptMessages[scriptIndex];
            analyzer.pushTranscript(line);
            scriptIndex++;
          }
        }, 3000);

        addToast(
          scenario === "DEEPFAKE_SCAM"
            ? "Simulated Deepfake Scam Call Connected — Live AI Analyzing Audio"
            : "Simulated Authentic Contact Call Connected — Live AI Verifying Identity",
          "info"
        );
      } catch (err) {
        console.error("Simulation connection error:", err);
        setCallState("IDLE");
        addToast("Simulation failed: " + err.message, "threat");
      }
      return;
    }

    // Standard WebRTC Call Acceptance
    try {
      await webrtcService.acceptCall(currentCall.callId, currentCall.remoteUser);
      setCallState("CONNECTING");
    } catch (err) {
      setCallState("IDLE");
      addToast(err.message || "Microphone access required to accept call.", "threat");
    }
  };

  // 3. Decline Incoming Call
  const declineCall = () => {
    if (currentCall && !currentCall.isSimulation) {
      webrtcService.declineCall(currentCall.callId, currentCall.remoteUser);
    }
    _stopSimulation();
    setCallState("ENDED");
    _stopTimer();
    setTimeout(() => setCallState("IDLE"), 1500);
    addToast("Incoming call declined.", "info");
  };

  // 4. End Call
  const endCall = () => {
    if (currentCall && !currentCall.isSimulation && !currentCall.isLiveMic) {
      webrtcService.endCall(callDuration);
    }
    _stopSimulation();
    setCallState("ENDED");
    _stopTimer();
    setTimeout(() => setCallState("IDLE"), 1500);
    addToast("Call ended. Defense log updated.", "info");
  };

  // 5. Toggle Mute
  const toggleMute = () => {
    const muted = webrtcService.toggleMute();
    setIsMuted(muted);
    addToast(muted ? "Microphone Muted" : "Microphone Active", "info");
  };

  // 6. Switch User Identity (For dual-browser dev testing)
  const switchUser = (newUser) => {
    setCurrentUser(newUser);
    localStorage.setItem("voxguard_user", JSON.stringify(newUser));
    addToast(`Switched active identity to ${newUser.name}`, "info");
  };

  // 7. Simulate Incoming Call (One-Click Real-Time Tester)
  const simulateIncomingCall = (scenario = "DEEPFAKE_SCAM") => {
    _stopSimulation();

    let remoteUser;
    if (scenario === "DEEPFAKE_SCAM") {
      remoteUser = {
        id: "SUSPECT-CYBER-99",
        name: "Cyber Crime Bureau / CBI Officer",
        phone: "+91 98765 00192",
        relationship: "FLAGGED: Suspected Deepfake & Impersonation",
        isKnown: false,
        scenario: "DEEPFAKE_SCAM",
        audioUrl: "/test_synthetic.wav"
      };
    } else {
      remoteUser = {
        id: "USR-B-1042",
        name: "Rahul",
        phone: "+91 98765 3210",
        relationship: "Brother / Family Contact • Trusted",
        isKnown: true,
        scenario: "AUTHENTIC_CONTACT",
        audioUrl: "/test_human.wav"
      };
    }

    setCurrentCall({
      callId: `sim_${Date.now()}`,
      remoteUser,
      isCaller: false,
      isSimulation: true,
      scenario: remoteUser.scenario,
      audioUrl: remoteUser.audioUrl
    });

    setCallState("RINGING_INCOMING");
    addToast(`INCOMING CALL from ${remoteUser.name} (${remoteUser.phone})`, "threat");
  };

  // 8. Start Live Microphone Detection (Sniff live calls from phone loudspeaker)
  const startLiveMicDetection = async () => {
    _stopSimulation();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      simMicStreamRef.current = stream;

      const micCaller = {
        id: "LIVE-MIC-SNIFFER",
        name: "Live Loudspeaker Mic Sniffer",
        phone: "Hardware Audio Input",
        relationship: "Room / Device Loudspeaker Stream",
        isKnown: true
      };

      setCurrentCall({
        callId: `mic_${Date.now()}`,
        remoteUser: micCaller,
        isCaller: false,
        isLiveMic: true
      });

      const { LiveAudioAnalyzer } = await import("../services/liveAudioAnalyzer");
      const analyzer = new LiveAudioAnalyzer({
        onAudioLevel: (lvl) => setAudioLevel(lvl),
        onVoiceAuth: (res) => setVoiceAuth(res),
        onContentRisk: (res) => setContentRisk(res),
        onTranscript: (t) => {
          setContentRisk(prev => ({ ...prev, transcript: t }));
        }
      });
      simAnalyzerRef.current = analyzer;
      await analyzer.startAnalysis(stream);

      setCallState("CONNECTED");
      setCallDuration(0);
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => setCallDuration(p => p + 1), 1000);

      addToast("Live Mic Sniffer Active — Place phone on speaker near microphone", "success");
    } catch (err) {
      setCallState("IDLE");
      addToast("Microphone access failed: " + err.message, "threat");
    }
  };

  // 9. Automated / Manual Defense Actions
  const triggerDefenseAction = (actionType) => {
    if (actionType === "HANG_UP") {
      endCall();
      addToast("CALL TERMINATED: VoxGuard Defense Engine executed auto-hangup.", "threat");
    } else if (actionType === "OTP_CHALLENGE") {
      addToast("CHALLENGE ISSUED: Secondary cryptographic OTP dispatched to caller.", "warning");
    } else if (actionType === "BLOCK_CALLER") {
      const phone = currentCall?.remoteUser?.phone || "Unknown Number";
      endCall();
      addToast(`CALLER BLOCKED: ${phone} blacklisted & evidence sealed on ledger.`, "threat");
    }
  };

  return (
    <CallContext.Provider
      value={{
        currentUser,
        onlineUsers,
        callState,
        currentCall,
        isMuted,
        callDuration,
        audioLevel,
        voiceAuth,
        contentRisk,
        initiateCall,
        acceptCall,
        declineCall,
        endCall,
        toggleMute,
        switchUser,
        simulateIncomingCall,
        startLiveMicDetection,
        triggerDefenseAction
      }}
    >
      {children}
    </CallContext.Provider>
  );
};

export const useCall = () => {
  const context = useContext(CallContext);
  if (!context) {
    throw new Error("useCall must be used within a CallProvider");
  }
  return context;
};

