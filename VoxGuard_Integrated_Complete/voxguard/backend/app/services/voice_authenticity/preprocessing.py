import numpy as np
import wave
from pathlib import Path
from typing import Tuple

try:
    import soundfile as sf
    _SOUNDFILE_AVAILABLE = True
except ImportError:
    sf = None
    _SOUNDFILE_AVAILABLE = False

try:
    from scipy.signal import resample_poly
    _SCIPY_AVAILABLE = True
except ImportError:
    resample_poly = None
    _SCIPY_AVAILABLE = False


class AudioPreprocessor:
    """Offline audio preprocessing for Person 4 voice authenticity analysis."""

    TARGET_SAMPLE_RATE = 16000

    def __init__(self, target_sample_rate: int = TARGET_SAMPLE_RATE):
        self.target_sample_rate = target_sample_rate

    @staticmethod
    def _to_mono(audio: np.ndarray) -> np.ndarray:
        if audio.ndim == 1:
            return audio.astype(np.float32)
        return np.mean(audio, axis=1).astype(np.float32)

    @staticmethod
    def _normalize(audio: np.ndarray) -> np.ndarray:
        peak = float(np.max(np.abs(audio))) if len(audio) else 0.0
        if peak <= 1e-8:
            return audio.astype(np.float32)
        return (audio / peak).astype(np.float32)

    @staticmethod
    def _trim_silence(audio: np.ndarray, threshold_ratio: float = 0.02) -> np.ndarray:
        if len(audio) == 0:
            return audio

        threshold = max(float(np.max(np.abs(audio))) * threshold_ratio, 1e-5)
        active = np.abs(audio) >= threshold

        if not np.any(active):
            return audio

        indices = np.flatnonzero(active)
        return audio[indices[0]:indices[-1] + 1]

    @staticmethod
    def _reduce_noise(audio: np.ndarray) -> np.ndarray:
        """Lightweight offline noise suppression using a noise-floor gate."""
        if len(audio) == 0:
            return audio

        noise_floor = float(np.percentile(np.abs(audio), 10))
        threshold = max(noise_floor * 2.0, 1e-5)

        result = audio.copy()
        result[np.abs(result) < threshold] *= 0.25
        return result.astype(np.float32)

    def _resample(self, audio: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
        if orig_sr == target_sr:
            return audio.astype(np.float32)

        if _SCIPY_AVAILABLE:
            from math import gcd
            g = gcd(orig_sr, target_sr)
            up = target_sr // g
            down = orig_sr // g
            return resample_poly(audio, up, down).astype(np.float32)
        
        # Linear interpolation fallback if scipy is unavailable
        num_samples = int(len(audio) * target_sr / orig_sr)
        indices = np.linspace(0, len(audio) - 1, num_samples)
        return np.interp(indices, np.arange(len(audio)), audio).astype(np.float32)

    def process_array(
        self,
        audio: np.ndarray,
        sample_rate: int,
    ) -> Tuple[np.ndarray, int]:
        if sample_rate <= 0:
            raise ValueError("Sample rate must be positive")

        mono = self._to_mono(audio)
        resampled = self._resample(mono, sample_rate, self.target_sample_rate)
        normalized = self._normalize(resampled)
        trimmed = self._trim_silence(normalized)
        denoised = self._reduce_noise(trimmed)

        return denoised.astype(np.float32), self.target_sample_rate

    def process_file(
        self,
        input_path: str,
        output_path: str | None = None,
    ) -> dict:
        in_path = Path(input_path)
        if not in_path.exists():
            raise FileNotFoundError(f"File not found: {input_path}")

        # Read audio via soundfile or standard wave
        if _SOUNDFILE_AVAILABLE:
            audio, sample_rate = sf.read(str(in_path), dtype="float32")
        else:
            with wave.open(str(in_path), "rb") as wf:
                sample_rate = wf.getframerate()
                n_frames = wf.getnframes()
                n_channels = wf.getnchannels()
                sampwidth = wf.getsampwidth()
                raw_bytes = wf.readframes(n_frames)

                if sampwidth == 2:
                    audio = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0
                elif sampwidth == 1:
                    audio = (np.frombuffer(raw_bytes, dtype=np.uint8).astype(np.float32) - 128.0) / 128.0
                else:
                    audio = np.frombuffer(raw_bytes, dtype=np.int16).astype(np.float32) / 32768.0

                if n_channels > 1:
                    audio = audio.reshape(-1, n_channels)

        original_samples = len(audio)
        processed, target_sr = self.process_array(audio, sample_rate)

        out_path = output_path or str(in_path.with_name(f"{in_path.stem}_processed.wav"))

        # Write output
        if _SOUNDFILE_AVAILABLE:
            sf.write(out_path, processed, target_sr, subtype="PCM_16")
        else:
            int16_data = np.clip(processed * 32767.0, -32768.0, 32767.0).astype(np.int16)
            with wave.open(out_path, "wb") as wf:
                wf.setnchannels(1)
                wf.setsampwidth(2)
                wf.setframerate(target_sr)
                wf.writeframes(int16_data.tobytes())

        return {
            "input_file": str(in_path),
            "output_file": out_path,
            "original_sample_rate": int(sample_rate),
            "processed_sample_rate": target_sr,
            "original_samples": int(original_samples),
            "processed_samples": int(len(processed)),
            "duration_seconds": round(len(processed) / target_sr, 4),
        }
