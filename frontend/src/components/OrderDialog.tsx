import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Box,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';

interface OrderDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => Promise<void>;
  loading?: boolean;
}

const OrderSchema = Yup.object().shape({
  symbol: Yup.string().required('Symbol is required').max(10),
  quantity: Yup.number().required('Quantity is required').min(1),
  price: Yup.number().required('Price is required').min(0.01),
  orderType: Yup.string().required('Order type is required'),
});

const OrderDialog: React.FC<OrderDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Order</DialogTitle>
      <DialogContent>
        <Formik
          initialValues={{
            symbol: '',
            quantity: 1,
            price: 0,
            orderType: 'BUY',
          }}
          validationSchema={OrderSchema}
          onSubmit={onSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  label="Symbol"
                  name="symbol"
                  value={values.symbol}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.symbol && Boolean(errors.symbol)}
                  helperText={touched.symbol && errors.symbol}
                  placeholder="e.g., AAPL"
                />
                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={values.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.quantity && Boolean(errors.quantity)}
                  helperText={touched.quantity && errors.quantity}
                  inputProps={{ min: 1 }}
                />
                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={values.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.price && Boolean(errors.price)}
                  helperText={touched.price && errors.price}
                  inputProps={{ step: 0.01, min: 0 }}
                />
                <TextField
                  fullWidth
                  select
                  label="Order Type"
                  name="orderType"
                  value={values.orderType}
                  onChange={handleChange}
                  SelectProps={{ native: true }}
                >
                  <option value="BUY">Buy</option>
                  <option value="SELL">Sell</option>
                </TextField>
              </Box>
            </Form>
          )}
        </Formik>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onClose}
          disabled={loading}
          sx={{ position: 'relative' }}
        >
          {loading && <CircularProgress size={24} sx={{ position: 'absolute' }} />}
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default OrderDialog;
