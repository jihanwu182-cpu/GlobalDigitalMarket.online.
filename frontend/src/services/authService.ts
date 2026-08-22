import apiClient from './apiClient';

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: any;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    const data = response.data;
    localStorage.setItem('authToken', data.accessToken);
    return data;
  },

  async register(email: string, password: string, firstName: string, lastName: string): Promise<any> {
    const response = await apiClient.post('/auth/register', {
      email,
      password,
      firstName,
      lastName,
    });
    return response.data;
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout');
    localStorage.removeItem('authToken');
  },

  async refreshToken(): Promise<LoginResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    const response = await apiClient.post('/auth/refresh', { refreshToken });
    const data = response.data;
    localStorage.setItem('authToken', data.accessToken);
    return data;
  },
};

export default authService;
