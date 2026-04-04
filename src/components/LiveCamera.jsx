import React, { useRef, useState, useEffect } from 'react';
import useLivePrediction from '../hooks/useLivePrediction';
import { Camera, AlertTriangle, ShieldCheck, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LiveCamera({ onPredict, onStop }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);

    const { startStreaming, stopStreaming, isStreaming, severity, confidence } = useLivePrediction(videoRef, canvasRef, onPredict);

    useEffect(() => {
        startCamera();
        return () => {
             stopCamera();
             stopStreaming();
        };
    }, []);

    const startCamera = async () => {
        try {
            let mediaStream;
            try {
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
            } catch (e) {
                // Fallback to any available camera if 'environment' fails (e.g., desktops)
                mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            }
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            console.error('Failed to access camera', err);
            toast.error('Failed to access camera: ' + err.message);
        }
    };

    const stopCamera = () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    };

    const handleClose = () => {
        stopCamera();
        stopStreaming();
        if (onStop) onStop();
    };

    // Helper for badge color based on severity
    const getBadgeClass = (sev) => {
        if (sev === 'HIGH' || sev === 'RED' || sev === 'CRITICAL') return 'badge-red animate-pulse';
        if (sev === 'MEDIUM' || sev === 'ORANGE') return 'badge-orange';
        if (sev === 'YELLOW') return 'badge-yellow';
        if (sev === 'LOW' || sev === 'GREEN') return 'badge-green';
        return 'badge-gray';
    };

    return (
        <div className="live-camera-container glass-card">
            <div className="live-camera-frame">
                <video ref={videoRef} autoPlay playsInline muted className="live-video" />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                
                <button 
                    onClick={handleClose}
                    className="close-camera-btn"
                >
                    <X size={20} />
                </button>

                <div className="camera-overlays">
                    <div className={`camera-badge ${getBadgeClass(severity)}`}>
                        {(severity === 'HIGH' || severity === 'RED' || severity === 'CRITICAL') ? <AlertTriangle size={18} /> : <ShieldCheck size={18} />}
                        {severity || 'ANALYZING...'}
                    </div>
                    {confidence && (
                        <div className="camera-confidence">
                            Conf: {(confidence * 100).toFixed(1)}%
                        </div>
                    )}
                </div>

                <div className="camera-controls-bottom">
                    <button 
                        onClick={isStreaming ? stopStreaming : startStreaming}
                        className={`start-analysis-btn ${isStreaming ? 'btn-danger' : 'btn-primary'}`}
                    >
                        {isStreaming ? (
                            <>Stop Analysis</>
                        ) : (
                            <><Camera size={20} /> Start Live Analysis</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
