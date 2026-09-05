import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
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
import SettingsIcon from '@mui/icons-material/Settings';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import PhoneIcon from '@mui/icons-material/Phone';
import PublicIcon from '@mui/icons-material/Public';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

/* ============================================================
   TYPES
============================================================ */

interface UserProfile {
  name: string;
  email: string;
  username: string;
  accountId: string;
  phone?: string;
  country?: string;
  profilePhoto?: string;
  kycStatus?: string;
  balance?: number;
  currency?: string;
  referralCode?: string;
}

/* ============================================================
   COUNTRIES LIST
============================================================ */

const COUNTRIES = [
  'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia',
  'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
  'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
  'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia',
  'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile',
  'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus',
  'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador',
  'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini',
  'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany',
  'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana',
  'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq',
  'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan',
  'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia',
  'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
  'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
  'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia',
  'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal',
  'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea',
  'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama',
  'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal',
  'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia',
  'Saint Vincent and the Grenadines', 'Samoa', 'San Marino', 'Sao Tome and Principe',
  'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore',
  'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea',
  'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland',
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo',
  'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
  'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States',
  'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam',
  'Yemen', 'Zambia', 'Zimbabwe'
];

/* ============================================================
   PROFILE
============================================================ */

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
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
  const [phone, setPhone] = useState('');
  const [country, setCountry] = useState('');

  /* ==========================================================
     LOAD PROFILE
  ========================================================== */

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      let loadedUser: any = null;

      try {
        const response = await apiClient.get('/auth/profile');
        const data = response.data || {};
        loadedUser = data.user || data;
      } catch (backendError) {
        console.warn('Backend profile endpoint unavailable.', backendError);
      }

      if (!loadedUser) {
        const possibleKeys = ['user', 'currentUser', 'authUser', 'profile'];
        for (const key of possibleKeys) {
          const stored = localStorage.getItem(key);
          if (!stored) continue;
          try {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') {
              loadedUser = parsed;
              break;
            }
          } catch {
            continue;
          }
        }
      }

      if (!loadedUser) {
        const token =
          localStorage.getItem('authToken') ||
          localStorage.getItem('accessToken') ||
          localStorage.getItem('token');

        if (token) {
          try {
            const parts = token.split('.');
            if (parts.length === 3) {
              const normalized = parts[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');
              loadedUser = JSON.parse(atob(normalized));
            }
          } catch {
            loadedUser = null;
          }
        }
      }

      const user = loadedUser || {};

      const firstName = String(user.firstName || user.first_name || '').trim();
      const lastName = String(user.lastName || user.last_name || '').trim();
      const combinedName = `${firstName} ${lastName}`.trim();

      const loadedProfile: UserProfile = {
        name: String(
          user.name || user.fullName || user.full_name || combinedName || ''
        ).trim(),
        email: String(user.email || user.emailAddress || '').trim(),
        username: String(user.username || user.userName || '').trim(),
        accountId: String(
          user.accountId || user.account_id || user.id || user._id || ''
        ).trim(),
        phone: String(user.phone || user.phoneNumber || '').trim(),
        country: String(user.country || '').trim(),
        profilePhoto: String(
          user.profilePhoto || user.avatar || user.photo || user.image || ''
        ).trim(),
        kycStatus: String(
          user.identityVerificationStatus ||
            user.kycStatus ||
            user.kyc_status ||
            'PENDING'
        ).toUpperCase(),
        balance: Number(user.account?.balance ?? user.balance ?? 0),
        currency: String(
          user.account?.currency || user.preferredCurrency || user.currency || 'USD'
        ),
        referralCode: String(
          user.referralCode || user.referral_code || ''
        ).trim(),
      };

      setProfile(loadedProfile);
      setName(loadedProfile.name);
      setUsername(loadedProfile.username);
      setPhone(loadedProfile.phone || '');
      setCountry(loadedProfile.country || '');
    } catch (err) {
      console.error('Profile loading error:', err);
      setError('Unable to load your account profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  /* ==========================================================
     DISPLAY HELPERS
  ========================================================== */

  const displayName = useMemo(() => {
    if (profile.name) return profile.name;
    if (profile.username) return profile.username;
    return 'Account Holder';
  }, [profile.name, profile.username]);

  const initials = useMemo(() => {
    const source = profile.name || profile.username || 'A';
    const parts = source.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return (parts[0]?.[0] || 'A').toUpperCase();
  }, [profile.name, profile.username]);

  const kycColor = (status?: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'APPROVED' || s === 'VERIFIED') return 'success';
    if (s === 'PENDING' || s === 'PROCESSING') return 'warning';
    if (s === 'REJECTED') return 'error';
    return 'default';
  };

  /* ==========================================================
     SAVE PROFILE
  ========================================================== */

  const handleSave = async () => {
    setError('');
    setSuccess('');

    const trimmedName = name.trim();
    const trimmedUsername = username.trim();

    if (!trimmedName) {
      setError('Please enter your full name.');
      return;
    }
    if (!trimmedUsername) {
      setError('Please enter your username.');
      return;
    }

    try {
      setSaving(true);

      let backendSaved = false;

      try {
        await apiClient.put('/auth/profile', {
          name: trimmedName,
          username: trimmedUsername,
          phone: phone.trim(),
          country: country.trim(),
        });
        backendSaved = true;
      } catch (backendError) {
        console.warn('Backend profile update unavailable.', backendError);
      }

      // Update localStorage
      const possibleKeys = ['user', 'currentUser', 'authUser', 'profile'];
      let updated = false;

      for (const key of possibleKeys) {
        const stored = localStorage.getItem(key);
        if (!stored) continue;
        try {
          const parsed = JSON.parse(stored);
          if (parsed && typeof parsed === 'object') {
            localStorage.setItem(
              key,
              JSON.stringify({
                ...parsed,
                name: trimmedName,
                username: trimmedUsername,
                phone: phone.trim(),
                country: country.trim(),
              })
            );
            updated = true;
            break;
          }
        } catch {
          continue;
        }
      }

      if (!updated) {
        localStorage.setItem(
          'user',
          JSON.stringify({
            name: trimmedName,
            username: trimmedUsername,
            email: profile.email,
            accountId: profile.accountId,
            phone: phone.trim(),
            country: country.trim(),
            profilePhoto: profile.profilePhoto,
          })
        );
      }

      setProfile((prev) => ({
        ...prev,
        name: trimmedName,
        username: trimmedUsername,
        phone: phone.trim(),
        country: country.trim(),
      }));

      setSuccess(
        backendSaved
          ? 'Your profile has been updated successfully.'
          : 'Your profile has been updated on this device.'
      );
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  /* ==========================================================
     UPLOAD PROFILE PHOTO
  ========================================================== */

  const handlePhotoChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Image must be smaller than 5MB.');
      return;
    }

    try {
      setUploadingPhoto(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('photo', file); // change key if your backend expects different name

      const response = await apiClient.post(
        '/auth/profile/photo', // change this if your endpoint is different
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const newPhotoUrl =
        response.data?.url ||
        response.data?.profilePhoto ||
        response.data?.avatar ||
        response.data?.photo ||
        '';

      if (newPhotoUrl) {
        setProfile((prev) => ({
          ...prev,
          profilePhoto: newPhotoUrl,
        }));

        const possibleKeys = ['user', 'currentUser', 'authUser', 'profile'];
        for (const key of possibleKeys) {
          const stored = localStorage.getItem(key);
          if (!stored) continue;
          try {
            const parsed = JSON.parse(stored);
            if (parsed && typeof parsed === 'object') {
              localStorage.setItem(
                key,
                JSON.stringify({ ...parsed, profilePhoto: newPhotoUrl })
              );
              break;
            }
          } catch {
            continue;
          }
        }

        setSuccess('Profile photo updated successfully.');
      } else {
        setError('Photo uploaded but no URL was returned.');
      }
    } catch (err: any) {
      console.error('Photo upload error:', err);
      setError(
        err?.response?.data?.message ||
          'Unable to upload profile photo. Please try again.'
      );
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    [
      'token',
      'accessToken',
      'authToken',
      'user',
      'currentUser',
      'authUser',
      'profile',
    ].forEach((key) => localStorage.removeItem(key));

    navigate('/login');
  };

  /* ==========================================================
     STYLES
  ========================================================== */

  const inputSx = {
    '& .MuiInputLabel-root': { color: '#aebeff' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#5ce8ff' },
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      '& fieldset': { borderColor: 'rgba(140,170,255,0.35)' },
      '&:hover fieldset': { borderColor: '#5ce8ff' },
      '&.Mui-focused fieldset': { borderColor: '#5ce8ff' },
    },
  };

  /* ==========================================================
     RENDER
  ========================================================== */

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
          zIndex: 20,
          background: 'rgba(2,7,31,0.96)',
          backdropFilter: 'blur(14px)',
          borderBottom: '1px solid rgba(125,150,255,0.18)',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1.5 }}>
            <IconButton
              onClick={() => navigate('/dashboard')}
              sx={{
                color: '#fff',
                background: 'rgba(60,90,220,0.25)',
                '&:hover': { background: 'rgba(60,90,220,0.45)' },
              }}
            >
              <ArrowBackIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: { xs: 18, sm: 22 }, fontWeight: 900 }}>
                Account Profile
              </Typography>
              <Typography sx={{ color: '#7691e5', fontSize: 9, letterSpacing: 1 }}>
                GLOBAL DIGITAL MARKET
              </Typography>
            </Box>

            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon />}
              sx={{
                color: '#ff8297',
                textTransform: 'none',
                display: { xs: 'none', sm: 'flex' },
              }}
            >
              Logout
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{ fontSize: { xs: 30, md: 42 }, fontWeight: 900, letterSpacing: -1 }}
          >
            Your Account
          </Typography>
          <Typography sx={{ color: '#8ea4e8', mt: 0.5 }}>
            Manage your personal information, photo and security.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2, borderRadius: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2, borderRadius: 2 }}>
            {success}
          </Alert>
        )}

        {/* PROFILE HEADER CARD */}
        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            overflow: 'hidden',
            background: 'linear-gradient(135deg,#10216d 0%,#154ec7 60%,#087fda 100%)',
            border: '1px solid rgba(130,190,255,0.28)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {loading ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 4 }}>
                <CircularProgress sx={{ color: '#5ce8ff' }} />
                <Typography sx={{ color: '#c7d7ff' }}>Loading account profile...</Typography>
              </Stack>
            ) : (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
              >
                {/* AVATAR + UPLOAD */}
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={profile.profilePhoto || undefined}
                    sx={{
                      width: 100,
                      height: 100,
                      fontSize: 32,
                      fontWeight: 900,
                      background: 'linear-gradient(135deg,#19d8ff,#285cff)',
                      border: '3px solid rgba(255,255,255,0.25)',
                      boxShadow: '0 12px 35px rgba(0,0,0,0.25)',
                    }}
                  >
                    {!profile.profilePhoto && initials}
                  </Avatar>

                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      background: '#13b95f',
                      color: '#fff',
                      width: 36,
                      height: 36,
                      '&:hover': { background: '#0fa34f' },
                    }}
                  >
                    {uploadingPhoto ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <PhotoCameraIcon fontSize="small" />
                    )}
                  </IconButton>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handlePhotoChange}
                  />
                </Box>

                <Box sx={{ flexGrow: 1 }}>
                  <Typography sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 900 }}>
                    {displayName}
                  </Typography>
                  <Typography sx={{ color: '#c5d5ff', mt: 0.5 }}>
                    {profile.email || 'Email not available'}
                  </Typography>

                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }} flexWrap="wrap" useFlexGap>
                    <Chip
                      icon={<VerifiedUserIcon sx={{ color: '#4df28d !important' }} />}
                      label={profile.kycStatus || 'PENDING'}
                      size="small"
                      color={kycColor(profile.kycStatus) as any}
                      sx={{ fontWeight: 700 }}
                    />
                    <Chip
                      icon={<SecurityIcon sx={{ color: '#5ce8ff !important' }} />}
                      label="Secure"
                      size="small"
                      sx={{
                        color: '#fff',
                        background: 'rgba(0,0,0,0.18)',
                        fontWeight: 700,
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* MAIN GRID */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.35fr 0.8fr' },
            gap: 3,
          }}
        >
          {/* PERSONAL INFORMATION */}
          <Card
            sx={{
              borderRadius: 4,
              color: '#fff',
              background: 'linear-gradient(145deg,#11246f,#08164c)',
              border: '1px solid rgba(100,150,255,0.2)',
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3 } }}>
              <Typography sx={{ fontSize: 22, fontWeight: 900, mb: 3 }}>
                Personal Information
              </Typography>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <PersonOutlineIcon sx={{ color: '#6edcff', mr: 1 }} />
                    ),
                  }}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  value={profile.email || 'Email not available'}
                  disabled
                  InputProps={{
                    startAdornment: (
                      <EmailOutlinedIcon sx={{ color: '#6edcff', mr: 1 }} />
                    ),
                  }}
                  sx={{
                    ...inputSx,
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#cbd6ff',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <BadgeOutlinedIcon sx={{ color: '#6edcff', mr: 1 }} />
                    ),
                  }}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ color: '#6edcff', mr: 1 }} />,
                  }}
                  sx={inputSx}
                />

                {/* COUNTRY DROPDOWN */}
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel sx={{ color: '#aebeff' }}>Country</InputLabel>
                  <Select
                    label="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    startAdornment={<PublicIcon sx={{ color: '#6edcff', mr: 1 }} />}
                    sx={{
                      color: '#fff',
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(140,170,255,0.35)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5ce8ff',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5ce8ff',
                      },
                      '.MuiSvgIcon-root': {
                        color: '#aebeff',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <em>Select your country</em>
                    </MenuItem>
                    {COUNTRIES.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>

              <Button
                fullWidth
                variant="contained"
                disabled={saving || loading}
                onClick={handleSave}
                sx={{
                  mt: 3,
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 900,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg,#13b95f,#18d878)',
                }}
              >
                {saving ? (
                  <CircularProgress size={22} sx={{ color: '#fff' }} />
                ) : (
                  'Save Profile'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* RIGHT SIDE */}
          <Stack spacing={3}>
            {/* ACCOUNT DETAILS */}
            <Card
              sx={{
                borderRadius: 4,
                color: '#fff',
                background: 'linear-gradient(145deg,#11246f,#08164c)',
                border: '1px solid rgba(100,150,255,0.2)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: 20, fontWeight: 900, mb: 2 }}>
                  Account Details
                </Typography>

                <Stack spacing={2}>
                  <Box>
                    <Typography sx={{ color: '#8296e0', fontSize: 10, fontWeight: 800 }}>
                      ACCOUNT ID
                    </Typography>
                    <Typography
                      sx={{ mt: 0.5, fontSize: 13, fontWeight: 700, wordBreak: 'break-all' }}
                    >
                      {profile.accountId || 'Not available'}
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                  <Box>
                    <Typography sx={{ color: '#8296e0', fontSize: 10, fontWeight: 800 }}>
                      KYC STATUS
                    </Typography>
                    <Chip
                      icon={<VerifiedUserIcon sx={{ color: '#4df28d !important' }} />}
                      label={profile.kycStatus || 'PENDING'}
                      size="small"
                      color={kycColor(profile.kycStatus) as any}
                      sx={{ mt: 1, fontWeight: 800 }}
                    />
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

                  <Box>
                    <Typography sx={{ color: '#8296e0', fontSize: 10, fontWeight: 800 }}>
                      ACCOUNT BALANCE
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                      <AccountBalanceWalletIcon sx={{ color: '#5ce8ff', fontSize: 20 }} />
                      <Typography sx={{ fontWeight: 800, fontSize: 16 }}>
                        {profile.currency || 'USD'}{' '}
                        {Number(profile.balance || 0).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </Typography>
                    </Stack>
                  </Box>

                  {profile.referralCode && (
                    <>
                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />
                      <Box>
                        <Typography sx={{ color: '#8296e0', fontSize: 10, fontWeight: 800 }}>
                          REFERRAL CODE
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                          <CardGiftcardIcon sx={{ color: '#5ce8ff', fontSize: 20 }} />
                          <Typography sx={{ fontWeight: 800 }}>{profile.referralCode}</Typography>
                        </Stack>
                      </Box>
                    </>
                  )}
                </Stack>
              </CardContent>
            </Card>

            {/* SECURITY */}
            <Card
              sx={{
                borderRadius: 4,
                color: '#fff',
                background: 'linear-gradient(145deg,#11246f,#08164c)',
                border: '1px solid rgba(100,150,255,0.2)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <SecurityIcon sx={{ color: '#5ce8ff' }} />
                  <Typography sx={{ fontSize: 20, fontWeight: 900 }}>Security</Typography>
                </Stack>
                <Typography sx={{ color: '#8296e0', fontSize: 13, lineHeight: 1.6, mt: 1.5 }}>
                  Keep your account secure by protecting your login credentials.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={() => navigate('/security')}
                  sx={{
                    mt: 2,
                    color: '#fff',
                    borderColor: 'rgba(110,190,255,0.45)',
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  Security Settings
                </Button>
              </CardContent>
            </Card>

            {/* SETTINGS */}
            <Card
              sx={{
                borderRadius: 4,
                color: '#fff',
                background: 'linear-gradient(145deg,#11246f,#08164c)',
                border: '1px solid rgba(100,150,255,0.2)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <SettingsIcon sx={{ color: '#5ce8ff' }} />
                  <Typography sx={{ fontSize: 20, fontWeight: 900 }}>Account Settings</Typography>
                </Stack>
                <Typography sx={{ color: '#8296e0', fontSize: 13, lineHeight: 1.6, mt: 1.5 }}>
                  Manage your account preferences and platform settings.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/settings')}
                  sx={{
                    mt: 2,
                    color: '#fff',
                    borderColor: 'rgba(110,190,255,0.45)',
                    textTransform: 'none',
                    fontWeight: 700,
                  }}
                >
                  Open Settings
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
            display: { xs: 'flex', sm: 'none' },
            mt: 3,
            color: '#ff8297',
            borderColor: 'rgba(255,100,130,0.3)',
            textTransform: 'none',
            fontWeight: 800,
            py: 1.3,
          }}
        >
          Logout
        </Button>
      </Container>
    </Box>
  );
};

export default Profile;
