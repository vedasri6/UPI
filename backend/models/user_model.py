import bcrypt
from datetime import datetime, timezone
from bson import ObjectId
from pymongo.errors import PyMongoError, ServerSelectionTimeoutError
from db import get_db, is_db_connected

class UserModel:
    @staticmethod
    def get_collection():
        db = get_db()
        if db is not None:
            return db.users
        return None

    @staticmethod
    def hash_password(password: str) -> str:
        salt = bcrypt.gensalt()
        hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        if not password or not hashed_password:
            return False
        try:
            return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
        except Exception:
            return False

    @classmethod
    def find_by_email(cls, email: str):
        collection = cls.get_collection()
        if not email:
            return None
        if collection is None:
            raise ConnectionError("MongoDB is offline or unreachable.")
        return collection.find_one({"email": email.lower().strip()})

    @classmethod
    def find_by_phone(cls, phone: str):
        collection = cls.get_collection()
        if not phone:
            return None
        if collection is None:
            raise ConnectionError("MongoDB is offline or unreachable.")
        return collection.find_one({"phone": phone.strip()})

    @classmethod
    def find_by_id(cls, user_id: str):
        collection = cls.get_collection()
        if not user_id:
            return None
        if collection is None:
            raise ConnectionError("MongoDB is offline or unreachable.")
        try:
            return collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            try:
                return collection.find_one({"_id": user_id})
            except Exception:
                return None

    @classmethod
    def create_user(cls, name, email, password, phone="", village="", district="", state="", language="en", theme="light", role="user", profilePhoto=""):
        collection = cls.get_collection()
        if collection is None:
            raise ConnectionError("MongoDB is offline or unreachable. Cannot create persisted user.")

        hashed_pwd = cls.hash_password(password)
        now = datetime.now(timezone.utc)

        user_doc = {
            "name": name.strip(),
            "full_name": name.strip(), # Alias for compatibility
            "email": email.lower().strip(),
            "phone": phone.strip(),
            "village": village.strip(),
            "district": district.strip(),
            "state": state.strip(),
            "passwordHash": hashed_pwd,
            "password_hash": hashed_pwd, # Alias
            "language": language,
            "theme": theme,
            "role": role if role in ['user', 'volunteer', 'admin'] else 'user',
            "profilePhoto": profilePhoto or f"https://api.dicebear.com/7.x/bottts/svg?seed={email.lower().strip()}",
            "is_verified": False,
            "verification_code": "123456",
            "reset_token": None,
            "createdAt": now,
            "created_at": now,
            "updatedAt": now,
            "updated_at": now
        }

        result = collection.insert_one(user_doc)
        user_doc["_id"] = result.inserted_id
        return user_doc

    @classmethod
    def update_user_profile(cls, user_id: str, update_data: dict):
        collection = cls.get_collection()
        if collection is None:
            raise ConnectionError("MongoDB is offline or unreachable.")

        update_data['updatedAt'] = datetime.now(timezone.utc)
        update_data['updated_at'] = datetime.now(timezone.utc)
        
        if 'name' in update_data:
            update_data['full_name'] = update_data['name']
        elif 'full_name' in update_data:
            update_data['name'] = update_data['full_name']

        try:
            collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
        except Exception:
            collection.update_one(
                {"_id": user_id},
                {"$set": update_data}
            )
        return True

    @classmethod
    def update_verification_status(cls, email: str, is_verified: bool = True):
        collection = cls.get_collection()
        if collection is None:
            raise ConnectionError("MongoDB is offline or unreachable.")
        now = datetime.now(timezone.utc)
        collection.update_one(
            {"email": email.lower().strip()},
            {"$set": {"is_verified": is_verified, "updatedAt": now, "updated_at": now}}
        )

    @classmethod
    def set_reset_token(cls, email: str, reset_token: str):
        collection = cls.get_collection()
        if collection is None:
            raise ConnectionError("MongoDB is offline or unreachable.")
        now = datetime.now(timezone.utc)
        collection.update_one(
            {"email": email.lower().strip()},
            {"$set": {"reset_token": reset_token, "updatedAt": now, "updated_at": now}}
        )

    @classmethod
    def update_password_by_token(cls, reset_token: str, new_password: str):
        collection = cls.get_collection()
        if collection is None:
            raise ConnectionError("MongoDB is offline or unreachable.")
        hashed_pwd = cls.hash_password(new_password)
        user = collection.find_one({"reset_token": reset_token})
        if user:
            now = datetime.now(timezone.utc)
            collection.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "passwordHash": hashed_pwd,
                    "password_hash": hashed_pwd,
                    "reset_token": None,
                    "updatedAt": now,
                    "updated_at": now
                }}
            )
            return True
        return False

    @classmethod
    def to_dict(cls, user_doc):
        if not user_doc:
            return None
        
        name_val = user_doc.get("name") or user_doc.get("full_name") or ""
        created_val = user_doc.get("createdAt") or user_doc.get("created_at")
        updated_val = user_doc.get("updatedAt") or user_doc.get("updated_at")

        return {
            "id": str(user_doc.get("_id", "")),
            "name": name_val,
            "full_name": name_val,
            "email": user_doc.get("email", ""),
            "phone": user_doc.get("phone", ""),
            "village": user_doc.get("village", ""),
            "district": user_doc.get("district", ""),
            "state": user_doc.get("state", ""),
            "language": user_doc.get("language", "en"),
            "theme": user_doc.get("theme", "light"),
            "role": user_doc.get("role", "user"),
            "profilePhoto": user_doc.get("profilePhoto") or user_doc.get("profile_photo") or f"https://api.dicebear.com/7.x/bottts/svg?seed={user_doc.get('email', 'user')}",
            "is_verified": user_doc.get("is_verified", False),
            "createdAt": created_val.isoformat() if isinstance(created_val, datetime) else str(created_val or ""),
            "updatedAt": updated_val.isoformat() if isinstance(updated_val, datetime) else str(updated_val or "")
        }

