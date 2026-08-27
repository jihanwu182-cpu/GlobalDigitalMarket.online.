import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
} from '@mui/material';

import {
  Dashboard as DashboardIcon,
  Work as PortfolioIcon,
  TrendingUp as TradingIcon,
  Equalizer as MarketIcon,
  AccountBalance as WalletIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';

import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout } from '../store/authSlice';

const DRAWER_WIDTH = 240;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      path: '/',
    },
    {
      text: 'Portfolio',
      icon: <PortfolioIcon />,
      path: '/portfolio',
    },
    {
      text: 'Trading',
      icon: <TradingIcon />,
      path: '/trading',
    },
    {
      text: 'Market',
      icon: <MarketIcon />,
      path: '/market',
    },
    {
      text: 'Wallet',
      icon: <WalletIcon />,
      path: '/wallet',
    },
  ];

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Drawer
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,

        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          backgroundColor: '#1a1a2e',
          color: '#fff',
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Box
        sx={{
          p: 2,
          textAlign: 'center',
          borderBottom: '1px solid #333',
        }}
      >
        <Typography
          variant="h5"
          component="div"
          sx={{
            fontWeight: 'bold',
          }}
        >
          GlobalDigitalMarket.online
        </Typography>
      </Box>

      <List sx={{ flex: 1 }}>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            sx={{
              cursor: 'pointer',

              '&:hover': {
                backgroundColor: '#16213e',
              },
            }}
          >
            <ListItemIcon
              sx={{
                color: '#fff',
                minWidth: 40,
              }}
            >
              {item.icon}
            </ListItemIcon>

            <ListItemText
              primary={item.text}
            />
          </ListItem>
        ))}
      </List>

      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #333',
        }}
      >
        <ListItem
          button
          onClick={handleLogout}
          sx={{
            cursor: 'pointer',
          }}
        >
          <ListItemIcon
            sx={{
              color: '#fff',
              minWidth: 40,
            }}
          >
            <LogoutIcon />
          </ListItemIcon>

          <ListItemText
            primary="Logout"
          />
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default Sidebar;
