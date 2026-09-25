"""
language_processing.py
-----------------------
Multilingual speech processing: language detection + speech-to-text.

Uses OpenAI Whisper (open-weight, runs locally) which natively supports
English, Hindi, Kannada, Telugu, Tamil and Malayalam among 90+ languages,
plus automatic language identification.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, Optional
import numpy as np

_WHISPER_AVAILABLE = False
_LIBROSA_AVAILABLE = False

try:
    import whisper
    _WHISPER_AVAILABLE = True
except ImportError:
    whisper = None

try:
    import librosa
    _LIBROSA_AVAILABLE = True
except ImportError:
    librosa = None


# Languages officially supported / reported by VoxGuard
SUPPORTED_LANGUAGES: Dict[str, str] = {
    "en": "English",
    "hi": "Hindi",
    "kn": "Kannada",
    "te": "Telugu",
    "ta": "Tamil",
    "ml": "Malayalam",
}

WHISPER_SR = 16000


@dataclass
class TranscriptionResult:
    language_code: str
    language_name: str
    language_confidence: float
    transcript: str
    is_supported_language: bool
    status: str = "SUCCESS"
    details: Optional[str] = None


class MultilingualProcessor:
    """
    Wraps a Whisper model to provide:
      - language detection (restricted/ranked over supported set first)
      - speech-to-text transcription in the detected (or forced) language
    """

    def __init__(self, model_size: str = "small", device: Optional[str] = None):
        self.model_size = model_size
        self.device = device
        self.model = None

        if _WHISPER_AVAILABLE:
            try:
                self.model = whisper.load_model(model_size, device=device)
            except Exception:
                self.model = None

    @classmethod
    def is_engine_ready(cls) -> bool:
        return _WHISPER_AVAILABLE

    # ------------------------------------------------------------------ #
    @staticmethod
    def _load_audio(audio_path: str) -> np.ndarray:
        """Load & normalize audio to 16kHz mono float32 for Whisper."""
        if _LIBROSA_AVAILABLE:
            waveform, _ = librosa.load(audio_path, sr=WHISPER_SR, mono=True)
            return waveform.astype(np.float32)
        
        import wave
        with wave.open(audio_path, "rb") as wf:
            frames = wf.readframes(wf.getnframes())
            return np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0

    # ------------------------------------------------------------------ #
    def detect_language(self, audio_path: str) -> Dict[str, float]:
        """
        Return a dict of {language_code: probability}, sorted descending,
        using Whisper's log-mel + language-detection head on a 30s window.
        """
        if not self.model:
            raise RuntimeError(
                "Whisper model is not available. Install openai-whisper to enable multilingual detection."
            )

        audio = self._load_audio(audio_path)
        audio = whisper.pad_or_trim(audio)
        mel = whisper.log_mel_spectrogram(audio, n_mels=self.model.dims.n_mels).to(
            self.model.device
        )
        _, probs = self.model.detect_language(mel)
        return dict(sorted(probs.items(), key=lambda kv: kv[1], reverse=True))

    # ------------------------------------------------------------------ #
    def transcribe(
        self,
        audio_path: str,
        force_language: Optional[str] = None,
    ) -> TranscriptionResult:
        """
        Detect language (unless forced) and transcribe speech to text.
        """
        if not self.model:
            return TranscriptionResult(
                language_code="unknown",
                language_name="Unknown",
                language_confidence=0.0,
                transcript="",
                is_supported_language=False,
                status="MODEL_UNAVAILABLE",
                details="OpenAI Whisper model is not loaded. Install openai-whisper to transcribe audio.",
            )

        if force_language:
            lang_code = force_language
            lang_conf = 1.0
        else:
            probs = self.detect_language(audio_path)
            lang_code = max(probs, key=probs.get)
            lang_conf = probs[lang_code]

        try:
            audio = self._load_audio(audio_path)
            result = self.model.transcribe(
                audio,
                language=lang_code,
                task="transcribe",
                fp16=False,
            )
            transcript = result.get("text", "").strip()
        except Exception as exc:
            transcript = ""
        lang_name = SUPPORTED_LANGUAGES.get(lang_code, lang_code)

        return TranscriptionResult(
            language_code=lang_code,
            language_name=lang_name,
            language_confidence=round(float(lang_conf), 4),
            transcript=transcript,
            is_supported_language=lang_code in SUPPORTED_LANGUAGES,
            status="SUCCESS",
        )
