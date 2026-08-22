import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
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
  TextField,
} from '@mui/material';
import StatCard from '../components/StatCard';
import AddIcon from '@mui/icons-material/Add';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const Trading: React.FC = () => {
  const [openOrderDialog, setOpenOrderDialog] = useState(false);
  const [orderType, setOrderType] = useState('BUY');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');

  const [orders, setOrders] = useState([
    { id: 1, symbol: 'AAPL', side: 'BUY', quantity: 50, price: 165.50, status: 'FILLED', date: '2024-01-15' },
    { id: 2, symbol: 'GOOGL', side: 'BUY', quantity: 20, price: 135.00, status: 'FILLED', date: '2024-01-10' },
    { id: 3, symbol: 'MSFT', side: 'BUY', quantity: 30, price: 365.00, status: 'PENDING', date: '2024-01-20' },
  ]);

  const handleCreateOrder = () => {
    if (symbol && quantity && price) {
      const newOrder = {
        id: orders.length + 1,
        symbol: symbol.toUpperCase(),
        side: orderType,
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        status: 'PENDING',
        date: new Date().toISOString().split('T')[0],
      };
      setOrders([newOrder, ...orders]);
      setSymbol('');
      setQuantity('');
      setPrice('');
      setOpenOrderDialog(false);
    }
  };

  const handleCancelOrder = (id: number) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status: 'CANCELLED' } : order
      )
    );
  };

  const filledOrders = orders.filter((o) => o.status === 'FILLED').length;
  const pendingOrders = orders.filter((o) => o.status === 'PENDING').length;
  const totalValue = orders.reduce((sum, o) => sum + o.quantity * o.price, 0);

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Trading
      </Typography>

      {/* Trading Summary */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Orders"
            value={orders.length}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            subtext="All time"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Filled Orders" value={filledOrders} subtext="Completed" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Pending Orders" value={pendingOrders} subtext="In progress" color="warning" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Value"
            value={`$${totalValue.toFixed(2)}`}
            subtext="Orders value"
          />
        </Grid>
      </Grid>

      {/* Create Order Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenOrderDialog(true)}
          size="large"
        >
          Create New Order
        </Button>
      </Box>

      {/* Orders Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Order History
          </Typography>
          <TableContainer component={Paper}>
            <Table>
              <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                <TableRow>
                  <TableCell>Symbol</TableCell>
                  <TableCell>Side</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell align="right">Total Value</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell sx={{ fontWeight: 'bold' }}>{order.symbol}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.side}
                        color={order.side === 'BUY' ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">{order.quantity}</TableCell>
                    <TableCell align="right">${order.price.toFixed(2)}</TableCell>
                    <TableCell align="right">${(order.quantity * order.price).toFixed(2)}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <Chip
                        label={order.status}
                        color={
                          order.status === 'FILLED'
                            ? 'success'
                            : order.status === 'PENDING'
                            ? 'warning'
                            : 'error'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {order.status === 'PENDING' && (
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleCancelOrder(order.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Create Order Dialog */}
      <Dialog open={openOrderDialog} onClose={() => setOpenOrderDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              fullWidth
              select
              label="Order Type"
              value={orderType}
              onChange={(e) => setOrderType(e.target.value)}
              SelectProps={{ native: true }}
            >
              <option value="BUY">Buy</option>
              <option value="SELL">Sell</option>
            </TextField>
            <TextField
              fullWidth
              label="Symbol"
              placeholder="e.g., AAPL"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
            <TextField
              fullWidth
              label="Quantity"
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputProps={{ step: '1', min: '1' }}
            />
            <TextField
              fullWidth
              label="Price per Share (USD)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              inputProps={{ step: '0.01', min: '0' }}
            />
            {symbol && quantity && price && (
              <Typography variant="body2" color="textSecondary">
                Total: ${(parseFloat(quantity) * parseFloat(price)).toFixed(2)}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenOrderDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreateOrder} disabled={!symbol || !quantity || !price}>
            Create Order
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Trading;
