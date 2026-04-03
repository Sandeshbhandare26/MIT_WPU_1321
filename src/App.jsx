import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import EMTForm from './pages/EMTForm';
import Prediction from './pages/Prediction';
import HospitalRouting from './pages/HospitalRouting';
import MapDashboard from './pages/MapDashboard';
import XAIPanel from './pages/XAIPanel';
import MassCasualty from './pages/MassCasualty';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="emt-form" element={<EMTForm />} />
        <Route path="prediction" element={<Prediction />} />
        <Route path="hospital-routing" element={<HospitalRouting />} />
        <Route path="map" element={<MapDashboard />} />
        <Route path="xai" element={<XAIPanel />} />
        <Route path="mass-casualty" element={<MassCasualty />} />
        <Route path="settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
