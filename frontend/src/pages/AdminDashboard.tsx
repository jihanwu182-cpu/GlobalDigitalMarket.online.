import React, { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
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
import BlockIcon from '@mui/icons-material/Block';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

import { useNavigate } from 'react-router-dom';

import apiClient from '../services/apiClient';

// ============================================================
// TYPES
// ============================================================

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

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  username?: string;
  phone?: string;
  country?: string;
  preferredCurrency?: string;
  referralCode?: string;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  identityVerificationStatus?: string;
  createdAt?: string;
  account?: {
    id: number;
    accountNumber?: string;
    accountType?: string;
    currency?: string;
    balance?: number;
    availableBalance?: number;
  } | null;
}

interface AdminTransaction {
  id: number;
  accountId: number;
  transactionReference?: string;
  transactionType?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  status?: string;
  description?: string;
  proofOfPaymentUrl?: string;
  adminNote?: string;
  createdAt?: string;
  user?: {
    id: number;
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
  };
}

interface KycRequest {
  id: number;
  userId: number;
  documentType?: string;
  documentNumber?: string;
  documentUrl?: string;
  status?: string;
  rejectionReason?: string;
  createdAt?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    country?: string;
  };
}

// ============================================================
// HELPERS
// ============================================================

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

const statusColor = (
  status?: string
):
  | 'success'
  | 'warning'
  | 'error'
  | 'default'
  | 'info' => {
  const value = String(
    status || ''
  ).toLowerCase();

  if (
    value === 'completed' ||
    value === 'active' ||
    value === 'approved'
  ) {
    return 'success';
  }

  if (
    value === 'pending' ||
    value === 'processing'
  ) {
    return 'warning';
  }

  if (
    value === 'failed' ||
    value === 'cancelled' ||
    value === 'blocked' ||
    value === 'suspended' ||
    value === 'rejected'
  ) {
    return 'error';
  }

  return 'default';
};

// ============================================================
// STAT CARD
// ============================================================

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

// ============================================================
// ADMIN DASHBOARD
// ============================================================

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] =
    useState<AdminDashboardData | null>(null);

  const [users, setUsers] =
    useState<AdminUser[]>([]);

  const [transactions, setTransactions] =
    useState<AdminTransaction[]>([]);

  const [deposits, setDeposits] =
    useState<AdminTransaction[]>([]);

  const [withdrawals, setWithdrawals] =
    useState<AdminTransaction[]>([]);

  const [kycRequests, setKycRequests] =
    useState<KycRequest[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [sectionLoading, setSectionLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [tab, setTab] =
    useState(0);

  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState<AdminTransaction | null>(null);

  const [userStatusDialog, setUserStatusDialog] =
    useState(false);

  const [transactionDialog, setTransactionDialog] =
    useState(false);

  const [newUserStatus, setNewUserStatus] =
    useState('active');

  const [newTransactionStatus, setNewTransactionStatus] =
    useState('PENDING');

  const [adminNote, setAdminNote] =
    useState('');

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard = async () => {
    try {
      setError('');

      const response =
        await apiClient.get(
          '/admin/dashboard'
        );

      setDashboard(
        response.data?.dashboard || null
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
          requestError?.response?.data?.message ||
            requestError?.response?.data?.error ||
            'Unable to load admin dashboard.'
        );
      }
    }
  };

  // ==========================================================
  // LOAD USERS
  // ==========================================================

  const loadUsers = async () => {
    try {
      const response =
        await apiClient.get(
          '/admin/users'
        );

      setUsers(
        response.data?.users || []
      );
    } catch (requestError) {
      console.error(
        'Admin users error:',
        requestError
      );
    }
  };

  // ==========================================================
  // LOAD TRANSACTIONS
  // ==========================================================

  const loadTransactions = async () => {
    try {
      const response =
        await apiClient.get(
          '/admin/transactions'
        );

      setTransactions(
        response.data?.transactions || []
      );
    } catch (requestError) {
      console.error(
        'Admin transactions error:',
        requestError
      );
    }
  };

  // ==========================================================
  // LOAD DEPOSITS
  // ==========================================================

  const loadDeposits = async () => {
    try {
      const response =
        await apiClient.get(
          '/admin/deposits'
        );

      setDeposits(
        response.data?.deposits || []
      );
    } catch (requestError) {
      console.error(
        'Admin deposits error:',
        requestError
      );
    }
  };

  // ==========================================================
  // LOAD WITHDRAWALS
  // ==========================================================

  const loadWithdrawals = async () => {
    try {
      const response =
        await apiClient.get(
          '/admin/withdrawals'
        );

      setWithdrawals(
        response.data?.withdrawals || []
      );
    } catch (requestError) {
      console.error(
        'Admin withdrawals error:',
        requestError
      );
    }
  };

  // ==========================================================
  // LOAD KYC
  // ==========================================================

  const loadKyc = async () => {
    try {
      const response =
        await apiClient.get(
          '/admin/kyc'
        );

      setKycRequests(
        response.data?.requests || []
      );
    } catch (requestError) {
      console.error(
        'Admin KYC error:',
        requestError
      );
    }
  };

  // ==========================================================
  // LOAD EVERYTHING
  // ==========================================================

  const loadAllData = async (
    initial = false
  ) => {
    try {
      if (initial) {
        setLoading(true);
      } else {
        setSectionLoading(true);
      }

      setError('');

      await Promise.all([
        loadDashboard(),
        loadUsers(),
        loadTransactions(),
        loadDeposits(),
        loadWithdrawals(),
        loadKyc(),
      ]);
    } finally {
      setLoading(false);
      setSectionLoading(false);
    }
  };

  useEffect(() => {
    loadAllData(true);
  }, []);

  // ==========================================================
  // UPDATE USER STATUS
  // ==========================================================

  const updateUserStatus = async () => {
    if (!selectedUser) {
      return;
    }

    try {
      setSectionLoading(true);

      await apiClient.patch(
        `/admin/users/${selectedUser.id}/status`,
        {
          status: newUserStatus,
        }
      );

      setUserStatusDialog(false);
      setSelectedUser(null);

      await loadAllData();
    } catch (requestError: any) {
      console.error(
        'Update user status error:',
        requestError
      );

      setError(
        requestError?.response?.data?.message ||
          'Unable to update user status.'
      );
    } finally {
      setSectionLoading(false);
    }
  };

  // ==========================================================
  // UPDATE TRANSACTION
  // ==========================================================

  const updateTransactionStatus = async () => {
    if (!selectedTransaction) {
      return;
    }

    try {
      setSectionLoading(true);

      await apiClient.patch(
        `/admin/transactions/${selectedTransaction.id}/status`,
        {
          status:
            newTransactionStatus,
          adminNote:
            adminNote || null,
        }
      );

      setTransactionDialog(false);
      setSelectedTransaction(null);
      setAdminNote('');

      await loadAllData();
    } catch (requestError: any) {
      console.error(
        'Update transaction error:',
        requestError
      );

      setError(
        requestError?.response?.data?.message ||
          'Unable to update transaction.'
      );
    } finally {
      setSectionLoading(false);
    }
  };

  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {
    localStorage.removeItem(
      'adminToken'
    );

    localStorage.removeItem(
      'admin'
    );

    navigate('/admin/login');
  };

  // ==========================================================
  // USER CARD
  // ==========================================================

  const UserCard = ({
    user,
  }: {
    user: AdminUser;
  }) => {
    return (
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          background:
            'linear-gradient(145deg,#101f63,#08143f)',
          color: '#fff',
          border:
            '1px solid rgba(100,150,255,0.18)',
        }}
      >
        <CardContent>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                  fontSize: 18,
                }}
              >
                {user.firstName}{' '}
                {user.lastName}
              </Typography>

              <Typography
                sx={{
                  color: '#8ea4e8',
                  fontSize: 13,
                }}
              >
                {user.email}
              </Typography>

              <Typography
                sx={{
                  color: '#7189d0',
                  fontSize: 12,
                  mt: 0.5,
                }}
              >
                ID: {user.id}
                {user.username
                  ? ` • @${user.username}`
                  : ''}
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <Chip
                label={
                  user.status ||
                  'unknown'
                }
                color={statusColor(
                  user.status
                )}
                size="small"
              />

              <Button
                size="small"
                startIcon={
                  <VisibilityIcon />
                }
                onClick={() => {
                  setSelectedUser(
                    user
                  );
                }}
                sx={{
                  color: '#5ce8ff',
                  textTransform:
                    'none',
                }}
              >
                View
              </Button>

              <Button
                size="small"
                startIcon={
                  <BlockIcon />
                }
                onClick={() => {
                  setSelectedUser(
                    user
                  );

                  setNewUserStatus(
                    user.status ||
                      'active'
                  );

                  setUserStatusDialog(
                    true
                  );
                }}
                sx={{
                  color: '#ff8297',
                  textTransform:
                    'none',
                }}
              >
                Status
              </Button>
            </Stack>
          </Stack>

          {user.account && (
            <>
              <Divider
                sx={{
                  my: 2,
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
                  sm={4}
                >
                  <Typography
                    sx={{
                      color: '#7189d0',
                      fontSize: 11,
                    }}
                  >
                    ACCOUNT
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    {user.account.accountNumber ||
                      'N/A'}
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <Typography
                    sx={{
                      color: '#7189d0',
                      fontSize: 11,
                    }}
                  >
                    BALANCE
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    {money(
                      Number(
                        user.account.balance
                      ) || 0,
                      user.account.currency ||
                        'USD'
                    )}
                  </Typography>
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={4}
                >
                  <Typography
                    sx={{
                      color: '#7189d0',
                      fontSize: 11,
                    }}
                  >
                    ACCOUNT TYPE
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 800,
                    }}
                  >
                    {user.account.accountType ||
                      'N/A'}
                  </Typography>
                </Grid>
              </Grid>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // ==========================================================
  // TRANSACTION CARD
  // ==========================================================

  const TransactionCard = ({
    transaction,
  }: {
    transaction: AdminTransaction;
  }) => {
    return (
      <Card
        sx={{
          mb: 2,
          borderRadius: 3,
          background:
            'linear-gradient(145deg,#101f63,#08143f)',
          color: '#fff',
          border:
            '1px solid rgba(100,150,255,0.18)',
        }}
      >
        <CardContent>
          <Stack
            direction={{
              xs: 'column',
              md: 'row',
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Box>
              <Typography
                sx={{
                  fontWeight: 900,
                }}
              >
                {transaction.transactionType ||
                  'TRANSACTION'}
              </Typography>

              <Typography
                sx={{
                  color: '#8ea4e8',
                  fontSize: 13,
                }}
              >
                {transaction.user
                  ? `${transaction.user.firstName || ''} ${transaction.user.lastName || ''}`
                  : 'Unknown user'}
              </Typography>

              <Typography
                sx={{
                  color: '#7189d0',
                  fontSize: 12,
                }}
              >
                {transaction.transactionReference ||
                  `Transaction #${transaction.id}`}
              </Typography>
            </Box>

            <Box
              sx={{
                textAlign: {
                  xs: 'left',
                  md: 'right',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                {money(
                  Number(
                    transaction.amount
                  ) || 0,
                  transaction.currency ||
                    'USD'
                )}
              </Typography>

              <Chip
                label={
                  transaction.status ||
                  'UNKNOWN'
                }
                color={statusColor(
                  transaction.status
                )}
                size="small"
              />
            </Box>
          </Stack>

          <Divider
            sx={{
              my: 2,
              borderColor:
                'rgba(255,255,255,0.08)',
            }}
          />

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            spacing={1}
          >
            <Button
              startIcon={
                <VisibilityIcon />
              }
              onClick={() => {
                setSelectedTransaction(
                  transaction
                );
              }}
              sx={{
                color: '#5ce8ff',
                textTransform:
                  'none',
              }}
            >
              View
            </Button>

            <Button
              startIcon={
                <CheckCircleIcon />
              }
              onClick={() => {
                setSelectedTransaction(
                  transaction
                );

                setNewTransactionStatus(
                  'COMPLETED'
                );

                setAdminNote('');

                setTransactionDialog(
                  true
                );
              }}
              sx={{
                color: '#48e0a4',
                textTransform:
                  'none',
              }}
            >
              Update Status
            </Button>
          </Stack>
        </CardContent>
      </Card>
    );
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            '#02071f',
        }}
      >
        <CircularProgress
          sx={{
            color: '#5ce8ff',
          }}
        />
      </Box>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

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
      {/* ======================================================
          HEADER
      ====================================================== */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          background:
            'rgba(2,7,31,0.97)',
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
            spacing={1}
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
                loadAllData()
              }
              disabled={sectionLoading}
              sx={{
                color: '#5ce8ff',
                textTransform:
                  'none',
                fontWeight: 800,
              }}
            >
              Refresh
            </Button>

            <Button
              startIcon={
                <LogoutIcon />
              }
              onClick={
                handleLogout
              }
              sx={{
                color: '#ff8297',
                textTransform:
                  'none',
                fontWeight: 800,
              }}
            >
              Logout
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* ======================================================
          CONTENT
      ====================================================== */}

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
            mb: 4,
          }}
        >
          Manage users, accounts,
          deposits, withdrawals,
          transactions and KYC.
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        {/* ====================================================
            STATISTICS
        ==================================================== */}

        {dashboard && (
          <>
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
                  title="Accounts"
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

            <Grid
              container
              spacing={2}
              sx={{ mb: 4 }}
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
          </>
        )}

        {/* ====================================================
            MANAGEMENT TABS
        ==================================================== */}

        <Card
          sx={{
            borderRadius: 4,
            background:
              'linear-gradient(145deg,#101f63,#08143f)',
            color: '#fff',
            border:
              '1px solid rgba(100,150,255,0.20)',
          }}
        >
          <Tabs
            value={tab}
            onChange={(
              _event,
              newValue
            ) =>
              setTab(newValue)
            }
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              borderBottom:
                '1px solid rgba(255,255,255,0.08)',

              '& .MuiTab-root': {
                color: '#8198df',
                fontWeight: 800,
                textTransform:
                  'none',
              },

              '& .Mui-selected': {
                color: '#5ce8ff !important',
              },

              '& .MuiTabs-indicator': {
                backgroundColor:
                  '#5ce8ff',
              },
            }}
          >
            <Tab
              label={`Users (${users.length})`}
              icon={
                <PeopleIcon />
              }
              iconPosition="start"
            />

            <Tab
              label={`Deposits (${deposits.length})`}
              icon={
                <AddCircleOutlineIcon />
              }
              iconPosition="start"
            />

            <Tab
              label={`Withdrawals (${withdrawals.length})`}
              icon={
                <RemoveCircleOutlineIcon />
              }
              iconPosition="start"
            />

            <Tab
              label={`Transactions (${transactions.length})`}
              icon={
                <ReceiptLongIcon />
              }
              iconPosition="start"
            />

            <Tab
              label={`KYC (${kycRequests.length})`}
              icon={
                <VerifiedUserIcon />
              }
              iconPosition="start"
            />
          </Tabs>

          <CardContent sx={{ p: 3 }}>
            {/* ==================================================
                USERS
            ================================================== */}

            {tab === 0 && (
              <>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 900,
                    mb: 3,
                  }}
                >
                  User Management
                </Typography>

                {users.length === 0 ? (
                  <Alert severity="info">
                    No users found.
                  </Alert>
                ) : (
                  users.map(
                    (user) => (
                      <UserCard
                        key={user.id}
                        user={user}
                      />
                    )
                  )
                )}
              </>
            )}

            {/* ==================================================
                DEPOSITS
            ================================================== */}

            {tab === 1 && (
              <>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 900,
                    mb: 3,
                  }}
                >
                  Deposit Management
                </Typography>

                {deposits.length ===
                0 ? (
                  <Alert severity="info">
                    No deposits found.
                  </Alert>
                ) : (
                  deposits.map(
                    (deposit) => (
                      <TransactionCard
                        key={
                          deposit.id
                        }
                        transaction={
                          deposit
                        }
                      />
                    )
                  )
                )}
              </>
            )}

            {/* ==================================================
                WITHDRAWALS
            ================================================== */}

            {tab === 2 && (
              <>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 900,
                    mb: 3,
                  }}
                >
                  Withdrawal Management
                </Typography>

                {withdrawals.length ===
                0 ? (
                  <Alert severity="info">
                    No withdrawals found.
                  </Alert>
                ) : (
                  withdrawals.map(
                    (
                      withdrawal
                    ) => (
                      <TransactionCard
                        key={
                          withdrawal.id
                        }
                        transaction={
                          withdrawal
                        }
                      />
                    )
                  )
                )}
              </>
            )}

            {/* ==================================================
                TRANSACTIONS
            ================================================== */}

            {tab === 3 && (
              <>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 900,
                    mb: 3,
                  }}
                >
                  Transaction Management
                </Typography>

                {transactions.length ===
                0 ? (
                  <Alert severity="info">
                    No transactions
                    found.
                  </Alert>
                ) : (
                  transactions.map(
                    (
                      transaction
                    ) => (
                      <TransactionCard
                        key={
                          transaction.id
                        }
                        transaction={
                          transaction
                        }
                      />
                    )
                  )
                )}
              </>
            )}

            {/* ==================================================
                KYC
            ================================================== */}

            {tab === 4 && (
              <>
                <Typography
                  sx={{
                    fontSize: 24,
                    fontWeight: 900,
                    mb: 3,
                  }}
                >
                  KYC Requests
                </Typography>

                {kycRequests.length ===
                0 ? (
                  <Alert severity="info">
                    No KYC requests
                    found.
                  </Alert>
                ) : (
                  kycRequests.map(
                    (request) => (
                      <Card
                        key={
                          request.id
                        }
                        sx={{
                          mb: 2,
                          borderRadius: 3,
                          background:
                            'rgba(5,15,55,0.8)',
                          color: '#fff',
                          border:
                            '1px solid rgba(100,150,255,0.18)',
                        }}
                      >
                        <CardContent>
                          <Stack
                            direction={{
                              xs: 'column',
                              md: 'row',
                            }}
                            justifyContent="space-between"
                            spacing={2}
                          >
                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 900,
                                }}
                              >
                                {request
                                  .user
                                  ?.firstName ||
                                  ''}{' '}
                                {request
                                  .user
                                  ?.lastName ||
                                  ''}
                              </Typography>

                              <Typography
                                sx={{
                                  color:
                                    '#8ea4e8',
                                  fontSize:
                                    13,
                                }}
                              >
                                {request
                                  .user
                                  ?.email ||
                                  'Unknown email'}
                              </Typography>

                              <Typography
                                sx={{
                                  color:
                                    '#7189d0',
                                  fontSize:
                                    12,
                                  mt: 1,
                                }}
                              >
                                Document:{' '}
                                {request.documentType ||
                                  'N/A'}
                              </Typography>

                              <Typography
                                sx={{
                                  color:
                                    '#7189d0',
                                  fontSize:
                                    12,
                                }}
                              >
                                Number:{' '}
                                {request.documentNumber ||
                                  'N/A'}
                              </Typography>
                            </Box>

                            <Chip
                              label={
                                request.status ||
                                'UNKNOWN'
                              }
                              color={statusColor(
                                request.status
                              )}
                            />
                          </Stack>
                        </CardContent>
                      </Card>
                    )
                  )
                )}
              </>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* ========================================================
          USER STATUS DIALOG
      ======================================================== */}

      <Dialog
        open={userStatusDialog}
        onClose={() =>
          setUserStatusDialog(
            false
          )
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Change User Status
        </DialogTitle>

        <DialogContent>
          <TextField
            select
            fullWidth
            label="User Status"
            value={newUserStatus}
            onChange={(event) =>
              setNewUserStatus(
                event.target.value
              )
            }
            sx={{ mt: 2 }}
          >
            <MenuItem value="active">
              Active
            </MenuItem>

            <MenuItem value="blocked">
              Blocked
            </MenuItem>

            <MenuItem value="suspended">
              Suspended
            </MenuItem>

            <MenuItem value="disabled">
              Disabled
            </MenuItem>
          </TextField>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setUserStatusDialog(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              updateUserStatus
            }
            disabled={
              sectionLoading
            }
          >
            {sectionLoading
              ? 'Saving...'
              : 'Save Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================
          TRANSACTION DIALOG
      ======================================================== */}

      <Dialog
        open={transactionDialog}
        onClose={() =>
          setTransactionDialog(
            false
          )
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Update Transaction
        </DialogTitle>

        <DialogContent>
          <TextField
            select
            fullWidth
            label="Transaction Status"
            value={
              newTransactionStatus
            }
            onChange={(event) =>
              setNewTransactionStatus(
                event.target.value
              )
            }
            sx={{ mt: 2 }}
          >
            <MenuItem value="PENDING">
              Pending
            </MenuItem>

            <MenuItem value="PROCESSING">
              Processing
            </MenuItem>

            <MenuItem value="COMPLETED">
              Completed
            </MenuItem>

            <MenuItem value="FAILED">
              Failed
            </MenuItem>

            <MenuItem value="CANCELLED">
              Cancelled
            </MenuItem>
          </TextField>

          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Admin Note"
            value={adminNote}
            onChange={(event) =>
              setAdminNote(
                event.target.value
              )
            }
            sx={{ mt: 2 }}
          />
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setTransactionDialog(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              updateTransactionStatus
            }
            disabled={
              sectionLoading
            }
          >
            {sectionLoading
              ? 'Saving...'
              : 'Update Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================
          USER DETAILS DIALOG
      ======================================================== */}

      <Dialog
        open={Boolean(
          selectedUser &&
            !userStatusDialog
        )}
        onClose={() =>
          setSelectedUser(null)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          User Details
        </DialogTitle>

        <DialogContent>
          {selectedUser && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Typography>
                <strong>ID:</strong>{' '}
                {selectedUser.id}
              </Typography>

              <Typography>
                <strong>Name:</strong>{' '}
                {selectedUser.firstName}{' '}
                {selectedUser.lastName}
              </Typography>

              <Typography>
                <strong>Email:</strong>{' '}
                {selectedUser.email}
              </Typography>

              <Typography>
                <strong>Username:</strong>{' '}
                {selectedUser.username ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Phone:</strong>{' '}
                {selectedUser.phone ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Country:</strong>{' '}
                {selectedUser.country ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Role:</strong>{' '}
                {selectedUser.role ||
                  'user'}
              </Typography>

              <Typography>
                <strong>Status:</strong>{' '}
                {selectedUser.status ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Email verified:</strong>{' '}
                {selectedUser.emailVerified
                  ? 'Yes'
                  : 'No'}
              </Typography>

              {selectedUser.account && (
                <>
                  <Divider />

                  <Typography
                    sx={{
                      fontWeight: 900,
                    }}
                  >
                    Account
                  </Typography>

                  <Typography>
                    <strong>Account Number:</strong>{' '}
                    {selectedUser
                      .account
                      .accountNumber ||
                      'N/A'}
                  </Typography>

                  <Typography>
                    <strong>Balance:</strong>{' '}
                    {money(
                      Number(
                        selectedUser
                          .account
                          .balance
                      ) || 0,
                      selectedUser
                        .account
                        .currency ||
                        'USD'
                    )}
                  </Typography>

                  <Typography>
                    <strong>Available:</strong>{' '}
                    {money(
                      Number(
                        selectedUser
                          .account
                          .availableBalance
                      ) || 0,
                      selectedUser
                        .account
                        .currency ||
                        'USD'
                    )}
                  </Typography>
                </>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setSelectedUser(null)
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================
          TRANSACTION DETAILS DIALOG
      ======================================================== */}

      <Dialog
        open={Boolean(
          selectedTransaction &&
            !transactionDialog
        )}
        onClose={() =>
          setSelectedTransaction(
            null
          )
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Transaction Details
        </DialogTitle>

        <DialogContent>
          {selectedTransaction && (
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Typography>
                <strong>ID:</strong>{' '}
                {selectedTransaction.id}
              </Typography>

              <Typography>
                <strong>Reference:</strong>{' '}
                {selectedTransaction
                  .transactionReference ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Type:</strong>{' '}
                {selectedTransaction
                  .transactionType ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Amount:</strong>{' '}
                {money(
                  Number(
                    selectedTransaction.amount
                  ) || 0,
                  selectedTransaction.currency ||
                    'USD'
                )}
              </Typography>

              <Typography>
                <strong>Status:</strong>{' '}
                {selectedTransaction
                  .status ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Payment method:</strong>{' '}
                {selectedTransaction
                  .paymentMethod ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Description:</strong>{' '}
                {selectedTransaction
                  .description ||
                  'N/A'}
              </Typography>

              {selectedTransaction
                .proofOfPaymentUrl && (
                <Typography>
                  <strong>Proof:</strong>{' '}
                  {selectedTransaction
                    .proofOfPaymentUrl}
                </Typography>
              )}

              <Typography>
                <strong>User:</strong>{' '}
                {selectedTransaction.user
                  ? `${selectedTransaction.user.firstName || ''} ${selectedTransaction.user.lastName || ''}`
                  : 'Unknown'}
              </Typography>

              <Typography>
                <strong>Email:</strong>{' '}
                {selectedTransaction.user
                  ?.email ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Admin note:</strong>{' '}
                {selectedTransaction
                  .adminNote ||
                  'None'}
              </Typography>
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setSelectedTransaction(
                null
              )
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
