from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from cryptography.fernet import Fernet, InvalidToken


class EncryptedEventStore:
    """Encrypted local storage for pending VoxGuard security events."""

    def __init__(
        self,
        storage_file: str = "logs/offline_events.enc",
        key_file: str = "logs/offline_events.key",
    ):
        self.storage_file = Path(storage_file)
        self.key_file = Path(key_file)

        self.storage_file.parent.mkdir(parents=True, exist_ok=True)
        self.key_file.parent.mkdir(parents=True, exist_ok=True)

        self._fernet = Fernet(self._load_or_create_key())

    def _load_or_create_key(self) -> bytes:
        if self.key_file.exists():
            return self.key_file.read_bytes().strip()

        key = Fernet.generate_key()
        self.key_file.write_bytes(key)

        try:
            os.chmod(self.key_file, 0o600)
        except OSError:
            pass

        return key

    def _load_events(self) -> list[dict[str, Any]]:
        if not self.storage_file.exists():
            return []

        encrypted = self.storage_file.read_bytes()
        if not encrypted:
            return []

        try:
            decrypted = self._fernet.decrypt(encrypted)
            data = json.loads(decrypted.decode("utf-8"))

            if not isinstance(data, list):
                raise ValueError("Offline event store must contain a list")

            return data

        except (InvalidToken, json.JSONDecodeError, UnicodeDecodeError) as exc:
            raise ValueError("Offline event storage could not be decrypted") from exc

    def _save_events(self, events: list[dict[str, Any]]) -> None:
        payload = json.dumps(
            events,
            sort_keys=True,
            separators=(",", ":"),
        ).encode("utf-8")

        encrypted = self._fernet.encrypt(payload)
        self.storage_file.write_bytes(encrypted)

        try:
            os.chmod(self.storage_file, 0o600)
        except OSError:
            pass

    def add_event(self, event: dict[str, Any]) -> dict[str, Any]:
        required = {
            "event_id",
            "timestamp",
            "risk_level",
            "decision",
        }

        missing = required - event.keys()
        if missing:
            raise ValueError(
                f"Missing required event fields: {sorted(missing)}"
            )

        safe_event = dict(event)

        # Privacy guarantee: Raw voice audio or embeddings are never stored in plain offline files
        forbidden = {
            "audio",
            "audio_data",
            "recording",
            "recording_data",
            "voiceprint",
            "voice_embedding",
            "raw_audio",
        }

        for field in forbidden:
            safe_event.pop(field, None)

        safe_event["sync_status"] = "PENDING"

        events = self._load_events()
        events.append(safe_event)
        self._save_events(events)

        return safe_event

    def get_pending_events(self) -> list[dict[str, Any]]:
        return [
            event
            for event in self._load_events()
            if event.get("sync_status") == "PENDING"
        ]

    def mark_synced(self, event_ids: list[str]) -> int:
        ids = set(event_ids)
        events = self._load_events()
        updated = 0

        for event in events:
            if event.get("event_id") in ids:
                event["sync_status"] = "SYNCED"
                updated += 1

        self._save_events(events)
        return updated

    def count_pending(self) -> int:
        return len(self.get_pending_events())
