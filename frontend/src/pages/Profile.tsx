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
import EditIcon from '@mui/icons-material/Edit';

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
   COUNTRIES
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
   PROFILE COMPONENT
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
              const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
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
        name: String(user.name || user.fullName || user.full_name || combinedName || '').trim(),
        email: String(user.email || user.emailAddress || '').trim(),
        username: String(user.username || user.userName || '').trim(),
        accountId: String(user.accountId || user.account_id || user.id || user._id || '').trim(),
        phone: String(user.phone || user.phoneNumber || '').trim(),
        country: String(user.country || '').trim(),
        profilePhoto: String(user.profilePhoto || user.avatar || user.photo || user.image || '').trim(),
        kycStatus: String(
          user.identityVerificationStatus || user.kycStatus || user.kyc_status || 'PENDING'
        ).toUpperCase(),
        balance: Number(user.account?.balance ?? user.balance ?? 0),
        currency: String(user.account?.currency || user.preferredCurrency || user.currency || 'USD'),
        referralCode: String(user.referralCode || user.referral_code || '').trim(),
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
     HELPERS
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
     UPLOAD PHOTO
  ========================================================== */

  const handlePhotoChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
      formData.append('photo', file);

      const response = await apiClient.post('/auth/profile/photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const newPhotoUrl =
        response.data?.url ||
        response.data?.profilePhoto ||
        response.data?.avatar ||
        response.data?.photo ||
        '';

      if (newPhotoUrl) {
        setProfile((prev) => ({ ...prev, profilePhoto: newPhotoUrl }));

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
        err?.response?.data?.message || 'Unable to upload profile photo. Please try again.'
      );
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

  const handleLogout = () => {
    ['token', 'accessToken', 'authToken', 'user', 'currentUser', 'authUser', 'profile'].forEach(
      (key) => localStorage.removeItem(key)
    );
    navigate('/login');
  };

  /* ==========================================================
     STYLES
  ========================================================== */

  const inputSx = {
    '& .MuiInputLabel-root': { color: '#9eb3ff' },
    '& .MuiInputLabel-root.Mui-focused': { color: '#5ce8ff' },
    '& .MuiOutlinedInput-root': {
      color: '#fff',
      borderRadius: 2.5,
      backgroundColor: 'rgba(255,255,255,0.03)',
      '& fieldset': { borderColor: 'rgba(140,170,255,0.25)' },
      '&:hover fieldset': { borderColor: 'rgba(92,232,255,0.6)' },
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
          'radial-gradient(ellipse at top right, rgba(30,90,220,0.18), transparent 45%), radial-gradient(ellipse at bottom left, rgba(10,40,120,0.25), transparent 50%), linear-gradient(180deg, #020617 0%, #0a1628 40%, #0f1c3d 100%)',
        pb: 8,
      }}
    >
      {/* TOP BAR */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          background: 'rgba(2,6,23,0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(100,140,255,0.12)',
        }}
      >
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ py: 1.75 }}>
            <IconButton
              onClick={() => navigate('/dashboard')}
              sx={{
                color: '#fff',
                background: 'rgba(99,102,241,0.15)',
                border: '1px solid rgba(99,102,241,0.25)',
                '&:hover': { background: 'rgba(99,102,241,0.3)' },
              }}
            >
              <ArrowBackIcon fontSize="small" />
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography sx={{ fontSize: { xs: 17, sm: 19 }, fontWeight: 800, letterSpacing: -0.3 }}>
                Account Profile
              </Typography>
              <Typography sx={{ color: '#64748b', fontSize: 11, letterSpacing: 1.2, mt: 0.2 }}>
                GLOBAL DIGITAL MARKET
              </Typography>
            </Box>

            <Button
              onClick={handleLogout}
              startIcon={<LogoutIcon sx={{ fontSize: 18 }} />}
              sx={{
                color: '#f87171',
                textTransform: 'none',
                fontWeight: 600,
                display: { xs: 'none', sm: 'flex' },
                '&:hover': { background: 'rgba(248,113,113,0.08)' },
              }}
            >
              Logout
            </Button>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 3.5, md: 5 } }}>
        {/* PAGE HEADER */}
        <Box sx={{ mb: 4 }}>
          <Typography
            sx={{
              fontSize: { xs: 28, md: 36 },
              fontWeight: 900,
              letterSpacing: -1.2,
              background: 'linear-gradient(90deg, #fff 0%, #93c5fd 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Your Profile
          </Typography>
          <Typography sx={{ color: '#64748b', mt: 0.8, fontSize: 15 }}>
            Manage your personal information and account settings
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2.5, borderRadius: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2.5, borderRadius: 3 }}>
            {success}
          </Alert>
        )}

        {/* PROFILE HERO */}
        <Card
          sx={{
            mb: 4,
            borderRadius: 5,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
            border: '1px solid rgba(147,197,253,0.15)',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.4)',
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 4.5 } }}>
            {loading ? (
              <Stack alignItems="center" spacing={2} sx={{ py: 5 }}>
                <CircularProgress sx={{ color: '#60a5fa' }} />
                <Typography sx={{ color: '#94a3b8' }}>Loading profile...</Typography>
              </Stack>
            ) : (
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={3.5}
                alignItems={{ xs: 'center', sm: 'center' }}
              >
                {/* AVATAR */}
                <Box sx={{ position: 'relative' }}>
                  <Avatar
                    src={profile.profilePhoto || undefined}
                    sx={{
                      width: 110,
                      height: 110,
                      fontSize: 36,
                      fontWeight: 800,
                      background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                      border: '4px solid rgba(255,255,255,0.15)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    }}
                  >
                    {!profile.profilePhoto && initials}
                  </Avatar>

                  <IconButton
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      width: 38,
                      height: 38,
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: '#fff',
                      border: '2px solid #0f172a',
                      boxShadow: '0 4px 12px rgba(16,185,129,0.4)',
                      '&:hover': { background: 'linear-gradient(135deg, #059669, #047857)' },
                    }}
                  >
                    {uploadingPhoto ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <PhotoCameraIcon sx={{ fontSize: 18 }} />
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

                {/* INFO */}
                <Box sx={{ flexGrow: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                  <Typography sx={{ fontSize: { xs: 26, md: 32 }, fontWeight: 900, letterSpacing: -0.8 }}>
                    {displayName}
                  </Typography>
                  <Typography sx={{ color: '#93c5fd', mt: 0.5, fontSize: 15 }}>
                    {profile.email || 'Email not available'}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 2 }}
                    justifyContent={{ xs: 'center', sm: 'flex-start' }}
                    flexWrap="wrap"
                    useFlexGap
                  >
                    <Chip
                      icon={<VerifiedUserIcon sx={{ fontSize: 16 }} />}
                      label={profile.kycStatus || 'PENDING'}
                      size="small"
                      color={kycColor(profile.kycStatus) as any}
                      sx={{ fontWeight: 700, height: 28 }}
                    />
                    <Chip
                      icon={<SecurityIcon sx={{ fontSize: 16 }} />}
                      label="Protected"
                      size="small"
                      sx={{
                        fontWeight: 700,
                        height: 28,
                        background: 'rgba(255,255,255,0.1)',
                        color: '#e0f2fe',
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>

        {/* CONTENT GRID */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', lg: '1.4fr 0.9fr' },
            gap: 3,
          }}
        >
          {/* LEFT - PERSONAL INFO */}
          <Card
            sx={{
              borderRadius: 4,
              background: 'rgba(15,23,42,0.7)',
              border: '1px solid rgba(100,140,255,0.12)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                <EditIcon sx={{ color: '#60a5fa', fontSize: 22 }} />
                <Typography sx={{ fontSize: 20, fontWeight: 800 }}>
                  Personal Information
                </Typography>
              </Stack>

              <Stack spacing={2.5}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  InputProps={{
                    startAdornment: <PersonOutlineIcon sx={{ color: '#60a5fa', mr: 1.2 }} />,
                  }}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="Email Address"
                  value={profile.email || 'Email not available'}
                  disabled
                  InputProps={{
                    startAdornment: <EmailOutlinedIcon sx={{ color: '#60a5fa', mr: 1.2 }} />,
                  }}
                  sx={{
                    ...inputSx,
                    '& .MuiInputBase-input.Mui-disabled': {
                      WebkitTextFillColor: '#94a3b8',
                    },
                  }}
                />

                <TextField
                  fullWidth
                  label="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  InputProps={{
                    startAdornment: <BadgeOutlinedIcon sx={{ color: '#60a5fa', mr: 1.2 }} />,
                  }}
                  sx={inputSx}
                />

                <TextField
                  fullWidth
                  label="Phone Number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  InputProps={{
                    startAdornment: <PhoneIcon sx={{ color: '#60a5fa', mr: 1.2 }} />,
                  }}
                  sx={inputSx}
                />

                <FormControl fullWidth sx={inputSx}>
                  <InputLabel>Country</InputLabel>
                  <Select
                    label="Country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    startAdornment={<PublicIcon sx={{ color: '#60a5fa', mr: 1.2 }} />}
                    sx={{
                      color: '#fff',
                      borderRadius: 2.5,
                      '.MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(140,170,255,0.25)',
                      },
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'rgba(92,232,255,0.6)',
                      },
                      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                        borderColor: '#5ce8ff',
                      },
                      '.MuiSvgIcon-root': { color: '#9eb3ff' },
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
                  mt: 3.5,
                  py: 1.6,
                  textTransform: 'none',
                  fontWeight: 800,
                  fontSize: 15,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #10b981, #059669)',
                  boxShadow: '0 8px 20px rgba(16,185,129,0.25)',
                  '&:hover': {
                    background: 'linear-gradient(90deg, #059669, #047857)',
                  },
                }}
              >
                {saving ? (
                  <CircularProgress size={22} sx={{ color: '#fff' }} />
                ) : (
                  'Save Changes'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* RIGHT COLUMN */}
          <Stack spacing={3}>
            {/* ACCOUNT DETAILS */}
            <Card
              sx={{
                borderRadius: 4,
                background: 'rgba(15,23,42,0.7)',
                border: '1px solid rgba(100,140,255,0.12)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography sx={{ fontSize: 18, fontWeight: 800, mb: 2.5 }}>
                  Account Overview
                </Typography>

                <Stack spacing={2.2}>
                  <Box>
                    <Typography sx={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>
                      ACCOUNT ID
                    </Typography>
                    <Typography sx={{ mt: 0.6, fontSize: 13.5, fontWeight: 600, wordBreak: 'break-all' }}>
                      {profile.accountId || 'Not available'}
                    </Typography>
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                  <Box>
                    <Typography sx={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>
                      KYC STATUS
                    </Typography>
                    <Chip
                      icon={<VerifiedUserIcon sx={{ fontSize: 16 }} />}
                      label={profile.kycStatus || 'PENDING'}
                      size="small"
                      color={kycColor(profile.kycStatus) as any}
                      sx={{ mt: 1, fontWeight: 700 }}
                    />
                  </Box>

                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

                  <Box>
                    <Typography sx={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>
                      AVAILABLE BALANCE
                    </Typography>
                    <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 0.8 }}>
                      <AccountBalanceWalletIcon sx={{ color: '#38bdf8', fontSize: 22 }} />
                      <Typography sx={{ fontWeight: 800, fontSize: 18 }}>
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
                      <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                      <Box>
                        <Typography sx={{ color: '#64748b', fontSize: 11, fontWeight: 700, letterSpacing: 0.8 }}>
                          REFERRAL CODE
                        </Typography>
                        <Stack direction="row" spacing={1.2} alignItems="center" sx={{ mt: 0.8 }}>
                          <CardGiftcardIcon sx={{ color: '#38bdf8', fontSize: 20 }} />
                          <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
                            {profile.referralCode}
                          </Typography>
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
                background: 'rgba(15,23,42,0.7)',
                border: '1px solid rgba(100,140,255,0.12)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <SecurityIcon sx={{ color: '#60a5fa' }} />
                  <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Security</Typography>
                </Stack>
                <Typography sx={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.6, mb: 2.5 }}>
                  Protect your account with strong security settings and review your activity.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SecurityIcon />}
                  onClick={() => navigate('/security')}
                  sx={{
                    color: '#e0f2fe',
                    borderColor: 'rgba(96,165,250,0.35)',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    py: 1.2,
                    '&:hover': {
                      borderColor: '#60a5fa',
                      background: 'rgba(96,165,250,0.08)',
                    },
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
                background: 'rgba(15,23,42,0.7)',
                border: '1px solid rgba(100,140,255,0.12)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
                  <SettingsIcon sx={{ color: '#60a5fa' }} />
                  <Typography sx={{ fontSize: 18, fontWeight: 800 }}>Settings</Typography>
                </Stack>
                <Typography sx={{ color: '#64748b', fontSize: 13.5, lineHeight: 1.6, mb: 2.5 }}>
                  Customize your preferences and manage platform settings.
                </Typography>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/settings')}
                  sx={{
                    color: '#e0f2fe',
                    borderColor: 'rgba(96,165,250,0.35)',
                    textTransform: 'none',
                    fontWeight: 700,
                    borderRadius: 2.5,
                    py: 1.2,
                    '&:hover': {
                      borderColor: '#60a5fa',
                      background: 'rgba(96,165,250,0.08)',
                    },
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
            mt: 4,
            color: '#f87171',
            borderColor: 'rgba(248,113,113,0.3)',
            textTransform: 'none',
            fontWeight: 700,
            py: 1.4,
            borderRadius: 3,
          }}
        >
          Logout
        </Button>
      </Container>
    </Box>
  );
};

export default Profile;
