import apiClient from './apiClient';

interface User {
  id: string | number;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  phone?: string;
  country?: string;
  preferredCurrency?: string;
  referralCode?: string;
  referrerCode?: string;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  identityVerificationStatus?: string;
  createdAt?: string;
}

interface Account {
  id: string | number;
  accountNumber?: string;
  accountType?: string;
  accountName?: string;
  currency?: string;
  balance?: number;
  availableBalance?: number;
  status?: string;
  createdAt?: string;
}

interface LoginResponse {
  message?: string;
  user: User;
  account?: Account | null;
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse {
  message?: string;
  user: User;
  account?: Account;
  accessToken?: string;
  refreshToken?: string;
}

const saveAuthentication = (
  data: LoginResponse | RegisterResponse
): void => {
  if (data.accessToken) {
    localStorage.setItem(
      'authToken',
      data.accessToken
    );

    localStorage.setItem(
      'accessToken',
      data.accessToken
    );

    localStorage.setItem(
      'token',
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

    localStorage.setItem(
      'currentUser',
      JSON.stringify(data.user)
    );
  }

  if ('account' in data && data.account) {
    localStorage.setItem(
      'account',
      JSON.stringify(data.account)
    );
  }
};

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
        email: email.trim().toLowerCase(),
        password,
      }
    );

    const data: LoginResponse =
      response.data;

    saveAuthentication(data);

    return data;
  },

  // ============================================================
  // REGISTER
  // ============================================================

  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    username: string,
    phone: string,
    country: string,
    preferredCurrency: string,
    referrerCode?: string
  ): Promise<RegisterResponse> {
    const response =
      await apiClient.post(
        '/auth/register',
        {
          email:
            email.trim().toLowerCase(),

          password,

          firstName:
            firstName.trim(),

          lastName:
            lastName.trim(),

          username:
            username.trim(),

          phone:
            phone.trim(),

          country:
            country.trim(),

          preferredCurrency:
            preferredCurrency
              .trim()
              .toUpperCase(),

          referrerCode:
            referrerCode?.trim() || undefined,
        }
      );

    const data: RegisterResponse =
      response.data;

    saveAuthentication(data);

    return data;
  },

  // ============================================================
  // LOGOUT
  // ============================================================

  async logout(): Promise<void> {
    try {
      await apiClient.post(
        '/auth/logout'
      );
    } catch (error) {
      console.error(
        'Logout request failed:',
        error
      );
    } finally {
      localStorage.removeItem(
        'authToken'
      );

      localStorage.removeItem(
        'accessToken'
      );

      localStorage.removeItem(
        'token'
      );

      localStorage.removeItem(
        'refreshToken'
      );

      localStorage.removeItem(
        'user'
      );

      localStorage.removeItem(
        'currentUser'
      );

      localStorage.removeItem(
        'account'
      );
    }
  },

  // ============================================================
  // REFRESH TOKEN
  // ============================================================

  async refreshToken(): Promise<LoginResponse> {
    const token =
      localStorage.getItem(
        'refreshToken'
      );

    if (!token) {
      throw new Error(
        'No refresh token available.'
      );
    }

    const response =
      await apiClient.post(
        '/auth/refresh-token',
        {
          refreshToken: token,
        }
      );

    const data: LoginResponse =
      response.data;

    saveAuthentication(data);

    return data;
  },

  // ============================================================
  // CHECK AUTHENTICATION
  // ============================================================

  isAuthenticated(): boolean {
    return Boolean(
      localStorage.getItem(
        'authToken'
      )
    );
  },

  // ============================================================
  // CURRENT USER
  // ============================================================

  getCurrentUser(): User | null {
    const user =
      localStorage.getItem(
        'user'
      );

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

      localStorage.removeItem(
        'user'
      );

      localStorage.removeItem(
        'currentUser'
      );

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
    localStorage.removeItem(
      'authToken'
    );

    localStorage.removeItem(
      'accessToken'
    );

    localStorage.removeItem(
      'token'
    );

    localStorage.removeItem(
      'refreshToken'
    );

    localStorage.removeItem(
      'user'
    );

    localStorage.removeItem(
      'currentUser'
    );

    localStorage.removeItem(
      'account'
    );
  },
};

export default authService;
