import React from 'react';
import {
  HashRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
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

import authService from './services/authService';


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
// PROTECTED ROUTE
// ============================================================

const ProtectedRoute: React.FC = () => {
  const authenticated = authService.isAuthenticated();

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};


// ============================================================
// APP
// ============================================================

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <HashRouter>
        <Routes>

          {/* ==================================================
              PUBLIC PAGES
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
              PROTECTED PAGES
          ================================================== */}

          <Route element={<ProtectedRoute />}>

            {/* Real logged-in dashboard */}
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

          </Route>


          {/* ==================================================
              HOME
          ================================================== */}

          <Route
            path="/"
            element={
              authService.isAuthenticated() ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />


          {/* ==================================================
              UNKNOWN PAGE
          ================================================== */}

          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;
