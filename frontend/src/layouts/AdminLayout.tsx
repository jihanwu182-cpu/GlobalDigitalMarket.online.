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
    React.useState(false);

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

  const handleNavigation = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        background:
          'linear-gradient(180deg,#07143d 0%,#02071f 100%)',
        color: '#fff',
      }}
    >
      <Toolbar
        sx={{
          minHeight: '72px !important',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{
              color: '#fff',
              lineHeight: 1.1,
            }}
          >
            Admin Panel
          </Typography>

          <Typography
            sx={{
              color: '#7186c3',
              fontSize: 10,
              mt: 0.5,
              letterSpacing: 1,
            }}
          >
            GLOBAL DIGITAL MARKET
          </Typography>
        </Box>

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
          px: 1.5,
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
                minHeight: 48,
                mb: 0.5,
                borderRadius: 2,
                color: selected
                  ? '#5ce8ff'
                  : '#a5b5df',

                '& .MuiListItemIcon-root': {
                  color: selected
                    ? '#5ce8ff'
                    : '#7186c3',
                  minWidth: 42,
                },

                '&:hover': {
                  background:
                    'rgba(92,232,255,0.08)',
                  color: '#fff',

                  '& .MuiListItemIcon-root': {
                    color: '#5ce8ff',
                  },
                },

                '&.Mui-selected': {
                  background:
                    'rgba(92,232,255,0.10)',
                },

                '&.Mui-selected:hover': {
                  background:
                    'rgba(92,232,255,0.14)',
                },
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: 13,
                  fontWeight: selected
                    ? 800
                    : 600,
                }}
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
        width: '100%',
        minHeight: '100vh',
        background: '#02071f',
      }}
    >
      {/* MOBILE MENU BUTTON */}

      <Box
        sx={{
          position: 'fixed',
          top: 12,
          left: 12,
          zIndex: 1300,
          display: {
            xs: 'block',
            md: 'none',
          },
        }}
      >
        <IconButton
          onClick={() =>
            setMobileOpen(true)
          }
          sx={{
            color: '#5ce8ff',
            background:
              'rgba(2,7,31,0.92)',
            border:
              '1px solid rgba(92,232,255,0.20)',
            '&:hover': {
              background:
                'rgba(2,7,31,1)',
            },
          }}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* DESKTOP SIDEBAR */}

      <Box
        component="nav"
        sx={{
          width: {
            md: drawerWidth,
          },
          flexShrink: {
            md: 0,
          },
        }}
      >
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
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>

        <Drawer
          variant="permanent"
          open
          sx={{
            display: {
              xs: 'none',
              md: 'block',
            },

            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              border: 'none',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* MAIN CONTENT */}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: '100%',
            md: `calc(100% - ${drawerWidth}px)`,
          },
          minWidth: 0,
          minHeight: '100vh',
          overflow: 'hidden',
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
