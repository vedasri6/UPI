from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from db import init_db, is_db_connected
from routes.auth_routes import auth_bp
from routes.awareness_routes import awareness_bp
from routes.ai_routes import ai_bp

app = Flask(__name__)
app.config.from_object(Config)

# Enable CORS for React frontend integration across all origins
CORS(app, resources={r"/*": {"origins": "*"}})

@app.after_request
def after_request_func(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# Initialize MongoDB Configuration
init_db(app)

# Register Blueprints
app.register_blueprint(auth_bp)
app.register_blueprint(awareness_bp)
app.register_blueprint(ai_bp)

# Global JSON Error Handlers (No HTML Stack Traces)
@app.errorhandler(404)
def not_found_error(error):
    return jsonify({
        "success": False,
        "error": "Requested API endpoint not found",
        "status_code": 404
    }), 404

@app.errorhandler(405)
def method_not_allowed_error(error):
    return jsonify({
        "success": False,
        "error": "HTTP method not allowed for this route",
        "status_code": 405
    }), 405

@app.errorhandler(500)
def internal_server_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server processing error",
        "status_code": 500
    }), 500

@app.errorhandler(400)
def bad_request_error(error):
    return jsonify({
        "success": False,
        "error": "Bad request or invalid JSON payload",
        "status_code": 400
    }), 400

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        "status": "online",
        "app": "UPI Suraksha Mitra API",
        "version": "4.0.0",
        "tagline": "Protecting Every Payment",
        "message": "Production Ready AI Cyber Fraud Assistant APIs active."
    })

@app.route('/api/health', methods=['GET'])
def health_check():
    db_connected = is_db_connected()
    return jsonify({
        "status": "healthy" if db_connected else "degraded",
        "database_connected": db_connected,
        "mode": "Production Ready Cyber Safety Platform"
    }), 200

if __name__ == '__main__':
    print("Starting UPI Suraksha Mitra Flask Backend on http://localhost:5000")
    app.run(host='0.0.0.0', port=5000, debug=Config.DEBUG)
