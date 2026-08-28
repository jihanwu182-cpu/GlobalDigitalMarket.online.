import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Drawer,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
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
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import LanguageIcon from '@mui/icons-material/Language';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface AccountData {
  totalValue: number;
  totalGain: number;
  gainPercentage: number;
  deposit: number;
  profits: number;
  availableBalance: number;
  bonus: number;
  referrerBonus: number;
  buyingPower: number;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [account, setAccount] = useState<AccountData>({
    totalValue: 0,
    totalGain: 0,
    gainPercentage: 0,
    deposit: 0,
    profits: 0,
    availableBalance: 0,
    bonus: 0,
    referrerBonus: 0,
    buyingPower: 0,
  });

  const loadAccount = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get(
        '/portfolio/performance'
      );

      const data = response.data || {};

      setAccount({
        totalValue: Number(data.totalValue) || 0,
        totalGain: Number(data.totalGain) || 0,
        gainPercentage:
          Number(data.gainPercentage) || 0,
        deposit: Number(data.deposit) || 0,
        profits: Number(data.profits) || 0,
        availableBalance:
          Number(data.availableBalance) || 0,
        bonus: Number(data.bonus) || 0,
        referrerBonus:
          Number(data.referrerBonus) || 0,
        buyingPower:
          Number(data.buyingPower) || 0,
      });
    } catch (err: any) {
      console.error('Dashboard error:', err);

      if (err?.response?.status === 401) {
        setError(
          'Your login session has expired. Please login again.'
        );
      } else {
        setError(
          err?.response?.data?.message ||
            'Unable to load account information.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccount();
  }, []);

  const money = (value: number) => {
    return `$${Number(value || 0).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const go = (path: string) => {
    setMenuOpen(false);
    navigate(path);
  };

  const MenuButton = ({
    icon,
    text,
    path,
    badge,
  }: {
    icon: React.ReactNode;
    text: string;
    path: string;
    badge?: string;
  }) => (
    <Button
      fullWidth
      onClick={() => go(path)}
      sx={{
        color: '#fff',
        justifyContent: 'flex-start',
        textTransform: 'none',
        borderRadius: 2,
        py: 1.2,
        px: 2,
        mb: 0.5,
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
          flexGrow: 1,
          textAlign: 'left',
          fontSize: 16,
          fontWeight: 600,
        }}
      >
        {text}
      </Typography>

      {badge && (
        <Chip
          label={badge}
          size="small"
          sx={{
            color: '#fff',
            fontWeight: 800,
            background:
              badge === 'Premium'
                ? '#ffb900'
                : badge === 'Pro'
                ? '#c53cff'
                : badge === 'AI'
                ? '#08a9ed'
                : '#18e76b',
          }}
        />
      )}
    </Button>
  );

  const MenuSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <Box sx={{ mt: 1 }}>
      <Typography
        sx={{
          color: '#aebfff',
          fontSize: 13,
          fontWeight: 800,
          px: 2,
          py: 1,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Typography>

      <Box sx={{ px: 1 }}>{children}</Box>
    </Box>
  );

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#fff',
        background:
          'linear-gradient(180deg,#030a2c 0%,#071453 55%,#091b68 100%)',
      }}
    >
      {/* SIDE MENU */}

      <Drawer
        anchor="left"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
      >
        <Box
          sx={{
            width: {
              xs: '86vw',
              sm: 400,
            },
            maxWidth: 400,
            height: '100%',
            overflowY: 'auto',
            color: '#fff',
            background:
              'linear-gradient(180deg,#07134f,#102d91,#173aa5)',
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
                '1px solid rgba(255,255,255,0.15)',
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
                  color: '#8da7ff',
                  fontSize: 10,
                }}
              >
                PROFESSIONAL DIGITAL ASSET PLATFORM
              </Typography>
            </Box>

            <IconButton
              onClick={() => setMenuOpen(false)}
              sx={{ color: '#fff' }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <MenuSection title="Overview">
            <MenuButton
              icon={<DashboardIcon />}
              text="Dashboard"
              path="/"
            />

            <MenuButton
              icon={<ReceiptLongIcon />}
              text="Account Statement"
              path="/statement"
            />
          </MenuSection>

          <MenuSection title="Portfolio & Investments">
            <MenuButton
              icon={<TrackChangesIcon />}
              text="Investment Plans"
              path="/investment-plans"
            />

            <MenuButton
              icon={<PieChartIcon />}
              text="My Portfolio"
              path="/portfolio"
            />

            <MenuButton
              icon={<ShowChartIcon />}
              text="Performance History"
              path="/performance"
            />
          </MenuSection>

          <MenuSection title="Trading & Markets">
            <MenuButton
              icon={<CandlestickChartIcon />}
              text="Live Markets"
              path="/market"
              badge="Live"
            />

            <MenuButton
              icon={<PeopleIcon />}
              text="Copy Trading"
              path="/copy-trading"
              badge="Pro"
            />

            <MenuButton
              icon={<SmartToyIcon />}
              text="AI Trading Bots"
              path="/ai-trading"
              badge="AI"
            />
          </MenuSection>

          <MenuSection title="Market Intelligence">
            <MenuButton
              icon={<BoltIcon />}
              text="Premium Signals"
              path="/signals"
              badge="Premium"
            />
          </MenuSection>

          <MenuSection title="Wallet & Funds">
            <MenuButton
              icon={<AddCircleOutlineIcon />}
              text="Deposit Funds"
              path="/wallet"
            />

            <MenuButton
              icon={<RemoveCircleOutlineIcon />}
              text="Withdraw Funds"
              path="/wallet"
            />

            <MenuButton
              icon={<SwapHorizIcon />}
              text="Internal Transfer"
              path="/wallet"
            />
          </MenuSection>

          <MenuSection title="Financing">
            <MenuButton
              icon={<CreditCardIcon />}
              text="Fast Credit"
              path="/wallet"
              badge="Fast"
            />
          </MenuSection>

          <MenuSection title="Account">
            <MenuButton
              icon={<SettingsIcon />}
              text="Settings"
              path="/settings"
            />

            <MenuButton
              icon={<SecurityIcon />}
              text="Security"
              path="/security"
            />

            <MenuButton
              icon={<LanguageIcon />}
              text="Language"
              path="/language"
            />

            <MenuButton
              icon={<HelpOutlineIcon />}
              text="Help & Support"
              path="/support"
            />
          </MenuSection>

          <Box sx={{ height: 30 }} />
        </Box>
      </Drawer>

      {/* TOP BAR */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background:
            'rgba(3,10,44,0.98)',
          borderBottom:
            '1px solid rgba(125,150,255,0.2)',
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{ py: 1.5 }}
          >
            <IconButton
              onClick={() => setMenuOpen(true)}
              sx={{
                color: '#fff',
                background:
                  'rgba(60,90,220,0.3)',
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
              onClick={() => navigate('/wallet')}
              sx={{
                color: '#fff',
                textTransform: 'none',
              }}
              startIcon={
                <AccountBalanceWalletIcon />
              }
            >
              Wallet
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* MAIN */}

      <Container
        maxWidth="xl"
        sx={{
          py: {
            xs: 3,
            md: 5,
          },
        }}
      >
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
            mb: 3,
          }}
        >
          Welcome to your Global Digital Market
          account.
        </Typography>

        {error && (
          <Card
            sx={{
              mb: 3,
              background:
                'rgba(255,80,80,0.15)',
              color: '#fff',
            }}
          >
            <CardContent>
              <Typography>{error}</Typography>

              <Button
                onClick={() => navigate('/login')}
                sx={{
                  mt: 1,
                  color: '#fff',
                }}
              >
                Login Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* BALANCE */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(135deg,#172a8a,#1459e8)',
            border:
              '1px solid rgba(143,170,255,0.3)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              sx={{
                color: '#b9c8ff',
                fontSize: 13,
                fontWeight: 800,
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
                {money(
                  account.availableBalance
                )}
              </Typography>
            )}

            <Typography
              sx={{
                color: '#cbd6ff',
                mt: 1,
              }}
            >
              Funds available in your account.
            </Typography>

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
                onClick={() =>
                  navigate('/wallet')
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                  background:
                    'linear-gradient(90deg,#14d8ff,#1d8cff)',
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
                  color: '#fff',
                  borderColor: '#fff',
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Withdraw Funds
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* ACCOUNT SUMMARY */}

        <Typography
          sx={{
            fontSize: 22,
            fontWeight: 900,
            mb: 2,
          }}
        >
          Account Summary
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
          <SummaryCard
            title="Deposit"
            value={money(account.deposit)}
            icon={<AccountBalanceWalletIcon />}
            loading={loading}
          />

          <SummaryCard
            title="Profits"
            value={money(account.profits)}
            icon={<ShowChartIcon />}
            loading={loading}
            green
          />

          <SummaryCard
            title="Bonus"
            value={money(account.bonus)}
            icon={<BoltIcon />}
            loading={loading}
            purple
          />

          <SummaryCard
            title="Referrer Bonus"
            value={money(account.referrerBonus)}
            icon={<PeopleIcon />}
            loading={loading}
            gold
          />
        </Box>

        {/* QUICK ACTIONS */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 3,
            color: '#fff',
            background:
              'linear-gradient(145deg,#11246f,#08164c)',
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
              Wallet & Funds
            </Typography>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.5}
            >
              <Button
                fullWidth
                variant="contained"
                startIcon={
                  <AddCircleOutlineIcon />
                }
                onClick={() =>
                  navigate('/wallet')
                }
                sx={{
                  py: 1.4,
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Deposit Funds
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <RemoveCircleOutlineIcon />
                }
                onClick={() =>
                  navigate('/wallet')
                }
                sx={{
                  py: 1.4,
                  color: '#fff',
                  borderColor: '#66dcff',
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Withdraw Funds
              </Button>

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <SwapHorizIcon />
                }
                onClick={() =>
                  navigate('/wallet')
                }
                sx={{
                  py: 1.4,
                  color: '#fff',
                  borderColor: '#66dcff',
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Internal Transfer
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* LIVE MARKETS */}

        <Card
          sx={{
            borderRadius: 3,
            color: '#fff',
            background:
              'linear-gradient(110deg,#1725a0,#1948ce,#078fe5)',
          }}
        >
          <CardContent>
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
                    Live Markets
                  </Typography>

                  <Chip
                    label="Live"
                    size="small"
                    sx={{
                      color: '#fff',
                      background: '#18e76b',
                      fontWeight: 800,
                    }}
                  />
                </Stack>

                <Typography
                  sx={{
                    color: '#c1d7ff',
                    fontSize: 12,
                    mt: 0.5,
                  }}
                >
                  View available trading markets.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={
                  <CandlestickChartIcon />
                }
                onClick={() =>
                  navigate('/market')
                }
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                View Live Markets
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  loading: boolean;
  green?: boolean;
  purple?: boolean;
  gold?: boolean;
}

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  loading,
  green,
  purple,
  gold,
}) => {
  let background =
    'linear-gradient(145deg,#163b9b,#0c205e)';

  let iconColor = '#5ce8ff';

  if (green) {
    background =
      'linear-gradient(145deg,#125c52,#0b302e)';
    iconColor = '#4df28d';
  }

  if (purple) {
    background =
      'linear-gradient(145deg,#70439e,#351d60)';
    iconColor = '#d99cff';
  }

  if (gold) {
    background =
      'linear-gradient(145deg,#8a5722,#4b2c12)';
    iconColor = '#ffc45c';
  }

  return (
    <Card
      sx={{
        borderRadius: 3,
        color: '#fff',
        background,
      }}
    >
      <CardContent>
        <Box sx={{ color: iconColor }}>
          {icon}
        </Box>

        <Typography
          sx={{
            color: '#b9c8ff',
            fontSize: 12,
            fontWeight: 800,
            mt: 1,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: 25,
            fontWeight: 900,
            mt: 1,
          }}
        >
          {loading ? '...' : value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
