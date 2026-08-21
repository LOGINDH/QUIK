import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRequestStatus, extractErrorMessage } from '../services/api';
import { getCurrentLocation, calculateDistanceKm, calculateEtaMinutes } from '../utils/location';
import { storage } from '../utils/storage';
import MapView from '../components/MapView';
import ProviderCard from '../components/ProviderCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Phone, Navigation, ShieldCheck, MapPin, Clock } from 'lucide-react';

const BookingTracking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingData, setBookingData] = useState(null);
  const [userCoords, setUserCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const pollIntervalRef = useRef(null);

  // Fetch real device location of user
  useEffect(() => {
    let isMounted = true;
    getCurrentLocation()
      .then((loc) => {
        if (isMounted) setUserCoords(loc);
      })
      .catch((err) => {
        console.warn('Could not refresh device GPS during tracking:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Poll status endpoint: GET /status/?user=userId&request=id
  const fetchStatus = useCallback(async (isInitial = false) => {
    if (!user?.id || !id) return;

    try {
      if (isInitial) setLoading(true);
      const data = await getRequestStatus(user.id, id);

      setBookingData(data);
      setLastUpdated(new Date());
      setError(null);

      // Cache updated status in storage
      if (data) {
        const provObj = data.provider && typeof data.provider === 'object' ? data.provider : null;
        const dist = data.distance_km ?? provObj?.distance_km;
        const eta = data.estimated_minutes ?? provObj?.estimated_minutes;

        storage.setActiveBooking({
          id,
          service_type: data.service_type || data.request?.service_type || provObj?.service_type,
          status: data.status,
          distance_km: dist != null ? parseFloat(dist) : null,
          estimated_minutes: eta != null ? parseInt(eta, 10) : null,
          provider_name: data.provider_name || provObj?.name,
          provider_phone: data.provider_phone || provObj?.phone,
          updatedAt: new Date().toISOString(),
        });
      }

      // Stop polling if completed or cancelled
      if (data?.status === 'completed' || data?.status === 'cancelled') {
        setPolling(false);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Unable to fetch current booking status.'));
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [user?.id, id]);

  // Polling loop
  useEffect(() => {
    fetchStatus(true);

    if (polling) {
      pollIntervalRef.current = setInterval(() => {
        fetchStatus(false);
      }, 4000); // Reasonable 4-second update interval
    }

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchStatus, polling]);

  const currentStatus = (bookingData?.status || bookingData?.request?.status || 'pending').toLowerCase();
  const providerObj = bookingData?.provider && typeof bookingData.provider === 'object' ? bookingData.provider : null;

  const providerName =
    bookingData?.provider_name ||
    providerObj?.name ||
    'Assigned Provider';

  const providerPhone =
    bookingData?.provider_phone ||
    providerObj?.phone;

  const serviceType =
    bookingData?.service_type ||
    bookingData?.request?.service_type ||
    providerObj?.service_type ||
    'auto';

  // Extract provider location if backend provides it (including approximate_latitude/longitude)
  const providerLat =
    providerObj?.approximate_latitude ??
    providerObj?.latitude ??
    bookingData?.provider_latitude ??
    bookingData?.latitude ??
    bookingData?.provider_location?.latitude;

  const providerLng =
    providerObj?.approximate_longitude ??
    providerObj?.longitude ??
    bookingData?.provider_longitude ??
    bookingData?.longitude ??
    bookingData?.provider_location?.longitude;

  const providerLocation = (providerLat != null && providerLng != null && !isNaN(parseFloat(providerLat)) && !isNaN(parseFloat(providerLng))) ? {
    latitude: parseFloat(providerLat),
    longitude: parseFloat(providerLng),
  } : null;

  // Extract user coordinates from device or bookingData
  const bookingUserLat =
    bookingData?.user_latitude ??
    bookingData?.user?.latitude ??
    bookingData?.request?.latitude;

  const bookingUserLng =
    bookingData?.user_longitude ??
    bookingData?.user?.longitude ??
    bookingData?.request?.longitude;

  const effectiveUserCoords = userCoords || (bookingUserLat != null && bookingUserLng != null && !isNaN(parseFloat(bookingUserLat)) && !isNaN(parseFloat(bookingUserLng)) ? {
    latitude: parseFloat(bookingUserLat),
    longitude: parseFloat(bookingUserLng),
  } : null);

  // Extract or calculate distance
  const rawDistance =
    bookingData?.distance_km ??
    providerObj?.distance_km ??
    bookingData?.request?.distance_km;

  let effectiveDistance = null;
  if (rawDistance != null && !isNaN(parseFloat(rawDistance))) {
    effectiveDistance = parseFloat(rawDistance);
  } else if (effectiveUserCoords && providerLocation) {
    effectiveDistance = calculateDistanceKm(
      effectiveUserCoords.latitude,
      effectiveUserCoords.longitude,
      providerLocation.latitude,
      providerLocation.longitude
    );
  }

  // Extract or calculate estimated minutes (ETA)
  const rawEta =
    bookingData?.estimated_minutes ??
    providerObj?.estimated_minutes ??
    bookingData?.request?.estimated_minutes;

  let effectiveEta = null;
  if (rawEta != null && !isNaN(parseInt(rawEta, 10))) {
    effectiveEta = parseInt(rawEta, 10);
  } else if (effectiveDistance != null) {
    effectiveEta = calculateEtaMinutes(effectiveDistance, serviceType);
  }

  if (loading && !bookingData) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-[#FAF8F5]">
        <LoadingSpinner message="Connecting to live dispatch network..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 bg-[#FAF8F5]">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="p-2.5 rounded-2xl bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950 leading-tight">
                Request #{id}
              </h1>
              <StatusBadge status={currentStatus} />
            </div>
            <p className="text-xs text-emerald-800/70 font-medium">
              Live tracking and verified GPS telemetry
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchStatus(false)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-900 hover:bg-emerald-50 shadow-2xs cursor-pointer"
          title="Refresh telemetry"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} className="mb-2" />}

      {/* STATUS BANNER */}
      {currentStatus === 'pending' && (
        <div className="bg-white border-2 border-emerald-300 rounded-3xl p-6 shadow-md text-center space-y-4 relative overflow-hidden">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-emerald-100/80 animate-ping absolute" />
            <div className="w-16 h-16 rounded-full bg-emerald-800 text-white flex items-center justify-center relative z-10 shadow-md">
              <Navigation className="w-8 h-8 animate-pulse" />
            </div>
          </div>

          <div>
            <h2 className="text-lg sm:text-xl font-black text-emerald-950">
              Looking for a nearby service provider...
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900/80 mt-1 max-w-md mx-auto leading-relaxed">
              Your request has been broadcast to active {bookingData?.service_type || 'service'} drivers in your immediate area. You will be alerted the second a driver accepts.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-900">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>Telemetry active • Checking every few seconds</span>
          </div>
        </div>
      )}

      {currentStatus === 'accepted' && (
        <div className="space-y-4 animate-in fade-in duration-300">
          {/* Arrival Status Banner */}
          <div className="bg-emerald-800 text-white rounded-3xl p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-200 bg-emerald-900/60 px-2.5 py-0.5 rounded-md">
                En Route
              </span>
              <h2 className="text-xl sm:text-2xl font-black">
                {providerName} is on the way
              </h2>
              <p className="text-xs sm:text-sm text-emerald-100">
                {effectiveDistance != null
                  ? `${effectiveDistance.toFixed(2)} km away • Arriving in approximately ${effectiveEta || 1} min`
                  : 'Approaching your current GPS location'}
              </p>
            </div>

            {providerPhone && (
              <a
                href={`tel:${providerPhone}`}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-emerald-950 text-xs sm:text-sm font-bold shadow-md hover:bg-emerald-50 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Call Driver</span>
              </a>
            )}
          </div>

          {/* Provider Card with ETA */}
          <ProviderCard
            providerName={providerName}
            providerPhone={providerPhone}
            serviceType={serviceType}
            distanceKm={effectiveDistance}
            estimatedMinutes={effectiveEta}
            latitude={providerLat}
            longitude={providerLng}
            status="accepted"
          />
        </div>
      )}

      {currentStatus === 'completed' && (
        <div className="bg-white border-2 border-emerald-400 rounded-3xl p-6 shadow-lg text-center space-y-4 animate-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950">
              Service completed successfully
            </h2>
            <p className="text-xs sm:text-sm text-emerald-900/80 mt-1 max-w-md mx-auto">
              Your service request has been marked as finished by the provider. Thank you for using Kuiky!
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/home"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-md transition-colors"
            >
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      )}

      {/* Interactive Telemetry Map */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Live Telemetry Map
          </h3>
          <span className="text-[10px] text-emerald-800/70 font-mono">
            Updated {lastUpdated.toLocaleTimeString()}
          </span>
        </div>

        <MapView
          userLocation={effectiveUserCoords}
          providerLocation={providerLocation}
          providerName={providerName}
          serviceType={serviceType}
          height="340px"
        />
      </div>
    </div>
  );
};

export default BookingTracking;
