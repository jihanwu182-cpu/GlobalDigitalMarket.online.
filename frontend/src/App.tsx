import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

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

      <BrowserRouter>
        <Routes>

          {/* Login */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* Create Account */}
          <Route
            path="/register"
            element={<Register />}
          />

          {/* Dashboard */}
          <Route
            path="/"
            element={<Dashboard />}
          />

          {/* Portfolio */}
          <Route
            path="/portfolio"
            element={<Portfolio />}
          />

          {/* Trading */}
          <Route
            path="/trading"
            element={<Trading />}
          />

          {/* Market */}
          <Route
            path="/market"
            element={<Market />}
          />

          {/* Wallet */}
          <Route
            path="/wallet"
            element={<Wallet />}
          />

          {/* Unknown pages */}
          <Route
            path="*"
            element={<Navigate to="/" replace />}
          />

        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
