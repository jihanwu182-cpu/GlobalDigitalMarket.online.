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
  onSubmit: (values: OrderValues) => Promise<void>;
  loading?: boolean;
}

interface OrderValues {
  symbol: string;
  quantity: number;
  price: number;
  orderType: string;
}

const OrderSchema = Yup.object({
  symbol: Yup.string()
    .required('Symbol is required')
    .max(10, 'Symbol is too long'),

  quantity: Yup.number()
    .required('Quantity is required')
    .min(1, 'Quantity must be at least 1'),

  price: Yup.number()
    .required('Price is required')
    .min(0.01, 'Price must be greater than 0'),

  orderType: Yup.string()
    .required('Order type is required'),
});

const OrderDialog: React.FC<OrderDialogProps> = ({
  open,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const initialValues: OrderValues = {
    symbol: '',
    quantity: 1,
    price: 0,
    orderType: 'BUY',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        Create New Order
      </DialogTitle>

      <Formik
        initialValues={initialValues}
        validationSchema={OrderSchema}
        onSubmit={onSubmit}
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
            <DialogContent>
              <Box
                sx={{
                  pt: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <TextField
                  fullWidth
                  label="Symbol"
                  name="symbol"
                  value={values.symbol}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    Boolean(
                      touched.symbol && errors.symbol
                    )
                  }
                  helperText={
                    touched.symbol &&
                    typeof errors.symbol === 'string'
                      ? errors.symbol
                      : ''
                  }
                  placeholder="e.g. AAPL"
                  disabled={loading || isSubmitting}
                />

                <TextField
                  fullWidth
                  label="Quantity"
                  name="quantity"
                  type="number"
                  value={values.quantity}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    Boolean(
                      touched.quantity &&
                        errors.quantity
                    )
                  }
                  helperText={
                    touched.quantity &&
                    typeof errors.quantity === 'string'
                      ? errors.quantity
                      : ''
                  }
                  inputProps={{
                    min: 1,
                  }}
                  disabled={loading || isSubmitting}
                />

                <TextField
                  fullWidth
                  label="Price"
                  name="price"
                  type="number"
                  value={values.price}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={
                    Boolean(
                      touched.price && errors.price
                    )
                  }
                  helperText={
                    touched.price &&
                    typeof errors.price === 'string'
                      ? errors.price
                      : ''
                  }
                  inputProps={{
                    step: 0.01,
                    min: 0,
                  }}
                  disabled={loading || isSubmitting}
                />

                <TextField
                  fullWidth
                  select
                  label="Order Type"
                  name="orderType"
                  value={values.orderType}
                  onChange={handleChange}
                  disabled={loading || isSubmitting}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="BUY">
                    Buy
                  </option>

                  <option value="SELL">
                    Sell
                  </option>
                </TextField>
              </Box>
            </DialogContent>

            <DialogActions>
              <Button
                onClick={onClose}
                disabled={loading || isSubmitting}
              >
                Cancel
              </Button>

              <Button
                variant="contained"
                type="submit"
                disabled={loading || isSubmitting}
                sx={{
                  minWidth: 130,
                  position: 'relative',
                }}
              >
                {(loading || isSubmitting) && (
                  <CircularProgress
                    size={22}
                    sx={{
                      position: 'absolute',
                    }}
                  />
                )}

                {loading || isSubmitting
                  ? 'Submitting...'
                  : 'Submit'}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default OrderDialog;
