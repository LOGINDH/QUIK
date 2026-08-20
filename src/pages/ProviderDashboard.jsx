import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProviderRequests, updateProviderLocation, extractErrorMessage } from '../services/api';
import { getCurrentLocation } from '../utils/location';
import LocationStatus from '../components/LocationStatus';
import MapView from '../components/MapView';
import { Shield, Navigation, Car, Ambulance, Wrench, Inbox, CheckCircle2, Clock, Zap, RefreshCw, Power, ArrowRight } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

const getServiceMeta = (type) => {
  const t = (type || 'auto').toLowerCase();
  if (t === 'ambulance') return { label: 'Emergency Ambulance Fleet', icon: Ambulance, color: 'bg-emerald-950 text-white' };
  if (t === 'puncture') return { label: 'Mobile Puncture Unit', icon: Wrench, color: 'bg-emerald-700 text-white' };
  return { label: 'Auto Rickshaw Driver', icon: Car, color: 'bg-emerald-800 text-white' };
};

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { provider } = useAuth();

  const [isOnline, setIsOnline] = useState(true);
  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(null);
  const [lastLocationSync, setLastLocationSync] = useState(null);

  const [requests, setRequests] = useState([]);
  const [reqLoading, setReqLoading] = useState(false);
  const [reqError, setReqError] = useState(null);

  const serviceMeta = getServiceMeta(provider?.service_type);
  const ServiceIcon = serviceMeta.icon;

  // Real GPS acquisition & sync to backend PUT /location/
  const syncLocation = useCallback(async () => {
    if (!provider?.id) return;
    try {
      setLocLoading(true);
      setLocError(null);
      const coords = await getCurrentLocation({ enableHighAccuracy: true });
      setLocation(coords);

      // Send to backend PUT /location/
      await updateProviderLocation(provider.id, coords.latitude, coords.longitude);
      setLastLocationSync(new Date());
    } catch (err) {
      setLocError(err.message || 'Could not acquire GPS coordinates.');
    } finally {
      setLocLoading(false);
    }
  }, [provider?.id]);

  // Fetch pending requests for this provider: GET /requests/?provider={id}
  const fetchRequests = useCallback(async () => {
    if (!provider?.id) return;
    try {
      setReqLoading(true);
      setReqError(null);
      const data = await getProviderRequests(provider.id);
      if (Array.isArray(data)) {
        setRequests(data);
      }
    } catch (err) {
      setReqError(extractErrorMessage(err, 'Failed to fetch incoming requests.'));
    } finally {
      setReqLoading(false);
    }
  }, [provider?.id]);

  useEffect(() => {
    syncLocation();
    fetchRequests();

    // Periodic check for requests
    const interval = setInterval(() => {
      fetchRequests();
    }, 6000);

    return () => clearInterval(interval);
  }, [syncLocation, fetchRequests]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 bg-[#FAF8F5]">
      {/* Provider HUD Header */}
      <div className="bg-emerald-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/40 rounded-bl-full pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-800 border-2 border-emerald-400 text-white flex items-center justify-center shadow-md">
              <ServiceIcon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight">
                  {provider?.name || 'Service Provider'}
                </h1>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white text-emerald-950">
                  {provider?.service_type || 'Driver'}
                </span>
              </div>
              <p className="text-xs text-emerald-200 mt-0.5 font-medium">
                {serviceMeta.label} • Authorized Operator
              </p>
            </div>
          </div>

          {/* Online Availability Toggle */}
          <button
            type="button"
            onClick={() => setIsOnline(!isOnline)}
            className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
              isOnline
                ? 'bg-emerald-400 text-emerald-950 hover:bg-emerald-300'
                : 'bg-stone-700 text-stone-300 hover:bg-stone-600'
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{isOnline ? 'Online & Available' : 'Offline'}</span>
          </button>
        </div>

        {/* Live GPS Sync Status Bar */}
        <div className="relative z-10 mt-5 pt-4 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-2 text-xs text-emerald-200">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-ping' : 'bg-stone-400'}`} />
            <span>
              {lastLocationSync
                ? `GPS Telemetry Synced at ${lastLocationSync.toLocaleTimeString()}`
                : 'GPS Syncing...'}
            </span>
          </div>

          <button
            type="button"
            onClick={syncLocation}
            disabled={locLoading}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-800 hover:bg-emerald-700 text-white font-semibold transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${locLoading ? 'animate-spin' : ''}`} />
            <span>Send GPS Ping</span>
          </button>
        </div>
      </div>

      {locError && <ErrorMessage message={locError} className="mb-2" />}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Incoming Requests Metric */}
        <Link
          to="/provider/requests"
          className="bg-white border-2 border-emerald-300 hover:border-emerald-500 rounded-3xl p-4 sm:p-5 shadow-sm transition-all flex flex-col justify-between group"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Pending Requests
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black text-emerald-950">
              {requests.length}
            </span>
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              View <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </Link>

        {/* Assigned Service Type */}
        <div className="bg-white border border-emerald-100 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              Service Category
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <ServiceIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-base sm:text-lg font-black text-emerald-950 uppercase">
              {provider?.service_type || 'Auto'}
            </span>
            <p className="text-[10px] text-emerald-800/70 font-semibold">Fixed via Django Admin</p>
          </div>
        </div>

        {/* Location Status Metric */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-emerald-100 rounded-3xl p-4 sm:p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
              GPS Transmitter
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <Navigation className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xs font-mono font-bold text-emerald-950 truncate block">
              {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Detecting...'}
            </span>
            <p className="text-[10px] text-emerald-800 font-semibold">Real device coordinates</p>
          </div>
        </div>
      </div>

      {/* Provider Location Map Radar */}
      <div className="bg-white border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-800" />
            <h2 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
              Live Provider Position
            </h2>
          </div>
          <span className="text-xs font-semibold text-emerald-800">
            Real GPS Location
          </span>
        </div>

        <MapView
          providerLocation={location}
          providerName={provider?.name || 'You'}
          serviceType={provider?.service_type || 'auto'}
          height="260px"
        />
      </div>

      {/* Quick Link to Incoming Requests */}
      <div className="bg-white border border-emerald-100 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-emerald-950">
            Incoming Service Queue ({requests.length})
          </h3>
          <p className="text-xs text-emerald-800/70">
            Review nearby requests allocated to your service type
          </p>
        </div>

        <Link
          to="/provider/requests"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors"
        >
          <span>Open Requests</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};

export default ProviderDashboard;
