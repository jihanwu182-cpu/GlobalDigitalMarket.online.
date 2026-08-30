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
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: '#02071f',
      }}
    >
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,

          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background:
              'linear-gradient(180deg, #07143d 0%, #02071f 100%)',
            color: '#fff',
            borderRight:
              '1px solid rgba(125,150,255,0.14)',
          },
        }}
      >
        <Toolbar
          sx={{
            minHeight: 72,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 900,
              color: '#5ce8ff',
            }}
          >
            Admin Panel
          </Typography>
        </Toolbar>

        <Divider
          sx={{
            borderColor:
              'rgba(255,255,255,0.08)',
          }}
        />

        <List sx={{ px: 1, py: 2 }}>
          {menuItems.map((item) => {
            const selected =
              location.pathname === item.path;

            return (
              <ListItemButton
                key={item.path}
                selected={selected}
                onClick={() => {
                  navigate(item.path);
                }}
                sx={{
                  mb: 0.5,
                  minHeight: 48,
                  borderRadius: 2,

                  '& .MuiListItemIcon-root': {
                    color: selected
                      ? '#5ce8ff'
                      : '#7186c3',
                    minWidth: 42,
                  },

                  '& .MuiListItemText-primary': {
                    color: selected
                      ? '#ffffff'
                      : '#9aace0',
                    fontWeight: selected
                      ? 800
                      : 500,
                    fontSize: 14,
                  },

                  '&.Mui-selected': {
                    background:
                      'rgba(92,232,255,0.10)',
                  },

                  '&.Mui-selected:hover': {
                    background:
                      'rgba(92,232,255,0.15)',
                  },

                  '&:hover': {
                    background:
                      'rgba(255,255,255,0.05)',
                  },
                }}
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
          minWidth: 0,
          minHeight: '100vh',

          /*
           * This prevents the dashboard from
           * being hidden underneath the sidebar.
           */
          ml: 0,

          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
