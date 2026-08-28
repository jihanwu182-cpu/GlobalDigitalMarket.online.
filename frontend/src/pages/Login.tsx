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
import axios from 'axios';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage('');
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage(
        'Please enter your email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      console.log('LOGIN: starting request');

      const response = await axios.post(
        'https://globalmarket-com.onrender.com/api/auth/login',
        {
          email: email.trim().toLowerCase(),
          password,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log(
        'LOGIN: response received',
        response.data
      );

      const data = response.data;

      if (data?.accessToken) {
        localStorage.setItem(
          'authToken',
          data.accessToken
        );
      }

      if (data?.refreshToken) {
        localStorage.setItem(
          'refreshToken',
          data.refreshToken
        );
      }

      if (data?.user) {
        localStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );
      }

      setMessage(
        data?.message ||
          'Login successful!'
      );

      setLoading(false);

    } catch (error: unknown) {
      console.error(
        'LOGIN ERROR:',
        error
      );

      setLoading(false);

      if (axios.isAxiosError(error)) {
        console.error(
          'STATUS:',
          error.response?.status
        );

        console.error(
          'DATA:',
          error.response?.data
        );

        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error;

        setErrorMessage(
          backendMessage ||
            'Login failed. Please try again.'
        );
      } else if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          'Login failed. Please try again.'
        );
      }
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

          {errorMessage && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
            >
              {errorMessage}
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

          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
