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

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Trading from './pages/Trading';
import Market from './pages/Market';
import Wallet from './pages/Wallet';
import ContactSupport from './pages/ContactSupport';

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
            fontFamily:
              'Arial, sans-serif',
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

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <CssBaseline />

        <HashRouter>
          <Routes>

            {/* HOME */}

            <Route
              path="/"
              element={<Home />}
            />

            {/* AUTHENTICATION */}

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            {/* MAIN DASHBOARD */}

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* PORTFOLIO */}

            <Route
              path="/portfolio"
              element={<Portfolio />}
            />

            {/* TRADING */}

            <Route
              path="/trading"
              element={<Trading />}
            />

            {/* MARKETS */}

            <Route
              path="/market"
              element={<Market />}
            />

            {/* WALLET */}

            <Route
              path="/wallet"
              element={<Wallet />}
            />

            {/* CONTACT SUPPORT */}

            <Route
              path="/support"
              element={<ContactSupport />}
            />

            {/* UNKNOWN ROUTES */}

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
