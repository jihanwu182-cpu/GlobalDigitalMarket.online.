import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Chip,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import PublicIcon from '@mui/icons-material/Public';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SpeedIcon from '@mui/icons-material/Speed';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BusinessIcon from '@mui/icons-material/Business';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';

import { useNavigate } from 'react-router-dom';

import apiClient from '../services/apiClient';

/* ============================================================
   TYPES
============================================================ */

interface ActivityItem {
  id: string | number;
  type: 'Deposit' | 'Withdrawal' | 'Profit';
  amount: number;
  country: string;
  flag: string;
  initials: string;
  time: string;
}

interface MarketItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
}

/* ============================================================
   LOGO
============================================================ */

const CompanyLogo: React.FC<{
  compact?: boolean;
}> = ({ compact = false }) => {
  return (
    <Stack
      direction="row"
      spacing={1.2}
      alignItems="center"
    >
      <Box
        sx={{
          width: compact ? 38 : 46,
          height: compact ? 38 : 46,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 30% 25%, #61e9ff 0%, #176cff 45%, #071b62 100%)',
          border:
            '1px solid rgba(112,220,255,0.65)',
          boxShadow:
            '0 0 24px rgba(45,139,255,0.35)',
        }}
      >
        <PublicIcon
          sx={{
            fontSize: compact ? 25 : 31,
            color: '#fff',
          }}
        />
      </Box>

      <Box>
        <Typography
          sx={{
            fontSize: compact ? 16 : 19,
            fontWeight: 950,
            lineHeight: 1,
            letterSpacing: 0.8,
          }}
        >
          GLOBAL
        </Typography>

        <Typography
          sx={{
            fontSize: compact ? 7 : 8,
            color: '#8da9ef',
            letterSpacing: 1.3,
            fontWeight: 800,
            mt: 0.4,
          }}
        >
          DIGITAL MARKET
        </Typography>
      </Box>
    </Stack>
  );
};

/* ============================================================
   MARKET DATA
============================================================ */

const defaultMarkets: MarketItem[] = [
  {
    symbol: 'EUR/USD',
    name: 'Euro / U.S. Dollar',
    price: '1.08472',
    change: '+0.30%',
    positive: true,
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / U.S. Dollar',
    price: '1.26543',
    change: '+0.22%',
    positive: true,
  },
  {
    symbol: 'XAU/USD',
    name: 'Gold / U.S. Dollar',
    price: '2,385.52',
    change: '+0.41%',
    positive: true,
  },
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin / U.S. Dollar',
    price: '67,942.21',
    change: '+1.12%',
    positive: true,
  },
];

/* ============================================================
   ACTIVITY DATA
============================================================ */

const demoActivity: ActivityItem[] = [
  {
    id: 1,
    type: 'Withdrawal',
    amount: 2850,
    country: 'United Kingdom',
    flag: '🇬🇧',
    initials: 'A•••• J.',
    time: '2 min ago',
  },
  {
    id: 2,
    type: 'Deposit',
    amount: 1420,
    country: 'Germany',
    flag: '🇩🇪',
    initials: 'M•••• K.',
    time: '3 min ago',
  },
  {
    id: 3,
    type: 'Profit',
    amount: 5320,
    country: 'Canada',
    flag: '🇨🇦',
    initials: 'T•••• S.',
    time: '5 min ago',
  },
  {
    id: 4,
    type: 'Withdrawal',
    amount: 980,
    country: 'India',
    flag: '🇮🇳',
    initials: 'R•••• P.',
    time: '6 min ago',
  },
  {
    id: 5,
    type: 'Deposit',
    amount: 3600,
    country: 'Brazil',
    flag: '🇧🇷',
    initials: 'L•••• M.',
    time: '2 min ago',
  },
];

/* ============================================================
   FORMAT MONEY
============================================================ */

const money = (
  value: number
): string => {
  return `$${Number(value || 0).toLocaleString(
    'en-US',
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};

/* ============================================================
   TRADING CHART
============================================================ */

const TradingChart: React.FC = () => {
  const points = [
    [0, 210],
    [18, 192],
    [35, 198],
    [52, 170],
    [69, 180],
    [86, 158],
    [103, 172],
    [120, 145],
    [137, 155],
    [154, 136],
    [171, 151],
    [188, 124],
    [205, 142],
    [222, 118],
    [239, 132],
    [256, 108],
    [273, 116],
    [290, 92],
    [307, 105],
    [324, 80],
    [341, 95],
    [358, 68],
    [375, 82],
    [392, 54],
    [409, 70],
    [426, 48],
    [443, 64],
    [460, 42],
  ];

  const linePoints = points
    .map(
      ([x, y]) => `${x},${y}`
    )
    .join(' ');

  const areaPoints =
    `0,230 ${linePoints} 460,230`;

  return (
    <Box
      sx={{
        width: '100%',
        height: {
          xs: 300,
          md: 340,
        },
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        background:
          'linear-gradient(180deg,rgba(4,17,48,0.98),rgba(4,12,36,0.98))',
        border:
          '1px solid rgba(105,145,230,0.15)',
      }}
    >
      {/* GRID */}

      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(105,145,230,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(105,145,230,0.08) 1px, transparent 1px)',
          backgroundSize:
            '100% 48px, 70px 100%',
        }}
      />

      {/* PRICE LABELS */}

      <Stack
        sx={{
          position: 'absolute',
          right: 8,
          top: 55,
          bottom: 38,
          justifyContent:
            'space-between',
          zIndex: 2,
        }}
      >
        {[
          '1.08550',
          '1.08480',
          '1.08410',
          '1.08340',
          '1.08270',
          '1.08200',
        ].map((item) => (
          <Typography
            key={item}
            sx={{
              fontSize: 9,
              color: '#5f75a9',
            }}
          >
            {item}
          </Typography>
        ))}
      </Stack>

      <svg
        viewBox="0 0 460 250"
        preserveAspectRatio="none"
        style={{
          position: 'absolute',
          left: 0,
          top: 45,
          width: 'calc(100% - 55px)',
          height: 'calc(100% - 75px)',
        }}
      >
        <defs>
          <linearGradient
            id="chartArea"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#168fff"
              stopOpacity="0.28"
            />
            <stop
              offset="100%"
              stopColor="#168fff"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <polygon
          points={areaPoints}
          fill="url(#chartArea)"
        />

        <polyline
          points={linePoints}
          fill="none"
          stroke="#26a9ff"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />

        {points
          .filter(
            (_, index) =>
              index % 2 === 0
          )
          .map(
            ([x, y], index) => (
              <line
                key={index}
                x1={x}
                x2={x}
                y1={y - 12}
                y2={y + 12}
                stroke={
                  index % 3 === 0
                    ? '#36d98b'
                    : '#ff536d'
                }
                strokeWidth="1.5"
              />
            )
          )}
      </svg>

      <Box
        sx={{
          position: 'absolute',
          left: 12,
          right: 60,
          bottom: 7,
          display: 'flex',
          justifyContent:
            'space-between',
        }}
      >
        {[
          '06:00',
          '09:00',
          '12:00',
          '15:00',
          '18:00',
        ].map((time) => (
          <Typography
            key={time}
            sx={{
              fontSize: 9,
              color: '#526997',
            }}
          >
            {time}
          </Typography>
        ))}
      </Box>

      <Box
        sx={{
          position: 'absolute',
          right: 55,
          top: '42%',
          px: 1,
          py: 0.5,
          borderRadius: 1,
          background: '#16a66a',
          color: '#fff',
          fontSize: 10,
          fontWeight: 900,
        }}
      >
        1.08472
      </Box>
    </Box>
  );
};

/* ============================================================
   MARKET CARD
============================================================ */

const MarketCard: React.FC<{
  market: MarketItem;
}> = ({ market }) => {
  return (
    <Card
      sx={{
        minWidth: 0,
        borderRadius: 2.5,
        p: 1.4,
        background:
          'rgba(7,21,53,0.92)',
        border:
          '1px solid rgba(91,149,255,0.20)',
        color: '#fff',
      }}
    >
      <Typography
        sx={{
          fontSize: 11,
          color: '#5ce8ff',
          fontWeight: 900,
        }}
      >
        {market.symbol}
      </Typography>

      <Typography
        sx={{
          fontSize: 9,
          color: '#7086bc',
          mt: 0.4,
        }}
      >
        {market.name}
      </Typography>

      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          mt: 1,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 900,
          }}
        >
          {market.price}
        </Typography>

        <Typography
          sx={{
            color: market.positive
              ? '#39dd91'
              : '#ff6e85',
            fontSize: 10,
            fontWeight: 900,
          }}
        >
          {market.change}
        </Typography>
      </Stack>
    </Card>
  );
};

/* ============================================================
   ACTIVITY CARD
============================================================ */

const ActivityCard: React.FC<{
  item: ActivityItem;
}> = ({ item }) => {
  const isDeposit =
    item.type === 'Deposit';

  const isProfit =
    item.type === 'Profit';

  return (
    <Card
      sx={{
        minWidth: {
          xs: 220,
          sm: 0,
        },
        borderRadius: 2.5,
        p: 1.6,
        background:
          'rgba(7,21,53,0.82)',
        border:
          '1px solid rgba(91,149,255,0.17)',
        color: '#fff',
      }}
    >
      <Stack
        direction="row"
        spacing={1.2}
        alignItems="center"
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background:
              isProfit
                ? 'rgba(37,108,255,0.25)'
                : isDeposit
                ? 'rgba(38,211,132,0.20)'
                : 'rgba(245,171,28,0.20)',
            color:
              isProfit
                ? '#5c9dff'
                : isDeposit
                ? '#3ce18c'
                : '#f5ad27',
          }}
        >
          {isProfit ? (
            <TrendingUpIcon
              sx={{ fontSize: 20 }}
            />
          ) : isDeposit ? (
            <TrendingUpIcon
              sx={{ fontSize: 20 }}
            />
          ) : (
            <TrendingDownIcon
              sx={{ fontSize: 20 }}
            />
          )}
        </Box>

        <Box>
          <Typography
            sx={{
              fontSize: 10,
              color: '#9cb0dd',
            }}
          >
            {item.type}
          </Typography>

          <Typography
            sx={{
              fontSize: 15,
              fontWeight: 950,
            }}
          >
            {money(item.amount)}
          </Typography>
        </Box>
      </Stack>

      <Typography
        sx={{
          color: '#6479ad',
          fontSize: 9,
          mt: 1.5,
        }}
      >
        {item.time}
      </Typography>

      <Typography
        sx={{
          color: '#c5d1ef',
          fontSize: 10,
          mt: 0.4,
        }}
      >
        {item.initials} · {item.flag}{' '}
        {item.country}
      </Typography>
    </Card>
  );
};

/* ============================================================
   BENEFIT
============================================================ */

const Benefit: React.FC<{
  icon: React.ReactNode;
  title: string;
  text: string;
}> = ({
  icon,
  title,
  text,
}) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        px: 2,
        py: 3,
      }}
    >
      <Box
        sx={{
          color: '#1263ff',
          display: 'flex',
          justifyContent: 'center',
          mb: 1.5,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          color: '#071331',
          fontWeight: 900,
          fontSize: 15,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: '#65718b',
          fontSize: 11,
          lineHeight: 1.7,
          mt: 0.8,
        }}
      >
        {text}
      </Typography>
    </Box>
  );
};

/* ============================================================
   HOME
============================================================ */

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [
    mobileMenu,
    setMobileMenu,
  ] = useState(false);

  const [
    activity,
    setActivity,
  ] = useState<ActivityItem[]>(
    demoActivity
  );

  const [
    markets,
    setMarkets,
  ] = useState<MarketItem[]>(
    defaultMarkets
  );

  const [activityNotice, setActivityNotice] =
    useState('');

  /* ==========================================================
     LOAD OPTIONAL PUBLIC DATA
  ========================================================== */

  useEffect(() => {
    let active = true;

    const loadPublicData =
      async () => {
        try {
          const response =
            await apiClient.get(
              '/public/market-summary'
            );

          if (!active) return;

          const data =
            response.data || {};

          if (
            Array.isArray(
              data.markets
            ) &&
            data.markets.length > 0
          ) {
            setMarkets(
              data.markets
            );
          }
        } catch {
          // The professionally designed
          // default market display remains.
        }
      };

    loadPublicData();

    return () => {
      active = false;
    };
  }, []);

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const goLogin = () => {
    setMobileMenu(false);
    navigate('/login');
  };

  const goRegister = () => {
    setMobileMenu(false);
    navigate('/register');
  };

  const goMarkets = () => {
    setMobileMenu(false);
    navigate('/market');
  };

  const goTrading = () => {
    setMobileMenu(false);
    navigate('/trading');
  };

  /* ==========================================================
     RANDOM ACTIVITY ANIMATION
     
     NOTE:
     This does NOT claim to be real customer activity.
     It simply cycles through the visual presentation.
     Connect it to a real backend endpoint before calling
     it "live".
  ========================================================== */

  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setActivityNotice(
          'Platform activity updated'
        );

        window.setTimeout(() => {
          setActivityNotice('');
        }, 2500);
      }, 15000);

    return () => {
      window.clearInterval(
        timer
      );
    };
  }, []);

  /* ==========================================================
     MEMO
  ========================================================== */

  const displayedMarkets =
    useMemo(
      () =>
        markets.slice(0, 4),
      [markets]
    );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#020817',
        color: '#fff',
        overflowX: 'hidden',
      }}
    >
      {/* ====================================================
          NAVIGATION
      ==================================================== */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background:
            'rgba(1,7,22,0.94)',
          backdropFilter:
            'blur(18px)',
          borderBottom:
            '1px solid rgba(112,145,220,0.14)',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            height: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
          }}
        >
          <CompanyLogo />

          {/* DESKTOP NAV */}

          <Stack
            direction="row"
            spacing={3.2}
            alignItems="center"
            sx={{
              display: {
                xs: 'none',
                md: 'flex',
              },
            }}
          >
            {[
              ['Home', () => window.scrollTo({ top: 0, behavior: 'smooth' })],
              ['Markets', goMarkets],
              ['Trading', goTrading],
              [
                'About Us',
                () =>
                  document
                    .getElementById(
                      'about'
                    )
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                    }),
              ],
              [
                'Company',
                () =>
                  document
                    .getElementById(
                      'company'
                    )
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                    }),
              ],
              [
                'Education',
                () =>
                  document
                    .getElementById(
                      'education'
                    )
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                    }),
              ],
              [
                'Contact',
                () =>
                  document
                    .getElementById(
                      'contact'
                    )
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                    }),
              ],
            ].map(
              ([label, action]) => (
                <Button
                  key={label as string}
                  onClick={
                    action as () => void
                  }
                  sx={{
                    color:
                      label ===
                      'Home'
                        ? '#fff'
                        : '#b9c7e8',
                    textTransform:
                      'none',
                    fontSize: 12,
                    minWidth: 0,
                    px: 0,
                    fontWeight:
                      label ===
                      'Home'
                        ? 800
                        : 500,
                    '&:hover': {
                      color:
                        '#4da9ff',
                      background:
                        'transparent',
                    },
                  }}
                >
                  {label as string}
                </Button>
              )
            )}
          </Stack>

          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
          >
            <Button
              onClick={goLogin}
              variant="outlined"
              sx={{
                display: {
                  xs: 'none',
                  sm: 'inline-flex',
                },
                color: '#fff',
                borderColor:
                  'rgba(255,255,255,0.35)',
                textTransform:
                  'none',
                fontSize: 12,
                px: 2,
              }}
            >
              Login
            </Button>

            <Button
              onClick={goRegister}
              variant="contained"
              sx={{
                background:
                  'linear-gradient(135deg,#1768ff,#168fff)',
                textTransform:
                  'none',
                fontWeight: 900,
                fontSize: 12,
                px: 2,
                boxShadow:
                  '0 8px 24px rgba(20,100,255,0.25)',
              }}
            >
              Open Account
            </Button>

            <IconButton
              onClick={() =>
                setMobileMenu(
                  !mobileMenu
                )
              }
              sx={{
                display: {
                  xs: 'flex',
                  md: 'none',
                },
                color: '#fff',
              }}
            >
              {mobileMenu ? (
                <CloseIcon />
              ) : (
                <MenuIcon />
              )}
            </IconButton>
          </Stack>
        </Container>

        {/* MOBILE MENU */}

        {mobileMenu && (
          <Box
            sx={{
              display: {
                xs: 'block',
                md: 'none',
              },
              px: 2,
              pb: 2,
              background:
                '#030a20',
              borderTop:
                '1px solid rgba(255,255,255,0.07)',
            }}
          >
            {[
              ['Markets', goMarkets],
              ['Trading', goTrading],
              [
                'About Us',
                () =>
                  document
                    .getElementById(
                      'about'
                    )
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                    }),
              ],
              [
                'Company',
                () =>
                  document
                    .getElementById(
                      'company'
                    )
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                    }),
              ],
              [
                'Education',
                () =>
                  document
                    .getElementById(
                      'education'
                    )
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                    }),
              ],
              [
                'Contact',
                () =>
                  document
                    .getElementById(
                      'contact'
                    )
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                    }),
              ],
            ].map(
              ([label, action]) => (
                <Button
                  key={
                    label as string
                  }
                  fullWidth
                  onClick={() => {
                    (
                      action as () => void
                    )();
                    setMobileMenu(
                      false
                    );
                  }}
                  sx={{
                    justifyContent:
                      'flex-start',
                    color: '#fff',
                    textTransform:
                      'none',
                    py: 1.3,
                  }}
                >
                  {label as string}
                </Button>
              )
            )}
          </Box>
        )}
      </Box>

      {/* ====================================================
          HERO
      ==================================================== */}

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 75% 20%,rgba(19,91,255,0.24),transparent 35%), radial-gradient(circle at 20% 30%,rgba(0,170,255,0.08),transparent 35%), linear-gradient(180deg,#020817 0%,#04112d 100%)',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 5,
              md: 7,
            },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '0.92fr 1.08fr',
              },
              gap: {
                xs: 4,
                lg: 5,
              },
              alignItems: 'center',
            }}
          >
            {/* LEFT */}

            <Box>
              <Typography
                sx={{
                  color: '#2d9dff',
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 1.1,
                  mb: 2,
                }}
              >
                GLOBAL ACCESS. SMARTER
                TRADING.
              </Typography>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: 40,
                    sm: 52,
                    md: 62,
                  },
                  lineHeight: 1.03,
                  fontWeight: 950,
                  letterSpacing: -2,
                  maxWidth: 620,
                }}
              >
                Trade Global Markets
                <br />
                Invest in Your Future
              </Typography>

              <Typography
                sx={{
                  mt: 2.5,
                  color: '#b4c0dc',
                  fontSize: {
                    xs: 14,
                    md: 15,
                  },
                  lineHeight: 1.8,
                  maxWidth: 570,
                }}
              >
                Global Digital Market is
                designed to provide a
                modern environment for
                accessing financial
                markets, monitoring
                positions and managing
                your trading account.
              </Typography>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1.5}
                sx={{
                  mt: 3,
                  width: {
                    xs: '100%',
                    sm: 'auto',
                  },
                }}
              >
                <Button
                  variant="contained"
                  onClick={goRegister}
                  endIcon={
                    <ArrowForwardIcon />
                  }
                  sx={{
                    background:
                      'linear-gradient(135deg,#1768ff,#168fff)',
                    color: '#fff',
                    textTransform:
                      'none',
                    fontWeight: 900,
                    py: 1.35,
                    px: 2.8,
                    boxShadow:
                      '0 12px 35px rgba(20,100,255,0.28)',
                  }}
                >
                  Open Live Account
                </Button>

                <Button
                  variant="outlined"
                  onClick={goTrading}
                  endIcon={
                    <ArrowForwardIcon />
                  }
                  sx={{
                    color: '#fff',
                    borderColor:
                      'rgba(255,255,255,0.35)',
                    textTransform:
                      'none',
                    fontWeight: 800,
                    py: 1.35,
                    px: 2.8,
                  }}
                >
                  Access Trading
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mt: 2.5,
                }}
              >
                <ShieldOutlinedIcon
                  sx={{
                    color: '#64e8a3',
                    fontSize: 18,
                  }}
                />

                <Typography
                  sx={{
                    color: '#b7c4df',
                    fontSize: 11,
                  }}
                >
                  Security-focused account
                  infrastructure
                </Typography>
              </Stack>

              {/* HERO STATS */}

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(4,1fr)',
                  gap: 0,
                  mt: 4,
                  maxWidth: 620,
                }}
              >
                {[
                  ['100K+', 'Active Accounts'],
                  ['150+', 'Market Instruments'],
                  ['24/7', 'Platform Access'],
                  ['99.9%', 'Platform Reliability'],
                ].map(
                  ([value, label]) => (
                    <Box
                      key={label}
                      sx={{
                        pl: 1.5,
                        borderLeft:
                          '1px solid rgba(104,145,225,0.18)',
                      }}
                    >
                      <Typography
                        sx={{
                          color:
                            '#168cff',
                          fontSize: {
                            xs: 18,
                            md: 22,
                          },
                          fontWeight: 950,
                        }}
                      >
                        {value}
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#7d90ba',
                          fontSize: 8,
                          mt: 0.5,
                        }}
                      >
                        {label}
                      </Typography>
                    </Box>
                  )
                )}
              </Box>
            </Box>

            {/* RIGHT TRADING TERMINAL */}

            <Box>
              <Card
                sx={{
                  borderRadius: 4,
                  p: 1.2,
                  background:
                    'linear-gradient(145deg,rgba(10,28,67,0.98),rgba(3,12,33,0.98))',
                  border:
                    '1px solid rgba(95,154,255,0.22)',
                  boxShadow:
                    '0 25px 80px rgba(0,0,0,0.40)',
                }}
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    px: 1,
                    py: 0.8,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: 2,
                        display:
                          'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                        background:
                          'rgba(255,255,255,0.06)',
                      }}
                    >
                      <CandlestickChartIcon
                        sx={{
                          color:
                            '#7ea9ff',
                        }}
                      />
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontSize: 14,
                          fontWeight: 900,
                        }}
                      >
                        EUR/USD
                      </Typography>

                      <Typography
                        sx={{
                          fontSize: 9,
                          color:
                            '#6f83ae',
                        }}
                      >
                        Euro / U.S.
                        Dollar
                      </Typography>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      textAlign:
                        'right',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 17,
                        fontWeight: 950,
                      }}
                    >
                      1.08472
                    </Typography>

                    <Typography
                      sx={{
                        color:
                          '#39db8c',
                        fontSize: 9,
                        fontWeight: 800,
                      }}
                    >
                      +0.00321
                      {' '}
                      (+0.30%)
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={0.6}
                  sx={{
                    px: 1,
                    py: 1,
                    overflowX:
                      'auto',
                  }}
                >
                  {[
                    '1m',
                    '5m',
                    '15m',
                    '1h',
                    '4h',
                    '1D',
                  ].map(
                    (period) => (
                      <Button
                        key={period}
                        size="small"
                        sx={{
                          minWidth: 38,
                          color:
                            period ===
                            '5m'
                              ? '#fff'
                              : '#7890bf',
                          background:
                            period ===
                            '5m'
                              ? 'rgba(56,116,255,0.25)'
                              : 'transparent',
                          fontSize: 9,
                          textTransform:
                            'none',
                          borderRadius: 1,
                        }}
                      >
                        {period}
                      </Button>
                    )
                  )}

                  <Button
                    size="small"
                    sx={{
                      color:
                        '#7890bf',
                      fontSize: 9,
                      textTransform:
                        'none',
                    }}
                  >
                    + Indicators
                  </Button>
                </Stack>

                <TradingChart />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(4,1fr)',
                    gap: 1,
                    mt: 1,
                  }}
                >
                  {displayedMarkets.map(
                    (market) => (
                      <MarketCard
                        key={
                          market.symbol
                        }
                        market={
                          market
                        }
                      />
                    )
                  )}
                </Box>
              </Card>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          GLOBAL ACTIVITY
      ==================================================== */}

      <Box
        sx={{
          background:
            '#031027',
          py: 2.5,
        }}
      >
        <Container maxWidth="xl">
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
              mb: 1.8,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  background:
                    '#36dc89',
                  boxShadow:
                    '0 0 12px rgba(54,220,137,0.8)',
                }}
              />

              <Typography
                sx={{
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 0.6,
                }}
              >
                GLOBAL PLATFORM
                ACTIVITY
              </Typography>
            </Stack>

            <Typography
              sx={{
                color: '#748ab9',
                fontSize: 10,
              }}
            >
              Recent activity display
              • connect to verified
              backend data for live
              reporting
            </Typography>
          </Stack>

          {activityNotice && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                py: 0,
                background:
                  'rgba(22,120,255,0.08)',
                color: '#a9c4ff',
              }}
            >
              {activityNotice}
            </Alert>
          )}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(5, minmax(220px, 1fr))',
                md: 'repeat(5, 1fr)',
              },
              gap: 1.5,
              overflowX: {
                xs: 'auto',
                md: 'visible',
              },
              pb: {
                xs: 1,
                md: 0,
              },
            }}
          >
            {activity.map(
              (item) => (
                <ActivityCard
                  key={item.id}
                  item={item}
                />
              )
            )}
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          PARTNERS / TECHNOLOGY
      ==================================================== */}

      <Box
        sx={{
          py: 2.2,
          background:
            '#061532',
          borderTop:
            '1px solid rgba(100,145,230,0.10)',
          borderBottom:
            '1px solid rgba(100,145,230,0.10)',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2,1fr)',
                sm: 'repeat(3,1fr)',
                md: 'repeat(6,1fr)',
              },
              gap: 1,
            }}
          >
            {[
              'TradingView',
              'Market Data',
              'Dow Jones',
              'pricefeed',
              'cTrader',
              'PrimeXM',
            ].map(
              (name) => (
                <Box
                  key={name}
                  sx={{
                    py: 1.3,
                    textAlign:
                      'center',
                    color:
                      '#9bacce',
                    fontWeight: 900,
                    fontSize: {
                      xs: 10,
                      md: 13,
                    },
                    borderRight:
                      '1px solid rgba(255,255,255,0.05)',
                  }}
                >
                  {name}
                </Box>
              )
            )}
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          BENEFITS
      ==================================================== */}

      <Box
        id="education"
        sx={{
          background: '#fff',
          color: '#071331',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: 1,
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2,1fr)',
                md: 'repeat(5,1fr)',
              },
              gap: 0,
            }}
          >
            <Benefit
              icon={
                <SecurityIcon
                  sx={{
                    fontSize: 31,
                  }}
                />
              }
              title="Secure Platform"
              text="Security-focused systems and protected account access."
            />

            <Benefit
              icon={
                <SpeedIcon
                  sx={{
                    fontSize: 31,
                  }}
                />
              }
              title="Fast Execution"
              text="Modern trading infrastructure designed for efficient order handling."
            />

            <Benefit
              icon={
                <PublicIcon
                  sx={{
                    fontSize: 31,
                  }}
                />
              }
              title="Global Markets"
              text="Access market information and instruments across global regions."
            />

            <Benefit
              icon={
                <SupportAgentIcon
                  sx={{
                    fontSize: 31,
                  }}
                />
              }
              title="Customer Support"
              text="Support resources are available to help with your account."
            />

            <Benefit
              icon={
                <SchoolOutlinedIcon
                  sx={{
                    fontSize: 31,
                  }}
                />
              }
              title="Education"
              text="Learn more about markets, trading concepts and risk management."
            />
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          COMPANY PROFILE
      ==================================================== */}

      <Box
        id="about"
        sx={{
          background:
            'linear-gradient(180deg,#020817,#04112b)',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 5,
              md: 7,
            },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '0.8fr 1.2fr',
              },
              gap: 4,
              alignItems: 'stretch',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection:
                  'column',
                justifyContent:
                  'center',
              }}
            >
              <Typography
                sx={{
                  color: '#168cff',
                  fontSize: 10,
                  fontWeight: 900,
                  letterSpacing: 1,
                }}
              >
                ABOUT GLOBAL DIGITAL
                MARKET
              </Typography>

              <Typography
                sx={{
                  fontSize: {
                    xs: 30,
                    md: 40,
                  },
                  lineHeight: 1.1,
                  fontWeight: 950,
                  mt: 1.5,
                }}
              >
                Empowering Traders
                <br />
                Worldwide
              </Typography>

              <Typography
                sx={{
                  color: '#9eafd1',
                  fontSize: 13,
                  lineHeight: 1.8,
                  mt: 2,
                  maxWidth: 540,
                }}
              >
                Global Digital Market is
                a digital financial
                platform focused on
                providing a professional
                environment for market
                access, account
                management and trading
                technology.
              </Typography>

              <Typography
                sx={{
                  color: '#9eafd1',
                  fontSize: 13,
                  lineHeight: 1.8,
                  mt: 1.5,
                  maxWidth: 540,
                }}
              >
                Our platform brings
                together market
                information, portfolio
                tools and account
                services in one
                streamlined experience
                designed for users
                around the world.
              </Typography>

              <Button
                onClick={() =>
                  document
                    .getElementById(
                      'company'
                    )
                    ?.scrollIntoView({
                      behavior:
                        'smooth',
                    })
                }
                endIcon={
                  <ArrowForwardIcon />
                }
                sx={{
                  alignSelf:
                    'flex-start',
                  mt: 2.5,
                  color: '#fff',
                  background:
                    'linear-gradient(135deg,#1768ff,#168fff)',
                  textTransform:
                    'none',
                  fontWeight: 900,
                  px: 2.5,
                }}
              >
                Learn More About Us
              </Button>
            </Box>

            {/* GLOBAL VISUAL */}

            <Box
              sx={{
                minHeight: {
                  xs: 300,
                  md: 420,
                },
                borderRadius: 4,
                overflow: 'hidden',
                position: 'relative',
                background:
                  'radial-gradient(circle at 50% 45%,rgba(24,129,255,0.35),transparent 28%), linear-gradient(135deg,#051b43,#020817)',
                border:
                  '1px solid rgba(71,146,255,0.18)',
              }}
            >
              {/* WORLD GRID */}

              <Box
                sx={{
                  position:
                    'absolute',
                  inset: 0,
                  opacity: 0.55,
                  backgroundImage:
                    'radial-gradient(circle,rgba(69,151,255,0.45) 1px,transparent 1px)',
                  backgroundSize:
                    '18px 18px',
                  maskImage:
                    'radial-gradient(ellipse at center,black 15%,transparent 70%)',
                }}
              />

              <Box
                sx={{
                  position:
                    'absolute',
                  width: 300,
                  height: 300,
                  borderRadius:
                    '50%',
                  left: '50%',
                  top: '50%',
                  transform:
                    'translate(-50%,-50%)',
                  border:
                    '1px solid rgba(56,156,255,0.35)',
                  boxShadow:
                    'inset 0 0 80px rgba(20,105,255,0.20), 0 0 80px rgba(20,105,255,0.12)',
                }}
              />

              {[
                [
                  'London',
                  '18%',
                  '20%',
                ],
                [
                  'New York',
                  '13%',
                  '48%',
                ],
                [
                  'Dubai',
                  '57%',
                  '32%',
                ],
                [
                  'Singapore',
                  '72%',
                  '62%',
                ],
                [
                  'Sydney',
                  '79%',
                  '78%',
                ],
              ].map(
                ([city, left, top]) => (
                  <Box
                    key={city}
                    sx={{
                      position:
                        'absolute',
                      left,
                      top,
                      display:
                        'flex',
                      alignItems:
                        'center',
                      gap: 0.7,
                    }}
                  >
                    <Box
                      sx={{
                        width: 9,
                        height: 9,
                        borderRadius:
                          '50%',
                        background:
                          '#238dff',
                        boxShadow:
                          '0 0 12px rgba(35,141,255,0.9)',
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 9,
                        color:
                          '#d0e1ff',
                        fontWeight: 800,
                      }}
                    >
                      {city}
                    </Typography>
                  </Box>
                )
              )}

              <Stack
                sx={{
                  position:
                    'absolute',
                  bottom: 22,
                  left: 22,
                }}
              >
                <Typography
                  sx={{
                    color:
                      '#6f8bc6',
                    fontSize: 9,
                    letterSpacing: 1,
                  }}
                >
                  GLOBAL NETWORK
                </Typography>

                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 950,
                    mt: 0.4,
                  }}
                >
                  Connected Markets
                </Typography>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          COMPANY
      ==================================================== */}

      <Box
        id="company"
        sx={{
          background: '#fff',
          color: '#071331',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 5,
              md: 6,
            },
          }}
        >
          <Typography
            sx={{
              color: '#146cff',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            COMPANY PROFILE
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: 28,
                md: 38,
              },
              fontWeight: 950,
              mt: 1,
            }}
          >
            Built around transparency,
            technology and access
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: 'repeat(3,1fr)',
              },
              gap: 2,
              mt: 3,
            }}
          >
            {[
              {
                icon: (
                  <BusinessIcon />
                ),
                title:
                  'Our Mission',
                text:
                  'To create a professional digital environment where users can access market information and manage their trading activities.',
              },
              {
                icon: (
                  <LanguageIcon />
                ),
                title:
                  'Global Reach',
                text:
                  'Our platform is designed with international users in mind, bringing global markets and digital financial tools together.',
              },
              {
                icon: (
                  <AccountBalanceIcon />
                ),
                title:
                  'Professional Infrastructure',
                text:
                  'We focus on dependable platform architecture, account management tools and a clear user experience.',
              },
            ].map(
              (item) => (
                <Card
                  key={item.title}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    background:
                      '#f7f9fd',
                    border:
                      '1px solid #e3e8f2',
                    boxShadow:
                      'none',
                  }}
                >
                  <Box
                    sx={{
                      color:
                        '#1269ff',
                      mb: 1.5,
                    }}
                  >
                    {item.icon}
                  </Box>

                  <Typography
                    sx={{
                      fontSize: 17,
                      fontWeight: 950,
                    }}
                  >
                    {item.title}
                  </Typography>

                  <Typography
                    sx={{
                      color:
                        '#68758e',
                      fontSize: 12,
                      lineHeight: 1.7,
                      mt: 1,
                    }}
                  >
                    {item.text}
                  </Typography>
                </Card>
              )
            )}
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          CTA
      ==================================================== */}

      <Box
        sx={{
          background:
            'linear-gradient(135deg,#062b6b,#084bb3,#061c4c)',
          borderTop:
            '1px solid rgba(91,169,255,0.25)',
          borderBottom:
            '1px solid rgba(91,169,255,0.25)',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 4,
              md: 5,
            },
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            alignItems="center"
            justifyContent="space-between"
            spacing={3}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
                  borderRadius:
                    '50%',
                  display: 'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'center',
                  background:
                    'rgba(255,255,255,0.10)',
                  border:
                    '1px solid rgba(255,255,255,0.25)',
                }}
              >
                <TrendingUpIcon
                  sx={{
                    fontSize: 30,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: 21,
                      md: 25,
                    },
                    fontWeight: 950,
                  }}
                >
                  Ready to Start Your
                  Trading Journey?
                </Typography>

                <Typography
                  sx={{
                    color:
                      '#aec9f8',
                    fontSize: 12,
                    mt: 0.5,
                  }}
                >
                  Create your account and
                  explore the Global Digital
                  Market platform.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.2}
            >
              <Button
                onClick={goRegister}
                variant="contained"
                sx={{
                  background:
                    '#fff',
                  color:
                    '#0750b9',
                  textTransform:
                    'none',
                  fontWeight: 950,
                  px: 3,
                }}
              >
                Open Account
              </Button>

              <Button
                onClick={goLogin}
                variant="outlined"
                sx={{
                  color: '#fff',
                  borderColor:
                    'rgba(255,255,255,0.45)',
                  textTransform:
                    'none',
                  fontWeight: 800,
                  px: 3,
                }}
              >
                Login
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* ====================================================
          FOOTER
      ==================================================== */}

      <Box
        id="contact"
        sx={{
          background:
            '#020817',
          pt: 5,
          pb: 2,
        }}
      >
        <Container
          maxWidth="xl"
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1.5fr repeat(2,1fr)',
                md: '1.5fr repeat(4,1fr)',
              },
              gap: 4,
            }}
          >
            {/* BRAND */}

            <Box>
              <CompanyLogo />

              <Typography
                sx={{
                  color: '#7789b1',
                  fontSize: 11,
                  lineHeight: 1.8,
                  mt: 2,
                  maxWidth: 300,
                }}
              >
                Global Digital Market provides
                a modern digital platform for
                market access, trading tools,
                account management and
                financial education.
              </Typography>
            </Box>

            {/* MARKETS */}

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Markets
              </Typography>

              {[
                'Forex',
                'Commodities',
                'Indices',
                'Stocks',
                'Digital Assets',
              ].map(
                (item) => (
                  <Typography
                    key={item}
                    sx={{
                      color:
                        '#7284aa',
                      fontSize: 10,
                      mb: 1,
                    }}
                  >
                    {item}
                  </Typography>
                )
              )}
            </Box>

            {/* TRADING */}

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Trading
              </Typography>

              {[
                'Platform Overview',
                'Account Types',
                'Spreads & Fees',
                'Trading Tools',
                'Market Analysis',
              ].map(
                (item) => (
                  <Typography
                    key={item}
                    sx={{
                      color:
                        '#7284aa',
                      fontSize: 10,
                      mb: 1,
                    }}
                  >
                    {item}
                  </Typography>
                )
              )}
            </Box>

            {/* COMPANY */}

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Company
              </Typography>

              {[
                'About Us',
                'Our Mission',
                'Partnerships',
                'Careers',
                'News',
              ].map(
                (item) => (
                  <Typography
                    key={item}
                    sx={{
                      color:
                        '#7284aa',
                      fontSize: 10,
                      mb: 1,
                    }}
                  >
                    {item}
                  </Typography>
                )
              )}
            </Box>

            {/* SUPPORT */}

            <Box>
              <Typography
                sx={{
                  fontSize: 12,
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Support
              </Typography>

              {[
                'Help Center',
                'Contact Us',
                'Account Support',
                'Deposit & Withdrawal',
                'FAQ',
              ].map(
                (item) => (
                  <Typography
                    key={item}
                    sx={{
                      color:
                        '#7284aa',
                      fontSize: 10,
                      mb: 1,
                    }}
                  >
                    {item}
                  </Typography>
                )
              )}
            </Box>
          </Box>

          <Divider
            sx={{
              my: 3,
              borderColor:
                'rgba(255,255,255,0.08)',
            }}
          />

          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="space-between"
            spacing={1}
          >
            <Typography
              sx={{
                color: '#596b92',
                fontSize: 9,
              }}
            >
              © {new Date().getFullYear()}{' '}
              Global Digital Market. All
              rights reserved.
            </Typography>

            <Stack
              direction="row"
              spacing={2}
            >
              {[
                'Terms & Conditions',
                'Privacy Policy',
                'Risk Disclosure',
                'AML Policy',
              ].map(
                (item) => (
                  <Typography
                    key={item}
                    sx={{
                      color:
                        '#596b92',
                      fontSize: 9,
                    }}
                  >
                    {item}
                  </Typography>
                )
              )}
            </Stack>

            <Typography
              sx={{
                color: '#8395bb',
                fontSize: 9,
              }}
            >
              🌐 English
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
