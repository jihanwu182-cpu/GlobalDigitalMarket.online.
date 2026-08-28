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

  // ============================================================
  // LOAD PROFILE
  // ============================================================

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

      // Safely read JWT payload when available.
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
          // Invalid JWT payload. Continue without it.
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
        'Unable to load profile:',
        err
      );
    }
  };

  // ============================================================
  // LOAD REAL ACCOUNT BALANCE
  // ============================================================

  const loadAccount = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get(
        '/portfolio/performance'
      );

      const data = response.data || {};

      /*
       * Only the backend balance is displayed.
       *
       * No fake:
       * - portfolio value
       * - profits
       * - gains
       * - bonuses
       * - buying power
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

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadProfile();
    loadAccount();
  }, []);

  // ============================================================
  // FORMATTING
  // ============================================================

  const money = (value: number) => {
    if (!Number.isFinite(value)) {
      return '$0.00';
    }

    return `$${value.toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const displayName = useMemo(() => {
    if (profile.name) {
      return profile.name;
    }

    if (profile.username) {
      return profile.username;
    }

    return 'Account Holder';
  }, [
    profile.name,
    profile.username,
  ]);

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

      if (parts[0]?.[0]) {
        return parts[0][0].toUpperCase();
      }
    }

    if (profile.username) {
      return profile.username
        .slice(0, 2)
        .toUpperCase();
    }

    return 'A';
  }, [
    profile.name,
    profile.username,
  ]);

  // ============================================================
  // NAVIGATION
  // ============================================================

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  // ============================================================
  // LOGOUT
  // ============================================================

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

    keys.forEach((key) => {
      localStorage.removeItem(key);
    });

    setProfileOpen(false);
    setMenuOpen(false);

    navigate('/login');
  };

  // ============================================================
  // MENU BUTTON
  // ============================================================

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
                : badge === 'Fast'
                ? '#ff8a00'
                : '#18e76b',
          }}
        />
      )}
    </Button>
  );

  // ============================================================
  // MENU SECTION
  // ============================================================

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
      {/* ======================================================
          SIDE MENU
      ====================================================== */}

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
          {/* MENU HEADER */}

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
              onClick={() =>
                setMenuOpen(false)
              }
              sx={{ color: '#fff' }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* USER PROFILE CARD */}

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
              startIcon={
                <PersonOutlineIcon />
              }
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

          {/* OVERVIEW */}

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

          {/* PORTFOLIO */}

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

          {/* TRADING */}

          <MenuSection title="Trading & Markets">
            <MenuButton
              icon={
                <CandlestickChartIcon />
              }
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

          {/* INTELLIGENCE */}

          <MenuSection title="Market Intelligence">
            <MenuButton
              icon={<BoltIcon />}
              text="Premium Signals"
              path="/signals"
              badge="Premium"
            />
          </MenuSection>

          {/* WALLET */}

          <MenuSection title="Wallet & Funds">
            <MenuButton
              icon={
                <AddCircleOutlineIcon />
              }
              text="Deposit Funds"
              path="/wallet"
            />

            <MenuButton
              icon={
                <RemoveCircleOutlineIcon />
              }
              text="Withdraw Funds"
              path="/wallet"
            />

            <MenuButton
              icon={<SwapHorizIcon />}
              text="Internal Transfer"
              path="/wallet"
            />
          </MenuSection>

          {/* FINANCING */}

          <MenuSection title="Financing">
            <MenuButton
              icon={<CreditCardIcon />}
              text="Fast Credit"
              path="/wallet"
              badge="Fast"
            />
          </MenuSection>

          {/* ACCOUNT */}

          <MenuSection title="Account">
            <MenuButton
              icon={
                <PersonOutlineIcon />
              }
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

          {/* LOGOUT */}

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

                '&:hover': {
                  background:
                    'rgba(255,70,100,0.08)',
                },
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
      </Drawer>

      {/* ======================================================
          TOP BAR
      ====================================================== */}

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
              onClick={() =>
                setMenuOpen(true)
              }
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

      {/* ======================================================
          MAIN
      ====================================================== */}

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
            startIcon={
              <PersonOutlineIcon />
            }
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

        {/* ====================================================
            ACCOUNT BALANCE
        ==================================================== */}

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
                  md: '1.4fr 0.8fr',
                },
                gap: 4,
                alignItems: 'center',
              }}
            >
              {/* BALANCE INFORMATION */}

              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
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
                      fontWeight: 700,
                    }}
                  />

                  <Chip
                    label="Live Account"
                    size="small"
                    sx={{
                      color: '#fff',
                      background:
                        'rgba(0,190,255,0.20)',
                      fontWeight: 700,
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    color: '#b9caff',
                    fontSize: 13,
                    fontWeight: 800,
                    letterSpacing: 1,
                  }}
                >
                  AVAILABLE BALANCE
                </Typography>

                {loading ? (
                  <CircularProgress
                    sx={{
                      color: '#fff',
                      mt: 2,
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: {
                        xs: 42,
                        md: 58,
                      },
                      fontWeight: 900,
                      lineHeight: 1.1,
                      mt: 1,
                    }}
                  >
                    {money(
                      account.availableBalance
                    )}
                  </Typography>
                )}

                <Typography
                  sx={{
                    color: '#c7d7ff',
                    mt: 1.5,
                    lineHeight: 1.6,
                  }}
                >
                  This balance is loaded directly
                  from your account data. No
                  simulated portfolio values are
                  displayed here.
                </Typography>

                {/* ACTIONS */}

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
                      <AddCircleOutlineIcon />
                    }
                    onClick={() =>
                      navigate('/wallet')
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
                    Deposit Funds
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={
                      <RemoveCircleOutlineIcon />
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
                    Withdraw Funds
                  </Button>
                </Stack>
              </Box>

              {/* SECURITY PANEL */}

              <Box
                sx={{
                  display: {
                    xs: 'none',
                    md: 'block',
                  },
                }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    color: '#fff',
                    background:
                      'rgba(2,12,55,0.45)',
                    border:
                      '1px solid rgba(140,210,255,0.18)',
                    backdropFilter:
                      'blur(10px)',
                  }}
                >
                  <CardContent>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Avatar
                        sx={{
                          background:
                            'rgba(92,232,255,0.15)',
                          color:
                            '#5ce8ff',
                        }}
                      >
                        <LockOutlinedIcon />
                      </Avatar>

                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 900,
                          }}
                        >
                          Account Security
                        </Typography>

                        <Typography
                          sx={{
                            color:
                              '#8fa9ed',
                            fontSize: 11,
                          }}
                        >
                          Your account workspace
                        </Typography>
                      </Box>
                    </Stack>

                    <Divider
                      sx={{
                        borderColor:
                          'rgba(255,255,255,0.10)',
                        mb: 2,
                      }}
                    />

                    <Stack spacing={1.5}>
                      <SecurityRow
                        icon={
                          <VerifiedUserIcon />
                        }
                        title="Authenticated"
                        text="Your session is protected."
                      />

                      <SecurityRow
                        icon={
                          <AccountBalanceWalletIcon />
                        }
                        title="Account Balance"
                        text="Loaded from backend."
                      />

                      <SecurityRow
                        icon={
                          <LockOutlinedIcon />
                        }
                        title="Secure Access"
                        text="Authentication required."
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* ====================================================
            ACCOUNT INFORMATION
        ==================================================== */}

        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 900,
            mb: 2,
          }}
        >
          Account
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2,1fr)',
              lg: 'repeat(3,1fr)',
            },
            gap: 2,
            mb: 3,
          }}
        >
          <InfoCard
            icon={
              <PersonOutlineIcon />
            }
            title="Account Profile"
            text={
              profile.email ||
              'Manage your personal account information.'
            }
            onClick={() =>
              setProfileOpen(true)
            }
          />

          <InfoCard
            icon={
              <SecurityIcon />
            }
            title="Security"
            text="Manage account security and authentication."
            onClick={() =>
              navigate('/security')
            }
          />

          <InfoCard
            icon={
              <SettingsIcon />
            }
            title="Settings"
            text="Manage your platform preferences."
            onClick={() =>
              navigate('/settings')
            }
          />
        </Box>

        {/* ====================================================
            WALLET & FUNDS
        ==================================================== */}

        <Card
          sx={{
            mb: 3,
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
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 900,
                  }}
                >
                  Wallet & Funds
                </Typography>

                <Typography
                  sx={{
                    color: '#8296e0',
                    fontSize: 13,
                    mt: 0.5,
                  }}
                >
                  Manage deposits, withdrawals and
                  internal transfers.
                </Typography>
              </Box>

              <AccountBalanceWalletIcon
                sx={{
                  fontSize: 42,
                  color: '#5ce8ff',
                }}
              />
            </Stack>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.5}
              sx={{ mt: 3 }}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={
                  <AddCircleOutlineIcon />
                }
                onClick={() =>
                  navigate('/wallet')
                }
                sx={{
                  py: 1.4,
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Deposit Funds
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <RemoveCircleOutlineIcon />
                }
                onClick={() =>
                  navigate('/wallet')
                }
                sx={{
                  py: 1.4,
                  color: '#fff',
                  borderColor:
                    '#66dcff',
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Withdraw Funds
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <SwapHorizIcon />
                }
                onClick={() =>
                  navigate('/wallet')
                }
                sx={{
                  py: 1.4,
                  color: '#fff',
                  borderColor:
                    '#66dcff',
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Internal Transfer
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* ====================================================
            LIVE MARKETS
        ==================================================== */}

        <Card
          sx={{
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(110deg,#1725a0,#1948ce,#078fe5)',
            border:
              '1px solid rgba(130,200,255,0.20)',
            overflow: 'hidden',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              justifyContent="space-between"
              alignItems={{
                xs: 'flex-start',
                sm: 'center',
              }}
              spacing={2}
            >
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                >
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 900,
                    }}
                  >
                    Live Markets
                  </Typography>

                  <Chip
                    label="LIVE"
                    size="small"
                    sx={{
                      color: '#fff',
                      background:
                        '#18e76b',
                      fontWeight: 900,
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    color: '#c1d7ff',
                    fontSize: 12,
                    mt: 0.5,
                  }}
                >
                  View live market prices and
                  charts.
                </Typography>
              </Box>

              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardIcon />
                }
                startIcon={
                  <CandlestickChartIcon />
                }
                onClick={() =>
                  navigate('/market')
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                View Live Markets
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>

      {/* ======================================================
          ACCOUNT PROFILE DIALOG
      ====================================================== */}

      <Dialog
        open={profileOpen}
        onClose={() =>
          setProfileOpen(false)
        }
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(145deg,#0b1b5a,#07113b)',
            border:
              '1px solid rgba(110,190,255,0.25)',
          },
        }}
      >
        <DialogTitle>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              Account Profile
            </Typography>

            <IconButton
              onClick={() =>
                setProfileOpen(false)
              }
              sx={{
                color: '#fff',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          <Stack
            alignItems="center"
            spacing={2}
            sx={{ py: 2 }}
          >
            <Avatar
              sx={{
                width: 90,
                height: 90,
                fontSize: 30,
                fontWeight: 900,
                background:
                  'linear-gradient(135deg,#19d8ff,#285cff)',
                boxShadow:
                  '0 10px 35px rgba(20,120,255,0.35)',
              }}
            >
              {initials}
            </Avatar>

            <Typography
              sx={{
                fontSize: 25,
                fontWeight: 900,
              }}
            >
              {displayName}
            </Typography>

            {profile.email && (
              <Typography
                sx={{
                  color: '#91a7e9',
                }}
              >
                {profile.email}
              </Typography>
            )}
          </Stack>

          <Divider
            sx={{
              my: 2,
              borderColor:
                'rgba(255,255,255,0.10)',
            }}
          />

          <Stack spacing={1.5}>
            <ProfileRow
              title="Full Name"
              value={
                profile.name || 'Not available'
              }
            />

            <ProfileRow
              title="Username"
              value={
                profile.username ||
                'Not available'
              }
            />

            <ProfileRow
              title="Email"
              value={
                profile.email ||
                'Not available'
              }
            />

            <ProfileRow
              title="Account ID"
              value={
                profile.accountId ||
                'Not available'
              }
            />

            <ProfileRow
              title="Available Balance"
              value={
                loading
                  ? 'Loading...'
                  : money(
                      account.availableBalance
                    )
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: 3,
            pt: 1,
          }}
        >
          <Button
            onClick={() =>
              setProfileOpen(false)
            }
            sx={{
              color: '#fff',
              textTransform: 'none',
            }}
          >
            Close
          </Button>

          <Button
            variant="contained"
            startIcon={<SettingsIcon />}
            onClick={() => {
              setProfileOpen(false);
              navigate('/settings');
            }}
            sx={{
              textTransform: 'none',
              fontWeight: 800,
            }}
          >
            Account Settings
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// ============================================================
// SECURITY ROW
// ============================================================

interface SecurityRowProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const SecurityRow: React.FC<
  SecurityRowProps
> = ({
  icon,
  title,
  text,
}) => (
  <Stack
    direction="row"
    spacing={1.5}
    alignItems="center"
  >
    <Box
      sx={{
        color: '#5ce8ff',
        display: 'flex',
      }}
    >
      {icon}
    </Box>

    <Box>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 800,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: '#8198df',
          fontSize: 10,
        }}
      >
        {text}
      </Typography>
    </Box>
  </Stack>
);

// ============================================================
// INFORMATION CARD
// ============================================================

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
  onClick: () => void;
}

const InfoCard: React.FC<
  InfoCardProps
> = ({
  icon,
  title,
  text,
  onClick,
}) => (
  <Card
    onClick={onClick}
    sx={{
      borderRadius: 3,
      color: '#fff',
      background:
        'linear-gradient(145deg,#11246f,#08164c)',
      border:
        '1px solid rgba(100,150,255,0.2)',
      cursor: 'pointer',
      transition:
        'transform 0.2s ease, border-color 0.2s ease',

      '&:hover': {
        transform: 'translateY(-3px)',
        borderColor:
          'rgba(92,232,255,0.45)',
      },
    }}
  >
    <CardContent>
      <Box
        sx={{
          color: '#5ce8ff',
          mb: 1,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 900,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: '#8296e0',
          fontSize: 12,
          mt: 0.7,
          lineHeight: 1.6,
        }}
      >
        {text}
      </Typography>

      <Button
        endIcon={<ArrowForwardIcon />}
        sx={{
          mt: 1.5,
          p: 0,
          color: '#5ce8ff',
          textTransform: 'none',
          fontWeight: 800,
        }}
      >
        Open
      </Button>
    </CardContent>
  </Card>
);

// ============================================================
// PROFILE ROW
// ============================================================

interface ProfileRowProps {
  title: string;
  value: string;
}

const ProfileRow: React.FC<
  ProfileRowProps
> = ({
  title,
  value,
}) => (
  <Box
    sx={{
      p: 1.7,
      borderRadius: 2,
      background:
        'rgba(255,255,255,0.04)',
      border:
        '1px solid rgba(255,255,255,0.06)',
    }}
  >
    <Typography
      sx={{
        color: '#8198df',
        fontSize: 10,
        fontWeight: 800,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
      }}
    >
      {title}
    </Typography>

    <Typography
      sx={{
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
        mt: 0.5,
        wordBreak: 'break-word',
      }}
    >
      {value}
    </Typography>
  </Box>
);

export default Dashboard;
