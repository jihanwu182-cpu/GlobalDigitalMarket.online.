import React, { useEffect, useState } from 'react';
import {
  AppBar,
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
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import BoltIcon from '@mui/icons-material/Bolt';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import SavingsIcon from '@mui/icons-material/Savings';
import HistoryIcon from '@mui/icons-material/History';
import SecurityIcon from '@mui/icons-material/Security';
import LoginIcon from '@mui/icons-material/Login';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';

import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

const drawerWidth = 285;

interface PerformanceResponse {
  totalValue: number;
  totalGain: number;
  gainPercentage: number;
  availableBalance: number;
  buyingPower?: number;
}

interface Holding {
  id: number;
  symbol: string;
  quantity: number;
  average_cost: number;
  current_price: number;
  market_value: number;
  gain_loss: number;
  gain_loss_percent: number;
}

interface HoldingsResponse {
  holdings: Holding[];
}

interface MarketAsset {
  symbol: string;
  name: string;
  price: string;
  change: string;
  positive: boolean;
  icon: string;
}

const marketAssets: MarketAsset[] = [
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin',
    price: '$80,241.40',
    change: '+1.57%',
    positive: true,
    icon: '₿',
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum',
    price: '$2,513.10',
    change: '+0.84%',
    positive: true,
    icon: 'Ξ',
  },
  {
    symbol: 'BNB/USD',
    name: 'BNB',
    price: '$712.05',
    change: '+2.12%',
    positive: true,
    icon: 'B',
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: '$314.82',
    change: '+1.26%',
    positive: true,
    icon: 'A',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    price: '$850.20',
    change: '-0.73%',
    positive: false,
    icon: 'T',
  },
  {
    symbol: 'GOLD',
    name: 'Gold CFD',
    price: '$4,602.40',
    change: '+0.38%',
    positive: true,
    icon: 'Au',
  },
];

const money = (value: number) =>
  `$${Number(value || 0).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [drawerOpen, setDrawerOpen] = useState(false);

  const [performance, setPerformance] =
    useState<PerformanceResponse>({
      totalValue: 0,
      totalGain: 0,
      gainPercentage: 0,
      availableBalance: 0,
      buyingPower: 0,
    });

  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    let mounted = true;

    const loadDashboard = async () => {
      try {
        setLoading(true);
        setApiError('');

        const [performanceResponse, holdingsResponse] =
          await Promise.all([
            apiClient.get<PerformanceResponse>(
              '/portfolio/performance'
            ),
            apiClient.get<HoldingsResponse>(
              '/portfolio/holdings'
            ),
          ]);

        if (!mounted) return;

        setPerformance({
          totalValue:
            Number(performanceResponse.data?.totalValue) || 0,
          totalGain:
            Number(performanceResponse.data?.totalGain) || 0,
          gainPercentage:
            Number(performanceResponse.data?.gainPercentage) || 0,
          availableBalance:
            Number(
              performanceResponse.data?.availableBalance
            ) || 0,
          buyingPower:
            Number(performanceResponse.data?.buyingPower) || 0,
        });

        setHoldings(
          Array.isArray(holdingsResponse.data?.holdings)
            ? holdingsResponse.data.holdings
            : []
        );
      } catch (error: any) {
        console.error('DASHBOARD API ERROR:', error);

        if (!mounted) return;

        setPerformance({
          totalValue: 0,
          totalGain: 0,
          gainPercentage: 0,
          availableBalance: 0,
          buyingPower: 0,
        });

        setHoldings([]);

        if (error?.response?.status === 401) {
          setApiError(
            'Your session has expired. Please login again.'
          );
        } else {
          setApiError(
            'Unable to load account data right now.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      mounted = false;
    };
  }, []);

  const portfolioValue = money(performance.totalValue);
  const availableBalance = money(
    performance.availableBalance
  );

  const totalProfit =
    performance.totalGain >= 0
      ? `+${money(performance.totalGain)}`
      : money(performance.totalGain);

  const profitPercentage =
    performance.gainPercentage >= 0
      ? `+${performance.gainPercentage.toFixed(2)}%`
      : `${performance.gainPercentage.toFixed(2)}%`;

  const navigationItems = [
    {
      title: 'Dashboard',
      icon: <DashboardIcon />,
      action: () => navigate('/dashboard'),
    },
    {
      title: 'My Portfolio',
      icon: <PieChartIcon />,
      action: () => navigate('/portfolio'),
    },
    {
      title: 'Live Markets',
      icon: <ShowChartIcon />,
      action: () => navigate('/market'),
    },
    {
      title: 'Trading',
      icon: <TrendingUpIcon />,
      action: () => navigate('/trading'),
    },
    {
      title: 'Investment Plans',
      icon: <SavingsIcon />,
      action: () => navigate('/portfolio'),
    },
    {
      title: 'Wallet & Funds',
      icon: <AccountBalanceWalletIcon />,
      action: () => navigate('/wallet'),
    },
    {
      title: 'Performance History',
      icon: <HistoryIcon />,
      action: () => navigate('/portfolio'),
    },
  ];

  const drawer = (
    <Box
      sx={{
        height: '100%',
        background:
          'linear-gradient(180deg, #07144d 0%, #101d6d 45%, #162b83 100%)',
        color: '#fff',
      }}
    >
      <Box
        sx={{
          px: 2.5,
          py: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 20,
              fontWeight: 800,
            }}
          >
            Global Digital
          </Typography>

          <Typography
            sx={{
              fontSize: 12,
              color: '#56f58b',
              fontWeight: 700,
              letterSpacing: 1.5,
            }}
          >
            MARKET
          </Typography>
        </Box>

        {isMobile && (
          <IconButton
            onClick={() => setDrawerOpen(false)}
            sx={{ color: '#fff' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      <Divider
        sx={{
          borderColor: 'rgba(255,255,255,0.12)',
        }}
      />

      <Box sx={{ px: 1.5, py: 2 }}>
        <Typography
          sx={{
            px: 1.5,
            mb: 1,
            fontSize: 11,
            fontWeight: 800,
            color: '#7ea1ff',
            letterSpacing: 1.4,
          }}
        >
          OVERVIEW
        </Typography>

        <List disablePadding>
          {navigationItems.map((item, index) => (
            <ListItemButton
              key={item.title}
              selected={index === 0}
              onClick={() => {
                item.action();
                setDrawerOpen(false);
              }}
              sx={{
                mb: 0.5,
                borderRadius: 2,
                color: '#fff',
                '&.Mui-selected': {
                  background:
                    'linear-gradient(90deg, rgba(73,55,255,0.9), rgba(36,94,255,0.65))',
                },
                '&:hover': {
                  backgroundColor:
                    'rgba(255,255,255,0.08)',
                },
              }}
            >
              <ListItemIcon
                sx={{
                  color: '#dce5ff',
                  minWidth: 42,
                }}
              >
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.title}
                primaryTypographyProps={{
                  fontSize: 14,
                  fontWeight: index === 0 ? 700 : 500,
                }}
              />
            </ListItemButton>
          ))}
        </List>

        <Typography
          sx={{
            px: 1.5,
            mt: 3,
            mb: 1,
            fontSize: 11,
            fontWeight: 800,
            color: '#7ea1ff',
            letterSpacing: 1.4,
          }}
        >
          INTELLIGENCE
        </Typography>

        <List disablePadding>
          <ListItemButton
            sx={{
              borderRadius: 2,
              color: '#fff',
              mb: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                color: '#e4dcff',
                minWidth: 42,
              }}
            >
              <SmartToyIcon />
            </ListItemIcon>

            <ListItemText
              primary="AI Trading Bots"
              primaryTypographyProps={{
                fontSize: 14,
              }}
            />

            <Chip
              label="AI"
              size="small"
              sx={{
                color: '#fff',
                backgroundColor: '#149cff',
                fontWeight: 700,
              }}
            />
          </ListItemButton>

          <ListItemButton
            sx={{
              borderRadius: 2,
              color: '#fff',
            }}
          >
            <ListItemIcon
              sx={{
                color: '#f6deff',
                minWidth: 42,
              }}
            >
              <AutoGraphIcon />
            </ListItemIcon>

            <ListItemText
              primary="Market Insights"
              primaryTypographyProps={{
                fontSize: 14,
              }}
            />

            <Chip
              label="PRO"
              size="small"
              sx={{
                color: '#fff',
                backgroundColor: '#9b4dff',
                fontWeight: 700,
              }}
            />
          </ListItemButton>
        </List>

        <Typography
          sx={{
            px: 1.5,
            mt: 3,
            mb: 1,
            fontSize: 11,
            fontWeight: 800,
            color: '#7ea1ff',
            letterSpacing: 1.4,
          }}
        >
          ACCOUNT
        </Typography>

        <List disablePadding>
          <ListItemButton
            onClick={() => navigate('/wallet')}
            sx={{
              borderRadius: 2,
              color: '#fff',
              mb: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                color: '#dce5ff',
                minWidth: 42,
              }}
            >
              <AccountBalanceWalletIcon />
            </ListItemIcon>

            <ListItemText
              primary="Deposit & Withdraw"
              primaryTypographyProps={{
                fontSize: 14,
              }}
            />
          </ListItemButton>

          <ListItemButton
            sx={{
              borderRadius: 2,
              color: '#fff',
              mb: 0.5,
            }}
          >
            <ListItemIcon
              sx={{
                color: '#dce5ff',
                minWidth: 42,
              }}
            >
              <SecurityIcon />
            </ListItemIcon>

            <ListItemText
              primary="Security Center"
              primaryTypographyProps={{
                fontSize: 14,
              }}
            />
          </ListItemButton>

          <ListItemButton
            sx={{
              borderRadius: 2,
              color: '#fff',
            }}
          >
            <ListItemIcon
              sx={{
                color: '#dce5ff',
                minWidth: 42,
              }}
            >
              <SupportAgentIcon />
            </ListItemIcon>

            <ListItemText
              primary="Customer Support"
              primaryTypographyProps={{
                fontSize: 14,
              }}
            />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  );

  const statCards = [
    {
      title: 'Total Profit',
      value: totalProfit,
      subtitle: 'Portfolio gains',
      icon: <TrendingUpIcon />,
    },
    {
      title: 'Available Balance',
      value: availableBalance,
      subtitle: 'Available for trading',
      icon: <ArrowDownwardIcon />,
    },
    {
      title: 'Active Positions',
      value: String(holdings.length),
      subtitle: 'Open positions',
      icon: <PieChartIcon />,
    },
    {
      title: 'Market Exposure',
      value:
        performance.totalValue > 0
          ? `${(
              ((performance.totalValue -
                performance.availableBalance) /
                performance.totalValue) *
              100
            ).toFixed(1)}%`
          : '0.0%',
      subtitle: 'Current portfolio exposure',
      icon: <AutoGraphIcon />,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #030a2c 0%, #071453 45%, #091b68 100%)',
        color: '#fff',
        pb: isMobile ? 10 : 0,
      }}
    >
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 0,
              background: 'transparent',
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      {isMobile && (
        <Drawer
          anchor="left"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              border: 0,
            },
          }}
        >
          {drawer}
        </Drawer>
      )}

      <Box
        sx={{
          ml: isMobile ? 0 : `${drawerWidth}px`,
          minHeight: '100vh',
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            background: 'rgba(3, 10, 44, 0.88)',
            backdropFilter: 'blur(14px)',
            borderBottom:
              '1px solid rgba(125,150,255,0.18)',
          }}
        >
          <Toolbar sx={{ minHeight: 70 }}>
            {isMobile && (
              <IconButton
                onClick={() => setDrawerOpen(true)}
                sx={{
                  color: '#fff',
                  mr: 1,
                }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: 18,
                    sm: 22,
                  },
                  fontWeight: 800,
                }}
              >
                Global Digital Market
              </Typography>

              <Typography
                sx={{
                  display: {
                    xs: 'none',
                    sm: 'block',
                  },
                  color: '#8da7ff',
                  fontSize: 11,
                  letterSpacing: 1.2,
                }}
              >
                PROFESSIONAL DIGITAL ASSET & INVESTMENT PLATFORM
              </Typography>
            </Box>

            <IconButton
              sx={{
                color: '#fff',
                mr: 1,
              }}
            >
              <NotificationsNoneIcon />
            </IconButton>

            <IconButton
              sx={{
                color: '#fff',
                background:
                  'linear-gradient(135deg, #5038ff, #237cff)',
                width: 40,
                height: 40,
              }}
            >
              <PersonOutlineIcon />
            </IconButton>
          </Toolbar>
        </AppBar>

        <Box
          sx={{
            borderBottom:
              '1px solid rgba(125,150,255,0.18)',
            background: 'rgba(8,20,73,0.8)',
          }}
        >
          <Container maxWidth="xl">
            <Stack
              direction="row"
              spacing={3}
              sx={{
                py: 1.4,
                overflowX: 'auto',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: '#26f57b',
                  }}
                />

                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 800,
                  }}
                >
                  LIVE
                </Typography>
              </Stack>

              {marketAssets.slice(0, 4).map((asset) => (
                <Typography
                  key={asset.symbol}
                  sx={{
                    fontSize: 12,
                    whiteSpace: 'nowrap',
                    color: '#cbd6ff',
                  }}
                >
                  {asset.symbol}:
                  <Box
                    component="span"
                    sx={{
                      color: '#45f58b',
                      ml: 0.5,
                    }}
                  >
                    {asset.price}
                  </Box>
                </Typography>
              ))}
            </Stack>
          </Container>
        </Box>

        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 3,
              md: 5,
            },
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography
              sx={{
                fontSize: {
                  xs: 28,
                  md: 38,
                },
                fontWeight: 800,
              }}
            >
              Welcome back
            </Typography>

            <Typography
              sx={{
                mt: 0.8,
                color: '#9eaff0',
                fontSize: {
                  xs: 14,
                  md: 16,
                },
              }}
            >
              Monitor your real account, portfolio and
              investments from one secure workspace.
            </Typography>
          </Box>

          {apiError && (
            <Card
              sx={{
                mb: 3,
                background:
                  'rgba(255,193,7,0.12)',
                border:
                  '1px solid rgba(255,193,7,0.3)',
                color: '#fff',
              }}
            >
              <CardContent>
                <Typography>
                  {apiError}
                </Typography>
              </CardContent>
            </Card>
          )}

          <Card
            sx={{
              mb: 3,
              borderRadius: 4,
              color: '#fff',
              background:
                'linear-gradient(135deg, #172a8a 0%, #2445c7 50%, #1459e8 100%)',
              border:
                '1px solid rgba(143,170,255,0.28)',
              boxShadow:
                '0 20px 60px rgba(0,0,0,0.3)',
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
                      color: '#b9c8ff',
                      fontSize: 13,
                      fontWeight: 700,
                      letterSpacing: 1,
                    }}
                  >
                    TOTAL PORTFOLIO VALUE
                  </Typography>

                  {loading ? (
                    <CircularProgress
                      size={36}
                      sx={{
                        color: '#fff',
                        mt: 2,
                      }}
                    />
                  ) : (
                    <Typography
                      sx={{
                        mt: 1,
                        fontSize: {
                          xs: 38,
                          md: 52,
                        },
                        fontWeight: 800,
                      }}
                    >
                      {portfolioValue}
                    </Typography>
                  )}

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{ mt: 1 }}
                  >
                    <Chip
                      icon={
                        performance.totalGain >= 0 ? (
                          <ArrowUpwardIcon />
                        ) : (
                          <ArrowDownwardIcon />
                        )
                      }
                      label={`${profitPercentage} total`}
                      size="small"
                      sx={{
                        color: '#fff',
                        background:
                          'rgba(29,238,112,0.2)',
                        border:
                          '1px solid rgba(29,238,112,0.4)',
                        fontWeight: 700,
                      }}
                    />

                    <Typography
                      sx={{
                        color: '#b9c8ff',
                        fontSize: 12,
                      }}
                    >
                      Portfolio performance
                    </Typography>
                  </Stack>
                </Box>

                <Box
                  sx={{
                    minWidth: {
                      md: 250,
                    },
                    alignSelf: {
                      md: 'center',
                    },
                  }}
                >
                  <Typography
                    sx={{
                      color: '#b9c8ff',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    AVAILABLE BALANCE
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 28,
                      fontWeight: 800,
                      mt: 0.5,
                    }}
                  >
                    {availableBalance}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#cbd6ff',
                      fontSize: 12,
                      mt: 0.5,
                    }}
                  >
                    Funds available for trading
                  </Typography>

                  <Button
                    variant="contained"
                    startIcon={<BoltIcon />}
                    onClick={() => navigate('/trading')}
                    sx={{
                      mt: 2,
                      borderRadius: 2,
                      background:
                        'linear-gradient(90deg, #14d8ff, #1d8cff)',
                      fontWeight: 800,
                      textTransform: 'none',
                    }}
                  >
                    Quick Trade
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: 2,
              mb: 3,
            }}
          >
            {statCards.map((stat) => (
              <Card
                key={stat.title}
                sx={{
                  borderRadius: 3,
                  color: '#fff',
                  background:
                    'linear-gradient(145deg, rgba(20,40,125,0.95), rgba(12,27,88,0.95))',
                  border:
                    '1px solid rgba(126,154,255,0.2)',
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
                          color: '#9eaff0',
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {stat.title.toUpperCase()}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 1,
                          fontSize: 26,
                          fontWeight: 800,
                        }}
                      >
                        {stat.value}
                      </Typography>

                      <Typography
                        sx={{
                          mt: 0.5,
                          color: '#8094df',
                          fontSize: 11,
                        }}
                      >
                        {stat.subtitle}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        width: 42,
                        height: 42,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 2,
                        color: '#5ce8ff',
                        background:
                          'rgba(57,197,255,0.12)',
                      }}
                    >
                      {stat.icon}
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                lg: '1.5fr 1fr',
              },
              gap: 3,
            }}
          >
            <Card
              sx={{
                borderRadius: 3,
                color: '#fff',
                background:
                  'linear-gradient(145deg, rgba(17,36,111,0.98), rgba(8,22,76,0.98))',
                border:
                  '1px solid rgba(126,154,255,0.2)',
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
                  sx={{ mb: 2.5 }}
                >
                  <Box>
                    <Typography
                      sx={{
                        fontSize: 20,
                        fontWeight: 800,
                      }}
                    >
                      Market Overview
                    </Typography>

                    <Typography
                      sx={{
                        color: '#8296e0',
                        fontSize: 12,
                        mt: 0.5,
                      }}
                    >
                      Monitor selected global assets.
                    </Typography>
                  </Box>

                  <Button
                    onClick={() => navigate('/market')}
                    sx={{
                      color: '#62dcff',
                      textTransform: 'none',
                      fontWeight: 700,
                    }}
                  >
                    View Markets
                  </Button>
                </Stack>

                <Stack spacing={1}>
                  {marketAssets.map((asset) => (
                    <Box
                      key={asset.symbol}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background:
                          'rgba(255,255,255,0.035)',
                      }}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.5}
                      >
                        <Box
                          sx={{
                            width: 38,
                            height: 38,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                              'linear-gradient(135deg, #263eae, #16286d)',
                            fontWeight: 800,
                          }}
                        >
                          {asset.icon}
                        </Box>

                        <Box
                          sx={{
                            flexGrow: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                            }}
                          >
                            {asset.symbol}
                          </Typography>

                          <Typography
                            sx={{
                              color: '#758bd6',
                              fontSize: 10,
                            }}
                          >
                            {asset.name}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            textAlign: 'right',
                          }}
                        >
                          <Typography
                            sx={{
                              fontSize: 13,
                              fontWeight: 800,
                            }}
                          >
                            {asset.price}
                          </Typography>

                          <Typography
                            sx={{
                              color: asset.positive
                                ? '#42ef88'
                                : '#ff6681',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {asset.change}
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 3,
              }}
            >
              <Card
                sx={{
                  borderRadius: 3,
                  color: '#fff',
                  background:
                    'linear-gradient(145deg, rgba(17,36,111,0.98), rgba(8,22,76,0.98))',
                  border:
                    '1px solid rgba(126,154,255,0.2)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 800,
                    }}
                  >
                    Account Actions
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8296e0',
                      fontSize: 12,
                      mt: 0.5,
                      mb: 2.5,
                    }}
                  >
                    Manage your account and investments.
                  </Typography>

                  <Stack spacing={1.2}>
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<BoltIcon />}
                      onClick={() => navigate('/trading')}
                      sx={{
                        py: 1.3,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 800,
                        background:
                          'linear-gradient(90deg, #17d8ff, #286cff)',
                      }}
                    >
                      Start Trading
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={
                        <AccountBalanceWalletIcon />
                      }
                      onClick={() => navigate('/wallet')}
                      sx={{
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: 'none',
                        color: '#fff',
                        borderColor:
                          'rgba(126,154,255,0.35)',
                      }}
                    >
                      Manage Wallet
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PieChartIcon />}
                      onClick={() => navigate('/portfolio')}
                      sx={{
                        py: 1.2,
                        borderRadius: 2,
                        textTransform: 'none',
                        color: '#fff',
                        borderColor:
                          'rgba(126,154,255,0.35)',
                      }}
                    >
                      View Portfolio
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              <Card
                sx={{
                  borderRadius: 3,
                  color: '#fff',
                  background:
                    'linear-gradient(135deg, rgba(19,67,130,0.95), rgba(8,39,93,0.95))',
                  border:
                    '1px solid rgba(73,205,255,0.2)',
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="flex-start"
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
                          'rgba(60,220,255,0.13)',
                        color: '#56eaff',
                      }}
                    >
                      <SecurityIcon />
                    </Box>

                    <Box>
                      <Typography sx={{ fontWeight: 800 }}>
                        Account Security
                      </Typography>

                      <Typography
                        sx={{
                          color: '#9eb2eb',
                          fontSize: 12,
                          mt: 0.6,
                          lineHeight: 1.6,
                        }}
                      >
                        Your account uses secure authentication
                        and protected API requests.
                      </Typography>

                      <Chip
                        label="Security status: Active"
                        size="small"
                        sx={{
                          mt: 1.5,
                          color: '#52f394',
                          background:
                            'rgba(43,240,126,0.1)',
                        }}
                      />
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Box>
          </Box>

          <Card
            sx={{
              mt: 3,
              borderRadius: 3,
              color: '#fff',
              background:
                'linear-gradient(110deg, #1725a0, #1948ce, #078fe5)',
            }}
          >
            <CardContent
              sx={{
                p: {
                  xs: 2.5,
                  md: 3.5,
                },
              }}
            >
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
                  spacing={2}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 58,
                      height: 58,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(135deg, #15e8ff, #1b6dff)',
                    }}
                  >
                    <RocketLaunchIcon />
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        fontSize: 20,
                        fontWeight: 800,
                      }}
                    >
                      Quick Trade
                    </Typography>

                    <Typography
                      sx={{
                        color: '#c1d7ff',
                        fontSize: 12,
                        mt: 0.5,
                      }}
                    >
                      Access your trading workspace.
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/trading')}
                  sx={{
                    minWidth: 150,
                    py: 1.3,
                    borderRadius: 2,
                    color: '#0a1c66',
                    backgroundColor: '#fff',
                    textTransform: 'none',
                    fontWeight: 800,
                  }}
                >
                  Open Trading
                </Button>
              </Stack>
            </CardContent>
          </Card>

          <Box
            sx={{
              mt: 5,
              pt: 3,
              borderTop:
                '1px solid rgba(126,154,255,0.15)',
            }}
          >
            <Typography
              sx={{
                fontWeight: 800,
                fontSize: 14,
              }}
            >
              Global Digital Market
            </Typography>

            <Typography
              sx={{
                color: '#7186cd',
                fontSize: 11,
                mt: 0.5,
              }}
            >
              Your dashboard now uses your account data.
            </Typography>
          </Box>
        </Container>

        {isMobile && (
          <Box
            sx={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1000,
              px: 1,
              pb: 1,
            }}
          >
            <Box
              sx={{
                borderRadius: 3,
                p: 1,
                display: 'grid',
                gridTemplateColumns:
                  'repeat(4, 1fr)',
                background:
                  'rgba(7,18,67,0.95)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <Button
                onClick={() => navigate('/dashboard')}
                sx={{
                  color: '#fff',
                  minWidth: 0,
                  flexDirection: 'column',
                  textTransform: 'none',
                  fontSize: 10,
                }}
              >
                <DashboardIcon />
                Home
              </Button>

              <Button
                onClick={() => navigate('/market')}
                sx={{
                  color: '#fff',
                  minWidth: 0,
                  flexDirection: 'column',
                  textTransform: 'none',
                  fontSize: 10,
                }}
              >
                <ShowChartIcon />
                Markets
              </Button>

              <Button
                onClick={() => navigate('/trading')}
                sx={{
                  color: '#fff',
                  minWidth: 0,
                  flexDirection: 'column',
                  textTransform: 'none',
                  fontSize: 10,
                }}
              >
                <BoltIcon />
                Trade
              </Button>

             
