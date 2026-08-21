import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storage } from '../utils/storage';
import { User, Phone, Mail, MapPin, ShieldCheck, LogOut, ArrowRight, Zap } from 'lucide-react';
import BookingCard from '../components/BookingCard';

const Profile = () => {
  const navigate = useNavigate();
  const { user, logoutUser } = useAuth();
  const activeBooking = storage.getActiveBooking();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 bg-[#FAF8F5]">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-emerald-950">
          User Account
        </h1>
        <p className="text-xs text-emerald-800/70 font-medium">
          Manage your personal details and active service bookings
        </p>
      </div>

      {/* User Information Card */}
      <div className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm space-y-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-800 text-white flex items-center justify-center text-2xl font-black shadow-sm">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-emerald-950">
                {user?.name || 'Kuiky Member'}
              </h2>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
                {user?.role || 'User'}
              </span>
            </div>
            <p className="text-xs text-emerald-800/70 mt-0.5">
              Verified Emergency Passenger
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-emerald-100/70">
          {/* Phone */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="p-2 rounded-xl bg-white text-emerald-800 shadow-2xs border border-emerald-200">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-800/70">Phone</p>
              <p className="text-xs font-bold text-emerald-950">{user?.phone || 'Not provided'}</p>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="p-2 rounded-xl bg-white text-emerald-800 shadow-2xs border border-emerald-200">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-800/70">Email</p>
              <p className="text-xs font-bold text-emerald-950 truncate max-w-[180px]">{user?.email || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Address */}
        {user?.address && (
          <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <div className="p-2 rounded-xl bg-white text-emerald-800 shadow-2xs border border-emerald-200 flex-shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-emerald-800/70">Registered Area</p>
              <p className="text-xs font-semibold text-emerald-950">{user.address}</p>
            </div>
          </div>
        )}
      </div>

      {/* Active Service Status */}
      {activeBooking && (
        <section className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900 px-1">
            Current Service Request
          </h3>
          <BookingCard booking={activeBooking} />
        </section>
      )}

      {/* Logout Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleLogout}
          className="w-full py-3.5 px-4 rounded-2xl font-bold text-xs sm:text-sm text-emerald-950 bg-white border border-emerald-200 hover:bg-emerald-50 active:bg-emerald-100 transition-colors shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-emerald-800" />
          <span>Sign Out of Kuiky</span>
        </button>
      </div>
    </div>
  );
};

export default Profile;
