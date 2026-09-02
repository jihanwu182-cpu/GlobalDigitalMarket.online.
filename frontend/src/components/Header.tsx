import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { logout } from '../store/authSlice';
import { useNavigate } from 'react-router-dom';

// Website logo
import logo from '../GlobalDigitalMarket-logo-clean.png';

const Header: React.FC = () => {
  const [anchorEl, setAnchorEl] =
    React.useState<null | HTMLElement>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(
    (state: RootState) => state.auth.user
  );

  const handleMenu = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleClose();
  };

  return (
    <AppBar
      position="static"
      sx={{
        backgroundColor: '#16213e',
      }}
    >
      <Toolbar
        sx={{
          minHeight: {
            xs: 64,
            sm: 72,
          },
          gap: 1,
        }}
      >
        {/* ==================================================
            GLOBAL DIGITAL MARKET LOGO
        ================================================== */}

        <Box
          component="img"
          src={logo}
          alt="GlobalDigitalMarket"
          sx={{
            width: {
              xs: 120,
              sm: 165,
            },
            height: {
              xs: 48,
              sm: 58,
            },
            objectFit: 'contain',
            display: 'block',
            flexShrink: 0,
            backgroundColor: '#ffffff',
            borderRadius: '6px',
            p: '3px',
          }}
        />

        {/* ==================================================
            WEBSITE NAVIGATION
        ================================================== */}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: {
              xs: 0.5,
              sm: 1,
            },
            ml: {
              xs: 0.5,
              sm: 2,
            },
          }}
        >
          <Button
            color="inherit"
            onClick={() => navigate('/')}
            sx={{
              minWidth: 'auto',
              fontWeight: 600,
              display: {
                xs: 'none',
                sm: 'inline-flex',
              },
            }}
          >
            Home
          </Button>

          <Button
            color="inherit"
            onClick={() => navigate('/company')}
            sx={{
              minWidth: 'auto',
              fontWeight: 600,
            }}
          >
            Company
          </Button>
        </Box>

        {/* ==================================================
            WELCOME MESSAGE
        ================================================== */}

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            textAlign: 'right',
            fontSize: {
              xs: '0.85rem',
              sm: '1.1rem',
            },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            ml: 1,
          }}
        >
          Welcome, {user?.firstName || 'User'}
        </Typography>

        {/* ==================================================
            USER MENU
        ================================================== */}

        <Box>
          <IconButton
            size="large"
            onClick={handleMenu}
            color="inherit"
            sx={{
              ml: {
                xs: 0,
                sm: 1,
              },
            }}
          >
            <AccountCircle />
          </IconButton>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
          >
            <MenuItem disabled>
              {user?.email}
            </MenuItem>

            <MenuItem onClick={handleClose}>
              Profile
            </MenuItem>

            <MenuItem onClick={handleLogout}>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
