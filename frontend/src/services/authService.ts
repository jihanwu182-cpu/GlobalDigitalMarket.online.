import apiClient from './apiClient';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

interface LoginResponse {
  message?: string;
  accessToken: string;
  refreshToken: string;
  user: User;
}

interface RegisterResponse {
  message?: string;
  user: User;
  accessToken?: string;
  refreshToken?: string;
}

const authService = {
  // ============================================================
  // LOGIN
  // ============================================================

  async login(
    email: string,
    password: string
  ): Promise<LoginResponse> {
    const response = await apiClient.post(
      '/auth/login',
      {
        email,
        password,
      }
    );

    const data: LoginResponse = response.data;

    if (data.accessToken) {
      localStorage.setItem(
        'authToken',
        data.accessToken
      );
    }

    if (data.refreshToken) {
      localStorage.setItem(
        'refreshToken',
        data.refreshToken
      );
    }

    if (data.user) {
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );
    }

    return data;
  },

  // ============================================================
  // REGISTER
  // ============================================================

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Promise<RegisterResponse> {
    const response = await apiClient.post(
      '/auth/register',
      {
        email,
        password,
        firstName,
        lastName,
      }
    );

    const data: RegisterResponse = response.data;

    if (data.accessToken) {
      localStorage.setItem(
        'authToken',
        data.accessToken
      );
    }

    if (data.refreshToken) {
      localStorage.setItem(
        'refreshToken',
        data.refreshToken
      );
    }

    if (data.user) {
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );
    }

    return data;
  },

  // ============================================================
  // LOGOUT
  // ============================================================

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error(
        'Logout request failed:',
        error
      );
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  },

  // ============================================================
  // REFRESH TOKEN
  // ============================================================

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken =
      localStorage.getItem('refreshToken');

    if (!refreshToken) {
      throw new Error(
        'No refresh token available'
      );
    }

    const response = await apiClient.post(
      '/auth/refresh-token',
      {
        refreshToken,
      }
    );

    const data: LoginResponse = response.data;

    if (data.accessToken) {
      localStorage.setItem(
        'authToken',
        data.accessToken
      );
    }

    if (data.refreshToken) {
      localStorage.setItem(
        'refreshToken',
        data.refreshToken
      );
    }

    if (data.user) {
      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );
    }

    return data;
  },

  // ============================================================
  // CHECK AUTHENTICATION
  // ============================================================

  isAuthenticated(): boolean {
    return Boolean(
      localStorage.getItem('authToken')
    );
  },

  // ============================================================
  // CURRENT USER
  // ============================================================

  getCurrentUser(): User | null {
    const user =
      localStorage.getItem('user');

    if (!user) {
      return null;
    }

    try {
      return JSON.parse(user) as User;
    } catch (error) {
      console.error(
        'Could not parse saved user:',
        error
      );

      localStorage.removeItem('user');

      return null;
    }
  },

  // ============================================================
  // ACCESS TOKEN
  // ============================================================

  getToken(): string | null {
    return localStorage.getItem(
      'authToken'
    );
  },

  // ============================================================
  // CLEAR AUTHENTICATION
  // ============================================================

  clearAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  },
};

export default authService;
