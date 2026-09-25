"""
fraud_detection.py
-------------------
Rule-based fraud / social-engineering intent detection over a transcript.

Detects common voice-scam patterns:
    OTP_REQUEST
    CREDENTIAL_REQUEST
    ACCOUNT_THREAT
    MONEY_TRANSFER_REQUEST
    URGENCY_MANIPULATION
    IMPERSONATION

Patterns are defined per supported language (English, Hindi, Kannada,
Telugu, Tamil, Malayalam) as regexes, matched against the transcript.
Each matched category contributes a weight to an overall fraud_score in [0, 1].
"""

from __future__ import annotations

import re
from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Pattern


class FraudIntentType(str, Enum):
    OTP_REQUEST = "OTP_REQUEST"
    CREDENTIAL_REQUEST = "CREDENTIAL_REQUEST"
    ACCOUNT_THREAT = "ACCOUNT_THREAT"
    MONEY_TRANSFER_REQUEST = "MONEY_TRANSFER_REQUEST"
    URGENCY_MANIPULATION = "URGENCY_MANIPULATION"
    IMPERSONATION = "IMPERSONATION"
    NONE = "NONE"


CATEGORY_WEIGHTS: Dict[FraudIntentType, float] = {
    FraudIntentType.OTP_REQUEST: 0.35,
    FraudIntentType.CREDENTIAL_REQUEST: 0.30,
    FraudIntentType.ACCOUNT_THREAT: 0.20,
    FraudIntentType.MONEY_TRANSFER_REQUEST: 0.30,
    FraudIntentType.URGENCY_MANIPULATION: 0.15,
    FraudIntentType.IMPERSONATION: 0.20,
}

PATTERNS: Dict[str, Dict[FraudIntentType, List[str]]] = {
    "en": {
        FraudIntentType.OTP_REQUEST: [
            r"\botp\b", r"one[\s-]?time password", r"verification code",
            r"share (the|your) code", r"tell me the code", r"6[\s-]?digit code",
        ],
        FraudIntentType.CREDENTIAL_REQUEST: [
            r"\bpassword\b", r"\bpin\b", r"cvv", r"card number", r"login details",
            r"net ?banking", r"user ?id and password", r"atm pin",
        ],
        FraudIntentType.ACCOUNT_THREAT: [
            r"account (will be|is) (blocked|suspended|frozen|closed)",
            r"legal action", r"account.*deactivat", r"kyc.*expir",
            r"your account has been compromised", r"police case",
        ],
        FraudIntentType.MONEY_TRANSFER_REQUEST: [
            r"transfer (the )?money", r"send (money|funds|rs\.?|rupees)",
            r"google pay|gpay|phonepe|paytm|upi", r"pay (a |the )?(fee|fine|penalty)",
            r"refund.*process", r"bank (details|account number)",
        ],
        FraudIntentType.URGENCY_MANIPULATION: [
            r"immediately", r"right now", r"within (\d+ )?(minutes|hours)",
            r"urgent(ly)?", r"do not (tell|inform) anyone", r"last warning",
            r"before it('?s| is) too late",
        ],
        FraudIntentType.IMPERSONATION: [
            r"i am calling from (the )?(bank|rbi|income tax|police|customs)",
            r"this is (officer|inspector|agent)", r"government official",
            r"cyber ?crime (cell|department)", r"courier.*customs",
        ],
    },
    "hi": {
        FraudIntentType.OTP_REQUEST: [
            r"ओटीपी", r"वन[\s-]?टाइम पासवर्ड", r"कोड बताइए", r"वेरिफिकेशन कोड",
        ],
        FraudIntentType.CREDENTIAL_REQUEST: [
            r"पासवर्ड", r"पिन नंबर", r"सीवीवी", r"कार्ड नंबर", r"नेट ?बैंकिंग",
        ],
        FraudIntentType.ACCOUNT_THREAT: [
            r"खाता.*(बंद|ब्लॉक)", r"अकाउंट.*(बंद|ब्लॉक)", r"कानूनी कार्रवाई", r"केवाईसी.*समाप्त",
            r"पुलिस केस",
        ],
        FraudIntentType.MONEY_TRANSFER_REQUEST: [
            r"पैसे भेजिए", r"पैसा ट्रांसफर", r"रुपये जमा", r"जुर्माना.*भरिए",
            r"यूपीआई", r"गूगल पे|फोनपे|पेटीएम",
        ],
        FraudIntentType.URGENCY_MANIPULATION: [
            r"तुरंत", r"अभी.*करिए", r"जल्दी कीजिए", r"किसी को मत बताइए",
            r"आखिरी चेतावनी",
        ],
        FraudIntentType.IMPERSONATION: [
            r"बैंक से बोल रहा", r"मैं.*अधिकारी", r"पुलिस विभाग से",
            r"साइबर क्राइम",
        ],
    },
    "kn": {
        FraudIntentType.OTP_REQUEST: [
            r"ಒಟಿಪಿ", r"ಒನ್[\s-]?ಟೈಮ್ ಪಾಸ್\S*", r"ಕೋಡ್ ಹೇಳಿ", r"ವೆರಿಫಿಕೇಶನ್ ಕೋಡ್",
        ],
        FraudIntentType.CREDENTIAL_REQUEST: [
            r"ಪಾಸ್\S*ವರ್ಡ್", r"ಪಿನ್ ನಂಬರ್", r"ಸಿವಿವಿ", r"ಕಾರ್ಡ್ ನಂಬರ್",
        ],
        FraudIntentType.ACCOUNT_THREAT: [
            r"ಖಾತೆ.*ಬ್ಲಾಕ್", r"ಖಾತೆ.*ಮುಚ್ಚ", r"ಕಾನೂನು ಕ್ರಮ", r"ಕೆವೈಸಿ.*ಮುಕ್ತಾಯ",
        ],
        FraudIntentType.MONEY_TRANSFER_REQUEST: [
            r"ಹಣ ಕಳುಹಿಸಿ", r"ಹಣ ವರ್ಗಾವಣೆ", r"ಯುಪಿಐ", r"ದಂಡ ಕಟ್ಟಿ",
        ],
        FraudIntentType.URGENCY_MANIPULATION: [
            r"ತಕ್ಷಣ", r"ಈಗಲೇ ಮಾಡಿ", r"ಬೇಗ ಮಾಡಿ", r"ಯಾರಿಗೂ ಹೇಳಬೇಡಿ",
            r"ಕೊನೆಯ ಎಚ್ಚರಿಕೆ",
        ],
        FraudIntentType.IMPERSONATION: [
            r"ಬ್ಯಾಂಕಿನಿಂದ ಕರೆ ಮಾಡುತ್ತಿದ್ದೇನೆ", r"ನಾನು.*ಅಧಿಕಾರಿ", r"ಪೊಲೀಸ್ ಇಲಾಖೆ",
        ],
    },
    "te": {
        FraudIntentType.OTP_REQUEST: [
            r"ఓటీపీ", r"వన్[\s-]?టైమ్ పాస్‌వర్డ్", r"కోడ్ చెప్పండి", r"ధృవీకరణ కోడ్",
        ],
        FraudIntentType.CREDENTIAL_REQUEST: [
            r"పాస్‌వర్డ్", r"పిన్ నంబర్", r"సివివి", r"కార్డు నంబర్",
        ],
        FraudIntentType.ACCOUNT_THREAT: [
            r"ఖాతా.*బ్లాక్", r"ఖాతా.*రద్దు", r"చట్టపరమైన చర్య", r"కేవైసీ.*గడువు",
        ],
        FraudIntentType.MONEY_TRANSFER_REQUEST: [
            r"డబ్బులు పంపండి", r"డబ్బు బదిలీ", r"యూపీఐ", r"జరిమానా కట్టండి",
        ],
        FraudIntentType.URGENCY_MANIPULATION: [
            r"వెంటనే", r"ఇప్పుడే చేయండి", r"త్వరగా చేయండి", r"ఎవరికీ చెప్పకండి",
            r"చివరి హెచ్చరిక",
        ],
        FraudIntentType.IMPERSONATION: [
            r"బ్యాంకు నుండి కాల్ చేస్తున్నాను", r"నేను.*అధికారిని", r"పోలీస్ శాఖ",
        ],
    },
    "ta": {
        FraudIntentType.OTP_REQUEST: [
            r"ஓடிபி", r"ஒரு முறை கடவுச்சொல்", r"குறியீட்டைச் சொல்லுங்கள்",
        ],
        FraudIntentType.CREDENTIAL_REQUEST: [
            r"கடவுச்சொல்", r"பின் எண்", r"சிவிவி", r"அட்டை எண்",
        ],
        FraudIntentType.ACCOUNT_THREAT: [
            r"கணக்கு.*முடக்கப்படும்", r"சட்ட நடவடிக்கை", r"கேஒய்சி.*காலாவதி",
        ],
        FraudIntentType.MONEY_TRANSFER_REQUEST: [
            r"பணம் அனுப்புங்கள்", r"பண பரிமாற்றம்", r"யுபிஐ", r"அபராதம் செலுத்துங்கள்",
        ],
        FraudIntentType.URGENCY_MANIPULATION: [
            r"உடனடியாக", r"இப்போதே செய்யுங்கள்", r"யாருக்கும் சொல்லாதீர்கள்",
            r"கடைசி எச்சரிக்கை",
        ],
        FraudIntentType.IMPERSONATION: [
            r"வங்கியிலிருந்து பேசுகிறேன்", r"நான்.*அதிகாரி", r"காவல்துறை",
        ],
    },
    "ml": {
        FraudIntentType.OTP_REQUEST: [
            r"ഒടിപി", r"വൺ[\s-]?ടൈം പാസ്‌വേഡ്", r"കോഡ് പറയൂ",
        ],
        FraudIntentType.CREDENTIAL_REQUEST: [
            r"പാസ്‌വേഡ്", r"പിൻ നമ്പർ", r"സിവിവി", r"കാർഡ് നമ്പർ",
        ],
        FraudIntentType.ACCOUNT_THREAT: [
            r"അക്കൗണ്ട്.*ബ്ലോക്ക്", r"നിയമനടപടി", r"കെവൈസി.*കാലഹരണപ്പെട്ടു",
        ],
        FraudIntentType.MONEY_TRANSFER_REQUEST: [
            r"പണം അയക്കൂ", r"പണം കൈമാറ്റം", r"യുപിഐ", r"പിഴ അടയ്ക്കൂ",
        ],
        FraudIntentType.URGENCY_MANIPULATION: [
            r"ഉടനെ", r"ഇപ്പോൾ തന്നെ ചെയ്യൂ", r"വേഗം ചെയ്യൂ", r"ആരോടും പറയരുത്",
            r"അവസാന മുന്നറിയിപ്പ്",
        ],
        FraudIntentType.IMPERSONATION: [
            r"ബാങ്കിൽ നിന്നാണ് വിളിക്കുന്നത്", r"ഞാൻ.*ഉദ്യോഗസ്ഥൻ", r"പോലീസ് വകുപ്പ്",
            r"സൈബർ ക്രൈം",
        ],
    },
}


@dataclass
class FraudAnalysisResult:
    detected_types: List[FraudIntentType]
    fraud_score: float                       # 0.0 - 1.0
    is_suspicious: bool
    matched_phrases: Dict[str, List[str]] = field(default_factory=dict)


class FraudIntentDetector:
    """
    Scans a transcript (in a supported language) for known fraud /
    social-engineering patterns and produces an aggregate fraud score.
    """

    def __init__(self, suspicious_threshold: float = 0.4):
        self.suspicious_threshold = suspicious_threshold
        # Pre-compile all regex patterns for high-throughput scanning
        self._compiled: Dict[str, Dict[FraudIntentType, List[Pattern]]] = {
            lang: {
                category: [re.compile(p, re.IGNORECASE) for p in patterns]
                for category, patterns in cat_map.items()
            }
            for lang, cat_map in PATTERNS.items()
        }

    def analyze(self, transcript: str, language_code: str = "en") -> FraudAnalysisResult:
        if not transcript or not transcript.strip():
            return FraudAnalysisResult(
                detected_types=[FraudIntentType.NONE],
                fraud_score=0.0,
                is_suspicious=False,
            )

        lang_patterns = self._compiled.get(language_code, self._compiled["en"])

        detected: List[FraudIntentType] = []
        matched_phrases: Dict[str, List[str]] = {}
        score = 0.0

        for category, patterns in lang_patterns.items():
            hits = [p.pattern for p in patterns if p.search(transcript)]
            if hits:
                detected.append(category)
                matched_phrases[category.value] = hits
                score += CATEGORY_WEIGHTS.get(category, 0.1)

        # Compounding bonus for combined multiple attack vectors
        if len(detected) >= 2:
            score += 0.10 * (len(detected) - 1)

        score = round(min(score, 1.0), 4)

        if not detected:
            detected = [FraudIntentType.NONE]

        return FraudAnalysisResult(
            detected_types=detected,
            fraud_score=score,
            is_suspicious=score >= self.suspicious_threshold,
            matched_phrases=matched_phrases,
        )
