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
import * as Yup from 'yup';

interface TradingFormValues {
  symbol: string;
  amount: string;
  type: 'buy' | 'sell';
}

const TradingSchema = Yup.object().shape({
  symbol: Yup.string().required('Market is required'),
  amount: Yup.string().required('Amount is required'),
  type: Yup.string()
    .oneOf(['buy', 'sell'])
    .required('Trade type is required'),
});

const Trading: React.FC = () => {
  const initialValues: TradingFormValues = {
    symbol: '',
    amount: '',
    type: 'buy',
  };

  const handleSubmit = async (
    values: TradingFormValues
  ) => {
    console.log('Trade submitted:', values);

    alert(
      `${values.type.toUpperCase()} order for ${values.symbol} submitted successfully.`
    );
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        p: 3,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 600,
          mx: 'auto',
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              mb: 3,
              fontWeight: 700,
            }}
          >
            Trading
          </Typography>

          <Formik
            initialValues={initialValues}
            validationSchema={TradingSchema}
            onSubmit={handleSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
            }) => {
              const symbolError =
                touched.symbol &&
                typeof errors.symbol === 'string'
                  ? errors.symbol
                  : '';

              const amountError =
                touched.amount &&
                typeof errors.amount === 'string'
                  ? errors.amount
                  : '';

              const typeError =
                touched.type &&
                typeof errors.type === 'string'
                  ? errors.type
                  : '';

              return (
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
                      error={Boolean(symbolError)}
                      helperText={symbolError}
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
                      error={Boolean(typeError)}
                      helperText={typeError}
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
                      error={Boolean(amountError)}
                      helperText={amountError}
                      inputProps={{
                        min: 0,
                      }}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      disabled={isSubmitting}
                      sx={{
                        mt: 1,
                        py: 1.5,
                      }}
                    >
                      {isSubmitting
                        ? 'Submitting...'
                        : 'Place Trade'}
                    </Button>
                  </Box>
                </Form>
              );
            }}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Trading;
