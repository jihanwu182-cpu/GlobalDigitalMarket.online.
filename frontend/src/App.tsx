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

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Portfolio from './pages/Portfolio';
import Trading from './pages/Trading';
import Market from './pages/Market';
import Wallet from './pages/Wallet';


// ============================================================
// ERROR BOUNDARY
// ============================================================

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
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
        error?.message || 'Unknown application error',
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('APPLICATION ERROR:', error);
    console.error('ERROR INFO:', errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100vh',
            background: '#f5f5f5',
            padding: '30px',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <h1 style={{ color: '#d32f2f' }}>
            Application Error
          </h1>

          <p>
            The website loaded, but the application
            encountered an error.
          </p>

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              marginTop: '20px',
              wordBreak: 'break-word',
            }}
          >
            <strong>Error:</strong>

            <p>{this.state.errorMessage}</p>
          </div>

          <p style={{ marginTop: '20px' }}>
            Please send this error message to support.
          </p>
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
    fontFamily: 'Roboto, Arial, sans-serif',
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

            <Route
              path="/login"
              element={<Login />}
            />

            <Route
              path="/register"
              element={<Register />}
            />

            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            <Route
              path="/portfolio"
              element={<Portfolio />}
            />

            <Route
              path="/trading"
              element={<Trading />}
            />

            <Route
              path="/market"
              element={<Market />}
            />

            <Route
              path="/wallet"
              element={<Wallet />}
            />

            <Route
              path="/"
              element={
                <Navigate
                  to="/login"
                  replace
                />
              }
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/login"
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
