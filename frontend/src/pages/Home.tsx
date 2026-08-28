import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(135deg, #0f172a 0%, #16213e 50%, #1e3a5f 100%)',
        color: '#fff',
      }}
    >
      {/* Navigation */}
      <Box
        sx={{
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          py: 2,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
              }}
            >
              Global Digital Market
            </Typography>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                color="inherit"
                onClick={() => navigate('/login')}
              >
                Login
              </Button>

              <Button
                variant="contained"
                onClick={() => navigate('/register')}
              >
                Create Account
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Hero */}
      <Container maxWidth="lg">
        <Box
          sx={{
            py: {
              xs: 8,
              md: 12,
            },
            textAlign: 'center',
          }}
        >
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: {
                xs: '2.5rem',
                md: '4rem',
              },
              mb: 3,
            }}
          >
            Make smarter decisions
            <br />
            in global markets.
          </Typography>

          <Typography
            variant="h6"
            sx={{
              maxWidth: 720,
              mx: 'auto',
              mb: 4,
              color: 'rgba(255,255,255,0.75)',
              lineHeight: 1.7,
            }}
          >
            Explore market information, monitor your portfolio,
            and build your financial knowledge with Global Digital
            Market.
          </Typography>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 5,
                py: 1.5,
                fontSize: '1rem',
              }}
            >
              Get Started →
            </Button>

            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/market')}
              sx={{
                px: 5,
                py: 1.5,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.5)',
              }}
            >
              View Markets
            </Button>
          </Box>
        </Box>

        {/* Features */}
        <Grid
          container
          spacing={3}
          sx={{
            pb: 8,
          }}
        >
          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <TrendingUpIcon sx={{ fontSize: 45, mb: 2 }} />

                <Typography variant="h6" sx={{ mb: 1 }}>
                  Market Insights
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Follow market information and monitor
                  important price movements.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <SecurityIcon sx={{ fontSize: 45, mb: 2 }} />

                <Typography variant="h6" sx={{ mb: 1 }}>
                  Secure Account
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  Keep your account information protected with
                  secure authentication.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                height: '100%',
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <AccountBalanceWalletIcon
                  sx={{ fontSize: 45, mb: 2 }}
                />

                <Typography variant="h6" sx={{ mb: 1 }}>
                  Manage Your Portfolio
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.7)' }}
                >
                  View your portfolio, wallet and trading
                  information from one place.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Market Preview */}
        <Card
          sx={{
            mb: 8,
            backgroundColor: 'rgba(255,255,255,0.08)',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                mb: 3,
              }}
            >
              <ShowChartIcon sx={{ fontSize: 40 }} />

              <Box>
                <Typography variant="h5">
                  Market Overview
                </Typography>

                <Typography
                  variant="body2"
                  sx={{ color: 'rgba(255,255,255,0.65)' }}
                >
                  Explore available markets
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2}>
              {[
                ['AAPL', '$182.10', '+2.31%'],
                ['MSFT', '$418.55', '+1.84%'],
                ['TSLA', '$248.98', '-0.72%'],
                ['AMZN', '$231.45', '+1.26%'],
              ].map(([symbol, price, change]) => (
                <Grid item xs={6} md={3} key={symbol}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor:
                        'rgba(255,255,255,0.06)',
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{ fontWeight: 700 }}
                    >
                      {symbol}
                    </Typography>

                    <Typography variant="h6">
                      {price}
                    </Typography>

                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          change.startsWith('+')
                            ? '#4caf50'
                            : '#f44336',
                      }}
                    >
                      {change}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Button
              variant="outlined"
              onClick={() => navigate('/market')}
              sx={{
                mt: 3,
                color: '#fff',
                borderColor: 'rgba(255,255,255,0.5)',
              }}
            >
              Explore Markets
            </Button>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Home;
