import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

import {
  ThemeProvider,
  createTheme,
} from '@mui/material/styles';

import CssBaseline from '@mui/material/CssBaseline';

import Login from './Pages/Login';
import Register from './Pages/Register';
import Dashboard from './Pages/Dashboard';
import Portfolio from './Pages/Portfolio';
import Trading from './Pages/Trading';
import Market from './Pages/Market';
import Wallet from './Pages/Wallet';

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
    fontFamily: 'Roboto, sans-serif',
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

          {/* Register */}
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

          {/* Unknown page */}
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
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
