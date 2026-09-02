import React, { useEffect, useRef, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Container,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';

import { useNavigate } from 'react-router-dom';

import apiClient from '../services/apiClient';

interface Conversation {
  id: number;
  user_id: number;
  status: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
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
}

const Support: React.FC = () => {
  const navigate = useNavigate();

  const [conversation, setConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] =
    useState<ChatMessage[]>([]);

  const [message, setMessage] =
    useState('');

  const [loading, setLoading] =
    useState(true);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState('');

  const messagesEndRef =
    useRef<HTMLDivElement | null>(null);

  // ==========================================================
  // LOAD CONVERSATION
  // ==========================================================

  const loadConversation = async () => {
    try {
      setError('');

      const response =
        await apiClient.get(
          '/support/conversation'
        );

      setConversation(
        response.data.conversation
      );
    } catch (err: any) {
      console.error(
        'Unable to load support conversation:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to connect to Live Chat.'
      );
    }
  };

  // ==========================================================
  // LOAD MESSAGES
  // ==========================================================

  const loadMessages = async (
    conversationId: number
  ) => {
    try {
      const response =
        await apiClient.get(
          `/support/conversation/${conversationId}/messages`
        );

      setMessages(
        response.data.messages || []
      );

      await apiClient.patch(
        `/support/conversation/${conversationId}/read`
      );
    } catch (err: any) {
      console.error(
        'Unable to load chat messages:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to load chat messages.'
      );
    }
  };

  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {
    const initializeChat = async () => {
      setLoading(true);

      await loadConversation();

      setLoading(false);
    };

    initializeChat();
  }, []);

  // ==========================================================
  // LOAD MESSAGES WHEN CONVERSATION EXISTS
  // ==========================================================

  useEffect(() => {
    if (!conversation?.id) {
      return;
    }

    loadMessages(conversation.id);
  }, [conversation?.id]);

  // ==========================================================
  // AUTO REFRESH CHAT
  // ==========================================================

  useEffect(() => {
    if (!conversation?.id) {
      return;
    }

    const interval = window.setInterval(() => {
      loadMessages(conversation.id);
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [conversation?.id]);

  // ==========================================================
  // SCROLL TO BOTTOM
  // ==========================================================

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  // ==========================================================
  // SEND MESSAGE
  // ==========================================================

  const handleSendMessage = async (
    event?: React.FormEvent
  ) => {
    event?.preventDefault();

    const trimmedMessage =
      message.trim();

    if (
      !trimmedMessage ||
      sending
    ) {
      return;
    }

    try {
      setSending(true);
      setError('');

      let activeConversation =
        conversation;

      // Create conversation if needed.
      if (!activeConversation) {
        const response =
          await apiClient.get(
            '/support/conversation'
          );

        activeConversation =
          response.data.conversation;

        setConversation(
          activeConversation
        );
      }

      const response =
        await apiClient.post(
          `/support/conversation/${activeConversation.id}/messages`,
          {
            message: trimmedMessage,
          }
        );

      setMessages((current) => [
        ...current,
        response.data.message,
      ]);

      setMessage('');

      await apiClient.patch(
        `/support/conversation/${activeConversation.id}/read`
      );
    } catch (err: any) {
      console.error(
        'Unable to send support message:',
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Unable to send your message.'
      );
    } finally {
      setSending(false);
    }
  };

  // ==========================================================
  // FORMAT TIME
  // ==========================================================

  const formatTime = (
    value: string
  ) => {
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

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background:
            'linear-gradient(180deg,#02071f 0%,#071453 55%,#091b68 100%)',
        }}
      >
        <CircularProgress
          sx={{
            color: '#5ce8ff',
          }}
        />
      </Box>
    );
  }

  // ==========================================================
  // PAGE
  // ==========================================================

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#fff',
        background:
          'radial-gradient(circle at top right, rgba(25,84,199,0.30), transparent 30%), linear-gradient(180deg,#02071f 0%,#071453 55%,#091b68 100%)',
        py: {
          xs: 2,
          md: 5,
        },
      }}
    >
      <Container
        maxWidth="md"
      >
        {/* BACK BUTTON */}

        <Button
          startIcon={
            <ArrowBackIcon />
          }
          onClick={() =>
            navigate('/dashboard')
          }
          sx={{
            color: '#fff',
            textTransform: 'none',
            mb: 2,
          }}
        >
          Back to Dashboard
        </Button>

        <Card
          sx={{
            borderRadius: 4,
            color: '#fff',
            background:
              'linear-gradient(145deg,#101f63,#08143f)',
            border:
              '1px solid rgba(100,150,255,0.20)',
            boxShadow:
              '0 20px 60px rgba(0,0,0,0.25)',
            overflow: 'hidden',
          }}
        >
          {/* HEADER */}

          <Box
            sx={{
              px: {
                xs: 2,
                md: 3,
              },
              py: 2,
              borderBottom:
                '1px solid rgba(255,255,255,0.08)',
            }}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
            >
              <Box
                sx={{
                  width: 50,
                  height: 50,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#5ce8ff',
                  background:
                    'rgba(92,232,255,0.10)',
                }}
              >
                <SupportAgentIcon
                  sx={{
                    fontSize: 30,
                  }}
                />
              </Box>

              <Box
                sx={{
                  flex: 1,
                }}
              >
                <Typography
                  sx={{
                    fontSize: {
                      xs: 20,
                      md: 25,
                    },
                    fontWeight: 900,
                  }}
                >
                  GlobalDigitalMarket Support
                </Typography>

                <Stack
                  direction="row"
                  spacing={0.8}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background:
                        '#43e97b',
                    }}
                  />

                  <Typography
                    sx={{
                      color: '#43e97b',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    Online Support
                  </Typography>
                </Stack>
              </Box>
            </Stack>
          </Box>

          <CardContent
            sx={{
              p: 0,
            }}
          >
            {/* ERROR */}

            {error && (
              <Alert
                severity="error"
                onClose={() =>
                  setError('')
                }
                sx={{
                  m: 2,
                }}
              >
                {error}
              </Alert>
            )}

            {/* CHAT AREA */}

            <Box
              sx={{
                height: {
                  xs: '55vh',
                  md: '500px',
                },
                minHeight: 350,
                overflowY: 'auto',
                px: {
                  xs: 1.5,
                  md: 3,
                },
                py: 2,
                background:
                  'rgba(0,0,0,0.12)',
              }}
            >
              {messages.length === 0 ? (
                <Box
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    px: 3,
                  }}
                >
                  <SupportAgentIcon
                    sx={{
                      fontSize: 55,
                      color: '#5ce8ff',
                      mb: 1,
                    }}
                  />

                  <Typography
                    sx={{
                      fontSize: 20,
                      fontWeight: 900,
                    }}
                  >
                    Welcome to Live Chat
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8198df',
                      fontSize: 13,
                      mt: 1,
                      maxWidth: 420,
                    }}
                  >
                    Send us a message and our
                    support team will assist you.
                  </Typography>
                </Box>
              ) : (
                <Stack
                  spacing={1.5}
                >
                  {messages.map(
                    (chatMessage) => {
                      const isUser =
                        chatMessage.sender_role ===
                        'user';

                      return (
                        <Box
                          key={
                            chatMessage.id
                          }
                          sx={{
                            display: 'flex',
                            justifyContent:
                              isUser
                                ? 'flex-end'
                                : 'flex-start',
                          }}
                        >
                          <Box
                            sx={{
                              maxWidth: {
                                xs: '85%',
                                sm: '75%',
                              },
                              px: 2,
                              py: 1.2,
                              borderRadius: 3,
                              background:
                                isUser
                                  ? '#1457d9'
                                  : 'rgba(255,255,255,0.08)',
                              border:
                                isUser
                                  ? '1px solid rgba(92,232,255,0.20)'
                                  : '1px solid rgba(255,255,255,0.08)',
                            }}
                          >
                            {!isUser && (
                              <Typography
                                sx={{
                                  color:
                                    '#5ce8ff',
                                  fontSize: 11,
                                  fontWeight: 900,
                                  mb: 0.4,
                                }}
                              >
                                GlobalDigitalMarket
                                  Support
                              </Typography>
                            )}

                            <Typography
                              sx={{
                                color: '#fff',
                                fontSize: 14,
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
                              sx={{
                                color:
                                  'rgba(255,255,255,0.60)',
                                fontSize: 10,
                                mt: 0.5,
                                textAlign:
                                  'right',
                              }}
                            >
                              {formatTime(
                                chatMessage.created_at
                              )}
                            </Typography>
                          </Box>
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

            {/* MESSAGE INPUT */}

            <Box
              component="form"
              onSubmit={
                handleSendMessage
              }
              sx={{
                p: {
                  xs: 1.5,
                  md: 2,
                },
                borderTop:
                  '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="flex-end"
              >
                <TextField
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  fullWidth
                  multiline
                  maxRows={4}
                  placeholder="Type your message..."
                  disabled={sending}
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        'Enter' &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root':
                      {
                        color: '#fff',
                        borderRadius: 3,
                        '& fieldset': {
                          borderColor:
                            'rgba(120,160,255,0.30)',
                        },
                        '&:hover fieldset':
                          {
                            borderColor:
                              '#5ce8ff',
                          },
                        '&.Mui-focused fieldset':
                          {
                            borderColor:
                              '#5ce8ff',
                          },
                      },
                    '& .MuiInputBase-input::placeholder':
                      {
                        color:
                          'rgba(255,255,255,0.45)',
                        opacity: 1,
                      },
                  }}
                />

                <IconButton
                  type="submit"
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  sx={{
                    width: 52,
                    height: 52,
                    color: '#041033',
                    background:
                      '#5ce8ff',
                    '&:hover': {
                      background:
                        '#4dd8ef',
                    },
                    '&.Mui-disabled': {
                      color:
                        'rgba(255,255,255,0.30)',
                      background:
                        'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  {sending ? (
                    <CircularProgress
                      size={22}
                     
