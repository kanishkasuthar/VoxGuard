import os
import wave
import numpy as np
from pathlib import Path

from .preprocessing import AudioPreprocessor
from .advanced_audio_analyzer import AdvancedAudioAnalyzer
from .authenticity_detector import AuthenticityDetector
from .aasist_onnx_model import AASISTONNXModel
from ...core.config import settings


class OfflineVoicePipeline:
    """Complete offline voice authenticity & deepfake detection pipeline."""

    def __init__(self, model_path: str | None = None):
        self.preprocessor = AudioPreprocessor()
        self.analyzer = AdvancedAudioAnalyzer()
        self.authenticity_detector = AuthenticityDetector()
        
        path = model_path or settings.AASIST_MODEL_PATH
        if not os.path.exists(path):
            alt_path = Path(__file__).resolve().parent.parent.parent / "models" / "aasist-l.onnx"
            if alt_path.exists():
                path = str(alt_path)

        self.aasist_model = AASISTONNXModel(path)

    def analyze_file(self, input_file: str) -> dict:
        input_path = Path(input_file)
        processed_file = str(input_path.with_name(f"{input_path.stem}_processed.wav"))

        preprocessing = self.preprocessor.process_file(
            input_file,
            processed_file,
        )

        features = self.analyzer.analyze(processed_file)

        rms = features["rms_energy"]
        zcr = features["zero_crossing_rate"]
        centroid = features["spectral_centroid_hz"]
        variation = features["frame_rms_variation"]
        duration = features["duration_seconds"]

        energy_quality = 1.0 - min(abs(rms - 0.35) / 0.35, 1.0)
        duration_quality = 1.0 if 1.0 <= duration <= 30.0 else 0.5
        audio_quality = energy_quality * 0.70 + duration_quality * 0.30

        zcr_consistency = 1.0 - min(abs(zcr - 0.05) / 0.05, 1.0)
        centroid_consistency = 1.0 - min(abs(centroid - 1200.0) / 1200.0, 1.0)

        spectral_consistency = (
            zcr_consistency * 0.40
            + centroid_consistency * 0.60
        )

        temporal_consistency = 1.0 - min(variation / 0.20, 1.0)

        replay_artifact_score = (
            0.35 if variation < 0.001
            else 0.15 if variation < 0.005
            else 0.0
        )

        rule_result = self.authenticity_detector.analyze(
            audio_quality=max(0.0, min(1.0, audio_quality)),
            spectral_consistency=max(0.0, min(1.0, spectral_consistency)),
            temporal_consistency=max(0.0, min(1.0, temporal_consistency)),
            replay_artifact_score=replay_artifact_score,
        )

        # Load samples for AASIST ONNX
        audio_samples = self.analyzer.load_samples(processed_file)["samples"]
        audio_array = np.array(audio_samples, dtype=np.float32)

        aasist_prediction = self.aasist_model.predict(audio_array)

        if aasist_prediction.get("status") == "SUCCESS":
            spoof_score = aasist_prediction["spoof_score"]
            authenticity_score = aasist_prediction["authenticity_score"]
            model_loaded = True
        else:
            # When ONNX engine is unavailable, use rule-based authenticity score
            spoof_score = rule_result.risk_score
            authenticity_score = rule_result.authenticity_score
            model_loaded = False

        voice_status = (
            "AUTHENTIC"
            if authenticity_score >= 0.75
            else "UNCERTAIN"
            if authenticity_score >= 0.50
            else "SUSPICIOUS"
        )

        return {
            "input_file": input_file,
            "processed_file": preprocessing["output_file"],
            "preprocessing": preprocessing,
            "features": features,
            "signals": {
                "audio_quality": round(audio_quality, 4),
                "spectral_consistency": round(spectral_consistency, 4),
                "temporal_consistency": round(temporal_consistency, 4),
                "replay_artifact_score": round(replay_artifact_score, 4),
            },
            "deepfake_score": round(spoof_score, 4),
            "spoof_score": round(spoof_score, 4),
            "authenticity_score": round(authenticity_score, 4),
            "voice_status": voice_status,
            "model_version": aasist_prediction.get("model_version", "AASIST-L-ONNX-v1"),
            "inference_mode": "onnx" if model_loaded else "dsp_rule_based",
            "model_loaded": model_loaded,
            "aasist": aasist_prediction,
        }
