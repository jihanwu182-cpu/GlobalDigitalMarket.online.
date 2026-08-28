import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  Typography,
} from '@mui/material';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';

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

interface PortfolioState {
  holdings: Holding[];
  cashAvailable: number;
}

const Portfolio: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [portfolio, setPortfolio] = useState<PortfolioState>({
    holdings: [],
    cashAvailable: 0,
  });

  useEffect(() => {
    const loadPortfolio = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await apiClient.get('/portfolio');

        const data = response.data || {};
        const source = data.portfolio || data.data || data;

        const rawHoldings = Array.isArray(source.holdings)
          ? source.holdings
          : Array.isArray(source.positions)
          ? source.positions
          : [];

        const holdings: Holding[] = rawHoldings
          .map((item: any, index: number) => {
            const quantity = Number(item.quantity || item.qty || 0);

            const avgCost = Number(
              item.avgCost ||
                item.averageCost ||
                item.average_price ||
                0
            );

            const currentPrice = Number(
              item.currentPrice ||
                item.current_price ||
                item.price ||
                0
            );

            const marketValue = Number(
              item.marketValue ||
                item.market_value ||
                item.value ||
                quantity * currentPrice
            );

            const gain = Number(
              item.gain ||
                item.profitLoss ||
                item.profit_loss ||
                marketValue - quantity * avgCost
            );

            return {
              id: item.id || item._id || index,
              symbol: String(
                item.symbol ||
                  item.asset ||
                  item.ticker ||
                  ''
              ),
              quantity,
              avgCost,
              currentPrice,
              marketValue,
              gain,
            };
          })
          .filter((item: Holding) => item.symbol !== '');

        const cashAvailable = Number(
          source.availableBalance ||
            source.available_balance ||
            source.cashAvailable ||
            source.cash_available ||
            0
        );

        setPortfolio({
          holdings,
          cashAvailable,
        });
      } catch (err) {
        console.error('Portfolio error:', err);

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

  const totalValue = portfolio.holdings.reduce(
    (total, holding) => total + holding.marketValue,
    0
  );

  const totalGain = portfolio.holdings.reduce(
    (total, holding) => total + holding.gain,
    0
  );

  const investedAmount = portfolio.holdings.reduce(
    (total, holding) =>
      total + holding.quantity * holding.avgCost,
    0
  );

  const gainPercentage =
    investedAmount > 0
      ? (totalGain / investedAmount) * 100
      : 0;

  const money = (value: number) => {
    return `$${value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
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
        <Stack spacing={2} alignItems="center">
          <CircularProgress sx={{ color: '#5ce8ff' }} />

          <Typography sx={{ color: '#fff' }}>
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
          'radial-gradient(circle at top right, rgba(25,84,199,0.3), transparent 30%), linear-gradient(180deg, #02071f 0%, #071453 55%, #091b68 100%)',
        pb: 6,
      }}
    >
      <Container maxWidth="xl" sx={{ pt: 4 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography
              sx={{
                fontSize: { xs: 30, md: 42 },
                fontWeight: 900,
              }}
            >
              My Portfolio
            </Typography>

            <Typography
              sx={{
                color: '#8ea4e8',
                mt: 0.5,
              }}
            >
              Your real investment holdings and account assets.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={() => navigate('/wallet')}
              sx={{
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.35)',
                textTransform: 'none',
              }}
            >
              Wallet
            </Button>

            <Button
              variant="contained"
              startIcon={<CandlestickChartIcon />}
              onClick={() => navigate('/trading')}
              sx={{
                textTransform: 'none',
                fontWeight: 800,
              }}
            >
              Trading
            </Button>
          </Stack>
        </Stack>

        {error && (
          <Alert
            severity="info"
            sx={{
              mb: 3,
              color: '#fff',
              background: 'rgba(33,150,243,0.15)',
            }}
          >
            {error}
          </Alert>
        )}

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
          <StatCard
            title="Portfolio Value"
            value={money(totalValue)}
            subtitle="Current holdings value"
            icon={<AccountBalanceWalletIcon />}
          />

          <StatCard
            title="Gain / Loss"
            value={`${totalGain >= 0 ? '+' : ''}${money(totalGain)}`}
            subtitle={`${gainPercentage >= 0 ? '+' : ''}${gainPercentage.toFixed(2)}%`}
            icon={<TrendingUpIcon />}
            positive={totalGain >= 0}
          />

          <StatCard
            title="Holdings"
            value={String(portfolio.holdings.length)}
            subtitle="Real portfolio assets"
            icon={<ShowChartIcon />}
          />

          <StatCard
            title="Cash Available"
            value={money(portfolio.cashAvailable)}
            subtitle="Available account balance"
            icon={<AccountBalanceWalletIcon />}
          />
        </Box>

        {portfolio.holdings.length === 0 ? (
          <Card
            sx={{
              borderRadius: 4,
              color: '#fff',
              background:
                'linear-gradient(145deg, #11246f, #08164c)',
              border:
                '1px solid rgba(100,150,255,0.2)',
            }}
          >
            <CardContent
              sx={{
                py: 8,
                textAlign: 'center',
              }}
            >
              <ShowChartIcon
                sx={{
                  fontSize: 64,
                  color: '#5ce8ff',
                  mb: 2,
                }}
              />

              <Typography
                sx={{
                  fontSize: 26,
                  fontWeight: 900,
                  mb: 1,
                }}
              >
                No Portfolio Holdings
              </Typography>

              <Typography
                sx={{
                  maxWidth: 600,
                  mx: 'auto',
                  color: '#8ea4e8',
                  lineHeight: 1.7,
                  mb: 3,
                }}
              >
                There are currently no real investment
                holdings in your account. When you make a
                real investment, your assets will appear
                here automatically.
              </Typography>

              <Button
                variant="contained"
                startIcon={<CandlestickChartIcon />}
                onClick={() => navigate('/trading')}
                sx={{
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Explore Markets
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card
            sx={{
              borderRadius: 4,
              color: '#fff',
              background:
                'linear-gradient(145deg, #11246f, #08164c)',
              border:
                '1px solid rgba(100,150,255,0.2)',
            }}
          >
            <CardContent>
              <Typography
                sx={{
                  fontSize: 22,
                  fontWeight: 900,
                  mb: 3,
                }}
              >
                Portfolio Holdings
              </Typography>

              <Box
                sx={{
                  overflowX: 'auto',
                }}
              >
                <Box
                  sx={{
                    minWidth: 850,
                  }}
                >
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1.2fr 1fr 1fr 1fr 1.2fr 1.2fr',
                      gap: 2,
                      p: 2,
                      color: '#8198df',
                      fontSize: 12,
                      fontWeight: 900,
                      textTransform: 'uppercase',
                    }}
                  >
                    <Box>Asset</Box>
                    <Box>Quantity</Box>
                    <Box>Average Cost</Box>
                    <Box>Current Price</Box>
                    <Box>Value</Box>
                    <Box>Gain / Loss</Box>
                  </Box>

                  {portfolio.holdings.map((holding) => {
                    const cost =
                      holding.quantity * holding.avgCost;

                    const percentage =
                      cost > 0
                        ? (holding.gain / cost) * 100
                        : 0;

                    return (
                      <Box
                        key={holding.id}
                        sx={{
                          display: 'grid',
                          gridTemplateColumns:
                            '1.2fr 1fr 1fr 1fr 1.2fr 1.2fr',
                          gap: 2,
                          p: 2,
                          borderTop:
                            '1px solid rgba(255,255,255,0.08)',
                        }}
                      >
                        <Typography
                          sx={{
                            fontWeight: 900,
                          }}
                        >
                          {holding.symbol}
                        </Typography>

                        <Typography>
                          {holding.quantity}
                        </Typography>

                        <Typography>
                          {money(holding.avgCost)}
                        </Typography>

                        <Typography>
                          {money(holding.currentPrice)}
                        </Typography>

                        <Typography>
                          {money(holding.marketValue)}
                        </Typography>

                        <Box>
                          <Typography
                            sx={{
                              fontWeight: 800,
                              color:
                                holding.gain >= 0
                                  ? '#4df28d'
                                  : '#ff6b7a',
                            }}
                          >
                            {holding.gain >= 0 ? '+' : ''}
                            {money(holding.gain)}
                          </Typography>

                          <Typography
                            sx={{
                              fontSize: 11,
                              color:
                                holding.gain >= 0
                                  ? '#4df28d'
                                  : '#ff6b7a',
                            }}
                          >
                            {percentage >= 0 ? '+' : ''}
                            {percentage.toFixed(2)}%
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  positive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  positive,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        color: '#fff',
        background:
          'linear-gradient(145deg, #11246f, #08164c)',
        border:
          '1px solid rgba(100,150,255,0.2)',
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography
            sx={{
              color: '#8198df',
              fontSize: 12,
              fontWeight: 800,
              textTransform: 'uppercase',
            }}
          >
            {title}
          </Typography>

          <Box
            sx={{
              color: positive === false
                ? '#ff6b7a'
                : '#5ce8ff',
              display: 'flex',
            }}
          >
            {icon}
          </Box>
        </Stack>

        <Typography
          sx={{
            mt: 2,
            fontSize: 25,
            fontWeight: 900,
          }}
        >
          {value}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            color: '#8198df',
            fontSize: 12,
          }}
        >
          {subtitle}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default Portfolio;
