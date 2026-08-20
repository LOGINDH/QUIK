import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getProviderRequests, acceptRequest, rejectRequest, updateProviderLocation, extractErrorMessage } from '../services/api';
import { getCurrentLocation } from '../utils/location';
import { storage } from '../utils/storage';
import ProviderRequestCard from '../components/ProviderRequestCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { Inbox, ArrowLeft, RefreshCw, CheckCircle2, AlertCircle, Navigation } from 'lucide-react';

const ProviderRequests = () => {
  const navigate = useNavigate();
  const { provider } = useAuth();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionType, setActionType] = useState(null); // 'accept' | 'reject'

  // Ensure provider location is synced to backend PUT /location/
  const syncLocation = useCallback(async () => {
    if (!provider?.id) return;
    try {
      const coords = await getCurrentLocation({ enableHighAccuracy: true });
      await updateProviderLocation(provider.id, coords.latitude, coords.longitude);
    } catch (err) {
      console.warn('Provider GPS sync in requests page:', err);
    }
  }, [provider?.id]);

  const fetchRequests = useCallback(async (isInitial = false) => {
    if (!provider?.id) return;
    try {
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      setError(null);

      // Ping GPS location alongside request fetching
      syncLocation();

      const data = await getProviderRequests(provider.id);
      if (Array.isArray(data)) {
        setRequests(data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to fetch incoming requests.'));
    } finally {
      if (isInitial) setLoading(false);
      setRefreshing(false);
    }
  }, [provider?.id, syncLocation]);

  useEffect(() => {
    fetchRequests(true);

    // Poll for new requests every 5 seconds
    const interval = setInterval(() => {
      fetchRequests(false);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchRequests]);

  // Handle Accept
  const handleAccept = async (requestId) => {
    if (!provider?.id || !requestId) return;
    try {
      setActionLoadingId(requestId);
      setActionType('accept');
      setError(null);

      // Find the request item to cache details for active navigation view
      const selectedReq = requests.find((r) => (r.id || r.request_id) === requestId);

      const response = await acceptRequest(provider.id, requestId);

      if (selectedReq) {
        storage.setActiveProviderRequest({
          ...selectedReq,
          id: requestId,
          request_id: requestId,
          status: 'accepted',
          accepted_at: new Date().toISOString(),
        });
      }

      setSuccessMsg(`Request #${requestId} accepted! Opening active navigation...`);

      setTimeout(() => {
        navigate(`/provider/request/${requestId}`, {
          state: { requestData: selectedReq || response?.request },
        });
      }, 800);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to accept request. It may have been taken by another provider.'));
      setActionLoadingId(null);
      setActionType(null);
      fetchRequests(false);
    }
  };

  // Handle Reject
  const handleReject = async (requestId) => {
    if (!provider?.id || !requestId) return;
    try {
      setActionLoadingId(requestId);
      setActionType('reject');
      setError(null);

      await rejectRequest(provider.id, requestId);

      // Remove from list immediately
      setRequests((prev) => prev.filter((r) => (r.id || r.request_id) !== requestId));
      setSuccessMsg(`Request #${requestId} declined.`);
      setTimeout(() => setSuccessMsg(null), 2500);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to reject request.'));
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

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
                Incoming Requests
              </h1>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                {requests.length} Active
              </span>
            </div>
            <p className="text-xs text-emerald-800/70 font-medium">
              Filtered for your category ({provider?.service_type || 'auto'})
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => fetchRequests(false)}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-xs font-bold text-emerald-900 hover:bg-emerald-50 shadow-2xs cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => fetchRequests(true)} className="mb-2" />}

      {successMsg && (
        <div className="bg-emerald-100 border border-emerald-300 text-emerald-950 p-4 rounded-2xl flex items-center gap-2.5 shadow-2xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
          <p className="text-xs sm:text-sm font-bold">{successMsg}</p>
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="py-12">
          <LoadingSpinner message="Checking for nearby requests..." size="lg" />
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-emerald-100 rounded-3xl p-8 text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto shadow-2xs border border-emerald-200">
            <Inbox className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-emerald-950">
            No incoming service requests right now
          </h3>
          <p className="text-xs text-emerald-800/70 max-w-sm mx-auto leading-relaxed">
            Keep your dashboard open with GPS enabled. New requests from nearby customers will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <ProviderRequestCard
              key={req.id}
              request={req}
              onAccept={handleAccept}
              onReject={handleReject}
              isAccepting={actionLoadingId === req.id && actionType === 'accept'}
              isRejecting={actionLoadingId === req.id && actionType === 'reject'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderRequests;
