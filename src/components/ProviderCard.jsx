import React from 'react';
import { Phone, ShieldCheck, Navigation, Clock, Car, Ambulance, Wrench } from 'lucide-react';

const getServiceMeta = (type) => {
  const t = (type || '').toLowerCase();
  if (t === 'ambulance') return { name: 'Ambulance Unit', icon: Ambulance, color: 'bg-emerald-950 text-white' };
  if (t === 'puncture') return { name: 'Puncture Specialist', icon: Wrench, color: 'bg-emerald-700 text-white' };
  return { name: 'Auto Driver', icon: Car, color: 'bg-emerald-800 text-white' };
};

const ProviderCard = ({
  providerName = 'Assigned Provider',
  providerPhone,
  serviceType = 'auto',
  distanceKm,
  estimatedMinutes,
  latitude,
  longitude,
  status = 'accepted',
}) => {
  const meta = getServiceMeta(serviceType);
  const IconComponent = meta.icon;

  return (
    <div className="bg-white border-2 border-emerald-300 rounded-3xl p-5 shadow-lg space-y-4">
      {/* Provider Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl ${meta.color} flex items-center justify-center shadow-xs`}>
            <IconComponent className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-base font-bold text-emerald-950">
                {providerName}
              </h3>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <p className="text-xs text-emerald-800/80 font-semibold uppercase tracking-wider">
              {meta.name}
            </p>
          </div>
        </div>

        {providerPhone && (
          <a
            href={`tel:${providerPhone}`}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Call</span>
          </a>
        )}
      </div>

      {/* Real-time ETA & Distance stats from Backend */}
      <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white text-emerald-800 shadow-2xs border border-emerald-200">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800/80 tracking-wider">Distance</span>
            <p className="text-sm font-black text-emerald-950">
              {distanceKm != null ? `${distanceKm} km away` : 'Calculating...'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-white text-emerald-800 shadow-2xs border border-emerald-200">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-emerald-800/80 tracking-wider">Estimated Arrival</span>
            <p className="text-sm font-black text-emerald-950">
              {estimatedMinutes != null ? `~${estimatedMinutes} mins` : 'On the way'}
            </p>
          </div>
        </div>
      </div>

      {/* Location Coordinates if available */}
      {latitude != null && longitude != null && (
        <div className="text-[11px] text-emerald-800/80 flex items-center justify-between px-1">
          <span>Provider GPS Coordinates:</span>
          <span className="font-mono font-semibold text-emerald-950">
            {parseFloat(latitude).toFixed(5)}, {parseFloat(longitude).toFixed(5)}
          </span>
        </div>
      )}
    </div>
  );
};

export default ProviderCard;
