import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';

interface TradingPair {
  symbol: string;
  name: string;
  category: 'Forex' | 'Crypto' | 'Stocks' | 'Commodities';
}

const TRADING_PAIRS: TradingPair[] = [
  // ==========================================================
  // FOREX / CURRENCY PAIRS
  // ==========================================================
  {
    symbol: 'EUR/USD',
    name: 'Euro / US Dollar',
    category: 'Forex',
  },
  {
    symbol: 'GBP/USD',
    name: 'British Pound / US Dollar',
    category: 'Forex',
  },
  {
    symbol: 'USD/JPY',
    name: 'US Dollar / Japanese Yen',
    category: 'Forex',
  },
  {
    symbol: 'USD/CHF',
    name: 'US Dollar / Swiss Franc',
    category: 'Forex',
  },
  {
    symbol: 'AUD/USD',
    name: 'Australian Dollar / US Dollar',
    category: 'Forex',
  },
  {
    symbol: 'USD/CAD',
    name: 'US Dollar / Canadian Dollar',
    category: 'Forex',
  },
  {
    symbol: 'NZD/USD',
    name: 'New Zealand Dollar / US Dollar',
    category: 'Forex',
  },
  {
    symbol: 'EUR/GBP',
    name: 'Euro / British Pound',
    category: 'Forex',
  },
  {
    symbol: 'EUR/JPY',
    name: 'Euro / Japanese Yen',
    category: 'Forex',
  },
  {
    symbol: 'GBP/JPY',
    name: 'British Pound / Japanese Yen',
    category: 'Forex',
  },
  {
    symbol: 'AUD/JPY',
    name: 'Australian Dollar / Japanese Yen',
    category: 'Forex',
  },
  {
    symbol: 'USD/NGN',
    name: 'US Dollar / Nigerian Naira',
    category: 'Forex',
  },

  // ==========================================================
  // CRYPTO
  // ==========================================================
  {
    symbol: 'BTC/USD',
    name: 'Bitcoin / US Dollar',
    category: 'Crypto',
  },
  {
    symbol: 'ETH/USD',
    name: 'Ethereum / US Dollar',
    category: 'Crypto',
  },
  {
    symbol: 'BNB/USD',
    name: 'BNB / US Dollar',
    category: 'Crypto',
  },
  {
    symbol: 'XRP/USD',
    name: 'XRP / US Dollar',
    category: 'Crypto',
  },
  {
    symbol: 'SOL/USD',
    name: 'Solana / US Dollar',
    category: 'Crypto',
  },
  {
    symbol: 'ADA/USD',
    name: 'Cardano / US Dollar',
    category: 'Crypto',
  },
  {
    symbol: 'DOGE/USD',
    name: 'Dogecoin / US Dollar',
    category: 'Crypto',
  },

  // ==========================================================
  // STOCKS
  // ==========================================================
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    category: 'Stocks',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    category: 'Stocks',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft Corporation',
    category: 'Stocks',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla Inc.',
    category: 'Stocks',
  },
  {
    symbol: 'AMZN',
    name: 'Amazon.com Inc.',
    category: 'Stocks',
  },
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corporation',
    category: 'Stocks',
  },

  // ==========================================================
  // COMMODITIES
  // ==========================================================
  {
    symbol: 'GOLD/USD',
    name: 'Gold / US Dollar',
    category: 'Commodities',
  },
  {
    symbol: 'SILVER/USD',
    name: 'Silver / US Dollar',
    category: 'Commodities',
  },
  {
    symbol: 'OIL/USD',
    name: 'Crude Oil / US Dollar',
    category: 'Commodities',
  },
];

const Trading: React.FC = () => {
  const navigate = useNavigate();

  const [symbol, setSymbol] = useState('EUR/USD');
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const selectedPair = useMemo(
    () =>
      TRADING_PAIRS.find(
        (pair) => pair.symbol === symbol
      ) || TRADING_PAIRS[0],
    [symbol]
  );

  const handleTrade = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setErrorMessage(
        'Please enter a valid trade amount.'
      );
      return;
    }

    /*
     * IMPORTANT:
     * This button does NOT execute a real trade yet.
     * A real order API must be connected before money
     * or positions are changed.
     */
    setSuccessMessage(
      `${side} order prepared for ${symbol}. Real order execution is not connected yet.`
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #030a2c 0%, #071453 50%, #091b68 100%)',
        color: '#fff',
        pb: 6,
      }}
    >
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Box
        sx={{
          background: 'rgba(3,10,44,0.96)',
          borderBottom:
            '1px solid rgba(125,150,255,0.2)',
        }}
      >
        <Box
          sx={{
            maxWidth: 1400,
            mx: 'auto',
            px: {
              xs: 2,
              md: 4,
            },
            py: 2,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: {
                    xs: 20,
                    sm: 24,
                  },
                  fontWeight: 800,
                }}
              >
                Global Digital Market
              </Typography>

              <Typography
                sx={{
                  color: '#8da7ff',
                  fontSize: 11,
                }}
              >
                TRADING WORKSPACE
              </Typography>
            </Box>

            <Button
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
              sx={{
                color: '#fff',
                textTransform: 'none',
              }}
            >
              Dashboard
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* ======================================================
          MAIN
      ====================================================== */}

      <Box
        sx={{
          maxWidth: 1400,
          mx: 'auto',
          px: {
            xs: 2,
            md: 4,
          },
          py: {
            xs: 3,
            md: 5,
          },
        }}
      >
        {/* ====================================================
            TITLE
        ==================================================== */}

        <Box sx={{ mb: 3 }}>
          <Typography
            sx={{
              fontSize: {
                xs: 30,
                md: 40,
              },
              fontWeight: 800,
            }}
          >
            Trading
          </Typography>

          <Typography
            sx={{
              color: '#9eaff0',
              mt: 1,
            }}
          >
            Select a currency pair, crypto asset,
            stock or commodity.
          </Typography>
        </Box>

        {/* ====================================================
            MESSAGES
        ==================================================== */}

        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setErrorMessage('')}
          >
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="info"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        {/* ====================================================
            SELECTED MARKET
        ==================================================== */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(135deg,#172a8a,#1459e8)',
            border:
              '1px solid rgba(143,170,255,0.28)',
          }}
        >
          <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
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
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <ShowChartIcon
                    sx={{
                      color: '#5ce8ff',
                      fontSize: 32,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: {
                        xs: 26,
                        md: 34,
                      },
                      fontWeight: 800,
                    }}
                  >
                    {selectedPair.symbol}
                  </Typography>
                </Stack>

                <Typography
                  sx={{
                    color: '#b9c8ff',
                    mt: 0.5,
                  }}
                >
                  {selectedPair.name}
                </Typography>
              </Box>

              <Chip
                label={selectedPair.category}
                sx={{
                  color: '#fff',
                  background:
                    'rgba(255,255,255,0.12)',
                  fontWeight: 700,
                }}
              />
            </Stack>
          </CardContent>
        </Card>

        {/* ====================================================
            LAYOUT
        ==================================================== */}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1fr 380px',
            },
            gap: 3,
          }}
        >
          {/* ==================================================
              CHART
          ================================================== */}

          <Card
            sx={{
              minHeight: 520,
              borderRadius: 4,
              color: '#fff',
              background:
                'linear-gradient(145deg,#11246f,#08164c)',
              border:
                '1px solid rgba(100,150,255,0.2)',
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
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 21,
                      fontWeight: 800,
                    }}
                  >
                    {selectedPair.symbol} Chart
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8296e0',
                      fontSize: 12,
                    }}
                  >
                    Market price chart
                  </Typography>
                </Box>

                <TrendingUpIcon
                  sx={{
                    color: '#5ce8ff',
                    fontSize: 30,
                  }}
                />
              </Stack>

              <Divider
                sx={{
                  borderColor:
                    'rgba(255,255,255,0.08)',
                  mb: 3,
                }}
              />

              {/* ============================================
                  CHART AREA
              ============================================ */}

              <Box
                sx={{
                  height: 380,
                  borderRadius: 3,
                  border:
                    '1px solid rgba(120,150,255,0.16)',
                  background:
                    'linear-gradient(180deg,rgba(15,31,90,0.8),rgba(3,10,44,0.8))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Grid */}

                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.18,
                    backgroundImage:
                      'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
                    backgroundSize:
                      '50px 50px',
                  }}
                />

                <Box
                  sx={{
                    position: 'relative',
                    textAlign: 'center',
                    px: 3,
                  }}
                >
                  <ShowChartIcon
                    sx={{
                      fontSize: 64,
                      color: '#5ce8ff',
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 800,
                    }}
                  >
                    Market data unavailable
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8296e0',
                      fontSize: 13,
                      mt: 1,
                      maxWidth: 420,
                    }}
                  >
                    The chart is ready for live market
                    data. Connect a real market-data
                    provider before displaying live
                    prices or executing trades.
                  </Typography>
                </Box>
              </Box>

              {/* ============================================
                  TIMEFRAME BUTTONS
              ============================================ */}

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  mt: 2,
                  overflowX: 'auto',
                }}
              >
                {['1m', '5m', '15m', '1H', '4H', '1D'].map(
                  (timeframe) => (
                    <Button
                      key={timeframe}
                      size="small"
                      variant={
                        timeframe === '1H'
                          ? 'contained'
                          : 'outlined'
                      }
                      sx={{
                        minWidth: 58,
                        textTransform: 'none',
                        color: '#fff',
                        borderColor:
                          'rgba(120,160,255,0.35)',
                      }}
                    >
                      {timeframe}
                    </Button>
                  )
                )}
              </Stack>
            </CardContent>
          </Card>

          {/* ==================================================
              ORDER PANEL
          ================================================== */}

          <Card
            sx={{
              borderRadius: 4,
              color: '#fff',
              background:
                'linear-gradient(145deg,#11246f,#08164c)',
              border:
                '1px solid rgba(100,150,255,0.2)',
              height: 'fit-content',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography
                sx={{
                  fontSize: 23,
                  fontWeight: 800,
                  mb: 3,
                }}
              >
                Place Order
              </Typography>

              <Box
                component="form"
                onSubmit={handleTrade}
              >
                {/* ==========================================
                    PAIR
                ========================================== */}

                <FormControl
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  <InputLabel
                    sx={{ color: '#aebeff' }}
                  >
                    Trading Pair
                  </InputLabel>

                  <Select
                    value={symbol}
                    label="Trading Pair"
                    onChange={(event) =>
                      setSymbol(
                        event.target.value
                      )
                    }
                    sx={{
                      color: '#fff',
                      '.MuiOutlinedInput-notchedOutline':
                        {
                          borderColor:
                            'rgba(140,170,255,0.4)',
                        },
                      '&:hover .MuiOutlinedInput-notchedOutline':
                        {
                          borderColor:
                            '#5ce8ff',
                        },
                      '.MuiSvgIcon-root': {
                        color: '#fff',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        sx: {
                          maxHeight: 450,
                        },
                      },
                    }}
                  >
                    {[
                      'Forex',
                      'Crypto',
                      'Stocks',
                      'Commodities',
                    ].map((category) => (
                      <React.Fragment
                        key={category}
                      >
                        <MenuItem
                          disabled
                          sx={{
                            fontWeight: 800,
                            color:
                              '#1976d2 !important',
                          }}
                        >
                          {category}
                        </MenuItem>

                        {TRADING_PAIRS.filter(
                          (pair) =>
                            pair.category ===
                            category
                        ).map((pair) => (
                          <MenuItem
                            key={pair.symbol}
                            value={pair.symbol}
                          >
                            {pair.symbol} —{' '}
                            {pair.name}
                          </MenuItem>
                        ))}
                      </React.Fragment>
                    ))}
                  </Select>
                </FormControl>

                {/* ==========================================
                    BUY / SELL
                ========================================== */}

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <Button
                    fullWidth
                    variant={
                      side === 'BUY'
                        ? 'contained'
                        : 'outlined'
                    }
                    onClick={() =>
                      setSide('BUY')
                    }
                    sx={{
                      py: 1.4,
                      fontWeight: 800,
                      textTransform: 'none',
                      color: '#fff',
                      borderColor:
                        '#4df28d',
                      background:
                        side === 'BUY'
                          ? '#159447'
                          : 'transparent',
                    }}
                  >
                    Buy
                  </Button>

                  <Button
                    fullWidth
                    variant={
                      side === 'SELL'
                        ? 'contained'
                        : 'outlined'
                    }
                    onClick={() =>
                      setSide('SELL')
                    }
                    sx={{
                      py: 1.4,
                      fontWeight: 800,
                      textTransform: 'none',
                      color: '#fff',
                      borderColor:
                        '#ff6681',
                      background:
                        side === 'SELL'
                          ? '#b52c49'
                          : 'transparent',
                    }}
                  >
                    Sell
                  </Button>
                </Stack>

                {/* ==========================================
                    AMOUNT
                ========================================== */}

                <TextField
                  fullWidth
                  label="Trade Amount (USD)"
                  type="number"
                  value={amount}
                  onChange={(event) =>
                    setAmount(
                      event.target.value
                    )
                  }
                  inputProps={{
                    min: 0,
                    step: '0.01',
                  }}
                  sx={{
                    mb: 2,
                    '& .MuiInputLabel-root': {
                      color: '#aebeff',
                    },
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      '& fieldset': {
                        borderColor:
                          'rgba(140,170,255,0.4)',
                      },
                    },
                  }}
                />

                {/* ==========================================
                    SELECTED PAIR INFO
                ========================================== */}

                <Box
                  sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    background:
                      'rgba(255,255,255,0.05)',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#8296e0',
                      fontSize: 11,
                    }}
                  >
                    SELECTED INSTRUMENT
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 800,
                      mt: 0.5,
                    }}
                  >
                    {selectedPair.symbol}
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8296e0',
                      fontSize: 12,
                      mt: 0.5,
                    }}
                  >
                    {selectedPair.name}
                  </Typography>
                </Box>

                {/* ==========================================
                    ORDER BUTTON
                ========================================== */}

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  startIcon={
                    <TrendingUpIcon />
                  }
                  sx={{
                    py: 1.5,
                    fontWeight: 800,
                    textTransform: 'none',
                    background:
                      side === 'BUY'
                        ? 'linear-gradient(90deg,#13b95f,#18d878)'
                        : 'linear-gradient(90deg,#d93657,#ff5577)',
                  }}
                >
                  {side === 'BUY'
                    ? 'Prepare Buy Order'
                    : 'Prepare Sell Order'}
                </Button>
              </Box>

              {/* ==========================================
                  WALLET
              ========================================== */}

              <Divider
                sx={{
                  my: 3,
                  borderColor:
                    'rgba(255,255,255,0.08)',
                }}
              />

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <AccountBalanceWalletIcon />
                }
                onClick={() =>
                  navigate('/wallet')
                }
                sx={{
                  color: '#fff',
                  borderColor:
                    'rgba(120,220,255,0.5)',
                  textTransform: 'none',
                }}
              >
                Open Wallet
              </Button>
            </CardContent>
          </Card>
        </Box>

        {/* ====================================================
            AVAILABLE MARKETS
        ==================================================== */}

        <Card
          sx={{
            mt: 3,
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(145deg,#11246f,#08164c)',
            border:
              '1px solid rgba(100,150,255,0.2)',
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 800,
                mb: 1,
              }}
            >
              Available Markets
            </Typography>

            <Typography
              sx={{
                color: '#8296e0',
                fontSize: 12,
                mb: 2,
              }}
            >
              Select any instrument to prepare an
              order.
            </Typography>

            <Stack
              direction="row"
              spacing={1}
              flexWrap="wrap"
              useFlexGap
            >
              {TRADING_PAIRS.map((pair) => (
                <Chip
                  key={pair.symbol}
                  label={pair.symbol}
                  onClick={() =>
                    setSymbol(pair.symbol)
                  }
                  variant={
                    symbol === pair.symbol
                      ? 'filled'
                      : 'outlined'
                  }
                  sx={{
                    color: '#fff',
                    borderColor:
                      'rgba(120,160,255,0.35)',
                    background:
                      symbol === pair.symbol
                        ? '#1954c7'
                        : 'transparent',
                    mb: 1,
                  }}
                />
              ))}
            </Stack>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default Trading;
