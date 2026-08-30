import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Button,
} from '@mui/material';

import {
  Payment,
  Settings as SettingsIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';

const AdminSettings: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box>
      <Typography
        variant="h4"
        fontWeight="bold"
        gutterBottom
      >
        Settings
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        sx={{ mb: 3 }}
      >
        Manage your platform administration settings.
      </Typography>

      <Grid container spacing={3}>
        {/* PAYMENT METHODS */}
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              cursor: 'pointer',
            }}
            onClick={() =>
              navigate(
                '/admin/settings/payment-methods'
              )
            }
          >
            <CardContent>
              <Payment
                sx={{
                  fontSize: 45,
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
              >
                Payment Methods
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                Add and manage the bank accounts,
                wallets and other payment methods
                available to users.
              </Typography>

              <Button
                variant="contained"
                onClick={(event) => {
                  event.stopPropagation();

                  navigate(
                    '/admin/settings/payment-methods'
                  );
                }}
              >
                Manage Payment Methods
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* GENERAL SETTINGS */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <SettingsIcon
                sx={{
                  fontSize: 45,
                  mb: 1,
                }}
              />

              <Typography
                variant="h6"
                fontWeight="bold"
                gutterBottom
              >
                General Settings
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                General platform settings can be
                added here later.
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminSettings;
