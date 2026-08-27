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
import Portfolio from './pages/Portfolio';
import Trading from './pages/Trading';
import Market from './pages/Market';
import Wallet from './pages/Wallet';

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

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <HashRouter>
        <Routes>

          {/* =========================
              LOGIN
          ========================= */}

          <Route
            path="/login"
            element={<Login />}
          />

          {/* =========================
              REGISTER
          ========================= */}

          <Route
            path="/register"
            element={<Register />}
          />

          {/* =========================
              TEMPORARY DASHBOARD TEST
          ========================= */}

          <Route
            path="/"
            element={
              <div
                style={{
                  minHeight: '100vh',
                  padding: '40px',
                  backgroundColor: '#f5f5f5',
                  fontFamily: 'Roboto, Arial, sans-serif',
                }}
              >
                <div
                  style={{
                    maxWidth: '700px',
                    margin: '0 auto',
                    padding: '40px',
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    boxShadow:
                      '0 4px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <h1
                    style={{
                      marginTop: 0,
                      color: '#1976d2',
                    }}
                  >
                    Login Successful!
                  </h1>

                  <p
                    style={{
                      fontSize: '18px',
                      color: '#444',
                    }}
                  >
                    Your login is working and the
                    dashboard route is working.
                  </p>

                  <p
                    style={{
                      color: '#666',
                    }}
                  >
                    We are testing the application
                    before loading the full dashboard.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.hash =
                        '#/portfolio';
                    }}
                    style={{
                      marginTop: '20px',
                      padding: '12px 24px',
                      border: 'none',
                      borderRadius: '8px',
                      backgroundColor: '#1976d2',
                      color: '#ffffff',
                      fontSize: '16px',
                      cursor: 'pointer',
                    }}
                  >
                    Open Portfolio
                  </button>
                </div>
              </div>
            }
          />

          {/* =========================
              OTHER PAGES
          ========================= */}

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

          {/* =========================
              UNKNOWN ROUTES
          ========================= */}

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
  );
};

export default App;
