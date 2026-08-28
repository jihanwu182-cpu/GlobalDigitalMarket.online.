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
  accountNumber?: string;
  accountType?: string;
  accountName?: string;
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
     LOAD DASHBOARD DATA
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

  useEffect(() => {
    loadProfile();
    loadDashboardData();
  }, []);

  /* ==========================================================
     DISPLAY HELPERS
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
                PROFESSIONAL DIGITAL ASSET PLATFORM
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

          {/* OVERVIEW */}

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
            onClick={() => {
              setMenuOpen(false);
              setError(
                'Account Statement is not connected yet.'
              );
            }}
          />

          {/* PORTFOLIO */}

          <SidebarHeading>
            PORTFOLIO & INVESTMENTS
          </SidebarHeading>

          <MenuItem
            icon={<AutoGraphIcon />}
            text="Investment Plans"
            onClick={() => {
              setMenuOpen(false);
              setError(
                'Investment Plans is not connected yet.'
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
                'Performance History requires historical performance data from the backend.'
              );
            }}
          />

          {/* TRADING */}

          <SidebarHeading>
            TRADING & MARKETS
          </SidebarHeading>

          <MenuItem
            icon={
              <CandlestickChartIcon />
            }
            text="Live Markets"
            badge="Live"
            badgeColor="#58e27c"
            onClick={goMarket}
          />

          <MenuItem
            icon={<PersonOutlineIcon />}
            text="Copy Trading"
            badge="Pro"
            badgeColor="#c43dff"
            onClick={() => {
              setMenuOpen(false);
              setError(
                'Copy Trading is not connected yet.'
              );
            }}
          />

          <MenuItem
            icon={<AutoGraphIcon />}
            text="AI Trading Bots"
            badge="AI"
            badgeColor="#4aa8ed"
            onClick={() => {
              setMenuOpen(false);
              setError(
                'AI Trading Bots is not connected yet.'
              );
            }}
          />

          {/* MARKET INTELLIGENCE */}

          <SidebarHeading>
            MARKET INTELLIGENCE
          </SidebarHeading>

          <MenuItem
            icon={
              <TrendingUpIcon />
            }
            text="Premium Signals"
            badge="Premium"
            badgeColor="#f5b72e"
            onClick={() => {
              setMenuOpen(false);
              setError(
                'Premium Signals is not connected yet.'
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

          {/* ACCOUNT */}

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

          {/* CONTACT SUPPORT */}

          <MenuItem
            icon={<SupportAgentIcon />}
            text="Contact Support"
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
          DASHBOARD
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

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: {
                xs: 29,
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
            Here's your investment account overview.
          </Typography>
        </Box>

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
            MAIN BALANCE
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
                    label={
                      account?.status ===
                      'active'
                        ? 'Active Account'
                        : 'Account'
                    }
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
            STATISTICS
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
            ACCOUNT FINANCIAL SUMMARY
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
                  Your current account financial summary
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
            PORTFOLIO + ALLOCATION
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
                    Current positions in your portfolio
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
                    Your investment positions will appear here.
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table
                    size="small"
                  >
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
                Distribution of your invested assets
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
            PERFORMANCE SNAPSHOT
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
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              justifyContent="space-between"
              spacing={2}
            >
              <Box>
                <Stack
                  direction="row"
                  spacing={1.2}
                  alignItems="center"
                >
                  <ShowChartIcon
                    sx={{
                      color:
                        '#5ce8ff',
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 21,
                      fontWeight: 900,
                    }}
                  >
                    Performance Snapshot
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    color: '#8198df',
                    fontSize: 12,
                    mt: 0.7,
                  }}
                >
                  Current portfolio performance from your account data.
                </Typography>
              </Box>

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
                sx={{
                  color: '#fff',
                  background:
                    performance.totalGain >=
                    0
                      ? 'rgba(55,220,130,0.18)'
                      : 'rgba(255,100,130,0.18)',
                  fontWeight: 900,
                }}
              />
            </Stack>

            <Box
              sx={{
                mt: 3,
                p: 2,
                borderRadius: 3,
                background:
                  'rgba(255,255,255,0.035)',
                border:
                  '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                justifyContent="space-between"
                spacing={2}
              >
                <Box>
                  <Typography
                    sx={{
                      color:
                        '#8198df',
                      fontSize: 11,
                    }}
                  >
                    CURRENT GAIN / LOSS
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 30,
                      fontWeight: 900,
                      color:
                        performance.totalGain >=
                        0
                          ? '#58f39b'
                          : '#ff8297',
                      mt: 0.5,
                    }}
                  >
                    {money(
                      performance.totalGain
                    )}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    textAlign: {
                      xs: 'left',
                      sm: 'right',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color:
                        '#8198df',
                      fontSize: 11,
                    }}
                  >
                    INVESTED VALUE
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 900,
                      mt: 0.5,
                    }}
                  >
                    {money(
                      performance.totalHoldingsValue
                    )}
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Typography
              sx={{
                mt: 2,
                color: '#667cbd',
                fontSize: 11,
              }}
            >
              Historical performance is not displayed because the current backend does not provide historical performance points.
            </Typography>
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
            description="View the available market and trading section."
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
                title="Account Data"
                text="Dashboard financial information is loaded from your account."
              />
            </Stack>
          </CardContent>
        </Card>
      </Container>

      {/* ======================================================
          PROFILE DRAWER
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
            title="Account ID"
            value={
              profile.accountId ||
              'Not available'
            }
          />

          <ProfileItem
            title="Account Number"
            value={
              account?.accountNumber ||
              'Not available'
            }
          />

          <ProfileItem
            title="Account Type"
            value={
              account?.accountType ||
              'Not available'
            }
          />

          <ProfileItem
            title="Available Balance"
            value={money(
              performance.availableBalance
            )}
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
