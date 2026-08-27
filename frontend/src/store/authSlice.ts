import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}


// ============================================================
// SAFELY LOAD SAVED USER
// ============================================================

const getSavedUser = (): User | null => {
  try {
    const savedUser = localStorage.getItem('user');

    if (!savedUser) {
      return null;
    }

    const parsedUser = JSON.parse(savedUser);

    if (
      !parsedUser ||
      typeof parsedUser !== 'object' ||
      !parsedUser.email
    ) {
      localStorage.removeItem('user');
      return null;
    }

    return parsedUser as User;

  } catch (error) {
    console.error('Unable to read saved user:', error);

    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');

    return null;
  }
};


// ============================================================
// INITIAL STATE
// ============================================================

const savedToken = localStorage.getItem('authToken');
const savedUser = getSavedUser();

const initialState: AuthState = {
  isAuthenticated: Boolean(savedToken && savedUser),
  user: savedUser,
  token: savedToken,
  loading: false,
  error: null,
};


// ============================================================
// AUTH SLICE
// ============================================================

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {

    // ========================================================
    // LOGIN
    // ========================================================

    login: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
      }>
    ) => {
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.error = null;

      localStorage.setItem(
        'authToken',
        action.payload.token
      );

      localStorage.setItem(
        'user',
        JSON.stringify(action.payload.user)
      );
    },


    // ========================================================
    // LOGOUT
    // ========================================================

    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },


    // ========================================================
    // LOADING
    // ========================================================

    setLoading: (
      state,
      action: PayloadAction<boolean>
    ) => {
      state.loading = action.payload;
    },


    // ========================================================
    // ERROR
    // ========================================================

    setError: (
      state,
      action: PayloadAction<string | null>
    ) => {
      state.error = action.payload;
    },


    // ========================================================
    // CLEAR AUTHENTICATION
    // ========================================================

    clearAuth: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    },

  },
});


// ============================================================
// EXPORT ACTIONS
// ============================================================

export const {
  login,
  logout,
  setLoading,
  setError,
  clearAuth,
} = authSlice.actions;


// ============================================================
// EXPORT REDUCER
// ============================================================

export default authSlice.reducer;
