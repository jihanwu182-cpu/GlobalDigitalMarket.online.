import React from 'react';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';

import {
  Dashboard,
  People,
  AccountBalance,
  VerifiedUser,
  Payments,
  MoneyOff,
  ReceiptLong,
  TrendingUp,
  SignalCellularAlt,
  Settings,
} from '@mui/icons-material';

import { useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 250;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: <Dashboard />,
    },
    {
      label: 'Users',
      path: '/admin/users',
      icon: <People />,
    },
    {
      label: 'Accounts / Funding',
      path: '/admin/accounts',
      icon: <AccountBalance />,
    },
    {
      label: 'KYC',
      path: '/admin/kyc',
      icon: <VerifiedUser />,
    },
    {
      label: 'Deposits',
      path: '/admin/deposits',
      icon: <Payments />,
    },
    {
      label: 'Withdrawals',
      path: '/admin/withdrawals',
      icon: <MoneyOff />,
    },
    {
      label: 'Transactions',
      path: '/admin/transactions',
      icon: <ReceiptLong />,
    },
    {
      label: 'Investments',
      path: '/admin/investments',
      icon: <TrendingUp />,
    },
    {
      label: 'Signals',
      path: '/admin/signals',
      icon: <SignalCellularAlt />,
    },
    {
      label: 'Settings',
      path: '/admin/settings',
      icon: <Settings />,
    },
  ];

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar>
          <Typography
            variant="h6"
            fontWeight="bold"
          >
            Admin Panel
          </Typography>
        </Toolbar>

        <Divider />

        <List>
          {menuItems.map((item) => {
            const selected =
              location.pathname === item.path;

            return (
              <ListItemButton
                key={item.path}
                selected={selected}
                onClick={() =>
                  navigate(item.path)
                }
              >
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>

                <ListItemText
                  primary={item.label}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minWidth: 0,
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
