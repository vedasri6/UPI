import os
from dotenv import load_dotenv

env_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env")
if os.path.exists(env_path):
    load_dotenv(env_path, override=True)
else:
    load_dotenv(override=True)

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "upisurakshamitra_secret_key_2026")
    MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/upisurakshamitra_db")
    DEBUG = os.getenv("FLASK_DEBUG", "True").lower() in ("true", "1", "t")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    VIRUSTOTAL_API_KEY = os.getenv("VIRUSTOTAL_API_KEY", "")
    SAFE_BROWSING_API_KEY = os.getenv("SAFE_BROWSING_API_KEY", "")
