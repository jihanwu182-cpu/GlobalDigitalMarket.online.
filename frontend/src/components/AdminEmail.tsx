import React, { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EmailIcon from '@mui/icons-material/Email';
import SendIcon from '@mui/icons-material/Send';

import apiClient from '../services/apiClient';

interface User {
  id: number;
  email: string;
  first_name?: string;
  last_name?: string;
}

const AdminEmail: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [sending, setSending] = useState(false);

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoadingUsers(true);
        setErrorMessage('');

        const response = await apiClient.get('/admin/users');

        const data = response.data;

        const userList =
          data?.users ||
          data?.data ||
          (Array.isArray(data) ? data : []);

        setUsers(userList);
      } catch (error: any) {
        console.error('Failed to load users:', error);

        setErrorMessage(
          error?.response?.data?.error ||
            error?.response?.data?.message ||
            'Failed to load users.'
        );
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, []);

  const handleSendEmail = async () => {
    setSuccessMessage('');
    setErrorMessage('');

    if (!selectedUserId) {
      setErrorMessage('Please select a user.');
      return;
    }

    if (!subject.trim()) {
      setErrorMessage('Please enter an email subject.');
      return;
    }

    if (!message.trim()) {
      setErrorMessage('Please enter your message.');
      return;
    }

    try {
      setSending(true);

      const response = await apiClient.post('/email', {
        userId: Number(selectedUserId),
        subject: subject.trim(),
        message: message.trim(),
      });

      setSuccessMessage(
        response.data?.message || 'Email sent successfully.'
      );

      setSubject('');
      setMessage('');
    } catch (error: any) {
      console.error('Failed to send email:', error);

      setErrorMessage(
        error?.response?.data?.error ||
          error?.response?.data?.message ||
          'Failed to send email.'
      );
    } finally {
      setSending(false);
    }
  };

  const selectedUser = users.find(
    (user) => String(user.id) === selectedUserId
  );

  return (
    <Box sx={{ width: '100%' }}>
      <Stack
        direction="row"
        spacing={1.5}
        alignItems="center"
        sx={{ mb: 3 }}
      >
        <EmailIcon color="primary" />
        <Typography variant="h5" fontWeight={700}>
          Email
        </Typography>
      </Stack>

      <Card>
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Stack spacing={3}>
            <Typography variant="body1" color="text.secondary">
              Send an email directly to a registered user through your
              company email address.
            </Typography>

            {successMessage && (
              <Alert severity="success">
                {successMessage}
              </Alert>
            )}

            {errorMessage && (
              <Alert severity="error">
                {errorMessage}
              </Alert>
            )}

            <FormControl fullWidth>
              <InputLabel id="email-user-label">
                Select User
              </InputLabel>

              <Select
                labelId="email-user-label"
                value={selectedUserId}
                label="Select User"
                onChange={(event) =>
                  setSelectedUserId(event.target.value)
                }
                disabled={loadingUsers || sending}
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
                      {user.first_name || user.last_name
                        ? `${user.first_name || ''} ${
                            user.last_name || ''
                          } — ${user.email}`
                        : user.email}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {selectedUser && (
              <Alert severity="info">
                Email will be sent to:{' '}
                <strong>{selectedUser.email}</strong>
              </Alert>
            )}

            <TextField
              fullWidth
              label="Subject"
              value={subject}
              onChange={(event) =>
                setSubject(event.target.value)
              }
              disabled={sending}
              placeholder="Enter email subject"
            />

            <TextField
              fullWidth
              multiline
              minRows={8}
              label="Message"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              disabled={sending}
              placeholder="Write your message here..."
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
              onClick={handleSendEmail}
              disabled={sending || loadingUsers}
              sx={{
                alignSelf: { xs: 'stretch', sm: 'flex-start' },
                px: 4,
                py: 1.4,
              }}
            >
              {sending ? 'Sending...' : 'Send Email'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminEmail;
