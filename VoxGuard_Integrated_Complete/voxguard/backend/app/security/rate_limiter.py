import time
from collections import defaultdict


class RateLimiter:

    def __init__(self, max_requests: int = 20, window_seconds: int = 60):
        self.max_requests = max_requests
        self.window_seconds = window_seconds
        self.requests = defaultdict(list)

    def allow(self, client_id: str) -> bool:
        now = time.time()

        recent = [
            timestamp
            for timestamp in self.requests[client_id]
            if now - timestamp < self.window_seconds
        ]

        self.requests[client_id] = recent

        if len(recent) >= self.max_requests:
            return False

        self.requests[client_id].append(now)
        return True
