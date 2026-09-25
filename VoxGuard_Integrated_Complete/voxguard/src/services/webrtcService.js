import { io } from "socket.io-client";
import { LiveAudioAnalyzer } from "./liveAudioAnalyzer";

const RTC_CONFIG = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" }
  ]
};

class WebRTCService {
  constructor() {
    this.socket = null;
    this.peerConnection = null;
    this.localStream = null;
    this.remoteStream = null;
    this.audioAnalyzer = null;
    this.remoteAudioElement = null;

    this.currentUser = null;
    this.activeCall = null;
    this.callbacks = {};

    this._ensureAudioElement();
  }

  _ensureAudioElement() {
    if (typeof window === "undefined") return;
    let elem = document.getElementById("voxguard-remote-audio");
    if (!elem) {
      elem = document.createElement("audio");
      elem.id = "voxguard-remote-audio";
      elem.autoplay = true;
      elem.style.display = "none";
      document.body.appendChild(elem);
    }
    this.remoteAudioElement = elem;
  }

  init(user, callbacks = {}) {
    if (!user) return;
    this.currentUser = user;
    this.callbacks = { ...this.callbacks, ...callbacks };

    if (this.socket && this.socket.connected) {
      this.socket.emit("user:register", user);
      return;
    }

    // Connect to Socket.IO Signaling Server
    const serverUrl = window.location.hostname === "localhost" ? "http://localhost:3001" : window.location.origin;
    this.socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5
    });

    this.socket.on("connect", () => {
      console.log("[WebRTC] Connected to signaling server:", this.socket.id);
      this.socket.emit("user:register", user);
    });

    // 1. Online Users Presence Update
    this.socket.on("presence:update", ({ onlineUsers }) => {
      if (this.callbacks.onPresenceUpdate) {
        this.callbacks.onPresenceUpdate(onlineUsers);
      }
    });

    // 2. Incoming Call Request
    this.socket.on("call:incoming", ({ callId, caller }) => {
      console.log("[WebRTC] Incoming call received from:", caller?.name);
      this.activeCall = { callId, remoteUser: caller, isCaller: false, status: "RINGING" };
      if (this.callbacks.onIncomingCall) {
        this.callbacks.onIncomingCall({ callId, caller });
      }
    });

    // 3. Call Ringing Notification
    this.socket.on("call:ringing", ({ callId }) => {
      console.log("[WebRTC] Recipient is ringing...");
      if (this.callbacks.onCallRinging) {
        this.callbacks.onCallRinging(callId);
      }
    });

    // 4. Call Accepted by Receiver
    this.socket.on("call:accepted", async ({ callId, fromUserId }) => {
      console.log("[WebRTC] Call accepted by recipient. Initiating WebRTC SDP offer...");
      try {
        await this._createOffer(fromUserId);
      } catch (err) {
        console.error("[WebRTC] Error creating SDP offer:", err);
      }
    });

    // 5. Call Rejected by Receiver
    this.socket.on("call:rejected", ({ callId, reason }) => {
      console.log("[WebRTC] Call rejected:", reason);
      this._cleanupCallState();
      if (this.callbacks.onCallRejected) {
        this.callbacks.onCallRejected({ callId, reason });
      }
    });

    // 6. WebRTC Offer Received
    this.socket.on("webrtc:offer", async ({ callId, fromUserId, offer }) => {
      console.log("[WebRTC] Received WebRTC SDP offer from:", fromUserId);
      try {
        await this._handleOffer(offer, fromUserId);
      } catch (err) {
        console.error("[WebRTC] Error handling SDP offer:", err);
      }
    });

    // 7. WebRTC Answer Received
    this.socket.on("webrtc:answer", async ({ callId, fromUserId, answer }) => {
      console.log("[WebRTC] Received WebRTC SDP answer from:", fromUserId);
      try {
        if (this.peerConnection && this.peerConnection.signalingState !== "closed") {
          await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
        }
      } catch (err) {
        console.error("[WebRTC] Error setting remote SDP answer:", err);
      }
    });

    // 8. WebRTC ICE Candidate Received
    this.socket.on("webrtc:ice-candidate", async ({ candidate }) => {
      try {
        if (this.peerConnection && candidate) {
          await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
        }
      } catch (err) {
        console.warn("[WebRTC] Error adding ICE candidate:", err);
      }
    });

    // 9. Call Ended by Peer
    this.socket.on("call:ended", ({ callId, duration }) => {
      console.log("[WebRTC] Call ended by peer.");
      this._cleanupCallState();
      if (this.callbacks.onCallEnded) {
        this.callbacks.onCallEnded({ callId, duration });
      }
    });

    // 10. Call Failed (User offline / busy)
    this.socket.on("call:failed", ({ callId, reason }) => {
      console.log("[WebRTC] Call failed:", reason);
      this._cleanupCallState();
      if (this.callbacks.onCallFailed) {
        this.callbacks.onCallFailed({ callId, reason });
      }
    });
  }

  // Check Microphone Permission & Capability
  async checkMicrophonePermission() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      throw new Error("Live calling is not supported in this browser.");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop temporary tracks immediately
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (err) {
      throw new Error("MICROPHONE ACCESS REQUIRED: Please allow microphone access to start the call.");
    }
  }

  // Initiate Outgoing Call (User A -> User B)
  async initiateCall(recipientUser) {
    if (!recipientUser || !recipientUser.id) {
      throw new Error("Invalid recipient user selected.");
    }

    await this.checkMicrophonePermission();

    const callId = `call_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    this.activeCall = {
      callId,
      remoteUser: recipientUser,
      isCaller: true,
      status: "RINGING_OUTGOING"
    };

    console.log(`[WebRTC] Initiating call to ${recipientUser.name} (${recipientUser.id}) [callId: ${callId}]`);
    this.socket.emit("call:request", {
      toUserId: recipientUser.id,
      caller: this.currentUser,
      callId
    });

    return callId;
  }

  // Accept Incoming Call (User B)
  async acceptCall(callId, callerUser) {
    console.log(`[WebRTC] Accepting call ${callId} from ${callerUser?.name}`);
    await this.checkMicrophonePermission();

    // Acquire Local Microphone Stream
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this._createPeerConnection(callerUser.id);

    this.activeCall = {
      callId,
      remoteUser: callerUser,
      isCaller: false,
      status: "CONNECTING"
    };

    // Emit Acceptance to Signaling Server
    this.socket.emit("call:accept", {
      callId,
      fromUserId: this.currentUser.id,
      toUserId: callerUser.id
    });
  }

  // Decline Incoming Call (User B)
  declineCall(callId, callerUser) {
    console.log(`[WebRTC] Declining call ${callId}`);
    if (this.socket && callerUser) {
      this.socket.emit("call:decline", {
        callId,
        fromUserId: this.currentUser?.id,
        toUserId: callerUser.id,
        reason: "Call declined by recipient."
      });
    }
    this._cleanupCallState();
  }

  // End Active Call (User A or User B)
  endCall(duration = 0) {
    if (this.activeCall && this.socket) {
      const { callId, remoteUser } = this.activeCall;
      console.log(`[WebRTC] Ending call ${callId}`);
      this.socket.emit("call:end", {
        callId,
        toUserId: remoteUser?.id,
        duration
      });
    }
    this._cleanupCallState();
  }

  // Toggle Microphone Mute / Unmute
  toggleMute() {
    if (!this.localStream) return false;
    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length === 0) return false;

    const isMuted = audioTracks[0].enabled;
    audioTracks.forEach(track => {
      track.enabled = !isMuted;
    });

    // Returns true if now MUTED, false if UNMUTED
    return !audioTracks[0].enabled;
  }

  // Helper: Create RTCPeerConnection
  _createPeerConnection(targetUserId) {
    if (this.peerConnection) {
      this.peerConnection.close();
    }

    this.peerConnection = new RTCPeerConnection(RTC_CONFIG);

    // Add Local Microphone Tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    }

    // ICE Candidate Handler
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.activeCall && this.socket) {
        this.socket.emit("webrtc:ice-candidate", {
          callId: this.activeCall.callId,
          toUserId: targetUserId,
          candidate: event.candidate
        });
      }
    };

    // Remote Stream Track Received (CRITICAL FOR AUDIO & ANALYSIS)
    this.peerConnection.ontrack = (event) => {
      console.log("[WebRTC] Remote track received from caller!");
      this.remoteStream = event.streams[0];

      // 1. Play remote audio stream to user
      this._ensureAudioElement();
      if (this.remoteAudioElement) {
        this.remoteAudioElement.srcObject = this.remoteStream;
        this.remoteAudioElement.play().catch(e => console.warn("[WebRTC] Autoplay prevention warning:", e));
      }

      // 2. Route remote audio stream to VoxGuard Live Audio Analyzer
      this.audioAnalyzer = new LiveAudioAnalyzer({
        onAudioLevel: (level) => {
          if (this.callbacks.onAudioLevel) this.callbacks.onAudioLevel(level);
        },
        onVoiceAuth: (res) => {
          if (this.callbacks.onVoiceAuth) this.callbacks.onVoiceAuth(res);
        },
        onContentRisk: (res) => {
          if (this.callbacks.onContentRisk) this.callbacks.onContentRisk(res);
        },
        onTranscript: (t) => {
          if (this.callbacks.onTranscript) this.callbacks.onTranscript(t);
        }
      });
      this.audioAnalyzer.startAnalysis(this.remoteStream);

      // Notify callback that call is CONNECTED
      if (this.callbacks.onCallConnected) {
        this.callbacks.onCallConnected();
      }
    };

    // Connection State Change Monitoring
    this.peerConnection.onconnectionstatechange = () => {
      console.log(`[WebRTC] PeerConnection state: ${this.peerConnection?.connectionState}`);
      if (this.peerConnection?.connectionState === "disconnected" || this.peerConnection?.connectionState === "failed") {
        console.warn("[WebRTC] PeerConnection lost or failed.");
        if (this.callbacks.onConnectionLost) {
          this.callbacks.onConnectionLost();
        }
      }
    };
  }

  // Create SDP Offer (Caller side)
  async _createOffer(targetUserId) {
    this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this._createPeerConnection(targetUserId);

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    this.socket.emit("webrtc:offer", {
      callId: this.activeCall.callId,
      toUserId: targetUserId,
      offer
    });
  }

  // Handle SDP Offer (Receiver side)
  async _handleOffer(offer, targetUserId) {
    if (!this.peerConnection) {
      this.localStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this._createPeerConnection(targetUserId);
    }

    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    this.socket.emit("webrtc:answer", {
      callId: this.activeCall?.callId,
      toUserId: targetUserId,
      answer
    });
  }

  // Cleanup all streams, socket listeners, and connections
  _cleanupCallState() {
    if (this.audioAnalyzer) {
      this.audioAnalyzer.stopAnalysis();
      this.audioAnalyzer = null;
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch (e) {}
      this.peerConnection = null;
    }

    if (this.remoteAudioElement) {
      this.remoteAudioElement.srcObject = null;
    }

    this.remoteStream = null;
    this.activeCall = null;
  }
}

export const webrtcService = new WebRTCService();
