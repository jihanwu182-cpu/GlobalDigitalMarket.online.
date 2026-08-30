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

// ============================================================
// USER PAGES
// ============================================================

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
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
// ADMIN LAYOUT
// ============================================================

import AdminLayout from './layout/AdminLayout';

// ============================================================
// ADMIN PLACEHOLDER
// ============================================================
// These routes temporarily display the Admin Dashboard.
// Later we can give each section its own full page.
// ============================================================

const AdminSection: React.FC<{
  title: string;
  tab?: number;
}> = ({ title }) => {
  return (
    <AdminLayout>
      <AdminDashboard />
    </AdminLayout>
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
  constructor(props: ErrorBoundaryProps) {
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
                HOME
            ================================================== */}

            <Route
              path="/"
              element={<Home />}
            />

            {/* ==================================================
                AUTHENTICATION
            ================================================== */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {/* ==================================================
                USER DASHBOARD
            ================================================== */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* ==================================================
                USER PROFILE
            ================================================== */}

            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* ==================================================
                ACCOUNT STATEMENT
            ================================================== */}

            <Route
              path="/account-statement"
              element={<AccountStatement />}
            />

            {/* ==================================================
                PORTFOLIO
            ================================================== */}

            <Route
              path="/portfolio"
              element={<Portfolio />}
            />

            {/* ==================================================
                WALLET
            ================================================== */}

            <Route
              path="/wallet"
              element={<Wallet />}
            />

            {/* ==================================================
                TRADING
            ================================================== */}

            <Route
              path="/trading"
              element={<Trading />}
            />

            {/* ==================================================
                MARKET
            ================================================== */}

            <Route
              path="/market"
              element={<Market />}
            />

            {/* ==================================================
                SUPPORT
            ================================================== */}

            <Route
              path="/support"
              element={<ContactSupport />}
            />

            {/* ==================================================
                SECURITY
            ================================================== */}

            <Route
              path="/security"
              element={
                <Navigate
                  to="/profile"
                  replace
                />
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
            ================================================== */}

            <Route
              path="/admin"
              element={
                <AdminLayout>
                  <AdminDashboard />
                </AdminLayout>
              }
            />

            {/* ==================================================
                ADMIN USERS
            ================================================== */}

            <Route
              path="/admin/users"
              element={
                <AdminSection
                  title="Users"
                />
              }
            />

            {/* ==================================================
                ADMIN ACCOUNTS
            ================================================== */}

            <Route
              path="/admin/accounts"
              element={
                <AdminSection
                  title="Accounts / Funding"
                />
              }
            />

            {/* ==================================================
                ADMIN KYC
            ================================================== */}

            <Route
              path="/admin/kyc"
              element={
                <AdminSection
                  title="KYC"
                />
              }
            />

            {/* ==================================================
                ADMIN DEPOSITS
            ================================================== */}

            <Route
              path="/admin/deposits"
              element={
                <AdminSection
                  title="Deposits"
                />
              }
            />

            {/* ==================================================
                ADMIN WITHDRAWALS
            ================================================== */}

            <Route
              path="/admin/withdrawals"
              element={
                <AdminSection
                  title="Withdrawals"
                />
              }
            />

            {/* ==================================================
                ADMIN TRANSACTIONS
            ================================================== */}

            <Route
              path="/admin/transactions"
              element={
                <AdminSection
                  title="Transactions"
                />
              }
            />

            {/* ==================================================
                ADMIN INVESTMENTS
            ================================================== */}

            <Route
              path="/admin/investments"
              element={
                <AdminSection
                  title="Investments"
                />
              }
            />

            {/* ==================================================
                ADMIN SIGNALS
            ================================================== */}

            <Route
              path="/admin/signals"
              element={
                <AdminSection
                  title="Signals"
                />
              }
            />

            {/* ==================================================
                ADMIN SETTINGS
            ================================================== */}

            <Route
              path="/admin/settings"
              element={
                <AdminSection
                  title="Settings"
                />
              }
            />

            {/* ==================================================
                ADMIN PAYMENT METHODS
            ================================================== */}

            <Route
              path="/admin/settings/payment-methods"
              element={
                <AdminSection
                  title="Payment Methods"
                />
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
