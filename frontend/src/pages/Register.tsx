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
} from '@mui/material';
import { toast } from 'react-toastify';
import authService from '../services/authService';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      toast.error('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      await authService.register(
        email,
        password,
        firstName,
        lastName
      );

      toast.success('Account created successfully! Please login.');

      navigate('/login');
    } catch (error: any) {
      console.error('Registration error:', error);

      const message =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed. Please try again.';

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ width: '100%', boxShadow: 3 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            mb: 3,
            textAlign: 'center',
            fontWeight: 700,
          }}
        >
          Create Account
        </Typography>

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
            onChange={(event) => setFirstName(event.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Last Name"
            value={lastName}
            onChange={(event) => setLastName(event.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={loading}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            disabled={loading}
          />

          <Button
            fullWidth
            variant="contained"
            type="submit"
            disabled={loading}
            sx={{ mt: 1, py: 1.5 }}
          >
            {loading ? (
              <CircularProgress size={24} />
            ) : (
              'Create Account'
            )}
          </Button>

          <Typography
            variant="body2"
            sx={{ textAlign: 'center', mt: 1 }}
          >
            Already have an account?
          </Typography>

          <Button
            variant="text"
            onClick={() => navigate('/login')}
            disabled={loading}
          >
            Login
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default Register;
