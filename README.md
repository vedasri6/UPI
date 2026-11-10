# UPI Suraksha Mitra - Community Fraud Prevention & Awareness Platform

**Brand Name**: UPI Suraksha Mitra  
**Tagline**: Protecting Every Payment  
**Objective**: Clean, modern, premium, responsive, multilingual web platform empowering rural citizens, senior citizens, students, shopkeepers, and first-time digital payment users against UPI scams and cyber frauds.

---

## 🌟 Step 1 & Step 2 Completed Features

### 1. Frontend Capabilities
- **Official-Style Modern SVG Logo**: Security Shield + Digital Lock + UPI motif emblem.
- **Multilingual Support (3 Languages)**:
  - 🇬🇧 English
  - 🇮🇳 తెలుగు (Telugu)
  - 🇮🇳 हिन्दी (Hindi)
  - Live full-page translation with `LocalStorage` persistence.
- **Light & Dark Mode**: Persistent theme state with smooth CSS transitions.
- **Sticky Responsive Navbar**: With quick-dial 1930 Emergency Helpline badge, auth status badges, and mobile drawer.
- **Interactive Cyber Safety Tools**:
  - 🤖 **`/ai-assistant`**: AI message & phishing link risk analyzer.
  - 🔍 **`/qr-scanner`**: Safe QR Code scanner simulator.
  - 🛡️ **`/upi-verifier`**: VPA & UPI ID verifier.
  - 🔔 **`/alerts`**: Regional live cyber scam alert feed.
  - 📚 **`/awareness-hub`**: Multilingual audio guides and video resources.
  - 📞 **`/emergency`**: Direct tap-to-dial portal for National Helpline `1930`.
  - 📝 **`/report-scam`**: Community scam number submission portal.
  - 🏆 **`/quiz`**: Interactive digital safety certification quiz.
- **Complete Authentication Module**:
  - 🔑 **`/login`**: Citizen login with Remember Me, Show/Hide Password, & Quick Demo buttons.
  - 📝 **`/register`**: Registration with Password Strength Meter & Real-time validation.
  - ✉️ **`/verify-email`**: 6-Digit OTP code verification (`123456`).
  - 🔑 **`/forgot-password`**: Password reset token requester.
  - 🔒 **`/reset-password`**: Secure password update form.
  - 👤 **`/profile`**: Citizen security profile & info management.
  - 📊 **`/dashboard`**: Personalized user security health dashboard.
  - ⚙️ **`/admin-dashboard`**: National Cyber Cell Control Center & User directory manager.

---

### 2. Backend Capabilities (Python Flask + MongoDB)
- **JWT Token Authentication**: 7-day token issuance & `token_required` protection middleware.
- **Bcrypt Password Hashing**: Secure salted password encryption.
- **Role-Based Authorization**: Distinct `user` and `admin` permissions with `@admin_required`.
- **MongoDB Data Layer**: PyMongo integration in `models/user_model.py`.
- **API Endpoints**:
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `POST /api/auth/verify-email`
  - `POST /api/auth/forgot-password`
  - `POST /api/auth/reset-password`
  - `GET & PUT /api/auth/profile` (Protected)
  - `GET /api/admin/users` (Admin Protected)

---

## 🚀 How to Run Locally

### 1. Running the Frontend (React + Vite + Tailwind CSS)

```bash
# Navigate into the frontend folder
cd frontend

# Install Node modules
npm install

# Start the Vite development server
npm run dev
```
Open **`http://localhost:3000`**.

---

### 2. Running the Backend (Python Flask)

```bash
# Navigate into the backend folder
cd backend

# Install Python packages
pip install -r requirements.txt

# Start the Flask app
python app.py
```
The Flask backend will run on **`http://localhost:5000`**.
