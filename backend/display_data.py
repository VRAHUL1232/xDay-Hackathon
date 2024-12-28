from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173"])  # This will allow all domains by default

DATABASE = './database.db'

# Function to fetch and group data by id from the SQLite database
def get_grouped_scan_data():
    conn = sqlite3.connect(DATABASE)  # Path to your SQLite database
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM ScanData")
    rows = cursor.fetchall()

    # Group the data by id
    grouped_data = {}
    for row in rows:
        file_id = row[0]
        if file_id not in grouped_data:
            grouped_data[file_id] = {
                'id': file_id,
                'file_name': row[1],
                'file_extension': row[2],
                'file_path': row[3],
                'file_size': row[4],
                'sha1': row[5],
                'sha256': row[6],
                'details': []
            }
        grouped_data[file_id]['details'].append({
            'vm': 'VM1',
            'infected': row[9],
            'threats': row[10],
            'finish_time': row[7],
            'scan_time': row[8]
        })
        grouped_data[file_id]['details'].append({
            'vm': 'VM2',
            'infected': row[13],
            'threats': row[14],
            'finish_time': row[11],
            'scan_time': row[12]
        })

    conn.close()
    return list(grouped_data.values())

# Define an endpoint to fetch grouped scan data
@app.route('/api/grouped_scans', methods=['GET'])
def get_grouped_scans():
    grouped_scan_data = get_grouped_scan_data()
    return jsonify(grouped_scan_data)

@app.route('/api/past_scans', methods=['GET'])
def get_past_scans():
    sort_order = request.args.get('sortByTime', 'desc')  # Default to 'desc'
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    cursor.execute(f"""
        SELECT 
            id, 
            file_name, 
            file_extension, 
            MAX(scan_time_vm1, scan_time_vm2) AS scan_time,
            MAX(finish_time_vm1, finish_time_vm2) AS finish_time,
            (infected_vm1 OR infected_vm2) AS infected
        FROM ScanData
        ORDER BY finish_time {sort_order.upper()}
    """)
    rows = cursor.fetchall()

    scan_data = [
        {
            'id': row[0],
            'file_name': row[1],
            'file_extension': row[2],
            'infected': bool(row[5]),
            'scan_time': row[3],
            'finish_time': row[4]
        }
        for row in rows
    ]

    conn.close()
    return jsonify(scan_data)


@app.route('/api/quarantine', methods=['GET'])
def get_quarantine_data():
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()

    # Query to get the most recent infected files from both VMs
    cursor.execute("""
        SELECT 
            file_name, file_path, file_extension, file_size, threats_vm1, sha256,
            MAX(finish_time_vm1, finish_time_vm2) AS latest_time
        FROM ScanData
        WHERE infected_vm1 = 1 OR infected_vm2 = 1
        GROUP BY sha256
        ORDER BY latest_time DESC
    """)
    rows = cursor.fetchall()

    # Format the data to match the frontend structure
    quarantine_data = [
        {
            'finish_time': row[6],
            'file_name': row[0],
            'file_path': row[1],
            'file_extension': row[2],
            'file_size': row[3],
            'threats': row[4],
            'sha256': row[5]
        }
        for row in rows
    ]

    conn.close()
    return jsonify(quarantine_data)

if __name__ == '__main__':
    app.run(debug=True)