import React from 'react';
import { Phone, MapPin, Navigation, Clock, Check, X, Car, Ambulance, Wrench, AlertCircle } from 'lucide-react';

const getServiceMeta = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('ambulance') || t.includes('emergenc')) {
    return { name: 'Ambulance Request', icon: Ambulance, color: 'bg-emerald-950 text-white', badge: 'EMERGENCY' };
  }
  if (t.includes('puncture') || t.includes('tyre') || t.includes('repair')) {
    return { name: 'Puncture Request', icon: Wrench, color: 'bg-emerald-700 text-white', badge: 'ROADSIDE' };
  }
  return { name: 'Auto Ride Request', icon: Car, color: 'bg-emerald-800 text-white', badge: 'TRANSIT' };
};

const ProviderRequestCard = ({
  request,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}) => {
  if (!request) return null;

  const reqId = request.id || request.request_id;
  const meta = getServiceMeta(request.service_type);
  const IconComponent = meta.icon;

  return (
    <div className="bg-white border border-emerald-200 hover:border-emerald-400 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 space-y-4">
      {/* Header with Service & Request ID */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${meta.color} flex items-center justify-center shadow-xs`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-emerald-950">
                {meta.name}
              </h4>
              <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                #{reqId}
              </span>
            </div>
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-emerald-900 bg-emerald-100/80 px-2 py-0.5 rounded-full mt-1">
              {meta.badge}
            </span>
          </div>
        </div>

        {/* Distance & ETA Pills */}
        <div className="text-right flex flex-col items-end gap-1">
          {request.distance_km != null && !isNaN(parseFloat(request.distance_km)) && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-950 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-xl">
              <Navigation className="w-3.5 h-3.5 text-emerald-800" />
              {parseFloat(request.distance_km).toFixed(2)} km
            </span>
          )}
          {request.estimated_minutes != null && !isNaN(parseInt(request.estimated_minutes, 10)) && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-white border border-emerald-200 px-2 py-0.5 rounded-lg">
              <Clock className="w-3 h-3 text-emerald-700" />
              ~{parseInt(request.estimated_minutes, 10)} min arrival
            </span>
          )}
        </div>
      </div>

      {/* Customer Info */}
      <div className="bg-emerald-50/50 rounded-2xl p-3.5 border border-emerald-100/80 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-bold text-emerald-950">
            {request.user_name || (request.user?.name) || 'Customer'}
          </p>
          {(request.user_phone || request.user?.phone) && (
            <a
              href={`tel:${request.user_phone || request.user?.phone}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white px-2.5 py-1 rounded-xl border border-emerald-200 shadow-2xs"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>{request.user_phone || request.user?.phone}</span>
            </a>
          )}
        </div>

        {/* Address / Landmark */}
        <div className="flex items-start gap-2 pt-1">
          <MapPin className="w-4 h-4 text-emerald-800 flex-shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-emerald-950 leading-snug">
              {request.address || 'GPS Coordinates provided'}
            </p>
            {(request.user_latitude || request.latitude) && (request.user_longitude || request.longitude) && (
              <p className="text-[10px] text-emerald-800/70 font-mono mt-0.5">
                Lat: {parseFloat(request.user_latitude || request.latitude).toFixed(5)}, Lng: {parseFloat(request.user_longitude || request.longitude).toFixed(5)}
              </p>
            )}
          </div>
        </div>

        {/* Issue Description */}
        {request.description && (
          <div className="pt-2 border-t border-emerald-100 text-xs text-emerald-900/90 italic">
            "{request.description}"
          </div>
        )}
      </div>

      {/* Action Buttons: Accept & Reject */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={() => onReject(reqId)}
          disabled={isRejecting || isAccepting}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold text-emerald-900 bg-white border border-emerald-300 hover:bg-emerald-50 active:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer shadow-2xs"
        >
          <X className="w-4 h-4 text-emerald-700" />
          <span>{isRejecting ? 'Rejecting...' : 'Decline'}</span>
        </button>

        <button
          type="button"
          onClick={() => onAccept(reqId)}
          disabled={isAccepting || isRejecting}
          className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>{isAccepting ? 'Accepting...' : 'Accept Request'}</span>
        </button>
      </div>
    </div>
  );
};

export default ProviderRequestCard;
