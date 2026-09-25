import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.person4.person4_service import Person4Service
from app.person4.audio_processor import AudioProcessor
from app.person4.advanced_audio_analyzer import AdvancedAudioAnalyzer


class TestPerson4Authenticity(unittest.TestCase):

    def setUp(self):
        self.service = Person4Service()
        self.audio_processor = AudioProcessor()
        self.analyzer = AdvancedAudioAnalyzer()
        self.samples_dir = Path(__file__).parent / "samples"

    def test_authentic_voice_rule_scoring(self):
        result = self.service.analyze_voice(
            audio_quality=0.90,
            spectral_consistency=0.85,
            temporal_consistency=0.88,
            replay_artifact_score=0.05,
        )

        self.assertEqual(result["status"], "AUTHENTIC")
        self.assertGreaterEqual(result["authenticity_score"], 0.75)
        self.assertLess(result["risk_score"], 0.25)

    def test_suspicious_voice_rule_scoring(self):
        result = self.service.analyze_voice(
            audio_quality=0.30,
            spectral_consistency=0.25,
            temporal_consistency=0.35,
            replay_artifact_score=0.80,
        )

        self.assertEqual(result["status"], "SUSPICIOUS")
        self.assertLess(result["authenticity_score"], 0.50)
        self.assertGreaterEqual(result["risk_score"], 0.50)
        self.assertTrue(len(result["reasons"]) > 0)

    def test_audio_feature_extraction(self):
        sample_wav = self.samples_dir / "person4_test.wav"
        if sample_wav.exists():
            features = self.analyzer.analyze(str(sample_wav))
            self.assertIn("rms_energy", features)
            self.assertIn("zero_crossing_rate", features)
            self.assertIn("spectral_centroid_hz", features)
            self.assertIn("frame_rms_variation", features)
            self.assertGreater(features["duration_seconds"], 0.0)


if __name__ == "__main__":
    unittest.main()
