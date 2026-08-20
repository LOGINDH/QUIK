import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { updateProviderLocation, completeRequest, extractErrorMessage } from '../services/api';
import { getCurrentLocation } from '../utils/location';
import { storage } from '../utils/storage';
import MapView from '../components/MapView';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import ConfirmDialog from '../components/ConfirmDialog';
import { Phone, MapPin, Navigation, CheckCircle2, ArrowLeft, ShieldCheck, Clock, Check, AlertCircle } from 'lucide-react';

const ProviderActiveRequest = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const routerLocation = useLocation();
  const { provider } = useAuth();

  const [requestDetails, setRequestDetails] = useState(() => {
    return routerLocation?.state?.requestData || storage.getActiveProviderRequest();
  });
  const [providerCoords, setProviderCoords] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [lastLocationSync, setLastLocationSync] = useState(null);

  const [completing, setCompleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const locationSyncIntervalRef = useRef(null);

  // Send real GPS update to backend PUT /location/
  const sendRealLocationUpdate = useCallback(async () => {
    if (!provider?.id) return;
    try {
      setLocLoading(true);
      const coords = await getCurrentLocation({ enableHighAccuracy: true });
      setProviderCoords(coords);

      await updateProviderLocation(provider.id, coords.latitude, coords.longitude);
      setLastLocationSync(new Date());
    } catch (err) {
      console.warn('Provider live GPS update failed:', err);
    } finally {
      setLocLoading(false);
    }
  }, [provider?.id]);

  // Fetch initial request info
  useEffect(() => {
    if (!requestDetails) {
      const cached = storage.getActiveProviderRequest();
      if (cached) setRequestDetails(cached);
    }

    sendRealLocationUpdate();

    // Periodically send provider's real location updates
    locationSyncIntervalRef.current = setInterval(() => {
      sendRealLocationUpdate();
    }, 5000); // 5 second continuous GPS update interval

    return () => {
      if (locationSyncIntervalRef.current) {
        clearInterval(locationSyncIntervalRef.current);
      }
    };
  }, [sendRealLocationUpdate, requestDetails]);

  // Complete Service handler: PUT /complete/
  const handleCompleteService = async () => {
    if (!provider?.id || !id) return;
    try {
      setCompleting(true);
      setError(null);

      await completeRequest(provider.id, id);

      // Stop location updates immediately
      if (locationSyncIntervalRef.current) {
        clearInterval(locationSyncIntervalRef.current);
      }

      setSuccessMsg('Service completed successfully!');
      setTimeout(() => {
        navigate('/provider/dashboard');
      }, 1500);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to mark service as completed.'));
      setCompleting(false);
      setShowConfirm(false);
    }
  };

  const userLocation = requestDetails?.user_latitude && requestDetails?.user_longitude ? {
    latitude: parseFloat(requestDetails.user_latitude),
    longitude: parseFloat(requestDetails.user_longitude),
  } : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 bg-[#FAF8F5]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/provider/dashboard')}
            className="p-2.5 rounded-2xl bg-white border border-emerald-200 text-emerald-900 hover:bg-emerald-50 transition-colors shadow-2xs cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950 leading-tight">
                Active Service #{id}
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-800 text-white">
                In Progress
              </span>
            </div>
            <p className="text-xs text-emerald-800/70 font-medium">
              Live GPS beacon transmitting to customer
            </p>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} className="mb-2" />}

      {successMsg && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 p-5 rounded-3xl flex items-center gap-3 shadow-md">
          <CheckCircle2 className="w-8 h-8 text-emerald-700 flex-shrink-0" />
          <div>
            <h3 className="text-base font-black">Service completed</h3>
            <p className="text-xs text-emerald-800 mt-0.5">Returning to provider dashboard...</p>
          </div>
        </div>
      )}

      {/* GPS Transmission Banner */}
      <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-xs">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <p className="text-xs font-bold text-emerald-950">
              Live GPS Updates Active
            </p>
            <p className="text-[11px] text-emerald-800/80">
              {lastLocationSync
                ? `Transmitted real coordinates at ${lastLocationSync.toLocaleTimeString()}`
                : 'Transmitting device coordinates...'}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={sendRealLocationUpdate}
          disabled={locLoading}
          className="px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-xs font-bold text-emerald-900 hover:bg-emerald-100 transition-colors cursor-pointer"
        >
          {locLoading ? 'Syncing...' : 'Sync GPS'}
        </button>
      </div>

      {/* Customer Information Card */}
      <div className="bg-white border-2 border-emerald-200 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Passenger Details
            </span>
            <h3 className="text-lg font-black text-emerald-950 mt-1.5">
              {requestDetails?.user_name || requestDetails?.user?.name || 'Customer'}
            </h3>
          </div>

          {(requestDetails?.user_phone || requestDetails?.user?.phone) && (
            <a
              href={`tel:${requestDetails.user_phone || requestDetails.user?.phone}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>Call Passenger</span>
            </a>
          )}
        </div>

        {/* Destination / Address */}
        <div className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <MapPin className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-emerald-950">Pickup Location / Landmark</p>
            <p className="text-emerald-900/80 mt-0.5">
              {requestDetails?.address || 'Customer GPS Location provided'}
            </p>
          </div>
        </div>

        {requestDetails?.description && (
          <div className="text-xs text-emerald-900 italic bg-emerald-50/30 p-3 rounded-xl border border-emerald-100">
            "{requestDetails.description}"
          </div>
        )}
      </div>

      {/* Map View */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
            Navigation Route
          </h4>
          <span className="text-[10px] text-emerald-800/70 font-semibold">
            Real Device Telemetry
          </span>
        </div>

        <MapView
          userLocation={userLocation}
          providerLocation={providerCoords}
          providerName="Your Vehicle"
          serviceType={provider?.service_type || 'auto'}
          height="300px"
        />
      </div>

      {/* Complete Service Action */}
      <div className="pt-3">
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          disabled={completing}
          className="w-full py-4 px-6 rounded-2xl font-bold text-base text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Check className="w-5 h-5" />
          <span>{completing ? 'Completing Service...' : 'Complete Service'}</span>
        </button>
      </div>

      {/* Confirm Completion Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        title="Complete Service"
        message="Are you sure you want to mark this request as completed? This will conclude the customer trip and make you available for new requests."
        confirmText="Yes, Complete Service"
        cancelText="Cancel"
        onConfirm={handleCompleteService}
        onCancel={() => setShowConfirm(false)}
        isLoading={completing}
      />
    </div>
  );
};

export default ProviderActiveRequest;
