from __future__ import annotations

import json
from typing import Any
from urllib.request import Request, urlopen
from urllib.error import URLError, HTTPError

from .encrypted_store import EncryptedEventStore


class OfflineSyncManager:
    """Stores security events offline and syncs them when the backend is reachable."""

    def __init__(
        self,
        store: EncryptedEventStore | None = None,
        backend_url: str = "http://127.0.0.1:8000/integration/person6/sync",
    ):
        self.store = store or EncryptedEventStore()
        self.backend_url = backend_url

    def queue_event(self, event: dict[str, Any]) -> dict[str, Any]:
        """Encrypt and store an event locally as PENDING."""
        return self.store.add_event(event)

    def is_backend_reachable(self, timeout: float = 2.0) -> bool:
        """Check whether the configured backend endpoint is reachable."""
        try:
            health_url = self.backend_url.rsplit("/integration/person6/sync", 1)[0] + "/health"
            request = Request(health_url, method="GET")
            with urlopen(request, timeout=timeout):
                return True
        except (HTTPError, URLError, TimeoutError, OSError):
            return False

    def sync_pending_events(self, timeout: float = 5.0) -> dict[str, Any]:
        """Send pending events to the backend and mark successful events as synced."""
        pending = self.store.get_pending_events()

        if not pending:
            return {
                "status": "NO_PENDING_EVENTS",
                "attempted": 0,
                "synced": 0,
                "remaining": 0,
            }

        payload = json.dumps({"events": pending}).encode("utf-8")

        request = Request(
            self.backend_url,
            data=payload,
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urlopen(request, timeout=timeout) as response:
                response_data = json.loads(
                    response.read().decode("utf-8")
                )

            synced_ids = response_data.get("synced_event_ids", [])
            synced_count = self.store.mark_synced(synced_ids)

            return {
                "status": "SYNCED",
                "attempted": len(pending),
                "synced": synced_count,
                "remaining": self.store.count_pending(),
            }

        except (HTTPError, URLError, TimeoutError, OSError, ValueError):
            return {
                "status": "OFFLINE",
                "attempted": len(pending),
                "synced": 0,
                "remaining": self.store.count_pending(),
            }
