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
  Link,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import apiClient from '../services/apiClient';

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/auth/reset-password', {
        token,
        newPassword,
      });
      setSuccess('Password has been reset successfully. You can now login.');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          'Unable to reset password. The link may have expired.'
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
            Reset Password
          </Typography>
          <Typography sx={{ color: '#64748b', mt: 1 }}>
            Enter your new password below.
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
                label="New Password"
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#60a5fa' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNew(!showNew)}>
                        {showNew ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputLabel-root': { color: '#9eb3ff' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(255,255,255,0.03)',
                  },
                }}
              />

              <TextField
                fullWidth
                label="Confirm New Password"
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#60a5fa' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                        {showConfirm ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiInputLabel-root': { color: '#9eb3ff' },
                  '& .MuiOutlinedInput-root': {
                    color: '#fff',
                    borderRadius: 2.5,
                    backgroundColor: 'rgba(255,255,255,0.03)',
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
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                }}
              >
                {loading ? <CircularProgress size={22} color="inherit" /> : 'Reset Password'}
              </Button>

              <Typography sx={{ textAlign: 'center' }}>
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

export default ResetPassword;
