import React from 'react';
import { MapPin, Navigation, AlertCircle, RefreshCw } from 'lucide-react';

const LocationStatus = ({
  location,
  loading = false,
  error = null,
  onRefresh,
  className = '',
}) => {
  return (
    <div
      className={`bg-white border border-emerald-100 rounded-2xl p-3.5 shadow-xs flex items-center justify-between gap-3 ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={`p-2.5 rounded-xl flex-shrink-0 ${
          error ? 'bg-emerald-100 text-emerald-900' : 'bg-emerald-50 text-emerald-800'
        }`}>
          {error ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Navigation className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : 'text-emerald-800'}`} />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800/80">
              Live Device GPS
            </span>
            {location && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                Active
              </span>
            )}
          </div>

          <p className="text-xs font-medium text-emerald-950 truncate mt-0.5">
            {loading
              ? 'Acquiring high-accuracy GPS coordinates...'
              : error
              ? error
              : location
              ? `${location.latitude?.toFixed(5)}, ${location.longitude?.toFixed(5)} ${
                  location.accuracy ? `(±${Math.round(location.accuracy)}m)` : ''
                }`
              : 'GPS ready. Tap to detect location.'}
          </p>
        </div>
      </div>

      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="flex-shrink-0 p-2 rounded-xl text-emerald-800 hover:bg-emerald-50 active:bg-emerald-100 transition-colors disabled:opacity-50 cursor-pointer"
          title="Refresh GPS"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
};

export default LocationStatus;
