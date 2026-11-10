import unittest
from unittest.mock import patch, MagicMock
from bson import ObjectId
import json
import jwt
import bcrypt

from app import app
from utils.auth import hash_password, check_password, generate_jwt, decode_jwt
from models.user_model import UserModel
from config import Config

class TestAuthAndDbFoundation(unittest.TestCase):

    def setUp(self):
        self.app = app
        self.app.config['TESTING'] = True
        self.client = self.app.test_client()

    # ----------------------------------------------------
    # 1. PASSWORD HASHING AND VERIFICATION
    # ----------------------------------------------------
    def test_bcrypt_password_hashing(self):
        password = "SecurePassword@2026"
        hashed = hash_password(password)
        
        self.assertNotEqual(password, hashed)
        self.assertTrue(hashed.startswith("$2b$") or hashed.startswith("$2a$"))
        self.assertTrue(check_password(password, hashed))
        self.assertFalse(check_password("WrongPassword@123", hashed))

    # ----------------------------------------------------
    # 2. OFFLINE DATABASE BEHAVIOR (HONEST 503, NO MOCKING)
    # ----------------------------------------------------
    def test_health_check_reports_offline_db(self):
        with patch('routes.auth_routes.UserModel.get_collection', return_value=None):
            resp = self.client.get('/api/health')
            data = resp.get_json()
            self.assertEqual(resp.status_code, 200)
            self.assertFalse(data.get('database_connected'))
            self.assertEqual(data.get('status'), 'degraded')

    def test_registration_fails_honestly_when_db_offline(self):
        with patch('models.user_model.UserModel.get_collection', return_value=None):
            resp = self.client.post('/api/auth/register', json={
                "name": "Arjun Kumar",
                "email": "arjun@example.com",
                "password": "Password123"
            })
            self.assertEqual(resp.status_code, 503)
            data = resp.get_json()
            self.assertFalse(data.get('success'))
            self.assertIn("Database connection error", data.get('message'))

    def test_login_fails_honestly_when_db_offline(self):
        with patch('models.user_model.UserModel.get_collection', return_value=None):
            resp = self.client.post('/api/auth/login', json={
                "email": "citizen@example.com",
                "password": "Password123"
            })
            self.assertEqual(resp.status_code, 503)
            data = resp.get_json()
            self.assertFalse(data.get('success'))
            self.assertIn("Database connection error", data.get('message'))

    # ----------------------------------------------------
    # 3. BACKDOOR & MOCK TOKEN REMOVAL
    # ----------------------------------------------------
    def test_admin_backdoor_removed(self):
        """Admin backdoor (admin@upisuraksha.gov.in / Admin@12345) must not bypass DB or log in without DB account."""
        with patch('models.user_model.UserModel.get_collection', return_value=None):
            resp = self.client.post('/api/auth/login', json={
                "email": "admin@upisuraksha.gov.in",
                "password": "Admin@12345"
            })
            # Must return 503 (since DB offline) instead of generating fake admin JWT
            self.assertEqual(resp.status_code, 503)
            data = resp.get_json()
            self.assertFalse(data.get('success'))

    def test_mock_jwt_token_rejected(self):
        """Old mock token 'mock_jwt_token_2026' must be rejected as invalid token."""
        resp = self.client.get('/api/auth/profile', headers={
            'Authorization': 'Bearer mock_jwt_token_2026'
        })
        self.assertEqual(resp.status_code, 401)
        data = resp.get_json()
        self.assertFalse(data.get('success'))

    def test_missing_auth_token_rejected(self):
        resp = self.client.get('/api/auth/profile')
        self.assertEqual(resp.status_code, 401)
        data = resp.get_json()
        self.assertFalse(data.get('success'))

    def test_forged_auth_token_rejected(self):
        forged_token = jwt.encode({'user_id': '12345'}, 'wrong_secret', algorithm='HS256')
        resp = self.client.get('/api/auth/profile', headers={
            'Authorization': f'Bearer {forged_token}'
        })
        self.assertEqual(resp.status_code, 401)
        data = resp.get_json()
        self.assertFalse(data.get('success'))

    # ----------------------------------------------------
    # 4. PERSISTENCE & AUTHORIZATION WITH ACTIVE DATABASE
    # ----------------------------------------------------
    def test_real_account_persistence_and_auth_flow(self):
        """Simulate an active database to verify full registration, hashing, login, and authorization flow."""
        fake_storage = {}

        def mock_insert_one(doc):
            doc_copy = dict(doc)
            doc_id = ObjectId()
            doc_copy['_id'] = doc_id
            fake_storage[str(doc_id)] = doc_copy
            mock_res = MagicMock()
            mock_res.inserted_id = doc_id
            return mock_res

        def mock_find_one(query):
            for doc in fake_storage.values():
                if '_id' in query and (str(doc['_id']) == str(query['_id']) or doc['_id'] == query['_id']):
                    return dict(doc)
                if 'email' in query and doc.get('email') == query['email']:
                    return dict(doc)
            return None

        mock_collection = MagicMock()
        mock_collection.insert_one.side_effect = mock_insert_one
        mock_collection.find_one.side_effect = mock_find_one

        with patch('models.user_model.UserModel.get_collection', return_value=mock_collection):
            # 1. Register User
            reg_resp = self.client.post('/api/auth/register', json={
                "name": "Sita Devi",
                "email": "sita@example.com",
                "password": "Password123",
                "phone": "+919876543210",
                "role": "user"
            })
            self.assertEqual(reg_resp.status_code, 201)
            reg_data = reg_resp.get_json()
            self.assertTrue(reg_data.get('success'))
            user_token = reg_data.get('token')
            self.assertIsNotNone(user_token)

            # Verify password was hashed in storage
            stored_user = list(fake_storage.values())[0]
            self.assertEqual(stored_user['email'], 'sita@example.com')
            self.assertNotIn('password', stored_user)
            self.assertTrue(stored_user['password_hash'].startswith('$2b$'))

            # 2. Login with correct password
            login_resp = self.client.post('/api/auth/login', json={
                "email": "sita@example.com",
                "password": "Password123"
            })
            self.assertEqual(login_resp.status_code, 200)
            login_data = login_resp.get_json()
            self.assertTrue(login_data.get('success'))

            # 3. Login with wrong password
            wrong_login = self.client.post('/api/auth/login', json={
                "email": "sita@example.com",
                "password": "WrongPassword"
            })
            self.assertEqual(wrong_login.status_code, 401)

            # 4. Access protected profile
            prof_resp = self.client.get('/api/auth/profile', headers={
                'Authorization': f'Bearer {user_token}'
            })
            self.assertEqual(prof_resp.status_code, 200)
            prof_data = prof_resp.get_json()
            self.assertTrue(prof_data.get('success'))
            self.assertEqual(prof_data['user']['email'], 'sita@example.com')
            # Ensure password hash is not exposed
            self.assertNotIn('password_hash', prof_data['user'])

            # 5. Citizen user attempting to access admin route must be 403 Forbidden
            admin_resp = self.client.get('/api/admin/users', headers={
                'Authorization': f'Bearer {user_token}'
            })
            self.assertEqual(admin_resp.status_code, 403)

if __name__ == '__main__':
    unittest.main()
