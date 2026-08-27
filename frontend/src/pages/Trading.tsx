import React from 'react';
import { Box, Button, Card, CardContent, TextField, Typography } from '@mui/material';

const Trading: React.FC = () => {
  const [symbol, setSymbol] = React.useState('');
  const [amount, setAmount] = React.useState('');

  const handleTrade = (event: React.FormEvent) => {
    event.preventDefault();

    if (!symbol || !amount) {
      alert('Please enter a market and amount.');
      return;
    }

    alert(`Trade submitted: ${symbol} - ${amount}`);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 600,
          margin: '0 auto',
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Typography
            variant="h4"
            sx={{
              marginBottom: 3,
              fontWeight: 700,
            }}
          >
            Trading
          </Typography>

          <Box
            component="form"
            onSubmit={handleTrade}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <TextField
              fullWidth
              label="Market"
              value={symbol}
              onChange={(event) => setSymbol(event.target.value)}
              placeholder="e.g. AAPL"
            />

            <TextField
              fullWidth
              label="Amount"
              type="number"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
            />

            <Button
              fullWidth
              variant="contained"
              type="submit"
              sx={{ paddingY: 1.5 }}
            >
              Place Trade
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Trading;
