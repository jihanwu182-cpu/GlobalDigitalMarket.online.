import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Typography,
  Chip,
} from '@mui/material';
import StatCard from '../components/StatCard';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Portfolio: React.FC = () => {
  const [holdings, setHoldings] = useState([
    { id: 1, symbol: 'AAPL', quantity: 50, avgCost: 165.50, currentPrice: 182.52, marketValue: 9126, gain: 853 },
    { id: 2, symbol: 'GOOGL', quantity: 20, avgCost: 135.00, currentPrice: 139.85, marketValue: 2797, gain: 97 },
    { id: 3, symbol: 'MSFT', quantity: 30, avgCost: 365.00, currentPrice: 378.91, marketValue: 11367.3, gain: 418.3 },
    { id: 4, symbol: 'TSLA', quantity: 15, avgCost: 250.00, currentPrice: 245.30, marketValue: 3679.5, gain: -70.5 },
  ]);

  const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
  const totalGain = holdings.reduce((sum, h) => sum + h.gain, 0);
  const totalGainPercent = (totalGain / (totalValue - totalGain)) * 100;

  const allocationData = holdings.map((h) => ({
    name: h.symbol,
    value: h.marketValue,
  }));

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Portfolio Overview
      </Typography>

      {/* Summary Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Value"
            value={`$${totalValue.toFixed(2)}`}
            icon={<TrendingUpIcon sx={{ fontSize: 40 }} />}
            subtext="Current portfolio value"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Gain/Loss"
            value={`$${totalGain.toFixed(2)}`}
            subtext={`${totalGainPercent >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}%`}
            color={totalGain >= 0 ? 'success' : 'error'}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Holdings" value={holdings.length} subtext="Different assets" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Cash Available" value="$50,000.00" subtext="Ready to trade" />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Asset Allocation Chart */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Asset Allocation
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={allocationData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name} $${value.toFixed(0)}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {allocationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Holdings Table */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Summary
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell align="right">Gain/Loss</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {holdings.map((holding) => {
                      const gainPercent = (holding.gain / (holding.marketValue - holding.gain)) * 100;
                      return (
                        <TableRow key={holding.id}>
                          <TableCell sx={{ fontWeight: 'bold' }}>{holding.symbol}</TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: holding.gain >= 0 ? 'green' : 'red' }}
                          >
                            ${holding.gain.toFixed(2)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{ color: gainPercent >= 0 ? 'green' : 'red' }}
                          >
                            {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Detailed Holdings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Holdings Details
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell align="right">Avg Cost</TableCell>
                      <TableCell align="right">Current Price</TableCell>
                      <TableCell align="right">Market Value</TableCell>
                      <TableCell align="right">Gain/Loss</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {holdings.map((holding) => (
                      <TableRow key={holding.id}>
                        <TableCell sx={{ fontWeight: 'bold' }}>{holding.symbol}</TableCell>
                        <TableCell align="right">{holding.quantity}</TableCell>
                        <TableCell align="right">${holding.avgCost.toFixed(2)}</TableCell>
                        <TableCell align="right">${holding.currentPrice.toFixed(2)}</TableCell>
                        <TableCell align="right">${holding.marketValue.toFixed(2)}</TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: holding.gain >= 0 ? 'green' : 'red', fontWeight: 'bold' }}
                        >
                          {holding.gain >= 0 ? '+' : ''}${holding.gain.toFixed(2)}
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined" color="primary">
                            Sell
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Portfolio;
