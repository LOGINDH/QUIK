import React, { useState } from 'react';
import { getImageUrl } from '../services/api';
import { Sparkles, Shield, AlertTriangle, Wrench, Car, Ambulance } from 'lucide-react';

const getServiceIcon = (type) => {
  const t = (type || '').toLowerCase();
  if (t === 'ambulance') return Ambulance;
  if (t === 'puncture') return Wrench;
  return Car;
};

const AdvertisementCard = ({ ad, className = '' }) => {
  const [imgError, setImgError] = useState(false);
  const fullImageUrl = ad.image ? getImageUrl(ad.image) : null;
  const ServiceIcon = getServiceIcon(ad.service_type);

  return (
    <div
      className={`relative overflow-hidden rounded-3xl bg-white border border-emerald-100 shadow-sm flex flex-col md:flex-row min-h-[160px] ${className}`}
    >
      {/* Background Accent Gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/80 via-white to-emerald-50/30 pointer-events-none" />

      {/* Content Section */}
      <div className="relative z-10 p-5 md:p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
              <Sparkles className="w-3 h-3 text-emerald-700" />
              {ad.service_type ? ad.service_type.toUpperCase() : 'FEATURED'}
            </span>
            <span className="text-[11px] font-medium text-emerald-800/70">Verified Partner</span>
          </div>

          <h4 className="text-base sm:text-lg font-bold text-emerald-950 leading-snug">
            {ad.title || 'Kuiky Priority Assistance'}
          </h4>

          <p className="text-xs sm:text-sm text-emerald-900/80 mt-1 line-clamp-2 leading-relaxed max-w-md">
            {ad.description || 'Fast, reliable and verified service available near your location.'}
          </p>
        </div>

        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-emerald-100/60">
          <div className="w-6 h-6 rounded-full bg-emerald-800 text-white flex items-center justify-center">
            <ServiceIcon className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-emerald-900">
            Available 24/7 on Kuiky
          </span>
        </div>
      </div>

      {/* Image or Fallback Graphics Container */}
      <div className="relative z-10 w-full md:w-44 h-36 md:h-auto bg-emerald-100/50 flex-shrink-0 flex items-center justify-center overflow-hidden">
        {fullImageUrl && !imgError ? (
          <img
            src={fullImageUrl}
            alt={ad.title || 'Advertisement'}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-white text-emerald-800 flex items-center justify-center shadow-xs mb-2 border border-emerald-200">
              <ServiceIcon className="w-7 h-7" />
            </div>
            <span className="text-[11px] font-bold text-emerald-900 tracking-wide uppercase">
              Kuiky Service
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvertisementCard;
