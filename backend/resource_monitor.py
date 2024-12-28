from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins="*")  # Enable cross-origin requests for the frontend

@app.route('/resource_monitor', methods=['POST'])
def resource_monitor():
    data = request.get_json()
    if data:
        # Emit the data to connected clients
        socketio.emit('update_resource', data)
        return jsonify({"message": "Data received successfully!"}), 200
    return jsonify({"error": "No data received"}), 400

if __name__ == '__main__':
    socketio.run(app, host='192.168.56.1', port=5003, debug=True)
