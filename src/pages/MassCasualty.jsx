import { useState } from 'react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import {
  AlertTriangle, Users, Building2, Plus, Trash2, Activity,
  Heart, Brain, Zap, Shield, Clock, ArrowRight, CheckCircle
} from 'lucide-react';
import './MassCasualty.css';

const SEVERITY_OPTIONS = [
  { value: 'GREEN', label: 'GREEN — Minor', color: '#059669' },
  { value: 'YELLOW', label: 'YELLOW — Delayed', color: '#EAB308' },
  { value: 'ORANGE', label: 'ORANGE — Urgent', color: '#D97706' },
  { value: 'RED', label: 'RED — Immediate', color: '#DC2626' },
  { value: 'BLACK', label: 'BLACK — Deceased', color: '#1F2937' },
];

const DEMO_MCI_PATIENTS = [
  { id: 'MCI-1', severity: 'RED', age: 45, complaint: 'Crush injury, multiple fractures', hospital: 'City General Hospital', status: 'En Route' },
  { id: 'MCI-2', severity: 'RED', age: 62, complaint: 'Head trauma, unconscious', hospital: 'Apollo Emergency Care', status: 'In Transit' },
  { id: 'MCI-3', severity: 'ORANGE', age: 38, complaint: 'Severe laceration, bleeding', hospital: 'City General Hospital', status: 'Triaged' },
  { id: 'MCI-4', severity: 'YELLOW', age: 29, complaint: 'Ankle fracture, minor cuts', hospital: 'St. Mary\'s Medical Center', status: 'Queued' },
  { id: 'MCI-5', severity: 'YELLOW', age: 51, complaint: 'Back injury, pain', hospital: 'Metro District Hospital', status: 'Queued' },
  { id: 'MCI-6', severity: 'GREEN', age: 23, complaint: 'Minor abrasions', hospital: 'Metro District Hospital', status: 'Queued' },
  { id: 'MCI-7', severity: 'GREEN', age: 19, complaint: 'Anxiety, minor cuts', hospital: null, status: 'Unassigned' },
];

const HOSPITAL_ASSIGNMENTS = [
  { name: 'City General Hospital', load: 65, assigned: 2, capacity: 12 },
  { name: 'Apollo Emergency Care', load: 42, assigned: 1, capacity: 15 },
  { name: 'St. Mary\'s Medical Center', load: 78, assigned: 1, capacity: 8 },
  { name: 'Metro District Hospital', load: 88, assigned: 2, capacity: 6 },
  { name: 'NIEM', load: 55, assigned: 0, capacity: 20 },
];

const severityColors = { RED: '#DC2626', ORANGE: '#D97706', YELLOW: '#EAB308', GREEN: '#059669', BLACK: '#1F2937' };

export default function MassCasualty() {
  const { massCasualtyMode, toggleMassCasualty } = useStore();
  const [patients, setPatients] = useState(DEMO_MCI_PATIENTS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPatient, setNewPatient] = useState({ severity: 'YELLOW', age: '', complaint: '' });

  const handleActivate = () => {
    toggleMassCasualty();
    if (!massCasualtyMode) {
      toast('🚨 Mass Casualty Incident Mode ACTIVATED', {
        style: { background: '#DC2626', color: 'white', fontWeight: 700 },
        duration: 5000,
      });
    } else {
      toast.success('MCI Mode deactivated');
    }
  };

  const handleAddPatient = () => {
    if (!newPatient.age || !newPatient.complaint) {
      toast.error('Fill in all fields');
      return;
    }
    const patient = {
      id: `MCI-${patients.length + 1}`,
      severity: newPatient.severity,
      age: parseInt(newPatient.age),
      complaint: newPatient.complaint,
      hospital: null,
      status: 'Unassigned',
    };
    setPatients([...patients, patient]);
    setNewPatient({ severity: 'YELLOW', age: '', complaint: '' });
    setShowAddForm(false);
    toast.success(`Patient ${patient.id} added to MCI list`);
  };

  const removePatient = (id) => {
    setPatients(patients.filter(p => p.id !== id));
  };

  const severityCounts = {
    RED: patients.filter(p => p.severity === 'RED').length,
    ORANGE: patients.filter(p => p.severity === 'ORANGE').length,
    YELLOW: patients.filter(p => p.severity === 'YELLOW').length,
    GREEN: patients.filter(p => p.severity === 'GREEN').length,
    BLACK: patients.filter(p => p.severity === 'BLACK').length,
  };

  return (
    <div className={`mci-page ${massCasualtyMode ? 'active' : ''}`}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>
            {massCasualtyMode && <AlertTriangle size={20} className="mci-pulse" />}
            Mass Casualty Incident
          </h2>
          <p className="page-subtitle">Multi-patient triage & hospital distribution management</p>
        </div>
        <button
          className={`btn ${massCasualtyMode ? 'btn-danger' : 'btn-primary'} btn-lg`}
          onClick={handleActivate}
        >
          {massCasualtyMode ? (
            <><Shield size={18} /> Deactivate MCI Mode</>
          ) : (
            <><AlertTriangle size={18} /> Activate MCI Mode</>
          )}
        </button>
      </div>

      {/* MCI Alert Banner */}
      {massCasualtyMode && (
        <div className="mci-alert-banner animate-scale">
          <AlertTriangle size={20} />
          <div>
            <strong>MASS CASUALTY INCIDENT ACTIVE</strong>
            <p>All hospitals notified. Surge protocols in effect. {patients.length} patients in queue.</p>
          </div>
        </div>
      )}

      {/* Severity Summary */}
      <div className="severity-summary-grid">
        {Object.entries(severityCounts).map(([sev, count]) => (
          <div key={sev} className="sev-summary-card" style={{ borderLeftColor: severityColors[sev] }}>
            <span className="sev-sum-count mono">{count}</span>
            <span className="sev-sum-label" style={{ color: severityColors[sev] }}>{sev}</span>
          </div>
        ))}
        <div className="sev-summary-card total">
          <span className="sev-sum-count mono">{patients.length}</span>
          <span className="sev-sum-label">TOTAL</span>
        </div>
      </div>

      <div className="mci-content-grid">
        {/* Patient List */}
        <div className="card mci-patients-card">
          <div className="card-header">
            <h3><Users size={16} /> Patient Queue ({patients.length})</h3>
            <button className="btn btn-primary btn-sm" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={14} /> Add Patient
            </button>
          </div>

          {showAddForm && (
            <div className="add-patient-form card-body" style={{ borderBottom: '1px solid var(--border-light)' }}>
              <div className="apf-grid">
                <select
                  className="input"
                  value={newPatient.severity}
                  onChange={(e) => setNewPatient({ ...newPatient, severity: e.target.value })}
                >
                  {SEVERITY_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <input
                  type="number"
                  className="input"
                  placeholder="Age"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient({ ...newPatient, age: e.target.value })}
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Chief Complaint"
                  value={newPatient.complaint}
                  onChange={(e) => setNewPatient({ ...newPatient, complaint: e.target.value })}
                />
                <button className="btn btn-success btn-sm" onClick={handleAddPatient}>
                  <CheckCircle size={14} /> Add
                </button>
              </div>
            </div>
          )}

          <div className="card-body patient-queue">
            {patients.map((p, i) => (
              <div key={p.id} className="mci-patient-row" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="mci-sev-indicator" style={{ background: severityColors[p.severity] }} />
                <div className="mci-patient-info">
                  <div className="mci-p-top">
                    <span className="mci-p-id mono">{p.id}</span>
                    <span className="mci-p-sev" style={{ color: severityColors[p.severity] }}>{p.severity}</span>
                  </div>
                  <span className="mci-p-complaint">{p.complaint}</span>
                  <div className="mci-p-meta">
                    <span>Age: {p.age}</span>
                    <span>•</span>
                    <span>{p.hospital || 'Unassigned'}</span>
                    <span>•</span>
                    <span className={`mci-status ${p.status.replace(' ', '-').toLowerCase()}`}>{p.status}</span>
                  </div>
                </div>
                <button className="mci-remove-btn" onClick={() => removePatient(p.id)} title="Remove">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Hospital Distribution */}
        <div className="card mci-distribution-card">
          <div className="card-header">
            <h3><Building2 size={16} /> Hospital Distribution</h3>
          </div>
          <div className="card-body">
            <p className="xai-description">Load-balanced patient distribution across available hospitals.</p>
            <div className="distribution-list">
              {HOSPITAL_ASSIGNMENTS.map((h, i) => {
                const totalLoad = Math.min(h.load + (h.assigned * 5), 100);
                const isOverloaded = totalLoad > 85;
                return (
                  <div key={i} className={`dist-item ${isOverloaded ? 'overloaded' : ''}`}>
                    <div className="dist-header">
                      <span className="dist-name">{h.name}</span>
                      <span className="dist-assigned badge badge-primary">{h.assigned} assigned</span>
                    </div>
                    <div className="dist-load-wrap">
                      <div className="progress-bar" style={{ height: 8 }}>
                        <div className="progress-fill" style={{
                          width: `${totalLoad}%`,
                          background: isOverloaded ? 'var(--danger)' : totalLoad > 65 ? 'var(--warning)' : 'var(--success)'
                        }} />
                      </div>
                      <span className={`dist-pct mono ${isOverloaded ? 'danger' : ''}`}>{totalLoad}%</span>
                    </div>
                    <div className="dist-capacity">
                      <span>Capacity: {h.capacity} beds</span>
                      {isOverloaded && (
                        <span className="overload-warning">
                          <AlertTriangle size={11} /> Near Capacity
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
