import React, { useState } from 'react';
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
import SearchIcon from '@mui/icons-material/Search';

interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

const Market: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [loading, setLoading] = useState(false);

  const [stocks] = useState<Stock[]>([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 182.52,
      change: 2.45,
      changePercent: 1.36,
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 139.85,
      change: -1.2,
      changePercent: -0.85,
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft',
      price: 378.91,
      change: 3.15,
      changePercent: 0.84,
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 245.3,
      change: -5.2,
      changePercent: -2.08,
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 171.2,
      change: 4.5,
      changePercent: 2.7,
    },
  ]);

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const found = stocks.find(
        (stock) =>
          stock.symbol.toUpperCase() ===
          searchQuery.trim().toUpperCase()
      );

      setSelectedStock(found || null);
      setLoading(false);
    }, 300);
  };

  return (
    <Box>
      <Typography
        variant="h4"
        component="h1"
        sx={{ mb: 3, fontWeight: 700 }}
      >
        Market Data
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              gap: 1,
            }}
          >
            <TextField
              fullWidth
              label="Search Market"
              placeholder="e.g. AAPL"
              value={searchQuery}
              onChange={(event) =>
                setSearchQuery(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  handleSearch();
                }
              }}
            />

            <Button
              variant="contained"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <CircularProgress size={24} />
              ) : (
                <SearchIcon />
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {selectedStock && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h5" sx={{ mb: 2 }}>
              {selectedStock.symbol} - {selectedStock.name}
            </Typography>

            <Typography variant="h4">
              ${selectedStock.price.toFixed(2)}
            </Typography>

            <Typography
              sx={{
                mt: 1,
                color:
                  selectedStock.change >= 0
                    ? 'green'
                    : 'red',
              }}
            >
              {selectedStock.change >= 0 ? '+' : ''}
              {selectedStock.change.toFixed(2)} (
              {selectedStock.changePercent >= 0 ? '+' : ''}
              {selectedStock.changePercent.toFixed(2)}%)
            </Typography>
          </CardContent>
        </Card>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography
                variant="h6"
                sx={{ mb: 2 }}
              >
                Popular Stocks
              </Typography>

              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Symbol</TableCell>
                      <TableCell>Company</TableCell>
                      <TableCell align="right">
                        Price
                      </TableCell>
                      <TableCell align="right">
                        Change
                      </TableCell>
                      <TableCell align="right">
                        Change %
                      </TableCell>
                      <TableCell align="right">
                        Action
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {stocks.map((stock) => (
                      <TableRow
                        key={stock.symbol}
                        hover
                        onClick={() =>
                          setSelectedStock(stock)
                        }
                        sx={{ cursor: 'pointer' }}
                      >
                        <TableCell>
                          <strong>{stock.symbol}</strong>
                        </TableCell>

                        <TableCell>
                          {stock.name}
                        </TableCell>

                        <TableCell align="right">
                          ${stock.price.toFixed(2)}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              stock.change >= 0
                                ? 'green'
                                : 'red',
                          }}
                        >
                          {stock.change >= 0 ? '+' : ''}
                          {stock.change.toFixed(2)}
                        </TableCell>

                        <TableCell
                          align="right"
                          sx={{
                            color:
                              stock.changePercent >= 0
                                ? 'green'
                                : 'red',
                          }}
                        >
                          {stock.changePercent >= 0
                            ? '+'
                            : ''}
                          {stock.changePercent.toFixed(2)}%
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={(event) => {
                              event.stopPropagation();
                              setSelectedStock(stock);
                            }}
                          >
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
