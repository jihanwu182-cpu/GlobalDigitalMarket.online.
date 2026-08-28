import React, { useEffect, useState } from 'react';
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';

import DashboardIcon from '@mui/icons-material/Dashboard';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import PieChartIcon from '@mui/icons-material/PieChart';
import BoltIcon from '@mui/icons-material/Bolt';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

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

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [performance, setPerformance] =
    useState<PerformanceResponse>({
      totalValue: 0,
      totalGain: 0,
      gainPercentage: 0,
      availableBalance: 0,
      buyingPower: 0,
    });

  const [holdings, setHoldings] = useState<Holding[]>([]);

  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setErrorMessage('');

        const performanceResponse =
          await apiClient.get<PerformanceResponse>(
            '/portfolio/performance'
          );

        const holdingsResponse =
          await apiClient.get<HoldingsResponse>(
            '/portfolio/holdings'
          );

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
            Number(
              performanceResponse.data?.buyingPower
            ) || 0,
        });

        setHoldings(
          Array.isArray(holdingsResponse.data?.holdings)
            ? holdingsResponse.data.holdings
            : []
        );
      } catch (error: any) {
        console.error('DASHBOARD ERROR:', error);

        if (error?.response?.status === 401) {
          setErrorMessage(
            'Your login session has expired. Please login again.'
          );
        } else {
          setErrorMessage(
            'Unable to load your account data.'
          );
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatMoney = (value: number) => {
    return `$${Number(value || 0).toLocaleString(
      'en-US',
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const portfolioValue =
    formatMoney(performance.totalValue);

  const availableBalance =
    formatMoney(performance.availableBalance);

  const totalProfit =
    performance.totalGain >= 0
      ? `+${formatMoney(performance.totalGain)}`
      : formatMoney(performance.totalGain);

  const profitPercentage =
    performance.gainPercentage >= 0
      ? `+${performance.gainPercentage.toFixed(2)}%`
      : `${performance.gainPercentage.toFixed(2)}%`;

  const marketAssets = [
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

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #030a2c 0%, #071453 50%, #091b68 100%)',
        color: '#fff',
        pb: 5,
      }}
    >
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background: 'rgba(3, 10, 44, 0.95)',
          borderBottom:
            '1px solid rgba(125,150,255,0.2)',
        }}
      >
        <Toolbar>
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
                color: '#8da7ff',
                fontSize: 11,
              }}
            >
              PROFESSIONAL DIGITAL ASSET PLATFORM
            </Typography>
          </Box>

          <Button
            onClick={() => navigate('/market')}
            sx={{ color: '#fff' }}
          >
            Markets
          </Button>

          <Button
            onClick={() => navigate('/portfolio')}
            sx={{ color: '#fff' }}
          >
            Portfolio
          </Button>

          <Button
            onClick={() => navigate('/wallet')}
            sx={{ color: '#fff' }}
          >
            Wallet
          </Button>
        </Toolbar>
      </AppBar>

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
                xs: 30,
                md: 40,
              },
              fontWeight: 800,
            }}
          >
            Dashboard
          </Typography>

          <Typography
            sx={{
              color: '#9eaff0',
              mt: 1,
            }}
          >
            Welcome to your Global Digital Market account.
          </Typography>
        </Box>

        {errorMessage && (
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
                {errorMessage}
              </Typography>

              <Button
                variant="contained"
                onClick={() => navigate('/login')}
                sx={{ mt: 2 }}
              >
                Login Again
              </Button>
            </CardContent>
          </Card>
        )}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(135deg, #172a8a, #1459e8)',
            border:
              '1px solid rgba(143,170,255,0.28)',
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
            <Typography
              sx={{
                color: '#b9c8ff',
                fontSize: 13,
                fontWeight: 700,
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
                    md: 52,
                  },
                  fontWeight: 800,
                  mt: 1,
                }}
              >
                {portfolioValue}
              </Typography>
            )}

            <Typography
              sx={{
                mt: 1,
                color: '#cbd6ff',
              }}
            >
              Performance: {profitPercentage}
            </Typography>
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
            mb: 4,
          }}
        >
          <Card
            sx={{
              background:
                'linear-gradient(145deg, #14287d, #0c1b58)',
              color: '#fff',
              borderRadius: 3,
            }}
          >
            <CardContent>
              <TrendingUpIcon />

              <Typography
                sx={{
                  color: '#9eaff0',
                  mt: 1,
                  fontSize: 12,
                }}
              >
                TOTAL PROFIT
              </Typography>

              <Typography
                sx={{
                  fontSize: 26,
                  fontWeight: 800,
                  mt: 1,
                }}
              >
                {totalProfit}
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              background:
                'linear-gradient(145deg, #14287d, #0c1b58)',
              color: '#fff',
              borderRadius: 3,
            }}
          >
            <CardContent>
              <AccountBalanceWalletIcon />

              <Typography
                sx={{
                  color: '#9eaff0',
                  mt: 1,
                  fontSize: 12,
                }}
              >
                AVAILABLE BALANCE
              </Typography>

              <Typography
                sx={{
                  fontSize: 26,
                  fontWeight: 800,
                  mt: 1,
                }}
              >
                {availableBalance}
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              background:
                'linear-gradient(145deg, #14287d, #0c1b58)',
              color: '#fff',
              borderRadius: 3,
            }}
          >
            <CardContent>
              <PieChartIcon />

              <Typography
                sx={{
                  color: '#9eaff0',
                  mt: 1,
                  fontSize: 12,
                }}
              >
                ACTIVE POSITIONS
              </Typography>

              <Typography
                sx={{
                  fontSize: 26,
                  fontWeight: 800,
                  mt: 1,
                }}
              >
                {holdings.length}
              </Typography>
            </CardContent>
          </Card>

          <Card
            sx={{
              background:
                'linear-gradient(145deg, #14287d, #0c1b58)',
              color: '#fff',
              borderRadius: 3,
            }}
          >
            <CardContent>
              <AutoGraphIcon />

              <Typography
                sx={{
                  color: '#9eaff0',
                  mt: 1,
                  fontSize: 12,
                }}
              >
                BUYING POWER
              </Typography>

              <Typography
                sx={{
                  fontSize: 26,
                  fontWeight: 800,
                  mt: 1,
                }}
              >
                {formatMoney(
                  performance.buyingPower || 0
                )}
              </Typography>
            </CardContent>
          </Card>
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
              background:
                'linear-gradient(145deg, #11246f, #08164c)',
              color: '#fff',
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 2 }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 800,
                    }}
                  >
                    Market Overview
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8296e0',
                      fontSize: 12,
                    }}
                  >
                    Selected market instruments
                  </Typography>
                </Box>

                <Button
                  onClick={() => navigate('/market')}
                  sx={{
                    color: '#62dcff',
                  }}
                >
                  View
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
                        'rgba(255,255,255,0.05)',
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
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
                          ml: 1.5,
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 800,
                            fontSize: 13,
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
                            fontWeight: 800,
                            fontSize: 13,
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

          <Card
            sx={{
              background:
                'linear-gradient(145deg, #11246f, #08164c)',
              color: '#fff',
              borderRadius: 3,
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 800,
                  mb: 1,
                }}
              >
                My Portfolio
              </Typography>

              <Typography
                sx={{
                  color: '#8296e0',
                  fontSize: 12,
                  mb: 2,
                }}
              >
                Your actual database holdings
              </Typography>

              {loading ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    py: 4,
                  }}
                >
                  <CircularProgress
                    sx={{ color: '#fff' }}
                  />
                </Box>
              ) : holdings.length === 0 ? (
                <Typography
                  sx={{
                    color: '#9eaff0',
                    py: 2,
                  }}
                >
                  No portfolio holdings yet.
                </Typography>
              ) : (
                <Stack spacing={1}>
                  {holdings.map((holding) => (
                    <Box
                      key={holding.id}
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        background:
                          'rgba(255,255,255,0.05)',
                        display: 'flex',
                        justifyContent:
                          'space-between',
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 800,
                          }}
                        >
                          {holding.symbol}
                        </Typography>

                        <Typography
                          sx={{
                            color: '#8296e0',
                            fontSize: 11,
                          }}
                        >
                          Quantity: {holding.quantity}
                        </Typography>
                      </Box>

                      <Typography
                        sx={{
                          fontWeight: 800,
                        }}
                      >
                        {formatMoney(
                          Number(
                            holding.market_value
                          ) || 0
                        )}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              )}

              <Button
                variant="outlined"
                onClick={() => navigate('/portfolio')}
                sx={{
                  mt: 3,
                  color: '#fff',
                  borderColor: '#5ce8ff',
                }}
              >
                View Portfolio
              </Button>
            </CardContent>
          </Card>
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
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                >
                  Ready to Trade?
                </Typography>

                <Typography
                  sx={{
                    color: '#c1d7ff',
                    fontSize: 12,
                    mt: 0.5,
                  }}
                >
                  Open your trading workspace.
                </Typography>
              </Box>

              <Button
                variant="contained"
                startIcon={<BoltIcon />}
                onClick={() => navigate('/trading')}
                sx={{
                  py: 1.3,
                  px: 3,
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Start Trading
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Dashboard;
