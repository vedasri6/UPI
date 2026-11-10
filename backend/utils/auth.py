import jwt
import bcrypt
from datetime import datetime, timedelta, timezone
from functools import wraps
from flask import request, jsonify, g
from config import Config
from db import get_db

def hash_password(password: str) -> str:
    """Hashes a plaintext password using bcrypt."""
    salt = bcrypt.gensalt(12)
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    return hashed.decode('utf-8')

def check_password(password: str, hashed_password: str) -> bool:
    """Verifies a plaintext password against a bcrypt hash."""
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    except Exception:
        return False

def generate_jwt(user_id: str, role: str = 'user', remember_me: bool = False) -> str:
    """Generates a signed JWT authentication token."""
    days = 7 if remember_me else 1
    expiration = datetime.now(timezone.utc) + timedelta(days=days)
    payload = {
        'sub': str(user_id),
        'role': role,
        'iat': datetime.now(timezone.utc),
        'exp': expiration
    }
    return jwt.encode(payload, Config.SECRET_KEY, algorithm='HS256')

def decode_jwt(token: str):
    """Decodes and validates a JWT token."""
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=['HS256'])
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

def token_required(f):
    """Decorator to protect API routes requiring valid JWT token."""
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header and auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            
        if not token:
            # Fallback to query parameter or cookie if needed
            token = request.args.get('token')

        if not token:
            return jsonify({
                "success": False,
                "message": "Authentication token missing. Please log in."
            }), 401

        payload = decode_jwt(token)
        if not payload:
            return jsonify({
                "success": False,
                "message": "Token expired or invalid. Please log in again."
            }), 401

        db = get_db()
        if db is None:
            return jsonify({
                "success": False,
                "message": "Database is offline. Service temporarily unavailable."
            }), 503

        from bson.objectid import ObjectId
        try:
            user = db.users.find_one({"_id": ObjectId(payload['sub'])})
        except Exception:
            user = db.users.find_one({"_id": payload['sub']})

        if not user:
            return jsonify({
                "success": False,
                "message": "User associated with token not found."
            }), 404
        
        # Format user dict for request context
        user['_id'] = str(user['_id'])
        user.pop('password_hash', None)
        g.user = user

        return f(*args, **kwargs)
    return decorated

def admin_required(f):
    """Decorator to enforce admin privileges on routes."""
    @wraps(f)
    def decorated(*args, **kwargs):
        if not hasattr(g, 'user') or g.user.get('role') != 'admin':
            return jsonify({
                "success": False,
                "message": "Admin privileges required to access this resource."
            }), 403
        return f(*args, **kwargs)
    return decorated
