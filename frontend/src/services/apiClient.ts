import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://globalmarket-com.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ============================================================
// AUTHENTICATION TOKEN
// ============================================================
//
// Admin requests use adminToken.
// Normal user requests use authToken/accessToken/token.
//

apiClient.interceptors.request.use(
  (config) => {
    const requestUrl =
      config.url || '';

    const isAdminRequest =
      requestUrl.startsWith('/admin');

    let token: string | null = null;

    if (isAdminRequest) {
      // ------------------------------------------------------
      // ADMIN REQUEST
      // ------------------------------------------------------
      token =
        localStorage.getItem(
          'adminToken'
        );
    } else {
      // ------------------------------------------------------
      // NORMAL USER REQUEST
      // ------------------------------------------------------
      token =
        localStorage.getItem(
          'authToken'
        ) ||
        localStorage.getItem(
          'accessToken'
        ) ||
        localStorage.getItem(
          'token'
        );
    }

    if (token) {
      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================================
// API RESPONSE HANDLER
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

      // ------------------------------------------------------
      // ADMIN AUTHENTICATION ERROR
      // ------------------------------------------------------

      if (
        error.response.status === 401 &&
        error.config?.url?.startsWith(
          '/admin'
        )
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
    } else {
      console.error(
        'NETWORK ERROR:',
        error.message
      );
    }

    // Do not automatically redirect.
    // HashRouter handles navigation.
    return Promise.reject(error);
  }
);

export default apiClient;
