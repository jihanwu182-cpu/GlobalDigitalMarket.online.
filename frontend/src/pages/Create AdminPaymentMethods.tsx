import React, { useEffect, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  Add,
  Delete,
  Edit,
  ArrowBack,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

import axios from 'axios';

// ============================================================
// TYPES
// ============================================================

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  currency: string;
  details: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  walletAddress: string;
  instructions: string;
  status: string;
  createdBy: number | null;
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethodForm {
  name: string;
  type: string;
  currency: string;
  details: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  walletAddress: string;
  instructions: string;
  status: string;
}

// ============================================================
// API
// ============================================================

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  '';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// ============================================================
// COMPONENT
// ============================================================

const AdminPaymentMethods: React.FC = () => {
  const navigate = useNavigate();

  const [paymentMethods, setPaymentMethods] =
    useState<PaymentMethod[]>([]);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [saving, setSaving] =
    useState<boolean>(false);

  const [error, setError] =
    useState<string>('');

  const [success, setSuccess] =
    useState<string>('');

  const [dialogOpen, setDialogOpen] =
    useState<boolean>(false);

  const [editingMethod, setEditingMethod] =
    useState<PaymentMethod | null>(null);

  const [form, setForm] =
    useState<PaymentMethodForm>({
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
    });

  // ==========================================================
  // TOKEN
  // ==========================================================

  const getToken = () => {
    return (
      localStorage.getItem('adminToken') ||
      localStorage.getItem('accessToken') ||
      localStorage.getItem('token') ||
      ''
    );
  };

  // ==========================================================
  // REQUEST CONFIG
  // ==========================================================

  const getConfig = () => {
    const token = getToken();

    return {
      headers: {
        Authorization: token
          ? `Bearer ${token}`
          : '',
        'Content-Type':
          'application/json',
      },
    };
  };

  // ==========================================================
  // LOAD PAYMENT METHODS
  // ==========================================================

  const loadPaymentMethods = async () => {
    try {
      setLoading(true);
      setError('');

      const response =
        await api.get(
          '/api/admin/payment-methods',
          getConfig()
        );

      setPaymentMethods(
        response.data?.paymentMethods || []
      );

    } catch (err: any) {
      console.error(
        'Load payment methods error:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to load payment methods.'
      );

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  // ==========================================================
  // OPEN CREATE
  // ==========================================================

  const handleAdd = () => {
    setEditingMethod(null);

    setForm({
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
    });

    setError('');
    setSuccess('');
    setDialogOpen(true);
  };

  // ==========================================================
  // OPEN EDIT
  // ==========================================================

  const handleEdit = (
    method: PaymentMethod
  ) => {
    setEditingMethod(method);

    setForm({
      name: method.name || '',
      type: method.type || 'BANK',
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

    setError('');
    setSuccess('');
    setDialogOpen(true);
  };

  // ==========================================================
  // CLOSE DIALOG
  // ==========================================================

  const handleClose = () => {
    if (saving) {
      return;
    }

    setDialogOpen(false);
  };

  // ==========================================================
  // FORM CHANGE
  // ==========================================================

  const handleChange = (
    field: keyof PaymentMethodForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      if (!form.name.trim()) {
        setError(
          'Payment method name is required.'
        );

        setSaving(false);
        return;
      }

      const payload = {
        name: form.name.trim(),
        type: form.type,
        currency:
          form.currency.trim().toUpperCase(),
        details:
          form.details.trim(),
        accountName:
          form.accountName.trim(),
        accountNumber:
          form.accountNumber.trim(),
        bankName:
          form.bankName.trim(),
        walletAddress:
          form.walletAddress.trim(),
        instructions:
          form.instructions.trim(),
        status: form.status,
      };

      if (editingMethod) {
        await api.patch(
          `/api/admin/payment-methods/${editingMethod.id}`,
          payload,
          getConfig()
        );

        setSuccess(
          'Payment method updated successfully.'
        );
      } else {
        await api.post(
          '/api/admin/payment-methods',
          payload,
          getConfig()
        );

        setSuccess(
          'Payment method created successfully.'
        );
      }

      setDialogOpen(false);

      await loadPaymentMethods();

    } catch (err: any) {
      console.error(
        'Save payment method error:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to save payment method.'
      );

    } finally {
      setSaving(false);
    }
  };

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (
    method: PaymentMethod
  ) => {
    const confirmed =
      window.confirm(
        `Delete payment method "${method.name}"?`
      );

    if (!confirmed) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      await api.delete(
        `/api/admin/payment-methods/${method.id}`,
        getConfig()
      );

      setSuccess(
        'Payment method deleted successfully.'
      );

      await loadPaymentMethods();

    } catch (err: any) {
      console.error(
        'Delete payment method error:',
        err
      );

      setError(
        err?.response?.data?.message ||
          'Failed to delete payment method.'
      );
    }
  };

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '60vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <Box>
      {/* HEADER */}

      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        spacing={2}
        justifyContent="space-between"
        alignItems={{
          xs: 'stretch',
          sm: 'center',
        }}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight="bold"
          >
            Payment Methods
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
          >
            Manage the payment instructions
            available to users.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={() =>
              navigate('/admin/settings')
            }
          >
            Settings
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleAdd}
          >
            Add Payment Method
          </Button>
        </Stack>
      </Stack>

      {/* ALERTS */}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {/* EMPTY */}

      {paymentMethods.length === 0 ? (
        <Card>
          <CardContent
            sx={{
              textAlign: 'center',
              py: 6,
            }}
          >
            <Typography
              variant="h6"
              gutterBottom
            >
              No payment methods yet
            </Typography>

            <Typography
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Add a bank account, cryptocurrency
              wallet, or other payment method.
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleAdd}
            >
              Add Payment Method
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid
          container
          spacing={3}
        >
          {paymentMethods.map(
            (method) => (
              <Grid
                item
                xs={12}
                sm={6}
                lg={4}
                key={method.id}
              >
                <Card
                  sx={{
                    height: '100%',
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
                          variant="h6"
                          fontWeight="bold"
                        >
                          {method.name}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          {method.type} •{' '}
                          {method.currency}
                        </Typography>
                      </Box>

                      <Chip
                        label={method.status}
                        size="small"
                        color={
                          method.status ===
                          'ACTIVE'
                            ? 'success'
                            : 'default'
                        }
                      />
                    </Stack>

                    <Box sx={{ mt: 2 }}>
                      {method.bankName && (
                        <Typography variant="body2">
                          <strong>Bank:</strong>{' '}
                          {method.bankName}
                        </Typography>
                      )}

                      {method.accountName && (
                        <Typography variant="body2">
                          <strong>
                            Account Name:
                          </strong>{' '}
                          {method.accountName}
                        </Typography>
                      )}

                      {method.accountNumber && (
                        <Typography variant="body2">
                          <strong>
                            Account Number:
                          </strong>{' '}
                          {method.accountNumber}
                        </Typography>
                      )}

                      {method.walletAddress && (
                        <Typography
                          variant="body2"
                          sx={{
                            wordBreak:
                              'break-word',
                          }}
                        >
                          <strong>
                            Wallet:
                          </strong>{' '}
                          {method.walletAddress}
                        </Typography>
                      )}

                      {method.details && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 1 }}
                        >
                          {method.details}
                        </Typography>
                      )}

                      {method.instructions && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{ mt: 1 }}
                        >
                          {method.instructions}
                        </Typography>
                      )}
                    </Box>

                    <Stack
                      direction="row"
                      spacing={1}
                      sx={{ mt: 3 }}
                    >
                      <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Edit />}
                        onClick={() =>
                          handleEdit(method)
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
                          handleDelete(method)
                        }
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

      {/* CREATE / EDIT DIALOG */}

      <Dialog
        open={dialogOpen}
        onClose={handleClose}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingMethod
            ? 'Edit Payment Method'
            : 'Add Payment Method'}
        </DialogTitle>

        <DialogContent>
          <Grid
            container
            spacing={2}
            sx={{ mt: 0.5 }}
          >
            <Grid
              item
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label="Name"
                value={form.name}
                onChange={(event) =>
                  handleChange(
                    'name',
                    event.target.value
                  )
                }
                required
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
            >
              <FormControl fullWidth>
                <InputLabel>
                  Type
                </InputLabel>

                <Select
                  value={form.type}
                  label="Type"
                  onChange={(event) =>
                    handleChange(
                      'type',
                      event.target.value
                    )
                  }
                >
                  <MenuItem value="BANK">
                    Bank
                  </MenuItem>

                  <MenuItem value="CRYPTO">
                    Crypto
                  </MenuItem>

                  <MenuItem value="CARD">
                    Card
                  </MenuItem>

                  <MenuItem value="MOBILE_MONEY">
                    Mobile Money
                  </MenuItem>

                  <MenuItem value="OTHER">
                    Other
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid
              item
              xs={12}
              sm={3}
            >
              <TextField
                fullWidth
                label="Currency"
                value={form.currency}
                onChange={(event) =>
                  handleChange(
                    'currency',
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label="Bank Name"
                value={form.bankName}
                onChange={(event) =>
                  handleChange(
                    'bankName',
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid
              item
              xs={12}
              sm={6}
            >
              <TextField
                fullWidth
                label="Account Name"
                value={form.accountName}
                onChange={(event) =>
                  handleChange(
                    'accountName',
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid
              item
              xs={12}
            >
              <TextField
                fullWidth
                label="Account Number"
                value={form.accountNumber}
                onChange={(event) =>
                  handleChange(
                    'accountNumber',
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid
              item
              xs={12}
            >
              <TextField
                fullWidth
                label="Wallet Address"
                value={form.walletAddress}
                onChange={(event) =>
                  handleChange(
                    'walletAddress',
                    event.target.value
                  )
                }
              />
            </Grid>

            <Grid
              item
              xs={12}
            >
              <TextField
                fullWidth
                label="Payment Details"
                value={form.details}
                onChange={(event) =>
                  handleChange(
                    'details',
                    event.target.value
                  )
                }
                multiline
                minRows={3}
              />
            </Grid>

            <Grid
              item
              xs={12}
            >
              <TextField
                fullWidth
                label="Instructions"
                value={form.instructions}
                onChange={(event) =>
                  handleChange(
                    'instructions',
                    event.target.value
                  )
                }
                multiline
                minRows={3}
              />
            </Grid>

            <Grid
              item
              xs={12}
            >
              <FormControl fullWidth>
                <InputLabel>
                  Status
                </InputLabel>

                <Select
                  value={form.status}
                  label="Status"
                  onChange={(event) =>
                    handleChange(
                      'status',
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
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <CircularProgress
                size={22}
              />
            ) : editingMethod ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminPaymentMethods;
