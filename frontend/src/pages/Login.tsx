import React, { useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

import {
  Link as RouterLink,
  useNavigate,
} from 'react-router-dom';

import apiClient from '../services/apiClient';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // ============================================================
  // LOGIN
  // ============================================================

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post(
        '/auth/login',
        {
          email: normalizedEmail,
          password,
        }
      );

      const data = response.data;

      // ----------------------------------------------------------
      // SAVE TOKENS
      // ----------------------------------------------------------

      if (data?.accessToken) {
        localStorage.setItem(
          'accessToken',
          data.accessToken
        );

        // Also keep authToken for compatibility
        // with the existing ProtectedRoute.
        localStorage.setItem(
          'authToken',
          data.accessToken
        );

        localStorage.setItem(
          'token',
          data.accessToken
        );
      }

      if (data?.refreshToken) {
        localStorage.setItem(
          'refreshToken',
          data.refreshToken
        );
      }

      // ----------------------------------------------------------
      // SAVE USER
      // ----------------------------------------------------------

      if (data?.user) {
        localStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );
      }

      // ----------------------------------------------------------
      // SAVE ACCOUNT
      // ----------------------------------------------------------

      if (data?.account) {
        localStorage.setItem(
          'account',
          JSON.stringify(data.account)
        );
      }

      setSuccessMessage(
        data?.message || 'Login successful.'
      );

      // ----------------------------------------------------------
      // GO TO DASHBOARD
      // ----------------------------------------------------------

      setTimeout(() => {
        navigate('/dashboard', {
          replace: true,
        });
      }, 500);

    } catch (err: any) {
      console.error(
        'Login error:',
        err
      );

      setErrorMessage(
        err?.response?.data?.message ||
          'Unable to login. Please check your email and password and try again.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // INPUT STYLES
  // ============================================================

  const inputSx = {
    '& .MuiInputLabel-root': {
      color: '#64748b',
    },

    '& .MuiInputLabel-root.Mui-focused': {
      color: '#2563eb',
    },

    '& .MuiOutlinedInput-root': {
      color: '#111827',
      backgroundColor: '#ffffff',
      borderRadius: 2,

      '& fieldset': {
        borderColor: '#d1d5db',
      },

      '&:hover fieldset': {
        borderColor: '#2563eb',
      },

      '&.Mui-focused fieldset': {
        borderColor: '#2563eb',
      },
    },
  };

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <Box
      sx={{
        minHeight: '100vh',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        py: 5,

        background:
          'linear-gradient(180deg, #f8fafc 0%, #eef4ff 50%, #e8f0ff 100%)',
      }}
    >
      <Container
        maxWidth="xs"
        sx={{
          width: '100%',
        }}
      >
        {/* ======================================================
            LOGIN CARD
        ====================================================== */}

        <Card
          elevation={0}
          sx={{
            width: '100%',
            borderRadius: 4,

            backgroundColor: '#ffffff',

            border:
              '1px solid rgba(37,99,235,0.10)',

            boxShadow:
              '0 20px 60px rgba(15,23,42,0.12)',
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                sm: 4,
              },
            }}
          >

            {/* ==================================================
                TITLE
            ================================================== */}

            <Box
              sx={{
                textAlign: 'center',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  mx: 'auto',
                  mb: 2,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  borderRadius: '50%',

                  background:
                    'linear-gradient(135deg, #2563eb, #1d4ed8)',

                  boxShadow:
                    '0 10px 30px rgba(37,99,235,0.25)',
                }}
              >
                <LockOutlinedIcon
                  sx={{
                    color: '#ffffff',
                    fontSize: 30,
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontSize: 32,
                  fontWeight: 900,
                  color: '#111827',
                }}
              >
                Login
              </Typography>

              <Typography
                sx={{
                  mt: 0.75,
                  color: '#64748b',
                  fontSize: 13,
                  fontWeight: 600,
                  letterSpacing: 1,
                }}
              >
                GLOBAL DIGITAL MARKET
              </Typography>
            </Box>

            {/* ==================================================
                ERROR
            ================================================== */}

            {errorMessage && (
              <Alert
                severity="error"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                }}
                onClose={() =>
                  setErrorMessage('')
                }
              >
                {errorMessage}
              </Alert>
            )}

            {/* ==================================================
                SUCCESS
            ================================================== */}

            {successMessage && (
              <Alert
                severity="success"
                sx={{
                  mb: 2,
                  borderRadius: 2,
                }}
                onClose={() =>
                  setSuccessMessage('')
                }
              >
                {successMessage}
              </Alert>
            )}

            {/* ==================================================
                LOGIN FORM
            ================================================== */}

            <Box
              component="form"
              onSubmit={handleLogin}
            >
              <Stack spacing={2.5}>

                {/* =================================================
                    EMAIL
                ================================================= */}

                <TextField
                  fullWidth
                  required
                  label="Email"
                  type="email"
                  value={email}
                  autoComplete="email"
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon
                          sx={{
                            color: '#2563eb',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />

                {/* =================================================
                    PASSWORD
                ================================================= */}

                <TextField
                  fullWidth
                  required
                  label="Password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  autoComplete="current-password"
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon
                          sx={{
                            color: '#2563eb',
                          }}
                        />
                      </InputAdornment>
                    ),

                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (previous) =>
                                !previous
                            )
                          }
                          edge="end"
                          aria-label={
                            showPassword
                              ? 'Hide password'
                              : 'Show password'
                          }
                        >
                          {showPassword ? (
                            <VisibilityOff />
                          ) : (
                            <Visibility />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={inputSx}
                />

                {/* =================================================
                    FORGOT PASSWORD
                ================================================= */}

                <Box
                  sx={{
                    textAlign: 'right',
                    mt: -1,
                  }}
                >
                  <Link
                    component={RouterLink}
                    to="/forgot-password"
                    underline="none"
                    sx={{
                      color: '#2563eb',
                      fontSize: 14,
                      fontWeight: 700,

                      '&:hover': {
                        textDecoration:
                          'underline',
                      },
                    }}
                  >
                    Forgot Password?
                  </Link>
                </Box>

                {/* =================================================
                    LOGIN BUTTON
                ================================================= */}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.6,

                    borderRadius: 2.5,

                    textTransform:
                      'uppercase',

                    fontSize: 16,
                    fontWeight: 800,

                    background:
                      'linear-gradient(90deg, #2563eb, #1d4ed8)',

                    boxShadow:
                      '0 10px 25px rgba(37,99,235,0.25)',

                    '&:hover': {
                      background:
                        'linear-gradient(90deg, #1d4ed8, #1e40af)',
                    },

                    '&:disabled': {
                      background:
                        '#93c5fd',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: '#ffffff',
                      }}
                    />
                  ) : (
                    'Login'
                  )}
                </Button>

                {/* =================================================
                    REGISTER
                ================================================= */}

                <Typography
                  sx={{
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: 14,
                    pt: 1,
                  }}
                >
                  Don't have an account?{' '}

                  <Link
                    component={RouterLink}
                    to="/register"
                    underline="none"
                    sx={{
                      color: '#2563eb',
                      fontWeight: 800,

                      '&:hover': {
                        textDecoration:
                          'underline',
                      },
                    }}
                  >
                    Register
                  </Link>
                </Typography>

                {/* =================================================
                    HOME
                ================================================= */}

                <Typography
                  sx={{
                    textAlign: 'center',
                    pt: 1,
                  }}
                >
                  <Link
                    component={RouterLink}
                    to="/"
                    underline="none"
                    sx={{
                      color: '#64748b',
                      fontSize: 14,
                      fontWeight: 700,

                      '&:hover': {
                        color: '#2563eb',
                      },
                    }}
                  >
                    Back to Home
                  </Link>
                </Typography>

              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;
