import math
from pathlib import Path


class AudioProcessor:
    """Basic audio input validation and feature extraction utilities."""

    SUPPORTED_EXTENSIONS = {".wav", ".mp3", ".m4a", ".flac", ".ogg"}

    def validate_file(self, file_path: str) -> dict:
        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(f"Audio file not found: {file_path}")

        if not path.is_file():
            raise ValueError("Provided path is not a file.")

        extension = path.suffix.lower()

        if extension not in self.SUPPORTED_EXTENSIONS:
            raise ValueError(
                f"Unsupported audio format: {extension}. "
                f"Supported formats: {sorted(self.SUPPORTED_EXTENSIONS)}"
            )

        return {
            "valid": True,
            "file_name": path.name,
            "format": extension.lstrip("."),
            "size_bytes": path.stat().st_size,
        }

    @staticmethod
    def normalize_score(value: float) -> float:
        """Keep a score safely within the 0-1 range."""
        return max(0.0, min(1.0, float(value)))

    @staticmethod
    def calculate_duration_from_samples(
        sample_count: int,
        sample_rate: int
    ) -> float:
        """Calculate audio duration from sample count and sample rate."""
        if sample_rate <= 0:
            raise ValueError("Sample rate must be greater than zero.")

        return round(sample_count / sample_rate, 4)

    @staticmethod
    def calculate_rms(samples: list[float]) -> float:
        """Calculate RMS energy for a sequence of normalized samples."""
        if not samples:
            return 0.0

        mean_square = sum(float(sample) ** 2 for sample in samples) / len(samples)
        return round(math.sqrt(mean_square), 6)
