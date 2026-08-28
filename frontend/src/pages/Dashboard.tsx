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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TrackChangesIcon from '@mui/icons-material/TrackChanges';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import PeopleIcon from '@mui/icons-material/People';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import BoltIcon from '@mui/icons-material/Bolt';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import LogoutIcon from '@mui/icons-material/Logout';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

import { useNavigate } from 'react-router-dom';

import apiClient from '../services/apiClient';

interface AccountData {
  availableBalance: number;
}

interface UserProfile {
  name: string;
  email: string;
  username: string;
  accountId: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [account, setAccount] = useState<AccountData>({
    availableBalance: 0,
  });

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    username: '',
    accountId: '',
  });

  /*
   * Read user information from common localStorage keys.
   *
   * This does not create fake user information.
   * If the login system has stored a user object,
   * we display the information that is actually available.
   */
  const loadProfile = () => {
    try {
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

          if (parsed && typeof parsed === 'object') {
            storedUser = parsed;
            break;
          }
        } catch {
          // Ignore invalid JSON and continue.
        }
      }

      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('authToken');

      let tokenUser: any = null;

      /*
       * If a JWT exists, safely read its payload.
       * This is only used for displaying profile information.
       */
      if (token) {
        try {
          const parts = token.split('.');

          if (parts.length === 3) {
            const payload = parts[1];

            const normalized = payload
              .replace(/-/g, '+')
              .replace(/_/g, '/');

            const decoded = JSON.parse(
              decodeURIComponent(
                Array.prototype.map
                  .call(
                    atob(normalized),
                    (character: string) =>
                      `%${(
                        '00' +
                        character.charCodeAt(0).toString(16)
                      ).slice(-2)}`
                  )
                  .join('')
              )
            );

            tokenUser = decoded;
          }
        } catch {
          // Invalid token payload. Continue without it.
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

      const name = String(
        user.name ||
          user.fullName ||
          user.full_name ||
          combinedName ||
          ''
      ).trim();

      const email = String(
        user.email ||
          user.emailAddress ||
          ''
      ).trim();

      const username = String(
        user.username ||
          user.userName ||
          ''
      ).trim();

      const accountId = String(
        user.accountId ||
          user.account_id ||
          user.id ||
          user._id ||
          ''
      ).trim();

      setProfile({
        name,
        email,
        username,
        accountId,
      });
    } catch (err) {
      console.error(
        'Unable to load local profile:',
        err
      );
    }
  };

  const loadAccount = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get(
        '/portfolio/performance'
      );

      const data = response.data || {};

      /*
       * Only use the available balance here.
       *
       * We intentionally do NOT display hard-coded
       * portfolio values, holdings, gains or fake
       * investment figures on the dashboard.
       */
      setAccount({
        availableBalance:
          Number(data.availableBalance) || 0,
      });
    } catch (err: any) {
      console.error(
        'Dashboard account error:',
        err
      );

      if (err?.response?.status === 401) {
        setError(
          'Your login session has expired. Please login again.'
        );
      } else {
        setError(
          err?.response?.data?.message ||
            err?.response?.data?.error ||
            'Unable to load your account balance.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
    loadAccount();
  }, []);

  const money = (value: number) => {
    if (!Number.isFinite(value)) {
      return '$0.00';
    }

    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

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
    if (profile.name) {
      const parts = profile.name
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

    if (profile.username) {
      return profile.username
        .slice(0, 2)
        .toUpperCase();
    }

    return 'A';
  }, [profile.name, profile.username]);

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    /*
     * Clear common authentication keys.
     *
     * If your authService already has a logout function,
     * it can later be connected here.
     */
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

    setProfileOpen(false);
    setMenuOpen(false);

    navigate('/login');
  };

  const MenuButton = ({
    icon,
    text,
    path,
    badge,
  }: {
    icon: React.ReactNode;
    text: string;
    path: string;
    badge?: string;
  }) => (
    <Button
      fullWidth
      onClick={() => go(path)}
      sx={{
        color: '#fff',
        justifyContent: 'flex-start',
        textTransform: 'none',
        borderRadius: 2,
        py: 1.2,
        px: 2,
        mb: 0.5,
        '&:hover': {
          background:
            'rgba(92,232,255,0.10)',
        },
      }}
    >
      <Box
        sx={{
          width: 38,
          display: 'flex',
          justifyContent: 'center',
          mr: 1,
          color: '#6edcff',
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          flexGrow: 1,
          textAlign: 'left',
          fontSize: 15,
          fontWeight: 600,
        }}
      >
        {text}
      </Typography>

      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={{
            color: '#fff',
            fontWeight: 800,
            background:
              badge === 'Premium'
                ? '#ffb900'
                : badge === 'Pro'
                ? '#c53cff'
                : badge === 'AI'
                ? '#08a9ed'
                : '#18e76b',
          }}
        />
      )}
    </Button>
  );

  const MenuSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Box sx={{ mt: 1 }}>
      <Typography
        sx={{
          color: '#8198df',
          fontSize: 11,
          fontWeight: 900,
          px: 2,
          py: 1,
          textTransform: 'uppercase',
          letterSpacing: 1,
        }}
      >
        {title}
      </Typography>

      <Box sx={{ px: 1 }}>
        {children}
      </Box>
    </Box>
  );

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
      {/* SIDE MENU */}

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{
          sx: {
            background: 'transparent',
          },
        }}
      >
        <Box
          sx={{
            width: {
              xs: '86vw',
              sm: 400,
            },
            maxWidth: 400,
            height: '100%',
            overflowY: 'auto',
            color: '#fff',
            background:
              'linear-gradient(180deg,#050d35,#0b1d68,#102e86)',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              px: 2,
              py: 2,
              borderBottom:
                '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                Global Digital Market
              </Typography>

              <Typography
                sx={{
                  color: '#7fa0ff',
                  fontSize: 9,
                  letterSpacing: 1,
                }}
              >
                PROFESSIONAL DIGITAL ASSET PLATFORM
              </Typography>
            </Box>

            <IconButton
              onClick={() => setMenuOpen(false)}
              sx={{ color: '#fff' }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* USER PROFILE MINI CARD */}

          <Box
            sx={{
              mx: 2,
              mt: 2,
              mb: 1,
              p: 2,
              borderRadius: 3,
              background:
                'linear-gradient(135deg,rgba(40,78,190,0.55),rgba(11,27,82,0.75))',
              border:
                '1px solid rgba(105,160,255,0.22)',
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  fontWeight: 900,
                  background:
                    'linear-gradient(135deg,#1bdcff,#2465ff)',
                }}
              >
                {initials}
              </Avatar>

              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontWeight: 800,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {displayName}
                </Typography>

                <Typography
                  sx={{
                    color: '#91a7e9',
                    fontSize: 11,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {profile.email ||
                    'Account profile'}
                </Typography>
              </Box>
            </Stack>

            <Button
              fullWidth
              startIcon={<PersonOutlineIcon />}
              onClick={() => {
                setMenuOpen(false);
                setProfileOpen(true);
              }}
              sx={{
                mt: 1.5,
                color: '#fff',
                textTransform: 'none',
                border:
                  '1px solid rgba(120,190,255,0.35)',
              }}
            >
              View Account Profile
            </Button>
          </Box>

          <MenuSection title="Overview">
            <MenuButton
              icon={<DashboardIcon />}
              text="Dashboard"
              path="/"
            />

            <MenuButton
              icon={<ReceiptLongIcon />}
              text="Account Statement"
              path="/statement"
            />
          </MenuSection>

          <MenuSection title="Portfolio & Investments">
            <MenuButton
              icon={<TrackChangesIcon />}
              text="Investment Plans"
              path="/investment-plans"
            />

            <MenuButton
              icon={<PieChartIcon />}
              text="My Portfolio"
              path="/portfolio"
            />

            <MenuButton
              icon={<ShowChartIcon />}
              text="Performance History"
              path="/performance"
            />
          </MenuSection>

          <MenuSection title="Trading & Markets">
            <MenuButton
              icon={<CandlestickChartIcon />}
              text="Live Markets"
              path="/market"
              badge="Live"
            />

            <MenuButton
              icon={<PeopleIcon />}
              text="Copy Trading"
              path="/copy-trading"
              badge="Pro"
            />

            <MenuButton
              icon={<SmartToyIcon />}
              text="AI Trading Bots"
              path="/ai-trading"
              badge="AI"
            />
          </MenuSection>

          <MenuSection title="Market Intelligence">
            <MenuButton
              icon={<BoltIcon />}
              text="Premium Signals"
              path="/signals"
              badge="Premium"
            />
          </MenuSection>

          <MenuSection title="Wallet & Funds">
            <MenuButton
              icon={<AddCircleOutlineIcon />}
              text="Deposit Funds"
              path="/wallet"
            />

            <MenuButton
              icon={<RemoveCircleOutlineIcon />}
              text="Withdraw Funds"
              path="/wallet"
            />

            <MenuButton
              icon={<SwapHorizIcon />}
              text="Internal Transfer"
              path="/wallet"
            />
          </Section>

          <MenuSection title="Financing">
            <MenuButton
              icon={<CreditCardIcon />}
              text="Fast Credit"
              path="/wallet"
              badge="Fast"
            />
          </MenuSection>

          <MenuSection title="Account">
            <MenuButton
              icon={<PersonOutlineIcon />}
              text="Account Profile"
              path="/profile"
            />

            <MenuButton
              icon={<SettingsIcon />}
              text="Settings"
              path="/settings"
            />

            <MenuButton
              icon={<SecurityIcon />}
              text="Security"
              path="/security"
            />

            <MenuButton
              icon={<LanguageIcon />}
              text="Language"
              path="/language"
            />

            <MenuButton
              icon={<HelpOutlineIcon />}
              text="Help & Support"
              path="/support"
            />
          </MenuSection>

          <Box
            sx={{
              px: 2,
              mt: 2,
              mb: 3,
            }}
          >
            <Button
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              sx={{
                color: '#ff8297',
                textTransform: 'none',
                border:
                  '1px solid rgba(255,100,130,0.25)',
                borderRadius: 2,
                py: 1.2,
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* TOP BAR */}

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
        <Container maxWidth="xl">
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ py: 1.5 }}
          >
            <IconButton
              onClick={() => setMenuOpen(true)}
              sx={{
                color: '#fff',
                background:
                  'rgba(60,90,220,0.25)',
                '&:hover': {
                  background:
                    'rgba(60,90,220,0.45)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: 17,
                    sm: 21,
                  },
                  fontWeight: 900,
                }}
              >
                Global Digital Market
              </Typography>

              <Typography
                sx={{
                  color: '#7691e5',
                  fontSize: 9,
                  letterSpacing: 1,
                }}
              >
                PROFESSIONAL DIGITAL ASSET PLATFORM
              </Typography>
            </Box>

            {/* PROFILE BUTTON */}

            <Button
              onClick={() =>
                setProfileOpen(true)
              }
              sx={{
                color: '#fff',
                minWidth: 0,
                textTransform: 'none',
                p: 0.5,
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Avatar
                  sx={{
                    width: 38,
                    height: 38,
                    fontSize: 14,
                    fontWeight: 900,
                    background:
                      'linear-gradient(135deg,#19d8ff,#285cff)',
                  }}
                >
                  {initials}
                </Avatar>

                <Box
                  sx={{
                    display: {
                      xs: 'none',
                      sm: 'block',
                    },
                    textAlign: 'left',
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 13,
                      fontWeight: 800,
                      maxWidth: 130,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {displayName}
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 9,
                      color: '#7894e8',
                    }}
                  >
                    ACCOUNT
                  </Typography>
                </Box>
              </Stack>
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* MAIN */}

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 3,
            md: 5,
          },
        }}
      >
        {/* PAGE TITLE */}

        <Stack
          direction={{
            xs: 'column',
            md: 'row',
          }}
          justifyContent="space-between"
          alignItems={{
            xs: 'flex-start',
            md: 'center',
          }}
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: {
                  xs: 30,
                  md: 42,
                },
                fontWeight: 900,
                letterSpacing: -1,
              }}
            >
              Dashboard
            </Typography>

            <Typography
              sx={{
                color: '#8ea4e8',
                mt: 0.5,
              }}
            >
              Welcome back, {displayName}.
            </Typography>
          </Box>

          <Button
            variant="outlined"
            startIcon={<PersonOutlineIcon />}
            onClick={() =>
              setProfileOpen(true)
            }
            sx={{
              color: '#fff',
              borderColor:
                'rgba(110,190,255,0.45)',
              textTransform: 'none',
              fontWeight: 700,
              borderRadius: 2,
            }}
          >
            Account Profile
          </Button>
        </Stack>

        {/* ERROR */}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
              borderRadius: 2,
            }}
            action={
              <Button
                color="inherit"
                size="small"
                onClick={() =>
                  navigate('/login')
                }
              >
                Login
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        {/* WELCOME HERO */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            overflow: 'hidden',
            background:
              'radial-gradient(circle at 90% 20%,rgba(92,232,255,0.24),transparent 25%), linear-gradient(135deg,#10216d 0%,#154ec7 60%,#087fda 100%)',
            border:
              '1px solid rgba(130,190,255,0.28)',
            boxShadow:
              '0 20px 60px rgba(0,0,0,0.25)',
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2.5,
                md: 4,
              },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1.5fr 0.8fr',
                },
                gap: 4,
                alignItems: 'center',
              }}
            >
              <Box>
                <Chip
                  icon={
                    <VerifiedUserIcon
                      sx={{
                        color:
                          '#58f39b !important',
                      }}
                    />
                  }
                  label="Secure Account"
                  size="small"
                  sx={{
                    color: '#fff',
                    background:
                      'rgba(0,0,0,0.18)',
                    mb: 2,
                    fontWeight: 700,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: {
                      xs: 27,
                      md: 38,
                    },
                    fontWeight: 900,
                    lineHeight: 1.15,
                  }}
                >
                  Your trading workspace
                </Typography>

                <Typography
                  sx={{
                    color: '#c7d7ff',
                    mt: 1.5,
                    maxWidth: 650,
                    lineHeight: 1.7,
                  }}
                >
                  Monitor your account, access
                  live markets, manage your wallet,
                  and continue building your
                  investment strategy from one
                  secure workspace.
                </Typography>

                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={1.5}
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="contained"
                    startIcon={
                      <CandlestickChartIcon />
                    }
                    onClick={() =>
                      navigate('/market')
                    }
                    sx={{
                      color: '#041033',
                      background:
                        '#5ce8ff',
                      textTransform: 'none',
                      fontWeight: 900,
                      '&:hover': {
                        background:
                          '#8ef0ff',
                      },
                    }}
                  >
                    Explore Markets
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={
                      <AccountBalanceWalletIcon />
                    }
                    onClick={() =>
                      navigate('/wallet')
                    }
                    sx={{
                      color: '#fff',
                      borderColor:
                        'rgba(255,255,255,0.5)',
                      textTransform: 'none',
                      fontWeight: 800,
                    }}
                  >
                    Open Wallet
                  </Button>
                </Stack>
              </Box>

              {/* DECORATIVE MARKET PANEL */}

              <Box
                sx={{
                  display: {
                    xs: 'none',
                    md: 'flex',
                  },
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 260,
                    height: 190,
                    borderRadius: 5,
                    position: 'relative',
                    overflow: 'hidden',
                    background:
                      'linear-gradient(145deg,rgba(4,15,65,0.65),rgba(9,39,120,0.65))',
                    border:
                      '1px solid rgba(130,210,255,0.22)',
                  }}
                >
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 20,
                      right: 20,
                      bottom: 35,
                      height: 2,
                      background:
                        'rgba(255,255,255,0.14)',
                    }}
                  />

                  {[55, 90
