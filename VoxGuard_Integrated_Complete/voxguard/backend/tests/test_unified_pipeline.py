import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.pipeline import UnifiedVoxGuardPipeline


class TestUnifiedPipeline(unittest.TestCase):

    def setUp(self):
        self.pipeline = UnifiedVoxGuardPipeline()
        self.sample_wav = Path(__file__).parent / "samples" / "person4_test.wav"

    def test_end_to_end_call_analysis(self):
        if not self.sample_wav.exists():
            self.skipTest("Sample wav file not found")

        report = self.pipeline.analyze_call(
            audio_path=str(self.sample_wav),
            behavior_risk=0.15,
            caller_phone="+91 98765 43210",
        )

        self.assertIsNotNone(report.call_id)
        self.assertIsNotNone(report.voice_authenticity_score)
        self.assertIsNotNone(report.overall_risk_score)
        self.assertIn(report.decision, ["ALLOW", "WARN", "VERIFY", "BLOCK"])
        self.assertIsNotNone(report.audit_hash)
        self.assertTrue(len(report.audit_hash) == 64)  # SHA-256 is 64 hex chars
        self.assertIn("risk_engine", report.model_versions)

        report_dict = report.to_dict()
        self.assertIn("component_scores", report_dict)
        self.assertIn("voice_status", report_dict)


if __name__ == "__main__":
    unittest.main()
