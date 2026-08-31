import axios from 'axios';

const RAW_API_URL =
  process.env.REACT_APP_API_URL ||
  'https://globalmarket-com.onrender.com/';

// Always make sure the API URL ends with /api
const API_URL = `${RAW_API_URL.replace(/\/+$/, '')}/api`;

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

apiClient.interceptors.request.use(
  (config) => {
    const requestUrl = config.url || '';

    const isAdminRequest =
      requestUrl.startsWith('/admin');

    let token: string | null = null;

    // ========================================================
    // ADMIN TOKEN
    // ========================================================

    if (isAdminRequest) {
      token = localStorage.getItem('adminToken');
    }

    // ========================================================
    // NORMAL USER TOKEN
    // ========================================================

    else {
      token =
        localStorage.getItem('authToken') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token');
    }

    // ========================================================
    // AUTHORIZATION HEADER
    // ========================================================

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // ========================================================
    // FORM DATA
    // ========================================================

    if (
      typeof FormData !== 'undefined' &&
      config.data instanceof FormData
    ) {
      if (config.headers) {
        delete config.headers['Content-Type'];
        delete config.headers['content-type'];
      }
    }

    // ========================================================
    // JSON REQUESTS
    // ========================================================

    else {
      if (config.headers) {
        config.headers['Content-Type'] =
          'application/json';
      }
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    console.error(
      'API ERROR:',
      error
    );

    if (error.response) {
      console.error(
        'STATUS:',
        error.response.status
      );

      console.error(
        'DATA:',
        error.response.data
      );

      // ======================================================
      // ADMIN AUTH ERROR
      // ======================================================

      if (
        error.response.status === 401 &&
        error.config?.url?.startsWith('/admin')
      ) {
        console.error(
          'ADMIN AUTHENTICATION FAILED'
        );

        localStorage.removeItem(
          'adminToken'
        );

        localStorage.removeItem(
          'admin'
        );
      }
    }

    // ========================================================
    // TIMEOUT
    // ========================================================

    else if (
      error.code === 'ECONNABORTED' ||
      error.code === 'ETIMEDOUT'
    ) {
      console.error(
        'API REQUEST TIMED OUT'
      );
    }

    // ========================================================
    // NETWORK ERROR
    // ========================================================

    else {
      console.error(
        'NETWORK ERROR:',
        error.message
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
