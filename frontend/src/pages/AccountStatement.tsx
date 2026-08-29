import React, { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  Typography,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PendingIcon from '@mui/icons-material/Pending';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

import { useNavigate } from 'react-router-dom';

import apiClient from '../services/apiClient';

/* ============================================================
   TYPES
============================================================ */

interface Transaction {
  id: number;

  transactionReference?: string;
  transactionNumber?: string;

  transactionType?: string;
  type?: string;

  amount: number;

  currency?: string;

  paymentMethod?: string;
  method?: string;

  status?: string;

  description?: string;

  proofOfPaymentUrl?: string | null;

  adminNote?: string | null;

  createdAt?: string;
  updatedAt?: string;
}

/* ============================================================
   HELPERS
============================================================ */

const numberValue = (value: unknown): number => {
  const number = Number(value);

  return Number.isFinite(number) ? number : 0;
};

const money = (
  value: number,
  currency = 'USD'
): string => {
  const safeValue = numberValue(value);

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

const formatDate = (
  value?: string
): string => {
  if (!value) {
    return 'Date unavailable';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getTransactionType = (
  transaction: Transaction
): string => {
  return String(
    transaction.transactionType ||
      transaction.type ||
      'TRANSACTION'
  ).toUpperCase();
};

const getStatus = (
  transaction: Transaction
): string => {
  return String(
    transaction.status ||
      'PENDING'
  ).toUpperCase();
};

/* ============================================================
   STATUS CHIP
============================================================ */

interface StatusChipProps {
  status: string;
}

const StatusChip: React.FC<
  StatusChipProps
> = ({ status }) => {
  const normalized =
    status.toUpperCase();

  if (
    normalized === 'COMPLETED' ||
    normalized === 'APPROVED' ||
    normalized === 'SUCCESS' ||
    normalized === 'SUCCESSFUL'
  ) {
    return (
      <Chip
        icon={
          <CheckCircleIcon
            sx={{
              color:
                '#58f39b !important',
            }}
          />
        }
        label={status}
        size="small"
        sx={{
          color: '#58f39b',
          background:
            'rgba(88,243,155,0.12)',
          fontWeight: 800,
        }}
      />
    );
  }

  if (
    normalized === 'REJECTED' ||
    normalized === 'FAILED' ||
    normalized === 'CANCELLED'
  ) {
    return (
      <Chip
        icon={
          <CancelIcon
            sx={{
              color:
                '#ff8297 !important',
            }}
          />
        }
        label={status}
        size="small"
        sx={{
          color: '#ff8297',
          background:
            'rgba(255,130,151,0.12)',
          fontWeight: 800,
        }}
      />
    );
  }

  if (
    normalized === 'PROCESSING' ||
    normalized === 'PENDING'
  ) {
    return (
      <Chip
        icon={
          <PendingIcon
            sx={{
              color:
                '#f5c451 !important',
            }}
          />
        }
        label={status}
        size="small"
        sx={{
          color: '#f5c451',
          background:
            'rgba(245,196,81,0.12)',
          fontWeight: 800,
        }}
      />
    );
  }

  return (
    <Chip
      icon={
        <ErrorOutlineIcon
          sx={{
            color:
              '#8ea4e8 !important',
          }}
        />
      }
      label={status}
      size="small"
      sx={{
        color: '#8ea4e8',
        background:
          'rgba(142,164,232,0.12)',
        fontWeight: 800,
      }}
    />
  );
};

/* ============================================================
   TRANSACTION ICON
============================================================ */

const TransactionIcon: React.FC<{
  type: string;
}> = ({ type }) => {
  const normalized =
    type.toUpperCase();

  if (
    normalized.includes('DEPOSIT')
  ) {
    return (
      <AddCircleOutlineIcon
        sx={{
          color: '#58f39b',
        }}
      />
    );
  }

  if (
    normalized.includes('WITHDRAW')
  ) {
    return (
      <RemoveCircleOutlineIcon
        sx={{
          color: '#ff8297',
        }}
      />
    );
  }

  return (
    <SwapHorizIcon
      sx={{
        color: '#5ce8ff',
      }}
    />
  );
};

/* ============================================================
   MAIN COMPONENT
============================================================ */

const AccountStatement: React.FC =
  () => {
    const navigate = useNavigate();

    const [
      transactions,
      setTransactions,
    ] = useState<Transaction[]>(
      []
    );

    const [loading, setLoading] =
      useState(true);

    const [refreshing, setRefreshing] =
      useState(false);

    const [error, setError] =
      useState('');

    /* ========================================================
       LOAD TRANSACTIONS
    ======================================================== */

    const loadTransactions =
      async (
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
              '/wallet/transactions'
            );

          const data =
            response.data || {};

          const received =
            Array.isArray(
              data.transactions
            )
              ? data.transactions
              : [];

          setTransactions(
            received
          );
        } catch (requestError: any) {
          console.error(
            'Account statement error:',
            requestError
          );

          if (
            requestError?.response
              ?.status === 401
          ) {
            setError(
              'Your login session has expired. Please login again.'
            );
          } else {
            setError(
              requestError?.response
                ?.data?.message ||
                requestError?.response
                  ?.data?.error ||
                'Unable to load your account statement.'
            );
          }
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      };

    useEffect(() => {
      loadTransactions();
    }, []);

    /* ========================================================
       SUMMARY
    ======================================================== */

    const summary =
      useMemo(() => {
        let deposits = 0;
        let withdrawals = 0;

        transactions.forEach(
          (transaction) => {
            const type =
              getTransactionType(
                transaction
              );

            const status =
              getStatus(
                transaction
              );

            const amount =
              numberValue(
                transaction.amount
              );

            const completed =
              [
                'COMPLETED',
                'APPROVED',
                'SUCCESS',
                'SUCCESSFUL',
              ].includes(status);

            if (
              type.includes(
                'DEPOSIT'
              ) &&
              completed
            ) {
              deposits += amount;
            }

            if (
              type.includes(
                'WITHDRAW'
              ) &&
              completed
            ) {
              withdrawals += amount;
            }
          }
        );

        return {
          deposits,
          withdrawals,
          count: transactions.length,
        };
      }, [transactions]);

    /* ========================================================
       BACK
    ======================================================== */

    const goBack = () => {
      navigate('/dashboard');
    };

    /* ========================================================
       RENDER
    ======================================================== */

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
        {/* ==================================================
            TOP BAR
        ================================================== */}

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
              spacing={1.5}
              sx={{
                py: 1.5,
              }}
            >
              <IconButton
                onClick={goBack}
                sx={{
                  color: '#fff',
                  background:
                    'rgba(60,90,220,0.25)',
                }}
              >
                <ArrowBackIcon />
              </IconButton>

              <Box
                sx={{
                  flexGrow: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: 18,
                      sm: 22,
                    },
                    fontWeight: 900,
                  }}
                >
                  Account Statement
                </Typography>

                <Typography
                  sx={{
                    color: '#7691e5',
                    fontSize: 9,
                    letterSpacing: 1,
                  }}
                >
                  TRANSACTION HISTORY
                </Typography>
              </Box>

              <IconButton
                onClick={() =>
                  loadTransactions(
                    true
                  )
                }
                disabled={
                  refreshing
                }
                sx={{
                  color: '#5ce8ff',
                  background:
                    'rgba(92,232,255,0.08)',
                }}
              >
                {refreshing ? (
                  <CircularProgress
                    size={22}
                    sx={{
                      color:
                        '#5ce8ff',
                    }}
                  />
                ) : (
                  <RefreshIcon />
                )}
              </IconButton>
            </Stack>
          </Container>
        </Box>

        {/* ==================================================
            CONTENT
        ================================================== */}

        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 3,
              md: 5,
            },
          }}
        >
          {/* HEADER */}

          <Box sx={{ mb: 3 }}>
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 52,
                  height: 52,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'center',
                  background:
                    'rgba(92,232,255,0.10)',
                  color: '#5ce8ff',
                }}
              >
                <ReceiptLongIcon
                  sx={{
                    fontSize: 30,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: 28,
                      md: 38,
                    },
                    fontWeight: 900,
                  }}
                >
                  Account Statement
                </Typography>

                <Typography
                  sx={{
                    color: '#8ea4e8',
                    mt: 0.5,
                  }}
                >
                  View your deposits, withdrawals and account transactions.
                </Typography>
              </Box>
            </Stack>
          </Box>

          {/* ERROR */}

          {error && (
            <Alert
              severity="error"
              onClose={() =>
                setError('')
              }
              sx={{
                mb: 3,
              }}
            >
              {error}
            </Alert>
          )}

          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(3,1fr)',
              },
              gap: 2,
              mb: 3,
            }}
          >
            <SummaryCard
              title="Total Transactions"
              value={String(
                summary.count
              )}
              icon={
                <ReceiptLongIcon />
              }
            />

            <SummaryCard
              title="Completed Deposits"
              value={money(
                summary.deposits
              )}
              icon={
                <AddCircleOutlineIcon />
              }
            />

            <SummaryCard
              title="Completed Withdrawals"
              value={money(
                summary.withdrawals
              )}
              icon={
                <RemoveCircleOutlineIcon />
              }
            />
          </Box>

          {/* ==================================================
              TRANSACTIONS
          ================================================== */}

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
            <CardContent
              sx={{
                p: {
                  xs: 2,
                  md: 3,
                },
              }}
            >
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
                sx={{
                  mb: 2,
                }}
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 22,
                      fontWeight: 900,
                    }}
                  >
                    Transaction History
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8198df',
                      fontSize: 12,
                      mt: 0.4,
                    }}
                  >
                    Your latest account activity
                  </Typography>
                </Box>

                <Button
                  startIcon={
                    <RefreshIcon />
                  }
                  onClick={() =>
                    loadTransactions(
                      true
                    )
                  }
                  disabled={
                    refreshing
                  }
                  sx={{
                    color: '#5ce8ff',
                    textTransform:
                      'none',
                    fontWeight: 800,
                  }}
                >
                  Refresh
                </Button>
              </Stack>

              <Divider
                sx={{
                  mb: 2,
                  borderColor:
                    'rgba(255,255,255,0.08)',
                }}
              />

              {/* LOADING */}

              {loading ? (
                <Box
                  sx={{
                    py: 8,
                    display: 'flex',
                    justifyContent:
                      'center',
                  }}
                >
                  <CircularProgress
                    sx={{
                      color: '#5ce8ff',
                    }}
                  />
                </Box>
              ) : transactions.length ===
                0 ? (
                /* EMPTY */

                <Box
                  sx={{
                    py: 8,
                    textAlign:
                      'center',
                  }}
                >
                  <ReceiptLongIcon
                    sx={{
                      fontSize: 60,
                      color: '#5269ae',
                    }}
                  />

                  <Typography
                    sx={{
                      mt: 2,
                      fontSize: 19,
                      fontWeight: 900,
                    }}
                  >
                    No transactions yet
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.7,
                      color: '#8198df',
                      fontSize: 13,
                    }}
                  >
                    Your deposits, withdrawals and other account activity will appear here.
                  </Typography>
                </Box>
              ) : (
                /* TRANSACTION LIST */

                <Stack spacing={1.5}>
                  {transactions.map(
                    (
                      transaction
                    ) => {
                      const type =
                        getTransactionType(
                          transaction
                        );

                      const status =
                        getStatus(
                          transaction
                        );

                      const currency =
                        transaction.currency ||
                        'USD';

                      const amount =
                        numberValue(
                          transaction.amount
                        );

                      const reference =
                        transaction.transactionReference ||
                        transaction.transactionNumber ||
                        `Transaction #${transaction.id}`;

                      const method =
                        transaction.paymentMethod ||
                        transaction.method ||
                        'Not specified';

                      return (
                        <Box
                          key={
                            transaction.id
                          }
                          sx={{
                            p: {
                              xs: 1.8,
                              md: 2,
                            },
                            borderRadius: 3,
                            background:
                              'rgba(255,255,255,0.035)',
                            border:
                              '1px solid rgba(255,255,255,0.07)',
                          }}
                        >
                          <Stack
                            direction={{
                              xs: 'column',
                              sm: 'row',
                            }}
                            spacing={2}
                            alignItems={{
                              xs: 'stretch',
                              sm: 'center',
                            }}
                          >
                            {/* ICON */}

                            <Box
                              sx={{
                                width: 48,
                                height: 48,
                                minWidth: 48,
                                borderRadius: 2.5,
                                display:
                                  'flex',
                                alignItems:
                                  'center',
                                justifyContent:
                                  'center',
                                background:
                                  'rgba(92,232,255,0.08)',
                              }}
                            >
                              <TransactionIcon
                                type={
                                  type
                                }
                              />
                            </Box>

                            {/* MAIN */}

                            <Box
                              sx={{
                                flexGrow: 1,
                                minWidth: 0,
                              }}
                            >
                              <Stack
                                direction={{
                                  xs: 'column',
                                  sm: 'row',
                                }}
                                spacing={{
                                  xs: 0.5,
                                  sm: 1,
                                }}
                                alignItems={{
                                  xs: 'flex-start',
                                  sm: 'center',
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 15,
                                    fontWeight: 900,
                                  }}
                                >
                                  {type}
                                </Typography>

                                <StatusChip
                                  status={
                                    status
                                  }
                                />
                              </Stack>

                              <Typography
                                sx={{
                                  color:
                                    '#8198df',
                                  fontSize: 11,
                                  mt: 0.6,
                                  wordBreak:
                                    'break-word',
                                }}
                              >
                                Reference: {reference}
                              </Typography>

                              <Typography
                                sx={{
                                  color:
                                    '#8198df',
                                  fontSize: 11,
                                  mt: 0.3,
                                }}
                              >
                                Method: {method}
                              </Typography>

                              {transaction.description && (
                                <Typography
                                  sx={{
                                    color:
                                      '#aab9e9',
                                    fontSize: 11,
                                    mt: 0.7,
                                  }}
                                >
                                  {
                                    transaction.description
                                  }
                                </Typography>
                              )}

                              {transaction.adminNote && (
                                <Box
                                  sx={{
                                    mt: 1,
                                    p: 1,
                                    borderRadius: 2,
                                    background:
                                      'rgba(245,196,81,0.08)',
                                    border:
                                      '1px solid rgba(245,196,81,0.12)',
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      color:
                                        '#f5c451',
                                      fontSize: 10,
                                      fontWeight:
                                        800,
                                    }}
                                  >
                                    ADMIN NOTE
                                  </Typography>

                                  <Typography
                                    sx={{
                                      color:
                                        '#c8d2f1',
                                      fontSize: 11,
                                      mt: 0.3,
                                    }}
                                  >
                                    {
                                      transaction.adminNote
                                    }
                                  </Typography>
                                </Box>
                              )}

                              <Typography
                                sx={{
                                  color:
                                    '#667cbd',
                                  fontSize: 10,
                                  mt: 0.7,
                                }}
                              >
                                {formatDate(
                                  transaction.createdAt
                                )}
                              </Typography>
                            </Box>

                            {/* AMOUNT */}

                            <Box
                              sx={{
                                textAlign: {
                                  xs: 'left',
                                  sm: 'right',
                                },
                                minWidth: {
                                  sm: 130,
                                },
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 19,
                                  fontWeight: 900,
                                  color:
                                    type.includes(
                                      'WITHDRAW'
                                    )
                                      ? '#ff8297'
                                      : type.includes(
                                          'DEPOSIT'
                                        )
                                      ? '#58f39b'
                                      : '#fff',
                                }}
                              >
                                {type.includes(
                                  'WITHDRAW'
                                )
                                  ? '-'
                                  : type.includes(
                                      'DEPOSIT'
                                    )
                                  ? '+'
                                  : ''}
                                {money(
                                  amount,
                                  currency
                                )}
                              </Typography>

                              <Typography
                                sx={{
                                  color:
                                    '#667cbd',
                                  fontSize: 10,
                                  mt: 0.4,
                                }}
                              >
                                {currency}
                              </Typography>
                            </Box>
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
      </Box>
    );
  };

/* ============================================================
   SUMMARY CARD
============================================================ */

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
}

const SummaryCard: React.FC<
  SummaryCardProps
> = ({
  title,
  value,
  icon,
}) => {
  return (
    <Card
      sx={{
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
          alignItems="flex-start"
        >
          <Box>
            <Typography
              sx={{
                color: '#8198df',
                fontSize: 10,
                fontWeight: 800,
                textTransform:
                  'uppercase',
                letterSpacing: 0.7,
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2,
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
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

export default AccountStatement;
