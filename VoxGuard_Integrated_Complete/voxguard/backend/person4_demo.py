import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.person4.person4_service import Person4Service


def main():
    service = Person4Service()

    print("=== VoxGuard Person 4 Demo ===")
    print()

    print("AUTHENTIC VOICE TEST")
    authentic = service.analyze_voice(
        audio_quality=0.90,
        spectral_consistency=0.85,
        temporal_consistency=0.88,
        replay_artifact_score=0.05,
    )
    print(authentic)
    print()

    print("SUSPICIOUS VOICE TEST")
    suspicious = service.analyze_voice(
        audio_quality=0.30,
        spectral_consistency=0.25,
        temporal_consistency=0.35,
        replay_artifact_score=0.80,
    )
    print(suspicious)


if __name__ == "__main__":
    main()
