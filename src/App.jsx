import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import BottomNavigation from './components/BottomNavigation';
import LoadingSpinner from './components/LoadingSpinner';

// User Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ServiceBooking from './pages/ServiceBooking';
import BookingTracking from './pages/BookingTracking';
import Profile from './pages/Profile';

// Provider Pages
import ProviderLogin from './pages/ProviderLogin';
import ProviderDashboard from './pages/ProviderDashboard';
import ProviderRequests from './pages/ProviderRequests';
import ProviderActiveRequest from './pages/ProviderActiveRequest';

// Route Guards
const UserProtectedRoute = ({ children }) => {
  const { isUserAuthenticated, isProviderAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (isProviderAuthenticated) return <Navigate to="/provider/dashboard" replace />;
  if (!isUserAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const ProviderProtectedRoute = ({ children }) => {
  const { isProviderAuthenticated, isUserAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullScreen />;
  if (isUserAuthenticated && !isProviderAuthenticated) return <Navigate to="/home" replace />;
  if (!isProviderAuthenticated) return <Navigate to="/provider/login" replace />;
  return children;
};

// Allow user to always view login page if visited explicitly
const PublicOnlyRoute = ({ children }) => {
  return children;
};

const ProviderPublicOnlyRoute = ({ children }) => {
  return children;
};

// Root index redirect - always open directly on login page
const RootRedirect = () => {
  return <Navigate to="/login" replace />;
};

function AppContent() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-emerald-950 flex flex-col font-sans">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Root Redirect */}
          <Route path="/" element={<RootRedirect />} />

          {/* User Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicOnlyRoute>
                <Register />
              </PublicOnlyRoute>
            }
          />

          {/* User Protected Routes */}
          <Route
            path="/home"
            element={
              <UserProtectedRoute>
                <Home />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/service/:type"
            element={
              <UserProtectedRoute>
                <ServiceBooking />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/booking/:id"
            element={
              <UserProtectedRoute>
                <BookingTracking />
              </UserProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <UserProtectedRoute>
                <Profile />
              </UserProtectedRoute>
            }
          />

          {/* Provider Routes */}
          <Route
            path="/provider/login"
            element={
              <ProviderPublicOnlyRoute>
                <ProviderLogin />
              </ProviderPublicOnlyRoute>
            }
          />
          <Route
            path="/provider/dashboard"
            element={
              <ProviderProtectedRoute>
                <ProviderDashboard />
              </ProviderProtectedRoute>
            }
          />
          <Route
            path="/provider/requests"
            element={
              <ProviderProtectedRoute>
                <ProviderRequests />
              </ProviderProtectedRoute>
            }
          />
          <Route
            path="/provider/request/:id"
            element={
              <ProviderProtectedRoute>
                <ProviderActiveRequest />
              </ProviderProtectedRoute>
            }
          />

          {/* 404 Catch All */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </main>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
