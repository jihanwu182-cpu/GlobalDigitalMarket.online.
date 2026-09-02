import React, { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import SendIcon from '@mui/icons-material/Send';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';

import apiClient from '../services/apiClient';

interface Conversation {
  id: number;
  user_id: number;
  status: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;

  first_name?: string;
  last_name?: string;
  username?: string;
  email?: string;

  unread_count?: number;
}

interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_role: 'user' | 'admin';
  message: string;
  is_read: boolean;
  read_at?: string | null;
  created_at: string;

  first_name?: string;
  last_name?: string;
  email?: string;
}

const AdminLiveChat: React.FC = () => {
  const [conversations, setConversations] =
    useState<Conversation[]>([]);

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [message, setMessage] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState('');

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  // ==========================================================
  // LOAD CONVERSATIONS
  // ==========================================================

  const loadConversations = async () => {
    try {
      setError('');

      const response =
        await apiClient.get(
          '/support/admin/conversations'
        );

      setConversations(
        response.data?.conversations || []
      );
    } catch (err: any) {
      console.error(
        'Unable to load support conversations:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to load Live Chat conversations.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // LOAD MESSAGES
  // ==========================================================

  const loadMessages = async (
    conversationId: number
  ) => {
    try {
      setMessagesLoading(true);
      setError('');

      const response =
        await apiClient.get(
          `/support/admin/conversations/${conversationId}/messages`
        );

      setMessages(
        response.data?.messages || []
      );

      await apiClient.patch(
        `/support/admin/conversations/${conversationId}/read`
      );

      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === conversationId
            ? {
                ...conversation,
                unread_count: 0,
              }
            : conversation
        )
      );
    } catch (err: any) {
      console.error(
        'Unable to load support messages:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to load chat messages.'
      );
    } finally {
      setMessagesLoading(false);
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    loadConversations();
  }, []);

  // ==========================================================
  // LOAD SELECTED CONVERSATION
  // ==========================================================

  useEffect(() => {
    if (!selectedConversation?.id) {
      return;
    }

    loadMessages(
      selectedConversation.id
    );
  }, [selectedConversation?.id]);

  // ==========================================================
  // AUTO REFRESH
  // ==========================================================

  useEffect(() => {
    const interval =
      window.setInterval(() => {
        loadConversations();

        if (selectedConversation?.id) {
          loadMessages(
            selectedConversation.id
          );
        }
      }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [selectedConversation?.id]);

  // ==========================================================
  // SCROLL
  // ==========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // ==========================================================
  // SELECT CONVERSATION
  // ==========================================================

  const selectConversation = (
    conversation: Conversation
  ) => {
    setSelectedConversation(
      conversation
    );
  };

  // ==========================================================
  // SEND ADMIN MESSAGE
  // ==========================================================

  const sendMessage = async (
    event?: React.FormEvent
  ) => {
    event?.preventDefault();

    const trimmed =
      message.trim();

    if (
      !trimmed ||
      sending ||
      !selectedConversation
    ) {
      return;
    }

    try {
      setSending(true);
      setError('');

      const response =
        await apiClient.post(
          `/support/admin/conversations/${selectedConversation.id}/messages`,
          {
            message: trimmed,
          }
        );

      setMessages((current) => [
        ...current,
        response.data.message,
      ]);

      setMessage('');

      await loadConversations();
    } catch (err: any) {
      console.error(
        'Unable to send admin support message:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to send message.'
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================================
  // CLOSE CONVERSATION
  // ==========================================================

  const closeConversation = async () => {
    if (!selectedConversation) {
      return;
    }

    if (
      !window.confirm(
        'Close this support conversation?'
      )
    ) {
      return;
    }

    try {
      await apiClient.patch(
        `/support/admin/conversations/${selectedConversation.id}/close`
      );

      setSelectedConversation(
        (current) =>
          current
            ? {
                ...current,
                status: 'CLOSED',
              }
            : current
      );

      await loadConversations();
    } catch (err: any) {
      console.error(
        'Unable to close conversation:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to close conversation.'
      );
    }
  };

  // ==========================================================
  // HELPERS
  // ==========================================================

  const formatTime = (
    value?: string
  ) => {
    if (!value) {
      return '';
    }

    try {
      return new Date(
        value
      ).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  const formatDate = (
    value?: string
  ) => {
    if (!value) {
      return '';
    }

    try {
      return new Date(
        value
      ).toLocaleString();
    } catch {
      return '';
    }
  };

  const getUserName = (
    conversation: Conversation
  ) => {
    const fullName = [
      conversation.first_name,
      conversation.last_name,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      fullName ||
      conversation.username ||
      conversation.email ||
      `User #${conversation.user_id}`
    );
  };

  const totalUnread =
    conversations.reduce(
      (total, conversation) =>
        total +
        Number(
          conversation.unread_count || 0
        ),
      0
    );

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Stack spacing={3}>

      {/* HEADER */}

      <Stack
        direction={{
          xs: 'column',
          sm: 'row',
        }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box>
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <SupportAgentIcon
              sx={{
                fontSize: 36,
              }}
            />

            <Typography
              variant="h4"
              fontWeight={800}
            >
              Live Chat
            </Typography>

            {totalUnread > 0 && (
              <Badge
                badgeContent={totalUnread}
                color="error"
              >
                <Chip
                  label="Unread"
                  color="error"
                  size="small"
                />
              </Badge>
            )}
          </Stack>

          <Typography
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Respond to users through the GlobalDigitalMarket
            support chat.
          </Typography>
        </Box>

        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadConversations}
          disabled={loading}
        >
          Refresh
        </Button>
      </Stack>

      {error && (
        <Alert
          severity="error"
          onClose={() =>
            setError('')
          }
        >
          {error}
        </Alert>
      )}

      {/* CHAT */}

      <Card
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            height: {
              xs: '70vh',
              md: '650px',
            },
          }}
        >

          {/* ==================================================
              CONVERSATIONS
          ================================================== */}

          <Box
            sx={{
              width: {
                xs: selectedConversation
                  ? 0
                  : '100%',
                md: 330,
              },
              minWidth: {
                xs: selectedConversation
                  ? 0
                  : '100%',
                md: 330,
              },
              display: {
                xs: selectedConversation
                  ? 'none'
                  : 'block',
                md: 'block',
              },
              borderRight: {
                md: '1px solid',
              },
              borderColor: {
                md: 'divider',
              },
              overflowY: 'auto',
            }}
          >
            <Box
              sx={{
                p: 2,
                position: 'sticky',
                top: 0,
                backgroundColor:
                  'background.paper',
                zIndex: 1,
                borderBottom:
                  '1px solid',
                borderColor:
                  'divider',
              }}
            >
              <Typography
                fontWeight={800}
              >
                Conversations
              </Typography>

              <Typography
                variant="caption"
                color="text.secondary"
              >
                {conversations.length}{' '}
                conversation
                {conversations.length === 1
                  ? ''
                  : 's'}
              </Typography>
            </Box>

            {loading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent:
                    'center',
                  py: 5,
                }}
              >
                <CircularProgress />
              </Box>
            ) : conversations.length === 0 ? (
              <Box
                sx={{
                  p: 3,
                  textAlign: 'center',
                }}
              >
                <SupportAgentIcon
                  sx={{
                    fontSize: 45,
                    opacity: 0.5,
                  }}
                />

                <Typography
                  fontWeight={700}
                  sx={{ mt: 1 }}
                >
                  No conversations
                </Typography>

                <Typography
                  variant="body2"
                  color="text.secondary"
                >
                  User support conversations
                  will appear here.
                </Typography>
              </Box>
            ) : (
              <List
                disablePadding
              >
                {conversations.map(
                  (conversation) => {
                    const unread =
                      Number(
                        conversation.unread_count ||
                          0
                      );

                    const selected =
                      selectedConversation?.id ===
                      conversation.id;

                    return (
                      <ListItemButton
                        key={
                          conversation.id
                        }
                        selected={
                          selected
                        }
                        onClick={() =>
                          selectConversation(
                            conversation
                          )
                        }
                        sx={{
                          px: 2,
                          py: 1.5,
                          borderBottom:
                            '1px solid',
                          borderColor:
                            'divider',
                        }}
                      >
                        <ListItemText
                          primary={
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              spacing={1}
                            >
                              <Typography
                                fontWeight={
                                  unread > 0
                                    ? 800
                                    : 600
                                }
                                noWrap
                              >
                                {getUserName(
                                  conversation
                                )}
                              </Typography>

                              {unread > 0 && (
                                <Chip
                                  label={
                                    unread
                                  }
                                  size="small"
                                  color="error"
                                  sx={{
                                    minWidth: 28,
                                  }}
                                />
                              )}
                            </Stack>
                          }
                          secondary={
                            <Stack
                              spacing={0.3}
                              sx={{ mt: 0.3 }}
                            >
                              <Typography
                                variant="caption"
                                noWrap
                                component="span"
                              >
                                {
                                  conversation.email
                                }
                              </Typography>

                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {formatDate(
                                  conversation.last_message_at
                                )}
                              </Typography>
                            </Stack>
                          }
                        />
                      </ListItemButton>
                    );
                  }
                )}
              </List>
            )}
          </Box>

          {/* ==================================================
              CHAT WINDOW
          ================================================== */}

          <Box
            sx={{
              flex: 1,
              display: {
                xs: selectedConversation
                  ? 'flex'
                  : 'none',
                md: 'flex',
              },
              flexDirection: 'column',
              minWidth: 0,
            }}
          >

            {!selectedConversation ? (
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'center',
                  textAlign: 'center',
                  p: 4,
                }}
              >
                <Stack
                  spacing={1}
                  alignItems="center"
                >
                  <SupportAgentIcon
                    sx={{
                      fontSize: 70,
                      opacity: 0.35,
                    }}
                  />

                  <Typography
                    variant="h6"
                    fontWeight={800}
                  >
                    Select a conversation
                  </Typography>

                  <Typography
                    color="text.secondary"
                  >
                    Choose a user from the
                    conversation list to view
                    and reply to their messages.
                  </Typography>
                </Stack>
              </Box>
            ) : (
              <>
                {/* CHAT HEADER */}

                <Box
                  sx={{
                    px: 2,
                    py: 1.5,
                    borderBottom:
                      '1px solid',
                    borderColor:
                      'divider',
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <IconButton
                      sx={{
                        display: {
                          xs: 'inline-flex',
                          md: 'none',
                        },
                      }}
                      onClick={() =>
                        setSelectedConversation(
                          null
                        )
                      }
                    >
                      <CloseIcon />
                    </IconButton>

                    <Box
                      sx={{
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <Typography
                        fontWeight={800}
                        noWrap
                      >
                        {getUserName(
                          selectedConversation
                        )}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="text.secondary"
                        noWrap
                      >
                        {
                          selectedConversation.email
                        }
                      </Typography>
                    </Box>

                    <Chip
                      size="small"
                      label={
                        selectedConversation.status
                      }
                      color={
                        String(
                          selectedConversation.status
                        ).toUpperCase() ===
                        'OPEN'
                          ? 'success'
                          : 'default'
                      }
                    />

                    {String(
                      selectedConversation.status
                    ).toUpperCase() ===
                      'OPEN' && (
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={
                          closeConversation
                        }
                      >
                        Close
                      </Button>
                    )}
                  </Stack>
                </Box>

                {/* MESSAGES */}

                <Box
                  sx={{
                    flex: 1,
                    overflowY: 'auto',
                    p: {
                      xs: 1.5,
                      md: 3,
                    },
                    backgroundColor:
                      'background.default',
                  }}
                >
                  {messagesLoading ? (
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent:
                          'center',
                        py: 5,
                      }}
                    >
                      <CircularProgress />
                    </Box>
                  ) : messages.length === 0 ? (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems:
                          'center',
                        justifyContent:
                          'center',
                      }}
                    >
                      <Typography
                        color="text.secondary"
                      >
                        No messages yet.
                      </Typography>
                    </Box>
                  ) : (
                    <Stack spacing={1.5}>
                      {messages.map(
                        (chatMessage) => {
                          const isAdmin =
                            chatMessage.sender_role ===
                            'admin';

                          return (
                            <Box
                              key={
                                chatMessage.id
                              }
                              sx={{
                                display:
                                  'flex',
                                justifyContent:
                                  isAdmin
                                    ? 'flex-end'
                                    : 'flex-start',
                              }}
                            >
                              <Paper
                                elevation={0}
                                sx={{
                                  maxWidth: {
                                    xs: '85%',
                                    md: '70%',
                                  },
                                  px: 2,
                                  py: 1.2,
                                  borderRadius: 3,
                                  backgroundColor:
                                    isAdmin
                                      ? 'primary.main'
                                      : 'background.paper',
                                  color:
                                    isAdmin
                                      ? 'primary.contrastText'
                                      : 'text.primary',
                                }}
                              >
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display:
                                      'block',
                                    fontWeight:
                                      800,
                                    opacity:
                                      0.75,
                                    mb: 0.4,
                                  }}
                                >
                                  {isAdmin
                                    ? 'You / Support'
                                    : getUserName(
                                        selectedConversation
                                      )}
                                </Typography>

                                <Typography
                                  sx={{
                                    whiteSpace:
                                      'pre-wrap',
                                    wordBreak:
                                      'break-word',
                                  }}
                                >
                                  {
                                    chatMessage.message
                                  }
                                </Typography>

                                <Typography
                                  variant="caption"
                                  sx={{
                                    display:
                                      'block',
                                    textAlign:
                                      'right',
                                    opacity:
                                      0.65,
                                    mt: 0.5,
                                  }}
                                >
                                  {formatTime(
                                    chatMessage.created_at
                                  )}
                                </Typography>
                              </Paper>
                            </Box>
                          );
                        }
                      )}

                      <div
                        ref={
                          messagesEndRef
                        }
                      />
                    </Stack>
                  )}
                </Box>

                {/* INPUT */}

                <Box
                  component="form"
                  onSubmit={sendMessage}
                  sx={{
                    p: {
                      xs: 1.5,
                      md: 2,
                    },
                    borderTop:
                      '1px solid',
                    borderColor:
                      'divider',
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="flex-end"
                  >
                    <TextField
                      fullWidth
                      multiline
                      maxRows={4}
                      placeholder={
                        String(
                          selectedConversation.status
                        ).toUpperCase() ===
                        'OPEN'
                          ? 'Type your reply...'
                          : 'Conversation is closed'
                      }
                      value={message}
                      disabled={
                        sending ||
                        String(
                          selectedConversation.status
                        ).toUpperCase() !==
                          'OPEN'
                      }
                      onChange={(event) =>
                        setMessage(
                          event.target.value
                        )
                      }
                      onKeyDown={(event) => {
                        if (
                          event.key ===
                            'Enter' &&
                          !event.shiftKey
                        ) {
                          event.preventDefault();
                          sendMessage();
                        }
                      }}
                    />

                    <IconButton
                      type="submit"
                      disabled={
                        sending ||
                        !message.trim() ||
                        String(
                          selectedConversation.status
                        ).toUpperCase() !==
                          'OPEN'
                      }
                      color="primary"
                      sx={{
                        width: 50,
                        height: 50,
                      }}
                    >
                      {sending ? (
                        <CircularProgress
                          size={22}
                        />
                      ) : (
                        <SendIcon />
                      )}
                    </IconButton>
                  </Stack>
                </Box>
              </>
            )}
          </Box>
        </Box>
      </Card>
    </Stack>
  );
};

export default AdminLiveChat;
