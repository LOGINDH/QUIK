import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginProvider, extractErrorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Shield, Phone, Lock, ArrowRight, Zap, Car, Ambulance, Wrench } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

const ProviderLogin = () => {
  const navigate = useNavigate();
  const { loginProviderSession } = useAuth();

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

    if (!formData.phone.trim()) {
      setError('Please enter your provider phone number.');
      return;
    }
    if (!formData.password) {
      setError('Please enter your provider password.');
      return;
    }

    try {
      setLoading(true);
      const data = await loginProvider(formData);
      console.log('Provider Login Response:', data);

      const providerObj = data?.provider || (data?.id ? data : (data?.data?.provider || data?.data));
      const serviceType = data?.service_type || providerObj?.service_type || 'auto';

      if (providerObj && (providerObj.id || providerObj.phone || providerObj.name)) {
        loginProviderSession(providerObj, serviceType);
        navigate('/provider/dashboard', { replace: true });
      } else {
        setError('Login response did not contain valid provider credentials.');
      }
    } catch (err) {
      console.error('Provider Login Error:', err);
      setError(extractErrorMessage(err, 'Invalid provider credentials. Please check phone and password created by administrator.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-[#FAF8F5]">
      <div className="w-full max-w-md bg-white border-2 border-emerald-300 rounded-3xl p-6 sm:p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-800 text-white shadow-sm mb-3">
            <Shield className="w-7 h-7" />
          </div>
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-2xl font-black text-emerald-950 tracking-tight">
              Provider Portal
            </h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300">
              Fleet & Driver
            </span>
          </div>
          <p className="text-xs sm:text-sm text-emerald-800/70 font-medium mt-1">
            Authorized Auto Drivers, Ambulance Crews & Puncture Technicians
          </p>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
              Registered Provider Phone
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. 9876543210"
                autoComplete="off"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-emerald-950 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
              Provider Password
            </label>
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
            <span>{loading ? 'Authenticating...' : 'Sign In as Provider'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Notice for provider creation */}
        <div className="mt-6 p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
          <p className="text-[11px] font-semibold text-emerald-950">
            Provider accounts are provisioned via Django Admin
          </p>
          <p className="text-[10px] text-emerald-800/70">
            Contact your dispatch supervisor if you need login credentials.
          </p>
        </div>

        {/* Footer Link back to Passenger app */}
        <div className="mt-4 text-center">
          <Link
            to="/login"
            className="text-xs font-bold text-emerald-800 hover:underline"
          >
            ← Switch to Passenger Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProviderLogin;
