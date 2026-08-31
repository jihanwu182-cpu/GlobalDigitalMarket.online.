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

const API_URL =
  'https://globalmarket-com.onrender.com/api';

interface LoginUser {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  createdAt?: string;
}

interface LoginData {
  message?: unknown;
  accessToken?: string;
  refreshToken?: string;
  user?: LoginUser;
}

const getSafeMessage = (
  value: unknown,
  fallback: string
): string => {
  if (typeof value === 'string') {
    return value;
  }

  if (
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return String(value);
  }

  if (value instanceof Error) {
    return value.message;
  }

  if (value && typeof value === 'object') {
    const objectValue =
      value as Record<string, unknown>;

    if (
      typeof objectValue.message === 'string'
    ) {
      return objectValue.message;
    }

    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  return fallback;
};

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] =
    useState('');
  const [errorMessage, setErrorMessage] =
    useState('');

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage(
        'Please enter your email address.'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        'Please enter your password.'
      );
      return;
    }

    try {
      setLoading(true);

      console.log('LOGIN: starting request');

      const response = await axios.post<LoginData>(
        `${API_URL}/auth/login`,
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
        'LOGIN: response received:',
        response.data
      );

      const data = response.data;

      // --------------------------------------------------------
      // Save access token
      // --------------------------------------------------------

      if (
        typeof data.accessToken === 'string' &&
        data.accessToken.length > 0
      ) {
        localStorage.setItem(
          'authToken',
          data.accessToken
        );
      }

      // --------------------------------------------------------
      // Save refresh token
      // --------------------------------------------------------

      if (
        typeof data.refreshToken === 'string' &&
        data.refreshToken.length > 0
      ) {
        localStorage.setItem(
          'refreshToken',
          data.refreshToken
        );
      }

      // --------------------------------------------------------
      // Save user
      // --------------------------------------------------------

      if (
        data.user &&
        typeof data.user === 'object'
      ) {
        localStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );
      }

      // --------------------------------------------------------
      // SUCCESS MESSAGE
      // --------------------------------------------------------

      const safeSuccessMessage =
        getSafeMessage(
          data.message,
          'Login successful!'
        );

      setSuccessMessage(
  safeSuccessMessage
);

setLoading(false);

navigate('/dashboard');

    } catch (error: unknown) {
      console.error(
        'LOGIN ERROR:',
        error
      );

      setLoading(false);

      // --------------------------------------------------------
      // AXIOS ERROR
      // --------------------------------------------------------

      if (axios.isAxiosError(error)) {
        console.error(
          'LOGIN STATUS:',
          error.response?.status
        );

        console.error(
          'LOGIN RESPONSE:',
          error.response?.data
        );

        const responseData =
          error.response?.data;

        let message =
          'Login failed. Please check your email and password.';

        if (
          responseData &&
          typeof responseData === 'object'
        ) {
          const dataObject =
            responseData as Record<
              string,
              unknown
            >;

          if (
            dataObject.message !== undefined
          ) {
            message = getSafeMessage(
              dataObject.message,
              message
            );
          } else if (
            dataObject.error !== undefined
          ) {
            message = getSafeMessage(
              dataObject.error,
              message
            );
          } else {
            message = getSafeMessage(
              responseData,
              message
            );
          }
        }

        setErrorMessage(message);

      } else if (error instanceof Error) {

        setErrorMessage(
          error.message ||
            'Login failed. Please try again.'
        );

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
              required
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
              required
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
              onClick={() =>
                navigate('/register')
              }
            >
              Don't have an account? Register
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={() =>
                navigate('/')
              }
            >
              Back to Home
            </Button>

            {successMessage && (
              <Button
                type="button"
                variant="outlined"
                onClick={() =>
                  navigate('/dashboard')
                }
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
