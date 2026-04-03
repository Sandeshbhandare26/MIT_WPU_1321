import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  AlertTriangle, CheckCircle, Activity, Heart, Wind, Brain,
  ArrowRight, Zap, Shield, ThermometerSun
} from 'lucide-react';
import './Prediction.css';

export default function Prediction() {
  const navigate = useNavigate();
  const { prediction, predictionLoading, runPrediction, runRouting, routingLoading } = useStore();

  const handleRunPrediction = async () => {
    try { await runPrediction(); } catch {}
  };

  const handleRoute = async () => {
    try {
      await runRouting();
      navigate('/hospital-routing');
    } catch {}
  };

  if (!prediction && !predictionLoading) {
    return (
      <div className="prediction-page">
        <div className="page-header">
          <div>
            <h2>AI Prediction Results</h2>
            <p className="page-subtitle">Severity analysis and resource requirements</p>
          </div>
        </div>
        <div className="prediction-empty card">
          <Brain size={48} className="empty-icon" />
          <h3>No Prediction Available</h3>
          <p>Submit the EMT form first, or run prediction manually.</p>
          <div className="empty-actions">
            <button className="btn btn-outline" onClick={() => navigate('/emt-form')}>
              Go to EMT Form
            </button>
            <button className="btn btn-primary" onClick={handleRunPrediction}>
              <Zap size={16} /> Run Prediction Now
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (predictionLoading) {
    return (
      <div className="prediction-page">
        <div className="page-header"><h2>AI Prediction Results</h2></div>
        <div className="prediction-loading card">
          <div className="loading-animation">
            <div className="loading-ring" />
            <Brain size={32} className="loading-icon" />
          </div>
          <h3>Analyzing Patient Data...</h3>
          <p>Running severity prediction model {'>'}v2.4.1</p>
        </div>
      </div>
    );
  }

  const sev = prediction.severity;

  return (
    <div className="prediction-page">
      <div className="page-header">
        <div>
          <h2>AI Prediction Results</h2>
          <p className="page-subtitle">Model: {prediction.modelVersion} — Confidence: {prediction.confidence}%</p>
        </div>
        <button className="btn btn-primary" onClick={handleRoute} disabled={routingLoading}>
          {routingLoading ? 'Routing...' : <><ArrowRight size={16} /> Find Best Hospital</>}
        </button>
      </div>

      {/* Main Severity Card */}
      <div className="severity-main-card card" style={{ borderColor: sev.color }}>
        <div className="sev-card-header" style={{ background: `${sev.color}10` }}>
          <div className="sev-badge" style={{ background: sev.color }}>
            <AlertTriangle size={20} />
            <span>{sev.label}</span>
          </div>
          <div className="sev-score-big">
            <span className="mono" style={{ color: sev.color }}>{prediction.severityScore}</span>
            <span className="sev-out-of">/100</span>
          </div>
        </div>
        <div className="sev-card-body">
          <h3 className="sev-name" style={{ color: sev.color }}>{sev.name}</h3>
          <div className="confidence-bar-wrap">
            <div className="confidence-label">
              <span>Model Confidence</span>
              <span className="mono">{prediction.confidence}%</span>
            </div>
            <div className="progress-bar" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${prediction.confidence}%`, background: `linear-gradient(90deg, ${sev.color}88, ${sev.color})` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Resource Requirements */}
      <div className="prediction-requirements">
        <RequirementCard
          icon={Heart}
          label="ICU Required"
          needed={prediction.icuNeeded}
          color="#DC2626"
        />
        <RequirementCard
          icon={Wind}
          label="Ventilator Required"
          needed={prediction.ventilatorNeeded}
          color="#D97706"
        />
        <RequirementCard
          icon={Brain}
          label="Specialist Required"
          needed={prediction.specialistNeeded}
          color="#7C3AED"
        />
      </div>

      {/* Feature Importance */}
      <div className="card feature-card">
        <div className="card-header">
          <h3><Activity size={16} /> Key Contributing Factors</h3>
        </div>
        <div className="card-body">
          <div className="features-list">
            {prediction.featureImportance.slice(0, 6).map((f, i) => (
              <div key={f.feature} className="feature-item" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="feature-header">
                  <span className="feature-name">{f.feature}</span>
                  <span className="feature-pct mono">{f.importance}%</span>
                </div>
                <div className="progress-bar" style={{ height: 8 }}>
                  <div
                    className="progress-fill"
                    style={{
                      width: `${f.importance}%`,
                      background: f.importance > 25 ? 'var(--danger)' : f.importance > 15 ? 'var(--warning)' : 'var(--primary-500)',
                      transition: `width 0.8s ease-out ${i * 0.1}s`
                    }}
                  />
                </div>
                <span className="feature-value mono">Value: {f.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="prediction-actions">
        <button className="btn btn-outline" onClick={() => navigate('/emt-form')}>
          ← Edit Assessment
        </button>
        <button className="btn btn-outline" onClick={() => navigate('/xai')}>
          <Shield size={16} /> View Full XAI Analysis
        </button>
        <button className="btn btn-primary btn-lg" onClick={handleRoute} disabled={routingLoading}>
          <Zap size={18} /> Route to Hospital <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

function RequirementCard({ icon: Icon, label, needed, color }) {
  return (
    <div className={`req-card card ${needed ? 'needed' : ''}`} style={needed ? { borderColor: color } : {}}>
      <div className="req-icon" style={{ background: needed ? `${color}14` : '#F1F5F9', color: needed ? color : '#94A3B8' }}>
        <Icon size={24} />
      </div>
      <div className="req-info">
        <span className="req-label">{label}</span>
        <span className={`req-status ${needed ? 'yes' : 'no'}`} style={needed ? { color } : {}}>
          {needed ? (
            <><AlertTriangle size={12} /> YES — Required</>
          ) : (
            <><CheckCircle size={12} /> Not Required</>
          )}
        </span>
      </div>
    </div>
  );
}
