/**
 * Geolocation utility using the real browser navigator.geolocation API.
 * Handles permission states, timeout, accuracy, and clear error messaging.
 */

export const getCurrentLocation = (options = {}) => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by your browser or device.',
      });
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 5000,
      ...options,
    };

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: position.timestamp,
        });
      },
      (error) => {
        let userFriendlyMsg = 'Failed to retrieve your location.';
        let errCode = 'UNKNOWN_ERROR';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errCode = 'PERMISSION_DENIED';
            userFriendlyMsg = 'Location permission was denied. Please allow location access in your browser settings to find nearby services.';
            break;
          case error.POSITION_UNAVAILABLE:
            errCode = 'POSITION_UNAVAILABLE';
            userFriendlyMsg = 'Your current location is unavailable. Please check your device GPS/location settings.';
            break;
          case error.TIMEOUT:
            errCode = 'TIMEOUT';
            userFriendlyMsg = 'Location request timed out. Please try again or ensure your GPS signal is strong.';
            break;
          default:
            errCode = 'UNKNOWN_ERROR';
            userFriendlyMsg = error.message || 'An error occurred while fetching device location.';
            break;
        }

        reject({
          code: errCode,
          message: userFriendlyMsg,
          rawError: error,
        });
      },
      defaultOptions
    );
  });
};

/**
 * Watch location continuously for active providers.
 * Returns an unsubscribe function to stop watching.
 */
export const watchLocation = (onSuccess, onError, options = {}) => {
  if (!navigator.geolocation) {
    if (onError) {
      onError({
        code: 'NOT_SUPPORTED',
        message: 'Geolocation is not supported by your browser.',
      });
    }
    return () => {};
  }

  const defaultOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 3000,
    ...options,
  };

  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      onSuccess({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
      });
    },
    (error) => {
      if (onError) {
        let msg = 'Failed to update location.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission denied. Cannot send GPS updates.';
        }
        onError({
          code: error.code,
          message: msg,
          rawError: error,
        });
      }
    },
    defaultOptions
  );

  return () => {
    navigator.geolocation.clearWatch(watchId);
  };
};

/**
 * Calculates straight-line Haversine distance in kilometers between two GPS coordinates.
 */
export const calculateDistanceKm = (lat1, lon1, lat2, lon2) => {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return null;
  const numLat1 = typeof lat1 === 'number' ? lat1 : parseFloat(lat1);
  const numLon1 = typeof lon1 === 'number' ? lon1 : parseFloat(lon1);
  const numLat2 = typeof lat2 === 'number' ? lat2 : parseFloat(lat2);
  const numLon2 = typeof lon2 === 'number' ? lon2 : parseFloat(lon2);

  if (isNaN(numLat1) || isNaN(numLon1) || isNaN(numLat2) || isNaN(numLon2)) return null;

  const R = 6371; // Earth radius in km
  const dLat = ((numLat2 - numLat1) * Math.PI) / 180;
  const dLon = ((numLon2 - numLon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((numLat1 * Math.PI) / 180) *
      Math.cos((numLat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
};

/**
 * Calculates estimated time of arrival in minutes based on service type.
 */
export const calculateEtaMinutes = (distanceKm, serviceType = 'auto') => {
  if (distanceKm == null || isNaN(distanceKm)) return null;
  const type = (serviceType || '').toLowerCase();
  let speed = 30; // auto speed in km/h
  if (type === 'ambulance') {
    speed = 50;
  } else if (type === 'puncture') {
    speed = 25;
  }

  const dist = typeof distanceKm === 'number' ? distanceKm : parseFloat(distanceKm);
  const minutes = Math.round((dist / speed) * 60);
  return Math.max(1, minutes);
};

