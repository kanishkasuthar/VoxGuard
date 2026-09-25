from __future__ import annotations

from pathlib import Path
from typing import Optional
import numpy as np

try:
    import onnxruntime as ort
    _ORT_AVAILABLE = True
except ImportError:
    ort = None
    _ORT_AVAILABLE = False


class AASISTONNXModel:
    """Offline AASIST-L ONNX anti-spoofing inference."""

    MODEL_VERSION = "AASIST-L-ONNX-v1"

    def __init__(self, model_path: str):
        self.model_path = model_path
        self.session = None
        self.input_name = None
        self.output_name = None

        if _ORT_AVAILABLE and Path(model_path).exists():
            try:
                self.session = ort.InferenceSession(
                    model_path,
                    providers=["CPUExecutionProvider"],
                )
                self.input_name = self.session.get_inputs()[0].name
                self.output_name = self.session.get_outputs()[0].name
            except Exception:
                self.session = None

    @classmethod
    def is_engine_ready(cls) -> bool:
        return _ORT_AVAILABLE

    def get_model_info(self) -> dict:
        if not self.session:
            return {
                "model_version": self.MODEL_VERSION,
                "model_path": self.model_path,
                "status": "UNAVAILABLE",
                "reason": "onnxruntime not installed or model file not found",
            }

        input_info = self.session.get_inputs()[0]
        output_info = self.session.get_outputs()[0]

        return {
            "model_version": self.MODEL_VERSION,
            "model_path": self.model_path,
            "input_name": self.input_name,
            "input_shape": input_info.shape,
            "input_type": input_info.type,
            "output_name": self.output_name,
            "output_shape": output_info.shape,
            "output_type": output_info.type,
            "provider": self.session.get_providers()[0],
            "status": "LOADED",
        }

    @staticmethod
    def prepare_audio(audio: np.ndarray) -> np.ndarray:
        audio = np.asarray(audio, dtype=np.float32).flatten()

        if len(audio) == 0:
            raise ValueError("Audio contains no samples")

        target_length = 64600

        if len(audio) >= target_length:
            return audio[:target_length].astype(np.float32)

        repetitions = target_length // len(audio) + 1
        audio = np.tile(audio, repetitions)

        return audio[:target_length].astype(np.float32)

    def predict(self, audio: np.ndarray) -> dict:
        if not self.session:
            return {
                "model_version": self.MODEL_VERSION,
                "status": "ENGINE_UNAVAILABLE",
                "authenticity_score": 0.5,
                "spoof_score": 0.5,
                "details": "onnxruntime package required for deepfake ONNX model inference",
            }

        prepared = self.prepare_audio(audio)
        model_input = prepared.reshape(1, -1).astype(np.float32)

        output = self.session.run(
            [self.output_name],
            {self.input_name: model_input},
        )[0]

        scores = np.asarray(output).flatten()

        if len(scores) != 2:
            raise ValueError(
                f"Expected 2 AASIST logits, got {len(scores)}"
            )

        shifted = scores - np.max(scores)
        probabilities = np.exp(shifted) / np.sum(np.exp(shifted))

        spoof_probability = float(probabilities[0])
        bona_fide_probability = float(probabilities[1])

        return {
            "raw_output": scores.tolist(),
            "output_size": int(len(scores)),
            "logit_class_0": float(scores[0]),
            "logit_class_1": float(scores[1]),
            "class_0_probability": spoof_probability,
            "class_1_probability": bona_fide_probability,
            "spoof_score": spoof_probability,
            "authenticity_score": bona_fide_probability,
            "anti_spoof_score": spoof_probability,
            "bona_fide_score": bona_fide_probability,
            "model_version": self.MODEL_VERSION,
            "inference_mode": "offline_onnx",
            "status": "SUCCESS",
        }
