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
  MenuItem,
  Divider,
} from '@mui/material';

import apiClient from '../services/apiClient';

const countries = [
  'Nigeria',
  'South Africa',
  'Ghana',
  'Kenya',
  'United Kingdom',
  'United States',
  'Canada',
  'Australia',
  'Germany',
  'France',
  'United Arab Emirates',
  'Saudi Arabia',
  'India',
  'China',
  'Japan',
  'Switzerland',
  'Other',
];

const currencies = [
  { code: 'USD', name: 'US Dollar' },
  { code: 'EUR', name: 'Euro' },
  { code: 'GBP', name: 'British Pound' },
  { code: 'ZAR', name: 'South African Rand' },
  { code: 'NGN', name: 'Nigerian Naira' },
  { code: 'KES', name: 'Kenyan Shilling' },
  { code: 'GHS', name: 'Ghanaian Cedi' },
  { code: 'CAD', name: 'Canadian Dollar' },
  { code: 'AUD', name: 'Australian Dollar' },
  { code: 'CHF', name: 'Swiss Franc' },
  { code: 'JPY', name: 'Japanese Yen' },
  { code: 'CNY', name: 'Chinese Yuan' },
  { code: 'AED', name: 'UAE Dirham' },
  { code: 'SAR', name: 'Saudi Riyal' },
  { code: 'INR', name: 'Indian Rupee' },
];

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');
  const [preferredCurrency, setPreferredCurrency] =
    useState('USD');
  const [referrerCode, setReferrerCode] = useState('');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!firstName.trim()) {
      setErrorMessage('Please enter your first name.');
      return;
    }

    if (!lastName.trim()) {
      setErrorMessage('Please enter your last name.');
      return;
    }

    if (!username.trim()) {
      setErrorMessage('Please enter a username.');
      return;
    }

    if (username.trim().length < 3) {
      setErrorMessage(
        'Username must contain at least 3 characters.'
      );
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMessage(
        'Please enter a valid email address.'
      );
      return;
    }

    // PHONE NUMBER IS REQUIRED
    if (!phone.trim()) {
      setErrorMessage(
        'Phone number is required.'
      );
      return;
    }

    if (!country) {
      setErrorMessage(
        'Please select your country.'
      );
      return;
    }

    if (!preferredCurrency) {
      setErrorMessage(
        'Please select your preferred currency.'
      );
      return;
    }

    if (!password) {
      setErrorMessage(
        'Please enter a password.'
      );
      return;
    }

    if (password.length < 8) {
      setErrorMessage(
        'Password must be at least 8 characters.'
      );
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(
        'Passwords do not match.'
      );
      return;
    }

    // --------------------------------------------------------
    // REGISTER
    // --------------------------------------------------------

    try {
      setLoading(true);

      const response = await apiClient.post(
        '/auth/register',
        {
          email: email.trim().toLowerCase(),
          password,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          username: username.trim(),
          phone: phone.trim(),
          country: country.trim(),
          preferredCurrency,
          referrerCode:
            referrerCode.trim() || undefined,
        }
      );

      const data = response.data || {};

      console.log(
        'Registration successful:',
        data
      );

      // ------------------------------------------------------
      // SAVE AUTHENTICATION
      // ------------------------------------------------------

      if (data?.accessToken) {
        localStorage.setItem(
          'authToken',
          data.accessToken
        );

        localStorage.setItem(
          'token',
          data.accessToken
        );

        localStorage.setItem(
          'accessToken',
          data.accessToken
        );
      }

      if (data?.refreshToken) {
        localStorage.setItem(
          'refreshToken',
          data.refreshToken
        );
      }

      // ------------------------------------------------------
      // SAVE USER
      // ------------------------------------------------------

      if (data?.user) {
        localStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          'currentUser',
          JSON.stringify(data.user)
        );
      } else {
        // If backend does not return a user object,
        // save the information we already have.
        const localUser = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          name:
            `${firstName.trim()} ${lastName.trim()}`.trim(),
          username: username.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          country: country.trim(),
          preferredCurrency,
        };

        localStorage.setItem(
          'user',
          JSON.stringify(localUser)
        );

        localStorage.setItem(
          'currentUser',
          JSON.stringify(localUser)
        );
      }

      // ------------------------------------------------------
      // SAVE ACCOUNT
      // ------------------------------------------------------

      if (data?.account) {
        localStorage.setItem(
          'account',
          JSON.stringify(data.account)
        );
      }

      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      setSuccessMessage(
        data?.message ||
          'Your account has been created successfully.'
      );

      setPassword('');
      setConfirmPassword('');

      /*
       * Registration completed successfully.
       *
       * IMPORTANT:
       * Go to the USER DASHBOARD, not Home.
       */
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error: any) {
      console.error(
        'REGISTER ERROR:',
        error
      );

      let message =
        'Registration failed. Please try again.';

      if (
        error?.response?.data?.message
      ) {
        message =
          error.response.data.message;
      } else if (
        error?.response?.data?.error
      ) {
        message =
          error.response.data.error;
      } else if (
        error?.message
      ) {
        message =
          error.message;
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
          'radial-gradient(circle at top right, rgba(25,84,199,0.35), transparent 30%), linear-gradient(135deg,#02071f 0%,#071453 50%,#102b82 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 4,
          color: '#fff',
          background:
            'linear-gradient(145deg,#0b1b5a,#07113b)',
          border:
            '1px solid rgba(110,190,255,0.25)',
          boxShadow:
            '0 25px 70px rgba(0,0,0,0.35)',
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
          {/* HEADER */}

          <Typography
            variant="h4"
            component="h1"
            sx={{
              textAlign: 'center',
              fontWeight: 900,
              mb: 1,
            }}
          >
            Create Your Account
          </Typography>

          <Typography
            sx={{
              textAlign: 'center',
              color: '#8fa8ed',
              fontSize: 13,
              mb: 4,
            }}
          >
            Join Global Digital Market
          </Typography>

          {/* ALERTS */}

          {errorMessage && (
            <Alert
              severity="error"
              onClose={() =>
                setErrorMessage('')
              }
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
            >
              {errorMessage}
            </Alert>
          )}

          {successMessage && (
            <Alert
              severity="success"
              onClose={() =>
                setSuccessMessage('')
              }
              sx={{
                mb: 2,
                borderRadius: 2,
              }}
            >
              {successMessage}
            </Alert>
          )}

          {/* FORM */}

          <Box
            component="form"
            onSubmit={handleRegister}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 900,
                color: '#5ce8ff',
                mt: 1,
              }}
            >
              PERSONAL INFORMATION
            </Typography>

            {/* FIRST + LAST NAME */}

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                },
                gap: 2,
              }}
            >
              <TextField
                fullWidth
                required
                label="First Name"
                value={firstName}
                onChange={(e) =>
                  setFirstName(
                    e.target.value
                  )
                }
                disabled={loading}
                InputLabelProps={{
                  sx: {
                    color: '#91a7e9',
                  },
                }}
              />

              <TextField
                fullWidth
                required
                label="Last Name"
                value={lastName}
                onChange={(e) =>
                  setLastName(
                    e.target.value
                  )
                }
                disabled={loading}
                InputLabelProps={{
                  sx: {
                    color: '#91a7e9',
                  },
                }}
              />
            </Box>

            {/* USERNAME */}

            <TextField
              fullWidth
              required
              label="Username"
              value={username}
              onChange={(e) =>
                setUsername(
                  e.target.value
                )
              }
              disabled={loading}
              helperText="Minimum 3 characters"
              InputLabelProps={{
                sx: {
                  color: '#91a7e9',
                },
              }}
            />

            {/* EMAIL */}

            <TextField
              fullWidth
              required
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target.value
                )
              }
              disabled={loading}
              InputLabelProps={{
                sx: {
                  color: '#91a7e9',
                },
              }}
            />

            {/* PHONE */}

            <TextField
              fullWidth
              required
              label="Phone Number"
              type="tel"
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target.value
                )
              }
              disabled={loading}
              placeholder="+234 800 000 0000"
              helperText="Required for account security"
              InputLabelProps={{
                sx: {
                  color: '#91a7e9',
                },
              }}
            />

            <Divider
              sx={{
                borderColor:
                  'rgba(255,255,255,0.10)',
                my: 1,
              }}
            />

            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 900,
                color: '#5ce8ff',
              }}
            >
              ACCOUNT PREFERENCES
            </Typography>

            {/* COUNTRY */}

            <TextField
              select
              fullWidth
              required
              label="Country"
              value={country}
              onChange={(e) =>
                setCountry(
                  e.target.value
                )
              }
              disabled={loading}
              InputLabelProps={{
                sx: {
                  color: '#91a7e9',
                },
              }}
            >
              {countries.map(
                (item) => (
                  <MenuItem
                    key={item}
                    value={item}
                  >
                    {item}
                  </MenuItem>
                )
              )}
            </TextField>

            {/* CURRENCY */}

            <TextField
              select
              fullWidth
              required
              label="Preferred Currency"
              value={
                preferredCurrency
              }
              onChange={(e) =>
                setPreferredCurrency(
                  e.target.value
                )
              }
              disabled={loading}
              helperText="Your account will use this currency"
              InputLabelProps={{
                sx: {
                  color: '#91a7e9',
                },
              }}
            >
              {currencies.map(
                (currency) => (
                  <MenuItem
                    key={
                      currency.code
                    }
                    value={
                      currency.code
                    }
                  >
                    {currency.code} —{' '}
                    {currency.name}
                  </MenuItem>
                )
              )}
            </TextField>

            {/* REFERRER */}

            <TextField
              fullWidth
              label="Referrer Code (Optional)"
              value={referrerCode}
              onChange={(e) =>
                setReferrerCode(
                  e.target.value
                )
              }
              disabled={loading}
              helperText="Leave blank if you were not referred by someone."
              InputLabelProps={{
                sx: {
                  color: '#91a7e9',
                },
              }}
            />

            <Divider
              sx={{
                borderColor:
                  'rgba(255,255,255,0.10)',
                my: 1,
              }}
            />

            <Typography
              sx={{
                fontSize: 13,
                fontWeight: 900,
                color: '#5ce8ff',
              }}
            >
              SECURITY
            </Typography>

            {/* PASSWORD */}

            <TextField
              fullWidth
              required
              label="Password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
              disabled={loading}
              helperText="Minimum 8 characters"
              InputLabelProps={{
                sx: {
                  color: '#91a7e9',
                },
              }}
            />

            {/* CONFIRM PASSWORD */}

            <TextField
              fullWidth
              required
              label="Confirm Password"
              type="password"
              value={
                confirmPassword
              }
              onChange={(e) =>
                setConfirmPassword(
                  e.target.value
                )
              }
              disabled={loading}
              InputLabelProps={{
                sx: {
                  color: '#91a7e9',
                },
              }}
            />

            {/* SUBMIT */}

            <Button
              fullWidth
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                py: 1.6,
                mt: 1,
                borderRadius: 2,
                fontWeight: 900,
                fontSize: 15,
                textTransform:
                  'none',
                background:
                  'linear-gradient(90deg,#12ccef,#2865ff)',
                '&:hover': {
                  background:
                    'linear-gradient(90deg,#27dcff,#3975ff)',
                },
              }}
            >
              {loading ? (
                <>
                  <CircularProgress
                    size={23}
                    sx={{
                      mr: 1,
                      color: '#fff',
                    }}
                  />
                  Creating Account...
                </>
              ) : (
                'CREATE ACCOUNT'
              )}
            </Button>

            {/* LOGIN */}

            <Button
              type="button"
              disabled={loading}
              onClick={() =>
                navigate('/login')
              }
              sx={{
                color: '#5ce8ff',
                textTransform:
                  'none',
                fontWeight: 700,
              }}
            >
              Already have an account? Login
            </Button>

            {/* HOME */}

            <Button
              type="button"
              disabled={loading}
              onClick={() =>
                navigate('/')
              }
              sx={{
                color: '#8fa8ed',
                textTransform:
                  'none',
              }}
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
