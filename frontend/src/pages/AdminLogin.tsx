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

  const handleLogin = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setError('');

    if (!email.trim()) {
      setError('Please enter your admin email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setLoading(true);

      const response = await apiClient.post(
        '/admin/login',
        {
          email: email.trim(),
          password,
        }
      );

      const data = response.data || {};

      /*
       * Save the authentication token if
       * the backend returns one.
       */
      const token =
        data.token ||
        data.accessToken ||
        data.access_token;

      if (token) {
        localStorage.setItem(
          'adminToken',
          token
        );
      }

      /*
       * Save admin information if supplied.
       */
      if (data.admin) {
        localStorage.setItem(
          'admin',
          JSON.stringify(data.admin)
        );
      }

      /*
       * Go to the admin dashboard if the
       * login succeeds.
       */
      navigate('/admin');
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
      <Container
        maxWidth="sm"
      >
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
            <IconButton
              onClick={() =>
                navigate('/')
              }
              sx={{
                color: '#fff',
                background:
                  'rgba(255,255,255,0.07)',
                mb: 3,
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Stack
              alignItems="center"
              spacing={1}
              sx={{ mb: 4 }}
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

            <Box
              component="form"
              onSubmit={handleLogin}
            >
              <Stack spacing={2.5}>
                <TextField
                  fullWidth
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

                <TextField
                  fullWidth
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
                          onClick={() =>
                            setShowPassword(
                              !showPassword
                            )
                          }
                          edge="end"
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
