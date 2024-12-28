from flask import Flask, jsonify, request
import subprocess
from datetime import datetime
import sqlite3
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Function to initialize the database and create the snapshot table (if not already created)
def init_db():
    conn = sqlite3.connect('database.db')  # Use your existing database
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS snapshots
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  vm_name TEXT NOT NULL,
                  snapshot_name TEXT NOT NULL,
                  snapshot_description TEXT NOT NULL,
                  created_at TEXT NOT NULL)''')
    conn.commit()
    conn.close()

# Initialize the database when the application starts (if needed)
init_db()

@app.route('/create_snapshot', methods=['POST'])
def create_snapshot():
    try:
        # Get the current date and time
        vm_name = request.form['vm_name']
        current_time = datetime.now()
        snapshot_name = current_time.strftime("snapshot_%Y%m%d_%H%M%S")
        snapshot_description = f"Snapshot created at {current_time.strftime('%Y-%m-%d %H:%M:%S')}"

        # Define the path and command for snapshot creation
        command = r'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe'
        args = ['snapshot', vm_name, 'take', snapshot_name, '--description', snapshot_description]

        # Run the command
        process = subprocess.Popen([command] + args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Get the output and error (if any)
        stdout, stderr = process.communicate()

        if process.returncode == 0:
            # If snapshot is created successfully, store its information in the existing database
            conn = sqlite3.connect('database.db')  # Connect to the existing database
            c = conn.cursor()
            c.execute('''INSERT INTO snapshots (vm_name, snapshot_name, snapshot_description, created_at)
                         VALUES (?, ?, ?, ?)''', (vm_name, snapshot_name, snapshot_description, current_time.strftime('%Y-%m-%d %H:%M:%S')))
            conn.commit()
            conn.close()

            return jsonify({'success': True, 'snapshot_name': snapshot_name, 'output': stdout.decode()}), 200
        else:
            return jsonify({'success': False, 'error': stderr.decode()}), 500
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/get_snapshots', methods=['GET'])
def get_snapshots():
    vm_name = request.args.get('vm_name')  # Get the vm_name from query params
    try:
        # Connect to the database and fetch snapshot records for the given vm_name
        conn = sqlite3.connect('database.db')
        c = conn.cursor()
        if vm_name:
            c.execute('SELECT vm_name, snapshot_name, snapshot_description, created_at FROM snapshots WHERE vm_name = ?', (vm_name,))
        else:
            c.execute('SELECT vm_name, snapshot_name, snapshot_description, created_at FROM snapshots')  # Fetch all if no vm_name is provided
        rows = c.fetchall()
        conn.close()

        # Convert rows to a list of dictionaries
        snapshots = [
            {
                'vm_name': row[0],
                'snapshot_name': row[1],
                'snapshot_description': row[2],
                'created_at': row[3]
            }
            for row in rows
        ]

        return jsonify({'success': True, 'snapshots': snapshots}), 200
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/delete_snapshot', methods=['POST'])
def delete_snapshot():
    try:
        # Get the snapshot name and VM name from the request body
        data = request.json
        snapshot_name = data.get('snapshot_name')
        vm_name = data.get('vm_name')

        if not snapshot_name or not vm_name:
            return jsonify({'success': False, 'message': 'Missing snapshot_name or vm_name'}), 400

        # Define the path and command for snapshot deletion
        command = r'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe'
        args = ['snapshot', vm_name, 'delete', snapshot_name]

        # Run the command
        process = subprocess.Popen([command] + args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        # Get the output and error (if any)
        stdout, stderr = process.communicate()

        if process.returncode == 0:
            # If snapshot is deleted successfully, remove its record from the database
            conn = sqlite3.connect('database.db')
            c = conn.cursor()
            c.execute('DELETE FROM snapshots WHERE vm_name = ? AND snapshot_name = ?', (vm_name, snapshot_name))
            conn.commit()
            conn.close()

            return jsonify({'success': True, 'message': f'Snapshot {snapshot_name} deleted successfully', 'output': stdout.decode()}), 200
        else:
            return jsonify({'success': False, 'message': stderr.decode()}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
    
@app.route('/restore_snapshot', methods=['POST'])
def restore_snapshot():
    try:
        data = request.get_json()
        snapshot_name = data['snapshot_name']
        vm_name = data['vm_name']

        # Define the path and command for restoring snapshot
        command = r'C:\Program Files\Oracle\VirtualBox\VBoxManage.exe'
        restore_args = ['snapshot', vm_name, 'restore', snapshot_name]

        # Run the restore command
        restore_process = subprocess.Popen([command] + restore_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        restore_stdout, restore_stderr = restore_process.communicate()

        if restore_process.returncode == 0:
            # After restoring the snapshot, start the VM from the restored snapshot state
            start_args = ['startvm', vm_name, '--type', 'headless']  # Optional: '--type headless' for no GUI
            start_process = subprocess.Popen([command] + start_args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            start_stdout, start_stderr = start_process.communicate()

            if start_process.returncode == 0:
                return jsonify({
                    'success': True,
                    'message': f"Snapshot '{snapshot_name}' restored and VM '{vm_name}' started successfully.",
                    'restore_output': restore_stdout.decode().strip(),
                    'start_output': start_stdout.decode().strip()
                }), 200
            else:
                return jsonify({
                    'success': False,
                    'message': f"Snapshot '{snapshot_name}' restored, but VM '{vm_name}' failed to start.",
                    'restore_output': restore_stdout.decode().strip(),
                    'start_error': start_stderr.decode().strip()
                }), 500
        else:
            return jsonify({
                'success': False,
                'message': f"Failed to restore snapshot '{snapshot_name}' for VM '{vm_name}'.",
                'error': restore_stderr.decode().strip()
            }), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/get_vm_state', methods=['GET'])
def get_vm_state():
    vm_name = request.args.get('vm_name')
    if not vm_name:
        return jsonify({"success": False, "error": "VM name is required"}), 400

    try:
        command = [r"C:\Program Files\Oracle\VirtualBox\VBoxManage.exe", "showvminfo", vm_name, "--machinereadable"]
        process = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()

        if process.returncode == 0:
            for line in stdout.decode().splitlines():
                if line.startswith("VMState="):
                    vm_state = line.split("=")[1].strip('"')
                    return jsonify({"success": True, "vm_state": vm_state})
        else:
            return jsonify({"success": False, "error": stderr.decode().strip()})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/power_off_vm', methods=['POST'])
def power_off_vm():
    try:
        # Get the VM name from the request body
        data = request.get_json()
        vm_name = data.get('vm_name')

        if not vm_name:
            return jsonify({'success': False, 'message': 'VM name is required'}), 400

        # Define the path and command to power off the VM
        command = r"C:\Program Files\Oracle\VirtualBox\VBoxManage.exe"
        args = ['controlvm', vm_name, 'poweroff']

        # Run the command
        process = subprocess.Popen([command] + args, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        stdout, stderr = process.communicate()

        # Check the return code to determine success
        if process.returncode == 0:
            return jsonify({'success': True, 'message': f"VM '{vm_name}' powered off successfully", 'output': stdout.decode().strip()}), 200
        else:
            return jsonify({'success': False, 'message': f"Failed to power off VM '{vm_name}'", 'error': stderr.decode().strip()}), 500
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


if __name__ == '__main__':
    app.run(debug=False, host='192.168.56.1', port=5004)
