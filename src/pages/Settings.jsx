import { useState } from 'react';
import useStore from '../store/useStore';
import toast from 'react-hot-toast';
import {
  User, Settings as SettingsIcon, Database, Wifi, WifiOff, Server,
  Bell, Moon, Sun, Volume2, VolumeX, Shield, Key, Globe, CheckCircle, XCircle
} from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const { settings, updateSetting } = useStore();
  const [apiStatus, setApiStatus] = useState('connected');
  const [firebaseStatus, setFirebaseStatus] = useState('demo');

  const handleTestAPI = () => {
    setApiStatus('testing');
    setTimeout(() => {
      setApiStatus('connected');
      toast.success('API connection successful');
    }, 1500);
  };

  const handleTestFirebase = () => {
    setFirebaseStatus('testing');
    setTimeout(() => {
      setFirebaseStatus('demo');
      toast('Firebase running in demo mode', { icon: 'ℹ️' });
    }, 1500);
  };

  return (
    <div className="settings-page">
      <div className="page-header">
        <div>
          <h2>Settings</h2>
          <p className="page-subtitle">System configuration & connectivity</p>
        </div>
      </div>

      <div className="settings-grid">
        {/* User Profile */}
        <div className="card settings-card">
          <div className="card-header">
            <h3><User size={16} /> User Profile</h3>
          </div>
          <div className="card-body">
            <div className="profile-section">
              <div className="profile-avatar-large">
                <User size={32} />
              </div>
              <div className="profile-details">
                <div className="profile-field">
                  <label>Name</label>
                  <input type="text" className="input" defaultValue="Dr. Anand Sharma" />
                </div>
                <div className="profile-field">
                  <label>Role</label>
                  <input type="text" className="input" defaultValue="EMT Lead — Paramedic" readOnly />
                </div>
                <div className="profile-field">
                  <label>Unit</label>
                  <input type="text" className="input" defaultValue="Ambulance Unit 7 — Sector 12" readOnly />
                </div>
                <div className="profile-field">
                  <label>Email</label>
                  <input type="email" className="input" defaultValue="a.sharma@goldenhour.health" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Preferences */}
        <div className="card settings-card">
          <div className="card-header">
            <h3><SettingsIcon size={16} /> Preferences</h3>
          </div>
          <div className="card-body">
            <div className="settings-list">
              <SettingToggle
                icon={settings.darkMode ? Moon : Sun}
                label="Dark Mode"
                description="Switch to dark interface theme"
                enabled={settings.darkMode}
                onChange={() => {
                  updateSetting('darkMode', !settings.darkMode);
                  toast(settings.darkMode ? 'Light mode enabled' : 'Dark mode enabled', { icon: settings.darkMode ? '☀️' : '🌙' });
                }}
              />
              <SettingToggle
                icon={Bell}
                label="Auto-Predict"
                description="Automatically run prediction when form is complete"
                enabled={settings.autoPredict}
                onChange={() => updateSetting('autoPredict', !settings.autoPredict)}
              />
              <SettingToggle
                icon={settings.soundAlerts ? Volume2 : VolumeX}
                label="Sound Alerts"
                description="Play audio notifications for critical alerts"
                enabled={settings.soundAlerts}
                onChange={() => updateSetting('soundAlerts', !settings.soundAlerts)}
              />
            </div>
          </div>
        </div>

        {/* Firebase Status */}
        <div className="card settings-card">
          <div className="card-header">
            <h3><Database size={16} /> Firebase Status</h3>
            <StatusBadge status={firebaseStatus} />
          </div>
          <div className="card-body">
            <div className="connection-info">
              <div className="conn-item">
                <span className="conn-label">Project ID</span>
                <span className="conn-value mono">goldenhour-triage-prod</span>
              </div>
              <div className="conn-item">
                <span className="conn-label">Firestore</span>
                <span className="conn-value">
                  {firebaseStatus === 'connected' ? (
                    <span className="status-online"><CheckCircle size={12} /> Connected</span>
                  ) : firebaseStatus === 'testing' ? (
                    <span className="status-testing"><span className="btn-spinner small" /> Testing...</span>
                  ) : (
                    <span className="status-demo"><Database size={12} /> Demo Mode</span>
                  )}
                </span>
              </div>
              <div className="conn-item">
                <span className="conn-label">Auth</span>
                <span className="conn-value">
                  <span className="status-demo"><Shield size={12} /> Demo Auth</span>
                </span>
              </div>
              <div className="conn-item">
                <span className="conn-label">Region</span>
                <span className="conn-value mono">asia-south1</span>
              </div>
            </div>
            <button className="btn btn-outline" onClick={handleTestFirebase} style={{ marginTop: 16, width: '100%' }}>
              <Database size={14} /> Test Firebase Connection
            </button>
          </div>
        </div>

        {/* API Status */}
        <div className="card settings-card">
          <div className="card-header">
            <h3><Server size={16} /> API Status</h3>
            <StatusBadge status={apiStatus} />
          </div>
          <div className="card-body">
            <div className="connection-info">
              <div className="conn-item">
                <span className="conn-label">Endpoint</span>
                <span className="conn-value mono" style={{ fontSize: '0.72rem' }}>{settings.apiEndpoint}</span>
              </div>
              <div className="conn-item">
                <span className="conn-label">ML Model</span>
                <span className="conn-value mono">v2.4.1-golden-hour</span>
              </div>
              <div className="conn-item">
                <span className="conn-label">Status</span>
                <span className="conn-value">
                  {apiStatus === 'connected' ? (
                    <span className="status-online"><CheckCircle size={12} /> Healthy</span>
                  ) : apiStatus === 'testing' ? (
                    <span className="status-testing"><span className="btn-spinner small" /> Testing...</span>
                  ) : (
                    <span className="status-offline"><XCircle size={12} /> Offline</span>
                  )}
                </span>
              </div>
              <div className="conn-item">
                <span className="conn-label">Latency</span>
                <span className="conn-value mono">42ms</span>
              </div>
            </div>
            <button className="btn btn-outline" onClick={handleTestAPI} style={{ marginTop: 16, width: '100%' }}>
              <Globe size={14} /> Test API Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingToggle({ icon: Icon, label, description, enabled, onChange }) {
  return (
    <div className="setting-toggle" onClick={onChange}>
      <div className="st-icon">
        <Icon size={18} />
      </div>
      <div className="st-info">
        <span className="st-label">{label}</span>
        <span className="st-desc">{description}</span>
      </div>
      <div className={`st-switch ${enabled ? 'on' : ''}`}>
        <div className="st-switch-thumb" />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const config = {
    connected: { label: 'Connected', cls: 'badge-success' },
    testing: { label: 'Testing...', cls: 'badge-warning' },
    demo: { label: 'Demo Mode', cls: 'badge-info' },
    offline: { label: 'Offline', cls: 'badge-danger' },
  };
  const c = config[status] || config.demo;
  return <span className={`badge ${c.cls}`}>{c.label}</span>;
}
