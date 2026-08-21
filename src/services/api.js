import axios from 'axios';

export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || '/api'
).replace(/\/+$/, '');

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': '69420',
  },
  timeout: 25000,
});

// Request interceptor to ensure bypass headers are always present
api.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  config.headers['ngrok-skip-browser-warning'] = '69420';
  return config;
});

// Response interceptor to detect and reject HTML responses (ngrok warning or 404 pages)
api.interceptors.response.use(
  (response) => {
    if (typeof response.data === 'string' && (response.data.includes('<!DOCTYPE') || response.data.includes('<html'))) {
      const error = new Error('Received unexpected HTML page from server. Please verify backend is online.');
      error.response = {
        status: 502,
        data: { error: 'Backend server returned an unexpected response. Please ensure backend is active.' }
      };
      return Promise.reject(error);
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Image URL helper:
 * If the backend returns '/media/advertisements/example.jpg'
 * and API base URL is 'https://hydration-cycle-answering.ngrok-free.dev/quik'
 * construct: 'https://hydration-cycle-answering.ngrok-free.dev/media/advertisements/example.jpg'
 * (NOT .../quik/media/...)
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;

  // If API_BASE_URL is a full URL, extract its origin
  if (API_BASE_URL.startsWith('http://') || API_BASE_URL.startsWith('https://')) {
    try {
      const urlObj = new URL(API_BASE_URL);
      return `${urlObj.origin}${cleanPath}`;
    } catch {
      return `https://hydration-cycle-answering.ngrok-free.dev${cleanPath}`;
    }
  }

  // If relative proxy /quik, construct media URL with backend origin
  return `https://hydration-cycle-answering.ngrok-free.dev${cleanPath}`;
};

/**
 * Friendly backend error message extractor
 */
export const extractErrorMessage = (error, defaultMsg = 'An unexpected error occurred.') => {
  if (!error) return defaultMsg;

  if (error.response) {
    const { status, data } = error.response;

    if (data && typeof data === 'object') {
      if (data.error) {
        if (data.error.toLowerCase().includes('use provider login')) {
          return 'This account is registered as a Service Provider. Please sign in via the Provider Portal or use Provider Login.';
        }
        return data.error;
      }
      if (data.message) return data.message;
      if (data.detail) return data.detail;

      // Extract field validation errors (400)
      const firstKey = Object.keys(data)[0];
      if (firstKey && Array.isArray(data[firstKey])) {
        return `${firstKey}: ${data[firstKey].join(', ')}`;
      }
      if (firstKey && typeof data[firstKey] === 'string') {
        return `${firstKey}: ${data[firstKey]}`;
      }
    }

    if (typeof data === 'string' && data.length < 200 && !data.includes('<!DOCTYPE')) {
      return data;
    }

    if (status === 400) return 'Invalid data provided. Please check all required fields.';
    if (status === 401) return 'Invalid credentials. Please verify your phone number and password.';
    if (status === 403) return 'Access denied. You do not have permission for this action.';
    if (status === 404) return 'The requested account or resource could not be found.';
    if (status >= 500) return 'The Kuiky server encountered an internal issue. Please try again in a moment.';
  }

  if (error.request || error.code === 'ERR_NETWORK') {
    return 'Unable to connect to the Kuiky server. Please check your connection.';
  }

  return error.message || defaultMsg;
};

// 1. USER REGISTER -> POST /register/
export const registerUser = async (userData) => {
  const response = await api.post('/register/', {
    name: userData.name,
    phone: userData.phone,
    email: userData.email,
    password: userData.password,
    address: userData.address || '',
  });
  return response.data;
};

// 2. USER LOGIN -> POST /login/
export const loginUser = async (credentials) => {
  const response = await api.post('/login/', {
    phone: credentials.phone,
    password: credentials.password,
  });
  return response.data;
};

// 3. PROVIDER LOGIN -> POST /providerlogin/
export const loginProvider = async (credentials) => {
  const response = await api.post('/providerlogin/', {
    phone: credentials.phone,
    password: credentials.password,
  });
  return response.data;
};

// 4. GET ADVERTISEMENTS -> GET /ads/
export const getAdvertisements = async () => {
  const response = await api.get('/ads/');
  return response.data;
};

// 5. CREATE SERVICE REQUEST -> POST /request/
export const createServiceRequest = async (requestData) => {
  // Normalize service_type to backend supported values ('auto', 'ambulance', 'puncture')
  let normalizedType = (requestData.service_type || 'auto').toLowerCase().trim();
  if (normalizedType.includes('ambulance') || normalizedType.includes('emergenc')) {
    normalizedType = 'ambulance';
  } else if (normalizedType.includes('puncture') || normalizedType.includes('tyre') || normalizedType.includes('repair')) {
    normalizedType = 'puncture';
  } else {
    normalizedType = 'auto';
  }

  const response = await api.post('/request/', {
    user: Number(requestData.user),
    service_type: normalizedType,
    latitude: parseFloat(requestData.latitude),
    longitude: parseFloat(requestData.longitude),
    address: requestData.address || '',
    description: requestData.description || '',
  });
  return response.data;
};

// 6. PROVIDER REQUESTS -> GET /requests/?provider={providerId}
export const getProviderRequests = async (providerId) => {
  const response = await api.get('/requests/', {
    params: {
      provider: Number(providerId),
    },
  });

  // Normalize array items so both .id and .request_id are reliably present
  if (Array.isArray(response.data)) {
    return response.data.map((item) => ({
      ...item,
      id: item.request_id || item.id,
      request_id: item.request_id || item.id,
    }));
  }
  return response.data;
};

// 7. ACCEPT REQUEST -> PUT /accept/
export const acceptRequest = async (providerId, requestId) => {
  const response = await api.put('/accept/', {
    provider: Number(providerId),
    request: Number(requestId),
  });
  return response.data;
};

// 8. REJECT REQUEST -> PUT /reject/
export const rejectRequest = async (providerId, requestId) => {
  const response = await api.put('/reject/', {
    provider: Number(providerId),
    request: Number(requestId),
  });
  return response.data;
};

// 9. PROVIDER LOCATION -> PUT /location/
export const updateProviderLocation = async (providerId, latitude, longitude) => {
  const response = await api.put('/location/', {
    provider: Number(providerId),
    latitude: parseFloat(latitude),
    longitude: parseFloat(longitude),
  });
  return response.data;
};

// 10. USER REQUEST STATUS -> GET /status/?user={userId}&request={requestId}
export const getRequestStatus = async (userId, requestId) => {
  const response = await api.get('/status/', {
    params: {
      user: userId,
      request: requestId,
    },
  });
  return response.data;
};

// 11. SERVICE COMPLETION -> PUT /complete/
export const completeRequest = async (providerId, requestId) => {
  const response = await api.put('/complete/', {
    provider: Number(providerId),
    request: Number(requestId),
  });
  return response.data;
};

export default api;
