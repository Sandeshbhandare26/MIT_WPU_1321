import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import { 
  Camera, Upload, Zap, AlertTriangle, ArrowRight, X, 
  Image as ImageIcon, Loader2, ShieldCheck, Activity
} from 'lucide-react';
import './SceneUpload.css';

export default function SceneUpload() {
  const navigate = useNavigate();
  const { setPatientField, runRouting } = useStore();
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  // Camera states
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [stream, setStream] = useState(null);

  const startCamera = async () => {
    setShowCamera(true);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      toast.error('Failed to access camera');
      setShowCamera(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        const file = new File([blob], "capture.jpg", { type: "image/jpeg" });
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(file));
        setResult(null);
        stopCamera();
      }, 'image/jpeg');
    }
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) {
      toast.error('Please upload an image first');
      return;
    }

    setAnalyzing(true);
    const formData = new FormData();
    formData.append('image', selectedImage);

    try {
      // Call the new FastAPI endpoint
      const response = await fetch('/api-ml/predict-severity', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('AI Analysis failed');
      
      const data = await response.json();
      setResult(data);
      
      // Sync to global store
      setPatientField('aiSeverity', data.severity);
      setPatientField('isCritical', data.is_critical);
      
      if (data.is_critical) {
        toast.error('CRITICAL CASE DETECTED', {
          icon: '🚨',
          duration: 5000,
          style: { background: '#991B1B', color: '#fff' }
        });
      } else {
        toast.success(`Analysis Complete: ${data.severity} Severity`);
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to analyze scene');
    } finally {
      setAnalyzing(false);
    }
  };

  const proceedToHospitals = async () => {
    try {
      await runRouting();
      navigate('/hospital-routing');
    } catch (e) {
      toast.error('Failed to load routing data');
    }
  };

  return (
    <div className="scene-upload-page animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Emergency Scene AI</h2>
          <p className="page-subtitle">Real-time accident severity assessment via vision models</p>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/app/emt-form')}>
          Manual Triage
        </button>
      </div>

      <div className="upload-container card glass">
        {showCamera ? (
          <div className="camera-view">
            <div className="preview-frame">
              <video ref={videoRef} autoPlay playsInline className="scene-preview" />
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
            <div className="camera-controls">
              <button className="btn btn-outline" onClick={stopCamera}>
                <X size={18} /> Cancel
              </button>
              <button className="btn btn-primary btn-lg" onClick={capturePhoto}>
                <Camera size={20} /> Capture Photo
              </button>
            </div>
          </div>
        ) : !previewUrl ? (
          <div className="dropzone-wrapper">
            <div className="dropzone">
              <input 
                type="file" 
                id="fileInput" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden-input"
              />
              <label htmlFor="fileInput" className="dropzone-label">
                <div className="dropzone-icon-wrap">
                  <Upload size={48} />
                </div>
                <h3>Upload Scene Photo</h3>
                <p>Drag and drop or click to browse</p>
                <div className="upload-badges">
                  <span className="badge badge-primary">Impact Analysis</span>
                  <span className="badge badge-secondary">Victim Count</span>
                </div>
              </label>
            </div>
            <div className="camera-option">
              <span className="divider-text">OR</span>
              <button className="btn btn-primary btn-lg open-camera-btn" onClick={startCamera}>
                <Camera size={20} /> Open Real-time Camera
              </button>
            </div>
          </div>
        ) : (
          <div className="preview-area">
            <div className="preview-frame">
              <img src={previewUrl} alt="Accident Scene" className="scene-preview" />
              {!analyzing && !result && (
                <button className="remove-btn" onClick={() => { setSelectedImage(null); setPreviewUrl(null); }}>
                  <X size={18} />
                </button>
              )}
            </div>
            
            {!result ? (
              <button 
                className={`btn btn-primary btn-lg analyze-btn ${analyzing ? 'loading' : ''}`}
                onClick={handleAnalyze}
                disabled={analyzing}
              >
                {analyzing ? (
                  <><Loader2 size={20} className="spinner" /> Analyzing Scene...</>
                ) : (
                  <><Zap size={20} /> RUN AI SEVERITY ANALYSIS</>
                )}
              </button>
            ) : (
              <div className={`analysis-result card ${result.severity.toLowerCase()}`}>
                <div className="result-header">
                  <div className="result-icon">
                    {result.is_critical ? <AlertTriangle size={32} /> : <ShieldCheck size={32} />}
                  </div>
                  <div className="result-title">
                    <h4>{result.severity} SEVERITY</h4>
                    <p>{result.description}</p>
                  </div>
                </div>
                
                <div className="result-actions">
                  <button className="btn btn-outline" onClick={() => { setResult(null); setSelectedImage(null); setPreviewUrl(null); }}>
                    New Analysis
                  </button>
                  <button className="btn btn-primary btn-lg" onClick={proceedToHospitals}>
                    Route to Best Hospital <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="info-grid">
        <div className="info-card">
          <Activity size={20} className="info-icon text-primary" />
          <h3>Dynamic Routing</h3>
          <p>Hospitals are filtered based on detected trauma levels (Level-1 for High Severity).</p>
        </div>
        <div className="info-card">
          <Zap size={20} className="info-icon text-warning" />
          <h3>Real-time Sync</h3>
          <p>Scene findings are automatically synchronized with the ambulance-hospital network.</p>
        </div>
      </div>
    </div>
  );
}
