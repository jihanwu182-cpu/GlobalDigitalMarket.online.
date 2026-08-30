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
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useNavigate } from 'react-router-dom';

import apiClient from '../services/apiClient';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  // ============================================================
  // ADMIN LOGIN
  // ============================================================

  const handleLogin = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError('');

    const normalizedEmail =
      email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError(
        'Please enter your admin email.'
      );
      return;
    }

    if (!password) {
      setError(
        'Please enter your password.'
      );
      return;
    }

    try {
      setLoading(true);

      // --------------------------------------------------------
      // REMOVE OLD ADMIN SESSION
      // --------------------------------------------------------

      localStorage.removeItem(
        'adminToken'
      );

      localStorage.removeItem(
        'admin'
      );

      // --------------------------------------------------------
      // LOGIN REQUEST
      // --------------------------------------------------------

      const response =
        await apiClient.post(
          '/admin/login',
          {
            email: normalizedEmail,
            password,
          }
        );

      const data =
        response?.data || {};

      console.log(
        'ADMIN LOGIN RESPONSE:',
        data
      );

      // --------------------------------------------------------
      // GET TOKEN
      // --------------------------------------------------------

      const token =
        data.token ||
        data.accessToken ||
        data.access_token;

      // --------------------------------------------------------
      // TOKEN IS REQUIRED
      // --------------------------------------------------------

      if (
        !token ||
        typeof token !== 'string'
      ) {
        console.error(
          'Admin login succeeded but no token was returned.',
          data
        );

        setError(
          'Login succeeded, but the administrator authentication token was not returned by the server.'
        );

        return;
      }

      // --------------------------------------------------------
      // SAVE ADMIN TOKEN
      // --------------------------------------------------------

      localStorage.setItem(
        'adminToken',
        token
      );

      // --------------------------------------------------------
      // SAVE ADMIN USER
      // --------------------------------------------------------

      if (data.admin) {
        localStorage.setItem(
          'admin',
          JSON.stringify(data.admin)
        );
      }

      // --------------------------------------------------------
      // VERIFY TOKEN WAS SAVED
      // --------------------------------------------------------

      const savedToken =
        localStorage.getItem(
          'adminToken'
        );

      if (!savedToken) {
        setError(
          'Unable to save the administrator login session.'
        );

        return;
      }

      console.log(
        'ADMIN TOKEN SAVED SUCCESSFULLY'
      );

      // --------------------------------------------------------
      // GO TO ADMIN DASHBOARD
      // --------------------------------------------------------

      navigate(
        '/admin',
        {
          replace: true,
        }
      );

    } catch (requestError: any) {
      console.error(
        'Admin login error:',
        requestError
      );

      const message =
        requestError?.response?.data?.message ||
        requestError?.response?.data?.error ||
        'Admin login failed. Please check your credentials.';

      setError(message);

    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // UI
  // ============================================================

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        background:
          'radial-gradient(circle at top right, rgba(25,84,199,0.35), transparent 35%), linear-gradient(180deg,#020817 0%,#071453 100%)',

        px: 2,
        py: 4,
      }}
    >
      <Container maxWidth="sm">
        <Card
          sx={{
            borderRadius: 4,

            background:
              'linear-gradient(145deg,#101f63,#08143f)',

            border:
              '1px solid rgba(100,150,255,0.22)',

            color: '#fff',

            boxShadow:
              '0 25px 70px rgba(0,0,0,0.45)',
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                sm: 5,
              },
            }}
          >
            {/* BACK BUTTON */}

            <IconButton
              onClick={() =>
                navigate('/')
              }
              disabled={loading}
              sx={{
                color: '#fff',

                background:
                  'rgba(255,255,255,0.07)',

                mb: 3,

                '&:hover': {
                  background:
                    'rgba(255,255,255,0.12)',
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            {/* HEADER */}

            <Stack
              alignItems="center"
              spacing={1}
              sx={{
                mb: 4,
              }}
            >
              <Box
                sx={{
                  width: 70,
                  height: 70,

                  borderRadius: 3,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',

                  background:
                    'rgba(92,232,255,0.10)',

                  border:
                    '1px solid rgba(92,232,255,0.20)',
                }}
              >
                <AdminPanelSettingsIcon
                  sx={{
                    fontSize: 40,
                    color: '#5ce8ff',
                  }}
                />
              </Box>

              <Typography
                sx={{
                  fontSize: 30,
                  fontWeight: 900,
                  textAlign: 'center',
                }}
              >
                Admin Login
              </Typography>

              <Typography
                sx={{
                  color: '#8198df',
                  fontSize: 12,
                  textAlign: 'center',
                }}
              >
                Secure administration portal
              </Typography>
            </Stack>

            {/* ERROR */}

            {error && (
              <Alert
                severity="error"
                sx={{
                  mb: 3,
                }}
              >
                {error}
              </Alert>
            )}

            {/* FORM */}

            <Box
              component="form"
              onSubmit={handleLogin}
            >
              <Stack spacing={2.5}>
                {/* EMAIL */}

                <TextField
                  fullWidth
                  required
                  label="Admin Email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="email"
                  InputLabelProps={{
                    sx: {
                      color: '#91a4d8',
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',

                      '& fieldset': {
                        borderColor:
                          'rgba(145,164,216,0.35)',
                      },

                      '&:hover fieldset': {
                        borderColor:
                          '#5ce8ff',
                      },

                      '&.Mui-focused fieldset': {
                        borderColor:
                          '#5ce8ff',
                      },
                    },
                  }}
                />

                {/* PASSWORD */}

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
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  autoComplete="current-password"
                  InputLabelProps={{
                    sx: {
                      color: '#91a4d8',
                    },
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          type="button"
                          onClick={() =>
                            setShowPassword(
                              (current) =>
                                !current
                            )
                          }
                          edge="end"
                          disabled={loading}
                          sx={{
                            color:
                              '#91a4d8',
                          }}
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',

                      '& fieldset': {
                        borderColor:
                          'rgba(145,164,216,0.35)',
                      },

                      '&:hover fieldset': {
                        borderColor:
                          '#5ce8ff',
                      },

                      '&.Mui-focused fieldset': {
                        borderColor:
                          '#5ce8ff',
                      },
                    },
                  }}
                />

                {/* LOGIN BUTTON */}

                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  disabled={loading}
                  sx={{
                    py: 1.5,

                    borderRadius: 2,

                    background:
                      'linear-gradient(135deg,#1768ff,#168fff)',

                    textTransform: 'none',

                    fontWeight: 900,

                    fontSize: 15,

                    '&:hover': {
                      background:
                        'linear-gradient(135deg,#1259dd,#117edc)',
                    },
                  }}
                >
                  {loading ? (
                    <CircularProgress
                      size={24}
                      sx={{
                        color: '#fff',
                      }}
                    />
                  ) : (
                    'Sign In as Administrator'
                  )}
                </Button>
              </Stack>
            </Box>

            {/* FOOTER */}

            <Typography
              sx={{
                color: '#6278b5',
                fontSize: 10,
                textAlign: 'center',
                mt: 3,
              }}
            >
              Authorized administrators only
            </Typography>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminLogin;
