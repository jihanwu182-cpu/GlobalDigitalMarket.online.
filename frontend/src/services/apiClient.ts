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
    // ADMIN REQUESTS
    // ========================================================

    if (isAdminRequest) {
      token =
        localStorage.getItem('adminToken') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token');
    }

    // ========================================================
    // NORMAL USER REQUESTS
    // ========================================================

    else {
      token =
        localStorage.getItem('authToken') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token');
    }

    // ========================================================
    // ADD BEARER TOKEN
    // ========================================================

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // ========================================================
    // DEBUG INFORMATION
    // ========================================================

    console.log(
      '[API REQUEST]',
      config.method?.toUpperCase(),
      requestUrl
    );

    return config;
  },

  (error) => {
    console.error(
      '[API REQUEST ERROR]',
      error
    );

    return Promise.reject(error);
  }
);

// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      '[API SUCCESS]',
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status
    );

    return response;
  },

  (error) => {
    console.error(
      '[API ERROR]',
      error
    );

    // ========================================================
    // SERVER RESPONSE
    // ========================================================

    if (error.response) {
      console.error(
        'STATUS:',
        error.response.status
      );

      console.error(
        'URL:',
        error.config?.url
      );

      console.error(
        'DATA:',
        error.response.data
      );

      // ======================================================
      // ADMIN AUTHENTICATION ERROR
      // ======================================================

      if (
        error.response.status === 401 &&
        error.config?.url?.startsWith('/admin')
      ) {
        console.error(
          '[ADMIN] Authentication failed.'
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
        '[API TIMEOUT]',
        error.config?.url
      );
    }

    // ========================================================
    // NETWORK ERROR
    // ========================================================

    else {
      console.error(
        '[API NETWORK ERROR]',
        error.message
      );
    }

    return Promise.reject(error);
  }
);

// ============================================================
// EXPORT
// ============================================================

export default apiClient;
