import React, {
  useEffect,
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
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import PublicIcon from '@mui/icons-material/Public';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';

import {
  useNavigate,
} from 'react-router-dom';

import apiClient from '../services/apiClient';

/* ============================================================
   TYPES
============================================================ */

interface PublicActivity {
  id?: string | number;
  firstName?: string;
  country?: string;
  countryCode?: string;
  type?: string;
  amount?: number;
  currency?: string;
  createdAt?: string;
}

/* ============================================================
   COUNTRY FLAGS
============================================================ */

const countryFlags: Record<
  string,
  string
> = {
  NG: '🇳🇬',
  US: '🇺🇸',
  GB: '🇬🇧',
  UK: '🇬🇧',
  CA: '🇨🇦',
  AU: '🇦🇺',
  ZA: '🇿🇦',
  DE: '🇩🇪',
  FR: '🇫🇷',
  PT: '🇵🇹',
  HU: '🇭🇺',
  AE: '🇦🇪',
  SG: '🇸🇬',
  NZ: '🇳🇿',
  IE: '🇮🇪',
  NL: '🇳🇱',
  CH: '🇨🇭',
  SE: '🇸🇪',
  NO: '🇳🇴',
  DK: '🇩🇰',
  ES: '🇪🇸',
  IT: '🇮🇹',
};

/* ============================================================
   HELPERS
============================================================ */

const formatMoney = (
  amount: number,
  currency = 'USD'
): string => {
  const safeAmount =
    Number.isFinite(Number(amount))
      ? Number(amount)
      : 0;

  try {
    return new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(safeAmount);
  } catch {
    return `$${safeAmount.toFixed(2)}`;
  }
};

const getFlag = (
  countryCode?: string
): string => {
  if (!countryCode) {
    return '🌍';
  }

  return (
    countryFlags[
      countryCode.toUpperCase()
    ] || '🌍'
  );
};

const getTimeAgo = (
  value?: string
): string => {
  if (!value) {
    return 'recently';
  }

  const timestamp =
    new Date(value).getTime();

  if (Number.isNaN(timestamp)) {
    return 'recently';
  }

  const seconds = Math.floor(
    (Date.now() - timestamp) /
      1000
  );

  if (seconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(
    seconds / 60
  );

  if (minutes < 60) {
    return `${minutes} min${
      minutes === 1 ? '' : 's'
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60
  );

  return `${hours} hour${
    hours === 1 ? '' : 's'
  } ago`;
};

/* ============================================================
   FLOATING ACTIVITY NOTIFICATION
============================================================ */

interface ActivityNotificationProps {
  activity: PublicActivity;
  visible: boolean;
}

const ActivityNotification: React.FC<
  ActivityNotificationProps
> = ({
  activity,
  visible,
}) => {
  const firstName =
    activity.firstName ||
    'A user';

  const country =
    activity.country ||
    'Worldwide';

  const type =
    String(
      activity.type ||
        'EARNING'
    ).toUpperCase();

  const amount =
    formatMoney(
      Number(activity.amount) || 0,
      activity.currency ||
        'USD'
    );

  const flag =
    getFlag(
      activity.countryCode
    );

  return (
    <Box
      sx={{
        position: 'fixed',
        left: {
          xs: 12,
          sm: 24,
        },
        bottom: {
          xs: 14,
          sm: 24,
        },
        zIndex: 1500,
        width: {
          xs: 'calc(100vw - 24px)',
          sm: 390,
        },
        maxWidth: 390,
        pointerEvents: 'none',
        transform: visible
          ? 'translateY(0) translateX(0)'
          : 'translateY(25px) translateX(-20px)',
        opacity: visible ? 1 : 0,
        transition:
          'all 0.55s ease',
      }}
    >
      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
          color: '#fff',
          background:
            'linear-gradient(145deg, rgba(11,28,88,0.98), rgba(4,12,48,0.98))',
          border:
            '1px solid rgba(92,232,255,0.25)',
          boxShadow:
            '0 20px 60px rgba(0,0,0,0.45)',
          backdropFilter:
            'blur(18px)',
        }}
      >
        <CardContent
          sx={{
            p: 1.8,
            '&:last-child': {
              pb: 1.8,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <Avatar
              sx={{
                width: 44,
                height: 44,
                fontSize: 20,
                background:
                  'linear-gradient(135deg,#19d8ff,#285cff)',
              }}
            >
              {firstName
                .charAt(0)
                .toUpperCase()}
            </Avatar>

            <Box
              sx={{
                flexGrow: 1,
                minWidth: 0,
              }}
            >
              <Stack
                direction="row"
                spacing={0.7}
                alignItems="center"
              >
                <Typography
                  sx={{
                    fontSize: 13,
                    fontWeight: 900,
                  }}
                >
                  {firstName}
                </Typography>

                <Typography
                  sx={{
                    fontSize: 18,
                    lineHeight: 1,
                  }}
                >
                  {flag}
                </Typography>
              </Stack>

              <Typography
                sx={{
                  color: '#9fb2e8',
                  fontSize: 11,
                  mt: 0.25,
                }}
              >
                from {country}
              </Typography>

              <Typography
                sx={{
                  color: '#58f39b',
                  fontSize: 11,
                  fontWeight: 800,
                  mt: 0.4,
                }}
              >
                {type === 'PROFIT' ||
                type === 'EARNING'
                  ? 'just earned'
                  : type.toLowerCase()}
              </Typography>
            </Box>

            <Box
              sx={{
                textAlign: 'right',
              }}
            >
              <Typography
                sx={{
                  color: '#58f39b',
                  fontSize: 16,
                  fontWeight: 900,
                  whiteSpace:
                    'nowrap',
                }}
              >
                {amount}
              </Typography>

              <Typography
                sx={{
                  color: '#667cbd',
                  fontSize: 9,
                  mt: 0.3,
                }}
              >
                {getTimeAgo(
                  activity.createdAt
                )}
              </Typography>
            </Box>
          </Stack>

          <Stack
            direction="row"
            spacing={0.7}
            alignItems="center"
            sx={{
              mt: 1.3,
            }}
          >
            <CheckCircleIcon
              sx={{
                fontSize: 14,
                color: '#58f39b',
              }}
            />

            <Typography
              sx={{
                color: '#8198df',
                fontSize: 9,
              }}
            >
              Verified platform activity
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

/* ============================================================
   MAIN HOME
============================================================ */

const Home: React.FC = () => {
  const navigate =
    useNavigate();

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  const [
    activities,
    setActivities,
  ] = useState<
    PublicActivity[]
  >([]);

  const [
    activityIndex,
    setActivityIndex,
  ] = useState(0);

  const [
    notificationVisible,
    setNotificationVisible,
  ] = useState(false);

  /* ==========================================================
     LOAD PUBLIC ACTIVITY
  ========================================================== */

  useEffect(() => {
    let mounted = true;

    const loadActivity =
      async () => {
        try {
          const response =
            await apiClient.get(
              '/public/activity'
            );

          const data =
            response.data || {};

          const received =
            Array.isArray(
              data.activities
            )
              ? data.activities
              : [];

          if (mounted) {
            setActivities(
              received
            );
          }
        } catch (error) {
          /*
           * The Home page still works if
           * the public activity endpoint
           * has not been connected yet.
           */
          console.info(
            'Public activity is not available yet.'
          );
        }
      };

    loadActivity();

    return () => {
      mounted = false;
    };
  }, []);

  /* ==========================================================
     ROTATE ACTIVITY NOTIFICATIONS
  ========================================================== */

  useEffect(() => {
    if (
      activities.length === 0
    ) {
      return;
    }

    let hideTimer:
      ReturnType<
        typeof setTimeout
      >;

    let nextTimer:
      ReturnType<
        typeof setTimeout
      >;

    const showNotification =
      () => {
        setNotificationVisible(
          true
        );

        hideTimer =
          setTimeout(() => {
            setNotificationVisible(
              false
            );
          }, 6500);

        nextTimer =
          setTimeout(() => {
            setActivityIndex(
              (current) =>
                (current + 1) %
                activities.length
            );
          }, 7500);
      };

    showNotification();

    return () => {
      clearTimeout(
        hideTimer
      );
      clearTimeout(
        nextTimer
      );
    };
  }, [
    activityIndex,
    activities,
  ]);

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const goLogin = () => {
    setMenuOpen(false);
    navigate('/login');
  };

  const goRegister = () => {
    setMenuOpen(false);
    navigate('/register');
  };

  const goDashboard = () => {
    setMenuOpen(false);
    navigate('/dashboard');
  };

  const goMarket = () => {
    setMenuOpen(false);
    navigate('/market');
  };

  const goPortfolio = () => {
    setMenuOpen(false);
    navigate('/portfolio');
  };

  const goSupport = () => {
    setMenuOpen(false);
    navigate('/support');
  };

  /* ==========================================================
     STYLES
  ========================================================== */

  const sectionCard = {
    borderRadius: 4,
    color: '#fff',
    background:
      'linear-gradient(145deg,#101f63,#08143f)',
    border:
      '1px solid rgba(100,150,255,0.20)',
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
          'radial-gradient(circle at 15% 15%, rgba(25,84,199,0.25), transparent 28%), radial-gradient(circle at 90% 10%, rgba(92,232,255,0.12), transparent 25%), linear-gradient(180deg,#02071f 0%,#071453 50%,#02071f 100%)',
      }}
    >
      {/* ====================================================
          MOBILE MENU
      ==================================================== */}

      {menuOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background:
              'rgba(2,7,31,0.97)',
            p: 3,
          }}
        >
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mb: 5,
            }}
          >
            <Typography
              sx={{
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              Global Digital Market
            </Typography>

            <Button
              onClick={() =>
                setMenuOpen(false)
              }
              sx={{
                minWidth: 45,
                color: '#fff',
              }}
            >
              <CloseIcon />
            </Button>
          </Stack>

          <Stack spacing={1}>
            <Button
              onClick={goDashboard}
              sx={{
                justifyContent:
                  'flex-start',
                color: '#fff',
                py: 1.5,
                textTransform:
                  'none',
                fontSize: 17,
              }}
            >
              Dashboard
            </Button>

            <Button
              onClick={goMarket}
              sx={{
                justifyContent:
                  'flex-start',
                color: '#fff',
                py: 1.5,
                textTransform:
                  'none',
                fontSize: 17,
              }}
            >
              Markets
            </Button>

            <Button
              onClick={goPortfolio}
              sx={{
                justifyContent:
                  'flex-start',
                color: '#fff',
                py: 1.5,
                textTransform:
                  'none',
                fontSize: 17,
              }}
            >
              Portfolio
            </Button>

            <Button
              onClick={goSupport}
              sx={{
                justifyContent:
                  'flex-start',
                color: '#fff',
                py: 1.5,
                textTransform:
                  'none',
                fontSize: 17,
              }}
            >
              Contact Support
            </Button>

            <Divider
              sx={{
                my: 2,
                borderColor:
                  'rgba(255,255,255,0.12)',
              }}
            />

            <Button
              variant="outlined"
              onClick={goLogin}
              sx={{
                color: '#fff',
                borderColor:
                  'rgba(255,255,255,0.3)',
                textTransform:
                  'none',
              }}
            >
              Login
            </Button>

            <Button
              variant="contained"
              onClick={goRegister}
              sx={{
                mt: 1,
                color: '#041033',
                background:
                  '#5ce8ff',
                textTransform:
                  'none',
                fontWeight: 900,
              }}
            >
              Create Account
            </Button>
          </Stack>
        </Box>
      )}

      {/* ====================================================
          NAVIGATION BAR
      ==================================================== */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background:
            'rgba(2,7,31,0.90)',
          backdropFilter:
            'blur(18px)',
          borderBottom:
            '1px solid rgba(125,150,255,0.15)',
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              py: 1.5,
            }}
          >
            <Button
              onClick={() =>
                setMenuOpen(true)
              }
              sx={{
                minWidth: 44,
                color: '#fff',
                display: {
                  xs: 'flex',
                  md: 'none',
                },
              }}
            >
              <MenuIcon />
            </Button>

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
                  letterSpacing:
                    -0.4,
                }}
              >
                Global Digital Market
              </Typography>

              <Typography
                sx={{
                  color: '#7691e5',
                  fontSize: 8,
                  letterSpacing: 1.2,
                }}
              >
                PROFESSIONAL DIGITAL ASSET PLATFORM
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={0.5}
              sx={{
                display: {
                  xs: 'none',
                  md: 'flex',
                },
              }}
            >
              <Button
                onClick={goDashboard}
                sx={{
                  color: '#dce5ff',
                  textTransform:
                    'none',
                }}
              >
                Platform
              </Button>

              <Button
                onClick={goMarket}
                sx={{
                  color: '#dce5ff',
                  textTransform:
                    'none',
                }}
              >
                Markets
              </Button>

              <Button
                onClick={goPortfolio}
                sx={{
                  color: '#dce5ff',
                  textTransform:
                    'none',
                }}
              >
                Portfolio
              </Button>

              <Button
                onClick={goSupport}
                sx={{
                  color: '#dce5ff',
                  textTransform:
                    'none',
                }}
              >
                Support
              </Button>
            </Stack>

            <Button
              onClick={goLogin}
              sx={{
                display: {
                  xs: 'none',
                  sm: 'inline-flex',
                },
                color: '#fff',
                textTransform:
                  'none',
                fontWeight: 800,
              }}
            >
              Login
            </Button>

            <Button
              variant="contained"
              onClick={goRegister}
              sx={{
                color: '#041033',
                background:
                  '#5ce8ff',
                textTransform:
                  'none',
                fontWeight: 900,
                borderRadius: 2,
                px: {
                  xs: 1.5,
                  sm: 2.5,
                },
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ====================================================
          HERO
      ==================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 7,
            md: 11,
          },
        }}
      >
        <Grid
          container
          spacing={6}
          alignItems="center"
        >
          <Grid
            item
            xs={12}
            md={7}
          >
            <Chip
              icon={
                <VerifiedUserIcon />
              }
              label="Professional Digital Market Platform"
              sx={{
                color: '#5ce8ff',
                background:
                  'rgba(92,232,255,0.10)',
                border:
                  '1px solid rgba(92,232,255,0.20)',
                fontWeight: 800,
                mb: 3,
              }}
            />

            <Typography
              sx={{
                fontSize: {
                  xs: 42,
                  sm: 58,
                  md: 72,
                },
                lineHeight: 1.02,
                fontWeight: 950,
                letterSpacing:
                  -2.5,
              }}
            >
              Build your
              <Box
                component="span"
                sx={{
                  display: 'block',
                  color: '#5ce8ff',
                }}
              >
                digital future.
              </Box>
            </Typography>

            <Typography
              sx={{
                mt: 3,
                maxWidth: 700,
                color: '#a9b9e9',
                fontSize: {
                  xs: 15,
                  md: 18,
                },
                lineHeight: 1.8,
              }}
            >
              Global Digital Market provides
              a modern environment for managing
              digital assets, monitoring markets,
              managing portfolios and accessing
              professional trading tools.
            </Typography>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.5}
              sx={{
                mt: 4,
              }}
            >
              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardIcon />
                }
                onClick={goRegister}
                sx={{
                  py: 1.5,
                  px: 3,
                  color: '#041033',
                  background:
                    '#5ce8ff',
                  textTransform:
                    'none',
                  fontWeight: 900,
                  fontSize: 15,
                  borderRadius: 2.5,
                }}
              >
                Create Your Account
              </Button>

              <Button
                variant="outlined"
                onClick={goLogin}
                sx={{
                  py: 1.5,
                  px: 3,
                  color: '#fff',
                  borderColor:
                    'rgba(255,255,255,0.30)',
                  textTransform:
                    'none',
                  fontWeight: 800,
                  borderRadius: 2.5,
                }}
              >
                Sign In
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={3}
              sx={{
                mt: 4,
                flexWrap: 'wrap',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  Global
                </Typography>

                <Typography
                  sx={{
                    color: '#7086c9',
                    fontSize: 10,
                  }}
                >
                  MARKET ACCESS
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  24/7
                </Typography>

                <Typography
                  sx={{
                    color: '#7086c9',
                    fontSize: 10,
                  }}
                >
                  PLATFORM ACCESS
                </Typography>
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 900,
                  }}
                >
                  Secure
                </Typography>

                <Typography
                  sx={{
                    color: '#7086c9',
                    fontSize: 10,
                  }}
                >
                  ACCOUNT ACCESS
                </Typography>
              </Box>
            </Stack>
          </Grid>

          <Grid
            item
            xs={12}
            md={5}
          >
            <Card
              sx={{
                borderRadius: 5,
                color: '#fff',
                background:
                  'linear-gradient(145deg,#10266f,#07143f)',
                border:
                  '1px solid rgba(92,232,255,0.20)',
                boxShadow:
                  '0 30px 90px rgba(0,0,0,0.35)',
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
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Box>
                    <Typography
                      sx={{
                        color: '#8198df',
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 1,
                      }}
                    >
                      PLATFORM OVERVIEW
                    </Typography>

                    <Typography
                      sx={{
                        fontSize: 26,
                        fontWeight: 900,
                        mt: 0.7,
                      }}
                    >
                      Digital Markets
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent:
                        'center',
                      color: '#5ce8ff',
                      background:
                        'rgba(92,232,255,0.10)',
                    }}
                  >
                    <AutoGraphIcon />
                  </Box>
                </Stack>

                <Divider
                  sx={{
                    my: 3,
                    borderColor:
                      'rgba(255,255,255,0.08)',
                  }}
                />

                <Stack spacing={2}>
                  <FeatureRow
                    icon={
                      <ShowChartIcon />
                    }
                    title="Market Monitoring"
                    text="Monitor available digital markets and market activity."
                  />

                  <FeatureRow
                    icon={
                      <AccountBalanceWalletIcon />
                    }
                    title="Portfolio Management"
                    text="Manage your account balances and investment positions."
                  />

                  <FeatureRow
                    icon={
                      <SecurityIcon />
                    }
                    title="Account Security"
                    text="Protected account access and authenticated financial data."
                  />

                  <FeatureRow
                    icon={
                      <SupportAgentIcon />
                    }
                    title="Customer Support"
                    text="Access assistance when you need help with your account."
                  />
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* ====================================================
          COMPANY PROFILE
      ==================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          pb: 8,
        }}
      >
        <Card
          sx={{
            ...sectionCard,
            borderRadius: 5,
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 5,
              },
            }}
          >
            <Grid
              container
              spacing={5}
              alignItems="center"
            >
              <Grid
                item
                xs={12}
                md={7}
              >
                <Chip
                  label="ABOUT GLOBAL DIGITAL MARKET"
                  sx={{
                    color: '#5ce8ff',
                    background:
                      'rgba(92,232,255,0.08)',
                    fontWeight: 900,
                    mb: 2,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: {
                      xs: 30,
                      md: 42,
                    },
                    fontWeight: 900,
                    lineHeight: 1.1,
                  }}
                >
                  A modern digital
                  market experience.
                </Typography>

                <Typography
                  sx={{
                    color: '#9eb0e4',
                    lineHeight: 1.8,
                    mt: 2,
                    fontSize: 14,
                  }}
                >
                  Global Digital Market is
                  designed as a centralized
                  digital platform where users
                  can access their account,
                  monitor available markets,
                  manage portfolio information
                  and use digital trading tools
                  from one professional interface.
                </Typography>

                <Typography
                  sx={{
                    color: '#9eb0e4',
                    lineHeight: 1.8,
                    mt: 1.5,
                    fontSize: 14,
                  }}
                >
                  Our platform is focused on
                  providing a clean, transparent
                  and technology-driven experience
                  for users participating in
                  today's evolving digital economy.
                </Typography>

                <Button
                  endIcon={
                    <ArrowForwardIcon />
                  }
                  onClick={goRegister}
                  sx={{
                    mt: 3,
                    color: '#5ce8ff',
                    textTransform:
                      'none',
                    fontWeight: 900,
                  }}
                >
                  Join the Platform
                </Button>
              </Grid>

              <Grid
                item
                xs={12}
                md={5}
              >
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    background:
                      'rgba(255,255,255,0.035)',
                    border:
                      '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <ProfileStat
                    icon={
                      <PublicIcon />
                    }
                    title="Global Reach"
                    text="Built for users accessing digital markets worldwide."
                  />

                  <ProfileStat
                    icon={
                      <GroupsIcon />
                    }
                    title="User Focused"
                    text="Designed around clear account and portfolio management."
                  />

                  <ProfileStat
                    icon={
                      <TrendingUpIcon />
                    }
                    title="Market Driven"
                    text="Tools designed to help users monitor digital market activity."
                  />
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      {/* ====================================================
          SERVICES
      ==================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          pb: 9,
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            mb: 5,
          }}
        >
          <Typography
            sx={{
              color: '#5ce8ff',
              fontSize: 11,
              fontWeight: 900,
              letterSpacing: 1.5,
            }}
          >
            PLATFORM SERVICES
          </Typography>

          <Typography
            sx={{
              mt: 1,
              fontSize: {
                xs: 30,
                md: 42,
              },
              fontWeight: 900,
            }}
          >
            Everything in one place
          </Typography>

          <Typography
            sx={{
              color: '#8198df',
              maxWidth: 650,
              mx: 'auto',
              mt: 1,
            }}
          >
            A centralized experience for managing
            your digital market account.
          </Typography>
        </Box>

        <Grid
          container
          spacing={2}
        >
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <ServiceCard
              icon={
                <AccountBalanceWalletIcon />
              }
              title="Digital Wallet"
              text="Manage account balances, deposits, withdrawals and transfers."
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <ServiceCard
              icon={
                <ShowChartIcon />
              }
              title="Market Access"
              text="Explore available market information and digital asset activity."
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <ServiceCard
              icon={
                <PieChartIcon />
              }
              title="Portfolio"
              text="View holdings, allocation and portfolio performance."
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <ServiceCard
              icon={
                <SecurityIcon />
              }
              title="Secure Account"
              text="Authenticated access to your financial account information."
            />
          </Grid>
        </Grid>
      </Container>

      {/* ====================================================
          GLOBAL COMMUNITY
      ==================================================== */}

      <Box
        sx={{
          py: 9,
          background:
            'linear-gradient(180deg,rgba(4,12,45,0),rgba(12,39,110,0.35),rgba(4,12,45,0))',
        }}
      >
        <Container maxWidth="xl">
          <Grid
            container
            spacing={5}
            alignItems="center"
          >
            <Grid
              item
              xs={12}
              md={6}
            >
              <Chip
                icon={
                  <PublicIcon />
                }
                label="GLOBAL PLATFORM"
                sx={{
                  color: '#5ce8ff',
                  background:
                    'rgba(92,232,255,0.08)',
                  fontWeight: 900,
                }}
              />

              <Typography
                sx={{
                  mt: 2,
                  fontSize: {
                    xs: 32,
                    md: 46,
                  },
                  fontWeight: 900,
                  lineHeight: 1.1,
                }}
              >
                Connecting users
                with digital markets
                worldwide.
              </Typography>

              <Typography
                sx={{
                  color: '#91a5df',
                  lineHeight: 1.8,
                  mt: 2,
                  maxWidth: 620,
                }}
              >
                Our platform is built for a
                global audience. Users can access
                their accounts and digital market
                tools from wherever they are.
              </Typography>

              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardIcon />
                }
                onClick={goRegister}
                sx={{
                  mt: 3,
                  color: '#041033',
                  background:
                    '#5ce8ff',
                  textTransform:
                    'none',
                  fontWeight: 900,
                }}
              >
                Open an Account
              </Button>
            </Grid>

            <Grid
              item
              xs={12}
              md={6}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(2,1fr)',
                  gap: 1.5,
                }}
              >
                {[
                  ['🇳🇬', 'Nigeria'],
                  ['🇬🇧', 'United Kingdom'],
                  ['🇿🇦', 'South Africa'],
                  ['🇨🇦', 'Canada'],
                  ['🇦🇪', 'United Arab Emirates'],
                  ['🇩🇪', 'Germany'],
                ].map(
                  ([flag, country]) => (
                    <Card
                      key={country}
                      sx={{
                        ...sectionCard,
                        borderRadius: 3,
                      }}
                    >
                      <CardContent
                        sx={{
                          p: 2,
                          '&:last-child': {
                            pb: 2,
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1.2}
                          alignItems="center"
                        >
                          <Typography
                            sx={{
                              fontSize: 25,
                            }}
                          >
                            {flag}
                          </Typography>

                          <Typography
                            sx={{
                              fontWeight: 800,
                              fontSize: 13,
                            }}
                          >
                            {country}
                          </Typography>
                        </Stack>
                      </CardContent>
                    </Card>
                  )
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* ====================================================
          SECURITY
      ==================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: 9,
        }}
      >
        <Card
          sx={{
            ...sectionCard,
            borderRadius: 5,
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 5,
              },
            }}
          >
            <Grid
              container
              spacing={5}
              alignItems="center"
            >
              <Grid
                item
                xs={12}
                md={6}
              >
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <SecurityIcon
                    sx={{
                      fontSize: 38,
                      color: '#5ce8ff',
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 30,
                      fontWeight: 900,
                    }}
                  >
                    Security & Trust
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    color: '#91a5df',
                    mt: 2,
                    lineHeight: 1.8,
                  }}
                >
                  Your account information is
                  protected through authenticated
                  access and controlled account
                  operations.
                </Typography>
              </Grid>

              <Grid
                item
                xs={12}
                md={6}
              >
                <Stack spacing={2}>
                  <TrustRow
                    title="Authenticated access"
                    text="Account information is available to authenticated users."
                  />

                  <TrustRow
                    title="Protected financial data"
                    text="Sensitive account information is handled within the authenticated platform."
                  />

                  <TrustRow
                    title="Professional interface"
                    text="A structured environment for managing digital market activity."
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Container>

      {/* ====================================================
          CTA
      ==================================================== */}

      <Container
        maxWidth="md"
        sx={{
          py: 8,
          textAlign: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: {
              xs: 32,
              md: 46,
            },
            fontWeight: 900,
          }}
        >
          Ready to get started?
        </Typography>

        <Typography
          sx={{
            color: '#91a5df',
            mt: 1.5,
          }}
        >
          Create your Global Digital Market
          account and access your platform.
        </Typography>

        <Button
          variant="contained"
          size="large"
          endIcon={
            <ArrowForwardIcon />
          }
          onClick={goRegister}
          sx={{
            mt: 3,
            px: 4,
            py: 1.6,
            color: '#041033',
            background:
              '#5ce8ff',
            textTransform:
              'none',
            fontWeight: 900,
            borderRadius: 2.5,
          }}
        >
          Create Account
        </Button>
      </Container>

      {/* ====================================================
          FOOTER
      ==================================================== */}

      <Box
        sx={{
          borderTop:
            '1px solid rgba(255,255,255,0.08)',
          background:
            'rgba(2,7,31,0.65)',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: 4,
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 900,
                }}
              >
                Global Digital Market
              </Typography>

              <Typography
                sx={{
                  color: '#667cbd',
                  fontSize: 10,
                  mt: 0.5,
                }}
              >
                PROFESSIONAL DIGITAL ASSET PLATFORM
              </Typography>
            </Box>

            <Typography
              sx={{
                color: '#667cbd',
                fontSize: 11,
              }}
            >
              © {new Date().getFullYear()}{' '}
              Global Digital Market. All
              rights reserved.
            </Typography>
          </Stack>
        </Container>
      </Box>

      {/* ====================================================
          WORLDWIDE EARNING NOTIFICATION
      ==================================================== */}

      {activities.length > 0 && (
        <ActivityNotification
          activity={
            activities[
              activityIndex %
                activities.length
            ]
          }
          visible={
            notificationVisible
          }
        />
      )}
    </Box>
  );
};

/* ============================================================
   FEATURE ROW
============================================================ */

interface FeatureRowProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const FeatureRow: React.FC<
  FeatureRowProps
> = ({
  icon,
  title,
  text,
}) => {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
    >
      <Box
        sx={{
          width: 42,
          height: 42,
          minWidth: 42,
          borderRadius: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#5ce8ff',
          background:
            'rgba(92,232,255,0.08)',
        }}
      >
        {icon}
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: '#8198df',
            fontSize: 11,
            mt: 0.3,
            lineHeight: 1.6,
          }}
        >
          {text}
        </Typography>
      </Box>
    </Stack>
  );
};

/* ============================================================
   PROFILE STAT
============================================================ */

interface ProfileStatProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const ProfileStat: React.FC<
  ProfileStatProps
> = ({
  icon,
  title,
  text,
}) => {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      sx={{
        mb: 2.5,
        '&:last-child': {
          mb: 0,
        },
      }}
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
            fontWeight: 900,
            fontSize: 13,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: '#8198df',
            fontSize: 11,
            mt: 0.3,
            lineHeight: 1.5,
          }}
        >
          {text}
        </Typography>
      </Box>
    </Stack>
  );
};

/* ============================================================
   SERVICE CARD
============================================================ */

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  text: string;
}

const ServiceCard: React.FC<
  ServiceCardProps
> = ({
  icon,
  title,
  text,
}) => {
  return (
    <Card
      sx={{
        ...sectionCard,
        height: '100%',
        transition:
          'transform 0.2s ease, border-color 0.2s ease',
        '&:hover': {
          transform:
            'translateY(-4px)',
          borderColor:
            'rgba(92,232,255,0.40)',
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
        }}
      >
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5ce8ff',
            background:
              'rgba(92,232,255,0.09)',
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
            lineHeight: 1.7,
            mt: 1,
          }}
        >
          {text}
        </Typography>
      </CardContent>
    </Card>
  );
};

/* ============================================================
   TRUST ROW
============================================================ */

interface TrustRowProps {
  title: string;
  text: string;
}

const TrustRow: React.FC<
  TrustRowProps
> = ({
  title,
  text,
}) => {
  return (
    <Stack
      direction="row"
      spacing={1.5}
      alignItems="flex-start"
    >
      <CheckCircleIcon
        sx={{
          color: '#58f39b',
          mt: 0.2,
        }}
      />

      <Box>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: '#8198df',
            fontSize: 11,
            mt: 0.3,
          }}
        >
          {text}
        </Typography>
      </Box>
    </Stack>
  );
};

/* ============================================================
   DEFAULT EXPORT
============================================================ */

export default Home;
