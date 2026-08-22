import React, { useEffect } from 'react';
import { Box, Container, Grid, Typography, Card, CardContent, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import NotificationsIcon from '@mui/icons-material/Notifications';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const portfolioStats = {
    totalValue: 28000,
    totalGain: 1968,
    gainPercent: 7.55,
    holdingsCount: 4,
  };

  const walletStats = {
    balance: 50000,
    pendingDeposits: 10000,
  };

  const marketAlerts = [
    { symbol: 'AAPL', message: 'Price reached $182', type: 'ALERT' },
    { symbol: 'MSFT', message: 'New all-time high', type: 'INFO' },
    { symbol: 'TSLA', message: 'Price dropped 2%', type: 'WARNING' },
  ];

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        Welcome back! Here's your investment overview.
      </Typography>

      {/* Key Metrics */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Portfolio Value"
            value={`$${portfolioStats.totalValue.toFixed(2)}`}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            color="primary"
            subtext={`+${portfolioStats.gainPercent.toFixed(2)}% gain`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Gain"
            value={`$${portfolioStats.totalGain.toFixed(2)}`}
            subtext="Unrealized gains"
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Cash Balance"
            value={`$${walletStats.balance.toFixed(2)}`}
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 40 }} />}
            subtext="Available to trade"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Holdings"
            value={portfolioStats.holdingsCount}
            subtext="Active positions"
          />
        </Grid>
      </Grid>

      {/* Quick Actions & Alerts */}
      <Grid container spacing={3}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => navigate('/trading')}
                >
                  Place New Order
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/wallet')}
                >
                  Deposit Funds
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/portfolio')}
                >
                  View Portfolio
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => navigate('/market')}
                >
                  Explore Markets
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Market Alerts */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <NotificationsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Market Alerts
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {marketAlerts.map((alert, idx) => (
                  <Box
                    key={idx}
                    sx={{
                      p: 1.5,
                      backgroundColor: '#f5f5f5',
                      borderLeft: `4px solid ${
                        alert.type === 'ALERT'
                          ? '#2196F3'
                          : alert.type === 'WARNING'
                          ? '#FF9800'
                          : '#4CAF50'
                      }`,
                      borderRadius: '4px',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {alert.symbol}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {alert.message}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
