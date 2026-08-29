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
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Slider,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
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
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import PersonIcon from '@mui/icons-material/Person';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import DashboardIcon from '@mui/icons-material/Dashboard';

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
  activeInvestmentPlans?: number;
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

interface InvestmentPlan {
  id: number;
  name: string;
  description?: string;
  minimumAmount: number;
  maximumAmount: number | null;
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
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

interface UserSignal {
  id: number;
  strength: number;
  enabled: boolean;
  plan?: {
    id: number;
    name: string;
    description?: string;
    strength: number;
    status: string;
  } | null;
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
  const value = String(status || '').toLowerCase();

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
    value === 'rejected' ||
    value === 'disabled'
  ) {
    return 'error';
  }

  return 'default';
};

const formatDate = (value?: string) => {
  if (!value) {
    return 'N/A';
  }

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
};

// ============================================================
// STAT CARD
// ============================================================

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  accent?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  accent = '#5ce8ff',
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        color: '#fff',
        position: 'relative',
        overflow: 'hidden',
        background:
          'linear-gradient(145deg,#111f57,#071238)',
        border:
          '1px solid rgba(112,145,255,0.18)',
        boxShadow:
          '0 15px 40px rgba(0,0,0,0.18)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: 3,
          background: accent,
        }}
      />

      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
        >
          <Box>
            <Typography
              sx={{
                color: '#8297d5',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: 0.8,
                textTransform: 'uppercase',
              }}
            >
              {title}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                fontSize: {
                  xs: 24,
                  md: 29,
                },
                fontWeight: 900,
                letterSpacing: -0.5,
              }}
            >
              {value}
            </Typography>

            {subtitle && (
              <Typography
                sx={{
                  mt: 0.5,
                  color: '#667bb7',
                  fontSize: 11,
                }}
              >
                {subtitle}
              </Typography>
            )}
          </Box>

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: accent,
              background: `${accent}14`,
              border: `1px solid ${accent}22`,
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
// SECTION HEADER
// ============================================================

const SectionHeader = ({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) => (
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
    sx={{ mb: 3 }}
  >
    <Box>
      <Typography
        sx={{
          fontSize: {
            xs: 22,
            md: 26,
          },
          fontWeight: 900,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          sx={{
            color: '#7186c3',
            mt: 0.5,
            fontSize: 13,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>

    {action}
  </Stack>
);

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

  const [investmentPlans, setInvestmentPlans] =
    useState<InvestmentPlan[]>([]);

  const [signalPlans, setSignalPlans] =
    useState<SignalPlan[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [sectionLoading, setSectionLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [tab, setTab] =
    useState(0);

  const [userSearch, setUserSearch] =
    useState('');

  const [transactionSearch, setTransactionSearch] =
    useState('');

  // ----------------------------------------------------------
  // DIALOGS
  // ----------------------------------------------------------

  const [selectedUser, setSelectedUser] =
    useState<AdminUser | null>(null);

  const [selectedTransaction, setSelectedTransaction] =
    useState<AdminTransaction | null>(null);

  const [selectedKyc, setSelectedKyc] =
    useState<KycRequest | null>(null);

  const [userStatusDialog, setUserStatusDialog] =
    useState(false);

  const [transactionDialog, setTransactionDialog] =
    useState(false);

  const [investmentDialog, setInvestmentDialog] =
    useState(false);

  const [signalDialog, setSignalDialog] =
    useState(false);

  const [userSignalDialog, setUserSignalDialog] =
    useState(false);

  // ----------------------------------------------------------
  // FORM STATE
  // ----------------------------------------------------------

  const [newUserStatus, setNewUserStatus] =
    useState('active');

  const [newTransactionStatus, setNewTransactionStatus] =
    useState('PENDING');

  const [adminNote, setAdminNote] =
    useState('');

  const [editingInvestmentPlan, setEditingInvestmentPlan] =
    useState<InvestmentPlan | null>(null);

  const [investmentName, setInvestmentName] =
    useState('');

  const [investmentDescription, setInvestmentDescription] =
    useState('');

  const [investmentMinimum, setInvestmentMinimum] =
    useState('');

  const [investmentMaximum, setInvestmentMaximum] =
    useState('');

  const [investmentRoi, setInvestmentRoi] =
    useState('');

  const [investmentDuration, setInvestmentDuration] =
    useState('');

  const [investmentStatus, setInvestmentStatus] =
    useState('ACTIVE');

  const [editingSignalPlan, setEditingSignalPlan] =
    useState<SignalPlan | null>(null);

  const [signalName, setSignalName] =
    useState('');

  const [signalDescription, setSignalDescription] =
    useState('');

  const [signalStrength, setSignalStrength] =
    useState(50);

  const [signalStatus, setSignalStatus] =
    useState('ACTIVE');

  const [selectedSignalUser, setSelectedSignalUser] =
    useState<AdminUser | null>(null);

  const [userSignal, setUserSignal] =
    useState<UserSignal | null>(null);

  const [selectedSignalPlanId, setSelectedSignalPlanId] =
    useState('');

  const [userSignalStrength, setUserSignalStrength] =
    useState(50);

  const [userSignalEnabled, setUserSignalEnabled] =
    useState(true);

  // ==========================================================
  // NOTIFICATIONS
  // ==========================================================

  const showSuccess = (message: string) => {
    setSuccess(message);

    window.setTimeout(() => {
      setSuccess('');
    }, 5000);
  };

  const showError = (message: string) => {
    setError(message);
  };

  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  const loadDashboard = async () => {
    try {
      const response =
        await apiClient.get('/admin/dashboard');

      setDashboard(
        response.data?.dashboard || null
      );
    } catch (requestError: any) {
      console.error(
        'Admin dashboard error:',
        requestError
      );

      if (
        requestError?.response?.status === 401
      ) {
        showError(
          'Your administrator session has expired. Please login again.'
        );
      } else if (
        requestError?.response?.status === 403
      ) {
        showError(
          'You do not have administrator permission.'
        );
      } else {
        showError(
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
        await apiClient.get('/admin/users');

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
        await apiClient.get('/admin/transactions');

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
        await apiClient.get('/admin/deposits');

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
        await apiClient.get('/admin/withdrawals');

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
        await apiClient.get('/admin/kyc');

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
  // LOAD INVESTMENT PLANS
  // ==========================================================

  const loadInvestmentPlans = async () => {
    try {
      const response =
        await apiClient.get(
          '/admin/investment-plans'
        );

      setInvestmentPlans(
        response.data?.plans || []
      );
    } catch (requestError) {
      console.error(
        'Investment plans error:',
        requestError
      );
    }
  };

  // ==========================================================
  // LOAD SIGNAL PLANS
  // ==========================================================

  const loadSignalPlans = async () => {
    try {
      const response =
        await apiClient.get(
          '/admin/signal-plans'
        );

      setSignalPlans(
        response.data?.plans || []
      );
    } catch (requestError) {
      console.error(
        'Signal plans error:',
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
        loadInvestmentPlans(),
        loadSignalPlans(),
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
  // FILTERED USERS
  // ==========================================================

  const filteredUsers = useMemo(() => {
    const search =
      userSearch.trim().toLowerCase();

    if (!search) {
      return users;
    }

    return users.filter((user) => {
      const fullName =
        `${user.firstName} ${user.lastName}`
          .toLowerCase();

      return (
        fullName.includes(search) ||
        user.email
          ?.toLowerCase()
          .includes(search) ||
        user.username
          ?.toLowerCase()
          .includes(search) ||
        user.phone
          ?.toLowerCase()
          .includes(search) ||
        String(user.id).includes(search)
      );
    });
  }, [users, userSearch]);

  // ==========================================================
  // FILTERED TRANSACTIONS
  // ==========================================================

  const filteredTransactions = useMemo(() => {
    const search =
      transactionSearch
        .trim()
        .toLowerCase();

    if (!search) {
      return transactions;
    }

    return transactions.filter(
      (transaction) => {
        const userName =
          `${transaction.user?.firstName || ''} ${transaction.user?.lastName || ''}`
            .toLowerCase();

        return (
          userName.includes(search) ||
          transaction.user?.email
            ?.toLowerCase()
            .includes(search) ||
          transaction.transactionReference
            ?.toLowerCase()
            .includes(search) ||
          transaction.transactionType
            ?.toLowerCase()
            .includes(search)
        );
      }
    );
  }, [
    transactions,
    transactionSearch,
  ]);

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

      showSuccess(
        'User status updated successfully.'
      );

      await loadUsers();
    } catch (requestError: any) {
      showError(
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

      showSuccess(
        'Transaction status updated successfully.'
      );

      await Promise.all([
        loadDashboard(),
        loadTransactions(),
        loadDeposits(),
        loadWithdrawals(),
        loadUsers(),
      ]);
    } catch (requestError: any) {
      showError(
        requestError?.response?.data?.message ||
          'Unable to update transaction.'
      );
    } finally {
      setSectionLoading(false);
    }
  };

  // ==========================================================
  // INVESTMENT FORM RESET
  // ==========================================================

  const resetInvestmentForm = () => {
    setEditingInvestmentPlan(null);
    setInvestmentName('');
    setInvestmentDescription('');
    setInvestmentMinimum('');
    setInvestmentMaximum('');
    setInvestmentRoi('');
    setInvestmentDuration('');
    setInvestmentStatus('ACTIVE');
  };

  // ==========================================================
  // OPEN CREATE INVESTMENT
  // ==========================================================

  const openCreateInvestment = () => {
    resetInvestmentForm();
    setInvestmentDialog(true);
  };

  // ==========================================================
  // OPEN EDIT INVESTMENT
  // ==========================================================

  const openEditInvestment = (
    plan: InvestmentPlan
  ) => {
    setEditingInvestmentPlan(plan);

    setInvestmentName(plan.name);
    setInvestmentDescription(
      plan.description || ''
    );
    setInvestmentMinimum(
      String(plan.minimumAmount)
    );
    setInvestmentMaximum(
      plan.maximumAmount === null
        ? ''
        : String(plan.maximumAmount)
    );
    setInvestmentRoi(
      String(plan.roiPercent)
    );
    setInvestmentDuration(
      String(plan.durationDays)
    );
    setInvestmentStatus(
      plan.status
    );

    setInvestmentDialog(true);
  };

  // ==========================================================
  // SAVE INVESTMENT
  // ==========================================================

  const saveInvestmentPlan = async () => {
    const minimum =
      Number(investmentMinimum);

    const maximum =
      investmentMaximum === ''
        ? null
        : Number(investmentMaximum);

    const roi =
      Number(investmentRoi);

    const duration =
      Number(investmentDuration);

    if (!investmentName.trim()) {
      showError(
        'Investment plan name is required.'
      );
      return;
    }

    if (
      !Number.isFinite(minimum) ||
      minimum < 0
    ) {
      showError(
        'Enter a valid minimum amount.'
      );
      return;
    }

    if (
      maximum !== null &&
      (!Number.isFinite(maximum) ||
        maximum < minimum)
    ) {
      showError(
        'Maximum amount must be greater than or equal to minimum amount.'
      );
      return;
    }

    if (
      !Number.isFinite(roi) ||
      roi < 0
    ) {
      showError(
        'Enter a valid ROI percentage.'
      );
      return;
    }

    if (
      !Number.isInteger(duration) ||
      duration <= 0
    ) {
      showError(
        'Duration must be a positive number of days.'
      );
      return;
    }

    try {
      setSectionLoading(true);

      const payload = {
        name:
          investmentName.trim(),
        description:
          investmentDescription.trim(),
        minimumAmount: minimum,
        maximumAmount: maximum,
        roiPercent: roi,
        durationDays: duration,
        status:
          investmentStatus,
      };

      if (editingInvestmentPlan) {
        await apiClient.patch(
          `/admin/investment-plans/${editingInvestmentPlan.id}`,
          payload
        );

        showSuccess(
          'Investment plan updated successfully.'
        );
      } else {
        await apiClient.post(
          '/admin/investment-plans',
          payload
        );

        showSuccess(
          'Investment plan created successfully.'
        );
      }

      setInvestmentDialog(false);
      resetInvestmentForm();

      await Promise.all([
        loadInvestmentPlans(),
        loadDashboard(),
      ]);
    } catch (requestError: any) {
      showError(
        requestError?.response?.data?.message ||
          'Unable to save investment plan.'
      );
    } finally {
      setSectionLoading(false);
    }
  };

  // ==========================================================
  // DELETE INVESTMENT
  // ==========================================================

  const deleteInvestmentPlan = async (
    plan: InvestmentPlan
  ) => {
    const confirmed =
      window.confirm(
        `Delete investment plan "${plan.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSectionLoading(true);

      await apiClient.delete(
        `/admin/investment-plans/${plan.id}`
      );

      showSuccess(
        'Investment plan deleted successfully.'
      );

      await loadInvestmentPlans();
    } catch (requestError: any) {
      showError(
        requestError?.response?.data?.message ||
          'Unable to delete investment plan.'
      );
    } finally {
      setSectionLoading(false);
    }
  };

  // ==========================================================
  // RESET SIGNAL FORM
  // ==========================================================

  const resetSignalForm = () => {
    setEditingSignalPlan(null);
    setSignalName('');
    setSignalDescription('');
    setSignalStrength(50);
    setSignalStatus('ACTIVE');
  };

  // ==========================================================
  // OPEN CREATE SIGNAL
  // ==========================================================

  const openCreateSignal = () => {
    resetSignalForm();
    setSignalDialog(true);
  };

  // ==========================================================
  // OPEN EDIT SIGNAL
  // ==========================================================

  const openEditSignal = (
    plan: SignalPlan
  ) => {
    setEditingSignalPlan(plan);

    setSignalName(plan.name);
    setSignalDescription(
      plan.description || ''
    );
    setSignalStrength(
      Number(plan.strength) || 50
    );
    setSignalStatus(
      plan.status || 'ACTIVE'
    );

    setSignalDialog(true);
  };

  // ==========================================================
  // SAVE SIGNAL PLAN
  // ==========================================================

  const saveSignalPlan = async () => {
    if (!signalName.trim()) {
      showError(
        'Signal plan name is required.'
      );
      return;
    }

    try {
      setSectionLoading(true);

      const payload = {
        name:
          signalName.trim(),
        description:
          signalDescription.trim(),
        strength:
          signalStrength,
        status:
          signalStatus,
      };

      if (editingSignalPlan) {
        await apiClient.patch(
          `/admin/signal-plans/${editingSignalPlan.id}`,
          payload
        );

        showSuccess(
          'Signal plan updated successfully.'
        );
      } else {
        await apiClient.post(
          '/admin/signal-plans',
          payload
        );

        showSuccess(
          'Signal plan created successfully.'
        );
      }

      setSignalDialog(false);
      resetSignalForm();

      await loadSignalPlans();
    } catch (requestError: any) {
      showError(
        requestError?.response?.data?.message ||
          'Unable to save signal plan.'
      );
    } finally {
      setSectionLoading(false);
    }
  };

  // ==========================================================
  // DELETE SIGNAL
  // ==========================================================

  const deleteSignalPlan = async (
    plan: SignalPlan
  ) => {
    const confirmed =
      window.confirm(
        `Delete signal plan "${plan.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setSectionLoading(true);

      await apiClient.delete(
        `/admin/signal-plans/${plan.id}`
      );

      showSuccess(
        'Signal plan deleted successfully.'
      );

      await loadSignalPlans();
    } catch (requestError: any) {
      showError(
        requestError?.response?.data?.message ||
          'Unable to delete signal plan.'
      );
    } finally {
      setSectionLoading(false);
    }
  };

  // ==========================================================
  // OPEN USER SIGNAL
  // ==========================================================

  const openUserSignal = async (
    user: AdminUser
  ) => {
    try {
      setSelectedSignalUser(user);
      setUserSignal(null);
      setUserSignalDialog(true);

      const response =
        await apiClient.get(
          `/admin/users/${user.id}/signal`
        );

      const signal =
        response.data?.signal || null;

      setUserSignal(signal);

      setSelectedSignalPlanId(
        signal?.plan?.id
          ? String(signal.plan.id)
          : ''
      );

      setUserSignalStrength(
        Number(signal?.strength) || 50
      );

      setUserSignalEnabled(
        signal?.enabled ?? true
      );
    } catch (requestError: any) {
      showError(
        requestError?.response?.data?.message ||
          'Unable to load user signal.'
      );
    }
  };

  // ==========================================================
  // SAVE USER SIGNAL
  // ==========================================================

  const saveUserSignal = async () => {
    if (!selectedSignalUser) {
      return;
    }

    try {
      setSectionLoading(true);

      await apiClient.patch(
        `/admin/users/${selectedSignalUser.id}/signal`,
        {
          signalPlanId:
            selectedSignalPlanId || null,
          strength:
            userSignalStrength,
          enabled:
            userSignalEnabled,
        }
      );

      showSuccess(
        'User signal updated successfully.'
      );

      setUserSignalDialog(false);

      setSelectedSignalUser(null);

      await loadSignalPlans();
    } catch (requestError: any) {
      showError(
        requestError?.response?.data?.message ||
          'Unable to update user signal.'
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
      'accessToken'
    );

    localStorage.removeItem(
      'token'
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
          borderRadius: 4,
          background:
            'linear-gradient(145deg,#111f57,#071238)',
          color: '#fff',
          border:
            '1px solid rgba(100,150,255,0.16)',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction={{
              xs: 'column',
              lg: 'row',
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'rgba(92,232,255,0.10)',
                  color: '#5ce8ff',
                  fontWeight: 900,
                }}
              >
                {(
                  user.firstName?.[0] ||
                  'U'
                ).toUpperCase()}
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontWeight: 900,
                    fontSize: 17,
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
                    color: '#6379b8',
                    fontSize: 11,
                    mt: 0.5,
                  }}
                >
                  ID #{user.id}
                  {user.username
                    ? ` • @${user.username}`
                    : ''}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
            >
              <Chip
                label={
                  user.status ||
                  'UNKNOWN'
                }
                color={statusColor(
                  user.status
                )}
                size="small"
              />

              <Button
                size="small"
                startIcon={
                  <SignalCellularAltIcon />
                }
                onClick={() =>
                  openUserSignal(user)
                }
                sx={{
                  color: '#b18cff',
                  textTransform:
                    'none',
                  fontWeight: 700,
                }}
              >
                Signal
              </Button>

              <Button
                size="small"
                startIcon={
                  <VisibilityIcon />
                }
                onClick={() =>
                  setSelectedUser(user)
                }
                sx={{
                  color: '#5ce8ff',
                  textTransform:
                    'none',
                  fontWeight: 700,
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
                  setSelectedUser(user);

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
                  fontWeight: 700,
                }}
              >
                Status
              </Button>
            </Stack>
          </Stack>

          <Divider
            sx={{
              my: 2,
              borderColor:
                'rgba(255,255,255,0.07)',
            }}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Typography
                sx={{
                  color: '#6379b8',
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                ACCOUNT
              </Typography>

              <Typography
                sx={{
                  fontWeight: 800,
                  mt: 0.4,
                }}
              >
                {user.account
                  ?.accountNumber ||
                  'No account'}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography
                sx={{
                  color: '#6379b8',
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                BALANCE
              </Typography>

              <Typography
                sx={{
                  fontWeight: 800,
                  mt: 0.4,
                }}
              >
                {money(
                  Number(
                    user.account?.balance
                  ) || 0,
                  user.account
                    ?.currency ||
                    'USD'
                )}
              </Typography>
            </Grid>

            <Grid item xs={12} sm={4}>
              <Typography
                sx={{
                  color: '#6379b8',
                  fontSize: 10,
                  fontWeight: 800,
                }}
              >
                VERIFICATION
              </Typography>

              <Typography
                sx={{
                  fontWeight: 800,
                  mt: 0.4,
                }}
              >
                {user.emailVerified
                  ? 'Email verified'
                  : 'Email pending'}
              </Typography>
            </Grid>
          </Grid>
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
    const isDeposit =
      transaction.transactionType ===
      'DEPOSIT';

    return (
      <Card
        sx={{
          mb: 2,
          borderRadius: 4,
          background:
            'linear-gradient(145deg,#111f57,#071238)',
          color: '#fff',
          border:
            '1px solid rgba(100,150,255,0.16)',
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Stack
            direction={{
              xs: 'column',
              lg: 'row',
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDeposit
                    ? '#48e0a4'
                    : '#ff8297',
                  background: isDeposit
                    ? 'rgba(72,224,164,0.10)'
                    : 'rgba(255,130,151,0.10)',
                }}
              >
                {isDeposit ? (
                  <AddCircleOutlineIcon />
                ) : (
                  <RemoveCircleOutlineIcon />
                )}
              </Box>

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
                    color: '#6379b8',
                    fontSize: 11,
                  }}
                >
                  {transaction.transactionReference ||
                    `Transaction #${transaction.id}`}
                </Typography>
              </Box>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
            >
              <Box
                sx={{
                  textAlign: {
                    xs: 'left',
                    sm: 'right',
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

              <IconButton
                onClick={() =>
                  setSelectedTransaction(
                    transaction
                  )
                }
                sx={{
                  color: '#5ce8ff',
                  background:
                    'rgba(92,232,255,0.06)',
                }}
              >
                <VisibilityIcon />
              </IconButton>

              <IconButton
                onClick={() => {
                  setSelectedTransaction(
                    transaction
                  );

                  setNewTransactionStatus(
                    transaction.status ||
                      'PENDING'
                  );

                  setAdminNote(
                    transaction.adminNote ||
                      ''
                  );

                  setTransactionDialog(
                    true
                  );
                }}
                sx={{
                  color: '#48e0a4',
                  background:
                    'rgba(72,224,164,0.06)',
                }}
              >
                <SettingsIcon />
              </IconButton>
            </Stack>
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
        <Stack
          spacing={2}
          alignItems="center"
        >
          <CircularProgress
            sx={{
              color: '#5ce8ff',
            }}
          />

          <Typography
            sx={{
              color: '#7186c3',
              fontSize: 13,
            }}
          >
            Loading administration console...
          </Typography>
        </Stack>
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
          'radial-gradient(circle at 90% 0%, rgba(34,90,210,0.28), transparent 28%), radial-gradient(circle at 0% 40%, rgba(77,61,190,0.18), transparent 25%), linear-gradient(180deg,#02071f 0%,#050d2c 48%,#071443 100%)',
        pb: 8,
      }}
    >
      {/* ======================================================
          TOP NAVIGATION
      ====================================================== */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          background:
            'rgba(2,7,31,0.94)',
          backdropFilter:
            'blur(18px)',
          borderBottom:
            '1px solid rgba(125,150,255,0.14)',
        }}
      >
        <Container maxWidth="xl">
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            sx={{
              py: 1.5,
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                flexGrow: 1,
              }}
            >
              <Box
                sx={{
                  width: 42,
                  height: 42,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'linear-gradient(135deg,#36d9ff,#5367ff)',
                  color: '#fff',
                  boxShadow:
                    '0 8px 25px rgba(62,126,255,0.30)',
                }}
              >
                <SecurityIcon />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: 17,
                      md: 21,
                    },
                    fontWeight: 900,
                    lineHeight: 1,
                  }}
                >
                  Global Digital Market
                </Typography>

                <Typography
                  sx={{
                    color: '#6379b8',
                    fontSize: 9,
                    letterSpacing: 1.5,
                    mt: 0.5,
                  }}
                >
                  ADMINISTRATION CONSOLE
                </Typography>
              </Box>
            </Stack>

            <Tooltip title="Refresh">
              <span>
                <IconButton
                  onClick={() =>
                    loadAllData()
                  }
                  disabled={
                    sectionLoading
                  }
                  sx={{
                    color: '#5ce8ff',
                    background:
                      'rgba(92,232,255,0.06)',
                  }}
                >
                  <RefreshIcon />
                </IconButton>
              </span>
            </Tooltip>

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
          MAIN
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
        {/* PAGE TITLE */}

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
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <DashboardIcon
                sx={{
                  color: '#5ce8ff',
                }}
              />

              <Typography
                sx={{
                  color: '#5ce8ff',
                  fontSize: 12,
                  fontWeight: 800,
                  letterSpacing: 1,
                  textTransform:
                    'uppercase',
                }}
              >
                Control Center
              </Typography>
            </Stack>

            <Typography
              sx={{
                fontSize: {
                  xs: 30,
                  md: 42,
                },
                fontWeight: 950,
                letterSpacing: -1,
                mt: 0.5,
              }}
            >
              Administration
            </Typography>

            <Typography
              sx={{
                color: '#8094cf',
                maxWidth: 700,
                fontSize: 14,
              }}
            >
              Monitor your platform,
              manage customers,
              control transactions,
              configure investment products
              and manage trading signals.
            </Typography>
          </Box>

          <Chip
            icon={
              <VerifiedUserIcon />
            }
            label="Administrator"
            color="success"
            sx={{
              fontWeight: 800,
              px: 1,
            }}
          />
        </Stack>

        {/* NOTIFICATIONS */}

        {error && (
          <Alert
            severity="error"
            onClose={() =>
              setError('')
            }
            sx={{
              mb: 2,
              borderRadius: 3,
            }}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            onClose={() =>
              setSuccess('')
            }
            sx={{
              mb: 2,
              borderRadius: 3,
            }}
          >
            {success}
          </Alert>
        )}

        {/* ====================================================
            OVERVIEW STATISTICS
        ==================================================== */}

        {dashboard && (
          <>
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 900,
                mb: 2,
                color: '#9db0e7',
              }}
            >
              Platform Overview
            </Typography>

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
                  subtitle="Registered customers"
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
                  subtitle="Currently active"
                  icon={
                    <VerifiedUserIcon />
                  }
                  accent="#48e0a4"
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
                  subtitle="Trading accounts"
                  icon={
                    <AccountBalanceIcon />
                  }
                  accent="#8d7cff"
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
                  subtitle="All platform activity"
                  icon={
                    <ReceiptLongIcon />
                  }
                  accent="#ffb86b"
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
                sm={6}
                md={3}
              >
                <StatCard
                  title="Platform Balance"
                  value={money(
                    dashboard.totalAccountBalance
                  )}
                  subtitle="Combined account balance"
                  icon={
                    <MonetizationOnIcon />
                  }
                  accent="#5ce8ff"
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >
                <StatCard
                  title="Deposits"
                  value={money(
                    dashboard.completedDeposits
                  )}
                  subtitle={`${dashboard.pendingDeposits} pending`}
                  icon={
                    <AddCircleOutlineIcon />
                  }
                  accent="#48e0a4"
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >
                <StatCard
                  title="Withdrawals"
                  value={money(
                    dashboard.completedWithdrawals
                  )}
                  subtitle={`${dashboard.pendingWithdrawals} pending`}
                  icon={
                    <RemoveCircleOutlineIcon />
                  }
                  accent="#ff8297"
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={6}
                md={3}
              >
                <StatCard
                  title="Pending Review"
                  value={String(
                    dashboard.pendingTransactions +
                      dashboard.pendingKyc
                  )}
                  subtitle={`${dashboard.pendingKyc} KYC requests`}
                  icon={
                    <PendingActionsIcon />
                  }
                  accent="#ffb86b"
                />
              </Grid>
            </Grid>
          </>
        )}

        {/* ====================================================
            MANAGEMENT CENTER
        ==================================================== */}

        <Paper
          elevation={0}
          sx={{
            borderRadius: 5,
            overflow: 'hidden',
            background:
              'linear-gradient(145deg,rgba(13,28,78,0.98),rgba(5,13,43,0.98))',
            border:
              '1px solid rgba(100,150,255,0.16)',
            boxShadow:
              '0 25px 80px rgba(0,0,0,0.20)',
          }}
        >
          {/* TABS */}

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
              px: 1,
              borderBottom:
                '1px solid rgba(255,255,255,0.07)',

              '& .MuiTab-root': {
                minHeight: 66,
                color: '#7186c3',
                fontWeight: 800,
                textTransform:
                  'none',
                fontSize: 12,
              },

              '& .Mui-selected': {
                color:
                  '#5ce8ff !important',
              },

              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 3,
                backgroundColor:
                  '#5ce8ff',
              },
            }}
          >
            <Tab
              icon={<PeopleIcon />}
              iconPosition="start"
              label={`Users ${users.length}`}
            />

            <Tab
              icon={
                <AddCircleOutlineIcon />
              }
              iconPosition="start"
              label={`Deposits ${deposits.length}`}
            />

            <Tab
              icon={
                <RemoveCircleOutlineIcon />
              }
              iconPosition="start"
              label={`Withdrawals ${withdrawals.length}`}
            />

            <Tab
              icon={
                <ReceiptLongIcon />
              }
              iconPosition="start"
              label={`Transactions ${transactions.length}`}
            />

            <Tab
              icon={
                <VerifiedUserIcon />
              }
              iconPosition="start"
              label={`KYC ${kycRequests.length}`}
            />

            <Tab
              icon={
                <TrendingUpIcon />
              }
              iconPosition="start"
              label={`Investments ${investmentPlans.length}`}
            />

            <Tab
              icon={
                <SignalCellularAltIcon />
              }
              iconPosition="start"
              label={`Signals ${signalPlans.length}`}
            />
          </Tabs>

          <CardContent
            sx={{
              p: {
                xs: 2,
                md: 3,
              },
            }}
          >
            {/* ==================================================
                USERS
            ================================================== */}

            {tab === 0 && (
              <>
                <SectionHeader
                  title="User Management"
                  description="Search, inspect and control customer accounts."
                />

                <TextField
                  fullWidth
                  value={userSearch}
                  onChange={(event) =>
                    setUserSearch(
                      event.target.value
                    )
                  }
                  placeholder="Search by name, email, username, phone or ID..."
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      borderRadius: 3,
                      background:
                        'rgba(2,7,31,0.55)',
                    },
                    '& fieldset': {
                      borderColor:
                        'rgba(125,150,255,0.16)',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{
                            color:
                              '#7186c3',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                {filteredUsers.length ===
                0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 3,
                    }}
                  >
                    No users found.
                  </Alert>
                ) : (
                  filteredUsers.map(
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
                <SectionHeader
                  title="Deposit Management"
                  description="Review and process customer deposits."
                />

                {deposits.length ===
                0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 3,
                    }}
                  >
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
                <SectionHeader
                  title="Withdrawal Management"
                  description="Review and process customer withdrawal requests."
                />

                {withdrawals.length ===
                0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 3,
                    }}
                  >
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
                <SectionHeader
                  title="Transaction Center"
                  description="Review all financial activity across the platform."
                />

                <TextField
                  fullWidth
                  value={
                    transactionSearch
                  }
                  onChange={(
                    event
                  ) =>
                    setTransactionSearch(
                      event.target
                        .value
                    )
                  }
                  placeholder="Search transaction, reference, user or email..."
                  sx={{
                    mb: 3,
                    '& .MuiOutlinedInput-root': {
                      color: '#fff',
                      borderRadius: 3,
                      background:
                        'rgba(2,7,31,0.55)',
                    },
                    '& fieldset': {
                      borderColor:
                        'rgba(125,150,255,0.16)',
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon
                          sx={{
                            color:
                              '#7186c3',
                          }}
                        />
                      </InputAdornment>
                    ),
                  }}
                />

                {filteredTransactions.length ===
                0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 3,
                    }}
                  >
                    No transactions found.
                  </Alert>
                ) : (
                  filteredTransactions.map(
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
                <SectionHeader
                  title="KYC Verification"
                  description="Review submitted identity verification requests."
                />

                {kycRequests.length ===
                0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 3,
                    }}
                  >
                    No KYC requests found.
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
                          borderRadius: 4,
                          background:
                            'rgba(8,19,59,0.88)',
                          color: '#fff',
                          border:
                            '1px solid rgba(100,150,255,0.15)',
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
                            <Stack
                              direction="row"
                              spacing={2}
                              alignItems="center"
                            >
                              <Box
                                sx={{
                                  width: 45,
                                  height: 45,
                                  borderRadius: 3,
                                  display:
                                    'flex',
                                  alignItems:
                                    'center',
                                  justifyContent:
                                    'center',
                                  color:
                                    '#b18cff',
                                  background:
                                    'rgba(177,140,255,0.10)',
                                }}
                              >
                                <VerifiedUserIcon />
                              </Box>

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
                                      '#6379b8',
                                    fontSize:
                                      11,
                                    mt: 0.5,
                                  }}
                                >
                                  {request.documentType ||
                                    'Identity document'}{' '}
                                  •{' '}
                                  {request.documentNumber ||
                                    'N/A'}
                                </Typography>
                              </Box>
                            </Stack>

                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Chip
                                label={
                                  request.status ||
                                  'UNKNOWN'
                                }
                                color={statusColor(
                                  request.status
                                )}
                                size="small"
                              />

                              <Button
                                startIcon={
                                  <VisibilityIcon />
                                }
                                onClick={() =>
                                  setSelectedKyc(
                                    request
                                  )
                                }
                                sx={{
                                  color:
                                    '#5ce8ff',
                                  textTransform:
                                    'none',
                                  fontWeight:
                                    800,
                                }}
                              >
                                Review
                              </Button>
                            </Stack>
                          </Stack>
                        </CardContent>
                      </Card>
                    )
                  )
                )}
              </>
            )}

            {/* ==================================================
                INVESTMENT PLANS
            ================================================== */}

            {tab === 5 && (
              <>
                <SectionHeader
                  title="Investment Plans"
                  description="Create and manage investment products available to customers."
                  action={
                    <Button
                      variant="contained"
                      startIcon={
                        <AddIcon />
                      }
                      onClick={
                        openCreateInvestment
                      }
                      sx={{
                        borderRadius: 3,
                        textTransform:
                          'none',
                        fontWeight: 900,
                        background:
                          'linear-gradient(135deg,#3edbff,#4e63ff)',
                      }}
                    >
                      New Investment Plan
                    </Button>
                  }
                />

                {investmentPlans.length ===
                0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 3,
                    }}
                  >
                    No investment plans found.
                  </Alert>
                ) : (
                  <Grid
                    container
                    spacing={2}
                  >
                    {investmentPlans.map(
                      (plan) => (
                        <Grid
                          item
                          xs={12}
                          md={6}
                          lg={4}
                          key={plan.id}
                        >
                          <Card
                            sx={{
                              height:
                                '100%',
                              borderRadius: 4,
                              background:
                                'linear-gradient(145deg,#142563,#08133c)',
                              color:
                                '#fff',
                              border:
                                '1px solid rgba(100,150,255,0.16)',
                            }}
                          >
                            <CardContent>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                              >
                                <Box>
                                  <Typography
                                    sx={{
                                      fontSize:
                                        19,
                                      fontWeight:
                                        900,
                                    }}
                                  >
                                    {plan.name}
                                  </Typography>

                                  <Typography
                                    sx={{
                                      color:
                                        '#7186c3',
                                      fontSize:
                                        12,
                                      mt: 0.5,
                                    }}
                                  >
                                    {plan.description ||
                                      'No description'}
                                  </Typography>
                                </Box>

                                <Chip
                                  label={
                                    plan.status
                                  }
                                  color={statusColor(
                                    plan.status
                                  )}
                                  size="small"
                                />
                              </Stack>

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
                                  xs={6}
                                >
                                  <Typography
                                    sx={{
                                      color:
                                        '#6379b8',
                                      fontSize:
                                        10,
                                    }}
                                  >
                                    MINIMUM
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontWeight:
                                        900,
                                    }}
                                  >
                                    {money(
                                      plan.minimumAmount
                                    )}
                                  </Typography>
                                </Grid>

                                <Grid
                                  item
                                  xs={6}
                                >
                                  <Typography
                                    sx={{
                                      color:
                                        '#6379b8',
                                      fontSize:
                                        10,
                                    }}
                                  >
                                    MAXIMUM
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontWeight:
                                        900,
                                    }}
                                  >
                                    {plan.maximumAmount ===
                                    null
                                      ? 'Unlimited'
                                      : money(
                                          plan.maximumAmount
                                        )}
                                  </Typography>
                                </Grid>

                                <Grid
                                  item
                                  xs={6}
                                >
                                  <Typography
                                    sx={{
                                      color:
                                        '#6379b8',
                                      fontSize:
                                        10,
                                    }}
                                  >
                                    ROI
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontSize:
                                        20,
                                      fontWeight:
                                        900,
                                      color:
                                        '#48e0a4',
                                    }}
                                  >
                                    {plan.roiPercent}%
                                  </Typography>
                                </Grid>

                                <Grid
                                  item
                                  xs={6}
                                >
                                  <Typography
                                    sx={{
                                      color:
                                        '#6379b8',
                                      fontSize:
                                        10,
                                    }}
                                  >
                                    DURATION
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontWeight:
                                        900,
                                    }}
                                  >
                                    {plan.durationDays}{' '}
                                    days
                                  </Typography>
                                </Grid>
                              </Grid>

                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                  mt: 3,
                                }}
                              >
                                <Button
                                  fullWidth
                                  startIcon={
                                    <EditIcon />
                                  }
                                  onClick={() =>
                                    openEditInvestment(
                                      plan
                                    )
                                  }
                                  sx={{
                                    color:
                                      '#5ce8ff',
                                    textTransform:
                                      'none',
                                  }}
                                >
                                  Edit
                                </Button>

                                <Button
                                  fullWidth
                                  startIcon={
                                    <DeleteIcon />
                                  }
                                  onClick={() =>
                                    deleteInvestmentPlan(
                                      plan
                                    )
                                  }
                                  sx={{
                                    color:
                                      '#ff8297',
                                    textTransform:
                                      'none',
                                  }}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      )
                    )}
                  </Grid>
                )}
              </>
            )}

            {/* ==================================================
                SIGNAL MANAGEMENT
            ================================================== */}

            {tab === 6 && (
              <>
                <SectionHeader
                  title="Trading Signal Center"
                  description="Create signal plans and manage signal configurations."
                  action={
                    <Button
                      variant="contained"
                      startIcon={
                        <AddIcon />
                      }
                      onClick={
                        openCreateSignal
                      }
                      sx={{
                        borderRadius: 3,
                        textTransform:
                          'none',
                        fontWeight: 900,
                        background:
                          'linear-gradient(135deg,#9d7cff,#5367ff)',
                      }}
                    >
                      New Signal Plan
                    </Button>
                  }
                />

                <Alert
                  severity="info"
                  sx={{
                    mb: 3,
                    borderRadius: 3,
                  }}
                >
                  Signal plans can be assigned
                  to individual users from the
                  Users section.
                </Alert>

                {signalPlans.length ===
                0 ? (
                  <Alert
                    severity="info"
                    sx={{
                      borderRadius: 3,
                    }}
                  >
                    No signal plans found.
                  </Alert>
                ) : (
                  <Grid
                    container
                    spacing={2}
                  >
                    {signalPlans.map(
                      (plan) => (
                        <Grid
                          item
                          xs={12}
                          md={6}
                          lg={4}
                          key={plan.id}
                        >
                          <Card
                            sx={{
                              height:
                                '100%',
                              borderRadius: 4,
                              background:
                                'linear-gradient(145deg,#191d61,#0b1037)',
                              color:
                                '#fff',
                              border:
                                '1px solid rgba(151,122,255,0.20)',
                              overflow:
                                'hidden',
                            }}
                          >
                            <CardContent>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="flex-start"
                              >
                                <Stack
                                  direction="row"
                                  spacing={1.5}
                                  alignItems="center"
                                >
                                  <Box
                                    sx={{
                                      width:
                                        45,
                                      height:
                                        45,
                                      borderRadius:
                                        3,
                                      display:
                                        'flex',
                                      alignItems:
                                        'center',
                                      justifyContent:
                                        'center',
                                      color:
                                        '#b18cff',
                                      background:
                                        'rgba(177,140,255,0.10)',
                                    }}
                                  >
                                    <SignalCellularAltIcon />
                                  </Box>

                                  <Box>
                                    <Typography
                                      sx={{
                                        fontWeight:
                                          900,
                                        fontSize:
                                          18,
                                      }}
                                    >
                                      {plan.name}
                                    </Typography>

                                    <Typography
                                      sx={{
                                        color:
                                          '#6379b8',
                                        fontSize:
                                          11,
                                      }}
                                    >
                                      Signal Plan #
                                      {plan.id}
                                    </Typography>
                                  </Box>
                                </Stack>

                                <Chip
                                  label={
                                    plan.status
                                  }
                                  color={statusColor(
                                    plan.status
                                  )}
                                  size="small"
                                />
                              </Stack>

                              <Typography
                                sx={{
                                  color:
                                    '#7d91ca',
                                  fontSize:
                                    12,
                                  mt: 2,
                                  minHeight:
                                    38,
                                }}
                              >
                                {plan.description ||
                                  'No description'}
                              </Typography>

                              <Box sx={{ mt: 2 }}>
                                <Stack
                                  direction="row"
                                  justifyContent="space-between"
                                  sx={{
                                    mb: 0.5,
                                  }}
                                >
                                  <Typography
                                    sx={{
                                      color:
                                        '#7186c3',
                                      fontSize:
                                        11,
                                    }}
                                  >
                                    Signal Strength
                                  </Typography>

                                  <Typography
                                    sx={{
                                      fontWeight:
                                        900,
                                      color:
                                        '#b18cff',
                                    }}
                                  >
                                    {plan.strength}%
                                  </Typography>
                                </Stack>

                                <Box
                                  sx={{
                                    height:
                                      8,
                                    borderRadius:
                                      5,
                                    overflow:
                                      'hidden',
                                    background:
                                      'rgba(255,255,255,0.08)',
                                  }}
                                >
                                  <Box
                                    sx={{
                                      width: `${Math.max(0, Math.min(100, Number(plan.strength) || 0))}%`,
                                      height:
                                        '100%',
                                      background:
                                        'linear-gradient(90deg,#9d7cff,#5ce8ff)',
                                    }}
                                  />
                                </Box>
                              </Box>

                              <Stack
                                direction="row"
                                spacing={1}
                                sx={{
                                  mt: 3,
                                }}
                              >
                                <Button
                                  fullWidth
                                  startIcon={
                                    <EditIcon />
                                  }
                                  onClick={() =>
                                    openEditSignal(
                                      plan
                                    )
                                  }
                                  sx={{
                                    color:
                                      '#5ce8ff',
                                    textTransform:
                                      'none',
                                  }}
                                >
                                  Edit
                                </Button>

                                <Button
                                  fullWidth
                                  startIcon={
                                    <DeleteIcon />
                                  }
                                  onClick={() =>
                                    deleteSignalPlan(
                                      plan
                                    )
                                  }
                                  sx={{
                                    color:
                                      '#ff8297',
                                    textTransform:
                                      'none',
                                  }}
                                >
                                  Delete
                                </Button>
                              </Stack>
                            </CardContent>
                          </Card>
                        </Grid>
                      )
                    )}
                  </Grid>
                )}
              </>
            )}
          </CardContent>
        </Paper>
      </Container>

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
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <span>User Details</span>

            <IconButton
              onClick={() =>
                setSelectedUser(null)
              }
            >
              <CloseIcon />
            </IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {selectedUser && (
            <Stack
              spacing={1.5}
              sx={{ mt: 1 }}
            >
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

              <Typography>
                <strong>KYC status:</strong>{' '}
                {selectedUser.identityVerificationStatus ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Created:</strong>{' '}
                {formatDate(
                  selectedUser.createdAt
                )}
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
                    <strong>Account Type:</strong>{' '}
                    {selectedUser
                      .account
                      .accountType ||
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
          USER STATUS DIALOG
      ======================================================== */}

      <Dialog
        open={userStatusDialog}
        onClose={() =>
          setUserStatusDialog(false)
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
            sx={{ mt: 1 }}
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
              setUserStatusDialog(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              updateUserStatus
            }
            disabled={sectionLoading}
          >
            {sectionLoading
              ? 'Saving...'
              : 'Save Status'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================
          TRANSACTION DETAILS
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
            <Stack
              spacing={1.5}
              sx={{ mt: 1 }}
            >
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
                <strong>Created:</strong>{' '}
                {formatDate(
                  selectedTransaction.createdAt
                )}
              </Typography>

              <Typography>
                <strong>Admin note:</strong>{' '}
                {selectedTransaction
                  .adminNote ||
                  'None'}
              </Typography>

              {selectedTransaction.proofOfPaymentUrl && (
                <Button
                  variant="outlined"
                  startIcon={
                    <OpenInNewIcon />
                  }
                  component="a"
                  href={
                    selectedTransaction.proofOfPaymentUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    alignSelf:
                      'flex-start',
                    textTransform:
                      'none',
                  }}
                >
                  Open Proof of Payment
                </Button>
              )}
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

      {/* ========================================================
          TRANSACTION STATUS DIALOG
      ======================================================== */}

      <Dialog
        open={transactionDialog}
        onClose={() =>
          setTransactionDialog(false)
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
            sx={{ mt: 1 }}
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
            minRows={4}
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
              setTransactionDialog(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              updateTransactionStatus
            }
            disabled={sectionLoading}
          >
            {sectionLoading
              ? 'Saving...'
              : 'Update Transaction'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================
          KYC REVIEW
      ======================================================== */}

      <Dialog
        open={Boolean(selectedKyc)}
        onClose={() =>
          setSelectedKyc(null)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          KYC Review
        </DialogTitle>

        <DialogContent>
          {selectedKyc && (
            <Stack
              spacing={1.5}
              sx={{ mt: 1 }}
            >
              <Typography
                sx={{
                  fontSize: 20,
                  fontWeight: 900,
                }}
              >
                {selectedKyc.user
                  ?.firstName || ''}{' '}
                {selectedKyc.user
                  ?.lastName || ''}
              </Typography>

              <Typography>
                <strong>Email:</strong>{' '}
                {selectedKyc.user
                  ?.email ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Country:</strong>{' '}
                {selectedKyc.user
                  ?.country ||
                  'N/A'}
              </Typography>

              <Divider />

              <Typography>
                <strong>Document type:</strong>{' '}
                {selectedKyc.documentType ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Document number:</strong>{' '}
                {selectedKyc.documentNumber ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Status:</strong>{' '}
                {selectedKyc.status ||
                  'N/A'}
              </Typography>

              <Typography>
                <strong>Submitted:</strong>{' '}
                {formatDate(
                  selectedKyc.createdAt
                )}
              </Typography>

              {selectedKyc.documentUrl && (
                <Button
                  variant="outlined"
                  startIcon={
                    <OpenInNewIcon />
                  }
                  component="a"
                  href={
                    selectedKyc.documentUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{
                    alignSelf:
                      'flex-start',
                    textTransform:
                      'none',
                  }}
                >
                  Open Identity Document
                </Button>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setSelectedKyc(null)
            }
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================
          INVESTMENT PLAN DIALOG
      ======================================================== */}

      <Dialog
        open={investmentDialog}
        onClose={() =>
          setInvestmentDialog(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingInvestmentPlan
            ? 'Edit Investment Plan'
            : 'Create Investment Plan'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Plan Name"
              value={investmentName}
              onChange={(event) =>
                setInvestmentName(
                  event.target.value
                )
              }
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={
                investmentDescription
              }
              onChange={(event) =>
                setInvestmentDescription(
                  event.target.value
                )
              }
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Minimum Amount"
                  value={
                    investmentMinimum
                  }
                  onChange={(event) =>
                    setInvestmentMinimum(
                      event.target.value
                    )
                  }
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        $
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Maximum Amount"
                  value={
                    investmentMaximum
                  }
                  onChange={(event) =>
                    setInvestmentMaximum(
                      event.target.value
                    )
                  }
                  placeholder="Leave blank for unlimited"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        $
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="ROI Percentage"
                  value={investmentRoi}
                  onChange={(event) =>
                    setInvestmentRoi(
                      event.target.value
                    )
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        %
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="number"
                  label="Duration"
                  value={
                    investmentDuration
                  }
                  onChange={(event) =>
                    setInvestmentDuration(
                      event.target.value
                    )
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        days
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <TextField
              select
              fullWidth
              label="Plan Status"
              value={
                investmentStatus
              }
              onChange={(event) =>
                setInvestmentStatus(
                  event.target.value
                )
              }
            >
              <MenuItem value="ACTIVE">
                Active
              </MenuItem>

              <MenuItem value="INACTIVE">
                Inactive
              </MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setInvestmentDialog(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              saveInvestmentPlan
            }
            disabled={sectionLoading}
          >
            {sectionLoading
              ? 'Saving...'
              : editingInvestmentPlan
              ? 'Save Changes'
              : 'Create Plan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================
          SIGNAL PLAN DIALOG
      ======================================================== */}

      <Dialog
        open={signalDialog}
        onClose={() =>
          setSignalDialog(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {editingSignalPlan
            ? 'Edit Signal Plan'
            : 'Create Signal Plan'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              fullWidth
              label="Signal Plan Name"
              value={signalName}
              onChange={(event) =>
                setSignalName(
                  event.target.value
                )
              }
              placeholder="Example: Premium Signals"
            />

            <TextField
              fullWidth
              multiline
              minRows={3}
              label="Description"
              value={signalDescription}
              onChange={(event) =>
                setSignalDescription(
                  event.target.value
                )
              }
            />

            <Box>
              <Stack
                direction="row"
                justifyContent="space-between"
              >
                <Typography
                  sx={{
                    fontWeight: 800,
                  }}
                >
                  Signal Strength
                </Typography>

                <Typography
                  sx={{
                    fontWeight: 900,
                    color: '#8d7cff',
                  }}
                >
                  {signalStrength}%
                </Typography>
              </Stack>

              <Slider
                value={
                  signalStrength
                }
                onChange={(
                  _event,
                  value
                ) =>
                  setSignalStrength(
                    Array.isArray(
                      value
                    )
                      ? value[0]
                      : value
                  )
                }
                min={0}
                max={100}
                valueLabelDisplay="auto"
              />
            </Box>

            <TextField
              select
              fullWidth
              label="Signal Status"
              value={
                signalStatus
              }
              onChange={(event) =>
                setSignalStatus(
                  event.target.value
                )
              }
            >
              <MenuItem value="ACTIVE">
                Active
              </MenuItem>

              <MenuItem value="INACTIVE">
                Inactive
              </MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setSignalDialog(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              saveSignalPlan
            }
            disabled={sectionLoading}
            sx={{
              background:
                'linear-gradient(135deg,#9d7cff,#5367ff)',
            }}
          >
            {sectionLoading
              ? 'Saving...'
              : editingSignalPlan
              ? 'Save Changes'
              : 'Create Signal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========================================================
          USER SIGNAL DIALOG
      ======================================================== */}

      <Dialog
        open={userSignalDialog}
        onClose={() =>
          setUserSignalDialog(false)
        }
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            <SignalCellularAltIcon
              sx={{
                color: '#9d7cff',
              }}
            />

            <span>
              User Signal Management
            </span>
          </Stack>
        </DialogTitle>

        <DialogContent>
          {selectedSignalUser && (
            <Stack
              spacing={2.5}
              sx={{ mt: 1 }}
            >
              <Card
                sx={{
                  background:
                    'rgba(10,20,60,0.8)',
                  border:
                    '1px solid rgba(157,124,255,0.18)',
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                  >
                    <Box
                      sx={{
                        width: 45,
                        height: 45,
                        borderRadius:
                          '50%',
                        display:
                          'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                        color:
                          '#fff',
                        background:
                          'linear-gradient(135deg,#9d7cff,#5367ff)',
                        fontWeight:
                          900,
                      }}
                    >
                      {(
                        selectedSignalUser
                          .firstName?.[0] ||
                        'U'
                      ).toUpperCase()}
                    </Box>

                    <Box>
                      <Typography
                        sx={{
                          fontWeight:
                            900,
                        }}
                      >
                        {
                          selectedSignalUser.firstName
                        }{' '}
                        {
                          selectedSignalUser.lastName
                        }
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#7186c3',
                          fontSize:
                            12,
                        }}
                      >
                        {
                          selectedSignalUser.email
                        }
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>

              <TextField
                select
                fullWidth
                label="Signal Plan"
                value={
                  selectedSignalPlanId
                }
                onChange={(event) =>
                  setSelectedSignalPlanId(
                    event.target.value
                  )
                }
              >
                <MenuItem value="">
                  No Signal Plan
                </MenuItem>

                {signalPlans
                  .filter(
                    (plan) =>
                      plan.status ===
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
              </TextField>

              <Box>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                >
                  <Typography
                    sx={{
                      fontWeight:
                        800,
                    }}
                  >
                    User Signal Strength
                  </Typography>

                  <Typography
                    sx={{
                      color:
                        '#9d7cff',
                      fontWeight:
                        900,
                    }}
                  >
                    {userSignalStrength}%
                  </Typography>
                </Stack>

                <Slider
                  value={
                    userSignalStrength
                  }
                  onChange={(
                    _event,
                    value
                  ) =>
                    setUserSignalStrength(
                      Array.isArray(
                        value
                      )
                        ? value[0]
                        : value
                    )
                  }
                  min={0}
                  max={100}
                  valueLabelDisplay="auto"
                />
              </Box>

              <Card
                sx={{
                  background:
                    'rgba(255,255,255,0.03)',
                  border:
                    '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <CardContent>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box>
                      <Typography
                        sx={{
                          fontWeight:
                            900,
                        }}
                      >
                        Signal Enabled
                      </Typography>

                      <Typography
                        sx={{
                          color:
                            '#7186c3',
                          fontSize:
                            12,
                        }}
                      >
                        Enable or disable this
                        user's signal configuration.
                      </Typography>
                    </Box>

                    <Switch
                      checked={
                        userSignalEnabled
                      }
                      onChange={(
                        event
                      ) =>
                        setUserSignalEnabled(
                          event.target
                            .checked
                        )
                      }
                    />
                  </Stack>
                </CardContent>
              </Card>

              {userSignal && (
                <Alert
                  severity="info"
                  sx={{
                    borderRadius: 3,
                  }}
                >
                  Current configuration:{' '}
                  {userSignal.plan
                    ?.name ||
                    'No assigned plan'}{' '}
                  •{' '}
                  {userSignal.strength}% •{' '}
                  {userSignal.enabled
                    ? 'Enabled'
                    : 'Disabled'}
                </Alert>
              )}
            </Stack>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() =>
              setUserSignalDialog(false)
            }
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={
              saveUserSignal
            }
            disabled={sectionLoading}
            sx={{
              background:
                'linear-gradient(135deg,#9d7cff,#5367ff)',
            }}
          >
            {sectionLoading
              ? 'Saving...'
              : 'Save Signal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;
