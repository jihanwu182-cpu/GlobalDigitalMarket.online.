import React, { useEffect, useMemo, useState } from 'react';
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
  Grid,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface Holding {
  id: string | number;
  symbol: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  gain: number;
}

interface PortfolioData {
  holdings: Holding[];
  cashAvailable: number;
}

const Portfolio: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [portfolio, setPortfolio] = useState<PortfolioData>({
    holdings: [],
    cashAvailable: 0,
  });

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        setError('');

        /*
         * Try the real portfolio endpoint.
         *
         * The backend may return:
         * { holdings: [...], cashAvailable: ... }
         * or
         * { portfolio: { holdings: [...] } }
         */
        const response = await apiClient.get('/portfolio');

        const data = response.data || {};

        const portfolioData =
          data.portfolio ||
          data.data ||
          data;

        const rawHoldings = Array.isArray(
          portfolioData.holdings
        )
          ? portfolioData.holdings
          : Array.isArray(portfolioData.positions)
          ? portfolioData.positions
          : Array.isArray(portfolioData.assets)
          ? portfolioData.assets
          : [];

        const normalizedHoldings: Holding[] =
          rawHoldings
            .map((item: any, index: number) => {
              const quantity = Number(
                item.quantity ??
                  item.qty ??
                  item.units ??
                  0
              );

              const avgCost = Number(
                item.avgCost ??
                  item.averageCost ??
                  item.average_price ??
                  item.costBasis ??
                  0
              );

              const currentPrice = Number(
                item.currentPrice ??
                  item.current_price ??
                  item.price ??
                  0
              );

              const marketValue = Number(
                item.marketValue ??
                  item.market_value ??
                  item.value ??
                  quantity * currentPrice
              );

              const gain = Number(
                item.gain ??
                  item.profitLoss ??
                  item.profit_loss ??
                  marketValue -
                    quantity * avgCost
              );

              return {
                id:
                  item.id ??
                  item._id ??
                  item.symbol ??
                  index,

                symbol: String(
                  item.symbol ??
                    item.asset ??
                    item.ticker ??
                    ''
                ),

                quantity,
                avgCost,
                currentPrice,
                marketValue,
                gain,
              };
            })
            .filter(
              (holding: Holding) =>
                holding.symbol !== ''
            );

        const cashAvailable = Number(
          portfolioData.cashAvailable ??
            portfolioData.cash_available ??
            portfolioData.availableBalance ??
            portfolioData.available_balance ??
            0
        );

        setPortfolio({
          holdings: normalizedHoldings,
          cashAvailable,
        });
      } catch (err) {
        console.error(
          'Portfolio loading error:',
          err
        );

        /*
         * Do not create fake investment data.
         *
         * If the backend endpoint is not available,
         * show an empty portfolio instead.
         */
        setPortfolio({
          holdings: [],
          cashAvailable: 0,
        });

        setError(
          'Your portfolio data is currently unavailable.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, []);

  const totalValue = useMemo(() => {
    return portfolio.holdings.reduce(
      (sum, holding) =>
        sum + holding.marketValue,
      0
    );
  }, [portfolio.holdings]);

  const totalGain = useMemo(() => {
    return portfolio.holdings.reduce(
      (sum, holding) =>
        sum + holding.gain,
      0
    );
  }, [portfolio.holdings]);

  const investedCost = useMemo(() => {
    return portfolio.holdings.reduce(
      (sum, holding) =>
        sum +
        holding.quantity *
          holding.avgCost,
      0
    );
  }, [portfolio.holdings]);

  const totalGainPercent = useMemo(() => {
    if (investedCost <= 0) {
      return 0;
    }

    return (
      (totalGain / investedCost) *
      100
    );
  }, [totalGain, investedCost]);

  const formatCurrency = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      'en-US',
      {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    ).format(value);
  };

  const formatNumber = (
    value: number
  ) => {
    return new Intl.NumberFormat(
      'en-US',
      {
        maximumFractionDigits: 8,
      }
    ).format(value);
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(180deg, #02071f 0%, #071453 100%)',
        }}
      >
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress
            sx={{ color: '#42a5f5' }}
          />

          <Typography
            sx={{ color: '#fff' }}
          >
            Loading portfolio...
          </Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#fff',
        background:
          'radial-gradient(circle at top right, rgba(25,84,199,0.28), transparent 30%), linear-gradient(180deg, #02071f 0%, #071453 55%, #091b68 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        {/* PAGE HEADER */}

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
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                color: '#fff',
                mb: 0.5,
              }}
            >
              Portfolio
            </Typography>

            <Typography
              sx={{
                color:
                  'rgba(255,255,255,0.65)',
              }}
            >
              View and manage your real
              investment holdings.
            </Typography>
          </Box>

          <Stack
            direction="row"
            spacing={1}
          >
            <Button
              variant="outlined"
              onClick={() =>
                navigate('/wallet')
              }
              sx={{
                color: '#fff',
                borderColor:
                  'rgba(255,255,255,0.3)',
              }}
            >
              Wallet
            </Button>

            <Button
              variant="contained"
              onClick={() =>
                navigate('/trading')
              }
              sx={{
                fontWeight: 700,
              }}
            >
              Start Trading
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              background:
                'rgba(33,150,243,0.12)',
              color: '#fff',
              border:
                '1px solid rgba(33,150,243,0.3)',
            }}
          >
            {error}
          </Alert>
        )}

        {/* SUMMARY CARDS */}

        <Grid
          container
          spacing={2}
          sx={{ mb: 3 }}
        >
          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              sx={{
                height: '100%',
                background:
                  'rgba(12,25,75,0.82)',
                border:
                  '1px solid rgba(120,150,255,0.16)',
                borderRadius: 3,
                color: '#fff',
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography
                    sx={{
                      color:
                        'rgba(255,255,255,0.65)',
                    }}
                  >
                    Total Portfolio Value
                  </Typography>

                  <AccountBalanceWalletIcon
                    sx={{
                      color: '#42a5f5',
                    }}
                  />
                </Stack>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {formatCurrency(
                    totalValue
                  )}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color:
                      'rgba(255,255,255,0.55)',
                  }}
                >
                  Based on available
                  holdings
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              sx={{
                height: '100%',
                background:
                  'rgba(12,25,75,0.82)',
                border:
                  '1px solid rgba(120,150,255,0.16)',
                borderRadius: 3,
                color: '#fff',
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography
                    sx={{
                      color:
                        'rgba(255,255,255,0.65)',
                    }}
                  >
                    Total Gain/Loss
                  </Typography>

                  <TrendingUpIcon
                    sx={{
                      color:
                        totalGain >= 0
                          ? '#4caf50'
                          : '#f44336',
                    }}
                  />
                </Stack>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                    color:
                      totalGain >= 0
                        ? '#4caf50'
                        : '#f44336',
                  }}
                >
                  {totalGain >= 0
                    ? '+'
                    : ''}
                  {formatCurrency(
                    totalGain
                  )}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color:
                      totalGain >= 0
                        ? '#4caf50'
                        : '#f44336',
                  }}
                >
                  {totalGainPercent >=
                  0
                    ? '+'
                    : ''}
                  {totalGainPercent.toFixed(
                    2
                  )}
                  %
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              sx={{
                height: '100%',
                background:
                  'rgba(12,25,75,0.82)',
                border:
                  '1px solid rgba(120,150,255,0.16)',
                borderRadius: 3,
                color: '#fff',
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography
                    sx={{
                      color:
                        'rgba(255,255,255,0.65)',
                    }}
                  >
                    Holdings
                  </Typography>

                  <ShowChartIcon
                    sx={{
                      color: '#9c27b0',
                    }}
                  />
                </Stack>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {portfolio.holdings.length}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color:
                      'rgba(255,255,255,0.55)',
                  }}
                >
                  Real assets in
                  portfolio
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3}
          >
            <Card
              sx={{
                height: '100%',
                background:
                  'rgba(12,25,75,0.82)',
                border:
                  '1px solid rgba(120,150,255,0.16)',
                borderRadius: 3,
                color: '#fff',
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 2 }}
                >
                  <Typography
                    sx={{
                      color:
                        'rgba(255,255,255,0.65)',
                    }}
                  >
                    Cash Available
                  </Typography>

                  <AccountBalanceWalletIcon
                    sx={{
                      color: '#ffb300',
                    }}
                  />
                </Stack>

                <Typography
                  variant="h5"
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  {formatCurrency(
                    portfolio.cashAvailable
                  )}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 1,
                    color:
                      'rgba(255,255,255,0.55)',
                  }}
                >
                  Available to trade
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* EMPTY PORTFOLIO */}

        {portfolio.holdings.length ===
          0 && (
          <Card
            sx={{
              background:
                'rgba(12,25,75,0.82)',
              border:
                '1px solid rgba(120,150,255,0.16)',
              borderRadius: 3,
              color: '#fff',
              mb: 3,
            }}
          >
            <CardContent
              sx={{
                py: 7,
                textAlign: 'center',
              }}
            >
              <ShowChartIcon
                sx={{
                  fontSize: 60,
                  color:
                    'rgba(66,165,245,0.65)',
                  mb: 2,
                }}
              />

              <Typography
                variant="h5"
                sx={{
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                No portfolio holdings
              </Typography>

              <Typography
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  color:
                    'rgba(255,255,255,0.6)',
                  mb: 3,
                }}
              >
                Your portfolio does not
                contain any investment
                holdings yet. Once you make
                a real investment, your
                assets will appear here.
              </Typography>

              <Button
                variant="contained"
                onClick={() =>
                  navigate('/trading')
                }
              >
                Explore Trading
              </Button>
            </CardContent>
          </Card>
        )}

        {/* HOLDINGS */}

        {portfolio.holdings.length >
          0 && (
          <>
            <Card
              sx={{
                background:
                  'rgba(12,25,75,0.82)',
                border:
                  '1px solid rgba(120,150,255,0.16)',
                borderRadius: 3,
                color: '#fff',
                mb: 3,
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    mb: 2,
                  }}
                >
                  Portfolio Holdings
                </Typography>

                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            color:
                              'rgba(255,255,255,0.65)',
                            borderBottom:
                              '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          Asset
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              'rgba(255,255,255,0.65)',
                            borderBottom:
                              '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          Quantity
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              'rgba(255,255,255,0.65)',
                            borderBottom:
                              '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          Avg Cost
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              'rgba(255,255,255,0.65)',
                            borderBottom:
                              '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          Current Price
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              'rgba(255,255,255,0.65)',
                            borderBottom:
                              '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          Value
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              'rgba(255,255,255,0.65)',
                            borderBottom:
                              '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          Gain/Loss
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {portfolio.holdings.map(
                        (holding) => {
                          const cost =
                            holding.quantity *
                            holding.avgCost;

                          const percentage =
                            cost > 0
                              ? (holding.gain /
                                  cost) *
                                100
                              : 0;

                          return (
                            <TableRow
                              key={holding.id}
                            >
                              <TableCell
                                sx={{
                                  color: '#fff',
                                  fontWeight: 700,
                                  borderBottom:
                                    '1px solid rgba(255,255,255,0.08)',
                                }}
                              >
                                {holding.symbol}
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  color:
                                    'rgba(255,255,255,0.85)',
                                  borderBottom:
                                    '1px solid rgba(255,255,255,0.08)',
                                }}
                              >
                                {formatNumber(
                                  holding.quantity
                                )}
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  color:
                                    'rgba(255,255,255,0.85)',
                                  borderBottom:
                                    '1px solid rgba(255,255,255,0.08)',
                                }}
                              >
                                {formatCurrency(
                                  holding.avgCost
                                )}
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  color:
                                    'rgba(255,255,255,0.85)',
                                  borderBottom:
                                    '1px solid rgba(255,255,255,0.08)',
                                }}
                              >
                                {formatCurrency(
                                  holding.currentPrice
                                )}
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  color: '#fff',
                                  fontWeight: 600,
                                  borderBottom:
                                    '1px solid rgba(255,255,255,0.08)',
                                }}
                              >
                                {formatCurrency(
                                  holding.marketValue
                                )}
                              </TableCell>

                              <TableCell
                                align="right"
                                sx={{
                                  borderBottom:
                                    '1px solid rgba(255,255,255,0.08)',
                                }}
                              >
                                <Stack
                                  alignItems="flex-end"
                                >
                                  <Typography
                                    sx={{
                                      fontWeight: 700,
                                      color:
                                        holding.gain >=
                                        0
                                          ? '#4caf50'
                                          : '#
