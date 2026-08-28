import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LogoutIcon from '@mui/icons-material/Logout';

import { useNavigate } from 'react-router-dom';

import apiClient from '../services/apiClient';

interface UserProfile {
  name: string;
  email: string;
  username: string;
  accountId: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    username: '',
    accountId: '',
  });

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      /*
       * Try the backend first.
       *
       * If your backend already has a profile endpoint,
       * this will use the real authenticated account.
       */
      try {
        const response = await apiClient.get('/auth/profile');

        const data = response.data || {};
        const user = data.user || data;

        const firstName = String(
          user.firstName ||
            user.first_name ||
            ''
        ).trim();

        const lastName = String(
          user.lastName ||
            user.last_name ||
            ''
        ).trim();

        const combinedName =
          `${firstName} ${lastName}`.trim();

        const loadedProfile: UserProfile = {
          name: String(
            user.name ||
              user.fullName ||
              user.full_name ||
              combinedName ||
              ''
          ).trim(),

          email: String(
            user.email ||
              user.emailAddress ||
              ''
          ).trim(),

          username: String(
            user.username ||
              user.userName ||
              ''
          ).trim(),

          accountId: String(
            user.accountId ||
              user.account_id ||
              user.id ||
              user._id ||
              ''
          ).trim(),
        };

        setProfile(loadedProfile);
        setName(loadedProfile.name);
        setUsername(loadedProfile.username);

        return;
      } catch (backendError) {
        /*
         * If the backend profile endpoint does not exist yet,
         * read the authenticated user information already stored
         * by the login system.
         */
        console.warn(
          'Backend profile endpoint unavailable. Reading stored account information.'
        );
      }

      const possibleKeys = [
        'user',
        'currentUser',
        'authUser',
        'profile',
      ];

      let storedUser: any = null;

      for (const key of possibleKeys) {
        const value = localStorage.getItem(key);

        if (!value) {
          continue;
        }

        try {
          const parsed = JSON.parse(value);

          if (
            parsed &&
            typeof parsed === 'object'
          ) {
            storedUser = parsed;
            break;
          }
        } catch {
          // Continue checking other keys.
        }
      }

      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('authToken');

      let tokenUser: any = null;

      if (token) {
        try {
          const parts = token.split('.');

          if (parts.length === 3) {
            const normalized = parts[1]
              .replace(/-/g, '+')
              .replace(/_/g, '/');

            const decoded = decodeURIComponent(
              Array.prototype.map
                .call(
                  atob(normalized),
                  (character: string) =>
                    `%${(
                      '00' +
                      character
                        .charCodeAt(0)
                        .toString(16)
                    ).slice(-2)}`
                )
                .join('')
            );

            tokenUser = JSON.parse(decoded);
          }
        } catch {
          // Invalid JWT payload.
        }
      }

      const user = {
        ...(tokenUser || {}),
        ...(storedUser || {}),
      };

      const firstName = String(
        user.firstName ||
          user.first_name ||
          ''
      ).trim();

      const lastName = String(
        user.lastName ||
          user.last_name ||
          ''
      ).trim();

      const combinedName =
        `${firstName} ${lastName}`.trim();

      const loadedProfile: UserProfile = {
        name: String(
          user.name ||
            user.fullName ||
            user.full_name ||
            combinedName ||
            ''
        ).trim(),

        email: String(
          user.email ||
            user.emailAddress ||
            ''
        ).trim(),

        username: String(
          user.username ||
            user.userName ||
            ''
        ).trim(),

        accountId: String(
          user.accountId ||
            user.account_id ||
            user.id ||
            user._id ||
            ''
        ).trim(),
      };

      setProfile(loadedProfile);
      setName(loadedProfile.name);
      setUsername(loadedProfile.username);
    } catch (err) {
      console.error(
        'Profile loading error:',
        err
      );

      setError(
        'Unable to load your account profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const displayName = useMemo(() => {
    if (profile.name) {
      return profile.name;
    }

    if (profile.username) {
      return profile.username;
    }

    return 'Account Holder';
  }, [profile.name, profile.username]);

  const initials = useMemo(() => {
    if (displayName) {
      const parts = displayName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (parts.length >= 2) {
        return (
          parts[0][0] +
          parts[parts.length - 1][0]
        ).toUpperCase();
      }

      return parts[0][0].toUpperCase();
    }

    return 'A';
  }, [displayName]);

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }

    try {
      setSaving(true);

      /*
       * Attempt to update the backend profile.
       *
       * If this endpoint is not implemented yet,
       * the page will still update the local display
       * without pretending that the backend was changed.
       */
      try {
        await apiClient.put('/auth/profile', {
          name: name.trim(),
          username: username.trim(),
        });

        setProfile((previous) => ({
          ...previous,
          name: name.trim(),
          username: username.trim(),
        }));

        setSuccess(
          'Your profile has been updated successfully.'
        );

        return;
      } catch (backendError) {
        console.warn(
          'Backend profile update unavailable.',
          backendError
        );
      }

      /*
       * Keep local account information synchronized.
       */
      const possibleKeys = [
        'user',
        'currentUser',
        'authUser',
        'profile',
      ];

      let updated = false;

      for (const key of possibleKeys) {
        const value = localStorage.getItem(key);

        if (!value) {
          continue;
        }

        try {
          const parsed = JSON.parse(value);

          if (
            parsed &&
            typeof parsed === 'object'
          ) {
            const updatedUser = {
              ...parsed,
              name: name.trim(),
              username: username.trim(),
            };

            localStorage.setItem(
              key,
              JSON.stringify(updatedUser)
            );

            updated = true;
            break;
          }
        } catch {
          // Continue.
        }
      }

      setProfile((previous) => ({
        ...previous,
        name: name.trim(),
        username: username.trim(),
      }));

      setSuccess(
        updated
          ? 'Profile information updated on this device.'
          : 'Profile information updated for this session.'
      );
    } catch (err) {
      console.error(
        'Profile update error:',
        err
      );

      setError(
        'Unable to update your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    const keys = [
      'token',
      'accessToken',
      'authToken',
      'user',
      'currentUser',
      'authUser',
      'profile',
    ];

    keys.forEach((key) =>
      localStorage.removeItem(key)
    );

    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#fff',
        background:
          'radial-gradient(circle at top right, rgba(25,84,199,0.30), transparent 30%), linear-gradient(180deg,#02071f 0%,#071453 55%,#091b68 100%)',
        pb: 6,
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background:
            'rgba(2,7,31,0.96)',
          backdropFilter: 'blur(14px)',
          borderBottom:
            '1px solid rgba(125,150,255,0.18)',
        }}
      >
        <Container maxWidth="lg">
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ py: 1.5 }}
          >
            <IconButton
              onClick={() => navigate('/')}
              sx={{
                color: '#fff',
                background:
                  'rgba(60,90,220,0.25)',
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: 18,
                    sm: 22,
                  },
                  fontWeight: 900,
                }}
              >
                Account Profile
              </Typography>

              <Typography
                sx={{
                  color: '#7691e5',
                  fontSize: 9,
                  letterSpacing: 1,
                }}
              >
                GLOBAL DIGITAL MARKET
              </Typography>
            </Box>

            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: '#ff8297',
                textTransform: 'none',
                display: {
                  xs: 'none',
                  sm: 'flex',
                },
              }}
            >
              Logout
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container
        maxWidth="lg"
        sx={{
          py: {
            xs: 3,
            md: 5,
          },
        }}
      >
        {/* TITLE */}

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: {
                xs: 30,
                md: 42,
              },
              fontWeight: 900,
            }}
          >
            Your Account
          </Typography>

          <Typography
            sx={{
              color: '#8ea4e8',
              mt: 0.5,
            }}
          >
            Manage your account information and
            security.
          </Typography>
        </Box>

        {/* MESSAGES */}

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* PROFILE HEADER */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            overflow: 'hidden',
            background:
              'linear-gradient(135deg,#10216d 0%,#154ec7 60%,#087fda 100%)',
            border:
              '1px solid rgba(130,190,255,0.28)',
            boxShadow:
              '0 20px 60px rgba(0,0,0,0.25)',
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 4,
              },
            }}
          >
            {loading ? (
              <Stack
                alignItems="center"
                spacing={2}
                sx={{ py: 4 }}
              >
                <CircularProgress
                  sx={{ color: '#5ce8ff' }}
                />

                <Typography
                  sx={{ color: '#c7d7ff' }}
                >
                  Loading account profile...
                </Typography>
              </Stack>
            ) : (
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={3}
                alignItems={{
                  xs: 'flex-start',
                  sm: 'center',
                }}
              >
                <Avatar
                  sx={{
                    width: 90,
                    height: 90,
                    fontSize: 30,
                    fontWeight: 900,
                    background:
                      'linear-gradient(135deg,#19d8ff,#285cff)',
                    border:
                      '3px solid rgba(255,255,255,0.25)',
                  }}
                >
                  {initials}
                </Avatar>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography
                    sx={{
                      fontSize: {
                        xs: 26,
                        md: 32,
                      },
                      fontWeight: 900,
                    }}
                  >
                    {displayName}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#c5d5ff',
                      mt: 0.5,
                    }}
                  >
                    {profile.email ||
                      'Email not available'}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1.5 }}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Chip
                      icon={
                        <VerifiedUserIcon
                          sx={{
                            color:
                              '#4df28d !important',
                          }}
                        />
                      }
                      label="Account"
                      size="small"
                      sx={{
                        color: '#fff',
                        background:
                          'rgba(0,0,0,0.18)',
                        fontWeight: 700,
                      }}
                    />

                    <Chip
                      icon={
                        <SecurityIcon
                          sx={{
                            color:
                              '#5ce8ff !important',
                          }}
                        />
                      }
                      label="Secure"
                      size="small"
                      sx={{
                        color: '#fff',
                        background:
                          'rgba(0,0,0,0.18)',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* ACCOUNT INFORMATION */}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: '1.4fr 0.8fr',
            },
            gap: 3,
          }}
        >
          <Card
            sx={{
              borderRadius: 4,
              color: '#fff',
              background:
                'linear-gradient(145deg,#11246f,#08164c)',
              border:
                '1px solid rgba(100,150,255,0.2)',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 900,
                  mb: 3,
                }}
              >
                Personal Information
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <PersonOutlineIcon
                        sx={{
                          color: '#6edcff',
                          mr: 1,
                        }}
                      />
                    ),
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: '#aebeff',
                    },
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor:
                          'rgba(140,170,255,0.4)',
                      },
                      '&:hover fieldset': {
                        borderColor:
                          '#5ce8ff',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  value={
                    profile.email ||
                    'Email not available'
                  }
                  disabled
                  InputProps={{
                    startAdornment: (
                      <EmailOutlinedIcon
                        sx={{
                          color: '#6edcff',
                          mr: 1,
                        }}
                      />
                    ),
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: '#aebeff',
                    },
                    '& .MuiInputBase-input.Mui-disabled':
                      {
                        WebkitTextFillColor:
                          '#cbd6ff',
                      },
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor:
                          'rgba(140,170,255,0.25)',
                      },
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(event) =>
                    setUsername(event.target.value)
                  }
                  InputProps={{
                    startAdornment: (
                      <BadgeOutlinedIcon
                        sx={{
                          color: '#6edcff',
                          mr: 1,
                        }}
                      />
                    ),
                  }}
                  sx={{
                    '& .MuiInputLabel-root': {
                      color: '#aebeff',
                    },
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor:
                          'rgba(140,170,255,0.4)',
                      },
                      '&:hover fieldset': {
                        borderColor:
                          '#5ce8ff',
                      },
                    },
                  }}
                />
              </Stack>

              <Button
                fullWidth
                variant="contained"
                disabled={saving || loading}
                onClick={handleSave}
                sx={{
                  mt: 3,
                  py: 1.4,
                  textTransform: 'none',
                  fontWeight: 900,
                  background:
                    'linear-gradient(90deg,#13b95f,#18d878)',
                }}
              >
                {saving ? (
                  <CircularProgress
                    size={22}
                    sx={{ color: '#fff' }}
                  />
                ) : (
                  'Save Profile'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* ACCOUNT DETAILS */}

          <Stack spacing={3}>
            <Card
              sx={{
                borderRadius: 4,
                color: '#fff',
                background:
                  'linear-gradient(145deg,#11246f,#08164c)',
                border:
                  '1px solid rgba(100,150,255,0.2)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  sx={{
                    fontSize: 20,
                    fontWeight: 900,
                    mb: 2,
                  }}
                >
                  Account Details
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography
                      sx={{
                        color: '#8296e0',
                        fontSize: 11,
                      }}
                    >
                      ACCOUNT ID
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 800,
                        mt: 0.5,
                        wordBreak: 'break-all',
                      }}
                    >
                      {profile.accountId ||
                        'Not available'}
                    </Typography>
                  </Box>

                  <Divider
                    sx={{
                      borderColor:
                        'rgba(255,255,255,0.08)',
                    }}
                  />

                  <Box>
                    <Typography
                      sx={{
                        color: '#8296e0',
                        fontSize: 11,
                      }}
                    >
                      ACCOUNT STATUS
                    </Typography>

                    <Chip
                      icon={
                        <VerifiedUserIcon
                          sx={{
                            color:
                              '#4df28d !important',
                          }}
                        />
                      }
                      label="Active"
                      size="small"
                      sx={{
                        mt: 1,
                        color: '#fff',
                        background:
                          'rgba(19,185,95,0.18)',
                        fontWeight: 800,
                      }}
                    />
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* SECURITY */}

            <Card
              sx={{
                borderRadius: 4,
                color: '#fff',
                background:
                  'linear-gradient(145deg,#11246f,#08164c)',
                border:
                  '1px solid rgba(100,150,255,0.2)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <SecurityIcon
                    sx={{
                      color: '#5ce8ff',
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 900,
                    }}
                  >
                    Security
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    color: '#8296e0',
                    fontSize: 13,
                    lineHeight: 1.6,
                    mt: 1.5,
                  }}
                >
                  Keep your account secure by
                  protecting your login credentials
                  and reviewing your security settings.
                </Typography>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={
                    <SecurityIcon />
                  }
                  onClick={() =>
                    navigate('/security')
                  }
                  sx={{
                    mt: 2,
                    color: '#fff',
                    borderColor:
                      'rgba(110,190,255,0.45)',
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  Security Settings
                </Button>
              </CardContent>
            </Card>
          </Stack>
        </Box>

        {/* MOBILE LOGOUT */}

        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            display: {
              xs: 'flex',
              sm: 'none',
            },
            mt: 3,
            color: '#ff8297',
            borderColor:
              'rgba(255,100,130,0.3)',
            textTransform: 'none',
            fontWeight: 800,
          }}
        >
          Logout
        </Button>
      </Container>
    </Box>
  );
};

export default Profile;
