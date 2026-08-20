import React, { useState, useEffect } from 'react';
import AdvertisementCard from './AdvertisementCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AdvertisementCarousel = ({ ads = [], loading = false }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const activeAds = (ads || []).filter((ad) => ad.is_active !== false);

  useEffect(() => {
    if (activeAds.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [activeAds.length]);

  if (loading) {
    return (
      <div className="h-44 rounded-3xl bg-white border border-emerald-100 p-6 flex items-center justify-center animate-pulse">
        <div className="text-xs font-semibold text-emerald-800">Loading verified offers...</div>
      </div>
    );
  }

  if (!activeAds || activeAds.length === 0) {
    return (
      <div className="rounded-3xl bg-emerald-50/50 border border-dashed border-emerald-200 p-6 text-center">
        <p className="text-xs font-medium text-emerald-800/80">No advertisements available.</p>
      </div>
    );
  }

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? activeAds.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % activeAds.length);
  };

  return (
    <div className="relative group">
      {/* Current Active Ad Card */}
      <div className="transition-all duration-300">
        <AdvertisementCard ad={activeAds[currentIndex]} />
      </div>

      {/* Navigation Arrows for multi-item carousel */}
      {activeAds.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous advertisement"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-emerald-200 text-emerald-900 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-50 cursor-pointer z-20"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next advertisement"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 border border-emerald-200 text-emerald-900 shadow-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-emerald-50 cursor-pointer z-20"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center items-center gap-1.5 mt-3">
            {activeAds.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                  currentIndex === idx
                    ? 'w-6 bg-emerald-800'
                    : 'w-1.5 bg-emerald-200 hover:bg-emerald-300'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default AdvertisementCarousel;
