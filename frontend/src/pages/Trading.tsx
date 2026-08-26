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

const TradingSchema = Yup.object({
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
    try {
      console.log('Trade submitted:', values);

      alert(
        `${values.type.toUpperCase()} order for ${values.symbol} submitted successfully.`
      );
    } catch (error) {
      console.error('Trading error:', error);
      alert('Unable to submit trade.');
    }
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
            }) => (
              <Form>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                  }}
                >
                  {/* Market */}
                  <TextField
                    select
                    fullWidth
                    label="Market"
                    name="symbol"
                    value={values.symbol}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(
                      touched.symbol && errors.symbol
                    )}
                    helperText={
                      touched.symbol &&
                      typeof errors.symbol === 'string'
                        ? errors.symbol
                        : ''
                    }
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

                  {/* Trade Type */}
                  <TextField
                    select
                    fullWidth
                    label="Trade Type"
                    name="type"
                    value={values.type}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(
                      touched.type && errors.type
                    )}
                    helperText={
                      touched.type &&
                      typeof errors.type === 'string'
                        ? errors.type
                        : ''
                    }
                  >
                    <MenuItem value="buy">
                      Buy
                    </MenuItem>

                    <MenuItem value="sell">
                      Sell
                    </MenuItem>
                  </TextField>

                  {/* Amount */}
                  <TextField
                    fullWidth
                    label="Amount"
                    name="amount"
                    type="number"
                    value={values.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={Boolean(
                      touched.amount && errors.amount
                    )}
                    helperText={
                      touched.amount &&
                      typeof errors.amount === 'string'
                        ? errors.amount
                        : ''
                    }
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
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Trading;
