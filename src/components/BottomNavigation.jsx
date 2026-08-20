import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Compass, User, LayoutDashboard, Inbox, ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNavigation = () => {
  const { isUserAuthenticated, isProviderAuthenticated, provider } = useAuth();
  const location = useLocation();

  // Hide bottom navigation on auth pages or if not logged in
  const authRoutes = ['/login', '/register', '/provider/login'];
  if (authRoutes.includes(location.pathname)) {
    return null;
  }

  const isProvider = location.pathname.startsWith('/provider') || isProviderAuthenticated;

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-lg border-t border-emerald-900/10 px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {isProvider ? (
          <>
            <NavLink
              to="/provider/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-emerald-950 font-bold'
                    : 'text-emerald-800/60 font-medium hover:text-emerald-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl ${isActive ? 'bg-emerald-200/80 text-emerald-950' : ''}`}>
                    <LayoutDashboard className="w-5 h-5" />
                  </div>
                  <span className="text-[10px]">Dashboard</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/provider/requests"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all relative ${
                  isActive
                    ? 'text-emerald-950 font-bold'
                    : 'text-emerald-800/60 font-medium hover:text-emerald-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl ${isActive ? 'bg-emerald-200/80 text-emerald-950' : ''}`}>
                    <Inbox className="w-5 h-5" />
                  </div>
                  <span className="text-[10px]">Requests</span>
                </>
              )}
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-emerald-950 font-bold'
                    : 'text-emerald-800/60 font-medium hover:text-emerald-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl ${isActive ? 'bg-emerald-200/80 text-emerald-950' : ''}`}>
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="text-[10px]">Home</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/service/ambulance"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-emerald-950 font-bold'
                    : 'text-emerald-800/60 font-medium hover:text-emerald-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl ${isActive ? 'bg-emerald-200/80 text-emerald-950' : ''}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <span className="text-[10px]">Emergency</span>
                </>
              )}
            </NavLink>

            <NavLink
              to="/profile"
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-emerald-950 font-bold'
                    : 'text-emerald-800/60 font-medium hover:text-emerald-900'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`p-1 rounded-xl ${isActive ? 'bg-emerald-200/80 text-emerald-950' : ''}`}>
                    <User className="w-5 h-5" />
                  </div>
                  <span className="text-[10px]">Profile</span>
                </>
              )}
            </NavLink>
          </>
        )}
      </div>
    </nav>
  );
};

export default BottomNavigation;
