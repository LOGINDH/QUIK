const USER_KEY = 'quik_user_session';
const PROVIDER_KEY = 'quik_provider_session';
const ACTIVE_BOOKING_KEY = 'quik_active_booking';

export const storage = {
  // User Session
  getUser: () => {
    try {
      const data = localStorage.getItem(USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setUser: (user) => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (e) {
      console.error('Failed to save user session', e);
    }
  },
  removeUser: () => {
    try {
      localStorage.removeItem(USER_KEY);
    } catch (e) {
      console.error('Failed to remove user session', e);
    }
  },

  // Provider Session
  getProvider: () => {
    try {
      const data = localStorage.getItem(PROVIDER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setProvider: (provider) => {
    try {
      localStorage.setItem(PROVIDER_KEY, JSON.stringify(provider));
    } catch (e) {
      console.error('Failed to save provider session', e);
    }
  },
  removeProvider: () => {
    try {
      localStorage.removeItem(PROVIDER_KEY);
    } catch (e) {
      console.error('Failed to remove provider session', e);
    }
  },

  // Active Booking Tracking (User)
  getActiveBooking: () => {
    try {
      const data = localStorage.getItem(ACTIVE_BOOKING_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setActiveBooking: (booking) => {
    try {
      localStorage.setItem(ACTIVE_BOOKING_KEY, JSON.stringify(booking));
    } catch (e) {
      console.error('Failed to save active booking', e);
    }
  },
  removeActiveBooking: () => {
    try {
      localStorage.removeItem(ACTIVE_BOOKING_KEY);
    } catch (e) {
      console.error('Failed to remove active booking', e);
    }
  },

  // Active Request Tracking (Provider)
  getActiveProviderRequest: () => {
    try {
      const data = localStorage.getItem('quik_active_provider_request');
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },
  setActiveProviderRequest: (reqData) => {
    try {
      localStorage.setItem('quik_active_provider_request', JSON.stringify(reqData));
    } catch (e) {
      console.error('Failed to save active provider request', e);
    }
  },
  removeActiveProviderRequest: () => {
    try {
      localStorage.removeItem('quik_active_provider_request');
    } catch (e) {
      console.error('Failed to remove active provider request', e);
    }
  },

  clearAll: () => {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PROVIDER_KEY);
      localStorage.removeItem(ACTIVE_BOOKING_KEY);
      localStorage.removeItem('quik_active_provider_request');
    } catch (e) {
      console.error('Failed to clear storage', e);
    }
  }
};
