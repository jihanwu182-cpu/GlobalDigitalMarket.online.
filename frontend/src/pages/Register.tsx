import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

import authService from '../services/authService';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setErrorMessage('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        'Password must be at least 8 characters long.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email.trim())) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    try {
      setLoading(true);

      const response = await authService.register(
        email.trim(),
        password,
        firstName.trim(),
        lastName.trim()
      );

      console.log('REGISTRATION RESPONSE:', response);

      setSuccessMessage(
        response.message || 'Account created successfully!'
      );

      /*
       * IMPORTANT:
       * We are NOT navigating automatically yet.
       * This lets us confirm that the real backend registration
       * is working before moving to the dashboard.
       */
    } catch (error: any) {
      console.error('REGISTRATION ERROR:', error);

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
        setErrorMessage(error.response.data.message);
      } else if (error?.response?.data?.error) {
        setErrorMessage(error.response.data.error);
      } else if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          'Registration failed. Please try again.'
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
        backgroundColor: '#f5f5f5',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 450,
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
            Create Account
          </Typography>

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleRegister}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="First Name"
              value={firstName}
              onChange={(event) =>
                setFirstName(event.target.value)
              }
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
              disabled={loading}
            />

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
              helperText="Minimum 8 characters"
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
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
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>

            {successMessage && (
              <Button
                type="button"
                variant="outlined"
                onClick={() => navigate('/login')}
              >
                Continue to Login
              </Button>
            )}

            <Button
              type="button"
              disabled={loading}
              onClick={() => navigate('/login')}
            >
              Already have an account? Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
