import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser, extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Zap, Phone, Lock, ArrowRight, Shield } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

const Login = () => {
  const navigate = useNavigate();
  const { loginUserSession, loginProviderSession } = useAuth();

  const [formData, setFormData] = useState({
    phone: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Always reset fields to empty when page opens
  useEffect(() => {
    setFormData({ phone: '', password: '' });
    setError(null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const phone = formData.phone.trim();
    const password = formData.password;

    if (!phone) {
      setError('Please enter your phone number.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      let isProvider = false;
      let data = null;

      try {
        // Attempt user login first
        data = await loginUser({ phone, password });
      } catch (userErr) {
        const errMsg = userErr.response?.data?.error || userErr.message || '';
        // If the backend identifies this account as a provider, attempt provider login seamlessly
        if (
          errMsg.toLowerCase().includes('provider') ||
          userErr.response?.status === 403
        ) {
          try {
            data = await loginProvider({ phone, password });
            isProvider = true;
          } catch (provErr) {
            if (provErr.response?.status === 401) {
              throw new Error('Invalid password for this Provider account.');
            }
            throw userErr;
          }
        } else {
          // Try provider login as automatic fallback
          try {
            data = await loginProvider({ phone, password });
            isProvider = true;
          } catch {
            throw userErr;
          }
        }
      }

      console.log('Login Response:', data);

      const userObj = data && typeof data === 'object'
        ? (data.user || data.provider || (data.id ? data : (data.data?.user || data.data?.provider || data.data)))
        : null;

      const ads = (data && typeof data === 'object' && (data.advertisements || data.ads)) || [];
      const serviceType = (data && typeof data === 'object' && (data.service_type || userObj?.service_type)) || 'auto';

      if (userObj && typeof userObj === 'object' && (userObj.id || userObj.phone || userObj.name)) {
        if (isProvider || userObj.role === 'provider' || userObj.service_type) {
          loginProviderSession(userObj, serviceType);
          navigate('/provider/dashboard', { replace: true });
        } else {
          loginUserSession(userObj, ads);
          navigate('/home', { replace: true });
        }
      } else {
        setError('Invalid response received from server. Please try again.');
      }
    } catch (err) {
      console.error('Login Error:', err);
      setError(extractErrorMessage(err, 'Invalid credentials. Please verify your phone number and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-[#FAF8F5]">
      <div className="w-full max-w-md bg-white border border-emerald-100 rounded-3xl p-6 sm:p-8 shadow-lg">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-800 text-white shadow-sm mb-3">
            <Zap className="w-7 h-7 fill-current" />
          </div>
          <h1 className="text-2xl font-black text-emerald-950 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-xs sm:text-sm text-emerald-800/70 font-medium mt-1">
            Sign in to access rapid Auto, Ambulance & Puncture services
          </p>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 7339093987"
                autoComplete="off"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-emerald-950 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900">
                Password
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-emerald-950 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Logging in...' : 'Sign In to Kuiky'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-emerald-100 text-center space-y-2.5">
          <p className="text-xs text-emerald-900/80">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-emerald-800 hover:underline">
              Create one now
            </Link>
          </p>

          <div className="pt-2">
            <Link
              to="/provider/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-900 bg-emerald-100/70 hover:bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-xl transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-700" />
              <span>Service Provider Login</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
