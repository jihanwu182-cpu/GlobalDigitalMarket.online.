import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
  Chip,
} from '@mui/material';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PaymentsIcon from '@mui/icons-material/Payments';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SavingsIcon from '@mui/icons-material/Savings';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';

import { useNavigate } from 'react-router-dom';
import apiClient from '../services/apiClient';

interface WalletData {
  balance: number;
  deposit: number;
  profits: number;
  availableBalance: number;
  bonus: number;
  referrerBonus: number;
  buyingPower: number;
  marginAvailable: number;
  currency: string;
}

interface Transaction {
  id: string | number;
  type: string;
  amount: number;
  status: string;
  method?: string;
  createdAt?: string;
  date?: string;
}

const Wallet: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [wallet, setWallet] = useState<WalletData>({
    balance: 0,
    deposit: 0,
    profits: 0,
    availableBalance: 0,
    bonus: 0,
    referrerBonus: 0,
    buyingPower: 0,
    marginAvailable: 0,
    currency: 'USD',
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [openDeposit, setOpenDeposit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);

  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [depositMethod, setDepositMethod] =
    useState('Bank Transfer');

  const [withdrawMethod, setWithdrawMethod] =
    useState('Bank Account');

  const formatMoney = (value: number): string => {
    return `$${Number(value || 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const loadWallet = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const performanceResponse = await apiClient.get(
        '/portfolio/performance'
      );

      const transactionResponse = await apiClient.get(
        '/wallet/transactions'
      );

      const data = performanceResponse.data || {};

      setWallet({
        balance: Number(data.balance) || Number(data.totalValue) || 0,
        deposit: Number(data.deposit) || 0,
        profits: Number(data.profits) || 0,
        availableBalance: Number(data.availableBalance) || 0,
        bonus: Number(data.bonus) || 0,
        referrerBonus: Number(data.referrerBonus) || 0,
        buyingPower: Number(data.buyingPower) || 0,
        marginAvailable: Number(data.marginAvailable) || 0,
        currency: data.currency || 'USD',
      });

      const serverTransactions =
        transactionResponse.data?.transactions;

      setTransactions(
        Array.isArray(serverTransactions)
          ? serverTransactions
          : []
      );
    } catch (error: any) {
      console.error('WALLET LOAD ERROR:', error);

      const status = error?.response?.status;

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        'Unable to load wallet data.';

      if (status === 401) {
        setErrorMessage(
          'Your login session has expired. Please login again.'
        );
      } else {
        setErrorMessage(message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  const handleDeposit = async () => {
    const amount = Number(depositAmount);

    if (!Number.isFinite(amount) || amount < 10) {
      setErrorMessage('Minimum deposit amount is $10.00.');
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await apiClient.post('/wallet/deposit', {
        amount,
        method: depositMethod,
      });

      setSuccessMessage(
        response.data?.message ||
          'Deposit request submitted successfully.'
      );

      setDepositAmount('');
      setOpenDeposit(false);

      await loadWallet();
    } catch (error: any) {
      console.error('DEPOSIT ERROR:', error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to submit deposit request.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);

    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage(
        'Please enter a valid withdrawal amount.'
      );
      return;
    }

    if (amount > wallet.availableBalance) {
      setErrorMessage(
        'Withdrawal amount exceeds your available balance.'
      );
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await apiClient.post('/wallet/withdraw', {
        amount,
        method: withdrawMethod,
      });

      setSuccessMessage(
        response.data?.message ||
          'Withdrawal request submitted successfully.'
      );

      setWithdrawAmount('');
      setOpenWithdraw(false);

      await loadWallet();
    } catch (error: any) {
      console.error('WITHDRAW ERROR:', error);

      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to submit withdrawal request.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (
    status: string
  ): 'success' | 'warning' | 'error' | 'default' => {
    const value = String(status || '').toUpperCase();

    if (
      value === 'COMPLETED' ||
      value === 'APPROVED' ||
      value === 'SUCCESS'
    ) {
      return 'success';
    }

    if (
      value === 'FAILED' ||
      value === 'REJECTED'
    ) {
      return 'error';
    }

    if (
      value === 'PENDING' ||
      value === 'PROCESSING'
    ) {
      return 'warning';
    }

    return 'default';
  };

  const formatDate = (transaction: Transaction) => {
    const value =
      transaction.createdAt || transaction.date;

    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    iconColor = '#66dcff',
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    iconColor?: string;
  }) => {
    return (
      <Card
        sx={{
          height: '100%',
          borderRadius: 3,
          color: '#fff',
          background:
            'linear-gradient(145deg,#14287d,#0c1b58)',
          border:
            '1px solid rgba(100,150,255,0.2)',
        }}
      >
        <CardContent>
          <Box
            sx={{
              color: iconColor,
              mb: 1,
            }}
          >
            {icon}
          </Box>

          <Typography
            sx={{
              color: '#9eaff0',
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {title}
          </Typography>

          <Typography
            sx={{
              fontSize: 24,
              fontWeight: 800,
              mt: 1,
            }}
          >
            {loading ? (
              <CircularProgress
                size={24}
                sx={{ color: '#fff' }}
              />
            ) : (
              value
            )}
          </Typography>

          <Typography
            sx={{
              color: '#7186cd',
              fontSize: 11,
              mt: 0.5,
            }}
          >
            {subtitle}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg,#030a2c 0%,#071453 50%,#091b68 100%)',
        color: '#fff',
        pb: 6,
      }}
    >
      <Box
        sx={{
          borderBottom:
            '1px solid rgba(125,150,255,0.2)',
          background:
            'rgba(3,10,44,0.96)',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{ py: 2 }}
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
                WALLET & ACCOUNT
              </Typography>
            </Box>

            <Stack
              direction="row"
              spacing={1}
            >
              <Button
                onClick={loadWallet}
                startIcon={<RefreshIcon />}
                sx={{
                  color: '#fff',
                  textTransform: 'none',
                }}
              >
                Refresh
              </Button>

              <Button
                onClick={() => navigate('/')}
                sx={{
                  color: '#fff',
                  textTransform: 'none',
                }}
              >
                Dashboard
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

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
            Wallet
          </Typography>

          <Typography
            sx={{
              color: '#9eaff0',
              mt: 1,
            }}
          >
            Manage your funds, bonuses and
            transaction activity.
          </Typography>
        </Box>

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
                xs: 3,
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
              spacing={3}
            >
              <Box>
                <Typography
                  sx={{
                    color: '#b9c8ff',
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  AVAILABLE BALANCE
                </Typography>

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
                  {loading ? (
                    <CircularProgress
                      sx={{ color: '#fff' }}
                    />
                  ) : (
                    formatMoney(
                      wallet.availableBalance
                    )
                  )}
                </Typography>

                <Typography
                  sx={{
                    color: '#cbd6ff',
                    mt: 1,
                  }}
                >
                  Funds available for trading
                  or withdrawal.
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
               
