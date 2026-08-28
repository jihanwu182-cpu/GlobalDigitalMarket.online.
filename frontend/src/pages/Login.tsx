import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import authService from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage('');
    setError('');

    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      console.log('LOGIN STARTED');

      const response = await authService.login(
        email.trim(),
        password
      );

      console.log('LOGIN RESPONSE:', response);

      setMessage(
        response.message || 'Login successful!'
      );

      /*
       * IMPORTANT:
       * We are NOT navigating to the dashboard yet.
       *
       * This is a test to make sure the login itself
       * works before we involve Dashboard.tsx.
       */

    } catch (error: any) {
      console.error('LOGIN ERROR:', error);

      if (error?.response) {
        console.error(
          'BACKEND STATUS:',
          error.response.status
        );

        console.error(
          'BACKEND RESPONSE:',
          error.response.data
        );
      }

      const backendMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message;

      setError(
        backendMessage ||
          'Login failed. Please check your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'linear-gradient(135deg, #0f172a 0%, #16213e 50%, #1e3a5f 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 450,
          boxShadow: 5,
        }}
      >
        <CardContent sx={{ p: 4 }}>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              textAlign: 'center',
              fontWeight: 700,
              mb: 3,
            }}
          >
            Login
          </Typography>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {error}
            </Alert>
          )}

          {message && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
            >
              {message}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleLogin}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={loading}
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.5,
                mt: 1,
              }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={24}
                    sx={{ mr: 1 }}
                  />
                  Logging in...
                </>
              ) : (
                'LOGIN'
              )}
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={() => navigate('/register')}
            >
              Don't have an account? Register
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={() => navigate('/')}
            >
              Back to Home
            </Button>

            {message && (
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/dashboard')}
              >
                Continue to Dashboard
              </Button>
            )}

          </Box>

        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
