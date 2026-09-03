import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';

import apiClient from '../services/apiClient';

interface User {
  id: number;
  first_name?: string;
  last_name?: string;
  email: string;
}

interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

const AdminNotifications: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [notifications, setNotifications] = useState<
    Notification[]
  >([]);

  const [selectedUser, setSelectedUser] =
    useState('');

  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('INFO');

  const [loadingUsers, setLoadingUsers] =
    useState(true);

  const [loadingNotifications, setLoadingNotifications] =
    useState(true);

  const [sending, setSending] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // ============================================================
  // LOAD USERS
  // ============================================================

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      setError('');

      const response =
        await apiClient.get('/admin/users');

      const data =
        response.data?.users ||
        response.data ||
        [];

      setUsers(data);
    } catch (err: any) {
      console.error(
        'Failed to load users:',
        err
      );

      setError(
        err?.response?.data?.error ||
          'Unable to load users.'
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // ============================================================
  // LOAD NOTIFICATIONS
  // ============================================================

  const loadNotifications = async () => {
    try {
      setLoadingNotifications(true);

      const response =
        await apiClient.get(
          '/admin/notifications'
        );

      setNotifications(
        response.data?.notifications ||
          []
      );
    } catch (err: any) {
      console.error(
        'Failed to load notifications:',
        err
      );

      setError(
        err?.response?.data?.error ||
          'Unable to load notifications.'
      );
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadNotifications();
  }, []);

  // ============================================================
  // SEND NOTIFICATION
  // ============================================================

  const handleSend = async () => {
    setSuccess('');
    setError('');

    if (!selectedUser) {
      setError('Please select a user.');
      return;
    }

    if (!title.trim()) {
      setError(
        'Please enter a notification title.'
      );
      return;
    }

    if (!message.trim()) {
      setError(
        'Please enter a notification message.'
      );
      return;
    }

    try {
      setSending(true);

      await apiClient.post(
        '/admin/notifications',
        {
          userId: Number(selectedUser),
          title: title.trim(),
          message: message.trim(),
          type,
        }
      );

      setSuccess(
        'Notification sent successfully.'
      );

      setTitle('');
      setMessage('');
      setType('INFO');

      await loadNotifications();
    } catch (err: any) {
      console.error(
        'Failed to send notification:',
        err
      );

      setError(
        err?.response?.data?.error ||
          err?.response?.data?.message ||
          'Unable to send notification.'
      );
    } finally {
      setSending(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getUserName = (
    user: User
  ) => {
    const name =
      `${user.first_name || ''} ${
        user.last_name || ''
      }`.trim();

    return name || user.email;
  };

  const getNotificationUser = (
    notification: Notification
  ) => {
    const name =
      `${notification.first_name || ''} ${
        notification.last_name || ''
      }`.trim();

    return (
      name ||
      notification.email ||
      `User #${notification.user_id}`
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <Box
      sx={{
        p: {
          xs: 2,
          md: 3,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <NotificationsActiveIcon
          color="primary"
        />

        <Box>
          <Typography
            variant="h5"
            fontWeight={800}
          >
            Notifications
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Send notifications directly to
            users on their dashboard.
          </Typography>
        </Box>
      </Stack>

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() =>
            setSuccess('')
          }
        >
          {success}
        </Alert>
      )}

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() =>
            setError('')
          }
        >
          {error}
        </Alert>
      )}

      {/* ======================================================
          CREATE NOTIFICATION
      ====================================================== */}

      <Card
        sx={{
          borderRadius: 3,
          mb: 3,
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <SendIcon color="primary" />

            <Typography
              variant="h6"
              fontWeight={700}
            >
              Send Notification
            </Typography>
          </Stack>

          <Stack spacing={2}>
            <FormControl fullWidth>
              <InputLabel>
                Select User
              </InputLabel>

              <Select
                value={selectedUser}
                label="Select User"
                onChange={(event) =>
                  setSelectedUser(
                    event.target.value
                  )
                }
                disabled={loadingUsers}
              >
                {loadingUsers ? (
                  <MenuItem disabled>
                    Loading users...
                  </MenuItem>
                ) : users.length === 0 ? (
                  <MenuItem disabled>
                    No users found
                  </MenuItem>
                ) : (
                  users.map((user) => (
                    <MenuItem
                      key={user.id}
                      value={String(user.id)}
                    >
                      {getUserName(user)} —{' '}
                      {user.email}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              label="Notification Title"
              placeholder="Account Update"
              value={title}
              onChange={(event) =>
                setTitle(event.target.value)
              }
            />

            <FormControl fullWidth>
              <InputLabel>
                Notification Type
              </InputLabel>

              <Select
                value={type}
                label="Notification Type"
                onChange={(event) =>
                  setType(event.target.value)
                }
              >
                <MenuItem value="INFO">
                  Information
                </MenuItem>

                <MenuItem value="SUCCESS">
                  Success
                </MenuItem>

                <MenuItem value="WARNING">
                  Warning
                </MenuItem>

                <MenuItem value="ALERT">
                  Alert
                </MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              multiline
              minRows={5}
              label="Notification Message"
              placeholder="Enter the message the user should see..."
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
            />

            <Button
              variant="contained"
              size="large"
              startIcon={
                sending ? (
                  <CircularProgress
                    size={20}
                    color="inherit"
                  />
                ) : (
                  <SendIcon />
                )
              }
              onClick={handleSend}
              disabled={
                sending ||
                loadingUsers
              }
              sx={{
                alignSelf: {
                  xs: 'stretch',
                  sm: 'flex-start',
                },
                borderRadius: 2,
                fontWeight: 700,
                textTransform: 'none',
              }}
            >
              {sending
                ? 'Sending...'
                : 'Send Notification'}
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* ======================================================
          NOTIFICATION HISTORY
      ====================================================== */}

      <Card
        sx={{
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Notification History
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
              >
                Notifications previously sent
                to users.
              </Typography>
            </Box>

            <Button
              startIcon={<RefreshIcon />}
              onClick={
                loadNotifications
              }
              disabled={
                loadingNotifications
              }
              sx={{
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Refresh
            </Button>
          </Stack>

          <Divider sx={{ mb: 2 }} />

          {loadingNotifications ? (
            <Box
              sx={{
                py: 5,
                textAlign: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : notifications.length ===
            0 ? (
            <Typography
              color="text.secondary"
              sx={{ py: 3 }}
            >
              No notifications have been
              sent yet.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {notifications.map(
                (notification) => (
                  <Box
                    key={notification.id}
                    sx={{
                      p: 2,
                      border: '1px solid',
                      borderColor:
                        'divider',
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction={{
                        xs: 'column',
                        sm: 'row',
                      }}
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <Box>
                        <Typography
                          fontWeight={700}
                        >
                          {notification.title}
                        </Typography>

                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          To:{' '}
                          {getNotificationUser(
                            notification
                          )}
                        </Typography>
                      </Box>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        {new Date(
                          notification.created_at
                        ).toLocaleString()}
                      </Typography>
                    </Stack>

                    <Typography
                      sx={{
                        mt: 1,
                        whiteSpace:
                          'pre-wrap',
                      }}
                    >
                      {notification.message}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: 1,
                        fontWeight: 700,
                      }}
                    >
                      Type:{' '}
                      {notification.type}
                    </Typography>
                  </Box>
                )
              )}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminNotifications;
