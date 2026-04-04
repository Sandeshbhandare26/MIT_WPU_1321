import os
import sys
from flask import Blueprint, request, jsonify

# Add ml module to path
ml_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../ml'))
sys.path.append(ml_path)

# Import our explain module
try:
    from explain import generate_explanation
except ImportError:
    def generate_explanation(path):
        return None, ["Explainable AI module not available."]

explain_bp = Blueprint('explain', __name__)

@explain_bp.route('/predict-explain', methods=['POST'])
def predict_explain():
    try:
        # We can reuse the latest frame saved by predict-live for our explanation.
        tmp_dir = os.path.join(os.path.dirname(__file__), 'tmp')
        img_path = os.path.join(tmp_dir, 'live_frame.jpg')
        
        if not os.path.exists(img_path):
            return jsonify({"error": "No recent image found for explanation."}), 404
        
        # In a real app we'd get severity from predict_image first
        severity = request.form.get("severity", "HIGH")
        confidence = float(request.form.get("confidence", 0.92))
        
        # Generate heatmaps
        heatmap, explanations = generate_explanation(img_path)
        
        return jsonify({
            "severity": severity,
            "confidence": confidence,
            "explanations": explanations,
            "heatmap": heatmap
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500
