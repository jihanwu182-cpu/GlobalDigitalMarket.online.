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

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

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

      const [performanceResponse, transactionResponse] =
        await Promise.all([
          apiClient.get('/portfolio/performance'),
          apiClient.get('/wallet/transactions'),
        ]);

      const data = performanceResponse.data || {};

      setWallet({
        balance:
          Number(data.balance) ||
          Number(data.totalValue) ||
          0,

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
      setErrorMessage(
        'Minimum deposit amount is $10.00.'
      );
      return;
    }

    try {
      setActionLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const response = await apiClient.post(
        '/wallet/deposit',
        {
          amount,
          method: depositMethod,
        }
      );

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

      const response = await apiClient.post(
        '/wallet/withdraw',
        {
          amount,
          method: withdrawMethod,
        }
      );

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
  ):
    | 'success'
    | 'warning'
    | 'error'
    | 'default' => {
    const value = String(
      status || ''
    ).toUpperCase();

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

  const formatDate = (
    transaction: Transaction
  ) => {
    const value =
      transaction.createdAt ||
      transaction.date;

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
          sx={{ py: 2 }}
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
              sx={{
                flexWrap: 'wrap',
              }}
            >
              <Button
                onClick={loadWallet}
                startIcon={<RefreshIcon />}
                disabled={loading}
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
            Manage your funds, bonuses and
            transaction activity.
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

        {/* MAIN BALANCE */}

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
              alignItems={{
                xs: 'flex-start',
                md: 'center',
              }}
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
                spacing={2}
                sx={{
                  width: {
                    xs: '100%',
                    md: 'auto',
                  },
                }}
              >
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() =>
                    setOpenDeposit(true)
                  }
                  sx={{
                    py: 1.4,
                    px: 3,
                    background:
                      'linear-gradient(90deg,#12d8fa,#1d8cff)',
                    fontWeight: 800,
                    textTransform: 'none',
                  }}
                >
                  Deposit
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={() =>
                    setOpenWithdraw(true)
                  }
                  sx={{
                    py: 1.4,
                    px: 3,
                    color: '#fff',
                    borderColor: '#70dfff',
                    fontWeight: 800,
                    textTransform: 'none',
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
            fontSize: 20,
            fontWeight: 800,
            mb: 2,
          }}
        >
          Account Summary
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2,1fr)',
              lg: 'repeat(5,1fr)',
            },
            gap: 2,
            mb: 4,
          }}
        >
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
        </Box>

        {/* SECONDARY INFORMATION */}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2,1fr)',
              lg: 'repeat(3,1fr)',
            },
            gap: 2,
            mb: 4,
          }}
        >
          <StatCard
            title="TOTAL BALANCE"
            value={formatMoney(wallet.balance)}
            subtitle="Overall account value"
            icon={
              <AccountBalanceWalletIcon
                sx={{ fontSize: 32 }}
              />
            }
          />

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
            iconColor="#4df28d"
          />

          <StatCard
            title="MARGIN AVAILABLE"
            value={formatMoney(
              wallet.marginAvailable
            )}
            subtitle="Available margin"
            icon={
              <SavingsIcon
                sx={{ fontSize: 32 }}
              />
            }
            iconColor="#d99cff"
          />
        </Box>

        {/* TRANSACTION HISTORY */}

        <Card
          sx={{
            borderRadius: 3,
            color: '#fff',
            background:
              'linear-gradient(145deg,#11246f,#08164c)',
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
              spacing={1}
              sx={{ mb: 3 }}
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
                startIcon={<RefreshIcon />}
                sx={{
                  color: '#62dcff',
                  textTransform: 'none',
                }}
              >
                Refresh Transactions
              </Button>
            </Stack>

            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  py: 5,
                }}
              >
                <CircularProgress
                  sx={{ color: '#fff' }}
                />
              </Box>
            ) : transactions.length === 0 ? (
              <Box
                sx={{
                  py: 5,
                  textAlign: 'center',
                  borderRadius: 2,
                  background:
                    'rgba(255,255,255,0.04)',
                }}
              >
                <PaymentsIcon
                  sx={{
                    fontSize: 48,
                    color: '#6078c9',
                    mb: 1,
                  }}
                />

                <Typography
                  sx={{
                    fontWeight: 700,
                  }}
                >
                  No transactions yet
                </Typography>

                <Typography
                  sx={{
                    color: '#8296e0',
                    fontSize: 13,
                    mt: 1,
                  }}
                >
                  Your deposit and withdrawal
                  activity will appear here.
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  overflowX: 'auto',
                }}
              >
                <Box
                  sx={{
                    minWidth: 700,
                  }}
                >
                  {/* TABLE HEADER */}

                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns:
                        '1.2fr 1fr 1.2fr 1.2fr 1fr',
                      gap: 2,
                      p: 1.5,
                      borderRadius: 2,
                      background:
                        'rgba(255,255,255,0.06)',
                      mb: 1,
                    }}
                  >
                    <Typography
                      sx={{
                        color: '#9eaff0',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      TYPE
                    </Typography>

                    <Typography
                      sx={{
                        color: '#9eaff0',
                        fontSize: 12,
                        fontWeight: 700,
                        textAlign: 'right',
                      }}
                    >
                      AMOUNT
                    </Typography>

                    <Typography
                      sx={{
                        color: '#9eaff0',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      METHOD
                    </Typography>

                    <Typography
                      sx={{
                        color: '#9eaff0',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      DATE
                    </Typography>

                    <Typography
                      sx={{
                        color: '#9eaff0',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      STATUS
                    </Typography>
                  </Box>

                  {/* TABLE ROWS */}

                  <Stack spacing={1}>
                    {transactions.map(
                      (transaction) => {
                        const isDeposit =
                          String(
                            transaction.type
                          ).toUpperCase() ===
                          'DEPOSIT';

                        return (
                          <Box
                            key={
                              transaction.id
                            }
                            sx={{
                              display: 'grid',
                              gridTemplateColumns:
                                '1.2fr 1fr 1.2fr 1.2fr 1fr',
                              gap: 2,
                              alignItems:
                                'center',
                              p: 1.5,
                              borderRadius: 2,
                              background:
                                'rgba(255,255,255,0.04)',
                              border:
                                '1px solid rgba(255,255,255,0.04)',
                            }}
                          >
                            <Typography
                              sx={{
                                fontWeight: 700,
                              }}
                            >
                              {isDeposit
                                ? '➕ Deposit'
                                : '➖ Withdrawal'}
                            </Typography>

                            <Typography
                              sx={{
                                textAlign:
                                  'right',
                                fontWeight: 800,
                                color:
                                  isDeposit
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

                            <Typography
                              sx={{
                                color:
                                  '#b7c6ff',
                                fontSize: 13,
                              }}
                            >
                              {transaction.method ||
                                '-'}
                            </Typography>

                            <Typography
                              sx={{
                                color:
                                  '#b7c6ff',
                                fontSize: 13,
                              }}
                            >
                              {formatDate(
                                transaction
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
                              sx={{
                                width:
                                  'fit-content',
                              }}
                            />
                          </Box>
                        );
                      }
                    )}
                  </Stack>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Container>

      {/* DEPOSIT DIALOG */}

      <Dialog
        open={openDeposit}
        onClose={() =>
          !actionLoading &&
          setOpenDeposit(false)
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Deposit Funds
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              pt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Amount (USD)"
              type="number"
              value={depositAmount}
              onChange={(event) =>
                setDepositAmount(
                  event.target.value
                )
              }
              disabled={actionLoading}
              inputProps={{
                step: '0.01',
                min: '10',
              }}
            />

            <TextField
              fullWidth
              label="Deposit Method"
              value={depositMethod}
              onChange={(event) =>
                setDepositMethod(
                  event.target.value
                )
              }
              disabled={actionLoading}
              select
              SelectProps={{
                native: true,
              }}
            >
              <option value="Bank Transfer">
                Bank Transfer
              </option>

              <option value="Card">
                Card
              </option>

              <option value="Crypto">
                Crypto
              </option>
            </TextField>

            <Typography
              variant="body2"
              sx={{
                color: '#666',
              }}
            >
              Minimum deposit: $10.00
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setOpenDeposit(false)
            }
            disabled={actionLoading}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleDeposit}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <>
                <CircularProgress
                  size={20}
                  sx={{ mr: 1 }}
                />
                Processing...
              </>
            ) : (
              'Deposit'
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* WITHDRAW DIALOG */}

      <Dialog
        open={openWithdraw}
        onClose={() =>
          !actionLoading &&
          setOpenWithdraw(false)
        }
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Withdraw Funds
        </DialogTitle>

        <DialogContent>
          <Box
            sx={{
              pt: 2,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Amount (USD)"
              type="number"
              value={withdrawAmount}
              onChange={(event) =>
                setWithdrawAmount(
                  event.target.value
                )
              }
              disabled={actionLoading}
              inputProps={{
                step: '0.01',
                min: '0.01',
                max: wallet.availableBalance,
              }}
            />

            <TextField
              fullWidth
              label="Withdrawal Method"
              value={withdrawMethod}
              onChange={(event) =>
                setWithdrawMethod(
                  event.target.value
                )
              }
              disabled={actionLoading}
              select
              SelectProps={{
                native: true,
              }}
            >
              <option value="Bank Account">
                Bank Account
              </option>

              <option value="Bank Transfer">
                Bank Transfer
              </option>

              <option value="Crypto">
                Crypto
              </option>
            </TextField>

            <Typography
              variant="body2"
              sx={{
                color: '#666',
              }}
            >
              Available balance:{' '}
              {formatMoney(
                wallet.availableBalance
              )}
            </Typography>
          </Box>
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
              Number(withdrawAmount) <= 0 ||
              Number(withdrawAmount) >
                wallet.availableBalance
            }
          >
            {actionLoading ? (
              <>
                <CircularProgress
                  size={20}
                  sx={{ mr: 1 }}
                />
                Processing...
              </>
            ) : (
              'Withdraw
