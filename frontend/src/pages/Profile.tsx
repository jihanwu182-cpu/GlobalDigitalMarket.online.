import React, { useEffect, useMemo, useState } from 'react';

import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LogoutIcon from '@mui/icons-material/Logout';

import { useNavigate } from 'react-router-dom';

import apiClient from '../services/apiClient';

interface UserProfile {
  name: string;
  email: string;
  username: string;
  accountId: string;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    username: '',
    accountId: '',
  });

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError('');

      /*
       * Try the real backend profile endpoint first.
       */
      try {
        const response = await apiClient.get('/auth/profile');

        const data = response.data || {};
        const user = data.user || data;

        const firstName = String(
          user.firstName ||
            user.first_name ||
            ''
        ).trim();

        const lastName = String(
          user.lastName ||
            user.last_name ||
            ''
        ).trim();

        const combinedName =
          `${firstName} ${lastName}`.trim();

        const loadedProfile: UserProfile = {
          name: String(
            user.name ||
              user.fullName ||
              user.full_name ||
              combinedName ||
              ''
          ).trim(),

          email: String(
            user.email ||
              user.emailAddress ||
              ''
          ).trim(),

          username: String(
            user.username ||
              user.userName ||
              ''
          ).trim(),

          accountId: String(
            user.accountId ||
              user.account_id ||
              user.id ||
              user._id ||
              ''
          ).trim(),
        };

        setProfile(loadedProfile);
        setName(loadedProfile.name);
        setUsername(loadedProfile.username);

        return;
      } catch (backendError) {
        console.warn(
          'Backend profile endpoint unavailable. Reading stored account information.'
        );
      }

      /*
       * Fallback to information saved during login.
       */
      const possibleKeys = [
        'user',
        'currentUser',
        'authUser',
        'profile',
      ];

      let storedUser: any = null;

      for (const key of possibleKeys) {
        const value = localStorage.getItem(key);

        if (!value) {
          continue;
        }

        try {
          const parsed = JSON.parse(value);

          if (
            parsed &&
            typeof parsed === 'object'
          ) {
            storedUser = parsed;
            break;
          }
        } catch {
          // Continue checking other keys.
        }
      }

      /*
       * Try to read user information from JWT.
       */
      const token =
        localStorage.getItem('token') ||
        localStorage.getItem('accessToken') ||
        localStorage.getItem('authToken');

      let tokenUser: any = null;

      if (token) {
        try {
          const parts = token.split('.');

          if (parts.length === 3) {
            const normalized = parts[1]
              .replace(/-/g, '+')
              .replace(/_/g, '/');

            const decoded = decodeURIComponent(
              Array.prototype.map
                .call(
                  atob(normalized),
                  (character: string) =>
                    `%${(
                      '00' +
                      character
                        .charCodeAt(0)
                        .toString(16)
                    ).slice(-2)}`
                )
                .join('')
            );

            tokenUser = JSON.parse(decoded);
          }
        } catch {
          // Invalid JWT payload.
        }
      }

      const user = {
        ...(tokenUser || {}),
        ...(storedUser || {}),
      };

      const firstName = String(
        user.firstName ||
          user.first_name ||
          ''
      ).trim();

      const lastName = String(
        user.lastName ||
          user.last_name ||
          ''
      ).trim();

      const combinedName =
        `${firstName} ${lastName}`.trim();

      const loadedProfile: UserProfile = {
        name: String(
          user.name ||
            user.fullName ||
            user.full_name ||
            combinedName ||
            ''
        ).trim(),

        email: String(
          user.email ||
            user.emailAddress ||
            ''
        ).trim(),

        username: String(
          user.username ||
            user.userName ||
            ''
        ).trim(),

        accountId: String(
          user.accountId ||
            user.account_id ||
            user.id ||
            user._id ||
            ''
        ).trim(),
      };

      setProfile(loadedProfile);
      setName(loadedProfile.name);
      setUsername(loadedProfile.username);
    } catch (err) {
      console.error(
        'Profile loading error:',
        err
      );

      setError(
        'Unable to load your account profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const displayName = useMemo(() => {
    if (profile.name) {
      return profile.name;
    }

    if (profile.username) {
      return profile.username;
    }

    return 'Account Holder';
  }, [profile.name, profile.username]);

  const initials = useMemo(() => {
    if (displayName) {
      const parts = displayName
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      if (parts.length >= 2) {
        return (
          parts[0][0] +
          parts[parts.length - 1][0]
        ).toUpperCase();
      }

      return parts[0][0].toUpperCase();
    }

    return 'A';
  }, [displayName]);

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!username.trim()) {
      setError('Please enter your username.');
      return;
    }

    try {
      setSaving(true);

      /*
       * Try to save to the backend first.
       */
      try {
        await apiClient.put('/auth/profile', {
          name: name.trim(),
          username: username.trim(),
        });

        setProfile((previous) => ({
          ...previous,
          name: name.trim(),
          username: username.trim(),
        }));

        setSuccess(
          'Your profile has been updated successfully.'
        );

        return;
      } catch (backendError) {
        console.warn(
          'Backend profile update unavailable.',
          backendError
        );
      }

      /*
       * If backend update is not available,
       * keep the local account information synchronized.
       */
      const possibleKeys = [
        'user',
        'currentUser',
        'authUser',
        'profile',
      ];

      let updated = false;

      for (const key of possibleKeys) {
        const value = localStorage.getItem(key);

        if (!value) {
          continue;
        }

        try {
          const parsed = JSON.parse(value);

          if (
            parsed &&
            typeof parsed === 'object'
          ) {
            const updatedUser = {
              ...parsed,
              name: name.trim(),
              username: username.trim(),
            };

            localStorage.setItem(
              key,
              JSON.stringify(updatedUser)
            );

            updated = true;
            break;
          }
        } catch {
          // Continue.
        }
      }

      setProfile((previous) => ({
        ...previous,
        name: name.trim(),
        username: username.trim(),
      }));

      setSuccess(
        updated
          ? 'Profile information updated on this device.'
          : 'Profile information updated for this session.'
      );
    } catch (err) {
      console.error(
        'Profile update error:',
        err
      );

      setError(
        'Unable to update your profile.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    const keys = [
      'token',
      'accessToken',
      'authToken',
      'user',
      'currentUser',
      'authUser',
      'profile',
    ];

    keys.forEach((key) =>
      localStorage.removeItem(key)
    );

    navigate('/login');
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#fff',
        background:
          'radial-gradient(circle at top right, rgba(25,84,199,0.30), transparent 30%), linear-gradient(180deg,#02071f 0%,#071453 55%,#091b68 100%)',
        pb: 6,
      }}
    >
      {/* HEADER */}

      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          background:
            'rgba(2,7,31,0.96)',
          backdropFilter: 'blur(14px)',
          borderBottom:
            '1px solid rgba(125,150,255,0.
