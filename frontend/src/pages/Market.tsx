import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
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
  CircularProgress,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import SearchIcon from '@mui/icons-material/Search';

const Market: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [stocks, setStocks] = useState<any[]>([
    { symbol: 'AAPL', name: 'Apple Inc.', price: 182.52, change: 2.45, changePercent: 1.36 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 139.85, change: -1.20, changePercent: -0.85 },
    { symbol: 'MSFT', name: 'Microsoft', price: 378.91, change: 3.15, changePercent: 0.84 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.30, change: -5.20, changePercent: -2.08 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 171.20, change: 4.50, changePercent: 2.70 },
  ]);

  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (selectedStock) {
      // Generate mock chart data
      const data = Array.from({ length: 30 }, (_, i) => ({
        date: `Day ${i + 1}`,
        price: selectedStock.price + (Math.random() - 0.5) * 20,
      }));
      setChartData(data);
    }
  }, [selectedStock]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setLoading(true);
      setTimeout(() => {
        const found = stocks.find((s) => s.symbol.toUpperCase() === searchQuery.toUpperCase());
        if (found) {
          setSelectedStock(found);
        }
        setLoading(false);
      }, 500);
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Market Data
      </Typography>

      {/* Search Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Search by symbol (e.g., AAPL)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button variant="contained" onClick={handleSearch} disabled={loading}>
              {loading ? <CircularProgress size={24} /> : <SearchIcon />}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Chart Section */}
        {selectedStock && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {selectedStock.symbol} - {selectedStock.name}
                </Typography>
                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                  <Box>
                    <Typography color="textSecondary">Current Price</Typography>
                    <Typography variant="h5">${selectedStock.price.toFixed(2)}</Typography>
                  </Box>
                  <Box>
                    <Typography color="textSecondary">Change</Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: selectedStock.change >= 0 ? 'green' : 'red',
                      }}
                    >
                      {selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.changePercent.toFixed(2)}%)
                    </Typography>
                  </Box>
                </Box>
                {chartData.length > 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="price" stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Stocks Table */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Popular Stocks
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Company Name</TableCell>
                      <TableCell align="right">Price</TableCell>
                      <TableCell align="right">Change</TableCell>
                      <TableCell align="right">Change %</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stocks.map((stock) => (
                      <TableRow
                        key={stock.symbol}
                        hover
                        onClick={() => setSelectedStock(stock)}
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell sx={{ fontWeight: 'bold' }}>{stock.symbol}</TableCell>
                        <TableCell>{stock.name}</TableCell>
                        <TableCell align="right">${stock.price.toFixed(2)}</TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: stock.change >= 0 ? 'green' : 'red' }}
                        >
                          {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{ color: stock.changePercent >= 0 ? 'green' : 'red' }}
                        >
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </TableCell>
                        <TableCell align="right">
                          <Button size="small" variant="outlined">
                            View
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

export default Market;
