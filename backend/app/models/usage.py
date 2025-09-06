from beanie import Document, Link
from datetime import datetime
from .user import User

class APIUsage(Document):
    user: Link[User]
    prompt: str
    timestamp: datetime = datetime.utcnow()
    is_archived: bool = False

    class Settings:
        name = "usage_logs"