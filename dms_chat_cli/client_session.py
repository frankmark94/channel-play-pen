"""Client Channel API wrapper used by the CLI."""
from __future__ import annotations

import json
from dataclasses import dataclass
from typing import Any, Dict, List, Optional

import requests

from .config import config


@dataclass
class ClientSession:
    """Represents a client chat session."""

    session_id: Optional[str] = None

    def init_session(self) -> str:
        url = f"{config.api_url}/connect"
        headers = {}
        if config.jwt:
            headers["Authorization"] = f"Bearer {config.jwt}"
        payload: Dict[str, Any] = {"channelId": config.channel_id}
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        data = response.json()
        self.session_id = data.get("sessionId")
        return self.session_id

    def send_message(self, text: str) -> Dict[str, Any]:
        if not self.session_id:
            raise RuntimeError("Session not initialized")
        url = f"{config.api_url}/send-message"
        payload = {"sessionId": self.session_id, "text": text}
        headers = {}
        if config.jwt:
            headers["Authorization"] = f"Bearer {config.jwt}"
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json()

    def get_messages(self) -> List[Dict[str, Any]]:
        if not self.session_id:
            raise RuntimeError("Session not initialized")
        url = f"{config.api_url}/sessions/{self.session_id}/messages"
        headers = {}
        if config.jwt:
            headers["Authorization"] = f"Bearer {config.jwt}"
        response = requests.get(url, headers=headers, timeout=10)
        response.raise_for_status()
        return response.json().get("messages", [])

    def end_session(self) -> None:
        if not self.session_id:
            raise RuntimeError("Session not initialized")
        url = f"{config.api_url}/end-session"
        payload = {"sessionId": self.session_id}
        headers = {}
        if config.jwt:
            headers["Authorization"] = f"Bearer {config.jwt}"
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        response.raise_for_status()
