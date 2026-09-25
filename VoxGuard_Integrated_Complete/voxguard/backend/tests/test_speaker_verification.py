import unittest
import sys
import tempfile
from pathlib import Path
import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.speaker.speaker_verification import (
    SpeakerVerifier,
    IdentityStatus,
)


class TestSpeakerVerification(unittest.TestCase):

    def setUp(self):
        self.verifier = SpeakerVerifier(
            verified_threshold=0.75,
            uncertain_threshold=0.60,
        )

    def test_cosine_similarity(self):
        # Exact same vector -> 1.0
        vec_a = np.array([1.0, 0.0, 0.0])
        self.assertAlmostEqual(self.verifier._cosine_similarity(vec_a, vec_a), 1.0)

        # Orthogonal vectors -> 0.0
        vec_b = np.array([0.0, 1.0, 0.0])
        self.assertAlmostEqual(self.verifier._cosine_similarity(vec_a, vec_b), 0.0)

    def test_enrollment_serialization(self):
        with tempfile.TemporaryDirectory() as td:
            path = str(Path(td) / "voiceprints.json")
            self.verifier.enrolled_speakers["dad"] = np.array([0.5, 0.5, 0.5, 0.5], dtype=np.float32)
            self.verifier.save_enrollment(path)

            new_verifier = SpeakerVerifier()
            new_verifier.load_enrollment(path)
            self.assertIn("dad", new_verifier.enrolled_speakers)
            np.testing.assert_array_almost_equal(
                self.verifier.enrolled_speakers["dad"],
                new_verifier.enrolled_speakers["dad"],
            )

    def test_no_enrollment_status(self):
        # If no speakers are enrolled, status must be NO_ENROLLMENT or MODEL_UNAVAILABLE
        res = self.verifier.verify("nonexistent.wav")
        self.assertIn(res.status, [IdentityStatus.NO_ENROLLMENT, IdentityStatus.MODEL_UNAVAILABLE])


if __name__ == "__main__":
    unittest.main()
