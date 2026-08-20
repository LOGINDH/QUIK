import React, { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation, User, Car, Ambulance, Wrench, AlertCircle } from 'lucide-react';

// Custom SVG-based DivIcons for reliable Leaflet rendering
const createUserIcon = () => {
  return L.divIcon({
    className: 'custom-user-marker',
    html: `
      <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; background-color: rgba(6, 78, 59, 0.2); border-radius: 50%; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="width: 28px; height: 28px; background-color: #064E3B; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white;">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

const createProviderIcon = (serviceType = 'auto') => {
  let iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.5 2.8C2.1 10.7 2 10.8 2 11v5c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/></svg>';
  
  if (serviceType === 'ambulance') {
    iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10h4"/><path d="M12 8v4"/><rect width="16" height="12" x="4" y="6" rx="2"/><path d="M8 18v2"/><path d="M16 18v2"/></svg>';
  } else if (serviceType === 'puncture') {
    iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>';
  }

  return L.divIcon({
    className: 'custom-provider-marker',
    html: `
      <div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 40px; height: 40px; background-color: rgba(4, 120, 87, 0.25); border-radius: 50%; animation: pulse 2s infinite;"></div>
        <div style="width: 32px; height: 32px; background-color: #047857; border: 3px solid #FFFFFF; border-radius: 50%; box-shadow: 0 4px 12px rgba(4, 120, 87, 0.4); display: flex; align-items: center; justify-content: center; color: white;">
          ${iconSvg}
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
  });
};

// Component to dynamically fit bounds or pan to active points
function MapController({ userLoc, providerLoc }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    const points = [];
    if (userLoc && userLoc.latitude && userLoc.longitude) {
      points.push([userLoc.latitude, userLoc.longitude]);
    }
    if (providerLoc && providerLoc.latitude && providerLoc.longitude) {
      points.push([providerLoc.latitude, providerLoc.longitude]);
    }

    if (points.length === 2) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 16 });
    } else if (points.length === 1) {
      map.setView(points[0], 15, { animate: true });
    }
  }, [map, userLoc?.latitude, userLoc?.longitude, providerLoc?.latitude, providerLoc?.longitude]);

  return null;
}

const MapView = ({
  userLocation,
  providerLocation,
  providerName = 'Service Provider',
  serviceType = 'auto',
  height = '320px',
  className = '',
}) => {
  const hasUserLoc = userLocation && typeof userLocation.latitude === 'number' && typeof userLocation.longitude === 'number';
  const hasProviderLoc = providerLocation && typeof providerLocation.latitude === 'number' && typeof providerLocation.longitude === 'number';

  const defaultCenter = useMemo(() => {
    if (hasUserLoc) return [userLocation.latitude, userLocation.longitude];
    if (hasProviderLoc) return [providerLocation.latitude, providerLocation.longitude];
    return [11.5495, 77.448]; // Fallback center for initial render
  }, [hasUserLoc, hasProviderLoc, userLocation, providerLocation]);

  const userIcon = useMemo(() => createUserIcon(), []);
  const providerIcon = useMemo(() => createProviderIcon(serviceType), [serviceType]);

  return (
    <div className={`relative w-full rounded-3xl overflow-hidden border border-emerald-200 shadow-sm bg-stone-100 ${className}`} style={{ height }}>
      {hasUserLoc || hasProviderLoc ? (
        <MapContainer
          center={defaultCenter}
          zoom={14}
          scrollWheelZoom={false}
          className="w-full h-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapController userLoc={userLocation} providerLoc={providerLocation} />

          {hasUserLoc && (
            <Marker position={[userLocation.latitude, userLocation.longitude]} icon={userIcon}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-emerald-950">Your Location</p>
                  <p className="text-emerald-800 text-[11px]">
                    {userLocation.latitude.toFixed(5)}, {userLocation.longitude.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}

          {hasProviderLoc && (
            <Marker position={[providerLocation.latitude, providerLocation.longitude]} icon={providerIcon}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-emerald-950">{providerName}</p>
                  <p className="text-emerald-800 text-[11px] uppercase font-semibold">{serviceType}</p>
                  <p className="text-stone-500 text-[10px]">
                    {providerLocation.latitude.toFixed(5)}, {providerLocation.longitude.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-emerald-50/40">
          <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-emerald-800 flex items-center justify-center mb-2 shadow-xs">
            <Navigation className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-xs font-semibold text-emerald-950">Awaiting GPS Location...</p>
          <p className="text-[11px] text-emerald-800/70 mt-1 max-w-xs">
            Live coordinates will appear here as soon as device GPS is detected.
          </p>
        </div>
      )}

      {/* Provider Location Unavailable Pill if requested */}
      {!hasProviderLoc && hasUserLoc && (
        <div className="absolute bottom-3 left-3 right-3 z-[400] bg-white/90 backdrop-blur-xs border border-emerald-200 py-1.5 px-3 rounded-xl shadow-sm text-center">
          <p className="text-[11px] font-medium text-emerald-900 flex items-center justify-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-emerald-700" />
            Provider location is currently unavailable.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapView;
