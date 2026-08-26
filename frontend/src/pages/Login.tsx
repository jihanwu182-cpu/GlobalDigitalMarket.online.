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

import authService from '../Services/authService';
import { login as loginAction } from '../Store/authSlice';

const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email')
    .required('Email is required'),

  password: Yup.string()
    .required('Password is required'),
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSubmit = async (
    values: { email: string; password: string },
    { setSubmitting }: { setSubmitting: (value: boolean) => void }
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
        error.response?.data?.error || 'Login failed'
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
        p: 2,
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 450,
          boxShadow: 3,
        }}
      >
        <CardContent sx={{ p: 4 }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              mb: 3,
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          >
            Login to GlobalMarket
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
                    fullWidth
                    label="Email"
                    name="email"
                    type="email"
                    value={values.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.email &&
                      Boolean(errors.email)
                    }
                    helperText={
                      touched.email && errors.email
                    }
                    disabled={isSubmitting}
                  />

                  <TextField
                    fullWidth
                    label="Password"
                    name="password"
                    type="password"
                    value={values.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.password &&
                      Boolean(errors.password)
                    }
                    helperText={
                      touched.password && errors.password
                    }
                    disabled={isSubmitting}
                  />

                  <Button
                    fullWidth
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                    sx={{
                      mt: 2,
                      py: 1.5,
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
                      mt: 2,
                    }}
                  >
                    Don't have an account?{' '}

                    <Button
                      color="primary"
                      onClick={() =>
                        navigate('/register')
                      }
                    >
                      Register
                    </Button>
                  </Typography>
                </Box>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
