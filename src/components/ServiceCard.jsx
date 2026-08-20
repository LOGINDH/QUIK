import React from 'react';
import { Car, Ambulance, Wrench, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SERVICE_CONFIG = {
  auto: {
    type: 'auto',
    name: 'Auto Rickshaw',
    shortName: 'AUTO',
    subtitle: 'Daily Transit & Quick Rides',
    description: 'Find a nearby auto driver quickly with real-time GPS tracking.',
    icon: Car,
    tag: 'Fast Pickup',
    accentColor: 'bg-emerald-800 text-white',
    badgeBg: 'bg-emerald-100 text-emerald-900',
    borderColor: 'border-emerald-200 hover:border-emerald-500',
    route: '/service/auto',
  },
  ambulance: {
    type: 'ambulance',
    name: 'Emergency Ambulance',
    shortName: 'AMBULANCE',
    subtitle: '24/7 Rapid Medical Response',
    description: 'Get emergency medical ambulance assistance dispatched immediately.',
    icon: Ambulance,
    tag: 'Emergency Priority',
    accentColor: 'bg-emerald-950 text-white',
    badgeBg: 'bg-emerald-100 text-emerald-950 font-bold',
    borderColor: 'border-emerald-300 hover:border-emerald-600',
    route: '/service/ambulance',
  },
  puncture: {
    type: 'puncture',
    name: 'Puncture Assistance',
    shortName: 'PUNCTURE',
    subtitle: 'On-Spot Tyre & Roadside Repair',
    description: 'Get nearby mobile puncture specialists to fix bike or car tyres on spot.',
    icon: Wrench,
    tag: 'On-Spot Repair',
    accentColor: 'bg-emerald-700 text-white',
    badgeBg: 'bg-emerald-50 text-emerald-800',
    borderColor: 'border-emerald-200 hover:border-emerald-500',
    route: '/service/puncture',
  },
};

const ServiceCard = ({ type = 'auto', onSelect }) => {
  const navigate = useNavigate();
  const service = SERVICE_CONFIG[type.toLowerCase()] || SERVICE_CONFIG.auto;
  const IconComponent = service.icon;

  const handleBook = () => {
    if (onSelect) {
      onSelect(service.type);
    } else {
      navigate(service.route);
    }
  };

  return (
    <div
      onClick={handleBook}
      className={`group relative bg-white border ${service.borderColor} rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden`}
    >
      {/* Top subtle decorative pattern */}
      <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50/50 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />

      <div>
        <div className="flex items-start justify-between gap-3 mb-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 ${service.accentColor}`}>
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-emerald-950 leading-tight">
                  {service.name}
                </h3>
              </div>
              <p className="text-xs text-emerald-800/70 font-medium">
                {service.subtitle}
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${service.badgeBg}`}>
            {service.tag}
          </span>
        </div>

        <p className="text-xs text-emerald-900/80 leading-relaxed line-clamp-2 mt-2 mb-4 relative z-10">
          {service.description}
        </p>
      </div>

      <div className="pt-3 border-t border-emerald-50 flex items-center justify-between relative z-10">
        <span className="text-xs font-semibold text-emerald-800 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
          Instant Dispatch
        </span>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleBook();
          }}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white shadow-xs transition-all group-hover:gap-2 cursor-pointer"
        >
          <span>Book Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
