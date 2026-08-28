import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Alert,
} from '@mui/material';

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [message, setMessage] = useState('');

  const handleRegister = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setMessage('');

    if (
      !firstName.trim() ||
      !lastName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setMessage('Please fill in all fields.');
      return;
    }

    if (password.length < 8) {
      setMessage(
        'Password must be at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    // TEST ONLY:
    // We are NOT calling the backend yet.
    setMessage(
      'TEST SUCCESS: The Create Account button is working correctly.'
    );
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
            Create Account
          </Typography>

          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
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
              label="First Name"
              value={firstName}
              onChange={(e) =>
                setFirstName(e.target.value)
              }
              fullWidth
            />

            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) =>
                setLastName(e.target.value)
              }
              fullWidth
            />

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              fullWidth
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              fullWidth
            />

            <TextField
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              fullWidth
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{ py: 1.5 }}
            >
              CREATE ACCOUNT
            </Button>

            <Button
              type="button"
              onClick={() => navigate('/login')}
            >
              Already have an account? Login
            </Button>

            <Button
              type="button"
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
