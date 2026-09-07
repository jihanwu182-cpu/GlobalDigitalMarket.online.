import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';

const API_URL =
  process.env.REACT_APP_API_URL ||
  'https://globalmarket-com.onrender.com/api';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setLoading(false);
        setSuccess(false);
        setMessage(
          'The email verification link is missing or invalid.'
        );
        return;
      }

      try {
        const response = await axios.post(
          `${API_URL}/auth/verify-email`,
          {
            token,
          }
        );

        setSuccess(true);
        setMessage(
          response.data?.message ||
            'Email verified successfully.'
        );
      } catch (error: any) {
        setSuccess(false);

        setMessage(
          error?.response?.data?.message ||
            'This verification link is invalid or has expired. Please request a new verification email.'
        );
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams]);

  return (
    <Container
      maxWidth="sm"
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 4,
      }}
    >
      <Paper
        elevation={4}
        sx={{
          width: '100%',
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          textAlign: 'center',
        }}
      >
        {loading ? (
          <Stack
            spacing={3}
            alignItems="center"
          >
            <CircularProgress />

            <Typography variant="h5">
              Verifying your email...
            </Typography>

            <Typography
              color="text.secondary"
            >
              Please wait while we verify your
              email address.
            </Typography>
          </Stack>
        ) : (
          <Stack spacing={3}>
            <Typography
              variant="h4"
              fontWeight={700}
            >
              {success
                ? 'Email Verified'
                : 'Verification Failed'}
            </Typography>

            <Alert
              severity={
                success ? 'success' : 'error'
              }
            >
              {message}
            </Alert>

            {success && (
              <Typography
                color="text.secondary"
              >
                Your email address has been
                verified successfully. You can now
                log in to your account.
              </Typography>
            )}

            <Box>
              <Button
                component={Link}
                to="/login"
                variant="contained"
                size="large"
              >
                Go to Login
              </Button>
            </Box>
          </Stack>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmail;
