import os
import requests
import time
from flask import Blueprint, request, jsonify

voice_bp = Blueprint('voice', __name__)

ASSEMBLY_AI_KEY = "708a59616f434556ba2b9e15053ba117"

@voice_bp.route('/voice-input', methods=['POST'])
def voice_input():
    # Retain the fallback text route just in case
    data = request.get_json()
    if not data or 'transcript' not in data:
        return jsonify({"error": "No transcript provided"}), 400
        
    text = data['transcript'].lower()
    
    high_keywords = ["unconscious", "bleeding", "not breathing", "critical", "severe", "heavy"]
    medium_keywords = ["injury", "fracture", "pain", "burn", "ache"]
    
    severity = "LOW"
    for kw in high_keywords:
        if kw in text:
            severity = "HIGH"
            break
            
    if severity == "LOW":
        for kw in medium_keywords:
            if kw in text:
                severity = "MEDIUM"
                break
                
    return jsonify({
        "severity": severity,
        "transcript": data['transcript']
    })

@voice_bp.route('/voice-transcribe', methods=['POST'])
def voice_transcribe():
    if 'audio' not in request.files:
        return jsonify({"error": "No audio file provided"}), 400

    audio_file = request.files['audio']
    headers = {"authorization": ASSEMBLY_AI_KEY}
    
    try:
        # 1. Upload audio to AssemblyAI
        upload_resp = requests.post(
            "https://api.assemblyai.com/v2/upload",
            headers=headers,
            data=audio_file.read()
        )
        upload_resp.raise_for_status()
        audio_url = upload_resp.json().get("upload_url")

        # 2. Request transcription
        transcript_resp = requests.post(
            "https://api.assemblyai.com/v2/transcript",
            headers=headers,
            json={"audio_url": audio_url}
        )
        transcript_resp.raise_for_status()
        transcript_id = transcript_resp.json().get("id")

        # 3. Poll for result
        polling_endpoint = f"https://api.assemblyai.com/v2/transcript/{transcript_id}"
        transcript_text = ""
        while True:
            poll_resp = requests.get(polling_endpoint, headers=headers)
            poll_resp.raise_for_status()
            status = poll_resp.json().get("status")
            
            if status == "completed":
                transcript_text = poll_resp.json().get("text", "")
                break
            elif status == "error":
                return jsonify({"error": "Transcription failed on AssemblyAI"}), 500
            
            time.sleep(1) # wait 1s before polling again
            
        # 4. Keyword extraction & Severity logic on the backend
        text = transcript_text.lower()
        high_keywords = ["unconscious", "bleeding", "not breathing", "critical", "severe", "heavy"]
        medium_keywords = ["injury", "fracture", "pain", "burn", "ache"]
        
        severity = "LOW"
        for kw in high_keywords:
            if kw in text:
                severity = "HIGH"
                break
                
        if severity == "LOW":
            for kw in medium_keywords:
                if kw in text:
                    severity = "MEDIUM"
                    break

        return jsonify({
            "severity": severity,
            "transcript": transcript_text
        })
    except Exception as e:
        print("Backend STT Error:", str(e))
        return jsonify({"error": str(e)}), 500
