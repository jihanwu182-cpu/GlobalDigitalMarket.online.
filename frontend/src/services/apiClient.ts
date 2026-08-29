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
// ADD AUTHENTICATION TOKEN
// ============================================================

apiClient.interceptors.request.use(
  (config) => {
    const requestUrl =
      config.url || '';

    const isAdminRequest =
      requestUrl.startsWith('/admin');

    let token: string | null = null;

    // --------------------------------------------------------
    // ADMIN REQUESTS
    // --------------------------------------------------------

    if (isAdminRequest) {
      token =
        localStorage.getItem(
          'adminToken'
        );
    }

    // --------------------------------------------------------
    // NORMAL USER REQUESTS
    // --------------------------------------------------------

    else {
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

    // --------------------------------------------------------
    // ADD BEARER TOKEN
    // --------------------------------------------------------

    if (token) {
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

    return Promise.reject(error);
  }
);

export default apiClient;
