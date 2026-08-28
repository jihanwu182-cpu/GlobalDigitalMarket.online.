import React, {
  useEffect,
  useMemo,
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

/* ============================================================
   MENU BUTTON
============================================================ */

interface MenuButtonProps {
  icon: React.ReactNode;
  text: string;
  badge?: string;
  onClick: () => void;
}

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  text,
  badge,
  onClick,
}) => {
  return (
    <Button
      fullWidth
      onClick={onClick}
      sx={{
        color: '#ffffff',
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
          fontSize: 14,
          fontWeight: 700,
        }}
      >
        {text}
      </Typography>

      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={{
            color: '#ffffff',
            fontSize: 9,
            fontWeight: 900,
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
};

/* ============================================================
   MENU SECTION
============================================================ */

interface MenuSectionProps {
  title: string;
  children: React.ReactNode;
}

const MenuSection: React.FC<MenuSectionProps> = ({
  title,
  children,
}) => {
  return (
    <Box sx={{ mt: 1 }}>
      <Typography
        sx={{
          color: '#8198df',
          fontSize: 10,
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
};

/* ============================================================
   INFORMATION CARD
============================================================ */

interface InfoCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  onClick: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  description,
  badge,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: 'pointer',
        borderRadius: 3,
        color: '#ffffff',
        background:
          'linear-gradient(145deg,#11246f,#08164c)',
        border:
          '1px solid rgba(100,150,255,0.20)',
        transition:
          'transform 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor:
            'rgba(92,232,255,0.45)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5ce8ff',
              background:
                'rgba(92,232,255,0.10)',
              mb: 2,
            }}
          >
            {icon}
          </Box>

          {badge && (
            <Chip
              label={badge}
              size="small"
              sx={{
                color: '#ffffff',
                background:
                  'rgba(92,232,255,0.14)',
                fontSize: 9,
                fontWeight: 800,
              }}
            />
          )}
        </Stack>

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
            lineHeight: 1.6,
            mt: 0.8,
          }}
        >
          {description}
        </Typography>

        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={(event) => {
            event.stopPropagation();
            onClick();
          }}
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
};

/* ============================================================
   DASHBOARD
============================================================ */

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState('');

  const [account, setAccount] =
    useState<AccountData>({
      availableBalance: 0,
    });

  const [profile, setProfile] =
    useState<UserProfile>({
      name: '',
      email: '',
      username: '',
      accountId: '',
    });

  /* ==========================================================
     PROFILE
  ========================================================== */

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
        const value =
          localStorage.getItem(key);

        if (!value) {
          continue;
        }

        try {
          const parsed =
            JSON.parse(value);

          if (
            parsed &&
            typeof parsed === 'object'
          ) {
            storedUser = parsed;
            break;
          }
        } catch {
          continue;
        }
      }

      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('authToken');

      let tokenUser: any = null;

      if (token) {
        try {
          const parts =
            token.split('.');

          if (parts.length === 3) {
            const normalized =
              parts[1]
                .replace(/-/g, '+')
                .replace(/_/g, '/');

            const decoded =
              decodeURIComponent(
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

            tokenUser =
              JSON.parse(decoded);
          }
        } catch {
          tokenUser = null;
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
    } catch (profileError) {
      console.error(
        'Profile loading error:',
        profileError
      );
    }
  };

  /* ==========================================================
     ACCOUNT BALANCE
  ========================================================== */

  const loadAccount = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await apiClient.get(
          '/portfolio/performance'
        );

      const data =
        response.data || {};

      const balance =
        Number(
          data.availableBalance
        );

      setAccount({
        availableBalance:
          Number.isFinite(balance)
            ? balance
            : 0,
      });
    } catch (accountError: any) {
      console.error(
        'Account loading error:',
        accountError
      );

      if (
        accountError?.response?.status ===
        401
      ) {
        setError(
          'Your login session has expired. Please login again.'
        );
      } else {
        setError(
          accountError?.response?.data
            ?.message ||
            accountError?.response?.data
              ?.error ||
            'Unable to load your account balance.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {
    loadProfile();
    loadAccount();
  }, []);

  /* ==========================================================
     DISPLAY HELPERS
  ========================================================== */

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
    const value =
      displayName.trim();

    if (!value) {
      return 'A';
    }

    const parts =
      value.split(/\s+/);

    if (parts.length >= 2) {
      return (
        parts[0][0] +
        parts[parts.length - 1][0]
      ).toUpperCase();
    }

    return value
      .slice(0, 2)
      .toUpperCase();
  }, [displayName]);

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const openProfile = () => {
    setMenuOpen(false);
    setProfileOpen(true);
  };

  /* ==========================================================
     LOGOUT
  ========================================================== */

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

    setMenuOpen(false);
    setProfileOpen(false);

    navigate('/login');
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#ffffff',
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
        onClose={() =>
          setMenuOpen(false)
        }
        PaperProps={{
          sx: {
            background: 'transparent',
          },
        }}
      >
        <Box
          sx={{
            width: {
              xs: '88vw',
              sm: 390,
            },
            maxWidth: 390,
            height: '100%',
            overflowY: 'auto',
            color: '#ffffff',
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
              sx={{
                color: '#ffffff',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* PROFILE CARD */}

          <Box
            sx={{
              mx: 2,
              mt: 2,
              mb: 2,
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
                    overflow: 'hidden',
                    textOverflow:
                      'ellipsis',
                    whiteSpace:
                      'nowrap',
                  }}
                >
                  {displayName}
                </Typography>

                <Typography
                  sx={{
                    color: '#91a7e9',
                    fontSize: 11,
                    overflow: 'hidden',
                    textOverflow:
                      'ellipsis',
                    whiteSpace:
                      'nowrap',
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
              onClick={openProfile}
              sx={{
                mt: 1.5,
                color: '#ffffff',
                textTransform:
                  'none',
                border:
                  '1px solid rgba(120,190,255,0.35)',
              }}
            >
              View Account Profile
            </Button>
          </Box>

          {/* ==================================================
              OVERVIEW
          ================================================== */}

          <MenuSection title="Overview">
            <MenuButton
              icon={
                <DashboardIcon />
              }
              text="Dashboard"
              onClick={() =>
                go('/')
              }
            />

            <MenuButton
              icon={
                <ReceiptLongIcon />
              }
              text="Account Statement"
              onClick={() =>
                go('/statement')
              }
            />
          </MenuSection>

          {/* ==================================================
              PORTFOLIO & INVESTMENTS
          ================================================== */}

          <MenuSection
            title="Portfolio & Investments"
          >
            <MenuButton
              icon={
                <TrackChangesIcon />
              }
              text="Investment Plans"
              onClick={() =>
                go('/investment-plans')
              }
            />

            <MenuButton
              icon={
                <PieChartIcon />
              }
              text="My Portfolio"
              onClick={() =>
                go('/portfolio')
              }
            />

            <MenuButton
              icon={
                <ShowChartIcon />
              }
              text="Performance History"
              onClick={() =>
                go('/performance')
              }
            />
          </MenuSection>

          {/* ==================================================
              TRADING & MARKETS
          ================================================== */}

          <MenuSection
            title="Trading & Markets"
          >
            <MenuButton
              icon={
                <CandlestickChartIcon />
              }
              text="Live Markets"
              badge="Live"
              onClick={() =>
                go('/market')
              }
            />

            <MenuButton
              icon={
                <PeopleIcon />
              }
              text="Copy Trading"
              badge="Pro"
              onClick={() =>
                go('/copy-trading')
              }
            />

            <MenuButton
              icon={
                <SmartToyIcon />
              }
              text="AI Trading Bots"
              badge="AI"
              onClick={() =>
                go('/ai-trading')
              }
            />
          </MenuSection>

          {/* ==================================================
              MARKET INTELLIGENCE
          ================================================== */}

          <MenuSection
            title="Market Intelligence"
          >
            <MenuButton
              icon={<BoltIcon />}
              text="Premium Signals"
              badge="Premium"
              onClick={() =>
                go('/signals')
              }
            />
          </MenuSection>

          {/* ==================================================
              WALLET & FUNDS
          ================================================== */}

          <MenuSection
            title="Wallet & Funds"
          >
            <MenuButton
              icon={
                <AddCircleOutlineIcon />
              }
              text="Deposit Funds"
              onClick={() =>
                go('/wallet')
              }
            />

            <MenuButton
              icon={
                <RemoveCircleOutlineIcon />
              }
              text="Withdraw Funds"
              onClick={() =>
                go('/wallet')
              }
            />

            <MenuButton
              icon={
                <SwapHorizIcon />
              }
              text="Internal Transfer"
              onClick={() =>
                go('/wallet')
              }
            />
          </MenuSection>

          {/* ==================================================
              FINANCING
          ================================================== */}

          <MenuSection title="Financing">
            <MenuButton
              icon={
                <CreditCardIcon />
              }
              text="Fast Credit"
              badge="Fast"
              onClick={() =>
                go('/wallet')
              }
            />
          </MenuSection>

          {/* ==================================================
              ACCOUNT
          ================================================== */}

          <MenuSection title="Account">
            <MenuButton
              icon={
                <PersonOutlineIcon />
              }
              text="Account Profile"
              onClick={openProfile}
            />

            <MenuButton
              icon={
                <SettingsIcon />
              }
              text="Settings"
              onClick={() =>
                go('/settings')
              }
            />

            <MenuButton
              icon={
                <SecurityIcon />
              }
              text="Security"
              onClick={() =>
                go('/security')
              }
            />

            <MenuButton
              icon={
                <LanguageIcon />
              }
              text="Language"
              onClick={() =>
                go('/language')
              }
            />

            <MenuButton
              icon={
                <HelpOutlineIcon />
              }
              text="Help & Support"
              onClick={() =>
                go('/support')
              }
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
              startIcon={
                <LogoutIcon />
              }
              onClick={handleLogout}
              sx={{
                color: '#ff8297',
                textTransform:
                  'none',
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
          backdropFilter:
            'blur(14px)',
          borderBottom:
            '1px solid rgba(125,150,255,0.18)',
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{
              py: 1.5,
            }}
          >
            <IconButton
              onClick={() =>
                setMenuOpen(true)
              }
              sx={{
                color: '#ffffff',
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

            <Button
              onClick={() =>
                setProfileOpen(true)
              }
              sx={{
                color: '#ffffff',
                minWidth: 0,
                p: 0.5,
              }}
            >
              <Avatar
                sx={{
                  width: 40,
                  height: 40,
                  fontSize: 14,
                  fontWeight: 900,
                  background:
                    'linear-gradient(135deg,#19d8ff,#285cff)',
                }}
              >
                {initials}
              </Avatar>
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ======================================================
          MAIN CONTENT
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
        {/* HEADER */}

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
          sx={{
            mb: 3,
          }}
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
                fontSize: 14,
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
              color: '#ffffff',
              borderColor:
                'rgba(110,190,255,0.45)',
              textTransform:
                'none',
              fontWeight: 800,
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
            color: '#ffffff',
            overflow: 'hidden',
            background:
              'radial-gradient(circle at 90% 20%,rgba(92,232,255,0.22),transparent 28%), linear-gradient(135deg,#10216d 0%,#154ec7 60%,#087fda 100%)',
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
            <Stack
              direction={{
                xs: 'column',
                md: 'row',
              }}
              justifyContent="space-between"
              spacing={4}
            >
              <Box>
                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
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
                      color: '#ffffff',
                      background:
                        'rgba(0,0,0,0.18)',
                      fontWeight: 700,
                    }}
                  />

                  <Chip
                    label="Account Balance"
                    size="small"
                    sx={{
                      color: '#ffffff',
                      background:
                        'rgba(0,190,255,0.20)',
                      fontWeight: 700,
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    color: '#b9caff',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                  }}
                >
                  AVAILABLE BALANCE
                </Typography>

                {loading ? (
                  <CircularProgress
                    sx={{
                      color: '#ffffff',
                      mt: 2,
                    }}
                  />
                ) : (
                  <Typography
                    sx={{
                      fontSize: {
                        xs: 40,
                        sm: 50,
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
                    maxWidth: 680,
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  Your available balance is
                  retrieved from your account
                  data. No simulated portfolio
                  values or artificial profits are
                  displayed.
                </Typography>

                {/* ACTION BUTTONS */}

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
                      go('/wallet')
                    }
                    sx={{
                      color: '#041033',
                      background:
                        '#5ce8ff',
                      textTransform:
                        'none',
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
                      go('/wallet')
                    }
                    sx={{
                      color: '#ffffff',
                      borderColor:
                        'rgba(255,255,255,0.5)',
                      textTransform:
                        'none',
                      fontWeight: 800,
                    }}
                  >
                    Withdraw Funds
                  </Button>

                  <Button
                    variant="outlined"
                    startIcon={
                      <SwapHorizIcon />
                    }
                    onClick={() =>
                      go('/wallet')
                    }
                    sx={{
                      color: '#ffffff',
                      borderColor:
                        'rgba(255,255,255,0.5)',
                      textTransform:
                        'none',
                      fontWeight: 800,
                    }}
                  >
                    Transfer
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
                  minWidth: 300,
                }}
              >
                <Card
                  sx={{
                    borderRadius: 4,
                    color: '#ffffff',
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
                      spacing={1.5}
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
                          Protected workspace
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
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <VerifiedUserIcon
                          sx={{
                            color:
                              '#4df28d',
                            fontSize: 20,
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: 13,
                          }}
                        >
                          Authenticated account
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <LockOutlinedIcon
                          sx={{
                            color:
                              '#5ce8ff',
                            fontSize: 20,
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: 13,
                          }}
                        >
                          Secure access
                        </Typography>
                      </Stack>

                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                      >
                        <AccountBalanceWalletIcon
                          sx={{
                            color:
                              '#5ce8ff',
                            fontSize: 20,
                          }}
                        />

                        <Typography
                          sx={{
                            fontSize: 13,
                          }}
                        >
                          Balance connected
                        </Typography>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* ====================================================
            PORTFOLIO & INVESTMENTS
        ==================================================== */}

        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 900,
            mb: 2,
          }}
        >
          Portfolio & Investments
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
            mb: 4,
          }}
        >
          <InfoCard
            icon={
              <TrackChangesIcon />
            }
            title="Investment Plans"
            description="Explore and manage the investment plans available on your account."
            onClick={() =>
              go('/investment-plans')
            }
          />

          <InfoCard
            icon={
              <PieChartIcon />
            }
            title="My Portfolio"
            description="Review your actual portfolio and holdings information."
            onClick={() =>
              go('/portfolio')
            }
          />

          <InfoCard
            icon={
              <ShowChartIcon />
            }
            title="Performance History"
            description="Review account performance information when available."
            onClick={() =>
              go('/performance')
            }
          />
        </Box>

        {/* ====================================================
            TRADING & MARKETS
        ==================================================== */}

        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 900,
            mb: 2,
          }}
        >
          Trading & Markets
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
            mb: 4,
          }}
        >
          <InfoCard
            icon={
              <CandlestickChartIcon />
            }
            title="Live Markets"
            description="Open the market workspace. Market data will only be displayed when connected to a genuine data source."
            badge="Data"
            onClick={() =>
              go('/market')
            }
          />

          <InfoCard
            icon={<PeopleIcon />}
            title="Copy Trading"
            description="Access the copy trading workspace when this service is enabled."
            badge="Pro"
            onClick={() =>
              go('/copy-trading')
            }
          />

          <InfoCard
            icon={
              <SmartToyIcon />
            }
            title="AI Trading Bots"
            description="Access automated trading tools when the service is connected."
            badge="AI"
            onClick={() =>
              go('/ai-trading')
            }
          />
        </Box>

        {/* ====================================================
            MARKET INTELLIGENCE
        ==================================================== */}

        <Card
          sx={{
            mb: 4,
            borderRadius: 4,
            color: '#ffffff',
            background:
              'linear-gradient(135deg,#111c63,#192eaa,#1269ce)',
            border:
              '1px solid rgba(130,190,255,0.22)',
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
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
              >
                <Avatar
                  sx={{
                    background:
                      'rgba(255,255,255,0.10)',
                    color: '#5ce8ff',
                  }}
                >
                  <BoltIcon />
                </Avatar>

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
                      Premium Signals
                    </Typography>

                    <Chip
                      label="PREMIUM"
                      size="small"
                      sx={{
                        color: '#ffffff',
                        background:
                          '#ffb900',
                        fontSize: 9,
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
                    Market intelligence tools
                    can be connected here when
                    the appropriate data service is
                    available.
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardIcon />
                }
                onClick={() =>
                  go('/signals')
                }
                sx={{
                  textTransform:
                    'none',
                  fontWeight: 800,
                }}
              >
                Premium Signals
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* ====================================================
            WALLET & FUNDS
        ==================================================== */}

        <
