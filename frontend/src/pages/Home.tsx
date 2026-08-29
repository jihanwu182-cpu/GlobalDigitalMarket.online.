import React, { useMemo } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material';

import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PublicIcon from '@mui/icons-material/Public';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import PieChartIcon from '@mui/icons-material/PieChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SpeedIcon from '@mui/icons-material/Speed';
import ShieldIcon from '@mui/icons-material/Shield';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import StarIcon from '@mui/icons-material/Star';
import LanguageIcon from '@mui/icons-material/Language';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import TimelineIcon from '@mui/icons-material/Timeline';

import { useNavigate } from 'react-router-dom';

/* ============================================================
   TYPES
============================================================ */

interface ActivityItem {
  name: string;
  country: string;
  action: string;
  amount: string;
  type: 'deposit' | 'withdrawal' | 'profit';
  time: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

/* ============================================================
   CONSTANTS
============================================================ */

const activityExamples: ActivityItem[] = [
  {
    name: 'Michael R.',
    country: 'United Kingdom',
    action: 'completed a deposit',
    amount: '$2,500',
    type: 'deposit',
    time: 'Recently',
  },
  {
    name: 'Sarah K.',
    country: 'Canada',
    action: 'completed a withdrawal',
    amount: '$1,850',
    type: 'withdrawal',
    time: 'Recently',
  },
  {
    name: 'Daniel M.',
    country: 'Germany',
    action: 'recorded portfolio growth',
    amount: '$740',
    type: 'profit',
    time: 'Recently',
  },
  {
    name: 'James T.',
    country: 'United States',
    action: 'completed a deposit',
    amount: '$5,000',
    type: 'deposit',
    time: 'Recently',
  },
  {
    name: 'Emma P.',
    country: 'Australia',
    action: 'completed a withdrawal',
    amount: '$1,200',
    type: 'withdrawal',
    time: 'Recently',
  },
  {
    name: 'David A.',
    country: 'South Africa',
    action: 'recorded portfolio growth',
    amount: '$920',
    type: 'profit',
    time: 'Recently',
  },
];

/* ============================================================
   FEATURE CARD
============================================================ */

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        color: '#fff',
        background:
          'linear-gradient(145deg,#101f63,#08143f)',
        border:
          '1px solid rgba(100,150,255,0.20)',
        transition:
          'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor:
            'rgba(92,232,255,0.45)',
          boxShadow:
            '0 20px 50px rgba(0,0,0,0.25)',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box
          sx={{
            width: 58,
            height: 58,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5ce8ff',
            background:
              'rgba(92,232,255,0.10)',
            mb: 2.5,
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: 19,
            fontWeight: 900,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: '#8198df',
            fontSize: 13,
            lineHeight: 1.7,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

/* ============================================================
   STEP
============================================================ */

const Step: React.FC<StepProps> = ({
  number,
  title,
  description,
  icon,
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
      }}
    >
      <Card
        sx={{
          height: '100%',
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
            justifyContent="space-between"
            alignItems="flex-start"
          >
            <Box
              sx={{
                width: 52,
                height: 52,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#5ce8ff',
                background:
                  'rgba(92,232,255,0.10)',
              }}
            >
              {icon}
            </Box>

            <Typography
              sx={{
                color:
                  'rgba(92,232,255,0.30)',
                fontSize: 34,
                fontWeight: 900,
              }}
            >
              {number}
            </Typography>
          </Stack>

          <Typography
            sx={{
              mt: 3,
              fontSize: 19,
              fontWeight: 900,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: '#8198df',
              fontSize: 13,
              lineHeight: 1.7,
            }}
          >
            {description}
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

/* ============================================================
   ACTIVITY ICON
============================================================ */

const ActivityIcon: React.FC<{
  type: ActivityItem['type'];
}> = ({ type }) => {
  if (type === 'deposit') {
    return (
      <TrendingUpIcon
        sx={{
          color: '#58f39b',
        }}
      />
    );
  }

  if (type === 'withdrawal') {
    return (
      <TrendingDownIcon
        sx={{
          color: '#ff8297',
        }}
      />
    );
  }

  return (
    <AutoGraphIcon
      sx={{
        color: '#5ce8ff',
      }}
    />
  );
};

/* ============================================================
   FAQ ITEM
============================================================ */

interface FAQItemProps {
  question: string;
  answer: string;
}

const FAQItem: React.FC<FAQItemProps> = ({
  question,
  answer,
}) => {
  return (
    <Box
      sx={{
        p: 2.5,
        borderRadius: 3,
        background:
          'rgba(255,255,255,0.035)',
        border:
          '1px solid rgba(255,255,255,0.07)',
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 900,
            }}
          >
            {question}
          </Typography>

          <Typography
            sx={{
              mt: 1,
              color: '#8198df',
              fontSize: 12,
              lineHeight: 1.7,
            }}
          >
            {answer}
          </Typography>
        </Box>

        <ExpandMoreIcon
          sx={{
            color: '#5ce8ff',
            flexShrink: 0,
          }}
        />
      </Stack>
    </Box>
  );
};

/* ============================================================
   HOME
============================================================ */

const Home: React.FC = () => {
  const navigate = useNavigate();

  const currentYear =
    new Date().getFullYear();

  const activity = useMemo(
    () => activityExamples,
    []
  );

  const goLogin = () => {
    navigate('/login');
  };

  const goRegister = () => {
    navigate('/register');
  };

  const goDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#fff',
        overflowX: 'hidden',
        background:
          'radial-gradient(circle at 80% 0%, rgba(25,84,199,0.35), transparent 28%), linear-gradient(180deg,#02071f 0%,#06134b 45%,#081b68 100%)',
      }}
    >
      {/* ======================================================
          NAVIGATION
      ====================================================== */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background:
            'rgba(2,7,31,0.94)',
          backdropFilter: 'blur(18px)',
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
              minHeight: 76,
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                cursor: 'pointer',
              }}
              onClick={() => navigate('/')}
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: 18,
                    sm: 22,
                  },
                  fontWeight: 900,
                  letterSpacing: -0.5,
                }}
              >
                Global Digital Market
              </Typography>

              <Typography
                sx={{
                  color: '#6f8eea',
                  fontSize: 8,
                  letterSpacing: 1.5,
                  fontWeight: 700,
                }}
              >
                DIGITAL INVESTMENT & MARKET PLATFORM
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{
                display: {
                  xs: 'none',
                  md: 'flex',
                },
              }}
            >
              <Button
                onClick={() =>
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  })
                }
                sx={{
                  color: '#cbd6ff',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Home
              </Button>

              <Button
                onClick={() =>
                  document
                    .getElementById('about')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    })
                }
                sx={{
                  color: '#cbd6ff',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                About
              </Button>

              <Button
                onClick={() =>
                  document
                    .getElementById('features')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    })
                }
                sx={{
                  color: '#cbd6ff',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Platform
              </Button>

              <Button
                onClick={() =>
                  document
                    .getElementById('how-it-works')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    })
                }
                sx={{
                  color: '#cbd6ff',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                How It Works
              </Button>

              <Button
                onClick={() =>
                  document
                    .getElementById('faq')
                    ?.scrollIntoView({
                      behavior: 'smooth',
                    })
                }
                sx={{
                  color: '#cbd6ff',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                FAQ
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
            >
              <Button
                startIcon={<LoginIcon />}
                onClick={goLogin}
                sx={{
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 800,
                  display: {
                    xs: 'none',
                    sm: 'inline-flex',
                  },
                }}
              >
                Login
              </Button>

              <Button
                variant="contained"
                startIcon={<PersonAddIcon />}
                onClick={goRegister}
                sx={{
                  color: '#041033',
                  background:
                    '#5ce8ff',
                  textTransform: 'none',
                  fontWeight: 900,
                  borderRadius: 2,
                  px: 2,
                  '&:hover': {
                    background:
                      '#7bedff',
                  },
                }}
              >
                Get Started
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ======================================================
          HERO
      ====================================================== */}

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background:
              'rgba(24,104,255,0.13)',
            filter: 'blur(70px)',
            top: 50,
            right: -120,
          }}
        />

        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 7,
              md: 11,
            },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '1.15fr 0.85fr',
              },
              gap: {
                xs: 5,
                lg: 8,
              },
              alignItems: 'center',
            }}
          >
            <Box>
              <Chip
                icon={
                  <PublicIcon
                    sx={{
                      color:
                        '#5ce8ff !important',
                    }}
                  />
                }
                label="GLOBAL DIGITAL MARKET PLATFORM"
                sx={{
                  color: '#5ce8ff',
                  background:
                    'rgba(92,232,255,0.08)',
                  border:
                    '1px solid rgba(92,232,255,0.18)',
                  fontWeight: 900,
                  letterSpacing: 0.5,
                  mb: 2.5,
                }}
              />

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: 42,
                    sm: 56,
                    md: 70,
                    lg: 78,
                  },
                  lineHeight: 1.02,
                  fontWeight: 950,
                  letterSpacing: -2.5,
                }}
              >
                Your gateway to a
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    background:
                      'linear-gradient(90deg,#5ce8ff,#4d7cff)',
                    backgroundClip:
                      'text',
                    WebkitBackgroundClip:
                      'text',
                    WebkitTextFillColor:
                      'transparent',
                  }}
                >
                  smarter digital market.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  maxWidth: 700,
                  color: '#9aafea',
                  fontSize: {
                    xs: 15,
                    md: 18,
                  },
                  lineHeight: 1.8,
                }}
              >
                Global Digital Market is a modern digital
                investment and market platform designed to
                give users access to portfolio management,
                market information, trading tools and
                account services from one professional
                environment.
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
                  size="large"
                  endIcon={
                    <ArrowForwardIcon />
                  }
                  onClick={goRegister}
                  sx={{
                    minHeight: 54,
                    px: 3,
                    borderRadius: 2.5,
                    color: '#041033',
                    background:
                      '#5ce8ff',
                    textTransform: 'none',
                    fontWeight: 900,
                    fontSize: 15,
                  }}
                >
                  Create Your Account
                </Button>

                <Button
                  variant="outlined"
                  size="large"
                  onClick={goLogin}
                  sx={{
                    minHeight: 54,
                    px: 3,
                    borderRadius: 2.5,
                    color: '#fff',
                    borderColor:
                      'rgba(255,255,255,0.25)',
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  Sign In
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={3}
                flexWrap="wrap"
                useFlexGap
                sx={{
                  mt: 4,
                }}
              >
                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                >
                  <CheckCircleIcon
                    sx={{
                      color: '#58f39b',
                      fontSize: 18,
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#a9b9e9',
                      fontSize: 12,
                    }}
                  >
                    Secure account access
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                >
                  <CheckCircleIcon
                    sx={{
                      color: '#58f39b',
                      fontSize: 18,
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#a9b9e9',
                      fontSize: 12,
                    }}
                  >
                    Professional dashboard
                  </Typography>
                </Stack>

                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                >
                  <CheckCircleIcon
                    sx={{
                      color: '#58f39b',
                      fontSize: 18,
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#a9b9e9',
                      fontSize: 12,
                    }}
                  >
                    Global access
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            {/* HERO DASHBOARD PREVIEW */}

            <Box>
              <Card
                sx={{
                  borderRadius: 5,
                  color: '#fff',
                  background:
                    'linear-gradient(145deg,rgba(18,38,115,0.98),rgba(5,15,51,0.98))',
                  border:
                    '1px solid rgba(100,170,255,0.25)',
                  boxShadow:
                    '0 35px 80px rgba(0,0,0,0.35)',
                  overflow: 'hidden',
                }}
              >
                <Box
                  sx={{
                    px: 2.5,
                    py: 2,
                    borderBottom:
                      '1px solid rgba(255,255,255,0.08)',
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
                          fontWeight: 900,
                          fontSize: 16,
                        }}
                      >
                        Global Digital Market
                      </Typography>

                      <Typography
                        sx={{
                          color: '#7189d2',
                          fontSize: 9,
                        }}
                      >
                        PORTFOLIO OVERVIEW
                      </Typography>
                    </Box>

                    <Chip
                      label="LIVE"
                      size="small"
                      sx={{
                        color: '#58f39b',
                        background:
                          'rgba(88,243,155,0.10)',
                        fontWeight: 900,
                      }}
                    />
                  </Stack>
                </Box>

                <CardContent
                  sx={{
                    p: 3,
                  }}
                >
                  <Typography
                    sx={{
                      color: '#8198df',
                      fontSize: 10,
                      fontWeight: 800,
                      letterSpacing: 1,
                    }}
                  >
                    PORTFOLIO VALUE
                  </Typography>

                  <Typography
                    sx={{
                      mt: 1,
                      fontSize: {
                        xs: 36,
                        md: 45,
                      },
                      fontWeight: 950,
                    }}
                  >
                    $128,450.80
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{
                      mt: 1,
                    }}
                  >
                    <Chip
                      icon={
                        <TrendingUpIcon />
                      }
                      label="+12.84%"
                      size="small"
                      sx={{
                        color: '#58f39b',
                        background:
                          'rgba(88,243,155,0.10)',
                        fontWeight: 900,
                      }}
                    />
                  </Stack>

                  <Box
                    sx={{
                      mt: 3,
                      height: 120,
                      borderRadius: 3,
                      p: 2,
                      background:
                        'linear-gradient(180deg,rgba(92,232,255,0.08),rgba(92,232,255,0.01))',
                      border:
                        '1px solid rgba(92,232,255,0.08)',
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="flex-end"
                      spacing={1}
                      sx={{
                        height: '100%',
                      }}
                    >
                      {[30, 45, 38, 55, 48, 72, 66, 85, 78, 95].map(
                        (height, index) => (
                          <Box
                            key={index}
                            sx={{
                              flex: 1,
                              height: `${height}%`,
                              borderRadius:
                                1,
                              background:
                                index === 9
                                  ? '#5ce8ff'
                                  : 'rgba(92,232,255,0.28)',
                            }}
                          />
                        )
                      )}
                    </Stack>
                  </Box>

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(2,1fr)',
                      gap: 1.5,
                      mt: 2,
                    }}
                  >
                    <Box
                      sx={{
                        p: 1.7,
                        borderRadius: 2.5,
                        background:
                          'rgba(255,255,255,0.035)',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#7189d2',
                          fontSize: 9,
                        }}
                      >
                        AVAILABLE BALANCE
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 900,
                        }}
                      >
                        $42,850.00
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        p: 1.7,
                        borderRadius: 2.5,
                        background:
                          'rgba(255,255,255,0.035)',
                      }}
                    >
                      <Typography
                        sx={{
                          color: '#7189d2',
                          fontSize: 9,
                        }}
                      >
                        BUYING POWER
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          fontWeight: 900,
                        }}
                      >
                        $65,400.00
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ======================================================
          TRUST STRIP
      ====================================================== */}

      <Box
        sx={{
          borderTop:
            '1px solid rgba(255,255,255,0.06)',
          borderBottom:
            '1px solid rgba(255,255,255,0.06)',
          background:
            'rgba(0,0,0,0.15)',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr 1fr',
                md: 'repeat(4,1fr)',
              },
              py: 3,
              gap: 2,
            }}
          >
            <TrustStat
              icon={<PublicIcon />}
              value="Global"
              label="Digital access"
            />

            <TrustStat
              icon={<SecurityIcon />}
              value="Secure"
              label="Account environment"
            />

            <TrustStat
              icon={<AnalyticsIcon />}
              value="Real-time"
              label="Portfolio insights"
            />

            <TrustStat
              icon={<SupportAgentIcon />}
              value="Support"
              label="Customer assistance"
            />
          </Box>
        </Container>
      </Box>

      {/* ======================================================
          ABOUT COMPANY
      ====================================================== */}

      <Container
        id="about"
        maxWidth="xl"
        sx={{
          py: {
            xs: 8,
            md: 12,
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '0.85fr 1.15fr',
            },
            gap: 7,
            alignItems: 'center',
          }}
        >
          <Box>
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
                  xs: 32,
                  md: 46,
                },
                lineHeight: 1.1,
                fontWeight: 950,
                letterSpacing: -1.5,
              }}
            >
              One professional environment for your digital market journey.
            </Typography>

            <Typography
              sx={{
                mt: 2.5,
                color: '#8ea4e8',
                fontSize: 15,
                lineHeight: 1.9,
              }}
            >
              Global Digital Market is built around a simple
              idea: bring account management, market
              information, portfolio visibility and trading
              tools together in one modern platform.
            </Typography>

            <Typography
              sx={{
                mt: 2,
                color: '#8ea4e8',
                fontSize: 15,
                lineHeight: 1.9,
              }}
            >
              Our platform is designed for users who want a
              clear digital experience for managing their
              account and understanding their market
              activity.
            </Typography>

            <Button
              endIcon={
                <ArrowForwardIcon />
              }
              onClick={goRegister}
              sx={{
                mt: 3,
                color: '#5ce8ff',
                textTransform: 'none',
                fontWeight: 900,
              }}
            >
              Open an Account
            </Button>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2,1fr)',
              },
              gap: 2,
            }}
          >
            <FeatureCard
              icon={<AccountBalanceIcon />}
              title="Account Management"
              description="Manage your account information, balances and financial activity from one centralized dashboard."
            />

            <FeatureCard
              icon={<PieChartIcon />}
              title="Portfolio Visibility"
              description="Keep track of holdings, allocation, portfolio value and current performance."
            />

            <FeatureCard
              icon={<CandlestickChartIcon />}
              title="Market Access"
              description="Explore available market information and use the trading environment when enabled for your account."
            />

            <FeatureCard
              icon={<SecurityIcon />}
              title="Security Focus"
              description="Account access is designed around authentication, secure sessions and controlled financial information."
            />
          </Box>
        </Box>
      </Container>

      {/* ======================================================
          FEATURES
      ====================================================== */}

      <Box
        id="features"
        sx={{
          py: {
            xs: 8,
            md: 12,
          },
          background:
            'rgba(0,0,0,0.14)',
          borderTop:
            '1px solid rgba(255,255,255,0.05)',
          borderBottom:
            '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Container maxWidth="xl">
          <SectionHeading
            eyebrow="THE PLATFORM"
            title="Everything you need in one place"
            description="A professional digital environment designed to make your account, portfolio and market activity easier to understand."
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2,1fr)',
                lg: 'repeat(4,1fr)',
              },
              gap: 2,
              mt: 5,
            }}
          >
            <FeatureCard
              icon={
                <AccountBalanceWalletIcon />
              }
              title="Digital Wallet"
              description="Access your available balance and manage supported deposits, withdrawals and transfers."
            />

            <FeatureCard
              icon={<AutoGraphIcon />}
              title="Investment Overview"
              description="View your portfolio value, holdings, allocation and performance information."
            />

            <FeatureCard
              icon={<AnalyticsIcon />}
              title="Market Analytics"
              description="Understand available market information through a clean and organized interface."
            />

            <FeatureCard
              icon={<SpeedIcon />}
              title="Fast Experience"
              description="Navigate your account through a responsive interface built for desktop and mobile users."
            />

            <FeatureCard
              icon={<ShieldIcon />}
              title="Security Controls"
              description="Use authenticated access and account security controls to protect your platform experience."
            />

            <FeatureCard
              icon={<CurrencyExchangeIcon />}
              title="Financial Activity"
              description="Review account transactions and monitor your financial activity from your dashboard."
            />

            <FeatureCard
              icon={<TimelineIcon />}
              title="Performance"
              description="Monitor current portfolio performance and gain or loss information."
            />

            <FeatureCard
              icon={<SupportAgentIcon />}
              title="Customer Support"
              description="Access the support area for questions and assistance with your account."
            />
          </Box>
        </Container>
      </Box>

      {/* ======================================================
          WORLDWIDE ACTIVITY
      ====================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 8,
            md: 12,
          },
        }}
      >
        <SectionHeading
          eyebrow="GLOBAL COMMUNITY"
          title="A platform designed for a worldwide audience"
          description="Users can access their account environment from different regions around the world. The activity design below can be connected to your live backend transaction data."
        />

        <Alert
          severity="info"
          sx={{
            mt: 4,
            mb: 3,
            borderRadius: 3,
            background:
              'rgba(92,232,255,0.07)',
            color: '#c9d7ff',
            border:
              '1px solid rgba(92,232,255,0.12)',
            '& .MuiAlert-icon': {
              color: '#5ce8ff',
            },
          }}
        >
          The worldwide activity examples shown here are
          demonstration entries. Connect them to your real
          transaction/activity API before presenting them as
          live customer activity.
        </Alert>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1fr 1.6fr',
            },
            gap: 3,
          }}
        >
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
              >
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
                  <PublicIcon />
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 900,
                    }}
                  >
                    Worldwide Reach
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8198df',
                      fontSize: 11,
                    }}
                  >
                    DIGITAL PLATFORM
                  </Typography>
                </Box>
              </Stack>

              <Typography
                sx={{
                  mt: 3,
                  color: '#9cafeb',
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                Global Digital Market is structured
                to support a worldwide digital
                audience with a consistent account
                experience.
              </Typography>

              <Stack spacing={2} sx={{ mt: 3 }}>
                <ProgressItem
                  label="Account accessibility"
                  value={92}
                />

                <ProgressItem
                  label="Platform availability"
                  value={96}
                />

                <ProgressItem
                  label="Mobile experience"
                  value={94}
                />
              </Stack>
            </CardContent>
          </Card>

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
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 21,
                      fontWeight: 900,
                    }}
                  >
                    Recent Platform Activity
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8198df',
                      fontSize: 11,
                      mt: 0.4,
                    }}
                  >
                    Example activity feed
                  </Typography>
                </Box>

                <Chip
                  icon={<PublicIcon />}
                  label="Worldwide"
                  size="small"
                  sx={{
                    color: '#5ce8ff',
                    background:
                      'rgba(92,232,255,0.08)',
                    fontWeight: 800,
                  }}
                />
              </Stack>

              <Divider
                sx={{
                  mb: 1,
                  borderColor:
                    'rgba(255,255,255,0.08)',
                }}
              />

              <Stack spacing={0}>
                {activity.map(
                  (item, index) => (
                    <Box
                      key={`${item.name}-${index}`}
                      sx={{
                        py: 1.8,
                        borderBottom:
                          index ===
                          activity.length - 1
                            ? 'none'
                            : '1px solid rgba(255,255,255,0.06)',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1.5}
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2,
                            display:
                              'flex',
                            alignItems:
                              'center',
                            justifyContent:
                              'center',
                            background:
                              'rgba(255,255,255,0.04)',
                          }}
                        >
                          <ActivityIcon
                            type={
                              item.type
                            }
                          />
                        </Box>

                        <Box
                          sx={{
                            flexGrow: 1,
                            minWidth: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                            }}
                          >
                            {item.name}
                          </Typography>

                          <Typography
                            sx={{
                              color: '#8198df',
                              fontSize: 10,
                              mt: 0.2,
                            }}
                          >
                            {item.country}
                          </Typography>

                          <Typography
                            sx={{
                              color: '#a9b8e7',
                              fontSize: 11,
                              mt: 0.5,
                            }}
                          >
                            {item.action}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            textAlign:
                              'right',
                            flexShrink: 0,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 900,
                              color:
                                item.type ===
                                'withdrawal'
                                  ? '#ff8297'
                                  : '#58f39b',
                            }}
                          >
                            {item.type ===
                            'withdrawal'
                              ? '-'
                              : '+'}
                            {item.amount}
                          </Typography>

                          <Typography
                            sx={{
                              color: '#667cbd',
                              fontSize: 9,
                              mt: 0.3,
                            }}
                          >
                            {item.time}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )
                )}
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* ======================================================
          HOW IT WORKS
      ====================================================== */}

      <Box
        id="how-it-works"
        sx={{
          py: {
            xs: 8,
            md: 12,
          },
          background:
            'rgba(0,0,0,0.14)',
          borderTop:
            '1px solid rgba(255,255,255,0.05)',
          borderBottom:
            '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Container maxWidth="xl">
          <SectionHeading
            eyebrow="GET STARTED"
            title="Start in three simple steps"
            description="Create your account, complete your account setup and access the platform."
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3,1fr)',
              },
              gap: 2,
              mt: 5,
            }}
          >
            <Step
              number="01"
              icon={<PersonAddIcon />}
              title="Create your account"
              description="Register your account with your personal details and required contact information."
            />

            <Step
              number="02"
              icon={<VerifiedUserIcon />}
              title="Secure your account"
              description="Sign in and use the available account security features to protect your platform access."
            />

            <Step
              number="03"
              icon={<RocketLaunchIcon />}
              title="Explore the platform"
              description="Access your dashboard, wallet, portfolio, markets and other available account services."
            />
          </Box>
        </Container>
      </Box>

      {/* ======================================================
          SECURITY
      ====================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 8,
            md: 12,
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1fr 1fr',
            },
            gap: 4,
            alignItems: 'stretch',
          }}
        >
          <Card
            sx={{
              borderRadius: 4,
              color: '#fff',
              background:
                'linear-gradient(145deg,#10216d,#08143f)',
              border:
                '1px solid rgba(100,150,255,0.20)',
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <ShieldIcon
                  sx={{
                    color: '#5ce8ff',
                    fontSize: 34,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 25,
                    fontWeight: 900,
                  }}
                >
                  Security is part of the experience
                </Typography>
              </Stack>

              <Typography
                sx={{
                  mt: 2,
                  color: '#8198df',
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                Your account contains financial and
                personal information. The platform is
                therefore structured around authenticated
                access and controlled account information.
              </Typography>

              <Stack spacing={2.5} sx={{ mt: 4 }}>
                <SecurityRow
                  icon={<LockOutlinedIcon />}
                  title="Authenticated access"
                  text="Account information is intended for authenticated users."
                />

                <SecurityRow
                  icon={<VerifiedUserIcon />}
                  title="Account protection"
                  text="Security features help protect access to your account environment."
                />

                <SecurityRow
                  icon={<ShieldIcon />}
                  title="Privacy focused"
                  text="Personal account information should remain protected and handled responsibly."
                />
              </Stack>
            </CardContent>
          </Card>

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
            <CardContent sx={{ p: 4 }}>
              <Chip
                label="PLATFORM PRINCIPLES"
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
                  fontSize: 28,
                  fontWeight: 900,
                }}
              >
                Built around clarity and control.
              </Typography>

              <Typography
                sx={{
                  mt: 1.5,
                  color: '#8198df',
                  fontSize: 13,
                  lineHeight: 1.8,
                }}
              >
                The platform experience is designed to
                make important account information easier
                to find, understand and manage.
              </Typography>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(2,1fr)',
                  gap: 2,
                  mt: 3,
                }}
              >
                <Principle
                  icon={<SpeedIcon />}
                  title="Simple"
                />

                <Principle
                  icon={<AnalyticsIcon />}
                  title="Transparent"
                />

                <Principle
                  icon={<PublicIcon />}
                  title="Global"
                />

                <Principle
                  icon={<SupportAgentIcon />}
                  title="Supported"
                />
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* ======================================================
          TESTIMONIALS
      ====================================================== */}

      <Box
        sx={{
          py: {
            xs: 8,
            md: 12,
          },
          background:
            'rgba(0,0,0,0.14)',
          borderTop:
            '1px solid rgba(255,255,255,0.05)',
          borderBottom:
            '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <Container maxWidth="xl">
          <SectionHeading
            eyebrow="USER EXPERIENCE"
            title="Designed to feel professional"
            description="A clean interface helps users understand their account and navigate the platform with confidence."
          />

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3,1fr)',
              },
              gap: 2,
              mt: 5,
            }}
          >
            <Testimonial
              name="Alex Morgan"
              location="United Kingdom"
              text="The dashboard gives me a clear overview of my account and portfolio information."
            />

            <Testimonial
              name="Maria Johnson"
              location="Canada"
              text="I like having wallet, portfolio and market sections available from one platform."
            />

            <Testimonial
              name="Daniel Williams"
              location="Australia"
              text="The interface is clean and easy to navigate on both mobile and desktop."
            />
          </Box>
        </Container>
      </Box>

      {/* ======================================================
          FAQ
      ====================================================== */}

      <Container
        id="faq"
        maxWidth="md"
        sx={{
          py: {
            xs: 8,
            md: 12,
          },
        }}
      >
        <SectionHeading
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="A few common questions about the Global Digital Market platform."
        />

        <Stack spacing={1.5} sx={{ mt: 5 }}>
          <FAQItem
            question="What is Global Digital Market?"
            answer="Global Digital Market is a digital platform designed to provide account management, portfolio visibility, market information and related financial account services."
          />

          <FAQItem
            question="Can I access the platform from my phone?"
            answer="Yes. The website interface is designed to be responsive and usable on mobile devices, tablets and desktop computers."
          />

          <FAQItem
            question="What can I see from my dashboard?"
            answer="Depending on the services enabled for your account, your dashboard can display balances, portfolio value, holdings, performance, wallet information and account activity."
          />

          <FAQItem
            question="How can I contact support?"
            answer="Use the Contact Support section of the platform to access the available customer support options."
          />

          <FAQItem
            question="Are the investment returns shown on this homepage guaranteed?"
            answer="No. Any investment or market activity involves risk. Performance information should be based on actual account data and should never be interpreted as a guarantee of future results."
          />
        </Stack>
      </Container>

      {/* ======================================================
          FINAL CTA
      ====================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          pb: {
            xs: 8,
            md: 12,
          },
        }}
      >
        <Card
          sx={{
            borderRadius: 5,
            color: '#fff',
            background:
              'linear-gradient(135deg,#10216d,#154ec7 60%,#087fda)',
            border:
              '1px solid rgba(130,190,255,0.30)',
            boxShadow:
              '0 30px 80px rgba(0,0,0,0.30)',
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 3,
                md: 6,
              },
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '1fr auto',
                },
                gap: 4,
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: 30,
                      md: 44,
                    },
                    fontWeight: 950,
                    letterSpacing: -1,
                  }}
                >
                  Ready to enter the digital market?
                </Typography>

                <Typography
                  sx={{
                    mt: 1.5,
                    color: '#c3d1ff',
                    fontSize: 14,
                    lineHeight: 1.7,
                    maxWidth: 700,
                  }}
                >
                  Create your Global Digital Market
                  account and explore your personalized
                  digital account environment.
                </Typography>
              </Box>

              <Button
                variant="contained"
                size="large"
                endIcon={
                  <ArrowForwardIcon />
                }
                onClick={goRegister}
                sx={{
                  minHeight: 56,
                  px: 3,
                  borderRadius: 2.5,
                  color: '#041033',
                  background:
                    '#5ce8ff',
                  textTransform: 'none',
                  fontWeight: 900,
                  fontSize: 15,
                  whiteSpace:
                    'nowrap',
                }}
              >
                Create Account
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <Box
        sx={{
          borderTop:
            '1px solid rgba(255,255,255,0.08)',
          background:
            'rgba(0,0,0,0.25)',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              py: 5,
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '1.5fr 1fr 1fr 1fr',
              },
              gap: 4,
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
                  color: '#7189d2',
                  fontSize: 9,
                  letterSpacing: 1,
                  mt: 0.5,
                }}
              >
                DIGITAL INVESTMENT & MARKET PLATFORM
              </Typography>

              <Typography
                sx={{
                  color: '#7189d2',
                  fontSize: 12,
                  lineHeight: 1.7,
                  mt: 2,
                  maxWidth: 400,
                }}
              >
                A modern digital environment for account
                management, portfolio visibility, market
                information and related platform services.
              </Typography>
            </Box>

            <FooterColumn
              title="Platform"
              items={[
                'Dashboard',
                'Portfolio',
                'Markets',
                'Trading',
              ]}
              onClick={(item) => {
                if (
                  item === 'Dashboard'
                ) {
                  navigate('/dashboard');
                }

                if (
                  item === 'Portfolio'
                ) {
                  navigate('/portfolio');
                }

                if (
                  item === 'Markets'
                ) {
                  navigate('/market');
                }

                if (
                  item === 'Trading'
                ) {
                  navigate('/trading');
                }
              }}
            />

            <FooterColumn
              title="Account"
              items={[
                'Login',
                'Register',
                'Wallet',
                'Account Statement',
              ]}
              onClick={(item) => {
                if (item === 'Login') {
                  navigate('/login');
                }

                if (
                  item === 'Register'
                ) {
                  navigate('/register');
                }

                if (item === 'Wallet') {
                  navigate('/wallet');
                }

                if (
                  item ===
                  'Account Statement'
                ) {
                  navigate(
                    '/account-statement'
                  );
                }
              }}
            />

            <FooterColumn
              title="Support"
              items={[
                'Contact Support',
                'Security',
                'FAQ',
              ]}
              onClick={(item) => {
                if (
                  item ===
                  'Contact Support'
                ) {
                  navigate('/support');
                }

                if (item === 'FAQ') {
                  document
                    .getElementById('faq')
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                    });
                }
              }}
            />
          </Box>

          <Divider
            sx={{
              borderColor:
                'rgba(255,255,255,0.07)',
            }}
          />

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            justifyContent="space-between"
            spacing={2}
            sx={{
              py: 3,
            }}
          >
            <Typography
              sx={{
                color: '#6075b4',
                fontSize: 11,
              }}
            >
              © {currentYear} Global Digital Market.
              All rights reserved.
            </Typography>

            <Typography
              sx={{
                color: '#6075b4',
                fontSize: 10,
                textAlign: {
                  xs: 'left',
                  sm: 'right',
                },
                maxWidth: 650,
              }}
            >
              Risk notice: Digital assets and investments
              can involve substantial risk. Information on
              this website should not be considered a
              guarantee of returns or financial advice.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

/* ============================================================
   SECTION HEADING
============================================================ */

interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description: string;
}

const SectionHeading: React.FC<
  SectionHeadingProps
> = ({
  eyebrow,
  title,
  description,
}) => {
  return (
    <Box
      sx={{
        maxWidth: 760,
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
        {eyebrow}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          fontSize: {
            xs: 31,
            md: 45,
          },
          lineHeight: 1.1,
          fontWeight: 950,
          letterSpacing: -1.2,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1.5,
          color: '#8198df',
          fontSize: 14,
          lineHeight: 1.8,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

/* ============================================================
   TRUST STAT
============================================================ */

const TrustStat: React.FC<{
  icon: React.ReactNode;
  value: string;
  label: string;
}> = ({
  icon,
  value,
  label,
}) => {
  return (
    <Stack
      direction="row"
      spacing={1.2}
      alignItems="center"
      justifyContent="center"
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
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            color: '#6f84c4',
            fontSize: 9,
          }}
        >
          {label}
        </Typography>
      </Box>
    </Stack>
  );
};

/* ============================================================
   PROGRESS ITEM
============================================================ */

const ProgressItem: React.FC<{
  label: string;
  value: number;
}> = ({
  label,
  value,
}) => {
  return (
    <Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        sx={{ mb: 0.7 }}
      >
        <Typography
          sx={{
            color: '#a7b7e8',
            fontSize: 11,
          }}
        >
          {label}
        </Typography>

        <Typography
          sx={{
            color: '#5ce8ff',
            fontSize: 11,
            fontWeight: 800,
          }}
        >
          {value}%
        </Typography>
      </Stack>

      <LinearProgress
        variant="determinate"
        value={value}
        sx={{
          height: 6,
          borderRadius: 10,
          background:
            'rgba(255,255,255,0.07)',
          '& .MuiLinearProgress-bar':
            {
              borderRadius: 10,
              background:
                '#5ce8ff',
            },
        }}
      />
    </Box>
  );
};

/* ============================================================
   SECURITY ROW
============================================================ */

const SecurityRow: React.FC<{
  icon: React.ReactNode;
  title: string;
  text: string;
}> = ({
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
          justifyContent:
            'center',
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
            fontSize: 14,
            fontWeight: 900,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            color: '#8198df',
            fontSize: 11,
            lineHeight: 1.6,
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
   PRINCIPLE
============================================================ */

const Principle: React.FC<{
  icon: React.ReactNode;
  title: string;
}> = ({
  icon,
  title,
}) => {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2.5,
        background:
          'rgba(255,255,255,0.035)',
        border:
          '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Box
        sx={{
          color: '#5ce8ff',
          display: 'flex',
          mb: 1,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 900,
        }}
      >
        {title}
      </Typography>
    </Box>
  );
};

/* ============================================================
   TESTIMONIAL
============================================================ */

const Testimonial: React.FC<{
  name: string;
  location: string;
  text: string;
}> = ({
  name,
  location,
  text,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
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
          spacing={0.3}
          sx={{ mb: 2 }}
        >
          {[1, 2, 3, 4, 5].map(
            (item) => (
              <StarIcon
                key={item}
                sx={{
                  color: '#f5c451',
                  fontSize: 17,
                }}
              />
            )
          )}
        </Stack>

        <Typography
          sx={{
            color: '#c5d2f7',
            fontSize: 13,
            lineHeight: 1.8,
          }}
        >
          "{text}"
        </Typography>

        <Typography
          sx={{
            mt: 2.5,
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {name}
        </Typography>

        <Typography
          sx={{
            color: '#7189d2',
            fontSize: 10,
            mt: 0.3,
          }}
        >
          {location}
        </Typography>
      </CardContent>
    </Card>
  );
};

/* ============================================================
   FOOTER COLUMN
============================================================ */

const FooterColumn: React.FC<{
  title: string;
  items: string[];
  onClick: (item: string) => void;
}> = ({
  title,
  items,
  onClick,
}) => {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 13,
          fontWeight: 900,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>

      <Stack spacing={0.6}>
        {items.map((item) => (
          <Button
            key={item}
            onClick={() =>
              onClick(item)
            }
            sx={{
              justifyContent:
                'flex-start',
              p: 0,
              minWidth: 0,
              color: '#7189d2',
              textTransform: 'none',
              fontSize: 11,
              '&:hover': {
                color: '#5ce8ff',
                background:
                  'transparent',
              },
            }}
          >
            {item}
          </Button>
        ))}
      </Stack>
    </Box>
  );
};

export default Home;
