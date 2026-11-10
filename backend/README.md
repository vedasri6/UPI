# UPI Suraksha Mitra - Backend (Python Flask)

Basic backend structure and MongoDB configuration for **UPI Suraksha Mitra** ("Protecting Every Payment").

## Requirements
- Python 3.8+
- MongoDB (optional for Step 1, connection string configured in `config.py`)

## Setup & Execution Instructions

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows PowerShell:
   .\venv\Scripts\Activate.ps1
   # On Linux/macOS:
   source venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the Flask application:
   ```bash
   python app.py
   ```

5. Access the API:
   - Base URL: `http://localhost:5000/`
   - Health Check: `http://localhost:5000/api/health`
