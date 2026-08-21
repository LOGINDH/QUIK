import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAdvertisements, extractErrorMessage } from '../services/api';
import { getCurrentLocation } from '../utils/location';
import { storage } from '../utils/storage';
import ServiceCard from '../components/ServiceCard';
import AdvertisementCarousel from '../components/AdvertisementCarousel';
import LocationStatus from '../components/LocationStatus';
import BookingCard from '../components/BookingCard';
import { Zap, ShieldCheck, Clock, MapPin, Sparkles, Navigation, AlertTriangle } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

const Home = () => {
  const navigate = useNavigate();
  const { user, advertisements, setAdvertisements } = useAuth();

  const [ads, setAds] = useState(advertisements || []);
  const [adsLoading, setAdsLoading] = useState(false);
  const [adsError, setAdsError] = useState(null);

  const [deviceLocation, setDeviceLocation] = useState(null);
  const [locLoading, setLocLoading] = useState(false);
  const [locError, setLocError] = useState(null);

  const [activeBooking, setActiveBooking] = useState(() => storage.getActiveBooking());

  // Fetch real device location on mount
  const fetchLocation = useCallback(async () => {
    try {
      setLocLoading(true);
      setLocError(null);
      const loc = await getCurrentLocation();
      setDeviceLocation(loc);
    } catch (err) {
      setLocError(err.message || 'Unable to access device GPS');
    } finally {
      setLocLoading(false);
    }
  }, []);

  // Fetch advertisements if not already present in AuthContext
  const fetchAds = useCallback(async () => {
    try {
      setAdsLoading(true);
      setAdsError(null);
      const data = await getAdvertisements();
      if (Array.isArray(data)) {
        setAds(data);
        setAdvertisements(data);
      }
    } catch (err) {
      // If error, we still let user book services
      setAdsError('Could not load current promotional banners.');
    } finally {
      setAdsLoading(false);
    }
  }, [setAdvertisements]);

  useEffect(() => {
    fetchLocation();
    fetchAds();
    // Check if active booking stored
    const current = storage.getActiveBooking();
    setActiveBooking(current);
  }, [fetchLocation, fetchAds]);

  const handleSelectService = (serviceType) => {
    navigate(`/service/${serviceType}`);
  };

  const userName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-7 bg-[#FAF8F5]">
      {/* Top Welcome Banner */}
      <div className="bg-white border border-emerald-100 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              Verified Emergency Network
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
            Hello, {userName} 👋
          </h1>
          <p className="text-xs sm:text-sm text-emerald-900/70 font-medium mt-0.5">
            What assistance do you need right now?
          </p>
        </div>

        {/* Quick Stat Pill */}
        <div className="flex items-center gap-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-4 py-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center shadow-2xs">
            <Zap className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Fast Dispatch</p>
            <p className="text-xs font-black text-emerald-950">Live GPS Matching</p>
          </div>
        </div>
      </div>

      {/* GPS Location Bar */}
      <div>
        <LocationStatus
          location={deviceLocation}
          loading={locLoading}
          error={locError}
          onRefresh={fetchLocation}
        />
      </div>

      {/* Active Booking Widget if any */}
      {activeBooking && activeBooking.status !== 'completed' && activeBooking.status !== 'cancelled' && (
        <section className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-ping" />
              <h2 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
                Active Service Request
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate(`/booking/${activeBooking.id || activeBooking.request_id || activeBooking.request}`)}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              View Status
            </button>
          </div>
          <BookingCard booking={activeBooking} />
        </section>
      )}

      {/* 3 Main Service Cards */}
      <section id="services" className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-base sm:text-lg font-black text-emerald-950">
              Select a Service
            </h2>
            <p className="text-xs text-emerald-800/70">
              Dispatched with real-time driver tracking
            </p>
          </div>
          <span className="text-[11px] font-bold text-emerald-900 bg-emerald-100 px-2.5 py-1 rounded-full">
            3 Services Ready
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ServiceCard type="auto" onSelect={handleSelectService} />
          <ServiceCard type="ambulance" onSelect={handleSelectService} />
          <ServiceCard type="puncture" onSelect={handleSelectService} />
        </div>
      </section>

      {/* Advertisements & Promotional Banner Section */}
      <section className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-700" />
            <h2 className="text-sm font-black text-emerald-950 uppercase tracking-wider">
              Featured Updates & Offers
            </h2>
          </div>
        </div>

        <AdvertisementCarousel ads={ads} loading={adsLoading} />
      </section>

      {/* Safety & Trust Footer Badge */}
      <div className="p-4 rounded-3xl bg-white border border-emerald-100 flex items-center gap-3 text-xs text-emerald-900/80 shadow-xs">
        <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800 flex-shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <p className="leading-relaxed font-medium">
          <strong className="text-emerald-950 font-bold">Kuiky Guarantee:</strong> All drivers and emergency units operate with real GPS verification for your safety and fast turnaround.
        </p>
      </div>
    </div>
  );
};

export default Home;
