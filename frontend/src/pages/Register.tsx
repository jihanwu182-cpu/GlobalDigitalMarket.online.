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

import apiClient from '../services/apiClient';

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

    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return;
    }

    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter a password.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        'Password must be at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      console.log('REGISTER: sending request');

      const response = await apiClient.post(
        '/auth/register',
        {
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }
      );

      console.log(
        'REGISTER: backend response',
        response.data
      );

      const data = response.data;

      // Save authentication information if supplied
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

      setSuccessMessage(
        data?.message ||
          'Account created successfully!'
      );

      // Clear password fields
      setPassword('');
      setConfirmPassword('');

    } catch (error: any) {
      console.error(
        'REGISTER ERROR:',
        error
      );

      if (error?.response) {
        console.error(
          'STATUS:',
          error.response.status
        );

        console.error(
          'DATA:',
          error.response.data
        );
      }

      let message =
        'Registration failed. Please try again.';

      if (error?.response?.data?.message) {
        message =
          error.response.data.message;
      } else if (error?.response?.data?.error) {
        message =
          error.response.data.error;
      } else if (error?.message) {
        message = error.message;
      }

      setErrorMessage(message);

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
        padding: 2,
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
            Create Account
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
              onChange={(e) =>
                setFirstName(e.target.value)
              }
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(e) =>
                setLastName(e.target.value)
              }
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              disabled={loading}
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              disabled={loading}
              helperText="Minimum 8 characters"
            />

            <TextField
              fullWidth
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
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
                'CREATE ACCOUNT'
              )}
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={() =>
                navigate('/login')
              }
            >
              Already have an account? Login
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

          </Box>

        </CardContent>
      </Card>
    </Box>
  );
};

export default Register;
