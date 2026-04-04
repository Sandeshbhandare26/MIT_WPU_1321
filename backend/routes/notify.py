from flask import Blueprint, request, jsonify
import time

notify_bp = Blueprint('notify', __name__)

@notify_bp.route('/notify-hospital', methods=['POST'])
def notify_hospital():
    data = request.get_json()
    
    if not data:
        return jsonify({"error": "Invalid payload"}), 400
        
    hospital_id = data.get('hospital_id')
    severity = data.get('severity')
    eta = data.get('eta')
    
    if not hospital_id:
        return jsonify({"error": "hospital_id is required"}), 400
        
    # Mocking actual dispatch DB save or 3rd party notification API
    print(f"[DISPATCH ALERT] Hospital {hospital_id} notified of {severity} case arriving in ~{eta} mins.")
    
    # Fake processing delay
    time.sleep(0.5)

    return jsonify({
        "success": True,
        "message": f"Successfully notified hospital {hospital_id}",
        "timestamp": time.time(),
        "dispatched_severity": severity
    })
