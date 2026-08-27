
import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
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
  };

  const marketAlerts = [
    {
      symbol: 'AAPL',
      message: 'Price reached $182',
      type: 'ALERT',
    },
    {
      symbol: 'MSFT',
      message: 'New all-time high',
      type: 'INFO',
    },
    {
      symbol: 'TSLA',
      message: 'Price dropped 2%',
      type: 'WARNING',
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Welcome back! Here's your investment overview.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <TrendingUpIcon color="primary" />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Portfolio Value
              </Typography>

              <Typography variant="h5">
                ${portfolioStats.totalValue.toFixed(2)}
              </Typography>

              <Typography color="success.main">
                +{portfolioStats.gainPercent.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Total Gain
              </Typography>

              <Typography variant="h5">
                ${portfolioStats.totalGain.toFixed(2)}
              </Typography>

              <Typography color="text.secondary">
                Unrealized gains
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <AccountBalanceWalletIcon color="primary" />

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Cash Balance
              </Typography>

              <Typography variant="h5">
                ${walletStats.balance.toFixed(2)}
              </Typography>

              <Typography color="text.secondary">
                Available to trade
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography
                variant="body2"
                color="text.secondary"
              >
                Holdings
              </Typography>

              <Typography variant="h5">
                {portfolioStats.holdingsCount}
              </Typography>

              <Typography color="text.secondary">
                Active positions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                }}
              >
                <Button
                  variant="contained"
                  onClick={() => navigate('/trading')}
                >
                  Place New Order
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate('/wallet')}
                >
                  Deposit Funds
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate('/portfolio')}
                >
                  View Portfolio
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => navigate('/market')}
                >
                  Explore Markets
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                <NotificationsIcon
                  sx={{
                    mr: 1,
                    verticalAlign: 'middle',
                  }}
                />
                Market Alerts
              </Typography>

              {marketAlerts.map((alert) => (
                <Box
                  key={alert.symbol}
                  sx={{
                    p: 1.5,
                    mb: 1,
                    backgroundColor: '#f5f5f5',
                    borderRadius: 1,
                  }}
                >
                  <Typography
                    variant="body2"
                    fontWeight="bold"
                  >
                    {alert.symbol}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {alert.message}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
