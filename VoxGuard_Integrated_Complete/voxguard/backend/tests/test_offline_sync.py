import unittest
import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.services.offline_sync.encrypted_store import EncryptedEventStore
from app.services.offline_sync.sync_manager import OfflineSyncManager


class TestOfflineSync(unittest.TestCase):

    def setUp(self):
        self.temp_dir = tempfile.TemporaryDirectory()
        self.store_file = Path(self.temp_dir.name) / "test_events.enc"
        self.key_file = Path(self.temp_dir.name) / "test_events.key"
        self.store = EncryptedEventStore(
            storage_file=str(self.store_file),
            key_file=str(self.key_file),
        )

    def tearDown(self):
        self.temp_dir.cleanup()

    def test_encrypted_event_storage(self):
        event = {
            "event_id": "EV-001",
            "timestamp": "2026-09-17T03:00:00Z",
            "risk_level": "HIGH",
            "decision": "BLOCK",
            "raw_audio": "SHOULD_BE_STRIPPED",
        }

        stored = self.store.add_event(event)
        self.assertEqual(stored["sync_status"], "PENDING")
        self.assertNotIn("raw_audio", stored)

        # File on disk must be encrypted (not plain JSON)
        raw_bytes = self.store_file.read_bytes()
        self.assertNotIn(b"EV-001", raw_bytes)

        # Decrypt & load
        pending = self.store.get_pending_events()
        self.assertEqual(len(pending), 1)
        self.assertEqual(pending[0]["event_id"], "EV-001")

    def test_mark_synced(self):
        self.store.add_event({
            "event_id": "EV-002",
            "timestamp": "2026-09-17T03:00:00Z",
            "risk_level": "LOW",
            "decision": "ALLOW",
        })

        synced_count = self.store.mark_synced(["EV-002"])
        self.assertEqual(synced_count, 1)
        self.assertEqual(self.store.count_pending(), 0)


if __name__ == "__main__":
    unittest.main()
