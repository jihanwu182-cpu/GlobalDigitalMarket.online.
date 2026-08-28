import React, { useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useNavigate } from 'react-router-dom';

const ContactSupport: React.FC = () => {
  const navigate = useNavigate();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] =
    useState(false);

  const handleSubmit = (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!subject.trim() || !message.trim()) {
      return;
    }

    /*
     * Support backend is not connected yet.
     * We keep the form ready for the real
     * support/ticket API.
     */
    setSubmitted(true);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#fff',
        background:
          'radial-gradient(circle at top right, rgba(25,84,199,0.30), transparent 30%), linear-gradient(180deg,#02071f 0%,#071453 55%,#091b68 100%)',
        py: {
          xs: 3,
          md: 6,
        },
      }}
    >
      <Container
        maxWidth="md"
      >
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
          }}
        >
          <CardContent
            sx={{
              p: {
                xs: 2.5,
                md: 4,
              },
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              sx={{
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 58,
                  height: 58,
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
                    fontSize: 32,
                  }}
                />
              </Box>

              <Box>
                <Typography
                  sx={{
                    fontSize: {
                      xs: 25,
                      md: 32,
                    },
                    fontWeight: 900,
                  }}
                >
                  Contact Support
                </Typography>

                <Typography
                  sx={{
                    color: '#8198df',
                    fontSize: 13,
                    mt: 0.5,
                  }}
                >
                  We're here to help with your account.
                </Typography>
              </Box>
            </Stack>

            {submitted && (
              <Alert
                severity="success"
                onClose={() =>
                  setSubmitted(false)
                }
                sx={{
                  mb: 3,
                }}
              >
                Your support request has been prepared successfully. Support ticket submission will be connected to the backend next.
              </Alert>
            )}

            <Box
              sx={{
                mb: 3,
                p: 2,
                borderRadius: 3,
                background:
                  'rgba(255,255,255,0.04)',
                border:
                  '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
              >
                <EmailOutlinedIcon
                  sx={{
                    color: '#5ce8ff',
                  }}
                />

                <Box>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    Support Team
                  </Typography>

                  <Typography
                    sx={{
                      color: '#8198df',
                      fontSize: 12,
                    }}
                  >
                    Send us your question or describe the issue you're experiencing.
                  </Typography>
                </Box>
              </Stack>
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit}
            >
              <Stack spacing={2.5}>
                <TextField
                  label="Subject"
                  value={subject}
                  onChange={(event) =>
                    setSubject(
                      event.target.value
                    )
                  }
                  required
                  fullWidth
                  InputLabelProps={{
                    sx: {
                      color: '#8198df',
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root':
                      {
                        color: '#fff',
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
                  }}
                />

                <TextField
                  label="Message"
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value
                    )
                  }
                  required
                  fullWidth
                  multiline
                  minRows={7}
                  InputLabelProps={{
                    sx: {
                      color: '#8198df',
                    },
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root':
                      {
                        color: '#fff',
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
                  }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={
                    <SupportAgentIcon />
                  }
                  sx={{
                    alignSelf: {
                      xs: 'stretch',
                      sm: 'flex-start',
                    },
                    py: 1.3,
                    px: 3,
                    color: '#041033',
                    background:
                      '#5ce8ff',
                    textTransform:
                      'none',
                    fontWeight: 900,
                    '&:hover': {
                      background:
                        '#4dd8ef',
                    },
                  }}
                >
                  Send Support Request
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default ContactSupport;
