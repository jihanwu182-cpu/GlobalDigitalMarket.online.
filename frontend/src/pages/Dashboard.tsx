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

interface AccountData {
  availableBalance: number;
}

interface UserProfile {
  name: string;
  email: string;
  username: string;
  accountId: string;
}

interface MenuButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}

/* ============================================================
   MENU BUTTON
============================================================ */

const MenuButton: React.FC<MenuButtonProps> = ({
  icon,
  text,
  onClick,
}) => {
  return (
    <Button
      fullWidth
      onClick={onClick}
      sx={{
        justifyContent: 'flex-start',
        color: '#ffffff',
        textTransform: 'none',
        borderRadius: 2,
        px: 2,
        py: 1.2,
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

/* ============================================================
   SERVICE CARD
============================================================ */

const ServiceCard: React.FC<ServiceCardProps> = ({
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
        color: '#ffffff',
        background:
          'linear-gradient(145deg,#101f63,#08143f)',
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
     LOAD PROFILE
  ========================================================== */

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
     LOAD ACCOUNT
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
     FORMATTING
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
     NAVIGATION
  ========================================================== */

  const openWallet = () => {
    setMenuOpen(false);
    navigate('/wallet');
  };

  const openPortfolio = () => {
    setMenuOpen(false);
    navigate('/portfolio');
  };

  const openMarket = () => {
    setMenuOpen(false);
    navigate('/market');
  };

  const openTrading = () => {
    setMenuOpen(false);
    navigate('/trading');
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
          DRAWER
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
              xs: '86vw',
              sm: 360,
            },
            maxWidth: 360,
            height: '100%',
            overflowY: 'auto',
            color: '#ffffff',
            background:
              'linear-gradient(180deg,#050d35,#0b1d68,#102e86)',
          }}
        >
          {/* DRAWER HEADER */}

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
                color: '#ffffff',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          {/* PROFILE */}

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
              onClick={() => {
                setMenuOpen(false);
                setProfileOpen(true);
              }}
              sx={{
                mt: 1.5,
                color: '#ffffff',
                textTransform: 'none',
                border:
                  '1px solid rgba(120,190,255,0.35)',
              }}
            >
              View Profile
            </Button>
          </Box>

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

          <MenuButton
            icon={<DashboardIcon />}
            text="Dashboard"
            onClick={() => {
              setMenuOpen(false);
              navigate('/');
            }}
          />

          <MenuButton
            icon={
              <AccountBalanceWalletIcon />
            }
            text="Wallet & Funds"
            onClick={openWallet}
          />

          <MenuButton
            icon={<PieChartIcon />}
            text="Portfolio"
            onClick={openPortfolio}
          />

          <MenuButton
            icon={
              <CandlestickChartIcon />
            }
            text="Markets"
            onClick={openMarket}
          />

          <MenuButton
            icon={<CandlestickChartIcon />}
            text="Trading"
            onClick={openTrading}
          />

          <Divider
            sx={{
              my: 2,
              borderColor:
                'rgba(255,255,255,0.10)',
            }}
          />

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

          <MenuButton
            icon={
              <PersonOutlineIcon />
            }
            text="Profile"
            onClick={() => {
              setMenuOpen(false);
              setProfileOpen(true);
            }}
          />

          <MenuButton
            icon={<SecurityIcon />}
            text="Security"
            onClick={() => {
              setMenuOpen(false);
              setProfileOpen(true);
            }}
          />

          <MenuButton
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
                border:
                  '1px solid rgba(255,100,130,0.25)',
                textTransform: 'none',
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
                ACCOUNT WORKSPACE
              </Typography>
            </Box>

            <Button
              onClick={() =>
                setProfileOpen(true)
              }
              sx={{
                minWidth: 0,
                color: '#ffffff',
                textTransform: 'none',
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
        {/* PAGE HEADER */}

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
            Welcome back,
            <br
              style={{
                display: 'none',
              }}
            />{' '}
            {displayName}
          </Typography>

          <Typography
            sx={{
              color: '#8ea4e8',
              mt: 0.7,
              fontSize: 14,
            }}
          >
            Manage your account, wallet and
            investments from one workspace.
          </Typography>
        </Box>

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
            BALANCE CARD
        ==================================================== */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#ffffff',
            overflow: 'hidden',
            background:
              'radial-gradient(circle at 90% 20%,rgba(92,232,255,0.18),transparent 28%), linear-gradient(135deg,#10216d 0%,#154ec7 60%,#087fda 100%)',
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
                  sx={{ mb: 2 }}
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
                        'rgba(0,190,255,0.18)',
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
                        sm: 48,
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
                    fontSize: 13,
                    lineHeight: 1.6,
                    maxWidth: 650,
                  }}
                >
                  Your available balance is
                  retrieved from your account
                  data. No simulated investment
                  value or profit is displayed.
                </Typography>

                {/* BALANCE ACTIONS */}

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
                    onClick={openWallet}
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
                    onClick={openWallet}
                    sx={{
                      color: '#ffffff',
                      borderColor:
                        'rgba(255,255,255,0.50)',
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
                    onClick={openWallet}
                    sx={{
                      color: '#ffffff',
                      borderColor:
                        'rgba(255,255,255,0.50)',
                      textTransform:
                        'none',
                      fontWeight: 800,
                    }}
                  >
                    Transfer
                  </Button>
                </Stack>
              </Box>

              {/* SECURITY */}

              <Box
                sx={{
                  minWidth: {
                    md: 300,
                  },
                  display: {
                    xs: 'none',
                    md: 'block',
                  },
                }}
              >
                <Card
                  sx={{
                    borderRadius: 3,
                    color: '#ffffff',
                    background:
                      'rgba(2,12,55,0.42)',
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
                            'rgba(92,232,255,0.12)',
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
                          Authenticated session
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
                          Secure account access
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
            QUICK ACCESS
        ==================================================== */}

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
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)',
            },
            gap: 2,
            mb: 4,
          }}
        >
          <ServiceCard
            icon={
              <AccountBalanceWalletIcon />
            }
            title="Wallet"
            description="Manage deposits, withdrawals and transfers."
            onClick={openWallet}
          />

          <ServiceCard
            icon={<PieChartIcon />}
            title="Portfolio"
            description="Review the investment information available on your account."
            onClick={openPortfolio}
          />

          <ServiceCard
            icon={
              <CandlestickChartIcon />
            }
            title="Markets"
            description="Open the market workspace when market data is available."
            onClick={openMarket}
          />

          <ServiceCard
            icon={<PersonOutlineIcon />}
            title="Profile"
            description="Review your account information and identity details."
            onClick={() =>
              setProfileOpen(true)
            }
          />
        </Box>

        {/* ====================================================
            PORTFOLIO SECTION
        ==================================================== */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#ffffff',
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
                    lineHeight: 1.6,
                  }}
                >
                  View your actual holdings and
                  portfolio information.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                endIcon={
                  <ArrowForwardIcon />
                }
                onClick={openPortfolio}
                sx={{
                  color: '#ffffff',
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

            <Box
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: 2,
                background:
                  'rgba(255,255,255,0.035)',
                border:
                  '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Typography
                sx={{
                  color: '#aebeff',
                  fontSize: 12,
                  lineHeight: 1.6,
                }}
              >
                Portfolio performance will be
                displayed from connected account
                data. No estimated or simulated
                investment figures are shown here.
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* ====================================================
            MARKET SECTION
        ==================================================== */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#ffffff',
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
                    Markets
                  </Typography>

                  <Chip
                    label="DATA REQUIRED"
                    size="small"
                    sx={{
                      color: '#ffffff',
                      background:
                        'rgba(255,184,0,0.18)',
                      fontSize: 9,
                      fontWeight: 900,
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    color: '#8296e0',
                    fontSize: 13,
                    mt: 0.5,
                    lineHeight: 1.6,
                  }}
                >
                  Market charts and prices will
                  only be shown when connected to a
                  genuine market-data source.
                </Typography>
              </Box>

              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardIcon />
                }
                onClick={openMarket}
                sx={{
                  textTransform:
                    'none',
                  fontWeight: 800,
                }}
              >
                Open Markets
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* ====================================================
            ACCOUNT STATUS
        ==================================================== */}

        <Card
          sx={{
            borderRadius: 4,
            color: '#ffffff',
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
              sx={{ mb: 2 }}
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
                Account Status
              </Typography>
            </Stack>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={2}
            >
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  background:
                    'rgba(19,185,95,0.08)',
                  border:
                    '1px solid rgba(19,185,95,0.15)',
                }}
              >
                <Typography
                  sx={{
                    color: '#8296e0',
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  ACCOUNT
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontWeight: 800,
                  }}
                >
                  Active
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  background:
                    'rgba(92,232,255,0.06)',
                  border:
                    '1px solid rgba(92,232,255,0.12)',
                }}
              >
                <Typography
                  sx={{
                    color: '#8296e0',
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  SECURITY
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontWeight: 800,
                  }}
                >
                  Protected
                </Typography>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  borderRadius: 2,
                  background:
                    'rgba(92,232,255,0.06)',
                  border:
                    '1px solid rgba(92,232,255,0.12)',
                }}
              >
                <Typography
                  sx={{
                    color: '#8296e0',
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  DATA
                </Typography>

                <Typography
                  sx={{
                    mt: 0.5,
                    fontWeight: 800,
                  }}
                >
                  Account-based
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Container>

      {/* ======================================================
          PROFILE DIALOG
      ====================================================== */}

      {profileOpen && (
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
              color: '#ffffff',
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
              sx={{ mb: 3 }}
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
                  color: '#ffffff',
                }}
              >
                <CloseIcon />
              </IconButton>
            </Stack>

            <Stack
              alignItems="center"
              spacing={1.5}
              sx={{ mb: 3 }}
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

              {profile.email && (
                <Typography
                  sx={{
                    color: '#91a7e9',
                    textAlign: 'center',
                  }}
                >
                  {profile.email}
                </Typography>
              )}
            </Stack>

            <Divider
              sx={{
                mb: 2,
                borderColor:
                  'rgba(255,255,255,0.10)',
              }}
            />

            <ProfileItem
              title="Full Name"
              value={
                profile.name ||
                'Not available'
              }
            />

            <ProfileItem
              title="Username"
              value={
                profile.username ||
                'Not available'
              }
            />

            <ProfileItem
              title="Email"
              value={
                profile.email ||
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
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
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
      )}
    </Box>
  );
};

/* ============================================================
   PROFILE ITEM
============================================================ */

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
          textTransform: 'uppercase',
          letterSpacing: 0.8,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: '#ffffff',
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
};

export default Dashboard;
