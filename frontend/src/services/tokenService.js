import axios from 'axios';
import { authService } from './authService';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  withCredentials: true,
});

const emitAuthChange = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'));
  }
};

let isRefreshing = false;
let refreshSubscribers = [];

const addRefreshSubscriber = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (token) => {
  refreshSubscribers.forEach(callback => callback(token));
  refreshSubscribers = [];
};

api.interceptors.request.use(
  (config) => {
    const token = authService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (!isRefreshing) {
        isRefreshing = true;

        if (refreshSubscribers.length === 0) {
          try {
            const response = await axios.post('http://localhost:5000/api/refresh', {}, {
              withCredentials: true
            });

            const { accessToken } = response.data;
            authService.refreshToken(accessToken);
            
            if (response.data.user) {
              localStorage.setItem('role', response.data.user.role);
              localStorage.setItem('userId', response.data.user.id);
              if (Object.prototype.hasOwnProperty.call(response.data.user, 'hotelId')) {
                localStorage.setItem('hotelId', response.data.user.hotelId ?? '');
              }
            }

            emitAuthChange();

            onRefreshed(accessToken);
            
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);

          } catch (refreshError) {
            console.error('Token refresh failed:', refreshError);
            
            authService.logout();
            
            refreshSubscribers.forEach(callback => callback(null));
            refreshSubscribers = [];
            
            window.location.href = '/login';
            
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
      }

      return new Promise((resolve, reject) => {
        addRefreshSubscriber((token) => {
          if (token) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          } else {
            reject(error);
          }
        });
      });
    }

    return Promise.reject(error);
  }
);

export const refreshToken = async () => {
  try {
    const response = await axios.post('http://localhost:5000/api/refresh', {}, {
      withCredentials: true
    });

    const { accessToken } = response.data;
    authService.refreshToken(accessToken);
    
    if (response.data.user) {
      localStorage.setItem('role', response.data.user.role);
      localStorage.setItem('userId', response.data.user.id);
      if (Object.prototype.hasOwnProperty.call(response.data.user, 'hotelId')) {
        localStorage.setItem('hotelId', response.data.user.hotelId ?? '');
      }
    }

    return response.data;
  } catch (error) {
    console.error('Manual token refresh failed:', error);
    throw error;
  }
};

export const logout = async () => {
  console.log("🚪 USER LOGGED OUT - Tokens destroyed");
  
  try {
    await axios.post('http://localhost:5000/api/refresh/logout', {}, {
      withCredentials: true
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    authService.logout();
  }
};

export const logoutAll = async () => {
  try {
    await axios.post('http://localhost:5000/api/refresh/logout-all', {}, {
      withCredentials: true
    });
  } catch (error) {
    console.error('Logout all error:', error);
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('hotelId');
    
    console.log('🗑️ USER LOGGED OUT FROM ALL DEVICES:');
    console.log('Timestamp:', new Date().toISOString());
    console.log('---');
  }
};

export default api;
