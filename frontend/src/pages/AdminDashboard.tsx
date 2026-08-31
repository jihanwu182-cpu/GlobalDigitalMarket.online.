import React, { useCallback, useEffect, useMemo, useState } from 'react';

import {
  Alert,
  AppBar,
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
  Drawer,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
} from '@mui/material';

import {
  AccountBalance,
  AccountBalanceWallet,
  Add,
  Assessment,
  AttachMoney,
  Block,
  Close,
  Dashboard as DashboardIcon,
  Delete,
  Edit,
  Groups,
  Logout,
  Menu,
  Payments,
  Person,
  Refresh,
  Security,
  Settings,
  TrendingUp,
  VerifiedUser,
} from '@mui/icons-material';

import axios, {
  AxiosError,
  AxiosRequestConfig,
} from 'axios';


// ============================================================
// TYPES
// ============================================================

type Section =
  | 'dashboard'
  | 'users'
  | 'transactions'
  | 'deposits'
  | 'withdrawals'
  | 'kyc'
  | 'investment-plans'
  | 'signal-plans'
  | 'payment-methods';

type UserStatus =
  | 'active'
  | 'blocked'
  | 'suspended'
  | 'disabled';

type TransactionStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED';

interface DashboardStats {
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
  activeInvestmentPlans: number;
}

interface Account {
  id: number;
  accountNumber?: string;
  accountType?: string;
  accountName?: string;
  currency?: string;
  balance?: number;
  deposit?: number;
  profits?: number;
  availableBalance?: number;
  bonus?: number;
  referrerBonus?: number;
  buyingPower?: number;
  marginAvailable?: number;
  status?: string;
}

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  phone?: string;
  country?: string;
  preferredCurrency?: string;
  referralCode?: string;
  referrerCode?: string;
  role?: string;
  status?: string;
  emailVerified?: boolean;
  identityVerificationStatus?: string;
  createdAt?: string;
  account?: Account | null;
}

interface Transaction {
  id: number;
  accountId: number;
  transactionReference?: string;
  transactionType?: string;
  amount: number;
  currency?: string;
  paymentMethod?: string;
  status?: string;
  description?: string;
  proofOfPaymentUrl?: string;
  verifiedBy?: number;
  verifiedAt?: string;
  adminNote?: string;
  createdAt?: string;
  updatedAt?: string;
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
  reviewedBy?: number;
  reviewedAt?: string;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    country?: string;
  };
}

interface InvestmentPlan {
  id: number;
  name: string;
  description?: string;
  minimumAmount: number;
  maximumAmount?: number | null;
  roiPercent: number;
  durationDays: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SignalPlan {
  id: number;
  name: string;
  description?: string;
  strength: number;
  accuracyPercent: number;
  durationDays: number;
  price: number;
  currency: string;
  status: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface UserSignal {
  id: number;
  strength: number;
  status: string;
  enabled: boolean;
  note?: string;
  updatedBy?: number;
  createdAt?: string;
  updatedAt?: string;
  plan?: SignalPlan | null;
}

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  currency: string;
  details?: string;
  accountName?: string;
  accountNumber?: string;
  bankName?: string;
  walletAddress?: string;
  instructions?: string;
  status: string;
  createdBy?: number;
  createdAt?: string;
  updatedAt?: string;
}


// ============================================================
// API
// ============================================================

const API_BASE =
  String(
    process.env.REACT_APP_API_URL || ''
  ).replace(/\/$/, '');

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem('adminToken') ||
    localStorage.getItem('accessToken') ||
    localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


// ============================================================
// HELPERS
// ============================================================

const numberValue = (value: unknown): number => {
  const n = Number(value);

  return Number.isFinite(n) ? n : 0;
};

const formatMoney = (
  amount: unknown,
  currency = 'USD'
) => {
  const value = numberValue(amount);

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
};

const formatDate = (value?: string) => {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString();
};

const getErrorMessage = (error: unknown) => {
  const axiosError =
    error as AxiosError<{
      message?: string;
    }>;

  return (
    axiosError.response?.data?.message ||
    axiosError.message ||
    'Something went wrong.'
  );
};

const statusColor = (
  status?: string
):
  | 'default'
  | 'success'
  | 'warning'
  | 'error'
  | 'info' => {
  const value =
    String(status || '').toUpperCase();

  if (
    value === 'ACTIVE' ||
    value === 'COMPLETED'
  ) {
    return 'success';
  }

  if (
    value === 'PENDING' ||
    value === 'PROCESSING'
  ) {
    return 'warning';
  }

  if (
    value === 'FAILED' ||
    value === 'CANCELLED' ||
    value === 'BLOCKED' ||
    value === 'SUSPENDED' ||
    value === 'DISABLED' ||
    value === 'INACTIVE'
  ) {
    return 'error';
  }

  return 'default';
};


// ============================================================
// COMPONENT
// ============================================================

interface AdminDashboardProps {
  initialTab?: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialTab = 0,
}) => {

  // ----------------------------------------------------------
  // GENERAL
  // ----------------------------------------------------------

  const [section, setSection] =
  useState<Section>(() => {
    const tabs: Section[] = [
      'dashboard',
      'users',
      'transactions',
      'deposits',
      'withdrawals',
      'kyc',
      'investment-plans',
      'signal-plans',
      'payment-methods',
    ];

    return tabs[initialTab] || 'dashboard';
  });

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  // ----------------------------------------------------------
  // DATA
  // ----------------------------------------------------------

  const [dashboard, setDashboard] =
    useState<DashboardStats | null>(null);

  const [users, setUsers] =
    useState<User[]>([]);

  const [transactions, setTransactions] =
    useState<Transaction[]>([]);

  const [deposits, setDeposits] =
    useState<Transaction[]>([]);

  const [withdrawals, setWithdrawals] =
    useState<Transaction[]>([]);

  const [kycRequests, setKycRequests] =
    useState<KycRequest[]>([]);

  const [investmentPlans, setInvestmentPlans] =
    useState<InvestmentPlan[]>([]);

  const [signalPlans, setSignalPlans] =
    useState<SignalPlan[]>([]);

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>([]);

  // ----------------------------------------------------------
  // SEARCH
  // ----------------------------------------------------------

  const [search, setSearch] =
    useState('');

  // ----------------------------------------------------------
  // USER DIALOG
  // ----------------------------------------------------------

  const [selectedUser, setSelectedUser] =
    useState<User | null>(null);

  const [userDialogOpen, setUserDialogOpen] =
    useState(false);

  const [userLoading, setUserLoading] =
    useState(false);

  // ----------------------------------------------------------
  // FUND / DEBIT
  // ----------------------------------------------------------

  const [moneyDialog, setMoneyDialog] =
    useState<{
      open: boolean;
      type: 'fund' | 'debit';
      user: User | null;
    }>({
      open: false,
      type: 'fund',
      user: null,
    });

  const [moneyAmount, setMoneyAmount] =
    useState('');

  const [moneyCurrency, setMoneyCurrency] =
    useState('USD');

  const [moneyDescription, setMoneyDescription] =
    useState('');

  const [moneyLoading, setMoneyLoading] =
    useState(false);

  // ----------------------------------------------------------
  // TRANSACTION STATUS
  // ----------------------------------------------------------

  const [transactionDialogOpen, setTransactionDialogOpen] =
    useState(false);

  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const [transactionStatus, setTransactionStatus] =
    useState<TransactionStatus>('PENDING');

  const [transactionNote, setTransactionNote] =
    useState('');

  const [transactionLoading, setTransactionLoading] =
    useState(false);

  // ----------------------------------------------------------
  // INVESTMENT PLAN
  // ----------------------------------------------------------

  const emptyInvestmentPlan = {
    name: '',
    description: '',
    minimumAmount: '',
    maximumAmount: '',
    roiPercent: '',
    durationDays: '30',
    status: 'ACTIVE',
  };

  const [investmentDialogOpen, setInvestmentDialogOpen] =
    useState(false);

  const [editingInvestmentPlan, setEditingInvestmentPlan] =
    useState<InvestmentPlan | null>(null);

  const [investmentForm, setInvestmentForm] =
    useState(emptyInvestmentPlan);

  const [investmentLoading, setInvestmentLoading] =
    useState(false);

  // ----------------------------------------------------------
  // SIGNAL PLAN
  // ----------------------------------------------------------

  const emptySignalPlan = {
    name: '',
    description: '',
    strength: '50',
    accuracyPercent: '0',
    durationDays: '30',
    price: '0',
    currency: 'USD',
    status: 'ACTIVE',
  };

  const [signalDialogOpen, setSignalDialogOpen] =
    useState(false);

  const [editingSignalPlan, setEditingSignalPlan] =
    useState<SignalPlan | null>(null);

  const [signalForm, setSignalForm] =
    useState(emptySignalPlan);

  const [signalLoading, setSignalLoading] =
    useState(false);

  // ----------------------------------------------------------
  // USER SIGNAL
  // ----------------------------------------------------------

  const [userSignalDialogOpen, setUserSignalDialogOpen] =
    useState(false);

  const [userSignalUser, setUserSignalUser] =
    useState<User | null>(null);

  const [userSignal, setUserSignal] =
    useState<UserSignal | null>(null);

  const [userSignalPlanId, setUserSignalPlanId] =
    useState('');

  const [userSignalStrength, setUserSignalStrength] =
    useState('50');

  const [userSignalEnabled, setUserSignalEnabled] =
    useState(true);

  const [userSignalNote, setUserSignalNote] =
    useState('');

  const [userSignalLoading, setUserSignalLoading] =
    useState(false);

  // ----------------------------------------------------------
  // PAYMENT METHOD
  // ----------------------------------------------------------

  const emptyPaymentMethod = {
    name: '',
    type: 'BANK',
    currency: 'USD',
    details: '',
    accountName: '',
    accountNumber: '',
    bankName: '',
    walletAddress: '',
    instructions: '',
    status: 'ACTIVE',
  };

  const [paymentDialogOpen, setPaymentDialogOpen] =
    useState(false);

  const [editingPaymentMethod, setEditingPaymentMethod] =
    useState<PaymentMethod | null>(null);

  const [paymentForm, setPaymentForm] =
    useState(emptyPaymentMethod);

  const [paymentLoading, setPaymentLoading] =
    useState(false);


  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard = useCallback(
    async () => {
      try {
        const response =
          await api.get('/api/admin/dashboard');

        setDashboard(
          response.data?.dashboard || null
        );
      } catch (err) {
        throw err;
      }
    },
    []
  );


  // ==========================================================
  // LOAD USERS
  // ==========================================================

  const loadUsers = useCallback(
    async () => {
      const response =
        await api.get('/api/admin/users');

      setUsers(
        response.data?.users || []
      );
    },
    []
  );


  // ==========================================================
  // LOAD TRANSACTIONS
  // ==========================================================

  const loadTransactions = useCallback(
    async () => {
      const response =
        await api.get('/api/admin/transactions');

      setTransactions(
        response.data?.transactions || []
      );
    },
    []
  );


  // ==========================================================
  // LOAD DEPOSITS
  // ==========================================================

  const loadDeposits = useCallback(
    async () => {
      const response =
        await api.get('/api/admin/deposits');

      setDeposits(
        response.data?.deposits || []
      );
    },
    []
  );


  // ==========================================================
  // LOAD WITHDRAWALS
  // ==========================================================

  const loadWithdrawals = useCallback(
    async () => {
      const response =
        await api.get('/api/admin/withdrawals');

      setWithdrawals(
        response.data?.withdrawals || []
      );
    },
    []
  );


  // ==========================================================
  // LOAD KYC
  // ==========================================================

  const loadKyc = useCallback(
    async () => {
      const response =
        await api.get('/api/admin/kyc');

      setKycRequests(
        response.data?.requests || []
      );
    },
    []
  );


  // ==========================================================
  // LOAD INVESTMENT PLANS
  // ==========================================================

  const loadInvestmentPlans =
    useCallback(
      async () => {
        const response =
          await api.get(
            '/api/admin/investment-plans'
          );

        setInvestmentPlans(
          response.data?.plans || []
        );
      },
      []
    );


  // ==========================================================
  // LOAD SIGNAL PLANS
  // ==========================================================

  const loadSignalPlans =
    useCallback(
      async () => {
        const response =
          await api.get(
            '/api/admin/signal-plans'
          );

        setSignalPlans(
          response.data?.plans || []
        );
      },
      []
    );


  // ==========================================================
  // LOAD PAYMENT METHODS
  // ==========================================================

  const loadPaymentMethods =
    useCallback(
      async () => {
        const response =
          await api.get(
            '/api/admin/payment-methods'
          );

        setPaymentMethods(
          response.data?.paymentMethods || []
        );
      },
      []
    );


  // ==========================================================
  // LOAD ALL
  // ==========================================================

  const loadAll = useCallback(
    async () => {
      setLoading(true);
      setError('');

      try {
        await Promise.all([
          loadDashboard(),
          loadUsers(),
          loadTransactions(),
          loadDeposits(),
          loadWithdrawals(),
          loadKyc(),
          loadInvestmentPlans(),
          loadSignalPlans(),
          loadPaymentMethods(),
        ]);
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setLoading(false);
      }
    },
    [
      loadDashboard,
      loadUsers,
      loadTransactions,
      loadDeposits,
      loadWithdrawals,
      loadKyc,
      loadInvestmentPlans,
      loadSignalPlans,
      loadPaymentMethods,
    ]
  );


  useEffect(() => {
    loadAll();
  }, [loadAll]);


  // ==========================================================
  // REFRESH
  // ==========================================================

  const refreshData = async () => {
    await loadAll();

    setSuccess(
      'Admin data refreshed successfully.'
    );
  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('accessToken');

    window.location.href =
      '/admin/login';
  };


  // ==========================================================
  // GET SINGLE USER
  // ==========================================================

  const openUser = async (
    user: User
  ) => {
    setUserDialogOpen(true);
    setSelectedUser(user);
    setUserLoading(true);

    try {
      const response =
        await api.get(
          `/api/admin/users/${user.id}`
        );

      setSelectedUser(
        response.data?.user || user
      );
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    } finally {
      setUserLoading(false);
    }
  };


  // ==========================================================
  // USER STATUS
  // ==========================================================

  const changeUserStatus = async (
    user: User,
    status: UserStatus
  ) => {
    try {
      await api.patch(
        `/api/admin/users/${user.id}/status`,
        {
          status,
        }
      );

      setSuccess(
        `User status changed to ${status}.`
      );

      await Promise.all([
        loadUsers(),
        loadDashboard(),
      ]);

      if (selectedUser?.id === user.id) {
        setSelectedUser({
          ...selectedUser,
          status,
        });
      }
    } catch (err) {
      setError(
        getErrorMessage(err)
      );
    }
  };


  // ==========================================================
  // OPEN FUND / DEBIT
  // ==========================================================

  const openMoneyDialog = (
    user: User,
    type: 'fund' | 'debit'
  ) => {
    setMoneyDialog({
      open: true,
      user,
      type,
    });

    setMoneyAmount('');

    setMoneyCurrency(
      user.account?.currency ||
      user.preferredCurrency ||
      'USD'
    );

    setMoneyDescription('');
  };


  // ==========================================================
  // FUND / DEBIT
  // ==========================================================

  const submitMoneyOperation =
    async () => {
      if (!moneyDialog.user) {
        return;
      }

      const amount =
        Number(moneyAmount);

      if (
        !Number.isFinite(amount) ||
        amount <= 0
      ) {
        setError(
          'Please enter a valid amount greater than zero.'
        );
        return;
      }

      setMoneyLoading(true);

      try {
        const endpoint =
          moneyDialog.type === 'fund'
            ? `/api/admin/users/${moneyDialog.user.id}/fund`
            : `/api/admin/users/${moneyDialog.user.id}/debit`;

        const response =
          await api.post(
            endpoint,
            {
              amount,
              currency:
                moneyCurrency,
              description:
                moneyDescription,
            }
          );

        setSuccess(
          response.data?.message ||
          'Account operation completed.'
        );

        setMoneyDialog({
          open: false,
          type: 'fund',
          user: null,
        });

        await Promise.all([
          loadDashboard(),
          loadUsers(),
          loadTransactions(),
          loadDeposits(),
          loadWithdrawals(),
        ]);

        if (
          selectedUser?.id ===
          moneyDialog.user.id
        ) {
          await openUser(
            moneyDialog.user
          );
        }
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setMoneyLoading(false);
      }
    };


  // ==========================================================
  // TRANSACTION STATUS DIALOG
  // ==========================================================

  const openTransactionStatus =
    (transaction: Transaction) => {
      setSelectedTransaction(transaction);

      setTransactionStatus(
        (
          transaction.status ||
          'PENDING'
        ) as TransactionStatus
      );

      setTransactionNote(
        transaction.adminNote || ''
      );

      setTransactionDialogOpen(true);
    };


  // ==========================================================
  // UPDATE TRANSACTION
  // ==========================================================

  const updateTransaction =
    async () => {
      if (!selectedTransaction) {
        return;
      }

      setTransactionLoading(true);

      try {
        const response =
          await api.patch(
            `/api/admin/transactions/${selectedTransaction.id}/status`,
            {
              status:
                transactionStatus,
              adminNote:
                transactionNote,
            }
          );

        setSuccess(
          response.data?.message ||
          'Transaction updated.'
        );

        setTransactionDialogOpen(false);

        await Promise.all([
          loadDashboard(),
          loadTransactions(),
          loadDeposits(),
          loadWithdrawals(),
          loadUsers(),
        ]);
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setTransactionLoading(false);
      }
    };


  // ==========================================================
  // INVESTMENT PLAN DIALOG
  // ==========================================================

  const openInvestmentCreate =
    () => {
      setEditingInvestmentPlan(null);
      setInvestmentForm(
        emptyInvestmentPlan
      );
      setInvestmentDialogOpen(true);
    };


  const openInvestmentEdit =
    (plan: InvestmentPlan) => {
      setEditingInvestmentPlan(plan);

      setInvestmentForm({
        name: plan.name || '',
        description:
          plan.description || '',
        minimumAmount:
          String(plan.minimumAmount ?? ''),
        maximumAmount:
          plan.maximumAmount === null ||
          plan.maximumAmount === undefined
            ? ''
            : String(
                plan.maximumAmount
              ),
        roiPercent:
          String(plan.roiPercent ?? ''),
        durationDays:
          String(plan.durationDays ?? 30),
        status:
          plan.status || 'ACTIVE',
      });

      setInvestmentDialogOpen(true);
    };


  // ==========================================================
  // SAVE INVESTMENT PLAN
  // ==========================================================

  const saveInvestmentPlan =
    async () => {
      const minimum =
        Number(
          investmentForm.minimumAmount
        );

      const maximum =
        investmentForm.maximumAmount === ''
          ? null
          : Number(
              investmentForm.maximumAmount
            );

      const roi =
        Number(
          investmentForm.roiPercent
        );

      const duration =
        Number(
          investmentForm.durationDays
        );

      if (
        !investmentForm.name.trim()
      ) {
        setError(
          'Investment plan name is required.'
        );
        return;
      }

      if (
        !Number.isFinite(minimum) ||
        minimum < 0
      ) {
        setError(
          'Minimum amount is invalid.'
        );
        return;
      }

      if (
        maximum !== null &&
        (
          !Number.isFinite(maximum) ||
          maximum < minimum
        )
      ) {
        setError(
          'Maximum amount must be greater than or equal to minimum amount.'
        );
        return;
      }

      if (
        !Number.isFinite(roi) ||
        roi < 0
      ) {
        setError(
          'ROI is invalid.'
        );
        return;
      }

      if (
        !Number.isInteger(duration) ||
        duration <= 0
      ) {
        setError(
          'Duration must be a positive number.'
        );
        return;
      }

      setInvestmentLoading(true);

      try {
        const payload = {
          name:
            investmentForm.name.trim(),

          description:
            investmentForm.description.trim(),

          minimumAmount:
            minimum,

          maximumAmount:
            maximum,

          roiPercent:
            roi,

          durationDays:
            duration,

          status:
            investmentForm.status,
        };

        const response =
          editingInvestmentPlan
            ? await api.patch(
                `/api/admin/investment-plans/${editingInvestmentPlan.id}`,
                payload
              )
            : await api.post(
                '/api/admin/investment-plans',
                payload
              );

        setSuccess(
          response.data?.message ||
          'Investment plan saved.'
        );

        setInvestmentDialogOpen(false);

        await Promise.all([
          loadInvestmentPlans(),
          loadDashboard(),
        ]);
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setInvestmentLoading(false);
      }
    };


  // ==========================================================
  // DELETE INVESTMENT PLAN
  // ==========================================================

  const deleteInvestmentPlan =
    async (
      plan: InvestmentPlan
    ) => {
      const confirmed =
        window.confirm(
          `Delete investment plan "${plan.name}"?`
        );

      if (!confirmed) return;

      try {
        const response =
          await api.delete(
            `/api/admin/investment-plans/${plan.id}`
          );

        setSuccess(
          response.data?.message ||
          'Investment plan deleted.'
        );

        await Promise.all([
          loadInvestmentPlans(),
          loadDashboard(),
        ]);
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      }
    };


  // ==========================================================
  // SIGNAL PLAN DIALOG
  // ==========================================================

  const openSignalCreate =
    () => {
      setEditingSignalPlan(null);
      setSignalForm(
        emptySignalPlan
      );
      setSignalDialogOpen(true);
    };


  const openSignalEdit =
    (plan: SignalPlan) => {
      setEditingSignalPlan(plan);

      setSignalForm({
        name: plan.name || '',
        description:
          plan.description || '',
        strength:
          String(plan.strength ?? 50),
        accuracyPercent:
          String(
            plan.accuracyPercent ?? 0
          ),
        durationDays:
          String(
            plan.durationDays ?? 30
          ),
        price:
          String(plan.price ?? 0),
        currency:
          plan.currency || 'USD',
        status:
          plan.status || 'ACTIVE',
      });

      setSignalDialogOpen(true);
    };


  // ==========================================================
  // SAVE SIGNAL PLAN
  // ==========================================================

  const saveSignalPlan =
    async () => {
      const strength =
        Number(signalForm.strength);

      const accuracy =
        Number(
          signalForm.accuracyPercent
        );

      const duration =
        Number(
          signalForm.durationDays
        );

      const price =
        Number(signalForm.price);

      if (
        !signalForm.name.trim()
      ) {
        setError(
          'Signal plan name is required.'
        );
        return;
      }

      if (
        !Number.isFinite(strength) ||
        strength < 0 ||
        strength > 100
      ) {
        setError(
          'Signal strength must be between 0 and 100.'
        );
        return;
      }

      if (
        !Number.isFinite(accuracy) ||
        accuracy < 0 ||
        accuracy > 100
      ) {
        setError(
          'Accuracy must be between 0 and 100.'
        );
        return;
      }

      if (
        !Number.isInteger(duration) ||
        duration <= 0
      ) {
        setError(
          'Duration must be a positive number.'
        );
        return;
      }

      if (
        !Number.isFinite(price) ||
        price < 0
      ) {
        setError(
          'Signal price is invalid.'
        );
        return;
      }

      setSignalLoading(true);

      try {
        const payload = {
          name:
            signalForm.name.trim(),

          description:
            signalForm.description.trim(),

          strength,

          accuracyPercent:
            accuracy,

          durationDays:
            duration,

          price,

          currency:
            signalForm.currency
              .trim()
              .toUpperCase(),

          status:
            signalForm.status,
        };

        const response =
          editingSignalPlan
            ? await api.patch(
                `/api/admin/signal-plans/${editingSignalPlan.id}`,
                payload
              )
            : await api.post(
                '/api/admin/signal-plans',
                payload
              );

        setSuccess(
          response.data?.message ||
          'Signal plan saved.'
        );

        setSignalDialogOpen(false);

        await loadSignalPlans();
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setSignalLoading(false);
      }
    };


  // ==========================================================
  // DELETE SIGNAL PLAN
  // ==========================================================

  const deleteSignalPlan =
    async (
      plan: SignalPlan
    ) => {
      const confirmed =
        window.confirm(
          `Delete signal plan "${plan.name}"?`
        );

      if (!confirmed) return;

      try {
        const response =
          await api.delete(
            `/api/admin/signal-plans/${plan.id}`
          );

        setSuccess(
          response.data?.message ||
          'Signal plan deleted.'
        );

        await loadSignalPlans();
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      }
    };


  // ==========================================================
  // OPEN USER SIGNAL
  // ==========================================================

  const openUserSignal =
    async (
      user: User
    ) => {
      setUserSignalUser(user);
      setUserSignalDialogOpen(true);
      setUserSignalLoading(true);

      try {
        const response =
          await api.get(
            `/api/admin/users/${user.id}/signal`
          );

        const signal =
          response.data?.signal || null;

        setUserSignal(signal);

        setUserSignalPlanId(
          signal?.plan?.id
            ? String(signal.plan.id)
            : ''
        );

        setUserSignalStrength(
          String(
            signal?.strength ?? 50
          )
        );

        setUserSignalEnabled(
          signal?.enabled ?? true
        );

        setUserSignalNote(
          signal?.note || ''
        );
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setUserSignalLoading(false);
      }
    };


  // ==========================================================
  // SAVE USER SIGNAL
  // ==========================================================

  const saveUserSignal =
    async () => {
      if (!userSignalUser) {
        return;
      }

      const strength =
        Number(userSignalStrength);

      if (
        !Number.isFinite(strength) ||
        strength < 0 ||
        strength > 100
      ) {
        setError(
          'Signal strength must be between 0 and 100.'
        );
        return;
      }

      setUserSignalLoading(true);

      try {
        const response =
          await api.patch(
            `/api/admin/users/${userSignalUser.id}/signal`,
            {
              signalPlanId:
                userSignalPlanId
                  ? Number(
                      userSignalPlanId
                    )
                  : null,

              strength,

              enabled:
                userSignalEnabled,

              note:
                userSignalNote,
            }
          );

        setSuccess(
          response.data?.message ||
          'User signal updated.'
        );

        setUserSignal(
          response.data?.signal ||
          null
        );

        setUserSignalDialogOpen(false);
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setUserSignalLoading(false);
      }
    };


  // ==========================================================
  // PAYMENT METHOD
  // ==========================================================

  const openPaymentCreate =
    () => {
      setEditingPaymentMethod(null);
      setPaymentForm(
        emptyPaymentMethod
      );
      setPaymentDialogOpen(true);
    };


  const openPaymentEdit =
    (method: PaymentMethod) => {
      setEditingPaymentMethod(method);

      setPaymentForm({
        name:
          method.name || '',

        type:
          method.type || 'OTHER',

        currency:
          method.currency || 'USD',

        details:
          method.details || '',

        accountName:
          method.accountName || '',

        accountNumber:
          method.accountNumber || '',

        bankName:
          method.bankName || '',

        walletAddress:
          method.walletAddress || '',

        instructions:
          method.instructions || '',

        status:
          method.status || 'ACTIVE',
      });

      setPaymentDialogOpen(true);
    };


  // ==========================================================
  // SAVE PAYMENT METHOD
  // ==========================================================

  const savePaymentMethod =
    async () => {
      if (
        !paymentForm.name.trim()
      ) {
        setError(
          'Payment method name is required.'
        );
        return;
      }

      setPaymentLoading(true);

      try {
        const payload = {
          name:
            paymentForm.name.trim(),

          type:
            paymentForm.type
              .trim()
              .toUpperCase(),

          currency:
            paymentForm.currency
              .trim()
              .toUpperCase(),

          details:
            paymentForm.details.trim(),

          accountName:
            paymentForm.accountName.trim(),

          accountNumber:
            paymentForm.accountNumber.trim(),

          bankName:
            paymentForm.bankName.trim(),

          walletAddress:
            paymentForm.walletAddress.trim(),

          instructions:
            paymentForm.instructions.trim(),

          status:
            paymentForm.status,
        };

        const response =
          editingPaymentMethod
            ? await api.patch(
                `/api/admin/payment-methods/${editingPaymentMethod.id}`,
                payload
              )
            : await api.post(
                '/api/admin/payment-methods',
                payload
              );

        setSuccess(
          response.data?.message ||
          'Payment method saved.'
        );

        setPaymentDialogOpen(false);

        await loadPaymentMethods();
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      } finally {
        setPaymentLoading(false);
      }
    };


  // ==========================================================
  // DELETE PAYMENT METHOD
  // ==========================================================

  const deletePaymentMethod =
    async (
      method: PaymentMethod
    ) => {
      const confirmed =
        window.confirm(
          `Delete payment method "${method.name}"?`
        );

      if (!confirmed) return;

      try {
        const response =
          await api.delete(
            `/api/admin/payment-methods/${method.id}`
          );

        setSuccess(
          response.data?.message ||
          'Payment method deleted.'
        );

        await loadPaymentMethods();
      } catch (err) {
        setError(
          getErrorMessage(err)
        );
      }
    };


  // ==========================================================
  // FILTER USERS
  // ==========================================================

  const filteredUsers =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return users;
      }

      return users.filter(
        (user) =>
          String(user.id).includes(value) ||
          String(user.email || '')
            .toLowerCase()
            .includes(value) ||
          String(user.firstName || '')
            .toLowerCase()
            .includes(value) ||
          String(user.lastName || '')
            .toLowerCase()
            .includes(value) ||
          String(user.username || '')
            .toLowerCase()
            .includes(value)
      );
    }, [users, search]);


  // ==========================================================
  // DRAWER
  // ==========================================================

  const menuItems: {
    key: Section;
    label: string;
    icon: React.ReactNode;
  }[] = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: <DashboardIcon />,
    },
    {
      key: 'users',
      label: 'Users',
      icon: <Groups />,
    },
    {
      key: 'transactions',
      label: 'Transactions',
      icon: <Assessment />,
    },
    {
      key: 'deposits',
      label: 'Deposits',
      icon: <AccountBalanceWallet />,
    },
    {
      key: 'withdrawals',
      label: 'Withdrawals',
      icon: <Payments />,
    },
    {
      key: 'kyc',
      label: 'KYC',
      icon: <VerifiedUser />,
    },
    {
      key: 'investment-plans',
      label: 'Investment Plans',
      icon: <TrendingUp />,
    },
    {
      key: 'signal-plans',
      label: 'Signal Plans',
      icon: <Security />,
    },
    {
      key: 'payment-methods',
      label: 'Payment Methods',
      icon: <AccountBalance />,
    },
  ];


  const drawerContent = (
    <Box>
      <Box
        sx={{
          p: 2.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography
          variant="h6"
          fontWeight={800}
        >
          Global Digital Market
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
        >
          Administrator Panel
        </Typography>
      </Box>

      <Box sx={{ p: 1.5 }}>
        {menuItems.map((item) => (
          <Button
            key={item.key}
            fullWidth
            startIcon={item.icon}
            onClick={() => {
              setSection(item.key);
              setMobileOpen(false);
              setSearch('');
            }}
            sx={{
              justifyContent:
                'flex-start',
              mb: 0.5,
              px: 2,
              py: 1.25,
              borderRadius: 2,
              backgroundColor:
                section === item.key
                  ? 'action.selected'
                  : 'transparent',
              fontWeight:
                section === item.key
                  ? 700
                  : 500,
            }}
          >
            {item.label}
          </Button>
        ))}

        <Divider sx={{ my: 2 }} />

        <Button
          fullWidth
          color="error"
          startIcon={<Logout />}
          onClick={logout}
          sx={{
            justifyContent:
              'flex-start',
            px: 2,
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );


  // ==========================================================
  // STAT CARD
  // ==========================================================

  const StatCard = ({
    title,
    value,
    icon,
  }: {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
  }) => (
    <Card
      elevation={1}
      sx={{
        height: '100%',
        borderRadius: 3,
      }}
    >
      <CardContent>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          spacing={2}
        >
          <Box>
            <Typography
              color="text.secondary"
              variant="body2"
            >
              {title}
            </Typography>

            <Typography
              variant="h5"
              fontWeight={800}
              sx={{ mt: 1 }}
            >
              {value}
            </Typography>
          </Box>

          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              backgroundColor:
                'action.hover',
            }}
          >
            {icon}
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );


  // ==========================================================
  // DASHBOARD VIEW
  // ==========================================================

  const renderDashboard = () => {
    if (!dashboard) {
      return (
        <Paper sx={{ p: 4 }}>
          <Typography>
            No dashboard data available.
          </Typography>
        </Paper>
      );
    }

    return (
      <Stack spacing={3}>
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Admin Dashboard
          </Typography>

          <Typography
            color="text.secondary"
          >
            Overview of your platform.
          </Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Users"
              value={dashboard.totalUsers}
              icon={<Groups />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Users"
              value={dashboard.activeUsers}
              icon={<Person />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Accounts"
              value={dashboard.totalAccounts}
              icon={<AccountBalance />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Transactions"
              value={dashboard.totalTransactions}
              icon={<Assessment />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Account Balance"
              value={formatMoney(
                dashboard.totalAccountBalance
              )}
              icon={<AttachMoney />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed Deposits"
              value={formatMoney(
                dashboard.completedDeposits
              )}
              icon={<AccountBalanceWallet />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Completed Withdrawals"
              value={formatMoney(
                dashboard.completedWithdrawals
              )}
              icon={<Payments />}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Pending KYC"
              value={dashboard.pendingKyc}
              icon={<VerifiedUser />}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Pending Activity
                </Typography>

                <Stack spacing={1.5} sx={{ mt: 2 }}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography>
                      Transactions
                    </Typography>
                    <Chip
                      label={
                        dashboard.pendingTransactions
                      }
                      color="warning"
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography>
                      Deposits
                    </Typography>
                    <Chip
                      label={
                        dashboard.pendingDeposits
                      }
                      color="warning"
                    />
                  </Stack>

                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography>
                      Withdrawals
                    </Typography>
                    <Chip
                      label={
                        dashboard.pendingWithdrawals
                      }
                      color="warning"
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Plans
                </Typography>

                <Typography
                  variant="h3"
                  fontWeight={800}
                  sx={{ mt: 2 }}
                >
                  {dashboard.activeInvestmentPlans}
                </Typography>

                <Typography
                  color="text.secondary"
                >
                  Active investment plans
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight={700}
                >
                  Quick Actions
                </Typography>

                <Stack spacing={1} sx={{ mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() =>
                      setSection('users')
                    }
                  >
                    Manage Users
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() =>
                      setSection('deposits')
                    }
                  >
                    Review Deposits
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() =>
                      setSection('withdrawals')
                    }
                  >
                    Review Withdrawals
                  </Button>

                  <Button
                    variant="outlined"
                    onClick={() =>
                      setSection('kyc')
                    }
                  >
                    Review KYC
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>
    );
  };


  // ==========================================================
  // USERS VIEW
  // ==========================================================

  const renderUsers = () => (
    <Stack spacing={2}>
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Users
          </Typography>

          <Typography
            color="text.secondary"
          >
            Manage accounts and user balances.
          </Typography>
        </Box>

        <TextField
          size="small"
          label="Search users"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />
      </Stack>

      <TableContainer
        component={Paper}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Balance</TableCell>
              <TableCell align="right">
                Actions
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  {user.id}
                </TableCell>

                <TableCell>
                  <Typography fontWeight={700}>
                    {[
                      user.firstName,
                      user.lastName,
                    ]
                      .filter(Boolean)
                      .join(' ') ||
                      user.username ||
                      'User'}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {user.username || ''}
                  </Typography>
                </TableCell>

                <TableCell>
                  {user.email}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={
                      user.status ||
                      'unknown'
                    }
                    color={statusColor(
                      user.status
                    )}
                  />
                </TableCell>

                <TableCell>
                  {formatMoney(
                    user.account?.balance,
                    user.account?.currency ||
                      user.preferredCurrency ||
                      'USD'
                  )}
                </TableCell>

                <TableCell align="right">
                  <Stack
                    direction="row"
                    justifyContent="flex-end"
                    flexWrap="wrap"
                    gap={0.5}
                  >
                    <Button
                      size="small"
                      onClick={() =>
                        openUser(user)
                      }
                    >
                      View
                    </Button>

                    <Button
                      size="small"
                      color="success"
                      onClick={() =>
                        openMoneyDialog(
                          user,
                          'fund'
                        )
                      }
                    >
                      Fund
                    </Button>

                    <Button
                      size="small"
                      color="warning"
                      onClick={() =>
                        openMoneyDialog(
                          user,
                          'debit'
                        )
                      }
                    >
                      Debit
                    </Button>

                    <Button
                      size="small"
                      onClick={() =>
                        openUserSignal(user)
                      }
                    >
                      Signal
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}

            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                >
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );


  // ==========================================================
  // TRANSACTIONS TABLE
  // ==========================================================

  const transactionTable = (
    rows: Transaction[]
  ) => (
    <TableContainer
      component={Paper}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>User</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Amount</TableCell>
            <TableCell>Method</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">
              Action
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {rows.map((transaction) => (
            <TableRow
              key={transaction.id}
            >
              <TableCell>
                {transaction.id}
              </TableCell>

              <TableCell>
                {transaction.user?.firstName}{' '}
                {transaction.user?.lastName}

                <Typography
                  variant="caption"
                  display="block"
                  color="text.secondary"
                >
                  {transaction.user?.email}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={
                    transaction.transactionType ||
                    'UNKNOWN'
                  }
                />
              </TableCell>

              <TableCell>
                {formatMoney(
                  transaction.amount,
                  transaction.currency ||
                    'USD'
                )}
              </TableCell>

              <TableCell>
                {transaction.paymentMethod ||
                  '—'}
              </TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={
                    transaction.status ||
                    'UNKNOWN'
                  }
                  color={statusColor(
                    transaction.status
                  )}
                />
              </TableCell>

              <TableCell>
                {formatDate(
                  transaction.createdAt
                )}
              </TableCell>

              <TableCell align="right">
                <Button
                  size="small"
                  onClick={() =>
                    openTransactionStatus(
                      transaction
                    )
                  }
                >
                  Update
                </Button>
              </TableCell>
            </TableRow>
          ))}

          {rows.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={8}
                align="center"
              >
                No transactions found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );


  // ==========================================================
  // TRANSACTIONS VIEW
  // ==========================================================

  const renderTransactions = () => (
    <Stack spacing={2}>
      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
        >
          Transactions
        </Typography>

        <Typography color="text.secondary">
          Review and update transaction statuses.
        </Typography>
      </Box>

      {transactionTable(transactions)}
    </Stack>
  );


  // ==========================================================
  // DEPOSITS VIEW
  // ==========================================================

  const renderDeposits = () => (
    <Stack spacing={2}>
      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
        >
          Deposits
        </Typography>

        <Typography color="text.secondary">
          Review user deposit requests.
        </Typography>
      </Box>

      {transactionTable(deposits)}
    </Stack>
  );


  // ==========================================================
  // WITHDRAWALS VIEW
  // ==========================================================

  const renderWithdrawals = () => (
    <Stack spacing={2}>
      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
        >
          Withdrawals
        </Typography>

        <Typography color="text.secondary">
          Review and process withdrawal requests.
        </Typography>
      </Box>

      {transactionTable(withdrawals)}
    </Stack>
  );


  // ==========================================================
  // KYC VIEW
  // ==========================================================

  const renderKyc = () => (
    <Stack spacing={2}>
      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
        >
          KYC Requests
        </Typography>

        <Typography color="text.secondary">
          View submitted identity documents.
        </Typography>
      </Box>

      <Alert severity="info">
        Your current backend exposes KYC requests for
        viewing, but it does not currently expose an
        admin approve/reject KYC endpoint.
      </Alert>

      <TableContainer
        component={Paper}
      >
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Document</TableCell>
              <TableCell>Document Number</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell>Document</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {kycRequests.map((request) => (
              <TableRow
                key={request.id}
              >
                <TableCell>
                  <Typography fontWeight={700}>
                    {request.user?.firstName}{' '}
                    {request.user?.lastName}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {request.user?.email}
                  </Typography>
                </TableCell>

                <TableCell>
                  {request.documentType ||
                    '—'}
                </TableCell>

                <TableCell>
                  {request.documentNumber ||
                    '—'}
                </TableCell>

                <TableCell>
                  <Chip
                    size="small"
                    label={
                      request.status ||
                      'UNKNOWN'
                    }
                    color={statusColor(
                      request.status
                    )}
                  />
                </TableCell>

                <TableCell>
                  {formatDate(
                    request.createdAt
                  )}
                </TableCell>

                <TableCell>
                  {request.documentUrl ? (
                    <Button
                      size="small"
                      component="a"
                      href={
                        request.documentUrl
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Open
                    </Button>
                  ) : (
                    '—'
                  )}
                </TableCell>
              </TableRow>
            ))}

            {kycRequests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={6}
                  align="center"
                >
                  No KYC requests found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Stack>
  );


  // ==========================================================
  // INVESTMENT PLANS VIEW
  // ==========================================================

  const renderInvestmentPlans = () => (
    <Stack spacing={2}>
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Investment Plans
          </Typography>

          <Typography color="text.secondary">
            Create and manage investment plans.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={
            openInvestmentCreate
          }
        >
          Add Plan
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {investmentPlans.map((plan) => (
          <Grid
            item
            xs={12}
            md={6}
            lg={4}
            key={plan.id}
          >
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      {plan.name}
                    </Typography>

                    <Chip
                      size="small"
                      label={plan.status}
                      color={statusColor(
                        plan.status
                      )}
                    />
                  </Stack>

                  <Typography
                    color="text.secondary"
                  >
                    {plan.description ||
                      'No description'}
                  </Typography>

                  <Divider />

                  <Typography>
                    Minimum:{' '}
                    <strong>
                      {formatMoney(
                        plan.minimumAmount
                      )}
                    </strong>
                  </Typography>

                  <Typography>
                    Maximum:{' '}
                    <strong>
                      {plan.maximumAmount ===
                      null ||
                      plan.maximumAmount ===
                        undefined
                        ? 'No limit'
                        : formatMoney(
                            plan.maximumAmount
                          )}
                    </strong>
                  </Typography>

                  <Typography>
                    ROI:{' '}
                    <strong>
                      {plan.roiPercent}%
                    </strong>
                  </Typography>

                  <Typography>
                    Duration:{' '}
                    <strong>
                      {plan.durationDays} days
                    </strong>
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ mt: 1 }}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() =>
                        openInvestmentEdit(
                          plan
                        )
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={() =>
                        deleteInvestmentPlan(
                          plan
                        )
                      }
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {investmentPlans.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              No investment plans found.
            </Paper>
          </Grid>
        )}
      </Grid>
    </Stack>
  );


  // ==========================================================
  // SIGNAL PLANS VIEW
  // ==========================================================

  const renderSignalPlans = () => (
    <Stack spacing={2}>
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Signal Plans
          </Typography>

          <Typography color="text.secondary">
            Manage signal packages and assign them to users.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={
            openSignalCreate
          }
        >
          Add Signal Plan
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {signalPlans.map((plan) => (
          <Grid
            item
            xs={12}
            md={6}
            lg={4}
            key={plan.id}
          >
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      {plan.name}
                    </Typography>

                    <Chip
                      size="small"
                      label={plan.status}
                      color={statusColor(
                        plan.status
                      )}
                    />
                  </Stack>

                  <Typography color="text.secondary">
                    {plan.description ||
                      'No description'}
                  </Typography>

                  <Typography>
                    Strength:{' '}
                    <strong>
                      {plan.strength}%
                    </strong>
                  </Typography>

                  <Typography>
                    Accuracy:{' '}
                    <strong>
                      {plan.accuracyPercent}%
                    </strong>
                  </Typography>

                  <Typography>
                    Duration:{' '}
                    <strong>
                      {plan.durationDays} days
                    </strong>
                  </Typography>

                  <Typography>
                    Price:{' '}
                    <strong>
                      {formatMoney(
                        plan.price,
                        plan.currency
                      )}
                    </strong>
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() =>
                        openSignalEdit(
                          plan
                        )
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={() =>
                        deleteSignalPlan(
                          plan
                        )
                      }
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {signalPlans.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              No signal plans found.
            </Paper>
          </Grid>
        )}
      </Grid>
    </Stack>
  );


  // ==========================================================
  // PAYMENT METHODS VIEW
  // ==========================================================

  const renderPaymentMethods = () => (
    <Stack spacing={2}>
      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
          >
            Payment Methods
          </Typography>

          <Typography color="text.secondary">
            Configure payment methods displayed to users.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={
            openPaymentCreate
          }
        >
          Add Payment Method
        </Button>
      </Stack>

      <Grid container spacing={2}>
        {paymentMethods.map((method) => (
          <Grid
            item
            xs={12}
            md={6}
            lg={4}
            key={method.id}
          >
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
              }}
            >
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="h6"
                      fontWeight={800}
                    >
                      {method.name}
                    </Typography>

                    <Chip
                      size="small"
                      label={method.status}
                      color={statusColor(
                        method.status
                      )}
                    />
                  </Stack>

                  <Typography>
                    Type:{' '}
                    <strong>
                      {method.type}
                    </strong>
                  </Typography>

                  <Typography>
                    Currency:{' '}
                    <strong>
                      {method.currency}
                    </strong>
                  </Typography>

                  {method.bankName && (
                    <Typography>
                      Bank:{' '}
                      <strong>
                        {method.bankName}
                      </strong>
                    </Typography>
                  )}

                  {method.accountName && (
                    <Typography>
                      Account Name:{' '}
                      <strong>
                        {method.accountName}
                      </strong>
                    </Typography>
                  )}

                  {method.accountNumber && (
                    <Typography>
                      Account Number:{' '}
                      <strong>
                        {method.accountNumber}
                      </strong>
                    </Typography>
                  )}

                  {method.walletAddress && (
                    <Typography
                      sx={{
                        wordBreak:
                          'break-word',
                      }}
                    >
                      Wallet:{' '}
                      <strong>
                        {method.walletAddress}
                      </strong>
                    </Typography>
                  )}

                  {method.details && (
                    <Typography
                      color="text.secondary"
                    >
                      {method.details}
                    </Typography>
                  )}

                  <Stack
                    direction="row"
                    spacing={1}
                  >
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<Edit />}
                      onClick={() =>
                        openPaymentEdit(
                          method
                        )
                      }
                    >
                      Edit
                    </Button>

                    <Button
                      fullWidth
                      color="error"
                      variant="outlined"
                      startIcon={<Delete />}
                      onClick={() =>
                        deletePaymentMethod(
                          method
                        )
                      }
                    >
                      Delete
                    </Button>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {paymentMethods.length === 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 4 }}>
              No payment methods found.
            </Paper>
          </Grid>
        )}
      </Grid>
    </Stack>
  );


  // ==========================================================
  // CURRENT VIEW
  // ==========================================================

  const renderSection = () => {
    switch (section) {
      case 'users':
        return renderUsers();

      case 'transactions':
        return renderTransactions();

      case 'deposits':
        return renderDeposits();

      case 'withdrawals':
        return renderWithdrawals();

      case 'kyc':
        return renderKyc();

      case 'investment-plans':
        return renderInvestmentPlans();

      case 'signal-plans':
        return renderSignalPlans();

      case 'payment-methods':
        return renderPaymentMethods();

      case 'dashboard':
      default:
        return renderDashboard();
    }
  };


  // ==========================================================
  // RETURN
  // ==========================================================

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor:
          'background.default',
      }}
    >

      {/* DESKTOP DRAWER */}
      <Box
        component="nav"
        sx={{
          width: {
            md: 260,
          },
          flexShrink: {
            md: 0,
          },
          display: {
            xs: 'none',
            md: 'block',
          },
        }}
      >
        <Drawer
          variant="permanent"
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },
            '& .MuiDrawer-paper': {
              width: 260,
              boxSizing: 'border-box',
            },
          }}
          open
        >
          {drawerContent}
        </Drawer>
      </Box>


      {/* MOBILE DRAWER */}
      <Drawer
        open={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
        sx={{
          display: {
            xs: 'block',
            md: 'none',
          },
          '& .MuiDrawer-paper': {
            width: 280,
          },
        }}
      >
        {drawerContent}
      </Drawer>


      {/* MAIN */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            md: `calc(100% - 260px)`,
          },
        }}
      >

        <AppBar
          position="sticky"
          color="inherit"
          elevation={1}
        >
          <Toolbar>
            <IconButton
              edge="start"
              onClick={() =>
                setMobileOpen(true)
              }
              sx={{
                mr: 1,
                display: {
                  md: 'none',
                },
              }}
            >
              <Menu />
            </IconButton>

            <Typography
              sx={{
                flexGrow: 1,
                fontWeight: 800,
              }}
            >
              Administrator
            </Typography>

            <IconButton
              onClick={refreshData}
              disabled={loading}
            >
              <Refresh />
            </IconButton>

            <IconButton>
              <Settings />
            </IconButton>
          </Toolbar>
        </AppBar>


        <Container
          maxWidth="xl"
          sx={{
            py: 3,
          }}
        >

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() =>
                setError('')
              }
            >
              {error}
            </Alert>
          )}

          {loading && (
            <Box
              sx={{
                display: 'flex',
                justifyContent:
                  'center',
                py: 3,
              }}
            >
              <CircularProgress />
            </Box>
          )}

          {renderSection()}
        </Container>
      </Box>


      {/* ======================================================
          USER DETAILS DIALOG
      ====================================================== */}

      <Dialog
        open={userDialogOpen}
        onClose={() =>
          setUserDialogOpen(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          User Details
        </DialogTitle>

        <DialogContent dividers>
          {userLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent:
                  'center',
                py: 5,
              }}
            >
              <CircularProgress />
            </Box>
          ) : selectedUser ? (
            <Stack spacing={3}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography
                    color="text.secondary"
                  >
                    Name
                  </Typography>

                  <Typography fontWeight={700}>
                    {selectedUser.firstName}{' '}
                    {selectedUser.lastName}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    color="text.secondary"
                  >
                    Email
                  </Typography>

                  <Typography fontWeight={700}>
                    {selectedUser.email}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    color="text.secondary"
                  >
                    Username
                  </Typography>

                  <Typography>
                    {selectedUser.username ||
                      '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    color="text.secondary"
                  >
                    Phone
                  </Typography>

                  <Typography>
                    {selectedUser.phone ||
                      '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    color="text.secondary"
                  >
                    Country
                  </Typography>

                  <Typography>
                    {selectedUser.country ||
                      '—'}
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Typography
                    color="text.secondary"
                  >
                    Status
                  </Typography>

                  <Chip
                    label={
                      selectedUser.status ||
                      'UNKNOWN'
                    }
                    color={statusColor(
                      selectedUser.status
                    )}
                  />
                </Grid>
              </Grid>

              <Divider />

              <Typography
                variant="h6"
                fontWeight={800}
              >
                Account
              </Typography>

              {selectedUser.account ? (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      color="text.secondary"
                    >
                      Account Number
                    </Typography>

                    <Typography fontWeight={700}>
                      {
                        selectedUser.account
                          .accountNumber
                      }
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      color="text.secondary"
                    >
                      Currency
                    </Typography>

                    <Typography>
                      {
                        selectedUser.account
                          .currency
                      }
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      color="text.secondary"
                    >
                      Balance
                    </Typography>

                    <Typography
                      variant="h5"
                      fontWeight={800}
                    >
                      {formatMoney(
                        selectedUser.account
                          .balance,
                        selectedUser.account
                          .currency ||
                          'USD'
                      )}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      color="text.secondary"
                    >
                      Available Balance
                    </Typography>

                    <Typography
                      variant="h6"
                      fontWeight={700}
                    >
                      {formatMoney(
                        selectedUser.account
                          .availableBalance,
                        selectedUser.account
                          .currency ||
                          'USD'
                      )}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      color="text.secondary"
                    >
                      Deposits
                    </Typography>

                    <Typography>
                      {formatMoney(
                        selectedUser.account
                          .deposit,
                        selectedUser.account
                          .currency ||
                          'USD'
                      )}
                    </Typography>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography
                      color="text.secondary"
                    >
                      Profits
                    </Typography>

                    <Typography>
                      {formatMoney(
                        selectedUser.account
                          .profits,
                        selectedUser.account
                          .currency ||
                          'USD'
                      )}
                    </Typography>
                  </Grid>
                </Grid>
              ) : (
                <Alert severity="warning">
                  This user does not have an account.
                </Alert>
              )}

              <Divider />

              <Typography
                variant="h6"
                fontWeight={800}
              >
                User Controls
              </Typography>

              <Stack
                direction="row"
                flexWrap="wrap"
                gap={1}
              >
                <Button
                  color="success"
                  variant="contained"
                  onClick={() =>
                    changeUserStatus(
                      selectedUser,
                      'active'
                    )
                  }
                >
                  Activate
                </Button>

                <Button
                  color="warning"
                  variant="contained"
                  onClick={() =>
                    changeUserStatus(
                      selectedUser,
                      'suspended'
                    )
                  }
                >
                  Suspend
                </Button>

                <Button
                  color="error"
                  variant="contained"
                  startIcon={<Block />}
                  onClick={() =>
                    changeUserStatus(
                      selectedUser,
                      'blocked'
                    )
                  }
                >
                  Block
                </Button>

                <Button
                  color="error"
                  variant="outlined"
                  onClick={() =>
                    changeUserStatus(
                      selectedUser,
                      'disabled'
                    )
                  }
                >
                  Disable
                </Button>

                <Button
                  variant="outlined"
                  color="success"
                  onClick={() =>
                    openMoneyDialog(
                      selectedUser,
                      'fund'
                    )
                  }
                >
                  Fund Account
                </Button>

                <Button
                  variant="outlined"
                  color="warning"
                  onClick={() =>
                    openMoneyDialog(
                      selectedUser,
                      'debit'
                    )
                  }
                >
                  Debit Account
                </Button>

                <Button
                  variant="outlined"
                  onClick={() =>
                    openUserSignal(
                      selectedUser
                    )
                  }
                >
                  Manage Signal
                </Button>
              </Stack>
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setUserDialogOpen(false)
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>


      {/* ======================================================
          FUND / DEBIT DIALOG
      ====================================================== */}

      <Dialog
        open={moneyDialog.open}
        onClose={() =>
          setMoneyDialog({
            open: false,
            type: 'fund',
            user: null,
          })
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {moneyDialog.type === 'fund'
            ? 'Fund User Account'
            : 'Debit User Account'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert
              severity={
                moneyDialog.type ===
                'fund'
                  ? 'info'
                  : 'warning'
              }
            >
              {moneyDialog.user
                ? `User: ${moneyDialog.user.email}`
                : ''}
            </Alert>

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={moneyAmount}
              onChange={(e) =>
                setMoneyAmount(
                  e.target.value
                )
              }
              inputProps={{
                min: 0,
                step: '0.01',
              }}
            />

            <TextField
              fullWidth
              label="Currency"
              value={moneyCurrency}
              onChange={(e) =>
                setMoneyCurrency(
                  e.target.value
                )
              }
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={moneyDescription}
              onChange={(e) =>
                setMoneyDescription(
                  e.target.value
                )
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setMoneyDialog({
                open: false,
                type: 'fund',
                user: null,
              })
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            color={
              moneyDialog.type ===
              'fund'
                ? 'success'
                : 'warning'
            }
            onClick={
              submitMoneyOperation
            }
            disabled={moneyLoading}
          >
            {moneyLoading ? (
              <CircularProgress size={22} />
            ) : moneyDialog.type ===
              'fund' ? (
              'Fund Account'
            ) : (
              'Debit Account'
            )}
          </Button>
        </DialogActions>
      </Dialog>


      {/* ======================================================
          TRANSACTION STATUS DIALOG
      ====================================================== */}

      <Dialog
        open={transactionDialogOpen}
        onClose={() =>
          setTransactionDialogOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Update Transaction
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            {selectedTransaction && (
              <Alert severity="info">
                Transaction #
                {selectedTransaction.id}
                {' — '}
                {formatMoney(
                  selectedTransaction.amount,
                  selectedTransaction.currency ||
                    'USD'
                )}
              </Alert>
            )}

            <FormControl fullWidth>
              <InputLabel>
                Status
              </InputLabel>

              <Select
                label="Status"
                value={transactionStatus}
                onChange={(e) =>
                  setTransactionStatus(
                    e.target
                      .value as TransactionStatus
                  )
                }
              >
                <MenuItem value="PENDING">
                  PENDING
                </MenuItem>

                <MenuItem value="PROCESSING">
                  PROCESSING
                </MenuItem>

                <MenuItem value="COMPLETED">
                  COMPLETED
                </MenuItem>

                <MenuItem value="FAILED">
                  FAILED
                </MenuItem>

                <MenuItem value="CANCELLED">
                  CANCELLED
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Admin Note"
              value={transactionNote}
              onChange={(e) =>
                setTransactionNote(
                  e.target.value
                )
              }
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setTransactionDialogOpen(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              updateTransaction
            }
            disabled={transactionLoading}
          >
            {transactionLoading ? (
              <CircularProgress size={22} />
            ) : (
              'Save Status'
            )}
          </Button>
        </DialogActions>
      </Dialog>


      {/* ======================================================
          INVESTMENT PLAN DIALOG
      ====================================================== */}

      <Dialog
        open={investmentDialogOpen}
        onClose={() =>
          setInvestmentDialogOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingInvestmentPlan
            ? 'Edit Investment Plan'
            : 'Create Investment Plan'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Plan Name"
              value={
                investmentForm.name
              }
              onChange={(e) =>
                setInvestmentForm({
                  ...investmentForm,
                  name: e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={
                investmentForm.description
              }
              onChange={(e) =>
                setInvestmentForm({
                  ...investmentForm,
                  description:
                    e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              type="number"
              label="Minimum Amount"
              value={
                investmentForm.minimumAmount
              }
              onChange={(e) =>
                setInvestmentForm({
                  ...investmentForm,
                  minimumAmount:
                    e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              type="number"
              label="Maximum Amount"
              value={
                investmentForm.maximumAmount
              }
              onChange={(e) =>
                setInvestmentForm({
                  ...investmentForm,
                  maximumAmount:
                    e.target.value,
                })
              }
              helperText="Leave blank for no maximum."
            />

            <TextField
              fullWidth
              type="number"
              label="ROI %"
              value={
                investmentForm.roiPercent
              }
              onChange={(e) =>
                setInvestmentForm({
                  ...investmentForm,
                  roiPercent:
                    e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              type="number"
              label="Duration in Days"
              value={
                investmentForm.durationDays
              }
              onChange={(e) =>
                setInvestmentForm({
                  ...investmentForm,
                  durationDays:
                    e.target.value,
                })
              }
            />

            <FormControl fullWidth>
              <InputLabel>
                Status
              </InputLabel>

              <Select
                label="Status"
                value={
                  investmentForm.status
                }
                onChange={(e) =>
                  setInvestmentForm({
                    ...investmentForm,
                    status:
                      e.target.value,
                  })
                }
              >
                <MenuItem value="ACTIVE">
                  ACTIVE
                </MenuItem>

                <MenuItem value="INACTIVE">
                  INACTIVE
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setInvestmentDialogOpen(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              saveInvestmentPlan
            }
            disabled={
              investmentLoading
            }
          >
            {investmentLoading ? (
              <CircularProgress size={22} />
            ) : (
              'Save Plan'
            )}
          </Button>
        </DialogActions>
      </Dialog>


      {/* ======================================================
          SIGNAL PLAN DIALOG
      ====================================================== */}

      <Dialog
        open={signalDialogOpen}
        onClose={() =>
          setSignalDialogOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingSignalPlan
            ? 'Edit Signal Plan'
            : 'Create Signal Plan'}
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              fullWidth
              label="Signal Plan Name"
              value={
                signalForm.name
              }
              onChange={(e) =>
                setSignalForm({
                  ...signalForm,
                  name: e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={
                signalForm.description
              }
              onChange={(e) =>
                setSignalForm({
                  ...signalForm,
                  description:
                    e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              type="number"
              label="Signal Strength %"
              value={
                signalForm.strength
              }
              onChange={(e) =>
                setSignalForm({
                  ...signalForm,
                  strength:
                    e.target.value,
                })
              }
              inputProps={{
                min: 0,
                max: 100,
              }}
            />

            <TextField
              fullWidth
              type="number"
              label="Accuracy %"
              value={
                signalForm.accuracyPercent
              }
              onChange={(e) =>
                setSignalForm({
                  ...signalForm,
                  accuracyPercent:
                    e.target.value,
                })
              }
              inputProps={{
                min: 0,
                max: 100,
              }}
            />

            <TextField
              fullWidth
              type="number"
              label="Duration Days"
              value={
                signalForm.durationDays
              }
              onChange={(e) =>
                setSignalForm({
                  ...signalForm,
                  durationDays:
                    e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              type="number"
              label="Price"
              value={
                signalForm.price
              }
              onChange={(e) =>
                setSignalForm({
                  ...signalForm,
                  price:
                    e.target.value,
                })
              }
            />

            <TextField
              fullWidth
              label="Currency"
              value={
                signalForm.currency
              }
              onChange={(e) =>
                setSignalForm({
                  ...signalForm,
                  currency:
                    e.target.value,
                })
              }
            />

            <FormControl fullWidth>
              <InputLabel>
                Status
              </InputLabel>

              <Select
                label="Status"
                value={
                  signalForm.status
                }
                onChange={(e) =>
                  setSignalForm({
                    ...signalForm,
                    status:
                      e.target.value,
                  })
                }
              >
                <MenuItem value="ACTIVE">
                  ACTIVE
                </MenuItem>

                <MenuItem value="INACTIVE">
                  INACTIVE
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setSignalDialogOpen(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              saveSignalPlan
            }
            disabled={signalLoading}
          >
            {signalLoading ? (
              <CircularProgress size={22} />
            ) : (
              'Save Signal Plan'
            )}
          </Button>
        </DialogActions>
      </Dialog>


      {/* ======================================================
          USER SIGNAL DIALOG
      ====================================================== */}

      <Dialog
        open={userSignalDialogOpen}
        onClose={() =>
          setUserSignalDialogOpen(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          Manage User Signal
        </DialogTitle>

        <DialogContent dividers>
          {userSignalLoading ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent:
                  'center',
                py: 5,
              }}
            >
              <CircularProgress />
            </Box>
          ) : (
            <Stack spacing={2}>
              <Alert severity="info">
                User:{' '}
                {userSignalUser?.email ||
                  ''}
              </Alert>

              <FormControl fullWidth>
                <InputLabel>
                  Signal Plan
                </InputLabel>

                <Select
                  label="Signal Plan"
                  value={
                    userSignalPlanId
                  }
                  onChange={(e) =>
                    setUserSignalPlanId(
                      e.target.value
                    )
                  }
                >
                  <MenuItem value="">
                    No Signal Plan
                  </MenuItem>

                  {signalPlans
                    .filter(
                      (plan) =>
                        String(
                          plan.status
                        ).toUpperCase() ===
                        'ACTIVE'
                    )
                    .map((plan) => (
                      <MenuItem
                        key={plan.id}
                        value={String(
                          plan.id
                        )}
                      >
                        {plan.name} —{' '}
                        {plan.strength}%
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>

              <TextField
                fullWidth
                type="number"
                label="Signal Strength"
                value={
                  userSignalStrength
                }
                onChange={(e) =>
                  setUserSignalStrength(
                    e.target.value
                  )
                }
                inputProps={{
                  min: 0,
                  max: 100,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>
                  Signal Status
                </InputLabel>

                <Select
                  label="Signal Status"
                  value={
                    userSignalEnabled
                      ? 'ACTIVE'
                      : 'INACTIVE'
                  }
                  onChange={(e) =>
                    setUserSignalEnabled(
                      e.target.value ===
                        'ACTIVE'
                    )
                  }
                >
                  <MenuItem value="ACTIVE">
                    ACTIVE
                  </MenuItem>

                  <MenuItem value="INACTIVE">
                    INACTIVE
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Signal Note"
                value={
                  userSignalNote
                }
                onChange={(e) =>
                  setUserSignalNote(
                    e.target.value
                  )
                }
              />

              {userSignal && (
                <Alert severity="success">
                  Current signal:{' '}
                  {userSignal.strength}%
                  {' — '}
                  {userSignal.status}
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setUserSignalDialogOpen(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              saveUserSignal
            }
            disabled={userSignalLoading}
          >
            {userSignalLoading ? (
              <CircularProgress size={22} />
            ) : (
              'Save Signal'
            )}
          </Button>
        </DialogActions>
      </Dialog>


      {/* ======================================================
          PAYMENT METHOD DIALOG
      ====================================================== */}

      <Dialog
        open={paymentDialogOpen}
        onClose={() =>
          setPaymentDialogOpen(false)
        }
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingPaymentMethod
            ? 'Edit Payment Method'
            : 'Create Payment Method'}
        </DialogTitle>

        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Name"
                value={
                  paymentForm.name
                }
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    name:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Type"
                value={
                  paymentForm.type
                }
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    type:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Currency"
                value={
                  paymentForm.currency
                }
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    currency:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Bank Name"
                value={
                  paymentForm.bankName
                }
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    bankName:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Name"
                value={
                  paymentForm.accountName
                }
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    accountName:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Number"
                value={
                  paymentForm.accountNumber
                }
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    accountNumber:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Wallet Address"
                value={
                  paymentForm.walletAddress
                }
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    walletAddress:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Details"
                value={
                  paymentForm.details
                }
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    details:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Instructions"
                value={
                  paymentForm.instructions
                }
                onChange={(e) =>
                  setPaymentForm({
                    ...paymentForm,
                    instructions:
                      e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>
                  Status
                </InputLabel>

                <Select
                  label="Status"
                  value={
                    paymentForm.status
                  }
                  onChange={(e) =>
                    setPaymentForm({
                      ...paymentForm,
                      status:
                        e.target.value,
                    })
                  }
                >
                  <MenuItem value="ACTIVE">
                    ACTIVE
                  </MenuItem>

                  <MenuItem value="INACTIVE">
                    INACTIVE
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setPaymentDialogOpen(
                false
              )
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              savePaymentMethod
            }
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <CircularProgress size={22} />
            ) : (
              'Save Payment Method'
            )}
          </Button>
        </DialogActions>
      </Dialog>


      {/* ======================================================
          NOTIFICATIONS
      ====================================================== */}

      <Snackbar
        open={Boolean(success)}
        autoHideDuration={5000}
        onClose={() =>
          setSuccess('')
        }
      >
        <Alert
          severity="success"
          onClose={() =>
            setSuccess('')
          }
        >
          {success}
        </Alert>
      </Snackbar>

    </Box>
  );
};

export default AdminDashboard;
