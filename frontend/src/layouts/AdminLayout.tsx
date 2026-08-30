import React, { useState } from 'react';

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
  IconButton,
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
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import {
  useLocation,
  useNavigate,
} from 'react-router-dom';

const drawerWidth = 250;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] =
    useState(false);

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

  const handleNavigation = (
    path: string
  ) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        background:
          'linear-gradient(180deg, #07143d 0%, #02071f 100%)',
        color: '#fff',
      }}
    >
      <Toolbar
        sx={{
          minHeight: 72,
          display: 'flex',
          justifyContent: 'space-between',
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

        <IconButton
          onClick={() =>
            setMobileOpen(false)
          }
          sx={{
            display: {
              xs: 'flex',
              md: 'none',
            },
            color: '#fff',
          }}
        >
          <CloseIcon />
        </IconButton>
      </Toolbar>

      <Divider
        sx={{
          borderColor:
            'rgba(255,255,255,0.08)',
        }}
      />

      <List
        sx={{
          px: 1,
          py: 2,
        }}
      >
        {menuItems.map((item) => {
          const selected =
            location.pathname === item.path;

          return (
            <ListItemButton
              key={item.path}
              selected={selected}
              onClick={() =>
                handleNavigation(item.path)
              }
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
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        background: '#02071f',
      }}
    >
      {/* MOBILE MENU BUTTON */}

      <Box
        sx={{
          display: {
            xs: 'block',
            md: 'none',
          },
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 1400,
        }}
      >
        <IconButton
          onClick={() =>
            setMobileOpen(true)
          }
          sx={{
            width: 48,
            height: 48,
            color: '#fff',
            background:
              'rgba(7,20,61,0.95)',
            border:
              '1px solid rgba(92,232,255,0.25)',

            '&:hover': {
              background:
                'rgba(7,20,61,1)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* DESKTOP SIDEBAR */}

      <Drawer
        variant="permanent"
        sx={{
          display: {
            xs: 'none',
            md: 'block',
          },

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
        {drawerContent}
      </Drawer>

      {/* MOBILE SIDEBAR */}

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={() =>
          setMobileOpen(false)
        }
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: {
            xs: 'block',
            md: 'none',
          },

          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            background:
              'linear-gradient(180deg, #07143d 0%, #02071f 100%)',
            color: '#fff',
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* MAIN CONTENT */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          minHeight: '100vh',
          width: '100%',
          overflowX: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
