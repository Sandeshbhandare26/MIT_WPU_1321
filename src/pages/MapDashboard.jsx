import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  MapPin, Navigation, Clock, Activity, Building2, Truck,
  AlertTriangle, ChevronRight, Route
} from 'lucide-react';
import './MapDashboard.css';

export default function MapDashboard() {
  const navigate = useNavigate();
  const { routing, booking } = useStore();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [etaCountdown, setEtaCountdown] = useState(null);

  const routeInfo = routing?.routeInfo;
  const recommended = routing?.recommended;

  // ETA Countdown
  useEffect(() => {
    if (!recommended?.eta) return;
    let remaining = recommended.eta * 60;
    setEtaCountdown(remaining);
    const interval = setInterval(() => {
      remaining -= 1;
      if (remaining <= 0) {
        clearInterval(interval);
        remaining = 0;
      }
      setEtaCountdown(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [recommended?.eta]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    
    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        await import('leaflet/dist/leaflet.css');

        const defaultCenter = routeInfo?.origin || { lat: 18.5204, lng: 73.8567 };
        const map = L.map(mapRef.current, {
          center: [defaultCenter.lat, defaultCenter.lng],
          zoom: 13,
          zoomControl: false,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap',
          maxZoom: 19,
        }).addTo(map);

        L.control.zoom({ position: 'topright' }).addTo(map);

        // Ambulance marker
        const ambulanceIcon = L.divIcon({
          html: `<div class="map-marker ambulance-marker"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M10 10H6"/><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.28a1 1 0 0 0-.684-.948l-1.923-.641a1 1 0 0 1-.578-.502l-1.539-3.076A1 1 0 0 0 16.382 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg></div>`,
          className: 'custom-div-icon',
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const origin = routeInfo?.origin || { lat: 18.5150, lng: 73.8560 };
        L.marker([origin.lat, origin.lng], { icon: ambulanceIcon })
          .addTo(map)
          .bindPopup('<b>🚑 Ambulance</b><br>Current Location');

        // Hospital markers
        if (routing?.hospitals) {
          routing.hospitals.forEach(h => {
            const isRec = h.isRecommended;
            const hospitalIcon = L.divIcon({
              html: `<div class="map-marker hospital-marker ${isRec ? 'recommended' : ''}"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M18 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/><path d="M12 6v4"/><path d="M10 8h4"/></svg></div>`,
              className: 'custom-div-icon',
              iconSize: [34, 34],
              iconAnchor: [17, 17],
            });

            L.marker([h.lat, h.lng], { icon: hospitalIcon })
              .addTo(map)
              .bindPopup(`<b>${isRec ? '⭐ ' : ''}${h.name}</b><br>Load: ${h.load}% | ETA: ${h.eta} min`);
          });
        }

        // Route line to recommended hospital
        if (routeInfo) {
          const routePoints = [
            [routeInfo.origin.lat, routeInfo.origin.lng],
            [routeInfo.origin.lat + 0.005, routeInfo.origin.lng + 0.003],
            [routeInfo.destination.lat - 0.003, routeInfo.destination.lng - 0.002],
            [routeInfo.destination.lat, routeInfo.destination.lng],
          ];

          L.polyline(routePoints, {
            color: '#3B82F6',
            weight: 4,
            opacity: 0.8,
            dashArray: '10, 8',
          }).addTo(map);

          // Fit bounds
          const bounds = L.latLngBounds(routePoints);
          map.fitBounds(bounds, { padding: [50, 50] });
        }

        mapInstanceRef.current = map;
        setMapLoaded(true);
      } catch (err) {
        console.error('Map load failed:', err);
      }
    };

    loadMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [routing]);

  const formatCountdown = (seconds) => {
    if (seconds === null) return '--:--';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <div className="map-page">
      <div className="page-header">
        <div>
          <h2>Map Dashboard</h2>
          <p className="page-subtitle">Real-time ambulance tracking & hospital routing</p>
        </div>
      </div>

      <div className="map-layout">
        {/* Map Container */}
        <div className="map-container card">
          <div ref={mapRef} className="map-element" />
          {!mapLoaded && (
            <div className="map-loading">
              <div className="loading-animation">
                <div className="loading-ring" />
                <MapPin size={28} className="loading-icon" />
              </div>
              <p>Loading Map...</p>
            </div>
          )}

          {/* Map Overlay Stats */}
          <div className="map-overlay-stats">
            <div className="map-stat-card glass">
              <Truck size={16} />
              <div>
                <span className="map-stat-val mono">{recommended?.distance || '--'} km</span>
                <span className="map-stat-lbl">Distance</span>
              </div>
            </div>
            <div className="map-stat-card glass">
              <Clock size={16} />
              <div>
                <span className="map-stat-val mono">{formatCountdown(etaCountdown)}</span>
                <span className="map-stat-lbl">ETA</span>
              </div>
            </div>
            <div className="map-stat-card glass">
              <Activity size={16} />
              <div>
                <span className="map-stat-val">{booking ? 'Active' : 'Idle'}</span>
                <span className="map-stat-lbl">Status</span>
              </div>
            </div>
          </div>
        </div>

        {/* Map Sidebar */}
        <div className="map-sidebar">
          {/* Route Info */}
          <div className="card map-info-card">
            <div className="card-header">
              <h3><Route size={16} /> Route Information</h3>
            </div>
            <div className="card-body">
              {routing ? (
                <div className="route-details">
                  <div className="route-point">
                    <div className="route-dot origin" />
                    <div>
                      <span className="route-point-label">Origin</span>
                      <span className="route-point-value">Ambulance Current Location</span>
                    </div>
                  </div>
                  <div className="route-line-v" />
                  <div className="route-point">
                    <div className="route-dot destination" />
                    <div>
                      <span className="route-point-label">Destination</span>
                      <span className="route-point-value">{recommended?.name || 'Not Selected'}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="rp-empty">No route available. Run hospital routing first.</p>
              )}
            </div>
          </div>

          {/* ETA Card */}
          <div className="card map-eta-card">
            <div className="eta-display">
              <Clock size={20} />
              <div className="eta-time mono">{formatCountdown(etaCountdown)}</div>
              <span className="eta-label">Estimated Arrival</span>
            </div>
            {booking && (
              <div className="eta-status">
                <span className="status-dot-active" />
                <span>Ambulance En Route</span>
              </div>
            )}
          </div>

          {/* Hospitals Mini List */}
          <div className="card map-hospitals-card">
            <div className="card-header">
              <h3><Building2 size={16} /> Nearby Hospitals</h3>
            </div>
            <div className="card-body mini-hospital-list">
              {(routing?.hospitals || []).slice(0, 4).map(h => (
                <div key={h.id} className={`mini-hospital ${h.isRecommended ? 'rec' : ''}`}>
                  <div className="mh-info">
                    <span className="mh-name">{h.name}</span>
                    <span className="mh-dist mono">{h.distance} km</span>
                  </div>
                  <div className="progress-bar" style={{ height: 4 }}>
                    <div className="progress-fill" style={{
                      width: `${h.load}%`,
                      background: h.load > 80 ? 'var(--danger)' : h.load > 60 ? 'var(--warning)' : 'var(--success)'
                    }} />
                  </div>
                </div>
              ))}
              {!routing && <p className="rp-empty">Run routing to see hospitals</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
