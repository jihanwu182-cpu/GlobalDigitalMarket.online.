import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
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

const API_URL =
  'https://globalmarket-com.onrender.com/api/auth';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage(
        'Please enter your email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(
        `${API_URL}/login`,
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
        'LOGIN SUCCESS:',
        response.data
      );

      // Save authentication information
      if (response.data?.accessToken) {
        localStorage.setItem(
          'authToken',
          response.data.accessToken
        );
      }

      if (response.data?.refreshToken) {
        localStorage.setItem(
          'refreshToken',
          response.data.refreshToken
        );
      }

      if (response.data?.user) {
        localStorage.setItem(
          'user',
          JSON.stringify(response.data.user)
        );
      }

      // Go to dashboard
      navigate('/dashboard');

    } catch (error: unknown) {
      console.error(
        'LOGIN ERROR:',
        error
      );

      if (axios.isAxiosError(error)) {
        console.error(
          'BACKEND STATUS:',
          error.response?.status
        );

        console.error(
          'BACKEND RESPONSE:',
          error.response?.data
        );

        const message =
          error.response?.data?.message ||
          error.response?.data?.error;

        if (message) {
          setErrorMessage(message);
        } else if (
          error.response?.status === 401
        ) {
          setErrorMessage(
            'Invalid email or password.'
          );
        } else if (
          error.response?.status === 500
        ) {
          setErrorMessage(
            'The server encountered an error. Please try again.'
          );
        } else {
          setErrorMessage(
            'Login failed. Please try again.'
          );
        }
      } else {
        setErrorMessage(
          'Something went wrong. Please try again.'
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

          <Box
            component="form"
            onSubmit={handleSubmit}
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
              required
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
              required
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
              onClick={() =>
                navigate('/register')
              }
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
