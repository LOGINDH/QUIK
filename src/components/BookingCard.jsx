import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { Car, Ambulance, Wrench, Navigation, ArrowRight, Clock, MapPin } from 'lucide-react';

const getServiceMeta = (type) => {
  const t = (type || '').toLowerCase();
  if (t === 'ambulance') return { name: 'Ambulance', icon: Ambulance, color: 'bg-emerald-950 text-white' };
  if (t === 'puncture') return { name: 'Puncture Help', icon: Wrench, color: 'bg-emerald-700 text-white' };
  return { name: 'Auto Rickshaw', icon: Car, color: 'bg-emerald-800 text-white' };
};

const BookingCard = ({ booking, onClear }) => {
  const navigate = useNavigate();
  if (!booking) return null;

  const serviceMeta = getServiceMeta(booking.service_type);
  const IconComponent = serviceMeta.icon;

  const handleTrack = () => {
    navigate(`/booking/${booking.id || booking.request_id || booking.request}`);
  };

  return (
    <div className="bg-white border-2 border-emerald-300 rounded-3xl p-5 shadow-md relative overflow-hidden">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl ${serviceMeta.color} flex items-center justify-center shadow-xs`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-emerald-950">
                {serviceMeta.name}
              </h4>
              <span className="text-[11px] font-mono text-emerald-800/70 font-semibold">
                #{booking.id || booking.request_id || booking.request}
              </span>
            </div>
            <p className="text-xs text-emerald-800/80 font-medium">
              {booking.address || 'GPS Pickup Location'}
            </p>
          </div>
        </div>

        <StatusBadge status={booking.status || 'pending'} />
      </div>

      {/* ETA and Distance Highlights if accepted */}
      {booking.status === 'accepted' && (() => {
        const dist = booking.distance_km ?? booking.provider?.distance_km;
        const eta = booking.estimated_minutes ?? booking.provider?.estimated_minutes;
        const parsedDist = dist != null && !isNaN(parseFloat(dist)) ? parseFloat(dist) : null;
        const parsedEta = eta != null && !isNaN(parseInt(eta, 10)) ? parseInt(eta, 10) : (parsedDist != null ? Math.max(1, Math.round((parsedDist / 30) * 60)) : null);

        return (
          <div className="grid grid-cols-2 gap-2 my-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-2">
              <Navigation className="w-4 h-4 text-emerald-800" />
              <div>
                <p className="text-[10px] text-emerald-800/70 uppercase font-bold">Distance</p>
                <p className="text-xs font-bold text-emerald-950">
                  {parsedDist != null ? `${parsedDist.toFixed(2)} km away` : 'Approaching'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" />
              <div>
                <p className="text-[10px] text-emerald-800/70 uppercase font-bold">ETA</p>
                <p className="text-xs font-bold text-emerald-950">
                  {parsedEta != null ? `~${parsedEta} mins` : 'Arriving soon'}
                </p>
              </div>
            </div>
          </div>
        );
      })()}

      <div className="flex items-center justify-between pt-3 border-t border-emerald-100 mt-2">
        <p className="text-[11px] text-emerald-800/80">
          {booking.status === 'completed'
            ? 'Service completed successfully'
            : booking.status === 'accepted'
            ? 'Provider is navigating to your spot'
            : 'Looking for nearby providers...'}
        </p>

        <button
          type="button"
          onClick={handleTrack}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs transition-colors cursor-pointer"
        >
          <span>Track Live</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default BookingCard;
