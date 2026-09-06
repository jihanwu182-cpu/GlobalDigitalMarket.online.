import React, { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
  Link,
} from '@mui/material';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import apiClient from '../services/apiClient';

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/auth/forgot-password', { email: email.trim() });
      setSuccess('If an account exists with this email, a reset link has been sent.');
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to send reset email. Please try again.'
      );
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
        background:
          'radial-gradient(ellipse at top right, rgba(30,90,220,0.18), transparent 45%), linear-gradient(180deg, #020617 0%, #0a1628 40%, #0f1c3d 100%)',
        color: '#fff',
      }}
    >
      <Container maxWidth="xs">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{ fontSize: 28, fontWeight: 900 }}>
            Forgot Password?
          </Typography>
          <Typography sx={{ color: '#64748b', mt: 1 }}>
            Enter your email and we’ll send you a reset link.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2, borderRadius: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2, borderRadius: 3 }}>
            {success}
          </Alert>
        )}

        <Card
          sx={{
            borderRadius: 4,
            background: 'rgba(15,23,42,0.8)',
            border: '1px solid rgba(100,140,255,0.12)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <EmailOutlinedIcon sx={{ color: '#60a5fa', mr: 1 }} />
                  ),
                }}
                sx={{
                  '& .MuiInputLabel-root': { color: '#9eb3ff' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    '& fieldset': { borderColor: 'rgba(140,170,255,0.25)' },
                  },
                }}
              />

              <Button
                fullWidth
                variant="contained"
                disabled={loading}
                onClick={handleSubmit}
                sx={{
                  py: 1.6,
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #3b82f6, #2563eb)',
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Send Reset Link'}
              </Button>

              <Typography sx={{ textAlign: 'center', mt: 1 }}>
                <Link component={RouterLink} to="/login" sx={{ color: '#60a5fa' }}>
                  Back to Login
                </Link>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ForgotPassword;
