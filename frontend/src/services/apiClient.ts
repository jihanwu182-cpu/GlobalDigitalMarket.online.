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
    // ADMIN REQUEST
    // ========================================================

    if (isAdminRequest) {
      token =
        localStorage.getItem('adminToken') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('token');
    }

    // ========================================================
    // NORMAL USER REQUEST
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
      config.headers = config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    // ========================================================
    // DEBUG LOG
    // ========================================================

    console.log(
      `[API] ${config.method?.toUpperCase() || 'GET'} ${requestUrl}`,
      {
        authenticated: Boolean(token),
        adminRequest: isAdminRequest,
      }
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
      `[API SUCCESS] ${response.config.method?.toUpperCase() || 'GET'} ${response.config.url}`,
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
      // ADMIN AUTHENTICATION FAILURE
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
        '[API] Request timed out:',
        error.config?.url
      );
    }

    // ========================================================
    // NETWORK ERROR
    // ========================================================

    else {
      console.error(
        '[API] Network error:',
        error.message
      );
    }

    return Promise.reject(error);
  }
);

export default apiClient;
