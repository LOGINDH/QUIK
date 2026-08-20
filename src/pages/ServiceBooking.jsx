import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCurrentLocation } from '../utils/location';
import { createServiceRequest, extractErrorMessage } from '../services/api';
import { storage } from '../utils/storage';
import { Car, Ambulance, Wrench, Navigation, MapPin, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';
import MapView from '../components/MapView';

const SERVICE_INFO = {
  auto: {
    type: 'auto',
    name: 'Auto Rickshaw',
    title: 'Book an Auto',
    icon: Car,
    defaultDesc: 'Need an auto ride',
    color: 'bg-emerald-800 text-white',
    badge: 'Standard Transit',
    hint: 'A verified nearby auto driver will be assigned to your real coordinates.',
  },
  ambulance: {
    type: 'ambulance',
    name: 'Emergency Ambulance',
    title: 'Emergency Medical Ambulance',
    icon: Ambulance,
    defaultDesc: 'Emergency ambulance required immediately',
    color: 'bg-emerald-950 text-white',
    badge: 'Immediate Priority',
    hint: 'Emergency services are alerted instantly with your live GPS location.',
  },
  puncture: {
    type: 'puncture',
    name: 'Puncture Assistance',
    title: 'Mobile Puncture Repair',
    icon: Wrench,
    defaultDesc: 'Tyre puncture assistance needed',
    color: 'bg-emerald-700 text-white',
    badge: 'Roadside Support',
    hint: 'Mobile repair technicians will reach your vehicle location directly.',
  },
};

const resolveServiceConfig = (type) => {
  const raw = (type || 'auto').toLowerCase().trim();
  if (raw.includes('ambulance') || raw.includes('emergenc')) {
    return SERVICE_INFO.ambulance;
  }
  if (raw.includes('puncture') || raw.includes('tyre') || raw.includes('repair') || raw.includes('mechanic')) {
    return SERVICE_INFO.puncture;
  }
  return SERVICE_INFO.auto;
};

const ServiceBooking = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const service = resolveServiceConfig(type);
  const ServiceIcon = service.icon;

  const [location, setLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(true);
  const [locError, setLocError] = useState(null);

  const [address, setAddress] = useState(user?.address || '');
  const [description, setDescription] = useState(service.defaultDesc);

  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState(null);

  // Acquire real GPS coordinates from device
  const fetchLocation = useCallback(async () => {
    try {
      setLocLoading(true);
      setLocError(null);
      const coords = await getCurrentLocation({ enableHighAccuracy: true });
      setLocation(coords);
    } catch (err) {
      setLocError(err.message || 'Location permission is required to find nearby services.');
    } finally {
      setLocLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocation();
  }, [fetchLocation]);

  // Update default description if service type changes
  useEffect(() => {
    setDescription(service.defaultDesc);
  }, [service.defaultDesc]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setError(null);

    if (!user || !user.id) {
      setError('You must be signed in to request a service.');
      return;
    }

    if (!location || typeof location.latitude !== 'number' || typeof location.longitude !== 'number') {
      setError('Valid GPS location is required. Please enable device location and tap Refresh GPS.');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        user: user.id,
        service_type: service.type,
        latitude: location.latitude,
        longitude: location.longitude,
        address: address.trim() || 'Current GPS Location',
        description: description.trim() || service.defaultDesc,
      };

      const response = await createServiceRequest(payload);

      // Backend returns created request object with id
      const createdId = (response.request && typeof response.request === 'object' ? response.request.id : response.request) || response.id || response.request_id;
      
      // Save active booking in local storage for quick access
      storage.setActiveBooking({
        id: createdId,
        service_type: service.type,
        status: 'pending',
        address: payload.address,
        latitude: payload.latitude,
        longitude: payload.longitude,
        createdAt: new Date().toISOString(),
      });

      setSubmitSuccess(true);

      setTimeout(() => {
        navigate(`/booking/${createdId}`);
      }, 1200);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create service request. Please try again.'));
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 bg-[#FAF8F5]">
      {/* Back button & Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/home')}
          className="p-2.5 rounded-2xl bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-emerald-950 leading-tight">
            {service.title}
          </h1>
          <p className="text-xs text-emerald-800/70 font-medium">
            Confirm your real-time coordinates and dispatch details
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-2" />}

      {submitSuccess && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 p-4 rounded-3xl flex items-center gap-3 shadow-md animate-in zoom-in-95 duration-200">
          <CheckCircle2 className="w-6 h-6 text-emerald-700 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-black">Your request has been sent to nearby providers.</h4>
            <p className="text-xs text-emerald-800 mt-0.5">Redirecting to live tracking radar...</p>
          </div>
        </div>
      )}

      {/* Service Summary Card */}
      <div className="bg-white border border-emerald-200 rounded-3xl p-5 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl ${service.color} flex items-center justify-center shadow-xs`}>
            <ServiceIcon className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              {service.badge}
            </span>
            <h3 className="text-base font-bold text-emerald-950 mt-1">
              {service.name}
            </h3>
          </div>
        </div>

        <span className="text-xs font-bold text-emerald-900 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
          Auto-Matched
        </span>
      </div>

      {/* Real GPS Coordinate Card & Map */}
      <div className="bg-white border border-emerald-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-emerald-800" />
            <h3 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
              Real Device Location
            </h3>
          </div>

          <button
            type="button"
            onClick={fetchLocation}
            disabled={locLoading}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${locLoading ? 'animate-spin' : ''}`} />
            <span>{locLoading ? 'Detecting...' : 'Refresh GPS'}</span>
          </button>
        </div>

        {/* Location Status Notice */}
        {locError ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="font-bold">Location Permission Needed</p>
              <p className="text-emerald-900/80 leading-relaxed">{locError}</p>
              <p className="text-[11px] font-semibold text-emerald-800">
                Please tap "Allow" in your browser's location permission prompt to proceed.
              </p>
            </div>
          </div>
        ) : location ? (
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-800/80">Latitude</p>
              <p className="text-xs font-mono font-bold text-emerald-950">
                {location.latitude.toFixed(6)}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase text-emerald-800/80">Longitude</p>
              <p className="text-xs font-mono font-bold text-emerald-950">
                {location.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        ) : null}

        {/* Leaflet Map Preview with real user coordinates */}
        <div className="mt-2">
          <MapView userLocation={location} height="220px" />
        </div>
      </div>

      {/* Booking Form */}
      <form onSubmit={handleSubmitBooking} className="bg-white border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        {/* Address / Landmark (Optional) */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
            Pickup Address / Landmark (Optional)
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near New Bus Stand, 5th Cross Road"
              className="w-full pl-10 pr-4 py-3 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-emerald-950 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Description Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
            Details / Specific Request
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Describe your requirement (e.g. 2 passengers, front tyre puncture, etc.)"
            className="w-full p-3.5 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-emerald-950 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all resize-none"
          />
        </div>

        {/* Submit Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={submitting || locLoading || !location}
            className="w-full py-4 px-6 rounded-2xl font-bold text-sm sm:text-base text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <span>Finding nearby services...</span>
            ) : locLoading ? (
              <span>Acquiring Device GPS...</span>
            ) : (
              <>
                <span>Confirm & Request {service.name}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ServiceBooking;
