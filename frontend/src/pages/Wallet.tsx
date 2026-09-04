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
  MenuItem,
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
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

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
  transactionReference?: string;
  transactionType?: string;
  amount: number;
  status: string;
  paymentMethod?: string;
  description?: string;
  proofOfPaymentUrl?: string | null;
  adminNote?: string | null;
  withdrawalCode?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

const Wallet: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const [proofUploading, setProofUploading] = useState(false);
  const [proofFileName, setProofFileName] = useState('');

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

  const [proofOfPaymentUrl, setProofOfPaymentUrl] =
    useState('');

  const [
    identityDocumentNumber,
    setIdentityDocumentNumber,
  ] = useState('');
  const [
  withdrawalCode,
  setWithdrawalCode,
] = useState('');

  // ============================================================
  // FORMAT MONEY
  // ============================================================

  const formatMoney = (value: number): string => {
    const currency = wallet.currency || 'USD';

    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(Number(value || 0));
    } catch {
      return `${currency} ${Number(value || 0).toLocaleString(
        'en-US',
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      )}`;
    }
  };

  // ============================================================
  // LOAD WALLET
  // ============================================================

  const loadWallet = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const balanceResponse =
        await apiClient.get('/wallet/balance');

      const transactionResponse =
        await apiClient.get('/wallet/transactions');

      const data = balanceResponse.data || {};

      setWallet({
        balance: Number(data.balance) || 0,
        deposit: Number(data.deposit) || 0,
        profits: Number(data.profits) || 0,
        availableBalance:
          Number(data.availableBalance) || 0,
        bonus: Number(data.bonus) || 0,
        referrerBonus:
          Number(data.referrerBonus) || 0,
        buyingPower:
          Number(data.buyingPower) || 0,
        marginAvailable:
          Number(data.marginAvailable) || 0,
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
      console.error(
        'WALLET LOAD ERROR:',
        error
      );

      const status =
        error?.response?.status;

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

  // ============================================================
  // UPLOAD PAYMENT PROOF
  // ============================================================

  const handleProofUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        'Only JPG, PNG, WebP images and PDF files are allowed.'
      );

      event.target.value = '';

      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(
        'Payment proof must be smaller than 10 MB.'
      );

      event.target.value = '';

      return;
    }

    try {
      setProofUploading(true);

      const formData = new FormData();

      formData.append('proof', file);

      const response = await apiClient.post(
        '/wallet/upload-proof',
        formData
      );

      const uploadedUrl =
        response.data?.proofOfPaymentUrl;

      if (!uploadedUrl) {
        throw new Error(
          'Upload succeeded but no file URL was returned.'
        );
      }

      setProofOfPaymentUrl(uploadedUrl);

      setProofFileName(file.name);

      setSuccessMessage(
        'Payment proof uploaded successfully. You can now submit your deposit.'
      );
    } catch (error: any) {
      console.error(
        'PAYMENT PROOF UPLOAD ERROR:',
        error
      );

      setProofOfPaymentUrl('');
      setProofFileName('');

      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          'Unable to upload payment proof.'
      );
    } finally {
      setProofUploading(false);

      event.target.value = '';
    }
  };

  useEffect(() => {
    loadWallet();
  }, []);

  // ============================================================
  // DEPOSIT
  // ============================================================

  const handleDeposit = async () => {
    const amount = Number(depositAmount);

    setErrorMessage('');
    setSuccessMessage('');

    if (
      !Number.isFinite(amount) ||
      amount < 10
    ) {
      setErrorMessage(
        `Minimum deposit amount is 10 ${wallet.currency}.`
      );
      return;
    }

    if (!depositMethod.trim()) {
      setErrorMessage(
        'Please select a deposit method.'
      );
      return;
    }

    if (!proofOfPaymentUrl.trim()) {
      setErrorMessage(
        'Proof of payment is required for every deposit.'
      );
      return;
    }

    try {
      setActionLoading(true);

      const response =
        await apiClient.post(
          '/wallet/deposit',
          {
            amount,
            method: depositMethod,
            proofOfPaymentUrl:
              proofOfPaymentUrl.trim(),
          }
        );

      setSuccessMessage(
        response.data?.message ||
          'Deposit request submitted successfully.'
      );

      setDepositAmount('');
      setProofOfPaymentUrl('');
      setProofFileName('');
      setDepositMethod('Bank Transfer');

      setOpenDeposit(false);

      await loadWallet();
    } catch (error: any) {
      console.error(
        'DEPOSIT ERROR:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to submit deposit request.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // WITHDRAWAL
  // ============================================================

  const handleWithdraw = async () => {
    const amount = Number(withdrawAmount);

    setErrorMessage('');
    setSuccessMessage('');

    if (
      !Number.isFinite(amount) ||
      amount < 10
    ) {
      setErrorMessage(
        `Minimum withdrawal amount is 10 ${wallet.currency}.`
      );
      return;
    }

    if (
      amount >
      wallet.availableBalance
    ) {
      setErrorMessage(
        'Withdrawal amount exceeds your available balance.'
      );
      return;
    }

    if (!withdrawMethod.trim()) {
      setErrorMessage(
        'Please select a withdrawal method.'
      );
  return;
    }

    if (!identityDocumentNumber.trim()) {
      setErrorMessage(
        'Your ID or passport number is required for withdrawal.'
      );
      return;
      }
      if (!withdrawalCode.trim()) {
  setErrorMessage(
    'A withdrawal authorization code is required before submitting your withdrawal request.'
  );
  return;
}

    try {
      setActionLoading(true);

     const response =
  await apiClient.post(
    '/wallet/withdraw',
    {
      amount,
      method: withdrawMethod,
      identityDocumentNumber:
        identityDocumentNumber.trim(),
      withdrawalCode:
        withdrawalCode.trim(),
    }
  );
      setSuccessMessage(
        response.data?.message ||
          'Withdrawal request submitted successfully.'
      );

      setWithdrawAmount('');
      setIdentityDocumentNumber('');
      setWithdrawalCode('');
      setWithdrawMethod('Bank Account');

      setOpenWithdraw(false);

      await loadWallet();
    } catch (error: any) {
      console.error(
        'WITHDRAW ERROR:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          'Unable to submit withdrawal request.'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // STATUS COLOR
  // ============================================================

  const getStatusColor = (
    status: string
  ):
    | 'success'
    | 'warning'
    | 'error'
    | 'default' => {
    const value =
      String(status || '').toUpperCase();

    if (
      value === 'COMPLETED' ||
      value === 'APPROVED' ||
      value === 'SUCCESS'
    ) {
      return 'success';
    }

    if (
      value === 'FAILED' ||
      value === 'REJECTED' ||
      value === 'CANCELLED'
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

  // ============================================================
  // FORMAT DATE
  // ============================================================

  const formatDate = (
    transaction: Transaction
  ) => {
    const value = transaction.createdAt;

    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return date.toLocaleDateString(
      'en-US',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }
    );
  };

  // ============================================================
  // STAT CARD
  // ============================================================

  const StatCard = ({
    title,
    value,
    subtitle,
    icon,
    iconColor,
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    iconColor: string;
  }) => (
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
              sx={{
                color: '#fff',
              }}
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

  // ============================================================
  // RENDER
  // ============================================================

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
      {/* HEADER */}

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
          sx={{
            py: 2,
          }}
        >
          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            alignItems={{
              xs: 'flex-start',
              sm: 'center',
            }}
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
                disabled={loading}
                startIcon={
                  <RefreshIcon />
                }
                sx={{
                  color: '#fff',
                  textTransform:
                    'none',
                }}
              >
                Refresh
              </Button>

              {/* FIXED: Dashboard now goes to /dashboard */}

              <Button
                onClick={() =>
                  navigate('/dashboard')
                }
                sx={{
                  color: '#fff',
                  textTransform:
                    'none',
                }}
              >
                Dashboard
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* MAIN */}

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
            Manage your funds, account
            balance and transaction
            activity.
          </Typography>
        </Box>

        {/* ALERTS */}

        {errorMessage && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() =>
              setErrorMessage('')
            }
          >
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() =>
              setSuccessMessage('')
            }
          >
            {successMessage}
          </Alert>
        )}

        {/* BALANCE */}

        <Card
          sx={{
            mb: 3,
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(135deg,#172a8a,#1459e8)',
            border:
              '1px solid rgba(143,170,255,0.28)',
            boxShadow:
              '0 20px 60px rgba(0,0,0,0.25)',
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
                      sx={{
                        color: '#fff',
                      }}
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
                  Currency:{' '}
                  {wallet.currency}
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={2}
                justifyContent="center"
              >
                <Button
                  variant="contained"
                  startIcon={
                    <AddIcon />
                  }
                  onClick={() =>
                    setOpenDeposit(true)
                  }
                  sx={{
                    minWidth: 150,
                    py: 1.4,
                    background:
                      'linear-gradient(90deg,#14d8ff,#1d8cff)',
                    fontWeight: 800,
                    textTransform:
                      'none',
                  }}
                >
                  Deposit
                </Button>

                <Button
                  variant="outlined"
                  startIcon={
                    <SendIcon />
                  }
                  onClick={() =>
                    setOpenWithdraw(true)
                  }
                  sx={{
                    minWidth: 150,
                    py: 1.4,
                    color: '#fff',
                    borderColor:
                      '#72ddff',
                    fontWeight: 800,
                    textTransform:
                      'none',
                  }}
                >
                  Withdraw
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>

        {/* ACCOUNT SUMMARY */}

        <Typography
          sx={{
            fontSize: 21,
            fontWeight: 800,
            mb: 2,
          }}
        >
          Account Summary
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="DEPOSIT"
              value={formatMoney(wallet.deposit)}
              subtitle="Total deposited funds"
              icon={
                <PaymentsIcon
                  sx={{ fontSize: 32 }}
                />
              }
              iconColor="#59d8ff"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="PROFITS"
              value={formatMoney(wallet.profits)}
              subtitle="Account profits"
              icon={
                <TrendingUpIcon
                  sx={{ fontSize: 32 }}
                />
              }
              iconColor="#4df28d"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="AVAILABLE BALANCE"
              value={formatMoney(
                wallet.availableBalance
              )}
              subtitle="Available to use"
              icon={
                <AccountBalanceWalletIcon
                  sx={{ fontSize: 32 }}
                />
              }
              iconColor="#66dcff"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="BONUS"
              value={formatMoney(wallet.bonus)}
              subtitle="Promotional bonus"
              icon={
                <SavingsIcon
                  sx={{ fontSize: 32 }}
                />
              }
              iconColor="#d99cff"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="REFERRER BONUS"
              value={formatMoney(
                wallet.referrerBonus
              )}
              subtitle="Referral rewards"
              icon={
                <GroupAddIcon
                  sx={{ fontSize: 32 }}
                />
              }
              iconColor="#ffc45c"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="BUYING POWER"
              value={formatMoney(
                wallet.buyingPower
              )}
              subtitle="Available trading power"
              icon={
                <TrendingUpIcon
                  sx={{ fontSize: 32 }}
                />
              }
              iconColor="#64e7ff"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="MARGIN AVAILABLE"
              value={formatMoney(
                wallet.marginAvailable
              )}
              subtitle="Available margin"
              icon={
                <AccountBalanceWalletIcon
                  sx={{ fontSize: 32 }}
                />
              }
              iconColor="#b6c8ff"
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="TOTAL BALANCE"
              value={formatMoney(wallet.balance)}
              subtitle="Account value"
              icon={
                <AccountBalanceWalletIcon
                  sx={{ fontSize: 32 }}
                />
              }
              iconColor="#72ddff"
            />
          </Grid>
        </Grid>

        {/* TRANSACTIONS */}

        <Card
          sx={{
            borderRadius: 3,
            background:
              'linear-gradient(145deg,#11246f,#08164c)',
            color: '#fff',
          }}
        >
          <CardContent>
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
                    fontSize: 22,
                    fontWeight: 800,
                  }}
                >
                  Transaction History
                </Typography>

                <Typography
                  sx={{
                    color: '#8296e0',
                    fontSize: 12,
                  }}
                >
                  Deposits and withdrawals
                </Typography>
              </Box>

              <Button
                onClick={loadWallet}
                startIcon={
                  <RefreshIcon />
                }
                sx={{
                  color: '#62dcff',
                  textTransform:
                    'none',
                }}
              >
                Refresh
              </Button>
            </Stack>

            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent:
                    'center',
                  py: 5,
                }}
              >
                <CircularProgress
                  sx={{
                    color: '#fff',
                  }}
                />
              </Box>
            ) : transactions.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 5,
                }}
              >
                <Typography
                  sx={{
                    color: '#9eaff0',
                    fontSize: 16,
                  }}
                >
                  No transactions yet.
                </Typography>

                <Typography
                  sx={{
                    color: '#7186cd',
                    fontSize: 12,
                    mt: 1,
                  }}
                >
                  Your deposit and withdrawal
                  activity will appear here.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={1}>
                {transactions.map(
                  (transaction) => {
                    const type =
                      String(
                        transaction.transactionType ||
                          ''
                      ).toUpperCase();

                    const isDeposit =
                      type === 'DEPOSIT';

                    return (
                      <Box
                        key={transaction.id}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background:
                            'rgba(255,255,255,0.05)',
                        }}
                      >
                        <Stack
                          direction={{
                            xs: 'column',
                            sm: 'row',
                          }}
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 800,
                              }}
                            >
                              {isDeposit
                                ? '➕ Deposit'
                                : '➖ Withdrawal'}
                            </Typography>

                            <Typography
                              sx={{
                                color: '#8296e0',
                                fontSize: 11,
                              }}
                            >
                              {transaction.paymentMethod ||
                                'Account'}
                            </Typography>

                            <Typography
                              sx={{
                                color: '#7186cd',
                                fontSize: 11,
                                mt: 0.5,
                              }}
                            >
                              {formatDate(
                                transaction
                              )}
                            </Typography>

                            {transaction.transactionReference && (
                              <Typography
                                sx={{
                                  color: '#6175b8',
                                  fontSize: 10,
                                  mt: 0.5,
                                }}
                              >
                                Ref:{' '}
                                {
                                  transaction.transactionReference
                                }
                              </Typography>
                            )}

                            {transaction.adminNote && (
                              <Typography
                                sx={{
                                  color: '#ffcc66',
                                  fontSize: 11,
                                  mt: 1,
                                }}
                              >
                                Admin note:{' '}
                                {
                                  transaction.adminNote
                                }
                              </Typography>
                            )}

                            {transaction.proofOfPaymentUrl &&
                              isDeposit && (
                                <Button
                                  component="a"
                                  href={
                                    transaction.proofOfPaymentUrl
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  size="small"
                                  sx={{
                                    mt: 1,
                                    color: '#62dcff',
                                    textTransform:
                                      'none',
                                  }}
                                >
                                  View Payment Proof
                                </Button>
                              )}
                          </Box>

                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={2}
                          >
                            <Typography
                              sx={{
                                fontWeight: 800,
                                color: isDeposit
                                  ? '#4df28d'
                                  : '#ff6681',
                              }}
                            >
                              {isDeposit
                                ? '+'
                                : '-'}
                              {formatMoney(
                                Number(
                                  transaction.amount
                                ) || 0
                              )}
                            </Typography>

                            <Chip
                              label={
                                transaction.status ||
                                'PENDING'
                              }
                              color={getStatusColor(
                                transaction.status
                              )}
                              size="small"
                            />
                          </Stack>
                        </Stack>
                      </Box>
                    );
                  }
                )}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* DEPOSIT DIALOG */}

      <Dialog
        open={openDeposit}
        onClose={() => {
          if (
            !actionLoading &&
            !proofUploading
          ) {
            setOpenDeposit(false);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Deposit Funds
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{ pt: 2 }}
          >
            <Alert severity="info">
              Your deposit will remain
              pending until an administrator
              verifies your payment.
            </Alert>

            <TextField
              fullWidth
              label={`Amount (${wallet.currency})`}
              type="number"
              value={depositAmount}
              onChange={(event) =>
                setDepositAmount(
                  event.target.value
                )
              }
              inputProps={{
                min: 10,
                step: 0.01,
              }}
              disabled={
                actionLoading ||
                proofUploading
              }
            />

            <TextField
              fullWidth
              select
              label="Deposit Method"
              value={depositMethod}
              onChange={(event) =>
                setDepositMethod(
                  event.target.value
                )
              }
              disabled={
                actionLoading ||
                proofUploading
              }
            >
              <MenuItem value="Bank Transfer">
                Bank Transfer
              </MenuItem>

              <MenuItem value="Credit Card">
                Credit Card
              </MenuItem>

              <MenuItem value="Debit Card">
                Debit Card
              </MenuItem>

              <MenuItem value="Crypto">
                Crypto
              </MenuItem>
            </TextField>

            <Box>
              <input
                id="payment-proof-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleProofUpload}
                disabled={
                  actionLoading ||
                  proofUploading
                }
                style={{
                  display: 'none',
                }}
              />

              <label
                htmlFor="payment-proof-upload"
              >
                <Button
                  component="span"
                  variant="outlined"
                  fullWidth
                  startIcon={
                    proofUploading ? (
                      <CircularProgress
                        size={20}
                      />
                    ) : (
                      <CloudUploadIcon />
                    )
                  }
                  disabled={
                    actionLoading ||
                    proofUploading
                  }
                  sx={{
                    py: 1.5,
                    textTransform:
                      'none',
                    fontWeight: 700,
                  }}
                >
                  {proofUploading
                    ? 'Uploading...'
                    : 'Upload Proof of Payment'}
                </Button>
              </label>

              {proofFileName && (
                <Typography
                  sx={{
                    mt: 1,
                    fontSize: 13,
                    color:
                      'success.main',
                  }}
                >
                  ✓ {proofFileName}
                </Typography>
              )}

              <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                  display: 'block',
                  mt: 1,
                }}
              >
                JPG, PNG, WebP or PDF.
                Maximum 10 MB.
              </Typography>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Minimum deposit: 10{' '}
              {wallet.currency}
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenDeposit(false)
            }
            disabled={
              actionLoading ||
              proofUploading
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleDeposit}
            disabled={
              actionLoading ||
              proofUploading ||
              !depositAmount ||
              !proofOfPaymentUrl.trim()
            }
          >
            {actionLoading
              ? 'Submitting...'
              : proofUploading
                ? 'Uploading...'
                : 'Submit Deposit'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* WITHDRAWAL DIALOG */}

      <Dialog
        open={openWithdraw}
        onClose={() => {
          if (!actionLoading) {
            setOpenWithdraw(false);
          }
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Withdraw Funds
        </DialogTitle>

        <DialogContent>
          <Stack
            spacing={2}
            sx={{ pt: 2 }}
          >
            <Alert
              severity="warning"
              icon={
                <VerifiedUserIcon />
              }
            >
              Identity verification must
              be approved before a
              withdrawal can be submitted.
              The administrator will review
              your request and generate the
              withdrawal code if approved.
            </Alert>

            <TextField
              fullWidth
              label={`Amount (${wallet.currency})`}
              type="number"
              value={withdrawAmount}
              onChange={(event) =>
                setWithdrawAmount(
                  event.target.value
                )
              }
              inputProps={{
                min: 10,
                step: 0.01,
                max:
                  wallet.availableBalance,
              }}
              disabled={actionLoading}
            />

            <TextField
              fullWidth
              select
              label="Withdrawal Method"
              value={withdrawMethod}
              onChange={(event) =>
                setWithdrawMethod(
                  event.target.value
                )
              }
              disabled={actionLoading}
            >
              <MenuItem value="Bank Account">
                Bank Account
              </MenuItem>

              <MenuItem value="Bank Transfer">
                Bank Transfer
              </MenuItem>

              <MenuItem value="Crypto">
                Crypto
              </MenuItem>
            </TextField>

            <TextField
            fullWidth
            required
            label="Withdrawal Authorization Code"
            value={withdrawalCode}
          onChange={(event) =>
            setWithdrawalCode(event.target.value)
          }
           disabled={actionLoading}
           helperText="Enter the one-time authorization code provided by the administrator."
          inputProps={{
          maxLength: 32,
        }}
       />

         <TextField
          fullWidth
          required
          label="ID / Passport Number"
          value={identityDocumentNumber}
          onChange={(event) =>
            setIdentityDocumentNumber(
              event.target.value
           )
          }
           disabled={actionLoading}
           helperText="Enter the same ID or passport number used during identity verification."
          />

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Available balance:{' '}
              {formatMoney(
                wallet.availableBalance
              )}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              Withdrawal requests are
              reviewed by an administrator.
              Your funds are not paid out
              automatically.
            </Typography>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenWithdraw(false)
            }
            disabled={actionLoading}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleWithdraw}
            disabled={
              actionLoading ||
              !withdrawAmount ||
              Number(withdrawAmount) < 10 ||
              Number(withdrawAmount) >
              wallet.availableBalance ||
             !identityDocumentNumber.trim() ||
             !withdrawalCode.trim()
            }
          >
            {actionLoading
              ? 'Submitting...'
              : 'Submit Withdrawal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wallet;
