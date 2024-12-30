# app.py
from flask import Flask, request, jsonify
import requests
import os
from werkzeug.utils import secure_filename
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from models import db, User
from config import Config
import ssl

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
CORS(app)

with app.app_context():
    db.create_all()

@app.route('/register', methods=['POST'])
def register():
    data = request.form
    email = data.get('email')
    password = data.get('password')
    confirm = data.get('confirm')

    if not all([email, password, confirm]):
        return jsonify({'status': 'Failed', 'error': 'All fields are required'})

    if password != confirm:
        return jsonify({'status': 'Failed', 'error': 'Passwords do not match'})

    if User.query.filter_by(email=email).first():
        return jsonify({'status': 'Failed', 'error': 'Email already registered'})

    try:
        user = User(email=email)
        user.set_password(password)
        db.session.add(user)
        db.session.commit()

        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'status': 'Success',
            'id': user.id,
            'email': user.email,
            'token': access_token
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'Failed', 'error': str(e)})

@app.route('/login', methods=['POST'])
def login():
    data = request.form
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({'status': 'Failed', 'error': 'All fields are required'})

    try:
        user = User.query.filter_by(email=email).first()

        if not user or not user.check_password(password):
            return jsonify({'status': 'Failed', 'error': 'Invalid email or password'})

        access_token = create_access_token(identity=user.id)
        
        return jsonify({
            'status': 'Success',
            'id': user.id,
            'email': user.email,
            'token': access_token
        })

    except Exception as e:
        return jsonify({'status': 'Failed', 'error': str(e)})

@app.route('/protected', methods=['GET'])
@jwt_required()
def protected():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    return jsonify(user.to_dict())


# Add these imports to your existing imports
from flask_jwt_extended import jwt_required
from werkzeug.datastructures import FileStorage

# Add this route to your existing Flask app


@app.route('/api/file', methods=['POST'])
def upload_and_scan():
    # VirusTotal API settings
    VT_API_KEY = "86175b92e02fd2dcca45f5182bbcf1a5f181cefeb050f6e818af683f3f8f2d56"
    VT_API_URL = "https://www.virustotal.com/api/v3/files"  
    try:
        # Check if file is present in the request
        if 'file' not in request.files:
            return jsonify({"status": "Failed", "message": "No file uploaded"}), 400

        # Get the uploaded file
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({"status": "Failed", "message": "No file selected"}), 400
        
        # Secure the filename
        filename = secure_filename(file.filename)
        
        # Prepare file for VirusTotal upload
        files = {'file': (filename, file.stream, file.mimetype)}
        headers = {"x-apikey": VT_API_KEY}

        # Send the file to VirusTotal
        vt_response = requests.post(VT_API_URL, headers=headers, files=files)
        
        if vt_response.status_code != 200:
            return jsonify({"status": "Failed", "message": "VirusTotal API error", "details": vt_response.text}), 500

        # Extract the scan ID from the response
        vt_data = vt_response.json()
        scan_id = vt_data.get("data", {}).get("id")

        if not scan_id:
            return jsonify({"status": "Failed", "message": "Failed to retrieve scan ID"}), 500

        # Get analysis results (this can take a while, so optionally poll until ready)
        analysis_url = f"https://www.virustotal.com/api/v3/analyses/{scan_id}"
        analysis_response = requests.get(analysis_url, headers=headers)

        if analysis_response.status_code != 200:
            return jsonify({"status": "Failed", "message": "Failed to get analysis results", "details": analysis_response.text}), 500

        analysis_data = analysis_response.json()
        return jsonify({
            "status": "Success",
            "data": analysis_data
        })

    except Exception as e:
        return jsonify({"status": "Failed", "message": "An error occurred", "details": str(e)}), 500

@app.route('/api/url', methods=['POST'])
def scan_url():
    # VirusTotal API settings
    VT_API_KEY = "86175b92e02fd2dcca45f5182bbcf1a5f181cefeb050f6e818af683f3f8f2d56"
    VT_API_URL = "https://www.virustotal.com/api/v3/urls"
    try:
        # Get the URL from the form data
        url_to_scan = request.form.get('url')
        print(url_to_scan)
        if not url_to_scan:
            return jsonify({"status": "Failed", "message": "No URL provided"}), 400

        # Encode the URL for VirusTotal (required by their API)
        encoded_url = requests.utils.quote(url_to_scan, safe='')

        # Send the URL to VirusTotal for scanning
        headers = {"x-apikey": VT_API_KEY}
        payload = {"url": url_to_scan}

        vt_response = requests.post(VT_API_URL, headers=headers, data=payload)

        if vt_response.status_code != 200:
            return jsonify({"status": "Failed", "message": "VirusTotal API error", "details": vt_response.text}), 500

        # Extract the scan ID from the response
        vt_data = vt_response.json()
        scan_id = vt_data.get("data", {}).get("id")

        if not scan_id:
            return jsonify({"status": "Failed", "message": "Failed to retrieve scan ID"}), 500

        # Get analysis results (this can take a while, so optionally poll until ready)
        analysis_url = f"https://www.virustotal.com/api/v3/analyses/{scan_id}"
        analysis_response = requests.get(analysis_url, headers=headers)

        if analysis_response.status_code != 200:
            return jsonify({"status": "Failed", "message": "Failed to get analysis results", "details": analysis_response.text}), 500

        analysis_data = analysis_response.json()
        return jsonify({
            "status": "Success",
            "data": analysis_data
        })

    except Exception as e:
        return jsonify({"status": "Failed", "message": "An error occurred", "details": str(e)}), 500

# Add error handlers
@app.errorhandler(413)  # Payload Too Large
def too_large(e):
    return jsonify({'error': 'File is too large'}), 413

@app.errorhandler(400)  # Bad Request
def bad_request(e):
    return jsonify({'error': 'Bad request'}), 400

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002,debug=True)















