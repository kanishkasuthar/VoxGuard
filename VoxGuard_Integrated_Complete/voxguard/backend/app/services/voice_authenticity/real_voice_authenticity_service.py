from .offline_voice_pipeline import OfflineVoicePipeline


class RealVoiceAuthenticityService:
    """Run voice authenticity analysis directly from an audio file."""

    def __init__(self):
        self.pipeline = OfflineVoicePipeline()

    def analyze_file(self, file_path: str) -> dict:
        return self.pipeline.analyze_file(file_path)
