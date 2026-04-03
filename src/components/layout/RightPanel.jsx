import useStore from '../../store/useStore';
import { Activity, Building2, MapPin, TrendingUp, AlertCircle } from 'lucide-react';
import './RightPanel.css';

function SeverityRing({ score = 0, size = 140 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = () => {
    if (score >= 80) return '#1F2937';
    if (score >= 60) return '#DC2626';
    if (score >= 40) return '#D97706';
    if (score >= 20) return '#EAB308';
    return '#059669';
  };

  const getLabel = () => {
    if (score >= 80) return 'BLACK';
    if (score >= 60) return 'RED';
    if (score >= 40) return 'ORANGE';
    if (score >= 20) return 'YELLOW';
    return 'GREEN';
  };

  return (
    <div className="severity-ring-container">
      <svg width={size} height={size} className="severity-ring-svg">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#E2E8F0" strokeWidth="8" />
        <circle
          cx={size/2} cy={size/2} r={radius} fill="none"
          stroke={getColor()} strokeWidth="8" strokeLinecap="round"
          strokeDasharray={circumference} strokeDashoffset={offset}
          transform={`rotate(-90 ${size/2} ${size/2})`}
          style={{ transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s' }}
        />
      </svg>
      <div className="severity-ring-value">
        <span className="ring-score mono" style={{ color: getColor() }}>{score}</span>
        <span className="ring-label" style={{ color: getColor() }}>{getLabel()}</span>
      </div>
    </div>
  );
}

function MetricBar({ label, value, max = 100, color = 'var(--primary-500)' }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="metric-bar-item">
      <div className="metric-bar-header">
        <span className="metric-bar-label">{label}</span>
        <span className="metric-bar-value mono">{value}/{max}</span>
      </div>
      <div className="metric-bar-track">
        <div className="metric-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function RightPanel() {
  const { prediction, routing, booking, patientData, stats } = useStore();

  const severityScore = prediction?.severityScore || 0;

  return (
    <aside className="right-panel">
      {/* Severity Score */}
      <div className="rp-section">
        <div className="rp-section-header">
          <Activity size={16} />
          <span>Severity Score</span>
        </div>
        <div className="rp-severity-card">
          <SeverityRing score={severityScore} />
          {prediction && (
            <div className="severity-meta">
              <span className="severity-confidence mono">{prediction.confidence}% confidence</span>
              <span className="severity-model">Model {prediction.modelVersion}</span>
            </div>
          )}
          {!prediction && (
            <p className="rp-empty">Submit EMT form to calculate severity</p>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="rp-section">
        <div className="rp-section-header">
          <TrendingUp size={16} />
          <span>Vital Metrics</span>
        </div>
        <div className="rp-metrics">
          <MetricBar label="Heart Rate" value={patientData.heartRate || 80} max={200} color="#DC2626" />
          <MetricBar label="SpO2" value={patientData.spo2 || 98} max={100} color="#3B82F6" />
          <MetricBar label="GCS" value={patientData.gcs || 15} max={15} color="#059669" />
          <MetricBar label="Pain" value={patientData.pain || 3} max={10} color="#D97706" />
        </div>
      </div>

      {/* Hospital Recommendation */}
      <div className="rp-section">
        <div className="rp-section-header">
          <Building2 size={16} />
          <span>Recommended Hospital</span>
        </div>
        {routing?.recommended ? (
          <div className="rp-hospital-card">
            <div className="rp-hospital-name">{routing.recommended.name}</div>
            <div className="rp-hospital-details">
              <div className="rp-hospital-stat">
                <MapPin size={12} />
                <span className="mono">{routing.recommended.distance} km</span>
              </div>
              <div className="rp-hospital-stat">
                <Activity size={12} />
                <span className="mono">ETA {routing.recommended.eta} min</span>
              </div>
            </div>
            <div className="rp-hospital-load">
              <span>Load</span>
              <div className="metric-bar-track small">
                <div
                  className="metric-bar-fill"
                  style={{
                    width: `${routing.recommended.load}%`,
                    background: routing.recommended.load > 80 ? 'var(--danger)' : routing.recommended.load > 60 ? 'var(--warning)' : 'var(--success)'
                  }}
                />
              </div>
              <span className="mono">{routing.recommended.load}%</span>
            </div>
          </div>
        ) : (
          <p className="rp-empty">Run routing to see recommendation</p>
        )}
      </div>

      {/* Booking Status */}
      {booking && (
        <div className="rp-section">
          <div className="rp-section-header">
            <AlertCircle size={16} />
            <span>Active Booking</span>
          </div>
          <div className="rp-booking-card">
            <div className="booking-status-badge">
              <span className="status-dot" />
              {booking.status}
            </div>
            <div className="booking-id mono">{booking.bookingId}</div>
            <div className="booking-hospital">{booking.hospital?.name}</div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="rp-section">
        <div className="rp-section-header">
          <TrendingUp size={16} />
          <span>System Status</span>
        </div>
        <div className="rp-quick-stats">
          <div className="qs-item">
            <span className="qs-value mono">{stats.emtUnits}</span>
            <span className="qs-label">EMT Units</span>
          </div>
          <div className="qs-item">
            <span className="qs-value mono">{stats.availableHospitals}</span>
            <span className="qs-label">Hospitals</span>
          </div>
          <div className="qs-item">
            <span className="qs-value mono">{stats.avgResponseTime}m</span>
            <span className="qs-label">Avg Response</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
