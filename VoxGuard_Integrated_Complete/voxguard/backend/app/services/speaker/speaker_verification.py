"""
speaker_verification.py
------------------------
Identity verification via speaker embeddings.

Uses SpeechBrain's pretrained ECAPA-TDNN speaker-recognition model
("speechbrain/spkrec-ecapa-voxceleb") to turn a voice clip into a fixed-size
embedding vector, then compares embeddings with cosine similarity to decide
whether an incoming voice matches a previously enrolled ("trusted") speaker.

librosa is used for robust audio loading/resampling/trimming before the
embedding model sees the waveform.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Dict, List, Optional
import numpy as np

# Check availability of heavy ML libraries without crashing
_SPEECHBRAIN_AVAILABLE = False
_TORCH_AVAILABLE = False
_LIBROSA_AVAILABLE = False

try:
    import torch
    _TORCH_AVAILABLE = True
except ImportError:
    torch = None

try:
    import librosa
    _LIBROSA_AVAILABLE = True
except ImportError:
    librosa = None

try:
    try:
        from speechbrain.inference.speaker import EncoderClassifier
    except ImportError:
        from speechbrain.pretrained import EncoderClassifier
    _SPEECHBRAIN_AVAILABLE = True
except ImportError:
    EncoderClassifier = None


TARGET_SR = 16000  # SpeechBrain ECAPA model expects 16kHz mono audio


class IdentityStatus(str, Enum):
    VERIFIED = "VERIFIED"
    UNVERIFIED = "UNVERIFIED"
    UNCERTAIN = "UNCERTAIN"
    NO_ENROLLMENT = "NO_ENROLLMENT"
    MODEL_UNAVAILABLE = "MODEL_UNAVAILABLE"


@dataclass
class SpeakerMatchResult:
    similarity_score: float          # 0.0 - 1.0 (cosine similarity, clipped)
    status: IdentityStatus
    matched_speaker_id: Optional[str] = None
    all_scores: Dict[str, float] = field(default_factory=dict)
    details: Dict[str, str] = field(default_factory=dict)


class SpeakerVerifier:
    """
    Handles enrollment and verification of speakers using SpeechBrain
    speaker embeddings.
    """

    def __init__(
        self,
        model_source: str = "speechbrain/spkrec-ecapa-voxceleb",
        savedir: str = ".models/spkrec-ecapa-voxceleb",
        verified_threshold: float = 0.75,
        uncertain_threshold: float = 0.60,
        device: Optional[str] = None,
    ):
        self.verified_threshold = verified_threshold
        self.uncertain_threshold = uncertain_threshold
        self.model_source = model_source
        self.savedir = savedir
        self.classifier = None
        self.device = None
        self.enrolled_speakers: Dict[str, np.ndarray] = {}

        if _TORCH_AVAILABLE and _SPEECHBRAIN_AVAILABLE:
            self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
            try:
                self.classifier = EncoderClassifier.from_hparams(
                    source=model_source,
                    savedir=savedir,
                    run_opts={"device": self.device},
                )
            except Exception as e:
                self.classifier = None

    @classmethod
    def is_engine_ready(cls) -> bool:
        return _TORCH_AVAILABLE and _SPEECHBRAIN_AVAILABLE and _LIBROSA_AVAILABLE

    # ------------------------------------------------------------------ #
    # Audio loading
    # ------------------------------------------------------------------ #
    @staticmethod
    def _load_audio(audio_path: str, sr: int = TARGET_SR) -> np.ndarray:
        """Load audio: resample to 16kHz mono, trim silence."""
        if _LIBROSA_AVAILABLE:
            waveform, _ = librosa.load(audio_path, sr=sr, mono=True)
            waveform, _ = librosa.effects.trim(waveform, top_db=25)
            if waveform.size == 0:
                raise ValueError(f"Audio file '{audio_path}' is empty/silent after trimming.")
            return waveform
        
        # Fallback reading with basic wave if librosa not installed
        import wave
        with wave.open(audio_path, "rb") as wf:
            frames = wf.readframes(wf.getnframes())
            data = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
            return data

    # ------------------------------------------------------------------ #
    # Embeddings
    # ------------------------------------------------------------------ #
    def get_embedding(self, audio_path: str) -> np.ndarray:
        """Compute a normalized speaker embedding for a given audio file."""
        if not self.classifier:
            raise RuntimeError(
                "SpeechBrain ECAPA-TDNN model is not loaded. Ensure torch, torchaudio, and speechbrain are installed."
            )

        waveform = self._load_audio(audio_path)
        signal = torch.from_numpy(waveform).float().unsqueeze(0).to(self.device)

        with torch.no_grad():
            embedding = self.classifier.encode_batch(signal)

        embedding = embedding.squeeze().cpu().numpy()
        return embedding / (np.linalg.norm(embedding) + 1e-8)

    # ------------------------------------------------------------------ #
    # Enrollment
    # ------------------------------------------------------------------ #
    def enroll_speaker(self, speaker_id: str, audio_paths: List[str]) -> None:
        """
        Enroll (register) a trusted speaker from one or more audio samples.
        Multiple samples are averaged (then re-normalized) for a robust voiceprint.
        """
        if not audio_paths:
            raise ValueError("At least one enrollment audio sample is required.")

        embeddings = [self.get_embedding(p) for p in audio_paths]
        mean_embedding = np.mean(embeddings, axis=0)
        mean_embedding /= np.linalg.norm(mean_embedding) + 1e-8

        self.enrolled_speakers[speaker_id] = mean_embedding

    def save_enrollment(self, path: str) -> None:
        """Persist enrolled voiceprints to disk (JSON of float lists)."""
        serializable = {k: v.tolist() for k, v in self.enrolled_speakers.items()}
        os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
        with open(path, "w") as f:
            json.dump(serializable, f, indent=2)

    def load_enrollment(self, path: str) -> None:
        """Load previously saved voiceprints from disk."""
        if not os.path.exists(path):
            return
        with open(path, "r") as f:
            raw = json.load(f)
        self.enrolled_speakers = {k: np.array(v, dtype=np.float32) for k, v in raw.items()}

    # ------------------------------------------------------------------ #
    # Verification
    # ------------------------------------------------------------------ #
    @staticmethod
    def _cosine_similarity(a: np.ndarray, b: np.ndarray) -> float:
        """Cosine similarity in [-1, 1], clipped to [0, 1] as a match score."""
        sim = float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b) + 1e-8))
        return max(0.0, sim)

    def verify(self, audio_path: str, speaker_id: Optional[str] = None) -> SpeakerMatchResult:
        """
        Compare an incoming voice clip against enrolled speaker(s).
        """
        if not self.classifier:
            return SpeakerMatchResult(
                similarity_score=0.0,
                status=IdentityStatus.MODEL_UNAVAILABLE,
                details={"reason": "SpeechBrain ECAPA-TDNN model not loaded (missing torch/speechbrain)"}
            )

        if not self.enrolled_speakers:
            return SpeakerMatchResult(
                similarity_score=0.0,
                status=IdentityStatus.NO_ENROLLMENT,
                details={"reason": "No enrolled voiceprints registered in system"}
            )

        incoming_embedding = self.get_embedding(audio_path)

        candidates = (
            {speaker_id: self.enrolled_speakers[speaker_id]}
            if speaker_id and speaker_id in self.enrolled_speakers
            else self.enrolled_speakers
        )

        scores = {
            sid: self._cosine_similarity(incoming_embedding, emb)
            for sid, emb in candidates.items()
        }

        best_id = max(scores, key=scores.get)
        best_score = scores[best_id]

        if best_score >= self.verified_threshold:
            status = IdentityStatus.VERIFIED
        elif best_score >= self.uncertain_threshold:
            status = IdentityStatus.UNCERTAIN
        else:
            status = IdentityStatus.UNVERIFIED

        return SpeakerMatchResult(
            similarity_score=round(best_score, 4),
            status=status,
            matched_speaker_id=best_id if status != IdentityStatus.UNVERIFIED else None,
            all_scores={k: round(v, 4) for k, v in scores.items()},
        )
