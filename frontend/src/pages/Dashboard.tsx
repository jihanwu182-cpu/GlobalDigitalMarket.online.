import React, { useEffect, useState } from 'react';
import {
  Alert,
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

import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
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
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import LanguageIcon from '@mui/icons-material/Language';
import SecurityIcon from '@mui/icons-material/Security';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface PerformanceResponse {
  totalValue: number;
  totalGain: number;
  gainPercentage: number;

  deposit: number;
  profits: number;
  availableBalance: number;
  bonus: number;
  referrerBonus: number;

  buyingPower: number;
  marginAvailable?: number;
  totalHoldingsValue?: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [performance, setPerformance] =
    useState<PerformanceResponse>({
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

  const [errorMessage, setErrorMessage] =
    useState('');

  // ==========================================================
  // LOAD REAL ACCOUNT DATA
  // ==========================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response =
        await apiClient.get<PerformanceResponse>(
          '/portfolio/performance'
        );

      const data = response.data;

      setPerformance({
        totalValue:
          Number(data?.totalValue) || 0,

        totalGain:
          Number(data?.totalGain) || 0,

        gainPercentage:
          Number(data?.gainPercentage) || 0,

        deposit:
          Number(data?.deposit) || 0,

        profits:
          Number(data?.profits) || 0,

        availableBalance:
          Number(data?.availableBalance) || 0,

        bonus:
          Number(data?.bonus) || 0,

        referrerBonus:
          Number(data?.referrerBonus) || 0,

        buyingPower:
          Number(data?.buyingPower) || 0,

        marginAvailable:
          Number(data?.marginAvailable) || 0,

        totalHoldingsValue:
          Number(data?.totalHoldingsValue) || 0,
      });
    } catch (error: any) {
      console.error(
        'DASHBOARD ERROR:',
        error
      );

      const status =
        error?.response?.status;

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Unable to load account data.';

      if (status === 401) {
        setErrorMessage(
          'Your login session has expired.'
        );
      } else {
        setErrorMessage(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  // ==========================================================
  // FORMAT MONEY
  // ==========================================================

  const formatMoney = (
    value: number
  ): string => {
    return `$${Number(
      value || 0
    ).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const goTo = (path: string) => {
    setDrawerOpen(false);
    navigate(path);
  };

  // ==========================================================
  // MENU ITEM
  // ==========================================================

  const MenuItem = ({
    icon,
    label,
    path,
    badge,
    badgeColor,
  }: {
    icon: React.ReactNode;
    label: string;
    path: string;
    badge?: string;
    badgeColor?: string;
  }) => {
    return (
      <Button
        fullWidth
        onClick={() => goTo(path)}
        sx={{
          justifyContent: 'flex-start',
          textTransform: 'none',
          color: '#fff',
          px: 2,
          py: 1.2,
          borderRadius: 2,
          mb: 0.5,
          minHeight: 52,

          '&:hover': {
            background:
              'rgba(70,100,255,0.25)',
          },
        }}
      >
        <Box
          sx={{
            width: 38,
            display: 'flex',
            justifyContent: 'center',
            mr: 1,
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: 16,
            fontWeight: 600,
            flexGrow: 1,
            textAlign: 'left',
          }}
        >
          {label}
        </Typography>

        {badge && (
          <Chip
            label={badge}
            size="small"
            sx={{
              height: 28,
              color: '#fff',
              fontWeight: 800,
              background:
                badgeColor ||
                '#19d85a',
              '& .MuiChip-label': {
                px: 1.4,
              },
            }}
          />
        )}
      </Button>
    );
  };

  // ==========================================================
  // SECTION TITLE
  // ==========================================================

  const SectionTitle = ({
    children,
  }: {
    children: React.ReactNode;
  }) => (
    <Typography
      sx={{
        color: '#b9c8ff',
        fontSize: 13,
        fontWeight: 800,
        letterSpacing: 0.5,
        px: 2,
        pt: 2.5,
        pb: 1,
        textTransform: 'uppercase',
      }}
    >
      {children}
    </Typography>
  );

  // ==========================================================
  // DRAWER
  // ==========================================================

  const drawer = (
    <Box
      sx={{
        width: {
          xs: '88vw',
          sm: 430,
        },
        maxWidth: 430,
        height: '100%',
        color: '#fff',
        background:
          'linear-gradient(180deg,#07134f 0%,#102d91 45%,#173aa5 100%)',
        overflowY: 'auto',
        boxShadow:
          '10px 0 50px rgba(0,0,0,0.45)',
      }}
    >
      {/* ====================================================
          DRAWER HEADER
      ==================================================== */}

      <Box
        sx={{
          px: 2,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom:
            '1px solid rgba(255,255,255,0.12)',
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: 21,
              fontWeight: 900,
            }}
          >
            Global Digital Market
          </Typography>

          <Typography
            sx={{
              color: '#8fa9ff',
              fontSize: 10,
              mt: 0.3,
            }}
          >
            PROFESSIONAL DIGITAL ASSET PLATFORM
          </Typography>
        </Box>

        <IconButton
          onClick={() =>
            setDrawerOpen(false)
          }
          sx={{
            color: '#fff',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Box>

      {/* ====================================================
          OVERVIEW
      ==================================================== */}

      <SectionTitle>
        Overview
      </SectionTitle>

      <Box sx={{ px: 1 }}>
        <MenuItem
          icon={<DashboardIcon />}
          label="Dashboard"
          path="/"
        />

        <MenuItem
          icon={<ReceiptLongIcon />}
          label="Account Statement"
          path="/statement"
        />
      </Box>

      {/* ====================================================
          PORTFOLIO
      ==================================================== */}

      <SectionTitle>
        Portfolio & Investments
      </SectionTitle>

      <Box sx={{ px: 1 }}>
        <MenuItem
          icon={<TrackChangesIcon />}
          label="Investment Plans"
          path="/investment-plans"
        />

        <MenuItem
          icon={<PieChartIcon />}
          label="My Portfolio"
          path="/portfolio"
        />

        <MenuItem
          icon={<ShowChartIcon />}
          label="Performance History"
          path="/performance"
        />
      </Box>

      {/* ====================================================
          TRADING
      ==================================================== */}

      <SectionTitle>
        Trading & Markets
      </SectionTitle>

      <Box sx={{ px: 1 }}>
        <MenuItem
          icon={<CandlestickChartIcon />}
          label="Live Markets"
          path="/market"
          badge="Live"
          badgeColor="#18e76b"
        />

        <MenuItem
          icon={<PeopleIcon />}
          label="Copy Trading"
          path="/copy-trading"
          badge="Pro"
          badgeColor="#c53cff"
        />

        <MenuItem
          icon={<SmartToyIcon />}
          label="AI Trading Bots"
          path="/ai-trading"
          badge="AI"
          badgeColor="#08a9ed"
        />
      </Box>

      {/* ====================================================
          MARKET INTELLIGENCE
      ==================================================== */}

      <SectionTitle>
        Market Intelligence
      </SectionTitle>

      <Box sx={{ px: 1 }}>
        <MenuItem
          icon={<BoltIcon />}
          label="Premium Signals"
          path="/signals"
          badge="Premium"
          badgeColor="#ffb900"
        />
      </Box>

      {/* ====================================================
          WALLET
      ==================================================== */}

      <SectionTitle>
        Wallet & Funds
      </SectionTitle>

      <Box sx={{ px: 1 }}>
        <MenuItem
          icon={<AddCircleOutlineIcon />}
          label="Deposit Funds"
          path="/wallet"
        />

        <MenuItem
          icon={<RemoveCircleOutlineIcon />}
          label="Withdraw Funds"
          path="/wallet"
        />

        <MenuItem
          icon={<SwapHorizIcon />}
          label="Internal Transfer"
          path="/wallet"
        />
      </Box>

      {/* ====================================================
          FINANCING
      ==================================================== */}

      <SectionTitle>
        Financing
      </SectionTitle>

      <Box sx={{ px: 1 }}>
        <MenuItem
          icon={<CreditCardIcon />}
          label="Fast Credit"
          path="/wallet"
          badge="Fast"
          badgeColor="#19d85a"
        />
      </Box>

      {/* ====================================================
          SETTINGS
      ==================================================== */}

      <SectionTitle>
        Account
      </SectionTitle>

      <Box sx={{ px: 1 }}>
        <MenuItem
          icon={<SettingsIcon />}
          label="Settings"
          path="/settings"
        />

        <MenuItem
          icon={<SecurityIcon />}
          label="Security"
          path="/security"
        />

        <MenuItem
          icon={<LanguageIcon />}
          label="Language"
          path="/language"
        />

        <MenuItem
          icon={<HelpOutlineIcon />}
          label="Help & Support"
          path="/support"
        />
      </Box>

      <Box sx={{ height: 30 }} />
    </Box>
  );

  // ==========================================================
  // DASHBOARD
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg,#030a2c 0%,#071453 55%,#091b68 100%)',
        color: '#fff',
      }}
    >
      {/* ====================================================
          DRAWER
      ==================================================== */}

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() =>
          setDrawerOpen(false)
        }
        PaperProps={{
          sx: {
            background: 'transparent',
            boxShadow: 'none',
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* ====================================================
          TOP BAR
      ==================================================== */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background:
            'rgba(3,10,44,0.97)',
          backdropFilter: 'blur(12px)',
          borderBottom:
            '1px solid rgba(125,150,255,0.2)',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ py: 1.5 }}
        >
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
          >
            <IconButton
              onClick={() =>
                setDrawerOpen(true)
              }
              sx={{
                color: '#fff',
                background:
                  'rgba(50,80,200,0.25)',
                '&:hover': {
                  background:
                    'rgba(50,80,200,0.4)',
                },
              }}
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: 18,
                    sm: 22,
                  },
                  fontWeight: 900,
                }}
              >
                Global Digital Market
              </Typography>

              <Typography
                sx={{
                  color: '#8da7ff',
                  fontSize: 10,
                }}
              >
                PROFESSIONAL DIGITAL ASSET PLATFORM
              </Typography>
            </Box>

            <Button
              onClick={() =>
                navigate('/wallet')
              }
              startIcon={
                <AccountBalanceWalletIcon />
              }
              sx={{
                color: '#fff',
                textTransform: 'none',
                display: {
                  xs: 'none',
                  sm: 'flex',
                },
              }}
            >
              Wallet
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ====================================================
          MAIN
      ==================================================== */}

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 3,
            md: 5,
          },
        }}
      >
        {/* ==================================================
            TITLE
        ================================================== */}

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: {
                xs: 30,
                md: 40,
              },
              fontWeight: 900,
            }}
          >
            Dashboard
          </Typography>

          <Typography
            sx={{
              color: '#9eaff0',
              mt: 0.5,
            }}
          >
            Welcome to your Global Digital
            Market account.
          </Typography>
        </Box>

        {/* ==================================================
            ERROR
        ================================================== */}

        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            onClose={() =>
              setErrorMessage('')
            }
          >
            {errorMessage}
          </Alert>
        )}

        {/* ==================================================
            ACCOUNT HERO
        ================================================== */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(135deg,#182b91,#1459e8)',
            border:
              '1px solid rgba(143,170,255,0.3)',
            boxShadow:
              '0 20px 60px rgba(0,0,0,0.25)',
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
                    fontWeight: 800,
                    letterSpacing: 1,
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
                        md: 52,
                      },
                      fontWeight: 900,
                      mt: 1,
                    }}
                  >
                    {formatMoney(
                      performance.availableBalance
                    )}
                  </Typography>
                )}

                <Typography
                  sx={{
                    color: '#cbd6ff',
                    mt: 1,
                  }}
                >
                  Ready to use for your account.
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
                    <AddCircleOutlineIcon />
                  }
                  onClick={() =>
                    navigate('/wallet')
                  }
                  sx={{
                    py: 1.3,
                    px: 2.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 800,
                    background:
                      'linear-gradient(90deg,#13cfff,#188fff)',
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
                    navigate('/wallet')
                  }
                  sx={{
                    py: 1.3,
                    px: 2.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 800,
                    color: '#fff',
                    borderColor:
                      'rgba(255,255,255,0.5)',
                  }}
                >
                  Withdraw Funds
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* ==================================================
            ACCOUNT CARDS
        ================================================== */}

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
          {/* DEPOSIT */}

          <Card
            sx={{
              borderRadius: 3,
              color: '#fff',
              background:
                'linear-gradient(145deg,#163b9b,#0c205e)',
              border:
                '1px solid rgba(100,150,255,0.2)',
            }}
          >
            <CardContent>
              <AccountBalanceWalletIcon
                sx={{
                  fontSize: 34,
                  color: '#5ce8ff',
                }}
              />

              <Typography
                sx={{
                  color: '#9eaff0',
                  fontSize: 12,
                  fontWeight: 800,
                  mt: 1,
                }}
              >
                DEPOSIT
              </Typography>

              <Typography
                sx={{
                  fontSize: 25,
                  fontWeight: 900,
                  mt: 1,
                }}
              >
                {loading
                  ? '...'
                  : formatMoney(
                      performance.deposit
                    )}
              </Typography>
            </CardContent>
          </Card>

          {/* PROFITS */}

          <Card
            sx={{
              borderRadius: 3,
              color: '#fff',
              background:
                'linear-gradient(145deg,#125c52,#0b302e)',
              border:
                '1px solid rgba(70,240,170,0.2)',
            }}
          >
            <CardContent>
              <ShowChartIcon
                sx={{
                  fontSize: 34,
                  color: '#4df28d',
                }}
              />

              <Typography
                sx={{
                  color: '#9eaff0',
                  fontSize: 12,
                  fontWeight: 800,
                  mt: 1,
                }}
              >
                PROFITS
              </Typography>

              <Typography
                sx={{
                  fontSize: 25,
                  fontWeight: 900,
                  mt: 1,
                  color: '#4df28d',
                }}
              >
                {loading
                  ? '...'
                  : formatMoney(
                      performance.profits
                    )}
              </Typography>
            </CardContent>
          </Card>

          {/* BONUS */}

          <Card
            sx={{
              borderRadius: 3,
              color: '#fff',
              background:
                'linear-gradient(145deg,#70439e,#351d60)',
              border:
                '1px solid rgba(200,130,255,0.25)',
            }}
          >
            <CardContent>
              <SavingsIcon
                sx={{
                  fontSize: 34,
                  color: '#d99cff',
                }}
              />

              <Typography
                sx={{
                  color: '#c7aee8',
                  fontSize: 12,
                  fontWeight: 800,
                  mt: 1,
                }}
              >
                BONUS
              </Typography>

              <Typography
                sx={{
                  fontSize: 25,
                  fontWeight: 900,
                  mt: 1,
                }}
              >
                {loading
                  ? '...'
                  : formatMoney(
                      performance.bonus
                    )}
              </Typography>
            </CardContent>
          </Card>

          {/* REFERRER */}

          <Card
            sx={{
              borderRadius: 3,
              color: '#fff',
              background:
                'linear-gradient(145deg,#8a5722,#4b2c12)',
              border:
                '1px solid rgba(255,190,80,0.25)',
            }}
          >
            <CardContent>
              <PeopleIcon
                sx={{
                  fontSize: 34,
                  color: '#ffc45c',
                }}
              />

              <Typography
                sx={{
                  color: '#f1ca91',
                  fontSize: 12,
                  fontWeight: 800,
                  mt: 1,
                }}
              >
                REFERRER BONUS
              </Typography>

              <Typography
                sx={{
                  fontSize: 25,
                  fontWeight: 900,
                  mt: 1,
                }}
              >
                {loading
                  ? '...'
                  : formatMoney(
                      performance.referrerBonus
                    )}
              </Typography>
            </CardContent>
          </Card>
        </Box>

        {/* ==================================================
            QUICK ACTIONS
        ================================================== */}

        <Card
          sx={{
            borderRadius: 3,
            mb: 3,
            color: '#fff',
            background:
              'linear-gradient(145deg,#11246f,#08164c)',
            border:
              '1px solid rgba(100,150,255,0.2)',
          }}
        >
          <CardContent>
            <Typography
              sx={{
                fontSize: 21,
                fontWeight: 900,
                mb: 2,
              }}
            >
              Quick Actions
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(3,1fr)',
                },
                gap: 1.5,
              }}
            >
              <Button
                variant="contained"
                startIcon={
                  <AddCircleOutlineIcon />
                }
                onClick={() =>
                  navigate('/wallet')
                }
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 800,
                  background:
                    'linear-gradient(90deg,#13cfff,#188fff)',
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
                  navigate('/wallet')
                }
                sx={{
                  py: 1.5,
                  color: '#fff',
                  borderColor:
                    'rgba(120,220,255,0.5)',
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Withdraw Funds
              </Button>

              <Button
                variant="outlined"
                startIcon={<SwapHorizIcon />}
                onClick={() =>
                  navigate('/wallet')
                }
                sx={{
                  py: 1.5,
                  color: '#fff',
                  borderColor:
                    'rgba(120,220,255,0.5)',
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Internal Transfer
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* ==================================================
            TRADING
        ================================================== */}

        <Card
          sx={{
            borderRadius: 3,
            color: '#fff',
            background:
              'linear-gradient(110deg,#1725a0,#1948ce,#078fe5)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
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
            >
              <Box>
                <Typography
                  sx={{
                    fontSize: 23,
                    fontWeight: 900,
                  }}
                >
                  Live Markets
                </Typography>

                <Typography
                  sx={{
                    color: '#c1d7ff',
                    fontSize: 12,
                    mt: 0.5,
                  }}
                >
                 
