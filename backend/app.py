from flask import Flask
from flask_cors import CORS

from routes.live_prediction import live_prediction_bp
from routes.explain import explain_bp
from routes.notify import notify_bp

app = Flask(__name__)
CORS(app) # Enable CORS for frontend

# Register Blueprints
app.register_blueprint(live_prediction_bp)
app.register_blueprint(explain_bp)
app.register_blueprint(notify_bp)

@app.route("/")
def home():
    return {"status": "Camera AI Backend Running"}

if __name__ == '__main__':
    # Run on port 5001 so it doesn't conflict with existing default ports
    app.run(host='0.0.0.0', port=5001, debug=True)
