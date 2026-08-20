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
