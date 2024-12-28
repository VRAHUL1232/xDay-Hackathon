from flask import Flask, request, jsonify, json
from werkzeug.utils import secure_filename
from flask_cors import CORS
import os
import time
import shutil
import threading
from concurrent.futures import ThreadPoolExecutor
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
import sqlite3
import uuid

app = Flask(__name__)
CORS(app)

# Path to save consolidated scan results
RESULTS_FILE = os.path.join(os.getcwd(), "consolidated_scan_results.json")

# Path to save the folder path
FOLDER_PATH_FILE = 'C:\\Users\\Legion\\Desktop\\SIH\\HADAP\\SIH-PROJECT\\backend\\config.json'

# Global variable to store monitored folder path
MONITOR_FOLDER_PATH = None

# Path to VM3 (Shared directory)
UPLOAD_FOLDER = r"\\192.168.56.2\input_files"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Database initialization path
DATABASE = './database.db'

# Watchdog Handler
class FolderMonitorHandler(FileSystemEventHandler):
    def on_created(self, event):
        """
        Triggered when a new file is created in the monitored directory.
        """
        if not event.is_directory:
            file_path = event.src_path
            try:
                # Move the file to the upload folder
                filename = os.path.basename(file_path)
                destination_path = os.path.join(UPLOAD_FOLDER, filename)
                shutil.move(file_path, destination_path)
                print(f"File moved: {file_path} -> {destination_path}")
            except Exception as e:
                print(f"Error moving file {file_path}: {e}")

# Watchdog Thread Function
def start_watchdog():
    """
    Starts the watchdog to monitor MONITOR_FOLDER_PATH.
    """
    global MONITOR_FOLDER_PATH
    while MONITOR_FOLDER_PATH is None:
        time.sleep(1)  # Wait until the folder path is set

    event_handler = FolderMonitorHandler()
    observer = Observer()
    observer.schedule(event_handler, MONITOR_FOLDER_PATH, recursive=False)
    print(f"Started monitoring: {MONITOR_FOLDER_PATH}")

    observer.start()
    try:
        while True:
            time.sleep(1)  # Keep the thread running
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

# Start Watchdog in a Separate Thread
watchdog_thread = threading.Thread(target=start_watchdog, daemon=True)
watchdog_thread.start()

@app.route('/set_folder_path', methods=['POST'])
def set_folder_path():
    global MONITOR_FOLDER_PATH
    data = request.get_json()
    folder_path = data.get('folderPath')
    if folder_path:
        config = {'folderPath': folder_path}
        try:
            with open(FOLDER_PATH_FILE, 'w') as file:
                json.dump(config, file)
            MONITOR_FOLDER_PATH = folder_path
            print(f"Folder path set and saved: {folder_path}")
            return jsonify({'status': 'success', 'message': 'Folder path saved successfully'}), 200
        except Exception as e:
            print(f"Error saving folder path: {e}")
            return jsonify({'status': 'error', 'message': str(e)}), 500
    else:
        print("No folder path provided.")
        return jsonify({'status': 'error', 'message': 'No folder path provided'}), 400


@app.route('/upload_files', methods=['POST'])
def upload_files():
    """
    Endpoint to upload files to the UPLOAD_FOLDER and simulate scanning.
    """
    if 'files' not in request.files:
        return jsonify({'status': 'error', 'message': 'No files provided in the request.'}), 400

    try:
        uploaded_files = []
        single_files = request.files.getlist('files')

        for single_file in single_files:
            if single_file.filename:
                # Secure the filename
                filename = secure_filename(single_file.filename)
                file_path = os.path.join(UPLOAD_FOLDER, filename)
                single_file.save(file_path)
                uploaded_files.append(file_path)

        # Simulate file scanning with thread pool
        def scan_file(file_path):
            # Placeholder for scanning logic
            return {"file": file_path, "status": "processed"}

        with ThreadPoolExecutor() as executor:
            results = list(executor.map(scan_file, uploaded_files))

        return jsonify({'status': 'success', 'message': 'Files uploaded and scanned successfully', 'results': results}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/upload_file_paths', methods=['POST'])
def upload_file_paths():
    try:
        file_paths = request.json.get('filePaths', [])
        for file_path in file_paths:
            filename = os.path.basename(file_path)
            conn = sqlite3.connect(DATABASE)  # Replace with your actual database path
            cursor = conn.cursor()
            cursor.execute('INSERT INTO HOSTdata (filename, filepath) VALUES (?, ?)', (filename, file_path))
            conn.commit()
            conn.close()

        return jsonify({'status': 'success', 'message': 'File paths uploaded successfully'}), 200
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/upload_results', methods=['POST'])
def upload_results():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "No data provided"}), 400

    vm1_data = data.get("VM1", {}).get("data", {})
    vm2_data = data.get("VM2", {}).get("data", {})

    conn = sqlite3.connect('database.db')
    cursor = conn.cursor()

    try:
        for file_name, vm1_file_data in vm1_data.items():
            if file_name == "summary":
                continue

            vm2_file_data = vm2_data.get(file_name, {})

            cursor.execute('''
                INSERT INTO ScanData (id, file_name, file_extension, file_path, file_size, sha1, sha256, 
                                      finish_time_vm1, scan_time_vm1, infected_vm1, threats_vm1, 
                                      finish_time_vm2, scan_time_vm2, infected_vm2, threats_vm2)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    file_name=excluded.file_name,
                    file_extension=excluded.file_extension,
                    file_path=excluded.file_path,
                    file_size=excluded.file_size,
                    sha1=excluded.sha1,
                    sha256=excluded.sha256,
                    finish_time_vm1=excluded.finish_time_vm1,
                    scan_time_vm1=excluded.scan_time_vm1,
                    infected_vm1=excluded.infected_vm1,
                    threats_vm1=excluded.threats_vm1,
                    finish_time_vm2=excluded.finish_time_vm2,
                    scan_time_vm2=excluded.scan_time_vm2,
                    infected_vm2=excluded.infected_vm2,
                    threats_vm2=excluded.threats_vm2;
            ''', (
                str(uuid.uuid4()),  # Unique ID
                vm1_file_data["file_name"],
                vm1_file_data["file_extension"],
                vm1_file_data["file_path"],
                vm1_file_data["file_size"],
                vm1_file_data["sha1"],
                vm1_file_data["sha256"],
                vm1_file_data.get("finish-time"),
                vm1_file_data.get("scan_time"),
                vm1_file_data.get("infected", False),
                ", ".join(vm1_file_data.get("threats", [])),
                vm2_file_data.get("finish-time"),
                vm2_file_data.get("scan_time"),
                vm2_file_data.get("infected", False),
                ", ".join(vm2_file_data.get("threats", []))
            ))

        conn.commit()
        return jsonify({"message": "Results uploaded successfully"}), 200
    except sqlite3.Error as e:
        return jsonify({"error": str(e)}), 500
    finally:
        conn.close()

def init_db():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS auth (
            uid TEXT PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

# Initialize the database
init_db()

# Helper function to interact with the database
def query_db(query, args=(), one=False, fetch_all=True):
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute(query, args)
    if fetch_all:
        result = cursor.fetchall()
    else:
        result = cursor.fetchone()
    conn.commit()
    conn.close()
    return (result[0] if result and one else result) if fetch_all else result

# Routes

# Register a new user
@app.route('/register', methods=['POST'])
def register():
    try:
        data = request.form
        username = data['email']
        password = data['password']
        confirmPassword = data['confirm']
        if (password != confirmPassword):
            return jsonify({"error":"The Password doesn't match in the Confirm Password"})
        query = 'INSERT INTO auth (uid, username, password) VALUES (?, ?, ?)'
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        uid = uuid.uuid1()
        print(uid)
        cursor.execute(query, (str(uid),username, password))
        conn.commit()
        conn.close()
        return jsonify({"id": uid,"email":username, "password":password,"status":"Success"}), 200
    except sqlite3.IntegrityError as e:
        return jsonify({"error": "Email already exists","status":"Failed"}), 409
    except Exception as e:
        return jsonify({"error": str(e),"status":"Failed"}), 500

# User login
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.form
        username = data['email']
        password = data['password']
        query = 'SELECT * FROM auth WHERE username = ? AND password = ?'
        user = query_db(query, (username, password), one=True, fetch_all=False)
        if user:
            return jsonify({"id": user[0], "email": user[1],"status":"Success"}), 200
        else:
            return jsonify({"error": "Invalid credentials","status":"Failed"}), 401
    except Exception as e:
        return jsonify({"error": str(e),"status":"Failed"}), 500


if __name__ == "__main__":
    app.run(host='192.168.56.1', port=5002)
