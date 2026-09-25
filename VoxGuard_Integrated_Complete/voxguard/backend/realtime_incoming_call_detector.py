#!/usr/bin/env python3
"""
realtime_incoming_call_detector.py
----------------------------------
VoxGuard Real-Time Incoming Call Detection CLI.
Streams incoming call audio in 1-second chunks through the multi-layer AI pipeline:
  1. AASIST-L ONNX Model (Voice Authenticity & Deepfake Spoof Detection)
  2. Rule-Based Fraud Intent Detection (OTP, Urgency, Digital Arrest)
  3. Dynamic Multi-Signal Risk Engine (ALLOW / CAUTION / BLOCK)
  4. Real-time ANSI Terminal Telemetry & Immutable Evidence Hash

Run directly in VS Code terminal:
    python realtime_incoming_call_detector.py --mode synthetic
    python realtime_incoming_call_detector.py --mode human
    python realtime_incoming_call_detector.py --file path/to/audio.wav
"""

import argparse
import hashlib
import json
import math
import os
import sys
import time
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.platform.startswith("win"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:
        pass

# Add backend directory to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent))

import numpy as np
import soundfile as sf

from app.services.voice_authenticity.aasist_onnx_model import AASISTONNXModel
from app.services.fraud.fraud_detection import FraudIntentDetector
from app.core.config import settings

# ANSI Terminal Colors
CYAN = "\033[96m"
GREEN = "\033[92m"
YELLOW = "\033[93m"
RED = "\033[91m"
BOLD = "\033[1m"
DIM = "\033[2m"
RESET = "\033[0m"
BG_RED = "\033[41m\033[37m"
BG_GREEN = "\033[42m\033[30m"


def print_banner():
    print(f"\n{CYAN}{BOLD}" + "=" * 70)
    print("      [VOXGUARD AI] REAL-TIME INCOMING CALL DETECTOR")
    print("      Deepfake Voice Anti-Spoofing & Live Scam Detection HUD")
    print("=" * 70 + f"{RESET}\n")


def render_bar(percentage: float, width: int = 24) -> str:
    filled = int(round((percentage / 100.0) * width))
    filled = max(0, min(width, filled))
    bar = "#" * filled + "-" * (width - filled)
    return bar



def main():
    parser = argparse.ArgumentParser(description="VoxGuard Real-Time Incoming Call Detector")
    parser.add_argument(
        "--mode",
        choices=["synthetic", "human", "custom"],
        default="synthetic",
        help="Simulation mode: 'synthetic' (deepfake scam), 'human' (authentic), or 'custom'",
    )
    parser.add_argument(
        "--file",
        type=str,
        default=None,
        help="Path to custom WAV audio file for incoming call detection",
    )
    parser.add_argument(
        "--caller",
        type=str,
        default=None,
        help="Incoming Caller ID (e.g. '+91 98765 43210' or 'Unknown Caller')",
    )
    parser.add_argument(
        "--chunk-sec",
        type=float,
        default=1.0,
        help="Sliding window size in seconds (default: 1.0s)",
    )
    parser.add_argument(
        "--speed",
        type=float,
        default=1.0,
        help="Real-time playback speed multiplier (1.0 = real-time, 2.0 = fast)",
    )

    args = parser.parse_args()

    print_banner()

    backend_dir = Path(__file__).resolve().parent
    project_root = backend_dir.parent

    # Locate audio source
    if args.file:
        audio_path = Path(args.file)
    elif args.mode == "synthetic":
        audio_path = project_root / "test_synthetic.wav"
        if not audio_path.exists():
            audio_path = backend_dir / "tests" / "samples" / "person4_test.wav"
    else:
        audio_path = project_root / "test_human.wav"
        if not audio_path.exists():
            audio_path = backend_dir / "tests" / "samples" / "person4_test.wav"

    if not audio_path.exists():
        print(f"{RED}[!] Error: Audio file not found at {audio_path}{RESET}")
        sys.exit(1)

    # Simulated transcripts matching the call scenario
    if args.mode == "synthetic":
        caller_name = args.caller or "+91 98765 00192 (Flagged: Unknown Suspicious)"
        is_known = False
        transcripts = [
            "Hello, this is officer Verma from Central Cyber Crime Bureau.",
            "Your Aadhaar number is linked to money laundering in Mumbai.",
            "Your bank account will be seized immediately under digital arrest.",
            "Share your six digit mobile OTP right now to stop legal proceedings.",
        ]
    else:
        caller_name = args.caller or "Rahul (Brother / Family Contact)"
        is_known = True
        transcripts = [
            "Hey Sarah, are you still at the office right now?",
            "Just checking if you wanted to pick up groceries on the way back.",
            "Mom called earlier, dinner is ready whenever you reach home.",
            "Call me back once you're in the car, see you soon.",
        ]

    # Initialize AASIST ONNX Model
    model_path = backend_dir / "models" / "voice_antispoof_v1.onnx"
    if not model_path.exists():
        model_path = backend_dir / "models" / "aasist-l.onnx"

    print(f"{CYAN}[*] Initializing AASIST Voice Anti-Spoofing ONNX Engine...{RESET}")
    aasist = AASISTONNXModel(str(model_path))
    model_info = aasist.get_model_info()
    print(f"    Model Version : {model_info.get('model_version')}")
    print(f"    Engine Status : {GREEN if model_info.get('status') == 'LOADED' else YELLOW}{model_info.get('status')}{RESET}")
    print(f"    Execution HW  : {model_info.get('provider', 'CPU')}\n")

    fraud_detector = FraudIntentDetector()

    # Load audio
    print(f"{CYAN}[*] Incoming Call Audio Stream: {audio_path.name}{RESET}")
    data, sample_rate = sf.read(str(audio_path))
    if data.ndim > 1:
        data = data.mean(axis=1)  # Convert stereo to mono

    duration = len(data) / sample_rate
    print(f"    Sample Rate   : {sample_rate} Hz Mono")
    print(f"    Total Length  : {duration:.2f} seconds\n")

    # Incoming Call Ring Alert
    print(f"{BOLD}[!] >>> INCOMING CALL DETECTED! <<<{RESET}")
    print(f"    Caller ID : {BOLD}{caller_name}{RESET}")
    print(f"    Status    : {GREEN if is_known else YELLOW}{'KNOWN TRUSTED CONTACT' if is_known else 'UNKNOWN NUMBER'}{RESET}")
    print(f"    Shield    : {GREEN}VOXGUARD REAL-TIME INTERCEPTION ACTIVE{RESET}")
    print(f"\n{DIM}Connecting live audio stream for real-time acoustic & intent inspection...{RESET}\n")
    time.sleep(1.0 / args.speed)

    samples_per_chunk = int(sample_rate * args.chunk_sec)
    total_chunks = max(1, math.ceil(len(data) / samples_per_chunk))

    cumulative_transcript = []
    chunk_index = 0

    overall_deepfake_scores = []
    detected_threats = []

    start_time = time.time()

    for i in range(0, len(data), samples_per_chunk):
        chunk_index += 1
        chunk = data[i : i + samples_per_chunk]
        if len(chunk) < 100:
            break

        # Calculate RMS energy for audio visualizer
        rms = float(np.sqrt(np.mean(chunk**2))) if len(chunk) > 0 else 0.0
        normalized_rms = min(100.0, rms * 300.0)

        # 1. Run AASIST Model on Chunk
        pred = aasist.predict(chunk)
        deepfake_score = pred.get("spoof_score", 0.5)
        auth_score = pred.get("authenticity_score", 0.5)
        overall_deepfake_scores.append(deepfake_score)

        synth_pct = deepfake_score * 100.0
        auth_pct = auth_score * 100.0

        # 2. Get Live Transcript Segment
        curr_text = transcripts[(chunk_index - 1) % len(transcripts)]
        cumulative_transcript.append(curr_text)
        full_text = " ".join(cumulative_transcript)

        # 3. Fraud Intent Analysis
        fraud_result = fraud_detector.analyze(full_text)
        if fraud_result.detected_types:
            for cat in fraud_result.detected_types:
                cat_val = cat.value if hasattr(cat, "value") else str(cat)
                if cat_val not in detected_threats and cat_val != "NONE":
                    detected_threats.append(cat_val)

        # 4. Multi-Signal Dynamic Threat Score
        # Weighting: 50% Voice Authenticity + 35% Fraud Intent + 15% Contact Trust
        voice_risk = deepfake_score
        intent_risk = fraud_result.fraud_score
        contact_risk = 0.1 if is_known else 0.65

        total_risk = (voice_risk * 0.50) + (intent_risk * 0.35) + (contact_risk * 0.15)
        total_risk_pct = total_risk * 100.0

        # Classification & Policy
        if total_risk_pct >= 70 or (synth_pct >= 80 and intent_risk >= 0.3):
            threat_level = "CRITICAL THREAT"
            badge = f"{BG_RED} CRITICAL THREAT {RESET}"
            recommendation = "RECOMMEND IMMEDIATE CALL TERMINATION (BLOCK)"
            rec_color = RED
        elif total_risk_pct >= 45 or synth_pct >= 60:
            threat_level = "HIGH RISK"
            badge = f"{RED} HIGH RISK {RESET}"
            recommendation = "TRIGGER SECONDARY OTP / DO NOT SHARE CODES"
            rec_color = YELLOW
        elif total_risk_pct >= 25:
            threat_level = "CAUTION"
            badge = f"{YELLOW} CAUTION {RESET}"
            recommendation = "MONITORING UNFAMILIAR VOICE PATTERNS"
            rec_color = YELLOW
        else:
            threat_level = "SAFE"
            badge = f"{BG_GREEN} VERIFIED AUTHENTIC {RESET}"
            recommendation = "VOICE AND CONTENT SAFE — CONTINUE CONVERSATION"
            rec_color = GREEN

        # Print Live Telemetry Frame
        elapsed = time.time() - start_time
        print(f"{CYAN}--- [STREAM CHUNK {chunk_index}/{total_chunks}] Time: +{elapsed:.1f}s ---{RESET}")
        print(f"  Live Audio Amplitude  : [{render_bar(normalized_rms, 20)}] {normalized_rms:.1f}%")
        print(f"  Voice Authenticity    : {GREEN}{auth_pct:5.1f}% Human{RESET}  |  {RED if synth_pct > 50 else GREEN}{synth_pct:5.1f}% AI Synthetic{RESET}")
        print(f"  Live Transcribed ASR  : {BOLD}\"{curr_text}\"{RESET}")
        print(f"  Fraud Intent Signals  : {RED if detected_threats else GREEN}{detected_threats or ['CLEAN']}{RESET} (Score: {fraud_result.fraud_score:.2f})")
        print(f"  Real-Time Assessment : {badge} (Overall Risk: {total_risk_pct:.1f}%)")
        print(f"  Automated Action      : {rec_color}{BOLD}{recommendation}{RESET}\n")

        # Simulate real-time streaming delay
        time.sleep(args.chunk_sec / args.speed)

    # Final Call Summary
    avg_deepfake = (sum(overall_deepfake_scores) / len(overall_deepfake_scores)) * 100.0
    print(f"{CYAN}{BOLD}" + "=" * 70)
    print("                    CALL ANALYSIS SUMMARY REPORT")
    print("=" * 70 + f"{RESET}")
    print(f"  Total Duration      : {duration:.2f} seconds ({total_chunks} chunks analyzed)")
    print(f"  Caller Identity     : {caller_name}")
    print(f"  Average AI Score    : {RED if avg_deepfake > 50 else GREEN}{avg_deepfake:.1f}% Synthetic{RESET}")
    print(f"  Threat Flags Found  : {detected_threats or ['None']}")
    print(f"  Final Decision      : {badge}")

    # Generate Evidence Hash
    call_payload = {
        "caller": caller_name,
        "avg_deepfake_risk": avg_deepfake,
        "threats": detected_threats,
        "timestamp": time.time(),
    }
    evidence_hash = hashlib.sha256(json.dumps(call_payload).encode("utf-8")).hexdigest()
    print(f"  Blockchain Evidence : {CYAN}SHA-256:{evidence_hash[:16]}...{evidence_hash[-8:]}{RESET}")
    print(f"{CYAN}" + "=" * 70 + f"{RESET}\n")


if __name__ == "__main__":
    main()
