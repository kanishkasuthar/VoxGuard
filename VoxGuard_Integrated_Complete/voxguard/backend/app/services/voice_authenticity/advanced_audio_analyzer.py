import math
import wave
from pathlib import Path


class AdvancedAudioAnalyzer:
    """Calculate time-domain and FFT-based spectral audio characteristics."""

    def __init__(self):
        self.frame_size = 1024

    @staticmethod
    def _pcm_samples(raw_data: bytes, sample_width: int) -> list[float]:
        if sample_width == 1:
            return [(b - 128) / 128.0 for b in raw_data]

        if sample_width == 2:
            return [
                int.from_bytes(raw_data[i:i + 2], "little", signed=True) / 32768.0
                for i in range(0, len(raw_data) - 1, 2)
            ]

        if sample_width == 4:
            return [
                int.from_bytes(raw_data[i:i + 4], "little", signed=True) / 2147483648.0
                for i in range(0, len(raw_data) - 3, 4)
            ]

        raise ValueError(f"Unsupported PCM sample width: {sample_width} bytes.")

    def load_samples(self, file_path: str) -> dict:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        try:
            with wave.open(str(path), "rb") as audio:
                channels = audio.getnchannels()
                sample_width = audio.getsampwidth()
                sample_rate = audio.getframerate()
                frame_count = audio.getnframes()
                raw_data = audio.readframes(frame_count)
        except wave.Error as exc:
            raise ValueError(f"Invalid WAV file: {exc}") from exc

        if sample_rate <= 0:
            raise ValueError("Invalid sample rate.")

        if frame_count <= 0:
            raise ValueError("Audio file contains no samples.")

        samples = self._pcm_samples(raw_data, sample_width)

        if channels > 1:
            samples = samples[::channels]

        return {
            "sample_rate": sample_rate,
            "frame_count": frame_count,
            "duration_seconds": round(frame_count / sample_rate, 4),
            "samples": samples,
        }

    @staticmethod
    def calculate_zero_crossing_rate(samples: list[float]) -> float:
        if len(samples) < 2:
            return 0.0

        crossings = sum(
            1
            for i in range(1, len(samples))
            if (samples[i - 1] >= 0) != (samples[i] >= 0)
        )

        return round(crossings / (len(samples) - 1), 6)

    @staticmethod
    def calculate_rms(samples: list[float]) -> float:
        if not samples:
            return 0.0

        return round(
            math.sqrt(sum(x * x for x in samples) / len(samples)),
            6,
        )

    @staticmethod
    def calculate_spectral_centroid(
        samples: list[float],
        sample_rate: int,
        frame_size: int = 1024,
    ) -> float:
        """Calculate average spectral centroid using a lightweight DFT."""

        if len(samples) < 2 or sample_rate <= 0:
            return 0.0

        frame = samples[:frame_size]

        if len(frame) < 2:
            return 0.0

        n = len(frame)
        magnitudes = []
        frequencies = []

        max_bin = n // 2

        for k in range(max_bin + 1):
            real = 0.0
            imag = 0.0

            for index, sample in enumerate(frame):
                angle = 2.0 * math.pi * k * index / n
                real += sample * math.cos(angle)
                imag -= sample * math.sin(angle)

            magnitude = math.sqrt(real * real + imag * imag)

            magnitudes.append(magnitude)
            frequencies.append(k * sample_rate / n)

        total_magnitude = sum(magnitudes)

        if total_magnitude == 0.0:
            return 0.0

        centroid = sum(
            frequency * magnitude
            for frequency, magnitude in zip(frequencies, magnitudes)
        ) / total_magnitude

        return round(centroid, 4)

    def calculate_frame_rms_variation(
        self,
        samples: list[float],
        frame_size: int = 1024,
    ) -> float:
        frame_rms = []

        for start in range(0, len(samples), frame_size):
            frame = samples[start:start + frame_size]

            if len(frame) < frame_size // 2:
                continue

            frame_rms.append(self.calculate_rms(frame))

        if len(frame_rms) < 2:
            return 0.0

        mean = sum(frame_rms) / len(frame_rms)

        variance = sum(
            (value - mean) ** 2
            for value in frame_rms
        ) / len(frame_rms)

        return round(math.sqrt(variance), 6)

    def analyze(self, file_path: str) -> dict:
        audio = self.load_samples(file_path)

        spectral_centroid = self.calculate_spectral_centroid(
            audio["samples"],
            audio["sample_rate"],
            self.frame_size,
        )

        return {
            "sample_rate": audio["sample_rate"],
            "frame_count": audio["frame_count"],
            "duration_seconds": audio["duration_seconds"],
            "rms_energy": self.calculate_rms(audio["samples"]),
            "zero_crossing_rate": self.calculate_zero_crossing_rate(
                audio["samples"]
            ),
            "spectral_centroid_hz": spectral_centroid,
            "frame_rms_variation": self.calculate_frame_rms_variation(
                audio["samples"],
                self.frame_size,
            ),
        }
