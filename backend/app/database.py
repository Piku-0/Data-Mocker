import os
import certifi
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI") or os.getenv("MONGO_DETAILS")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI or MONGO_DETAILS must be set in .env")

client = AsyncIOMotorClient(
    MONGO_URI,
    tls=True,
    tlsCAFile=certifi.where()
)

# Use default DB from URI (must include db name in the URI)
database = client.get_default_database()
