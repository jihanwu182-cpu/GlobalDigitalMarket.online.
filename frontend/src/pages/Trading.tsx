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

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { useNavigate } from 'react-router-dom';

interface TradingPair {
  symbol: string;
  name: string;
  category: 'Forex' | 'Crypto' | 'Stocks' | 'Commodities';
}

interface ChartPoint {
  time: string;
  price: number;
}

const TRADING_PAIRS: TradingPair[] = [
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

const BASE_PRICES: Record<string, number> = {
  'EUR/USD': 1.17,
  'GBP/USD': 1.35,
  'USD/JPY': 147.2,
  'USD/CHF': 0.79,
  'AUD/USD': 0.65,
  'USD/CAD': 1.38,
  'NZD/USD': 0.59,
  'EUR/GBP': 0.87,
  'EUR/JPY': 172.3,
  'GBP/JPY': 198.5,
  'AUD/JPY': 95.8,
  'USD/NGN': 1540,
  'BTC/USD': 110500,
  'ETH/USD': 4250,
  'BNB/USD': 860,
  'XRP/USD': 2.95,
  'SOL/USD': 205,
  'ADA/USD': 0.82,
  'DOGE/USD': 0.24,
  AAPL: 232,
  GOOGL: 205,
  MSFT: 506,
  TSLA: 335,
  AMZN: 235,
  NVDA: 180,
  'GOLD/USD': 3390,
  'SILVER/USD': 38.5,
  'OIL/USD': 64.5,
};

const createChartData = (symbol: string): ChartPoint[] => {
  const basePrice = BASE_PRICES[symbol] || 100;

  const points: ChartPoint[] = [];

  let price = basePrice * 0.97;

  for (let i = 0; i < 30; i += 1) {
    const movement =
      Math.sin(i * 0.75) * 0.006 +
      Math.cos(i * 0.35) * 0.003 +
      0.0015;

    price = price * (1 + movement);

    points.push({
      time: `${i + 1}`,
      price: Number(price.toFixed(4)),
    });
  }

  return points;
};

const Trading: React.FC = () => {
  const navigate = useNavigate();

  const [symbol, setSymbol] = useState('EUR/USD');
  const [amount, setAmount] = useState('');
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [timeframe, setTimeframe] = useState('1H');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const selectedPair = useMemo(() => {
    return (
      TRADING_PAIRS.find(
        (pair) => pair.symbol === symbol
      ) || TRADING_PAIRS[0]
    );
  }, [symbol]);

  const chartData = useMemo(() => {
    return createChartData(symbol);
  }, [symbol]);

  const currentPrice =
    chartData.length > 0
      ? chartData[chartData.length - 1].price
      : BASE_PRICES[symbol] || 0;

  const previousPrice =
    chartData.length > 1
      ? chartData[chartData.length - 2].price
      : currentPrice;

  const priceChange = currentPrice - previousPrice;

  const priceChangePercent =
    previousPrice !== 0
      ? (priceChange / previousPrice) * 100
      : 0;

  const handleTrade = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    const numericAmount = Number(amount);

    if (
      !Number.isFinite(numericAmount) ||
      numericAmount <= 0
    ) {
      setErrorMessage(
        'Please enter a valid trade amount.'
      );
      return;
    }

    setSuccessMessage(
      `${side} order prepared for ${symbol} for $${numericAmount.toLocaleString(
        'en-US',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}.`
    );
  };

  const formatPrice = (price: number) => {
    if (price >= 1000) {
      return price.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }

    if (price >= 10) {
      return price.toFixed(2);
    }

    return price.toFixed(4);
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
      {/* HEADER */}

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

      {/* MAIN */}

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
        {/* TITLE */}

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
            Trade forex, crypto, stocks and commodities.
          </Typography>
        </Box>

        {/* MESSAGES */}

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
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccessMessage('')}
          >
            {successMessage}
          </Alert>
        )}

        {/* MARKET HEADER */}

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
              alignItems={{
                xs: 'flex-start',
                md: 'center',
              }}
              spacing={3}
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

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={2}
                alignItems={{
                  xs: 'flex-start',
                  sm: 'center',
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      color: '#b9c8ff',
                      fontSize: 11,
                    }}
                  >
                    CURRENT PRICE
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 26,
                      fontWeight: 800,
                    }}
                  >
                    {formatPrice(currentPrice)}
                  </Typography>
                </Box>

                <Chip
                  label={`${priceChangePercent >= 0 ? '+' : ''}${priceChangePercent.toFixed(
                    2
                  )}%`}
                  sx={{
                    color: '#fff',
                    background:
                      priceChangePercent >= 0
                        ? 'rgba(19,185,95,0.8)'
                        : 'rgba(217,54,87,0.8)',
                    fontWeight: 800,
                  }}
                />

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
            </Stack>
          </CardContent>
        </Card>

        {/* CONTENT */}

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
          {/* CHART */}

          <Card
            sx={{
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
                    Price movement
                  </Typography>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                >
                  {['1m', '5m', '15m', '1H', '4H', '1D'].map(
                    (item) => (
                      <Button
                        key={item}
                        size="small"
                        onClick={() =>
                          setTimeframe(item)
                        }
                        variant={
                          timeframe === item
                            ? 'contained'
                            : 'outlined'
                        }
                        sx={{
                          minWidth: 48,
                          color: '#fff',
                          textTransform: 'none',
                          borderColor:
                            'rgba(120,160,255,0.35)',
                        }}
                      >
                        {item}
                      </Button>
                    )
                  )}
                </Stack>
              </Stack>

              <Divider
                sx={{
                  borderColor:
                    'rgba(255,255,255,0.08)',
                  mb: 3,
                }}
              />

              {/* CHART */}

              <Box
                sx={{
                  width: '100%',
                  height: {
                    xs: 320,
                    md: 430,
                  },
                }}
              >
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <LineChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 20,
                      left: 10,
                      bottom: 10,
                    }}
                  >
                    <CartesianGrid
                      stroke="rgba(255,255,255,0.10)"
                      strokeDasharray="3 3"
                    />

                    <XAxis
                      dataKey="time"
                      tick={{
                        fill: '#8296e0',
                        fontSize: 11,
                      }}
                      axisLine={{
                        stroke:
                          'rgba(255,255,255,0.15)',
                      }}
                      tickLine={false}
                    />

                    <YAxis
                      domain={['auto', 'auto']}
                      tick={{
                        fill: '#8296e0',
                        fontSize: 11,
                      }}
                      axisLine={{
                        stroke:
                          'rgba(255,255,255,0.15)',
                      }}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        background: '#071453',
                        border:
                          '1px solid rgba(120,160,255,0.4)',
                        borderRadius: 8,
                        color: '#fff',
                      }}
                      formatter={(value: number) => [
                        formatPrice(value),
                        'Price',
                      ]}
                      labelFormatter={(label) =>
                        `Point ${label}`
                      }
                    />

                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#5ce8ff"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{
                        r: 5,
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>

              <Box
                sx={{
                  mt: 2,
                  p: 2,
                  borderRadius: 2,
                  background:
                    'rgba(255,255,255,0.04)',
                }}
              >
                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={3}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: '#8296e0',
                        fontSize: 11,
                      }}
                    >
                      PRICE
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      {formatPrice(currentPrice)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        color: '#8296e0',
                        fontSize: 11,
                      }}
                    >
                      CHANGE
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 800,
                        color:
                          priceChange >= 0
                            ? '#4df28d'
                            : '#ff6681',
                      }}
                    >
                      {priceChange >= 0
                        ? '+'
                        : ''}
                      {priceChange.toFixed(4)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography
                      sx={{
                        color: '#8296e0',
                        fontSize: 11,
                      }}
                    >
                      TIMEFRAME
                    </Typography>

                    <Typography
                      sx={{
                        fontWeight: 800,
                      }}
                    >
                      {timeframe}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </CardContent>
          </Card>

          {/* ORDER PANEL */}

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
                {/* PAIR */}

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

                {/* BUY / SELL */}

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mb: 2 }}
                >
                  <Button
                    fullWidth
                    type="button"
                    onClick={() =>
                      setSide('BUY')
                    }
                    variant={
                      side === 'BUY'
                        ? 'contained'
                        : 'outlined'
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
                    type="button"
                    onClick={() =>
                      setSide('SELL')
                    }
                    variant={
                      side === 'SELL'
                        ? 'contained'
                        : 'outlined'
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

                {/* AMOUNT */}

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
                      '&:hover fieldset': {
                        borderColor:
                          '#5ce8ff',
                      },
                    },
                  }}
                />

                {/* SELECTED INSTRUMENT */}

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

                  <Typography
                    sx={{
                      color: '#5ce8ff',
                      fontSize: 13,
                      mt: 1,
                      fontWeight: 700,
                    }}
                  >
                    Price: {formatPrice(currentPrice)}
                  </Typography>
                </Box>

                {/* ORDER BUTTON */}

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

              <Divider
                sx={{
                  my: 3,
                  borderColor:
                    'rgba(255,255,255,0.08)',
                }}
              />

              {/* WALLET */}

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

        {/* AVAILABLE MARKETS */}

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
              Select an instrument to view its chart
              and prepare an order.
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
