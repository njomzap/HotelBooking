import axios from 'axios';

// Create axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true, // Important for httpOnly cookies
});

// Token refresh state
let isRefreshing = false;
let refreshSubscribers = [];

// Function to add subscribers waiting for token refresh
const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

// Function to notify all subscribers
const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

// Request interceptor - add access token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 (Unauthorized) and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // If this is the refresh token endpoint itself, don't try to refresh again
      if (originalRequest.url === '/refresh') {
        // Refresh token is invalid, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // If already refreshing, wait for it to complete
        return new Promise((resolve) => {
          addRefreshSubscriber((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      // Mark that we're refreshing
      isRefreshing = true;
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token
        const response = await axios.post('http://localhost:5000/api/refresh', {}, {
          withCredentials: true // Important for httpOnly cookies
        });

        const { accessToken } = response.data;
        
        // Store new access token
        localStorage.setItem('accessToken', accessToken);
        
        // Update user info if provided
        if (response.data.user) {
          localStorage.setItem('role', response.data.user.role);
          localStorage.setItem('userId', response.data.user.id);
        }

        // Log token refresh (for debugging)
        console.log('🔄 ACCESS TOKEN REFRESHED:');
        console.log('New Token:', accessToken.substring(0, 20) + '...');
        console.log('Timestamp:', new Date().toISOString());
        console.log('---');

        // Notify all waiting requests
        onRefreshed(accessToken);
        
        // Retry the original request
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);

      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        console.error('Token refresh failed:', refreshError);
        
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        localStorage.removeItem('userId');
        
        // Log token destruction (for debugging)
        console.log('🗑️ TOKEN REFRESH FAILED - LOGGING OUT:');
        console.log('Timestamp:', new Date().toISOString());
        console.log('---');
        
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// Manual refresh token function
export const refreshToken = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/refresh', {}, {
      withCredentials: true
    });

    const { accessToken } = response.data;
    localStorage.setItem('accessToken', accessToken);
    
    if (response.data.user) {
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('userId', response.data.user.id);
    }

    return response.data;
  } catch (error) {
    console.error('Manual token refresh failed:', error);
    throw error;
  }
};

// Logout function
export const logout = async () => {
  try {
    await axios.post('http://localhost:5000/api/refresh/logout', {}, {
      withCredentials: true
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    
    console.log('🗑️ USER LOGGED OUT:');
    console.log('Timestamp:', new Date().toISOString());
    console.log('---');
  }
};

// Logout from all devices
export const logoutAll = async () => {
  try {
    await axios.post('http://localhost:5000/api/refresh/logout-all', {}, {
      withCredentials: true
    });
  } catch (error) {
    console.error('Logout all error:', error);
  } finally {
    // Always clear local storage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    
    console.log('🗑️ USER LOGGED OUT FROM ALL DEVICES:');
    console.log('Timestamp:', new Date().toISOString());
    console.log('---');
  }
};

export default api;
