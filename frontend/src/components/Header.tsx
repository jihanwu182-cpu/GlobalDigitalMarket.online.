import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Menu,
  MenuItem,
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
          gap: 2,
        }}
      >
        {/* ==================================================
            GLOBALDIGITALMARKET LOGO
        ================================================== */}

        <Box
          component="img"
          src={logo}
          alt="GlobalDigitalMarket"
          sx={{
            width: {
              xs: 130,
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
            WELCOME MESSAGE
        ================================================== */}

        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 1,
            fontSize: {
              xs: '0.95rem',
              sm: '1.25rem',
            },
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
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
              mr: {
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
