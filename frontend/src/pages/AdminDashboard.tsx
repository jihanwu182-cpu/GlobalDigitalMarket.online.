import React, { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';

import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LogoutIcon from '@mui/icons-material/Logout';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useNavigate } from 'react-router-dom';

import apiClient from '../services/apiClient';

interface AdminDashboardData {
  totalUsers: number;
  activeUsers: number;
  totalAccounts: number;
  totalTransactions: number;
  pendingTransactions: number;
  completedDeposits: number;
  completedWithdrawals: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  pendingKyc: number;
  totalAccountBalance: number;
}

const money = (
  value: number,
  currency = 'USD'
): string => {
  const safeValue = Number(value) || 0;

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(safeValue);
  } catch {
    return `$${safeValue.toFixed(2)}`;
  }
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 3,
        color: '#fff',
        background:
          'linear-gradient(145deg,#101f63,#08143f)',
        border:
          '1px solid rgba(100,150,255,0.20)',
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Box>
            <Typography
              sx={{
                color: '#8198df',
                fontSize: 11,
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 0.7,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: {
                  xs: 22,
                  md: 28,
                },
                fontWeight: 900,
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#5ce8ff',
              background:
                'rgba(92,232,255,0.10)',
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
};

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<AdminDashboardData | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState('');

  const loadDashboard = async (
    showRefresh = false
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const response =
        await apiClient.get(
          '/admin/dashboard'
        );

      const data =
        response.data || {};

      setDashboard(
        data.dashboard || null
      );
    } catch (requestError: any) {
      console.error(
        'Admin dashboard error:',
        requestError
      );

      if (
        requestError?.response?.status ===
        401
      ) {
        setError(
          'Your administrator session has expired. Please login again.'
        );
      } else if (
        requestError?.response?.status ===
        403
      ) {
        setError(
          'You do not have administrator permission.'
        );
      } else {
        setError(
          requestError?.response?.data
            ?.message ||
            requestError?.response?.data
              ?.error ||
            'Unable to load the admin dashboard.'
        );
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(
      'adminToken'
    );

    localStorage.removeItem(
      'admin'
    );

    navigate('/admin/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#fff',
        background:
          'radial-gradient(circle at top right, rgba(25,84,199,0.30), transparent 30%), linear-gradient(180deg,#02071f 0%,#071453 55%,#091b68 100%)',
        pb: 6,
      }}
    >
      {/* TOP BAR */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background:
            'rgba(2,7,31,0.96)',
          backdropFilter:
            'blur(14px)',
          borderBottom:
            '1px solid rgba(125,150,255,0.18)',
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              py: 2,
            }}
          >
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                sx={{
                  fontSize: {
                    xs: 20,
                    md: 26,
                  },
                  fontWeight: 900,
                }}
              >
                Admin Dashboard
              </Typography>

              <Typography
                sx={{
                  color: '#7189d0',
                  fontSize: 10,
                  letterSpacing: 1,
                }}
              >
                GLOBAL DIGITAL MARKET
              </Typography>
            </Box>

            <Button
              startIcon={
                <RefreshIcon />
              }
              onClick={() =>
                loadDashboard(true)
              }
              disabled={refreshing}
              sx={{
                color: '#5ce8ff',
                textTransform: 'none',
                fontWeight: 800,
              }}
            >
              Refresh
            </Button>

            <Button
              startIcon={
                <LogoutIcon />
              }
              onClick={handleLogout}
              sx={{
                color: '#ff8297',
                textTransform: 'none',
                fontWeight: 800,
              }}
            >
              Logout
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* CONTENT */}

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
                xs: 28,
                md: 38,
              },
              fontWeight: 900,
            }}
          >
            Administration
          </Typography>

          <Typography
            sx={{
              color: '#8ea4e8',
              mt: 0.5,
            }}
          >
            Monitor users, accounts, transactions,
            deposits, withdrawals and KYC requests.
          </Typography>
        </Box>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {loading ? (
          <Box
            sx={{
              py: 10,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <CircularProgress
              sx={{
                color: '#5ce8ff',
              }}
            />
          </Box>
        ) : dashboard ? (
          <>
            {/* MAIN STATISTICS */}

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
                <StatCard
                  title="Total Users"
                  value={String(
                    dashboard.totalUsers
                  )}
                  icon={
                    <PeopleIcon />
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >
                <StatCard
                  title="Active Users"
                  value={String(
                    dashboard.activeUsers
                  )}
                  icon={
                    <VerifiedUserIcon />
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >
                <StatCard
                  title="Total Accounts"
                  value={String(
                    dashboard.totalAccounts
                  )}
                  icon={
                    <AccountBalanceIcon />
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >
                <StatCard
                  title="Transactions"
                  value={String(
                    dashboard.totalTransactions
                  )}
                  icon={
                    <ReceiptLongIcon />
                  }
                />
              </Grid>
            </Grid>

            {/* FINANCIAL STATISTICS */}

            <Grid
              container
              spacing={2}
              sx={{ mb: 3 }}
            >
              <Grid
                item
                xs={12}
                md={4}
              >
                <StatCard
                  title="Account Balance"
                  value={money(
                    dashboard.totalAccountBalance
                  )}
                  icon={
                    <AccountBalanceIcon />
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={4}
              >
                <StatCard
                  title="Completed Deposits"
                  value={money(
                    dashboard.completedDeposits
                  )}
                  icon={
                    <AddCircleOutlineIcon />
                  }
                />
              </Grid>

              <Grid
                item
                xs={12}
                md={4}
              >
                <StatCard
                  title="Completed Withdrawals"
                  value={money(
                    dashboard.completedWithdrawals
                  )}
                  icon={
                    <RemoveCircleOutlineIcon />
                  }
                />
              </Grid>
            </Grid>

            {/* PENDING */}

            <Card
              sx={{
                borderRadius: 4,
                color: '#fff',
                background:
                  'linear-gradient(145deg,#101f63,#08143f)',
                border:
                  '1px solid rgba(100,150,255,0.20)',
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography
                  sx={{
                    fontSize: 22,
                    fontWeight: 900,
                    mb: 2,
                  }}
                >
                  Pending Activity
                </Typography>

                <Divider
                  sx={{
                    mb: 2,
                    borderColor:
                      'rgba(255,255,255,0.08)',
                  }}
                />

                <Grid
                  container
                  spacing={2}
                >
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                  >
                    <StatCard
                      title="Pending Transactions"
                      value={String(
                        dashboard.pendingTransactions
                      )}
                      icon={
                        <PendingActionsIcon />
                      }
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                  >
                    <StatCard
                      title="Pending Deposits"
                      value={String(
                        dashboard.pendingDeposits
                      )}
                      icon={
                        <AddCircleOutlineIcon />
                      }
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                  >
                    <StatCard
                      title="Pending Withdrawals"
                      value={String(
                        dashboard.pendingWithdrawals
                      )}
                      icon={
                        <RemoveCircleOutlineIcon />
                      }
                    />
                  </Grid>

                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={3}
                  >
                    <StatCard
                      title="Pending KYC"
                      value={String(
                        dashboard.pendingKyc
                      )}
                      icon={
                        <VerifiedUserIcon />
                      }
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </>
        ) : (
          <Alert severity="warning">
            Admin dashboard data is unavailable.
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default AdminDashboard;
