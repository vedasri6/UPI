from datetime import datetime, timezone
from bson import ObjectId
from db import get_db

class AIChatModel:
    @staticmethod
    def get_collection():
        db = get_db()
        if db is not None:
            return db.AIChats
        return None

    @classmethod
    def save_chat(cls, user_id, question, answer, language="en", category="chat"):
        collection = cls.get_collection()
        now = datetime.now(timezone.utc)
        
        doc = {
            "userId": str(user_id or "anonymous"),
            "question": question,
            "answer": answer,
            "language": language,
            "category": category,
            "timestamp": now,
            "createdAt": now
        }

        if collection is not None:
            try:
                res = collection.insert_one(doc)
                doc["_id"] = str(res.inserted_id)
            except Exception:
                doc["_id"] = "mock_chat_id_" + str(int(now.timestamp()))
        else:
            doc["_id"] = "mock_chat_id_" + str(int(now.timestamp()))

        if isinstance(doc.get("timestamp"), datetime):
            doc["timestamp"] = doc["timestamp"].isoformat()
        if isinstance(doc.get("createdAt"), datetime):
            doc["createdAt"] = doc["createdAt"].isoformat()

        return doc

    @classmethod
    def get_user_history(cls, user_id, limit=50):
        collection = cls.get_collection()
        history = []
        if collection is not None:
            try:
                cursor = collection.find({"userId": str(user_id)}).sort("timestamp", -1).limit(limit)
                for item in cursor:
                    item["_id"] = str(item["_id"])
                    if isinstance(item.get("timestamp"), datetime):
                        item["timestamp"] = item["timestamp"].isoformat()
                    history.append(item)
            except Exception:
                pass
        return history

    @classmethod
    def delete_user_history(cls, user_id):
        collection = cls.get_collection()
        if collection is not None:
            try:
                collection.delete_many({"userId": str(user_id)})
                return True
            except Exception:
                return False
        return True
