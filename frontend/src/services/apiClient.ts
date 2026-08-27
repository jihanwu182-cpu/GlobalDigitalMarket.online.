import axios from 'axios';

const API_URL =
  'https://globalmarket-com.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// =====================================
// ADD AUTH TOKEN
// =====================================

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    console.log(
      'API REQUEST:',
      config.method?.toUpperCase(),
      `${API_URL}${config.url}`
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// =====================================
// HANDLE RESPONSE
// =====================================

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      'API RESPONSE:',
      response.status,
      response.config.url
    );

    return response;
  },

  (error) => {
    console.error(
      'API ERROR:',
      error?.response?.status,
      error?.response?.data || error?.message
    );

    if (error?.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');

      if (window.location.hash !== '#/login') {
        window.location.hash = '#/login';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
