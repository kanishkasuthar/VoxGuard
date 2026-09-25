import unittest
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.fraud.fraud_detection import FraudIntentDetector, FraudIntentType


class TestFraudDetection(unittest.TestCase):

    def setUp(self):
        self.detector = FraudIntentDetector(suspicious_threshold=0.4)

    def test_english_otp_request(self):
        text = "Hello sir, please share the 6-digit OTP you received right now."
        result = self.detector.analyze(text, language_code="en")

        self.assertTrue(result.is_suspicious)
        self.assertIn(FraudIntentType.OTP_REQUEST, result.detected_types)
        self.assertIn(FraudIntentType.URGENCY_MANIPULATION, result.detected_types)
        self.assertGreaterEqual(result.fraud_score, 0.4)

    def test_hindi_fraud_patterns(self):
        text = "आपका बैंक खाता ब्लॉक हो जाएगा तुरंत पैसे भेजिए ओटीपी बताइए"
        result = self.detector.analyze(text, language_code="hi")

        self.assertTrue(result.is_suspicious)
        self.assertIn(FraudIntentType.ACCOUNT_THREAT, result.detected_types)
        self.assertIn(FraudIntentType.MONEY_TRANSFER_REQUEST, result.detected_types)
        self.assertIn(FraudIntentType.OTP_REQUEST, result.detected_types)
        self.assertGreaterEqual(result.fraud_score, 0.6)

    def test_kannada_fraud_patterns(self):
        text = "ಖಾತೆ ಬ್ಲಾಕ್ ಆಗಿದೆ ತಕ್ಷಣ ಒಟಿಪಿ ಕೋಡ್ ಹೇಳಿ"
        result = self.detector.analyze(text, language_code="kn")

        self.assertTrue(result.is_suspicious)
        self.assertIn(FraudIntentType.OTP_REQUEST, result.detected_types)
        self.assertIn(FraudIntentType.ACCOUNT_THREAT, result.detected_types)

    def test_telugu_fraud_patterns(self):
        text = "మీ ఖాతా రద్దు అవుతుంది వెంటనే ఓటీపీ చెప్పండి"
        result = self.detector.analyze(text, language_code="te")

        self.assertTrue(result.is_suspicious)
        self.assertIn(FraudIntentType.OTP_REQUEST, result.detected_types)
        self.assertIn(FraudIntentType.ACCOUNT_THREAT, result.detected_types)

    def test_tamil_fraud_patterns(self):
        text = "வங்கியிலிருந்து பேசுகிறேன் உடனடியாக ஓடிபி சொல்லுங்கள்"
        result = self.detector.analyze(text, language_code="ta")

        self.assertTrue(result.is_suspicious)
        self.assertIn(FraudIntentType.IMPERSONATION, result.detected_types)
        self.assertIn(FraudIntentType.OTP_REQUEST, result.detected_types)

    def test_malayalam_fraud_patterns(self):
        text = "ബാങ്കിൽ നിന്നാണ് വിളിക്കുന്നത് ഉടനെ ഒടിപി പറയൂ"
        result = self.detector.analyze(text, language_code="ml")

        self.assertTrue(result.is_suspicious)
        self.assertIn(FraudIntentType.IMPERSONATION, result.detected_types)
        self.assertIn(FraudIntentType.OTP_REQUEST, result.detected_types)

    def test_benign_conversation(self):
        text = "Hi Grandma, how are you? The weather is nice here today. I love you."
        result = self.detector.analyze(text, language_code="en")

        self.assertFalse(result.is_suspicious)
        self.assertEqual(result.fraud_score, 0.0)
        self.assertEqual(result.detected_types, [FraudIntentType.NONE])


if __name__ == "__main__":
    unittest.main()
