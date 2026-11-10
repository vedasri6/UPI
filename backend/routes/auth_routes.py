import jwt
import datetime
import re
from functools import wraps
from flask import Blueprint, request, jsonify, current_app
from models.user_model import UserModel
from config import Config

auth_bp = Blueprint('auth', __name__)

# JWT Middleware Helper
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Authorization Token is missing!', 'success': False}), 401
        
        try:
            secret = current_app.config.get('SECRET_KEY', Config.SECRET_KEY)
            data = jwt.decode(token, secret, algorithms=["HS256"])
            current_user = UserModel.find_by_id(data['user_id'])
            if not current_user:
                return jsonify({'message': 'User session is invalid or user account not found.', 'success': False}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Session expired. Please log in again.', 'success': False}), 401
        except ConnectionError:
            return jsonify({'message': 'Database connection error. Service temporarily unavailable.', 'success': False}), 503
        except Exception as e:
            return jsonify({'message': f'Invalid Token: {str(e)}', 'success': False}), 401

        return f(current_user, *args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    @token_required
    def decorated(current_user, *args, **kwargs):
        user_role = current_user.get('role') if isinstance(current_user, dict) else current_user.role
        if user_role != 'admin':
            return jsonify({'message': 'Admin privileges required!', 'success': False}), 403
        return f(current_user, *args, **kwargs)
    return decorated


def generate_token(user_doc):
    secret = current_app.config.get('SECRET_KEY', Config.SECRET_KEY)
    payload = {
        'user_id': str(user_doc['_id']),
        'email': user_doc.get('email'),
        'name': user_doc.get('name') or user_doc.get('full_name'),
        'role': user_doc.get('role', 'user'),
        'exp': datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, secret, algorithm="HS256")


# Helper for email format validation
def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None


# 1. REGISTER API: POST /api/auth/register
@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    name = (data.get('name') or data.get('full_name') or '').strip()
    email = (data.get('email') or '').lower().strip()
    password = data.get('password', '')
    phone = (data.get('phone') or '').strip()
    village = (data.get('village') or '').strip()
    district = (data.get('district') or '').strip()
    state = (data.get('state') or '').strip()
    language = data.get('language', 'en')
    theme = data.get('theme', 'light')
    role = data.get('role', 'user')
    profile_photo = data.get('profilePhoto', '')

    # Input Validations
    if not name or not email or not password:
        return jsonify({'message': 'Name, Email, and Password are required!', 'success': False}), 400

    if not is_valid_email(email):
        return jsonify({'message': 'Please provide a valid email address!', 'success': False}), 400

    if len(password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters long!', 'success': False}), 400

    try:
        # Duplicate Email Validation
        existing_user_email = UserModel.find_by_email(email)
        if existing_user_email:
            return jsonify({'message': 'An account with this email address already exists!', 'success': False}), 409

        # Duplicate Phone Validation (if phone provided)
        if phone:
            existing_user_phone = UserModel.find_by_phone(phone)
            if existing_user_phone:
                return jsonify({'message': 'An account with this mobile phone number already exists!', 'success': False}), 409

        # Create User in MongoDB Users Collection
        user = UserModel.create_user(
            name=name,
            email=email,
            password=password,
            phone=phone,
            village=village,
            district=district,
            state=state,
            language=language,
            theme=theme,
            role=role,
            profilePhoto=profile_photo
        )
    except ConnectionError as conn_err:
        return jsonify({
            'message': 'Database connection error. Please ensure MongoDB is running or configure MONGO_URI in backend/.env.',
            'success': False
        }), 503
    except Exception as db_err:
        return jsonify({
            'message': f'Failed to process registration: {str(db_err)}',
            'success': False
        }), 500

    if not user or not user.get('_id'):
        return jsonify({'message': 'Failed to create user in database.', 'success': False}), 500

    token = generate_token(user)

    return jsonify({
        'success': True,
        'message': 'Registration successful! Welcome to UPI Suraksha Mitra.',
        'token': token,
        'verification_code': '123456',
        'user': UserModel.to_dict(user)
    }), 201


# 2. LOGIN API: POST /api/auth/login
@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = (data.get('email') or '').lower().strip()
    password = data.get('password', '')

    if not email or not password:
        return jsonify({'message': 'Email and Password are required!', 'success': False}), 400

    try:
        user = UserModel.find_by_email(email)
    except ConnectionError:
        return jsonify({
            'message': 'Database connection error. Please ensure MongoDB is running or configure MONGO_URI in backend/.env.',
            'success': False
        }), 503
    except Exception as e:
        return jsonify({
            'message': f'Database query error: {str(e)}',
            'success': False
        }), 500

    if not user:
        return jsonify({'message': 'Invalid email or password credentials!', 'success': False}), 401

    # Verify bcrypt password against stored hash
    pwd_hash = user.get('passwordHash') or user.get('password_hash')
    if not pwd_hash or not UserModel.verify_password(password, pwd_hash):
        return jsonify({'message': 'Invalid email or password credentials!', 'success': False}), 401

    token = generate_token(user)
    return jsonify({
        'success': True,
        'message': 'Login successful! Welcome back.',
        'token': token,
        'user': UserModel.to_dict(user)
    }), 200



# 3. LOGOUT API: POST /api/auth/logout
@auth_bp.route('/api/auth/logout', methods=['POST'])
def logout():
    return jsonify({
        'success': True,
        'message': 'Logged out successfully from UPI Suraksha Mitra.'
    }), 200


# 4. FORGOT PASSWORD API: POST /api/auth/forgot-password
@auth_bp.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.get_json() or {}
    email = data.get('email')

    if not email:
        return jsonify({'message': 'Email address is required!', 'success': False}), 400

    if not is_valid_email(email):
        return jsonify({'message': 'Please enter a valid email address!', 'success': False}), 400

    try:
        user = UserModel.find_by_email(email)
        reset_token = "RESET_" + datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        
        if user:
            UserModel.set_reset_token(email, reset_token)

        return jsonify({
            'success': True,
            'message': 'If an account exists with this email, password reset instructions have been generated.',
            'reset_token': reset_token
        }), 200
    except ConnectionError:
        return jsonify({'message': 'Database connection error. MongoDB is offline.', 'success': False}), 503


# 5. RESET PASSWORD API: POST /api/auth/reset-password
@auth_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.get_json() or {}
    reset_token = data.get('reset_token') or data.get('token')
    new_password = data.get('new_password') or data.get('password')

    if not reset_token or not new_password:
        return jsonify({'message': 'Reset token and new password are required!', 'success': False}), 400

    if len(new_password) < 6:
        return jsonify({'message': 'New password must be at least 6 characters long!', 'success': False}), 400

    try:
        success = UserModel.update_password_by_token(reset_token, new_password)
        if not success:
            return jsonify({'message': 'Invalid or expired reset token!', 'success': False}), 400
        return jsonify({
            'success': True,
            'message': 'Password has been reset successfully! You can now log in with your new password.'
        }), 200
    except ConnectionError:
        return jsonify({'message': 'Database connection error. MongoDB is offline.', 'success': False}), 503


# 6. GET PROFILE API: GET /api/auth/profile (PROTECTED)
# 7. UPDATE PROFILE API: PUT /api/auth/profile (PROTECTED)
@auth_bp.route('/api/auth/profile', methods=['GET', 'PUT'])
@token_required
def profile(current_user):
    user_id = str(current_user.get('_id') if isinstance(current_user, dict) and '_id' in current_user else current_user.get('id', ''))

    try:
        if request.method == 'GET':
            db_user = UserModel.find_by_id(user_id) if user_id else current_user
            target_user = db_user if db_user else current_user
            return jsonify({
                'success': True,
                'user': UserModel.to_dict(target_user)
            }), 200

        # PUT Method - Update profile details
        data = request.get_json() or {}
        
        # Check phone duplicate if changing phone
        new_phone = data.get('phone')
        if new_phone and new_phone.strip():
            existing_phone_user = UserModel.find_by_phone(new_phone)
            if existing_phone_user and str(existing_phone_user.get('_id')) != user_id:
                return jsonify({'message': 'This phone number is already registered to another user!', 'success': False}), 409

        update_fields = {}
        for key in ['name', 'full_name', 'phone', 'village', 'district', 'state', 'language', 'theme', 'profilePhoto']:
            if key in data:
                update_fields[key] = data[key]

        if 'name' in update_fields or 'full_name' in update_fields:
            val = update_fields.get('name') or update_fields.get('full_name')
            update_fields['name'] = val
            update_fields['full_name'] = val

        UserModel.update_user_profile(user_id, update_fields)
        updated_user = UserModel.find_by_id(user_id)
        
        if not updated_user and isinstance(current_user, dict):
            current_user.update(update_fields)
            updated_user = current_user

        return jsonify({
            'success': True,
            'message': 'Profile updated successfully!',
            'user': UserModel.to_dict(updated_user)
        }), 200
    except ConnectionError:
        return jsonify({'message': 'Database connection error. MongoDB is offline.', 'success': False}), 503


# ADMIN USERS LIST API: GET /api/admin/users (PROTECTED ADMIN)
@auth_bp.route('/api/admin/users', methods=['GET'])
@admin_required
def get_all_users(current_user):
    collection = UserModel.get_collection()
    if collection is None:
        return jsonify({'message': 'Database connection error. MongoDB is offline or unconfigured.', 'success': False}), 503
    try:
        users_list = []
        for u in collection.find():
            users_list.append(UserModel.to_dict(u))
        return jsonify({
            'success': True,
            'count': len(users_list),
            'users': users_list
        }), 200
    except Exception as e:
        return jsonify({'message': f'Database query error: {str(e)}', 'success': False}), 500

