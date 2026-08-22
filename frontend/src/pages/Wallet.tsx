import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import StatCard from '../components/StatCard';
import AddIcon from '@mui/icons-material/Add';
import SendIcon from '@mui/icons-material/Send';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const Wallet: React.FC = () => {
  const [openDeposit, setOpenDeposit] = useState(false);
  const [openWithdraw, setOpenWithdraw] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const [transactions, setTransactions] = useState([
    { id: 1, type: 'DEPOSIT', amount: 5000, status: 'COMPLETED', date: '2024-01-15', method: 'Bank Transfer' },
    { id: 2, type: 'WITHDRAWAL', amount: 2000, status: 'COMPLETED', date: '2024-01-10', method: 'Bank Account' },
    { id: 3, type: 'DEPOSIT', amount: 10000, status: 'PENDING', date: '2024-01-20', method: 'Credit Card' },
  ]);

  const totalBalance = 50000;
  const availableBalance = 50000;
  const pendingBalance = 10000;

  const handleDeposit = () => {
    if (depositAmount) {
      setTransactions([
        {
          id: transactions.length + 1,
          type: 'DEPOSIT',
          amount: parseFloat(depositAmount),
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
          method: 'Bank Transfer',
        },
        ...transactions,
      ]);
      setDepositAmount('');
      setOpenDeposit(false);
    }
  };

  const handleWithdraw = () => {
    if (withdrawAmount && parseFloat(withdrawAmount) <= availableBalance) {
      setTransactions([
        {
          id: transactions.length + 1,
          type: 'WITHDRAWAL',
          amount: parseFloat(withdrawAmount),
          status: 'PENDING',
          date: new Date().toISOString().split('T')[0],
          method: 'Bank Account',
        },
        ...transactions,
      ]);
      setWithdrawAmount('');
      setOpenWithdraw(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Wallet & Transactions
      </Typography>

      {/* Balance Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Balance"
            value={`$${totalBalance.toFixed(2)}`}
            icon={<AccountBalanceWalletIcon sx={{ fontSize: 40 }} />}
            subtext="Account balance"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Available Balance"
            value={`$${availableBalance.toFixed(2)}`}
            subtext="Ready to trade"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending"
            value={`$${pendingBalance.toFixed(2)}`}
            subtext="In progress"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setOpenDeposit(true)}
                >
                  Deposit
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SendIcon />}
                  onClick={() => setOpenWithdraw(true)}
                >
                  Withdraw
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Transactions Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Transaction History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>
                      {transaction.type === 'DEPOSIT' ? '➕ Deposit' : '➖ Withdrawal'}
                    </TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        color: transaction.type === 'DEPOSIT' ? 'green' : 'red',
                        fontWeight: 'bold',
                      }}
                    >
                      {transaction.type === 'DEPOSIT' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{transaction.method}</TableCell>
                    <TableCell>{transaction.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={transaction.status}
                        color={transaction.status === 'COMPLETED' ? 'success' : 'warning'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={openDeposit} onClose={() => setOpenDeposit(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Deposit Funds</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Amount (USD)"
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              inputProps={{ step: '0.01', min: '0' }}
            />
            <Typography variant="body2" color="textSecondary">
              Minimum deposit: $10
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeposit(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDeposit}>
            Deposit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={openWithdraw} onClose={() => setOpenWithdraw(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              label="Amount (USD)"
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              inputProps={{ step: '0.01', min: '0', max: availableBalance }}
            />
            <Typography variant="body2" color="textSecondary">
              Available: ${availableBalance.toFixed(2)}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenWithdraw(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleWithdraw}
            disabled={!withdrawAmount || parseFloat(withdrawAmount) > availableBalance}
          >
            Withdraw
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Wallet;
