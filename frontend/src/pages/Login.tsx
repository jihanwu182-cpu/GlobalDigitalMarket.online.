import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

import authService from '../services/authService';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
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

      if (!response?.accessToken) {
        throw new Error(
          'Login succeeded but no access token was returned by the server.'
        );
      }

      setSuccessMessage('Login successful!');

      // Give the user a moment to see the success message.
      setTimeout(() => {
        navigate('/');
      }, 500);

    } catch (error: any) {
      console.error('LOGIN ERROR:', error);

      if (error?.response) {
        console.error(
          'Backend status:',
          error.response.status
        );

        console.error(
          'Backend response:',
          error.response.data
        );
      }

      if (error?.response?.data?.message) {
        setErrorMessage(
          error.response.data.message
        );
      } else if (error?.response?.data?.error) {
        setErrorMessage(
          error.response.data.error
        );
      } else if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          'Login failed. Please try again.'
        );
      }

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
        padding: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 450,
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ padding: 4 }}>

          <Typography
            variant="h4"
            component="h1"
            sx={{
              marginBottom: 3,
              textAlign: 'center',
              fontWeight: 700,
            }}
          >
            Login to Global Digital Market
          </Typography>

          {errorMessage && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert
              severity="success"
              sx={{ mb: 2 }}
            >
              {successMessage}
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
              autoComplete="email"
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
              autoComplete="current-password"
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              disabled={loading}
              sx={{
                marginTop: 1,
                paddingY: 1.5,
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
                'Login'
              )}
            </Button>

            <Button
              fullWidth
              variant="text"
              type="button"
              disabled={loading}
              onClick={() =>
                navigate('/register')
              }
            >
              Create an account
            </Button>

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
