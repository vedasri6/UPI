from pymongo import MongoClient
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError, ConfigurationError
from config import Config
import logging

logger = logging.getLogger(__name__)

db_client = None
db = None
_db_connected = False

def init_db(app):
    global db_client, db, _db_connected
    try:
        mongo_uri = app.config.get("MONGO_URI", Config.MONGO_URI)
        db_client = MongoClient(mongo_uri, serverSelectionTimeoutMS=2000)
        try:
            db = db_client.get_default_database()
        except (ConfigurationError, Exception):
            db = db_client.get_database("upisurakshamitra_db")
        # Verify genuine connectivity with ping
        db_client.admin.command('ping')
        _db_connected = True
        logger.info("MongoDB Connected successfully")
    except (ServerSelectionTimeoutError, PyMongoError) as e:
        _db_connected = False
        logger.warning(f"MongoDB Server Offline or Unreachable: {str(e)}")
    except Exception as e:
        _db_connected = False
        logger.warning(f"MongoDB Initialization Warning: {str(e)}")

def get_db():
    return db

def is_db_connected():
    global _db_connected, db_client
    if not _db_connected or db_client is None:
        return False
    try:
        db_client.admin.command('ping')
        _db_connected = True
        return True
    except Exception:
        _db_connected = False
        return False

