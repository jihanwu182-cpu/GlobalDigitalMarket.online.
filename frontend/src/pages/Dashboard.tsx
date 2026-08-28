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
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PieChartIcon from '@mui/icons-material/PieChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SecurityIcon from '@mui/icons-material/Security';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface UserProfile {
  name: string;
  email: string;
  username: string;
  accountId: string;
}

interface AccountData {
  availableBalance: number;
}

interface QuickCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

const QuickCard: React.FC<QuickCardProps> = ({
  icon,
  title,
  description,
  onClick,
}) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        height: '100%',
        cursor: 'pointer',
        borderRadius: 3,
        color: '#fff',
        background:
          'linear-gradient(145deg,#101f63,#08143f)',
        border:
          '1px solid rgba(100,150,255,0.20)',
        transition: 'transform 0.2s ease',
        '&:hover': {
          transform: 'translateY(-3px)',
          borderColor:
            'rgba(92,232,255,0.45)',
        },
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
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
            color: '#8198df',
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

  const loadProfile = () => {
    try {
      const keys = [
        'user',
        'currentUser',
        'authUser',
        'profile',
      ];

      let storedUser: any = null;

      for (const key of keys) {
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
        localStorage.getItem(
          'accessToken'
        ) ||
        localStorage.getItem(
          'authToken'
        );

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
              atob(normalized);

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

      setProfile({
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
      });
    } catch (profileError) {
      console.error(
        'Profile loading error:',
        profileError
      );
    }
  };

  const loadAccount =
    async () => {
      try {
        setLoading(true);
        setError('');

        const response =
          await apiClient.get(
            '/portfolio/performance'
          );

        const data =
          response.data || {};

        const balance = Number(
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
          accountError?.response
            ?.status === 401
        ) {
          setError(
            'Your login session has expired. Please login again.'
          );
        } else {
          setError(
            accountError?.response
              ?.data?.message ||
              accountError?.response
                ?.data?.error ||
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

  const displayName =
    useMemo(() => {
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

  const initials =
    useMemo(() => {
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
          parts[
            parts.length - 1
          ][0]
        ).toUpperCase();
      }

      return value
        .slice(0, 2)
        .toUpperCase();
    }, [displayName]);

  const money = (
    value: number
  ) => {
    if (
      !Number.isFinite(value)
    ) {
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

  const logout = () => {
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

  const goWallet = () => {
    setMenuOpen(false);
    navigate('/wallet');
  };

  const goPortfolio = () => {
    setMenuOpen(false);
    navigate('/portfolio');
  };

  const goMarket = () => {
    setMenuOpen(false);
    navigate('/market');
  };

  const goTrading = () => {
    setMenuOpen(false);
    navigate('/trading');
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
      {/* MOBILE / DESKTOP MENU */}

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() =>
          setMenuOpen(false)
        }
        PaperProps={{
          sx: {
            background:
              'transparent',
          },
        }}
      >
        <Box
          sx={{
            width: {
              xs: '86vw',
              sm: 360,
            },
            maxWidth: 360,
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
                  fontSize: 19,
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
                ACCOUNT WORKSPACE
              </Typography>
            </Box>

            <IconButton
              onClick={() =>
                setMenuOpen(false)
              }
              sx={{
                color: '#fff',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* USER CARD */}

          <Box
            sx={{
              mx: 2,
              mt: 2,
              mb: 2,
              p: 2,
              borderRadius: 3,
              background:
                'rgba(30,65,160,0.55)',
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
                    'linear-gradient(135deg,#19d8ff,#285cff)',
                }}
              >
                {initials}
              </Avatar>

              <Box
                sx={{
                  minWidth: 0,
                }}
              >
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
                    'Account'}
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
                textTransform:
                  'none',
                border:
                  '1px solid rgba(120,190,255,0.35)',
              }}
            >
              View Profile
            </Button>
          </Box>

          {/* MAIN */}

          <Typography
            sx={{
              px: 2,
              py: 1,
              color: '#8198df',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            MAIN
          </Typography>

          {/* FIXED DASHBOARD ROUTE */}

          <MenuItem
            icon={<DashboardIcon />}
            text="Dashboard"
            onClick={() => {
              setMenuOpen(false);

              // IMPORTANT:
              // Dashboard must go to /dashboard,
              // not /
              navigate('/dashboard');
            }}
          />

          <MenuItem
            icon={
              <AccountBalanceWalletIcon />
            }
            text="Wallet & Funds"
            onClick={goWallet}
          />

          <MenuItem
            icon={<PieChartIcon />}
            text="Portfolio"
            onClick={goPortfolio}
          />

          <MenuItem
            icon={
              <CandlestickChartIcon />
            }
            text="Markets"
            onClick={goMarket}
          />

          <MenuItem
            icon={
              <CandlestickChartIcon />
            }
            text="Trading"
            onClick={goTrading}
          />

          <Divider
            sx={{
              my: 2,
              borderColor:
                'rgba(255,255,255,0.10)',
            }}
          />

          {/* ACCOUNT */}

          <Typography
            sx={{
              px: 2,
              py: 1,
              color: '#8198df',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            ACCOUNT
          </Typography>

          <MenuItem
            icon={
              <PersonOutlineIcon />
            }
            text="Profile"
            onClick={() => {
              setMenuOpen(false);
              setProfileOpen(true);
            }}
          />

          <MenuItem
            icon={<SecurityIcon />}
            text="Security"
            onClick={() => {
              setMenuOpen(false);
              setProfileOpen(true);
            }}
          />

          <MenuItem
            icon={<SettingsIcon />}
            text="Settings"
            onClick={() => {
              setMenuOpen(false);
              setProfileOpen(true);
            }}
          />

          <Box
            sx={{
              px: 2,
              mt: 2,
            }}
          >
            <Button
              fullWidth
              startIcon={
                <LogoutIcon />
              }
              onClick={logout}
              sx={{
                color: '#ff8297',
                border:
                  '1px solid rgba(255,100,130,0.25)',
                textTransform:
                  'none',
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
                color: '#fff',
                background:
                  'rgba(60,90,220,0.25)',
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box
              sx={{
                flexGrow: 1,
              }}
            >
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
                ACCOUNT WORKSPACE
              </Typography>
            </Box>

            <Button
              onClick={() =>
                setProfileOpen(true)
              }
              sx={{
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

      {/* DASHBOARD CONTENT */}

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 3,
            md: 5,
          },
        }}
      >
        <Box sx={{ mb: 3 }}>
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
            Welcome back, {displayName}
          </Typography>

          <Typography
            sx={{
              color: '#8ea4e8',
              mt: 0.7,
            }}
          >
            Your account workspace
          </Typography>
        </Box>

        {/* ERROR */}

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 3,
            }}
            action={
              <Button
                color="inherit"
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

        {/* BALANCE CARD */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
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
                xs: 2.5,
                md: 4,
              },
            }}
          >
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
                  color: '#fff',
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
                  mt: 1,
                }}
              >
                {money(
                  account.availableBalance
                )}
              </Typography>
            )}

            <Stack
              direction="row"
              spacing={1}
              sx={{
                mt: 2,
              }}
              flexWrap="wrap"
              useFlexGap
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
                label="Account Balance"
                size="small"
                sx={{
                  color: '#fff',
                  background:
                    'rgba(0,190,255,0.18)',
                  fontWeight: 700,
                }}
              />
            </Stack>

            <Typography
              sx={{
                color: '#c7d7ff',
                mt: 2,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              This amount is read from
              your account data. No fake
              portfolio value, profit or
              market chart is displayed.
            </Typography>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.5}
              sx={{
                mt: 3,
              }}
            >
              <Button
                variant="contained"
                startIcon={
                  <AddCircleOutlineIcon />
                }
                onClick={goWallet}
                sx={{
                  color: '#041033',
                  background: '#5ce8ff',
                  textTransform:
                    'none',
                  fontWeight: 900,
                }}
              >
                Deposit Funds
              </Button>

              <Button
                variant="outlined"
                startIcon={
                  <RemoveCircleOutlineIcon />
                }
                onClick={goWallet}
                sx={{
                  color: '#fff',
                  borderColor:
                    'rgba(255,255,255,0.5)',
                  textTransform:
                    'none',
                  fontWeight: 800,
                }}
              >
                Withdraw
              </Button>

              <Button
                variant="outlined"
                startIcon={
                  <SwapHorizIcon />
                }
                onClick={goWallet}
                sx={{
                  color: '#fff',
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
          </CardContent>
        </Card>

        {/* QUICK ACCESS */}

        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 900,
            mb: 2,
          }}
        >
          Quick Access
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2,1fr)',
              lg: 'repeat(4,1fr)',
            },
            gap: 2,
            mb: 3,
          }}
        >
          <QuickCard
            icon={
              <AccountBalanceWalletIcon />
            }
            title="Wallet"
            description="Manage your deposits, withdrawals and transfers."
            onClick={goWallet}
          />

          <QuickCard
            icon={
              <PieChartIcon />
            }
            title="Portfolio"
            description="View your actual portfolio information."
            onClick={goPortfolio}
          />

          <QuickCard
            icon={
              <CandlestickChartIcon />
            }
            title="Markets"
            description="Open the market section when genuine market data is connected."
            onClick={goMarket}
          />

          <QuickCard
            icon={
              <PersonOutlineIcon />
            }
            title="Profile"
            description="Review your account and profile information."
            onClick={() =>
              setProfileOpen(true)
            }
          />
        </Box>

        {/* PORTFOLIO */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(145deg,#101f63,#08143f)',
            border:
              '1px solid rgba(100,150,255,0.20)',
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
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 900,
                  }}
                >
                  Portfolio
                </Typography>

                <Typography
                  sx={{
                    color: '#8296e0',
                    fontSize: 13,
                    mt: 0.5,
                  }}
                >
                  Your portfolio section is
                  available for account-based
                  investment information.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                endIcon={
                  <ArrowForwardIcon />
                }
                onClick={goPortfolio}
                sx={{
                  color: '#fff',
                  borderColor:
                    'rgba(110,190,255,0.45)',
                  textTransform:
                    'none',
                  fontWeight: 800,
                }}
              >
                Open Portfolio
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* SECURITY */}

        <Card
          sx={{
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(145deg,#101f63,#08143f)',
            border:
              '1px solid rgba(100,150,255,0.20)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                mb: 2,
              }}
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
                Account Security
              </Typography>
            </Stack>

            <Divider
              sx={{
                mb: 2,
                borderColor:
                  'rgba(255,255,255,0.10)',
              }}
            />

            <Stack spacing={1.5}>
              <SecurityItem
                icon={
                  <VerifiedUserIcon />
                }
                title="Authenticated"
                text="Your account session is protected."
              />

              <SecurityItem
                icon={
                  <LockOutlinedIcon />
                }
                title="Secure Access"
                text="Account information requires authentication."
              />

              <SecurityItem
                icon={
                  <AccountBalanceWalletIcon />
                }
                title="Account Data"
                text="Financial information is displayed from available account data."
              />
            </Stack>
          </CardContent>
        </Card>
      </Container>

      {/* PROFILE DRAWER */}

      <Drawer
        anchor="right"
        open={profileOpen}
        onClose={() =>
          setProfileOpen(false)
        }
      >
        <Box
          sx={{
            width: {
              xs: '88vw',
              sm: 400,
            },
            maxWidth: 400,
            height: '100%',
            color: '#fff',
            background:
              'linear-gradient(180deg,#07113b,#0b1b5a,#102e86)',
            p: 3,
            overflowY: 'auto',
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: 22,
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

          <Stack
            alignItems="center"
            spacing={1.5}
            sx={{
              mb: 3,
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
              }}
            >
              {initials}
            </Avatar>

            <Typography
              sx={{
                fontSize: 24,
                fontWeight: 900,
                textAlign: 'center',
              }}
            >
              {displayName}
            </Typography>

            <Typography
              sx={{
                color: '#91a7e9',
                textAlign: 'center',
              }}
            >
              {profile.email ||
                'Email not available'}
            </Typography>
          </Stack>

          <ProfileItem
            title="Username"
            value={
              profile.username ||
              'Not available'
            }
          />

          <ProfileItem
            title="Account ID"
            value={
              profile.accountId ||
              'Not available'
            }
          />

          <ProfileItem
            title="Available Balance"
            value={
              loading
                ? 'Loading...'
                : money(
                    account.availableBalance
                  )
            }
          />

          <Button
            fullWidth
            startIcon={
              <LogoutIcon />
            }
            onClick={logout}
            sx={{
              mt: 2,
              color: '#ff8297',
              border:
                '1px solid rgba(255,100,130,0.25)',
              textTransform:
                'none',
              py: 1.2,
            }}
          >
            Logout
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

/* MENU ITEM */

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

const MenuItem: React.FC<
  MenuItemProps
> = ({
  icon,
  text,
  onClick,
}) => {
  return (
    <Button
      fullWidth
      onClick={onClick}
      sx={{
        justifyContent:
          'flex-start',
        color: '#fff',
        textTransform:
          'none',
        borderRadius: 2,
        px: 2,
        py: 1.2,
      }}
    >
      <Box
        sx={{
          width: 38,
          display: 'flex',
          justifyContent:
            'center',
          mr: 1,
          color: '#5ce8ff',
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 700,
        }}
      >
        {text}
      </Typography>
    </Button>
  );
};

/* SECURITY ITEM */

interface SecurityItemProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const SecurityItem: React.FC<
  SecurityItemProps
> = ({
  icon,
  title,
  text,
}) => {
  return (
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
            fontSize: 11,
          }}
        >
          {text}
        </Typography>
      </Box>
    </Stack>
  );
};

/* PROFILE ITEM */

interface ProfileItemProps {
  title: string;
  value: string;
}

const ProfileItem: React.FC<
  ProfileItemProps
> = ({
  title,
  value,
}) => {
  return (
    <Box
      sx={{
        p: 1.7,
        mb: 1.5,
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
          textTransform:
            'uppercase',
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
          wordBreak:
            'break-word',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

export default Dashboard;
