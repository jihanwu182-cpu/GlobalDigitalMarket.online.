import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
} from '@mui/material';

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    alert('Login page is working.');

    console.log('Email:', email);
    console.log('Password:', password);
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
          boxShadow: 3,
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
            />

            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
            />

            <Button
              fullWidth
              type="submit"
              variant="contained"
              sx={{
                py: 1.5,
                mt: 1,
              }}
            >
              Login
            </Button>

            <Button
              type="button"
              onClick={() => navigate('/register')}
            >
              Don't have an account? Register
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

export default Login;
