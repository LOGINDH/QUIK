import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Zap, User, Shield, LogOut, PhoneCall, LayoutDashboard, ListOrdered } from 'lucide-react';

const Navbar = () => {
  const { user, provider, logout, isUserAuthenticated, isProviderAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isProviderSection = location.pathname.startsWith('/provider');

  const handleLogout = () => {
    logout();
    if (isProviderSection) {
      navigate('/provider/login');
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-emerald-900/10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to={isProviderAuthenticated ? '/provider/dashboard' : (isUserAuthenticated ? '/home' : '/login')}
          className="flex items-center gap-2.5 group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-800 text-white flex items-center justify-center shadow-sm group-hover:bg-emerald-900 transition-colors">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-emerald-950">
                Kuiky
              </span>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                {isProviderAuthenticated ? 'Provider' : '24/7'}
              </span>
            </div>
            <p className="text-[10px] text-emerald-800/70 font-semibold tracking-wider uppercase -mt-0.5">
              Instant Assistance
            </p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* USER AUTHENTICATED */}
          {isUserAuthenticated && !isProviderSection && (
            <>
              <Link
                to="/profile"
                className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-emerald-900 bg-white border border-emerald-200 hover:bg-emerald-50 transition-colors shadow-2xs"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-[10px]">
                  {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{user?.name || 'Profile'}</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}

          {/* PROVIDER AUTHENTICATED */}
          {isProviderAuthenticated && (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100/80 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                <span className="text-xs font-bold text-emerald-950">
                  {provider?.name || 'Provider'}
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md">
                  {provider?.service_type || 'Driver'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-800 hover:text-emerald-950 hover:bg-emerald-100/60 transition-colors cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          )}

          {/* NOT AUTHENTICATED */}
          {!isUserAuthenticated && !isProviderAuthenticated && (
            <div className="flex items-center gap-2">
              <Link
                to="/provider/login"
                className="text-xs font-bold text-emerald-900 hover:text-emerald-950 px-3 py-1.5 rounded-xl hover:bg-emerald-100/60 transition-colors"
              >
                Provider Portal
              </Link>
              <Link
                to="/login"
                className="text-xs font-bold text-white bg-emerald-800 hover:bg-emerald-900 px-4 py-2 rounded-xl shadow-xs transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
