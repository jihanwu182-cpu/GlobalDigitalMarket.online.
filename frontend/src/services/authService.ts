import apiClient from './apiClient';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role?: string;
  };
}

interface RegisterResponse {
  user: LoginResponse['user'];
  accessToken?: string;
  refreshToken?: string;
  message?: string;
}

const authService = {
  /**
   * Login user
   */
  async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });

    const data: LoginResponse = response.data;

    // Save authentication information
    if (data.accessToken) {
      localStorage.setItem('authToken', data.accessToken);
    }

    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Register a new user
   */
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<RegisterResponse> {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });

    const data: RegisterResponse = response.data;

    // If registration automatically logs the user in
    if (data.accessToken) {
      localStorage.setItem('authToken', data.accessToken);
    }

    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      // Even if the backend logout fails,
      // clear the local authentication information.
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post('/auth/refresh', {
      refreshToken,
    });

    const data: LoginResponse = response.data;

    if (data.accessToken) {
      localStorage.setItem('authToken', data.accessToken);
    }

    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }

    if (data.user) {
      localStorage.setItem('user', JSON.stringify(data.user));
    }

    return data;
  },

  /**
   * Check whether a user is currently authenticated
   */
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem('authToken'));
  },

  /**
   * Get the current saved user
   */
  getCurrentUser(): LoginResponse['user'] | null {
    const user = localStorage.getItem('user');

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user);
    } catch {
      localStorage.removeItem('user');
      return null;
    }
  },

  /**
   * Get the current access token
   */
  getToken(): string | null {
    return localStorage.getItem('authToken');
  },
};

export default authService;
