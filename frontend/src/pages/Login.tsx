import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  CircularProgress,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';

import authService from '../services/authService';
import { login as loginAction } from '../store/authSlice';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),

  password: Yup.string()
    .required('Password is required'),
});

interface LoginValues {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (
    values: LoginValues,
    {
      setSubmitting,
    }: {
      setSubmitting: (value: boolean) => void;
    }
  ) => {
    try {
      const response = await authService.login(
        values.email,
        values.password
      );

      dispatch(
        loginAction({
          user: response.user,
          token: response.accessToken,
        })
      );

      toast.success('Login successful!');

      navigate('/');
    } catch (error: any) {
      toast.error(
        error?.response?.data?.error ||
          'Login failed. Please check your email and password.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
        backgroundColor: '#f5f5f5',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 450,
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ padding: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              marginBottom: 3,
              textAlign: 'center',
              fontWeight: 700,
            }}
          >
            Login to Global Digital Market
          </Typography>

          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={LoginSchema}
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
              const emailError =
                touched.email &&
                typeof errors.email === 'string'
                  ? errors.email
                  : '';

              const passwordError =
                touched.password &&
                typeof errors.password === 'string'
                  ? errors.password
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
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      error={Boolean(emailError)}
                      helperText={emailError}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      disabled={isSubmitting}
                      error={Boolean(passwordError)}
                      helperText={passwordError}
                    />

                    <Button
                      fullWidth
                      variant="contained"
                      type="submit"
                      disabled={isSubmitting}
                      sx={{
                        marginTop: 1,
                        paddingY: 1.5,
                      }}
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Login'
                      )}
                    </Button>

                    <Typography
                      variant="body2"
                      sx={{
                        textAlign: 'center',
                        marginTop: 2,
                      }}
                    >
                      Don't have an account?
                    </Typography>

                    <Button
                      fullWidth
                      variant="text"
                      type="button"
                      onClick={() => navigate('/register')}
                    >
                      Register
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

export default Login;
