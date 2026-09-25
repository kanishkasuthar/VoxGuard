import re


def validate_risk_input(data: dict) -> dict:
    required = [
        "voice_authenticity",
        "speaker_confidence",
        "fraud_score",
        "behavior_risk"
    ]

    for field in required:
        if field not in data:
            raise ValueError(f"Missing required field: {field}")

        value = data[field]

        if not isinstance(value, (int, float)):
            raise ValueError(f"{field} must be numeric")

        if not 0.0 <= float(value) <= 1.0:
            raise ValueError(f"{field} must be between 0 and 1")

    return data


def sanitize_text(text: str | None) -> str:
    if not isinstance(text, str):
        return ""

    # Remove HTML/script tags
    text = re.sub(r"<[^>]*>", "", text)

    # Remove control characters
    text = re.sub(r"[\x00-\x1f\x7f]", "", text)

    return text.strip()
