import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser, extractErrorMessage } from '../services/api';
import { Zap, User, Phone, Mail, Lock, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import ErrorMessage from '../components/ErrorMessage';

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    address: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Clear inputs on page load
  useEffect(() => {
    setFormData({
      name: '',
      phone: '',
      email: '',
      password: '',
      address: '',
    });
    setError(null);
    setSuccessMsg(null);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    // Frontend validations
    if (!formData.name.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    if (!formData.password || formData.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }

    try {
      setLoading(true);
      await registerUser(formData);
      setSuccessMsg('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to create account. Please try again.'));
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
            Join QUIK
          </h1>
          <p className="text-xs sm:text-sm text-emerald-800/70 font-medium mt-1">
            Fast emergency & roadside assistance whenever you need it
          </p>
        </div>

        {error && <ErrorMessage message={error} className="mb-4" />}

        {successMsg && (
          <div className="mb-4 bg-emerald-100/90 border border-emerald-300 text-emerald-950 px-4 py-3 rounded-2xl flex items-center gap-2.5 shadow-2xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0" />
            <p className="text-xs sm:text-sm font-semibold">{successMsg}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} autoComplete="off" className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
              Full Name *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Lingeswaran"
                autoComplete="off"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-emerald-950 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
              Phone Number *
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

          {/* Email */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
              Email Address *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. lingesh@gmail.com"
                autoComplete="off"
                required
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-emerald-950 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
              Password *
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

          {/* Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-emerald-900 mb-1.5">
              Default Area / Address
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-700 absolute left-3.5 top-3 pointer-events-none" />
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                placeholder="e.g. Salem, Tamil Nadu"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-emerald-50/40 border border-emerald-200 text-emerald-950 text-sm font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <span>{loading ? 'Creating account...' : 'Create Account'}</span>
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-6 pt-4 border-t border-emerald-100 text-center space-y-2">
          <p className="text-xs text-emerald-900/80">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-800 hover:underline">
              Sign In
            </Link>
          </p>

          <p className="text-[11px] text-emerald-800/60">
            Are you a service driver?{' '}
            <Link to="/provider/login" className="font-bold text-emerald-900 underline">
              Provider Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
