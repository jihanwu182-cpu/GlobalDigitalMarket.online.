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

    // Validate fields
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

      const response = await axios.post(
        `${API_URL}/register`,
        {
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000,
        }
      );

      console.log(
        'REGISTRATION SUCCESS:',
        response.data
      );

      setSuccessMessage(
        response.data?.message ||
          'Account created successfully!'
      );

      // Save login information if returned by backend
      if (response.data?.accessToken) {
        localStorage.setItem(
          'accessToken',
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

      // Give the success message a moment to display
      setTimeout(() => {
        navigate('/login');
      }, 1500);

    } catch (error: unknown) {
      console.error(
        'REGISTRATION ERROR:',
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

        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error;

        if (backendMessage) {
          setErrorMessage(backendMessage);
        } else if (error.response?.status === 409) {
          setErrorMessage(
            'An account with this email already exists.'
          );
        } else if (error.response?.status === 400) {
          setErrorMessage(
            'Please check the information you entered.'
          );
        } else if (error.response?.status === 404) {
          setErrorMessage(
            'Registration endpoint was not found. Please check the backend route.'
          );
        } else if (error.response?.status === 500) {
          setErrorMessage(
            'The server encountered an error. Please try again.'
          );
        } else if (error.code === 'ECONNABORTED') {
          setErrorMessage(
            'The server took too long to respond. Please try again.'
          );
        } else {
          setErrorMessage(
            'Registration failed. Please try again.'
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
              required
            />

            <TextField
              fullWidth
              label="Last Name"
              value={lastName}
              onChange={(event) =>
                setLastName(event.target.value)
              }
              disabled={loading}
              required
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
                  Creating Account...
                </>
              ) : (
                'CREATE ACCOUNT'
              )}
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={() => navigate('/login')}
            >
              Already have an account? Login
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

export default Register;
