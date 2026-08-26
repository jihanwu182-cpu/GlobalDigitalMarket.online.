import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import { Formik, Form } from 'formik';

interface TradingFormValues {
  symbol: string;
  amount: string;
  type: string;
}

const Trading: React.FC = () => {
  const initialValues: TradingFormValues = {
    symbol: '',
    amount: '',
    type: 'buy',
  };

  return (
    <Box sx={{ p: 3 }}>
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Trading
          </Typography>

          <Formik
            initialValues={initialValues}
            onSubmit={(values) => {
              alert(
                `Trade submitted: ${values.type} ${values.symbol} ${values.amount}`
              );
            }}
          >
            {({
              values,
              handleChange,
              handleBlur,
            }) => (
              <Form>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  <TextField
                    select
                    fullWidth
                    label="Market"
                    name="symbol"
                    value={values.symbol}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <MenuItem value="BTCUSDT">
                      BTC / USDT
                    </MenuItem>

                    <MenuItem value="ETHUSDT">
                      ETH / USDT
                    </MenuItem>

                    <MenuItem value="XRPUSDT">
                      XRP / USDT
                    </MenuItem>

                    <MenuItem value="EURUSD">
                      EUR / USD
                    </MenuItem>

                    <MenuItem value="AAPL">
                      Apple (AAPL)
                    </MenuItem>
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    label="Trade Type"
                    name="type"
                    value={values.type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  >
                    <MenuItem value="buy">
                      Buy
                    </MenuItem>

                    <MenuItem value="sell">
                      Sell
                    </MenuItem>
                  </TextField>

                  <TextField
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={values.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    sx={{ py: 1.5 }}
                  >
                    Place Trade
                  </Button>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Trading;
