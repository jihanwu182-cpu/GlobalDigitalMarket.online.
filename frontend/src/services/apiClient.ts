import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://globalmarket-com.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
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
      token =
        localStorage.getItem('adminToken');
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
    // ADD AUTHORIZATION HEADER
    // ========================================================

    if (token) {
      if (config.headers) {
        config.headers.Authorization =
          `Bearer ${token}`;
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
