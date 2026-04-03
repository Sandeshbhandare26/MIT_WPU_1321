import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  Users, AlertTriangle, Building2, Clock, Activity, TrendingUp,
  ArrowRight, ArrowUpRight, ArrowDownRight, ChevronRight, Zap
} from 'lucide-react';
import './Dashboard.css';

const severityColors = {
  RED: '#DC2626', ORANGE: '#D97706', YELLOW: '#EAB308', GREEN: '#059669', BLACK: '#1F2937'
};
const statusColors = {
  'In Transit': '#3B82F6', 'Triaged': '#D97706', 'En Route': '#8B5CF6',
  'Discharged': '#059669', 'In ICU': '#DC2626', 'Treated': '#059669',
};

function StatCard({ icon: Icon, label, value, change, changeType, color, onClick }) {
  return (
    <div className="stat-card animate-fade-in" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className="stat-icon-wrap" style={{ background: `${color}12`, color }}>
        <Icon size={22} />
      </div>
      <div className="stat-content">
        <span className="stat-value mono">{value.toLocaleString()}</span>
        <span className="stat-label">{label}</span>
      </div>
      {change && (
        <div className={`stat-change ${changeType}`}>
          {changeType === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { stats, recentCases, alerts } = useStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="page-header"><h2>Dashboard</h2></div>
        <div className="stats-grid">
          {[1,2,3,4].map(i => (
            <div key={i} className="stat-card skeleton-card">
              <div className="skeleton" style={{ width: 48, height: 48, borderRadius: 12 }} />
              <div style={{ flex: 1 }}>
                <div className="skeleton" style={{ width: '60%', height: 24, marginBottom: 6 }} />
                <div className="skeleton" style={{ width: '80%', height: 14 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2>Dashboard Overview</h2>
          <p className="page-subtitle">Real-time emergency triage monitoring</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/emt-form')}>
          <Zap size={16} /> New Triage
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <StatCard icon={Users} label="Total Patients Today" value={stats.totalPatients} change="+12%" changeType="up" color="#3B82F6" />
        <StatCard icon={AlertTriangle} label="Critical Cases" value={stats.criticalCases} change="+3" changeType="up" color="#DC2626" onClick={() => navigate('/emt-form')} />
        <StatCard icon={Building2} label="Available Hospitals" value={stats.availableHospitals} color="#059669" onClick={() => navigate('/hospital-routing')} />
        <StatCard icon={Clock} label="Avg Response Time" value={stats.avgResponseTime} change="-0.8m" changeType="down" color="#D97706" />
      </div>

      <div className="dashboard-grid">
        {/* Recent Cases */}
        <div className="card dash-table-card">
          <div className="card-header">
            <h3>Recent Cases</h3>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('/emt-form')}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="cases-table">
              <thead>
                <tr>
                  <th>Patient ID</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Hospital</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentCases.map((c) => (
                  <tr key={c.id} className="case-row">
                    <td className="mono case-id">{c.id}</td>
                    <td>
                      <span className="severity-dot" style={{ background: severityColors[c.severity] }} />
                      <span className="severity-text" style={{ color: severityColors[c.severity] }}>{c.severity}</span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ background: `${statusColors[c.status]}14`, color: statusColors[c.status] }}>
                        {c.status}
                      </span>
                    </td>
                    <td className="hospital-cell">{c.hospital}</td>
                    <td className="time-cell">{c.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alerts */}
        <div className="card dash-alerts-card">
          <div className="card-header">
            <h3>Active Alerts</h3>
            <span className="badge badge-danger">{alerts.filter(a => a.type === 'critical').length} Critical</span>
          </div>
          <div className="card-body alerts-list">
            {alerts.map((alert, i) => (
              <div
                key={alert.id}
                className={`alert-item ${alert.type}`}
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <span className="alert-icon">{alert.icon}</span>
                <div className="alert-content">
                  <p className="alert-msg">{alert.message}</p>
                  <span className="alert-time">{alert.time}</span>
                </div>
                <ArrowRight size={14} className="alert-arrow" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Activity */}
      <div className="card live-activity-card">
        <div className="card-header">
          <h3><Activity size={16} className="live-dot" /> Live Activity Feed</h3>
        </div>
        <div className="card-body live-feed">
          <div className="live-item">
            <div className="live-time mono">16:42</div>
            <div className="live-dot-line"><div className="ld red" /></div>
            <div className="live-msg">Patient PT-2741 — cardiac arrest suspected, dispatched to City General</div>
          </div>
          <div className="live-item">
            <div className="live-time mono">16:38</div>
            <div className="live-dot-line"><div className="ld orange" /></div>
            <div className="live-msg">Metro District Hospital capacity warning — 88% utilization</div>
          </div>
          <div className="live-item">
            <div className="live-time mono">16:30</div>
            <div className="live-dot-line"><div className="ld blue" /></div>
            <div className="live-msg">EMT Unit 7 dispatched to Sector 12 for multi-vehicle collision</div>
          </div>
          <div className="live-item">
            <div className="live-time mono">16:22</div>
            <div className="live-dot-line"><div className="ld green" /></div>
            <div className="live-msg">Patient PT-2738 successfully discharged from Metro District</div>
          </div>
        </div>
      </div>
    </div>
  );
}
