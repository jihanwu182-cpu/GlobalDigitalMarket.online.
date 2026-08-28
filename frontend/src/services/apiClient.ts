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

// Add authentication token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem('authToken') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle API responses and errors
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

    // Do not automatically redirect.
    // HashRouter handles navigation in the frontend.
    return Promise.reject(error);
  }
);

export default apiClient;
