import React, {
  useEffect,
  useMemo,
  useState,
} from 'react';
import logo from '../Logo.png.PNG';
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
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import PublicIcon from '@mui/icons-material/Public';

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
}

interface PerformanceData {
  totalValue: number;
  totalGain: number;
  gainPercentage: number;
  deposit: number;
  profits: number;
  availableBalance: number;
  bonus: number;
  referrerBonus: number;
  buyingPower: number;
  marginAvailable: number;
  totalHoldingsValue: number;
}

interface AccountData {
  id?: number;
  balance?: number;
  deposit?: number;
  profits?: number;
  availableBalance?: number;
  bonus?: number;
  referrerBonus?: number;
  buyingPower?: number;
  marginAvailable?: number;
  status?: string;
}

interface Holding {
  id?: number;
  symbol: string;
  quantity: number;
  average_cost: number;
  current_price: number;
  market_value: number;
  gain_loss: number;
  gain_loss_percent: number;
  last_updated?: string;
}

interface Allocation {
  symbol: string;
  value: number;
  percentage: number;
}

interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

/* ============================================================
   DEMO MARKET DATA
   Replace with real market API later.
============================================================ */

const initialMarkets: MarketItem[] = [
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    price: 1.1742,
    change: 0.0028,
    changePercent: 0.24,
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    price: 1.3471,
    change: 0.0041,
    changePercent: 0.31,
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    price: 148.42,
    change: -0.36,
    changePercent: -0.24,
  },
  {
    symbol: 'XAU/USD',
    name: 'Gold / US Dollar',
    price: 3408.5,
    change: 12.6,
    changePercent: 0.37,
  },
  {
    symbol: 'NAS100',
    name: 'NASDAQ 100',
    price: 23542.8,
    change: 86.4,
    changePercent: 0.37,
  },
  {
    symbol: 'SPX500',
    name: 'S&P 500',
    price: 6458.2,
    change: 21.5,
    changePercent: 0.33,
  },
];

/* ============================================================
   QUICK CARD
============================================================ */

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
   STAT CARD
============================================================ */

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  subtitle?: string;
  positive?: boolean;
  negative?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  positive,
  negative,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        color: '#fff',
        background:
          'linear-gradient(145deg,#101f63,#08143f)',
        border:
          '1px solid rgba(100,150,255,0.20)',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              sx={{
                color: '#8198df',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.7,
                textTransform: 'uppercase',
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: {
                  xs: 22,
                  sm: 26,
                },
                fontWeight: 900,
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                sx={{
                  mt: 0.5,
                  color: positive
                    ? '#58f39b'
                    : negative
                    ? '#ff8297'
                    : '#8198df',
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
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
        </Stack>
      </CardContent>
    </Card>
  );
};

/* ============================================================
   MARKET TICKER
============================================================ */

interface MarketTickerProps {
  markets: MarketItem[];
}

const MarketTicker: React.FC<MarketTickerProps> = ({
  markets,
}) => {
  return (
    <Box
      sx={{
        width: '100%',
        overflow: 'hidden',
        borderTop:
          '1px solid rgba(110,160,255,0.12)',
        borderBottom:
          '1px solid rgba(110,160,255,0.12)',
        background:
          'rgba(3,10,38,0.78)',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          width: 'max-content',
          animation:
            'marketTicker 35s linear infinite',
          '@keyframes marketTicker': {
            from: {
              transform: 'translateX(0)',
            },
            to: {
              transform:
                'translateX(-50%)',
            },
          },
        }}
      >
        {[...markets, ...markets].map(
          (market, index) => (
            <Box
              key={`${market.symbol}-${index}`}
              sx={{
                minWidth: {
                  xs: 170,
                  sm: 205,
                },
                px: 2,
                py: 1.25,
                borderRight:
                  '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Typography
                  sx={{
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {market.symbol}
                </Typography>

                <Typography
                  sx={{
                    color:
                      market.changePercent >=
                      0
                        ? '#58f39b'
                        : '#ff8297',
                    fontSize: 11,
                    fontWeight: 900,
                  }}
                >
                  {market.changePercent >=
                  0
                    ? '▲'
                    : '▼'}{' '}
                  {Math.abs(
                    market.changePercent
                  ).toFixed(2)}
                  %
                </Typography>
              </Stack>

              <Typography
                sx={{
                  color: '#a9b9eb',
                  fontSize: 12,
                  mt: 0.3,
                }}
              >
                {market.price.toLocaleString(
                  'en-US',
                  {
                    maximumFractionDigits: 4,
                  }
                )}
              </Typography>
            </Box>
          )
        )}
      </Box>
    </Box>
  );
};

/* ============================================================
   MAIN DASHBOARD
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

  const [profile, setProfile] =
    useState<UserProfile>({
      name: '',
      email: '',
      username: '',
      accountId: '',
    });

  const [performance, setPerformance] =
    useState<PerformanceData>({
      totalValue: 0,
      totalGain: 0,
      gainPercentage: 0,
      deposit: 0,
      profits: 0,
      availableBalance: 0,
      bonus: 0,
      referrerBonus: 0,
      buyingPower: 0,
      marginAvailable: 0,
      totalHoldingsValue: 0,
    });

  const [account, setAccount] =
    useState<AccountData | null>(null);

  const [holdings, setHoldings] =
    useState<Holding[]>([]);

  const [allocation, setAllocation] =
    useState<Allocation[]>([]);

  const [markets, setMarkets] =
    useState<MarketItem[]>(
      initialMarkets
    );

  /* ==========================================================
     PROFILE
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
        localStorage.getItem(
          'authToken'
        ) ||
        localStorage.getItem(
          'accessToken'
        ) ||
        localStorage.getItem(
          'token'
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

  /* ==========================================================
     DASHBOARD API
  ========================================================== */

  const loadDashboardData =
    async () => {
      try {
        setLoading(true);
        setError('');

        const [
          performanceResponse,
          accountResponse,
          holdingsResponse,
          allocationResponse,
        ] = await Promise.all([
          apiClient.get(
            '/portfolio/performance'
          ),

          apiClient.get(
            '/portfolio/account'
          ),

          apiClient.get(
            '/portfolio/holdings'
          ),

          apiClient.get(
            '/portfolio/allocation'
          ),
        ]);

        const performanceData =
          performanceResponse.data ||
          {};

        setPerformance({
          totalValue:
            Number(
              performanceData.totalValue
            ) || 0,

          totalGain:
            Number(
              performanceData.totalGain
            ) || 0,

          gainPercentage:
            Number(
              performanceData.gainPercentage
            ) || 0,

          deposit:
            Number(
              performanceData.deposit
            ) || 0,

          profits:
            Number(
              performanceData.profits
            ) || 0,

          availableBalance:
            Number(
              performanceData.availableBalance
            ) || 0,

          bonus:
            Number(
              performanceData.bonus
            ) || 0,

          referrerBonus:
            Number(
              performanceData.referrerBonus
            ) || 0,

          buyingPower:
            Number(
              performanceData.buyingPower
            ) || 0,

          marginAvailable:
            Number(
              performanceData.marginAvailable
            ) || 0,

          totalHoldingsValue:
            Number(
              performanceData.totalHoldingsValue
            ) || 0,
        });

        setAccount(
          accountResponse.data?.account ||
            null
        );

        setHoldings(
          Array.isArray(
            holdingsResponse.data?.holdings
          )
            ? holdingsResponse.data
                .holdings
            : []
        );

        setAllocation(
          Array.isArray(
            allocationResponse.data
              ?.allocation
          )
            ? allocationResponse.data
                .allocation
            : []
        );
      } catch (dashboardError: any) {
        console.error(
          'Dashboard loading error:',
          dashboardError
        );

        if (
          dashboardError?.response
            ?.status === 401
        ) {
          setError(
            'Your login session has expired. Please login again.'
          );
        } else {
          setError(
            dashboardError?.response
              ?.data?.message ||
              dashboardError?.response
                ?.data?.error ||
              'Unable to load your dashboard data.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

  /* ==========================================================
     MARKET MOVEMENT
  ========================================================== */

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        setMarkets(
          (previous) =>
            previous.map(
              (market) => {
                const movement =
                  (Math.random() -
                    0.5) *
                  0.001;

                const nextPrice =
                  Math.max(
                    0.0001,
                    market.price +
                      market.price *
                        movement
                  );

                const nextPercent =
                  movement * 100;

                return {
                  ...market,
                  price: nextPrice,
                  change:
                    market.change +
                    nextPrice -
                    market.price,
                  changePercent:
                    nextPercent,
                };
              }
            )
        );
      }, 3500);

    return () =>
      window.clearInterval(
        interval
      );
  }, []);

  useEffect(() => {
    loadProfile();
    loadDashboardData();
  }, []);

  /* ==========================================================
     DISPLAY
  ========================================================== */

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

  const number = (
    value: number
  ) => {
    if (
      !Number.isFinite(value)
    ) {
      return '0';
    }

    return value.toLocaleString(
      'en-US',
      {
        maximumFractionDigits: 4,
      }
    );
  };

  /* ==========================================================
     NAVIGATION
  ========================================================== */

  const goDashboard = () => {
    setMenuOpen(false);
    navigate('/dashboard');
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

  const goAccountStatement = () => {
    setMenuOpen(false);
    navigate('/account-statement');
  };

  const goSupport = () => {
    setMenuOpen(false);
    navigate('/support');
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

  /* ==========================================================
     SIDEBAR
  ========================================================== */

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
                BUILT FOR TRADERS & INVESTORS
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

          <SidebarHeading>
            OVERVIEW
          </SidebarHeading>

          <MenuItem
            icon={<DashboardIcon />}
            text="Dashboard"
            onClick={goDashboard}
          />

          <MenuItem
            icon={<ReceiptLongIcon />}
            text="Account Statement"
            onClick={goAccountStatement}
          />

          <SidebarHeading>
            PORTFOLIO & INVESTMENTS
          </SidebarHeading>

          <MenuItem
            icon={<AutoGraphIcon />}
            text="Investment Plans"
            badge="Coming Soon"
            badgeColor="#5369a9"
            onClick={() => {
              setMenuOpen(false);
              setError(
                'Investment Plans is being prepared.'
              );
            }}
          />

          <MenuItem
            icon={<PieChartIcon />}
            text="My Portfolio"
            onClick={goPortfolio}
          />

          <MenuItem
            icon={<ShowChartIcon />}
            text="Performance History"
            onClick={() => {
              setMenuOpen(false);
              setError(
                'Historical performance will appear when historical data is available.'
              );
            }}
          />

          <SidebarHeading>
            TRADING & MARKETS
          </SidebarHeading>

          <MenuItem
            icon={
              <CandlestickChartIcon />
            }
            text="Live Markets"
            badge="Live"
            badgeColor="#18b86a"
            onClick={goMarket}
          />

          <MenuItem
            icon={<ShowChartIcon />}
            text="Trading"
            onClick={goTrading}
          />

          <MenuItem
            icon={<PersonOutlineIcon />}
            text="Copy Trading"
            badge="Pro"
            badgeColor="#8d45d9"
            onClick={() => {
              setMenuOpen(false);
              setError(
                'Copy Trading is being prepared.'
              );
            }}
          />

          <MenuItem
            icon={<AutoGraphIcon />}
            text="AI Trading"
            badge="AI"
            badgeColor="#367cae"
            onClick={() => {
              setMenuOpen(false);
              setError(
                'AI Trading is being prepared.'
              );
            }}
          />

          <SidebarHeading>
            MARKET INTELLIGENCE
          </SidebarHeading>

          <MenuItem
            icon={
              <TrendingUpIcon />
            }
            text="Premium Signals"
            badge="Premium"
            badgeColor="#b48527"
            onClick={() => {
              setMenuOpen(false);
              setError(
                'Premium Signals is being prepared.'
              );
            }}
          />

          <Divider
            sx={{
              my: 2,
              borderColor:
                'rgba(255,255,255,0.10)',
            }}
          />

          <SidebarHeading>
            ACCOUNT
          </SidebarHeading>

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
              navigate('/security');
            }}
          />

          <MenuItem
            icon={<SettingsIcon />}
            text="Settings"
            onClick={() => {
              setMenuOpen(false);
              navigate('/settings');
            }}
          />

          <SidebarHeading>
            SUPPORT
          </SidebarHeading>

          <MenuItem
            icon={<SupportAgentIcon />}
            text="Live Chat"
            badge="Online"
            badgeColor="#18b86a"
            onClick={goSupport}
          />

          <MenuItem
            icon={<EmailOutlinedIcon />}
            text="Email Support"
            onClick={goSupport}
          />

          <Box
            sx={{
              px: 2,
              mt: 2,
              pb: 3,
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
              <Box
  component="img"
  src={logo}
  alt="GlobalDigitalMarket"
  sx={{
    width: {
      xs: 150,
      sm: 190,
    },
    height: {
      xs: 42,
      sm: 52,
    },
    objectFit: 'contain',
    display: 'block',
  }}
/>

              <Typography
                sx={{
                  color: '#7691e5',
                  fontSize: 9,
                  letterSpacing: 1,
                }}
              >
                BUILT FOR TRADERS & INVESTORS
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

        <MarketTicker
          markets={markets}
        />
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
        {/* HERO */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            overflow: 'hidden',
            background:
              'linear-gradient(135deg,#0d1e62 0%,#144dc5 58%,#087fda 100%)',
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
              spacing={3}
            >
              <Box
                sx={{
                  maxWidth: 720,
                }}
              >
                <Chip
                  icon={<PublicIcon />}
                  label="GLOBAL FINANCIAL MARKETS"
                  size="small"
                  sx={{
                    color: '#fff',
                    background:
                      'rgba(0,0,0,0.18)',
                    fontWeight: 900,
                    mb: 2,
                  }}
                />

                <Typography
                  sx={{
                    fontSize: {
                      xs: 29,
                      md: 42,
                    },
                    fontWeight: 900,
                    lineHeight: 1.1,
                    letterSpacing: -1,
                  }}
                >
                  Welcome back,{' '}
                  {displayName}
                </Typography>

                <Typography
                  sx={{
                    color: '#d0ddff',
                    mt: 1.5,
                    fontSize: {
                      xs: 14,
                      md: 16,
                    },
                    lineHeight: 1.7,
                  }}
                >
                  Trade and invest across
                  global financial markets
                  through CFDs on forex,
                  indices, commodities and
                  shares.
                </Typography>

                <Typography
                  sx={{
                    color: '#b7c9fa',
                    mt: 1,
                    fontSize: 12,
                  }}
                >
                  Transparent pricing.
                  Reliable execution.
                  Responsive support.
                </Typography>
              </Box>

              <Box
                sx={{
                  minWidth: {
                    xs: '100%',
                    md: 270,
                  },
                  alignSelf: {
                    xs: 'stretch',
                    md: 'center',
                  },
                  p: 2.5,
                  borderRadius: 3,
                  background:
                    'rgba(0,0,0,0.15)',
                  border:
                    '1px solid rgba(255,255,255,0.12)',
                }}
              >
                <Typography
                  sx={{
                    color: '#b9caff',
                    fontSize: 11,
                    fontWeight: 800,
                    letterSpacing: 1,
                  }}
                >
                  MARKET STATUS
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{
                    mt: 1,
                  }}
                >
                  <Box
                    sx={{
                      width: 9,
                      height: 9,
                      borderRadius:
                        '50%',
                      background:
                        '#58f39b',
                      boxShadow:
                        '0 0 12px rgba(88,243,155,0.8)',
                    }}
                  />

                  <Typography
                    sx={{
                      fontWeight: 900,
                    }}
                  >
                    Markets Active
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    color: '#b9caff',
                    fontSize: 11,
                    mt: 1,
                  }}
                >
                  Monitor prices and manage
                  your positions from your
                  dashboard.
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* ERROR */}

        {error && (
          <Alert
            severity="info"
            onClose={() =>
              setError('')
            }
            sx={{
              mb: 3,
            }}
          >
            {error}
          </Alert>
        )}

        {/* ====================================================
            PORTFOLIO VALUE
        ==================================================== */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(135deg,#10216d 0%,#154ec7 60%,#087fda 100%)',
            border:
              '1px solid rgba(130,190,255,0.28)',
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
              spacing={3}
            >
              <Box>
                <Typography
                  sx={{
                    color: '#b9caff',
                    fontSize: 12,
                    fontWeight: 800,
                    letterSpacing: 1.2,
                  }}
                >
                  TOTAL PORTFOLIO VALUE
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
                      performance.totalValue
                    )}
                  </Typography>
                )}

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  useFlexGap
                  sx={{
                    mt: 2,
                  }}
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
                    label="Account Active"
                    size="small"
                    sx={{
                      color: '#fff',
                      background:
                        'rgba(0,0,0,0.18)',
                      fontWeight: 700,
                    }}
                  />

                  <Chip
                    icon={
                      performance.totalGain >=
                      0 ? (
                        <TrendingUpIcon />
                      ) : (
                        <TrendingDownIcon />
                      )
                    }
                    label={`${performance.gainPercentage.toFixed(
                      2
                    )}%`}
                    size="small"
                    sx={{
                      color: '#fff',
                      background:
                        performance.totalGain >=
                        0
                          ? 'rgba(55,220,130,0.20)'
                          : 'rgba(255,100,130,0.20)',
                      fontWeight: 800,
                    }}
                  />
                </Stack>
              </Box>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1.5}
                alignSelf={{
                  xs: 'stretch',
                  md: 'flex-end',
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
                  Deposit
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
            </Stack>
          </CardContent>
        </Card>

        {/* ====================================================
            STATS
        ==================================================== */}

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
          <StatCard
            title="Available Balance"
            value={money(
              performance.availableBalance
            )}
            icon={
              <AccountBalanceWalletIcon />
            }
            subtitle="Available to use"
          />

          <StatCard
            title="Total Profit / Loss"
            value={money(
              performance.totalGain
            )}
            icon={
              performance.totalGain >=
              0 ? (
                <TrendingUpIcon />
              ) : (
                <TrendingDownIcon />
              )
            }
            subtitle={`${performance.gainPercentage.toFixed(
              2
            )}%`}
            positive={
              performance.totalGain >=
              0
            }
            negative={
              performance.totalGain < 0
            }
          />

          <StatCard
            title="Buying Power"
            value={money(
              performance.buyingPower
            )}
            icon={
              <AccountBalanceIcon />
            }
            subtitle="Trading capacity"
          />

          <StatCard
            title="Invested Value"
            value={money(
              performance.totalHoldingsValue
            )}
            icon={<ShowChartIcon />}
            subtitle={`${holdings.length} holding${
              holdings.length === 1
                ? ''
                : 's'
            }`}
          />
        </Box>

        {/* ====================================================
            ACCOUNT SUMMARY
        ==================================================== */}

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
          <CardContent
            sx={{
              p: {
                xs: 2.5,
                md: 3,
              },
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                mb: 2.5,
              }}
            >
              <AccountBalanceIcon
                sx={{
                  color: '#5ce8ff',
                }}
              />

              <Box>
                <Typography
                  sx={{
                    fontSize: 21,
                    fontWeight: 900,
                  }}
                >
                  Account Overview
                </Typography>

                <Typography
                  sx={{
                    color: '#8198df',
                    fontSize: 12,
                  }}
                >
                  Your current financial summary
                </Typography>
              </Box>
            </Stack>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr 1fr',
                  md: 'repeat(5,1fr)',
                },
                gap: 1.5,
              }}
            >
              <MiniFinancial
                title="Deposits"
                value={money(
                  performance.deposit
                )}
              />

              <MiniFinancial
                title="Profits"
                value={money(
                  performance.profits
                )}
              />

              <MiniFinancial
                title="Bonus"
                value={money(
                  performance.bonus
                )}
              />

              <MiniFinancial
                title="Referral Bonus"
                value={money(
                  performance.referrerBonus
                )}
              />

              <MiniFinancial
                title="Margin Available"
                value={money(
                  performance.marginAvailable
                )}
              />
            </Box>
          </CardContent>
        </Card>

        {/* ====================================================
            HOLDINGS
        ==================================================== */}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1.5fr 1fr',
            },
            gap: 2,
            mb: 3,
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
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
              }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 21,
                      fontWeight: 900,
                    }}
                  >
                    My Holdings
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8198df',
                      fontSize: 12,
                    }}
                  >
                    Current positions
                  </Typography>
                </Box>

                <Button
                  endIcon={
                    <ArrowForwardIcon />
                  }
                  onClick={goPortfolio}
                  sx={{
                    color: '#5ce8ff',
                    textTransform:
                      'none',
                    fontWeight: 800,
                  }}
                >
                  View All
                </Button>
              </Stack>

              {loading ? (
                <Box sx={{ py: 4 }}>
                  <CircularProgress
                    sx={{
                      color: '#5ce8ff',
                    }}
                  />
                </Box>
              ) : holdings.length ===
                0 ? (
                <Box
                  sx={{
                    py: 4,
                    textAlign: 'center',
                  }}
                >
                  <PieChartIcon
                    sx={{
                      fontSize: 45,
                      color: '#5269ae',
                    }}
                  />

                  <Typography
                    sx={{
                      mt: 1,
                      fontWeight: 800,
                    }}
                  >
                    No holdings yet
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.5,
                      color: '#8198df',
                      fontSize: 12,
                    }}
                  >
                    Your positions will appear
                    here.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            color:
                              '#8198df',
                            borderColor:
                              'rgba(255,255,255,0.08)',
                          }}
                        >
                          Asset
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              '#8198df',
                            borderColor:
                              'rgba(255,255,255,0.08)',
                          }}
                        >
                          Quantity
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              '#8198df',
                            borderColor:
                              'rgba(255,255,255,0.08)',
                          }}
                        >
                          Value
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              '#8198df',
                            borderColor:
                              'rgba(255,255,255,0.08)',
                          }}
                        >
                          P/L
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {holdings
                        .slice(0, 8)
                        .map(
                          (
                            holding
                          ) => (
                            <TableRow
                              key={
                                holding.id ||
                                holding.symbol
                              }
                            >
                              <TableCell
                                sx={{
                                  color:
                                    '#fff',
                                  fontWeight:
                                    800,
                                  borderColor:
                                    'rgba(255,255,255,0.08)',
                                }}
                              >
                                {holding.symbol}
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  color:
                                    '#c2cff7',
                                  borderColor:
                                    'rgba(255,255,255,0.08)',
                                }}
                              >
                                {number(
                                  Number(
                                    holding.quantity
                                  )
                                )}
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  color:
                                    '#fff',
                                  fontWeight:
                                    700,
                                  borderColor:
                                    'rgba(255,255,255,0.08)',
                                }}
                              >
                                {money(
                                  Number(
                                    holding.market_value
                                  )
                                )}
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  color:
                                    Number(
                                      holding.gain_loss
                                    ) >=
                                    0
                                      ? '#58f39b'
                                      : '#ff8297',
                                  fontWeight:
                                    800,
                                  borderColor:
                                    'rgba(255,255,255,0.08)',
                                }}
                              >
                                {money(
                                  Number(
                                    holding.gain_loss
                                  )
                                )}
                              </TableCell>
                            </TableRow>
                          )
                        )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>

          {/* ALLOCATION */}

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
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3,
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 21,
                  fontWeight: 900,
                }}
              >
                Asset Allocation
              </Typography>

              <Typography
                sx={{
                  color: '#8198df',
                  fontSize: 12,
                  mt: 0.5,
                  mb: 3,
                }}
              >
                Distribution of invested assets
              </Typography>

              {allocation.length ===
              0 ? (
                <Box
                  sx={{
                    py: 4,
                    textAlign:
                      'center',
                  }}
                >
                  <PieChartIcon
                    sx={{
                      fontSize: 45,
                      color: '#5269ae',
                    }}
                  />

                  <Typography
                    sx={{
                      mt: 1,
                      fontWeight: 800,
                    }}
                  >
                    No allocation data
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={2}>
                  {allocation
                    .slice(0, 8)
                    .map(
                      (
                        item
                      ) => (
                        <Box
                          key={
                            item.symbol
                          }
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            sx={{
                              mb: 0.7,
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: 13,
                                fontWeight: 800,
                              }}
                            >
                              {
                                item.symbol
                              }
                            </Typography>

                            <Typography
                              sx={{
                                color:
                                  '#9db0ed',
                                fontSize: 12,
                              }}
                            >
                              {Number(
                                item.percentage
                              ).toFixed(
                                1
                              )}
                              %
                            </Typography>
                          </Stack>

                          <LinearProgress
                            variant="determinate"
                            value={Math.min(
                              100,
                              Math.max(
                                0,
                                Number(
                                  item.percentage
                                )
                              )
                            )}
                            sx={{
                              height: 7,
                              borderRadius: 10,
                              background:
                                'rgba(255,255,255,0.08)',
                              '& .MuiLinearProgress-bar':
                                {
                                  borderRadius: 10,
                                  background:
                                    '#5ce8ff',
                                },
                            }}
                          />

                          <Typography
                            sx={{
                              mt: 0.5,
                              color:
                                '#7086c9',
                              fontSize: 10,
                            }}
                          >
                            {money(
                              Number(
                                item.value
                              )
                            )}
                          </Typography>
                        </Box>
                      )
                    )}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* ====================================================
            SUPPORT
        ==================================================== */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(135deg,#10216d,#0c328d)',
            border:
              '1px solid rgba(100,180,255,0.25)',
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2.5,
                md: 3,
              },
            }}
          >
            <Stack
              direction={{
                xs: 'column',
                md: 'row',
              }}
              justifyContent="space-between"
              spacing={3}
            >
              <Box>
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                >
                  <SupportAgentIcon
                    sx={{
                      color: '#5ce8ff',
                      fontSize: 30,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 900,
                    }}
                  >
                    Need help?
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    color: '#a9b9eb',
                    mt: 1,
                    fontSize: 13,
                    lineHeight: 1.7,
                  }}
                >
                  Our support team is available
                  to help with your account,
                  deposits, withdrawals and
                  trading questions.
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1.5}
                alignSelf={{
                  xs: 'stretch',
                  md: 'center',
                }}
              >
                <Button
                  variant="contained"
                  startIcon={
                    <ChatOutlinedIcon />
                  }
                  onClick={goSupport}
                  sx={{
                    color: '#041033',
                    background: '#5ce8ff',
                    textTransform:
                      'none',
                    fontWeight: 900,
                    px: 2.5,
                  }}
                >
                  Live Chat
                </Button>

                <Button
                  variant="outlined"
                  startIcon={
                    <EmailOutlinedIcon />
                  }
                  onClick={goSupport}
                  sx={{
                    color: '#fff',
                    borderColor:
                      'rgba(255,255,255,0.4)',
                    textTransform:
                      'none',
                    fontWeight: 800,
                    px: 2.5,
                  }}
                >
                  Email Support
                </Button>
              </Stack>
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
            description="Manage deposits, withdrawals and transfers."
            onClick={goWallet}
          />

          <QuickCard
            icon={<PieChartIcon />}
            title="My Portfolio"
            description="View your current holdings and investment positions."
            onClick={goPortfolio}
          />

          <QuickCard
            icon={
              <CandlestickChartIcon />
            }
            title="Live Markets"
            description="Monitor forex, indices, commodities and shares."
            onClick={goMarket}
          />

          <QuickCard
            icon={
              <ShowChartIcon />
            }
            title="Trading"
            description="Open the trading workspace and manage trades."
            onClick={goTrading}
          />
        </Box>

        {/* ====================================================
            SECURITY
        ==================================================== */}

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
                text="Financial account information requires authentication."
              />

              <SecurityItem
                icon={
                  <AccountBalanceWalletIcon />
                }
                title="Financial Data"
                text="Your dashboard information is loaded from your account."
              />
            </Stack>
          </CardContent>
        </Card>
      </Container>

      {/* ======================================================
          PROFILE DRAWER
          NOTE: Account Number and Account Type removed.
      ====================================================== */}

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
            title="Available Balance"
            value={money(
              performance.availableBalance
            )}
          />

          <ProfileItem
            title="Portfolio Value"
            value={money(
              performance.totalValue
            )}
          />

          <Button
            fullWidth
            startIcon={
              <PersonOutlineIcon />
            }
            onClick={() => {
              setProfileOpen(false);
              navigate('/profile');
            }}
            sx={{
              mt: 1,
              color: '#5ce8ff',
              border:
                '1px solid rgba(92,232,255,0.25)',
              textTransform:
                'none',
              py: 1.2,
            }}
          >
            Manage Profile
          </Button>

          <Button
            fullWidth
            startIcon={
              <SupportAgentIcon />
            }
            onClick={goSupport}
            sx={{
              mt: 1.5,
              color: '#fff',
              border:
                '1px solid rgba(255,255,255,0.15)',
              textTransform:
                'none',
              py: 1.2,
            }}
          >
            Contact Support
          </Button>

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

/* ============================================================
   SIDEBAR HEADING
============================================================ */

interface SidebarHeadingProps {
  children: React.ReactNode;
}

const SidebarHeading: React.FC<
  SidebarHeadingProps
> = ({ children }) => {
  return (
    <Typography
      sx={{
        px: 2,
        pt: 2.5,
        pb: 1,
        color: '#9eb2f2',
        fontSize: 11,
        fontWeight: 900,
        letterSpacing: 0.9,
      }}
    >
      {children}
    </Typography>
  );
};

/* ============================================================
   MENU ITEM
============================================================ */

interface MenuItemProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  badge?: string;
  badgeColor?: string;
}

const MenuItem: React.FC<
  MenuItemProps
> = ({
  icon,
  text,
  onClick,
  badge,
  badgeColor,
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
        py: 1.35,
        minHeight: 52,
      }}
    >
      <Box
        sx={{
          width: 38,
          display: 'flex',
          justifyContent:
            'center',
          mr: 1,
          color: '#fff',
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 15,
          fontWeight: 700,
          flexGrow: 1,
          textAlign: 'left',
        }}
      >
        {text}
      </Typography>

      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={{
            height: 30,
            color: '#fff',
            background:
              badgeColor ||
              '#4aa8ed',
            fontWeight: 900,
            '& .MuiChip-label': {
              px: 1.3,
            },
          }}
        />
      )}
    </Button>
  );
};

/* ============================================================
   MINI FINANCIAL
============================================================ */

interface MiniFinancialProps {
  title: string;
  value: string;
}

const MiniFinancial: React.FC<
  MiniFinancialProps
> = ({
  title,
  value,
}) => {
  return (
    <Box
      sx={{
        p: 1.7,
        borderRadius: 2.5,
        background:
          'rgba(255,255,255,0.035)',
        border:
          '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <Typography
        sx={{
          color: '#8198df',
          fontSize: 9,
          fontWeight: 800,
          textTransform:
            'uppercase',
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.6,
          fontSize: {
            xs: 13,
            sm: 15,
          },
          fontWeight: 900,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
};

/* ============================================================
   SECURITY ITEM
============================================================ */

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
