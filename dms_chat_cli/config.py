import os
from dataclasses import dataclass
from typing import Optional


@dataclass
class Config:
    """Configuration for the CLI."""
    api_url: str = os.getenv("DMS_API_URL", "http://localhost:3001/api")
    jwt: Optional[str] = os.getenv("DMS_JWT")
    channel_id: Optional[str] = os.getenv("DMS_CHANNEL_ID")


config = Config()
