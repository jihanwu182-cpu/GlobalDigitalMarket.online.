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

          {/* Public Homepage */}
          <Route
            path="/"
            element={<Home />}
          />

          {/* Authentication */}
          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/register"
            element={<Register />}
          />

          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Application pages */}
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

          {/* Unknown route */}
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
