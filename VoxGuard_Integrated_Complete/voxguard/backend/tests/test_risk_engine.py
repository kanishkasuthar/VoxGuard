import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.risk.risk_engine import RiskEngine
from app.services.risk.decision_engine import make_decision, Decision
from app.services.risk.config import THRESHOLDS


class TestRiskEngine(unittest.TestCase):

    def setUp(self):
        self.engine = RiskEngine()

    def test_low_risk_scenario(self):
        result = self.engine.calculate(
            voice_authenticity=0.95,
            speaker_confidence=0.90,
            fraud_score=0.05,
            behavior_risk=0.10,
        )

        self.assertLess(result.overall_score, THRESHOLDS.allow)
        self.assertEqual(result.risk_level, "LOW")
        decision = make_decision(result.overall_score)
        self.assertEqual(decision, Decision.ALLOW)

    def test_high_risk_deepfake_scenario(self):
        result = self.engine.calculate(
            voice_authenticity=0.10,
            speaker_confidence=0.85,
            fraud_score=0.80,
            behavior_risk=0.70,
        )

        self.assertGreaterEqual(result.overall_score, THRESHOLDS.warn)
        decision = make_decision(result.overall_score)
        self.assertEqual(decision, Decision.VERIFY)
        self.assertTrue(any("voice" in r.lower() for r in result.reasons))
        self.assertTrue(any("fraud" in r.lower() for r in result.reasons))

    def test_critical_block_scenario(self):
        result = self.engine.calculate(
            voice_authenticity=0.05,
            speaker_confidence=0.10,
            fraud_score=0.90,
            behavior_risk=0.85,
        )

        self.assertGreaterEqual(result.overall_score, THRESHOLDS.verify)
        decision = make_decision(result.overall_score)
        self.assertEqual(decision, Decision.BLOCK)
        self.assertEqual(result.risk_level, "CRITICAL")

    def test_dynamic_weight_rebalancing(self):
        # When speaker confidence is missing (e.g. no enrollment), dynamic reweighting operates
        result = self.engine.calculate(
            voice_authenticity=0.80,
            speaker_confidence=None,
            fraud_score=0.10,
            behavior_risk=None,
        )

        self.assertIsNotNone(result.overall_score)
        self.assertIn("voice", result.component_scores)
        self.assertIn("fraud", result.component_scores)
        self.assertNotIn("speaker", result.component_scores)


if __name__ == "__main__":
    unittest.main()
