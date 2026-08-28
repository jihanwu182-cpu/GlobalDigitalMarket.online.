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

// Add authentication token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API responses/errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API ERROR:', error);

    if (error.response) {
      console.error(
        'STATUS:',
        error.response.status
      );

      console.error(
        'DATA:',
        error.response.data
      );
    } else {
      console.error(
        'NETWORK ERROR:',
        error.message
      );
    }

    // IMPORTANT:
    // We are NOT automatically redirecting here.
    // HashRouter uses /#/login, and automatic redirects
    // were causing the white screen.

    return Promise.reject(error);
  }
);

export default apiClient;
