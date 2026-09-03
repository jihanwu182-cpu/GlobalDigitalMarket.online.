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
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import BusinessIcon from '@mui/icons-material/Business';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';

import { useNavigate } from 'react-router-dom';

import apiClient from '../services/apiClient';
import logo from '../GlobalDigitalMarket-logo-clean.png';
/* ============================================================
   TYPES
============================================================ */

interface MarketItem {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
}

/* ============================================================
   SUPPORT EMAIL
============================================================ */

const SUPPORT_EMAIL =
  'support@globaldigitalmarket.online';

/* ============================================================
   DEFAULT MARKET DATA
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
   LOGO
============================================================ */
const CompanyLogo: React.FC<{
  compact?: boolean;
}> = ({ compact = false }) => {
  return (
    <Box
      component="img"
      src={logo}
      alt="GlobalDigitalMarket"
      sx={{
        width: compact ? 150 : 190,
        height: compact ? 70 : 82,
        objectFit: 'contain',
        display: 'block',
      }}
    />
  );
};

/* ============================================================
   MOVING MARKET TICKER
============================================================ */

const MarketTicker: React.FC<{
  markets: MarketItem[];
}> = ({ markets }) => {
  const tickerItems = [...markets, ...markets];

  return (
    <Box
      sx={{
        overflow: 'hidden',
        background:
          'linear-gradient(90deg,#06132f,#071b42,#06132f)',
        borderTop:
          '1px solid rgba(91,149,255,0.12)',
        borderBottom:
          '1px solid rgba(91,149,255,0.12)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: 'max-content',
          animation:
            'globalMarketTicker 32s linear infinite',
          '@keyframes globalMarketTicker': {
            from: {
              transform: 'translateX(0)',
            },
            to: {
              transform: 'translateX(-50%)',
            },
          },
        }}
      >
        {tickerItems.map(
          (market, index) => (
            <Stack
              key={`${market.symbol}-${index}`}
              direction="row"
              alignItems="center"
              spacing={1.2}
              sx={{
                minWidth: {
                  xs: 220,
                  sm: 270,
                },
                px: 2.5,
                py: 1.1,
                borderRight:
                  '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Typography
                sx={{
                  color: '#5ce8ff',
                  fontSize: 11,
                  fontWeight: 900,
                }}
              >
                {market.symbol}
              </Typography>

              <Typography
                sx={{
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {market.price}
              </Typography>

              <Typography
                sx={{
                  color: market.positive
                    ? '#45df91'
                    : '#ff7188',
                  fontSize: 10,
                  fontWeight: 900,
                }}
              >
                {market.change}
              </Typography>

              {market.positive ? (
                <TrendingUpIcon
                  sx={{
                    fontSize: 16,
                    color: '#45df91',
                  }}
                />
              ) : null}
            </Stack>
          )
        )}
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
        borderRadius: 2.5,
        p: 1.7,
        color: '#fff',
        background:
          'rgba(7,21,53,0.92)',
        border:
          '1px solid rgba(91,149,255,0.20)',
      }}
    >
      <Typography
        sx={{
          color: '#5ce8ff',
          fontSize: 11,
          fontWeight: 900,
        }}
      >
        {market.symbol}
      </Typography>

      <Typography
        sx={{
          color: '#7086bc',
          fontSize: 9,
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
          mt: 1.2,
        }}
      >
        <Typography
          sx={{
            fontSize: 14,
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
          xs: 210,
          md: 330,

        },
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        background:
           'rgba(2,11,32,0.38)',
        border:
          '1px solid rgba(105,145,230,0.15)',
      }}
    >
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

      <Stack
        sx={{
          position: 'absolute',
          right: 8,
          top: 35,
          bottom: 35,
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
          top: 30,
          width:
            'calc(100% - 55px)',
          height:
            'calc(100% - 65px)',
        }}
      >
        <defs>
          <linearGradient
            id="chartAreaHome"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#168fff"
              stopOpacity="0.30"
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
          fill="url(#chartAreaHome)"
        />

        <polyline
          points={linePoints}
          fill="none"
          stroke="#26a9ff"
          strokeWidth="2.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

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
    </Box>
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
    markets,
    setMarkets,
  ] = useState<MarketItem[]>(
    defaultMarkets
  );

  const [
    marketNotice,
    setMarketNotice,
  ] = useState('');

  /* ==========================================================
     LOAD PUBLIC MARKET DATA
  ========================================================== */

  useEffect(() => {
    let active = true;

    const loadMarkets = async () => {
      try {
        const response =
          await apiClient.get(
            '/public/market-summary'
          );

        if (!active) {
          return;
        }

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
        /*
         * If the public endpoint is not
         * available, the default market
         * display remains visible.
         */
      }
    };

    loadMarkets();

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

  const goSupport = () => {
    setMobileMenu(false);
    navigate('/support');
  };

  const openEmail = () => {
    window.location.href =
      `mailto:${SUPPORT_EMAIL}?subject=Global Digital Market Support`;
  };

  const scrollToSection = (
    id: string
  ) => {
    setMobileMenu(false);

    document
      .getElementById(id)
      ?.scrollIntoView({
        behavior: 'smooth',
      });
  };

  const displayedMarkets =
    useMemo(
      () =>
        markets.slice(0, 4),
      [markets]
    );

  /*
   * Small status message showing
   * that the market display can refresh.
   */
  useEffect(() => {
    const timer =
      window.setInterval(() => {
        setMarketNotice(
          'Market display refreshed'
        );

        window.setTimeout(() => {
          setMarketNotice('');
        }, 2200);
      }, 30000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

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
            'rgba(1,7,22,0.96)',
          backdropFilter:
            'blur(18px)',
          borderBottom:
            '1px solid rgba(112,145,220,0.14)',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            minHeight: 68,
            display: 'flex',
            alignItems: 'center',
            justifyContent:
              'space-between',
            gap: 2,
          }}
        >
          <CompanyLogo />

          {/* DESKTOP NAV */}

          <Stack
            direction="row"
            spacing={2.5}
            alignItems="center"
            sx={{
              display: {
                xs: 'none',
                lg: 'flex',
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
              sx={navButtonSx}
            >
              Home
            </Button>

            <Button
              onClick={goMarkets}
              sx={navButtonSx}
            >
              Markets
            </Button>

            <Button
              onClick={goTrading}
              sx={navButtonSx}
            >
              Trading
            </Button>

            <Button
              onClick={() =>
                scrollToSection('about')
              }
              sx={navButtonSx}
            >
              About Us
            </Button>

            <Button
  onClick={() => {
    setMobileMenu(false);
    navigate('/company');
  }}
  sx={navButtonSx}
>
  Company
</Button>

            <Button
              onClick={() =>
                scrollToSection('education')
              }
              sx={navButtonSx}
            >
              Education
            </Button>

            <Button
              onClick={() =>
                scrollToSection('contact')
              }
              sx={navButtonSx}
            >
              Contact
            </Button>
          </Stack>

          <Stack
            direction="row"
            spacing={1}
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
                textTransform: 'none',
                fontSize: 12,
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
                textTransform: 'none',
                fontWeight: 900,
                fontSize: 12,
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
                  lg: 'none',
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
                lg: 'none',
              },
              px: 2,
              pb: 2,
              background:
                '#030a20',
              borderTop:
                '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <Button
              fullWidth
              onClick={() => {
                setMobileMenu(false);
                window.scrollTo({
                  top: 0,
                  behavior: 'smooth',
                });
              }}
              sx={mobileNavButtonSx}
            >
              Home
            </Button>

            <Button
              fullWidth
              onClick={goMarkets}
              sx={mobileNavButtonSx}
            >
              Markets
            </Button>

            <Button
              fullWidth
              onClick={goTrading}
              sx={mobileNavButtonSx}
            >
              Trading
            </Button>

            <Button
              fullWidth
              onClick={() =>
                scrollToSection('about')
              }
              sx={mobileNavButtonSx}
            >
              About Us
            </Button>

            <Button
  fullWidth
  onClick={() => {
    setMobileMenu(false);
    navigate('/company');
  }}
  sx={mobileNavButtonSx}
>
  Company
</Button>

            <Button
              fullWidth
              onClick={() =>
                scrollToSection('education')
              }
              sx={mobileNavButtonSx}
            >
              Education
            </Button>

            <Button
              fullWidth
              onClick={() =>
                scrollToSection('contact')
              }
              sx={mobileNavButtonSx}
            >
              Contact
            </Button>
          </Box>
        )}
      </Box>

      {/* ====================================================
          MOVING MARKET VALUE BAR
      ==================================================== */}

      <MarketTicker
        markets={markets}
      />

      {/* ====================================================
          HERO
      ==================================================== */}

<Box
  sx={{
    position: 'relative',
    overflow: 'hidden',
    background:
      'radial-gradient(circle at 78% 18%, rgba(25,105,255,0.34), transparent 28%), radial-gradient(circle at 15% 25%, rgba(0,183,255,0.14), transparent 30%), radial-gradient(circle at 55% 85%, rgba(212,166,70,0.08), transparent 30%), linear-gradient(135deg, #010716 0%, #031331 45%, #061b45 100%)',
    '&::before': {
      content: '""',
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage:
  'linear-gradient(90deg, rgba(1,7,22,0.96) 0%, rgba(1,12,35,0.82) 42%, rgba(1,10,28,0.25) 100%), url("/global-market-hero.png.PNG")',
backgroundSize: {
  xs: 'auto 100%',
  md: 'cover',
},
backgroundPosition: {
  xs: '75% center',
  md: 'center',
},
backgroundRepeat: 'no-repeat',
    },
    '&::after': {
      content: '""',
      position: 'absolute',
      width: {
        xs: 360,
        md: 650,
      },
      height: {
        xs: 360,
        md: 650,
      },
      right: {
        xs: '-170px',
        md: '-210px',
      },
      top: {
        xs: '120px',
        md: '40px',
      },
      borderRadius: '50%',
      border:
        '1px solid rgba(91,160,255,0.12)',
      boxShadow:
        '0 0 80px rgba(30,115,255,0.08), inset 0 0 80px rgba(30,115,255,0.05)',
      pointerEvents: 'none',
    },
  }}
>

  
        
      
        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 5,
              md: 8,
            },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '0.95fr 1.05fr',
              },
              gap: 5,
              alignItems: 'center',
            }}
          >
            
             {/* LEFT HERO */}
<Box>
  <Stack
    direction="row"
    spacing={1}
    alignItems="center"
    sx={{
      mb: 1.5,
    }}
  >
          
    <Typography
      sx={{
        color: '#d4a646',
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 2,
      }}
    >
      EST. 2018
    </Typography>

    <Box
      sx={{
        width: 34,
        height: 1,
        background:
          'linear-gradient(90deg, #d4a646, rgba(212,166,70,0))',
      }}
    />
  </Stack>


  
           
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  mb: 2,
                }}
              >
                <Chip
                  icon={
                    <TrendingUpIcon />
                  }
                  label="GLOBAL MARKETS"
                  size="small"
                  sx={{
                    color: '#67e9ff',
                    background:
                      'rgba(35,135,255,0.12)',
                    border:
                      '1px solid rgba(92,232,255,0.18)',
                    fontWeight: 900,
                  }}
                />
              </Stack>

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: 39,
                    sm: 51,
                    md: 64,
                  },
                  lineHeight: 1.02,
                  fontWeight: 950,
                  letterSpacing: -2.3,
                  maxWidth: 650,
                }}
              >
                A Broker Built
                <br />
                for Traders
                <br />
                and Investors
              </Typography>

              <Typography
                sx={{
                  mt: 2.5,
                  color: '#b4c0dc',
                  fontSize: {
                    xs: 14,
                    md: 15,
                  },
                  lineHeight: 1.85,
                  maxWidth: 610,
                }}
              >
                GlobalDigitalMarket.online
                provides access to global
                financial markets through
                contracts for difference
                (CFDs) on forex, indices,
                commodities and shares.
              </Typography>

              <Typography
                sx={{
                  mt: 1.5,
                  color: '#b4c0dc',
                  fontSize: {
                    xs: 14,
                    md: 15,
                  },
                  lineHeight: 1.85,
                  maxWidth: 610,
                }}
              >
                We exist to give traders a
                transparent,
                technology-driven
                environment where pricing
                is clear, execution is
                reliable and support is
                genuinely responsive — so
                you can focus on the markets,
                not the mechanics of your
                broker.
              </Typography>

              <Typography
                sx={{
                  mt: 1.5,
                  color: '#b4c0dc',
                  fontSize: {
                    xs: 14,
                    md: 15,
                  },
                  lineHeight: 1.85,
                  maxWidth: 610,
                }}
              >
                We are committed to long-term
                relationships, not one-off
                trades. That means investing
                in the infrastructure,
                education and service that
                help clients trade with
                confidence over time.
              </Typography>

              {/* HERO BUTTONS */}

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
                  onClick={goRegister}
                  endIcon={
                    <ArrowForwardIcon />
                  }
                  sx={{
                    background:
                      'linear-gradient(135deg,#1768ff,#168fff)',
                    color: '#fff',
                    textTransform: 'none',
                    fontWeight: 900,
                    py: 1.45,
                    px: 2.8,
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
                    textTransform: 'none',
                    fontWeight: 800,
                    py: 1.45,
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
            </Box>

            {/* RIGHT MARKET TERMINAL */}

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
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    px: 1,
                    py: 1,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background:
                          'rgba(255,255,255,0.06)',
                      }}
                    >
                      <CandlestickChartIcon
                        sx={{
                          color: '#7ea9ff',
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
                          color: '#6f83ae',
                        }}
                      >
                        Euro / U.S. Dollar
                      </Typography>
                    </Box>
                  </Stack>

                  <Box
                    sx={{
                      textAlign: 'right',
                    }}
                  >
                    <Typography
                      sx={{
                        fontSize: 19,
                        fontWeight: 950,
                      }}
                    >
                      1.08472
                    </Typography>

                    <Typography
                      sx={{
                        color: '#39db8c',
                        fontSize: 10,
                        fontWeight: 800,
                      }}
                    >
                      +0.00321 (+0.30%)
                    </Typography>
                  </Box>
                </Stack>

                <Stack
                  direction="row"
                  spacing={0.5}
                  sx={{
                    px: 1,
                    py: 1,
                    overflowX: 'auto',
                  }}
                >
                  {[
                    '1m',
                    '5m',
                    '15m',
                    '1h',
                    '4h',
                    '1D',
                  ].map((period) => (
                    <Button
                      key={period}
                      size="small"
                      sx={{
                        minWidth: 38,
                        color:
                          period === '5m'
                            ? '#fff'
                            : '#7890bf',
                        background:
                          period === '5m'
                            ? 'rgba(56,116,255,0.25)'
                            : 'transparent',
                        fontSize: 9,
                        textTransform: 'none',
                      }}
                    >
                      {period}
                    </Button>
                  ))}
                </Stack>

                <TradingChart />

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2,1fr)',
                      sm: 'repeat(4,1fr)',
                    },
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
                        market={market}
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
          MARKET STATUS
      ==================================================== */}

      {marketNotice && (
        <Container
          maxWidth="xl"
          sx={{
            mt: 2,
          }}
        >
          <Alert
            severity="info"
            sx={{
              background:
                'rgba(22,120,255,0.08)',
              color: '#a9c4ff',
            }}
          >
            {marketNotice}
          </Alert>
        </Container>
      )}

      {/* ====================================================
          SUPPORT STRIP
      ==================================================== */}

      <Box
        sx={{
          background:
            'linear-gradient(135deg,#06204d,#071b42)',
          py: 2.5,
          borderTop:
            '1px solid rgba(100,150,255,0.12)',
          borderBottom:
            '1px solid rgba(100,150,255,0.12)',
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            alignItems={{
              xs: 'flex-start',
              md: 'center',
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'rgba(92,232,255,0.10)',
                }}
              >
                <SupportAgentIcon
                  sx={{
                    color: '#5ce8ff',
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: 16,
                    fontWeight: 900,
                  }}
                >
                  Need Help?
                </Typography>

                <Typography
                  sx={{
                    color: '#8298c9',
                    fontSize: 11,
                  }}
                >
                  Our support team is here to
                  help with your account.
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1}
              sx={{
                width: {
                  xs: '100%',
                  sm: 'auto',
                },
              }}
            >
              <Button
                onClick={goSupport}
                variant="contained"
                startIcon={
                  <SupportAgentIcon />
                }
                sx={{
                  background:
                    'linear-gradient(135deg,#1768ff,#168fff)',
                  textTransform: 'none',
                  fontWeight: 900,
                }}
              >
                Live Chat Support
              </Button>

              <Button
                onClick={openEmail}
                variant="outlined"
                startIcon={
                  <EmailOutlinedIcon />
                }
                sx={{
                  color: '#fff',
                  borderColor:
                    'rgba(255,255,255,0.30)',
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Email Support
              </Button>
            </Stack>
          </Stack>
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
            }}
          >
            <Benefit
              icon={
                <SecurityIcon
                  sx={{ fontSize: 31 }}
                />
              }
              title="Secure Platform"
              text="Security-focused systems and protected account access."
            />

            <Benefit
              icon={
                <SpeedIcon
                  sx={{ fontSize: 31 }}
                />
              }
              title="Fast Execution"
              text="Modern trading infrastructure designed for efficient order handling."
            />

            <Benefit
              icon={
                <PublicIcon
                  sx={{ fontSize: 31 }}
                />
              }
              title="Global Markets"
              text="Access market information and instruments across global regions."
            />

            <Benefit
              icon={
                <SupportAgentIcon
                  sx={{ fontSize: 31 }}
                />
              }
              title="Responsive Support"
              text="Get assistance through live chat and email support."
            />

            <Benefit
              icon={
                <SchoolOutlinedIcon
                  sx={{ fontSize: 31 }}
                />
              }
              title="Education"
              text="Learn more about markets, trading concepts and risk management."
            />
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          ABOUT US
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
          <Typography
            sx={{
              color: '#168cff',
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: 1,
            }}
          >
            ABOUT GLOBAL DIGITAL MARKET
          </Typography>

          <Typography
            sx={{
              fontSize: {
                xs: 30,
                md: 42,
              },
              lineHeight: 1.1,
              fontWeight: 950,
              mt: 1.5,
              maxWidth: 750,
            }}
          >
            Built for traders and
            investors who expect more.
          </Typography>

          <Typography
            sx={{
              color: '#9eafd1',
              fontSize: 14,
              lineHeight: 1.9,
              mt: 2,
              maxWidth: 760,
            }}
          >
            GlobalDigitalMarket.online
            provides access to global
            financial markets through
            contracts for difference
            (CFDs) on forex, indices,
            commodities and shares.
          </Typography>

          <Typography
            sx={{
              color: '#9eafd1',
              fontSize: 14,
              lineHeight: 1.9,
              mt: 1.5,
              maxWidth: 760,
            }}
          >
            We exist to give traders a
            transparent,
            technology-driven environment
            where pricing is clear,
            execution is reliable and
            support is genuinely
            responsive.
          </Typography>

          <Typography
            sx={{
              color: '#9eafd1',
              fontSize: 14,
              lineHeight: 1.9,
              mt: 1.5,
              maxWidth: 760,
            }}
          >
            We are committed to long-term
            relationships, not one-off
            trades. That means investing
            in infrastructure, education
            and service that help clients
            trade with confidence over
            time.
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
              onClick={goRegister}
              variant="contained"
              endIcon={
                <ArrowForwardIcon />
              }
              sx={{
                background:
                  'linear-gradient(135deg,#1768ff,#168fff)',
                textTransform: 'none',
                fontWeight: 900,
              }}
            >
              Open an Account
            </Button>

            <Button
              onClick={goSupport}
              variant="outlined"
              startIcon={
                <SupportAgentIcon />
              }
              sx={{
                color: '#fff',
                borderColor:
                  'rgba(255,255,255,0.30)',
                textTransform: 'none',
                fontWeight: 800,
              }}
            >
              Contact Support
            </Button>
          </Stack>
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
            Transparency,
            technology and access.
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
            <CompanyCard
              icon={<BusinessIcon />}
              title="Our Mission"
              text="To provide a professional environment where traders and investors can access market information and manage their trading activities."
            />

            <CompanyCard
              icon={<LanguageIcon />}
              title="Global Access"
              text="Our platform is designed for users who want access to global financial markets through modern digital technology."
            />

            <CompanyCard
              icon={<AccountBalanceWalletIcon />}
              title="Long-Term Service"
              text="We focus on infrastructure, education and responsive support designed around lasting client relationships."
            />
          </Box>
        </Container>
      </Box>
{/* ====================================================
    TESTIMONIALS
==================================================== */}

<Box
  id="testimonials"
  sx={{
    background:
      'linear-gradient(180deg,#f7f9fd,#ffffff)',
    color: '#071331',
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
        textAlign: 'center',
        maxWidth: 760,
        mx: 'auto',
      }}
    >
      <Typography
        sx={{
          color: '#146cff',
          fontSize: 10,
          fontWeight: 900,
          letterSpacing: 1.5,
        }}
      >
        CLIENT EXPERIENCE
      </Typography>

      <Typography
        sx={{
          fontSize: {
            xs: 28,
            md: 40,
          },
          fontWeight: 950,
          mt: 1,
        }}
      >
        What Our Clients Say
      </Typography>

      <Typography
        sx={{
          color: '#68758f',
          fontSize: 14,
          lineHeight: 1.8,
          mt: 1.5,
        }}
      >
        Genuine customer experiences will be
        displayed here as verified testimonials
        become available.
      </Typography>
    </Box>

    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          md: 'repeat(3,1fr)',
        },
        gap: 2,
        mt: 4,
      }}
    >
      {[
        {
          name: 'Customer 1',
          country: 'Global Client',
        },
        {
          name: 'Customer 2',
          country: 'Global Client',
        },
        {
          name: 'Customer 3',
          country: 'Global Client',
        },
      ].map((testimonial) => (
        <Card
          key={testimonial.name}
          sx={{
            p: 3,
            borderRadius: 3,
            background:
              'rgba(255,255,255,0.96)',
            border:
              '1px solid #e1e7f0',
            boxShadow:
              '0 12px 35px rgba(7,19,49,0.07)',
          }}
        >
          <Typography
            sx={{
              color: '#d3a63f',
              fontSize: 18,
              letterSpacing: 2,
            }}
          >
            ★★★★★
          </Typography>

          <Typography
            sx={{
              color: '#68758f',
              fontSize: 13,
              lineHeight: 1.8,
              mt: 2,
            }}
          >
            Genuine customer testimonial will
            be displayed here.
          </Typography>

          <Typography
            sx={{
              fontSize: 14,
              fontWeight: 900,
              mt: 2.5,
            }}
          >
            {testimonial.name}
          </Typography>

          <Typography
            sx={{
              color: '#8490a7',
              fontSize: 10,
              mt: 0.4,
            }}
          >
            {testimonial.country}
          </Typography>
        </Card>
      ))}
    </Box>

    <Box
      sx={{
        textAlign: 'center',
        mt: 3,
      }}
    >
      <Button
        onClick={() => navigate('/company')}
        endIcon={<ArrowForwardIcon />}
        sx={{
          color: '#146cff',
          fontWeight: 900,
          textTransform: 'none',
        }}
      >
        View All Client Testimonials
      </Button>
    </Box>
  </Container>
</Box>
      {/* ====================================================
          SUPPORT
      ==================================================== */}

      <Box
        sx={{
          background:
            'linear-gradient(135deg,#062b6b,#084bb3,#061c4c)',
          py: {
            xs: 5,
            md: 6,
          },
        }}
      >
        <Container maxWidth="md">
          <Box
            sx={{
              textAlign: 'center',
            }}
          >
            <SupportAgentIcon
              sx={{
                fontSize: 48,
                color: '#5ce8ff',
              }}
            />

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
              We're Here to Help
            </Typography>

            <Typography
              sx={{
                color: '#b7cdf8',
                fontSize: 14,
                lineHeight: 1.8,
                mt: 1.5,
              }}
            >
              Have a question about your
              account, trading or the
              platform? Contact our support
              team.
            </Typography>

            <Typography
              sx={{
                color: '#fff',
                fontSize: 15,
                fontWeight: 800,
                mt: 2,
              }}
            >
              {SUPPORT_EMAIL}
            </Typography>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              justifyContent="center"
              spacing={1.5}
              sx={{
                mt: 3,
              }}
            >
              <Button
                onClick={goSupport}
                variant="contained"
                startIcon={
                  <SupportAgentIcon />
                }
                sx={{
                  background: '#fff',
                  color: '#0750b9',
                  textTransform: 'none',
                  fontWeight: 950,
                  px: 3,
                }}
              >
                Start Live Chat
              </Button>

              <Button
                onClick={openEmail}
                variant="outlined"
                startIcon={
                  <EmailOutlinedIcon />
                }
                sx={{
                  color: '#fff',
                  borderColor:
                    'rgba(255,255,255,0.45)',
                  textTransform: 'none',
                  fontWeight: 900,
                  px: 3,
                }}
              >
                Email Support
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          FOOTER
      ==================================================== */}

      <Box
        id="contact"
        sx={{
          background: '#020817',
          pt: 5,
          pb: 2,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '1.5fr repeat(2,1fr)',
                md: '1.5fr repeat(3,1fr)',
              },
              gap: 4,
            }}
          >
            <Box>
              <CompanyLogo />

              <Typography
                sx={{
                  color: '#7789b1',
                  fontSize: 11,
                  lineHeight: 1.8,
                  mt: 2,
                  maxWidth: 330,
                }}
              >
                GlobalDigitalMarket.online
                provides access to global
                financial markets through a
                modern technology-driven
                environment for traders and
                investors.
              </Typography>
            </Box>

            <FooterColumn
              title="Markets"
              items={[
                'Forex',
                'Commodities',
                'Indices',
                'Shares',
                'CFDs',
              ]}
            />

            <FooterColumn
              title="Trading"
              items={[
                'Trading Platform',
                'Market Information',
                'Trading Tools',
                'Account Management',
                'Risk Management',
              ]}
            />

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

              <Button
                onClick={goSupport}
                startIcon={
                  <SupportAgentIcon />
                }
                sx={footerButtonSx}
              >
                Live Chat Support
              </Button>

              <Button
                onClick={openEmail}
                startIcon={
                  <EmailOutlinedIcon />
                }
                sx={footerButtonSx}
              >
                Email Support
              </Button>

              <Typography
                sx={{
                  color: '#7284aa',
                  fontSize: 10,
                  mt: 1,
                  wordBreak:
                    'break-word',
                }}
              >
                {SUPPORT_EMAIL}
              </Typography>
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

            <Typography
              sx={{
                color: '#596b92',
                fontSize: 9,
              }}
            >
              GlobalDigitalMarket.online
            </Typography>

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

/* ============================================================
   COMPANY CARD
============================================================ */

const CompanyCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  text: string;
}> = ({
  icon,
  title,
  text,
}) => {
  return (
    <Card
      sx={{
        p: 2.5,
        borderRadius: 3,
        background: '#f7f9fd',
        border:
          '1px solid #e3e8f2',
        boxShadow: 'none',
      }}
    >
      <Box
        sx={{
          color: '#1269ff',
          mb: 1.5,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 17,
          fontWeight: 950,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          color: '#68758e',
          fontSize: 12,
          lineHeight: 1.7,
          mt: 1,
        }}
      >
        {text}
      </Typography>
    </Card>
  );
};

/* ============================================================
   FOOTER COLUMN
============================================================ */

const FooterColumn: React.FC<{
  title: string;
  items: string[];
}> = ({
  title,
  items,
}) => {
  return (
    <Box>
      <Typography
        sx={{
          fontSize: 12,
          fontWeight: 900,
          mb: 1.5,
        }}
      >
        {title}
      </Typography>

      {items.map((item) => (
        <Typography
          key={item}
          sx={{
            color: '#7284aa',
            fontSize: 10,
            mb: 1,
          }}
        >
          {item}
        </Typography>
      ))}
    </Box>
  );
};

/* ============================================================
   STYLES
============================================================ */

const navButtonSx = {
  color: '#b9c7e8',
  textTransform: 'none',
  fontSize: 12,
  minWidth: 0,
  px: 0,
  fontWeight: 600,
  '&:hover': {
    color: '#4da9ff',
    background: 'transparent',
  },
};

const mobileNavButtonSx = {
  justifyContent: 'flex-start',
  color: '#fff',
  textTransform: 'none',
  py: 1.3,
};

const footerButtonSx = {
  display: 'flex',
  justifyContent: 'flex-start',
  color: '#7284aa',
  textTransform: 'none',
  fontSize: 10,
  px: 0,
  mb: 0.5,
  '&:hover': {
    color: '#5ce8ff',
    background: 'transparent',
  },
};

export default Home;
