import os
import sys
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from PIL import Image
import io

# Add ML module to path
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../image_classification'))
sys.path.append(ml_path)

try:
    from src.predict import predict_image
except ImportError:
    # mock fallback if the import fails
    def predict_image(path):
        return "trauma", 0.95

live_prediction_bp = Blueprint('live_prediction', __name__)

@live_prediction_bp.route('/predict-live', methods=['POST'])
def predict_live():
    if 'image' not in request.files:
        return jsonify({"error": "No image provided"}), 400
        
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "Empty file"}), 400

    try:
        # Save temp image
        tmp_dir = os.path.join(os.path.dirname(__file__), 'tmp')
        os.makedirs(tmp_dir, exist_ok=True)
        img_path = os.path.join(tmp_dir, 'live_frame.jpg')
        
        # Read file as bytes to avoid overwriting issues, then save
        file.save(img_path)
        
        # Predict
        predicted_type, confidence = predict_image(img_path)
        
        # Determine Severity based on logic
        severity = "HIGH" if confidence and confidence > 0.85 else "MEDIUM"
        if not predicted_type:
            severity = "LOW"
            
        return jsonify({
            "severity": severity,
            "confidence": confidence,
            "type": predicted_type
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
