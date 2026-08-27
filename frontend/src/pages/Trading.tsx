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
    <Box
      sx={{
        minHeight: '100vh',
        padding: 3,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 600,
          margin: '0 auto',
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              marginBottom: 3,
              fontWeight: 700,
            }}
          >
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
                    inputProps={{
                      min: 0,
                    }}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    sx={{
                      paddingY: 1.5,
                      marginTop: 1,
                    }}
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
