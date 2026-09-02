import React from 'react';

import {
  HashRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import {
  ThemeProvider,
  createTheme,
} from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';
import Header from './components/Header';
// ============================================================
// USER PAGES
// ============================================================

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Company from './pages/Company';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AccountStatement from './pages/AccountStatement';
import Portfolio from './pages/Portfolio';
import Trading from './pages/Trading';
import Market from './pages/Market';
import Wallet from './pages/Wallet';
import ContactSupport from './pages/ContactSupport';

// ============================================================
// ADMIN PAGES
// ============================================================

import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

// ============================================================
// PROTECTED USER ROUTE
// ============================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
}) => {
  const token =
    localStorage.getItem('authToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
  <>
    <Header />
    {children}
  </>
);
};

// ============================================================
// ADMIN SECTION
// ============================================================

interface AdminSectionProps {
  tab: number;
}

const AdminSection: React.FC<AdminSectionProps> = ({
  tab,
}) => {
  return (
    <AdminDashboard
      initialTab={tab}
    />
  );
};

// ============================================================
// ERROR BOUNDARY
// ============================================================

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(
    props: ErrorBoundaryProps
  ) {
    super(props);

    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(
    error: Error
  ): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage:
        error?.message ||
        'An unexpected application error occurred.',
    };
  }

  componentDidCatch(
    error: Error,
    errorInfo: React.ErrorInfo
  ) {
    console.error(
      'GLOBAL REACT ERROR:',
      error
    );

    console.error(
      'REACT ERROR INFO:',
      errorInfo
    );
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.hash = '#/';
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            background: '#f5f5f5',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              background: '#ffffff',
              padding: '30px',
              borderRadius: '12px',
              boxShadow:
                '0 4px 20px rgba(0,0,0,0.15)',
            }}
          >
            <h1
              style={{
                marginTop: 0,
                color: '#d32f2f',
              }}
            >
              Application Error
            </h1>

            <p>
              The application encountered an
              unexpected error.
            </p>

            <div
              style={{
                background: '#f5f5f5',
                padding: '15px',
                borderRadius: '8px',
                marginTop: '20px',
                marginBottom: '20px',
                wordBreak: 'break-word',
              }}
            >
              <strong>Error:</strong>

              <br />

              {this.state.errorMessage}
            </div>

            <button
              onClick={this.handleReload}
              style={{
                padding: '12px 20px',
                marginRight: '10px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                background: '#1976d2',
                color: '#ffffff',
                fontSize: '16px',
              }}
            >
              Reload
            </button>

            <button
              onClick={this.handleHome}
              style={{
                padding: '12px 20px',
                border: '1px solid #1976d2',
                borderRadius: '6px',
                cursor: 'pointer',
                background: '#ffffff',
                color: '#1976d2',
                fontSize: '16px',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================
// THEME
// ============================================================

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },

    secondary: {
      main: '#dc004e',
    },

    background: {
      default: '#f5f5f5',
    },
  },

  typography: {
    fontFamily:
      'Roboto, Arial, sans-serif',
  },
});

// ============================================================
// APP
// ============================================================

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <HashRouter>
          <Routes>

            {/* ==================================================
                PUBLIC USER ROUTES
            ================================================== */}

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />
            <Route
  path="/company"
  element={<Company />}
/>

            {/* ==================================================
                PROTECTED USER ROUTES
            ================================================== */}

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/account-statement"
              element={
                <ProtectedRoute>
                  <AccountStatement />
                </ProtectedRoute>
              }
            />

            <Route
              path="/portfolio"
              element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              }
            />

            <Route
              path="/wallet"
              element={
                <ProtectedRoute>
                  <Wallet />
                </ProtectedRoute>
              }
            />

            <Route
              path="/trading"
              element={
                <ProtectedRoute>
                  <Trading />
                </ProtectedRoute>
              }
            />

            <Route
              path="/market"
              element={
                <ProtectedRoute>
                  <Market />
                </ProtectedRoute>
              }
            />

            <Route
              path="/support"
              element={
                <ProtectedRoute>
                  <ContactSupport />
                </ProtectedRoute>
              }
            />

            <Route
              path="/security"
              element={
                <ProtectedRoute>
                  <Navigate
                    to="/profile"
                    replace
                  />
                </ProtectedRoute>
              }
            />

            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Navigate
                    to="/profile"
                    replace
                  />
                </ProtectedRoute>
              }
            />

            {/* ==================================================
                ADMIN LOGIN
            ================================================== */}

            <Route
              path="/admin/login"
              element={<AdminLogin />}
            />

            {/* ==================================================
                ADMIN DASHBOARD
                tab 0
            ================================================== */}

            <Route
              path="/admin"
              element={
                <AdminSection tab={0} />
              }
            />

            {/* ==================================================
                ADMIN USERS
                tab 1
            ================================================== */}

            <Route
              path="/admin/users"
              element={
                <AdminSection tab={1} />
              }
            />

            {/* ==================================================
                ADMIN ACCOUNTS
                tab 2
            ================================================== */}

            <Route
              path="/admin/accounts"
              element={
                <AdminSection tab={2} />
              }
            />

            {/* ==================================================
                ADMIN TRANSACTIONS
                tab 3
            ================================================== */}

            <Route
              path="/admin/transactions"
              element={
                <AdminSection tab={3} />
              }
            />

            {/* ==================================================
                ADMIN DEPOSITS
                tab 4
            ================================================== */}

            <Route
              path="/admin/deposits"
              element={
                <AdminSection tab={4} />
              }
            />

            {/* ==================================================
                ADMIN WITHDRAWALS
                tab 5
            ================================================== */}

            <Route
              path="/admin/withdrawals"
              element={
                <AdminSection tab={5} />
              }
            />

            {/* ==================================================
                ADMIN KYC
                tab 6
            ================================================== */}

            <Route
              path="/admin/kyc"
              element={
                <AdminSection tab={6} />
              }
            />

            {/* ==================================================
                ADMIN INVESTMENT PLANS
                tab 7
            ================================================== */}

            <Route
              path="/admin/investments"
              element={
                <AdminSection tab={7} />
              }
            />

            {/* ==================================================
                ADMIN SIGNAL PLANS
                tab 8
            ================================================== */}

            <Route
              path="/admin/signals"
              element={
                <AdminSection tab={8} />
              }
            />

            {/* ==================================================
                ADMIN PAYMENT METHODS
                tab 9
            ================================================== */}

            <Route
              path="/admin/settings/payment-methods"
              element={
                <AdminSection tab={9} />
              }
            />

            {/* ==================================================
                ADMIN USER ACCOUNT FUNDING
                tab 10
            ================================================== */}

            <Route
              path="/admin/funding"
              element={
                <AdminSection tab={10} />
              }
            />

            {/* ==================================================
                ADMIN SETTINGS
                tab 11
            ================================================== */}

            <Route
              path="/admin/settings"
              element={
                <AdminSection tab={11} />
              }
            />

            {/* ==================================================
                WITHDRAWAL GENERATING CODE
                tab 12
            ================================================== */}

            <Route
              path="/admin/withdrawal-code"
              element={
                <AdminSection tab={12} />
              }
            />

            {/* ==================================================
                UNKNOWN ROUTES
            ================================================== */}

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />

          </Routes>
        </HashRouter>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
