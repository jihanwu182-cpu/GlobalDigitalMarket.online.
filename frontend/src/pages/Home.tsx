import React, { useState } from 'react';

import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SecurityIcon from '@mui/icons-material/Security';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import PieChartIcon from '@mui/icons-material/PieChart';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PublicIcon from '@mui/icons-material/Public';
import SpeedIcon from '@mui/icons-material/Speed';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import InsightsIcon from '@mui/icons-material/Insights';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LoginIcon from '@mui/icons-material/Login';

import { useNavigate } from 'react-router-dom';

/* ============================================================
   TYPES
============================================================ */

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

interface ValueCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

/* ============================================================
   FEATURE CARD
============================================================ */

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 4,
        color: '#fff',
        background:
          'linear-gradient(145deg,#101f63,#08143f)',
        border:
          '1px solid rgba(100,150,255,0.18)',
        transition:
          'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          borderColor:
            'rgba(92,232,255,0.45)',
          boxShadow:
            '0 20px 45px rgba(0,0,0,0.25)',
        },
      }}
    >
      <CardContent
        sx={{
          p: 3,
          height: '100%',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#5ce8ff',
            background:
              'rgba(92,232,255,0.10)',
            mb: 2.5,
          }}
        >
          {icon}
        </Box>

        <Typography
          sx={{
            fontSize: 19,
            fontWeight: 900,
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            mt: 1,
            color: '#8198df',
            fontSize: 13,
            lineHeight: 1.75,
          }}
        >
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
};

/* ============================================================
   STEP CARD
============================================================ */

const StepCard: React.FC<StepCardProps> = ({
  number,
  title,
  description,
}) => {
  return (
    <Box
      sx={{
        position: 'relative',
        height: '100%',
        p: 3,
        borderRadius: 4,
        background:
          'rgba(255,255,255,0.035)',
        border:
          '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#041033',
          background: '#5ce8ff',
          fontWeight: 900,
          fontSize: 17,
          mb: 2,
        }}
      >
        {number}
      </Box>

      <Typography
        sx={{
          fontSize: 18,
          fontWeight: 900,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 1,
          color: '#8198df',
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

/* ============================================================
   VALUE CARD
============================================================ */

const ValueCard: React.FC<ValueCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <Box>
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#5ce8ff',
          background:
            'rgba(92,232,255,0.08)',
          mb: 1.5,
        }}
      >
        {icon}
      </Box>

      <Typography
        sx={{
          fontSize: 17,
          fontWeight: 900,
        }}
      >
        {title}
      </Typography>

      <Typography
        sx={{
          mt: 0.8,
          color: '#8198df',
          fontSize: 12,
          lineHeight: 1.7,
        }}
      >
        {description}
      </Typography>
    </Box>
  );
};

/* ============================================================
   HOME
============================================================ */

const Home: React.FC = () => {
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const goLogin = () => {
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const goRegister = () => {
    setMobileMenuOpen(false);
    navigate('/register');
  };

  const goMarket = () => {
    setMobileMenuOpen(false);
    navigate('/market');
  };

  const goSupport = () => {
    setMobileMenuOpen(false);
    navigate('/support');
  };

  const scrollToSection = (
    id: string
  ) => {
    setMobileMenuOpen(false);

    const element =
      document.getElementById(id);

    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        color: '#fff',
        background:
          'radial-gradient(circle at 85% 10%, rgba(25,84,199,0.34), transparent 28%), radial-gradient(circle at 10% 40%, rgba(28,89,200,0.15), transparent 25%), linear-gradient(180deg,#02071f 0%,#071453 48%,#091b68 100%)',
      }}
    >
      {/* ====================================================
          NAVIGATION
      ==================================================== */}

      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          background:
            'rgba(2,7,31,0.94)',
          backdropFilter:
            'blur(16px)',
          borderBottom:
            '1px solid rgba(125,150,255,0.16)',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar
            disableGutters
            sx={{
              minHeight: {
                xs: 70,
                md: 78,
              },
            }}
          >
            <Box
              sx={{
                flexGrow: 1,
                cursor: 'pointer',
              }}
              onClick={() =>
                scrollToSection('home')
              }
            >
              <Typography
                sx={{
                  fontSize: {
                    xs: 17,
                    sm: 20,
                    md: 22,
                  },
                  fontWeight: 900,
                  letterSpacing: -0.4,
                }}
              >
                Global Digital Market
              </Typography>

              <Typography
                sx={{
                  color: '#6f8fe7',
                  fontSize: 8,
                  letterSpacing: 1.2,
                  mt: 0.2,
                }}
              >
                PROFESSIONAL DIGITAL ASSET PLATFORM
              </Typography>
            </Box>

            {/* DESKTOP NAV */}

            <Stack
              direction="row"
              spacing={0.5}
              alignItems="center"
              sx={{
                display: {
                  xs: 'none',
                  md: 'flex',
                },
              }}
            >
              <Button
                onClick={() =>
                  scrollToSection('about')
                }
                sx={{
                  color: '#dbe5ff',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                About
              </Button>

              <Button
                onClick={() =>
                  scrollToSection('solutions')
                }
                sx={{
                  color: '#dbe5ff',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Solutions
              </Button>

              <Button
                onClick={() =>
                  scrollToSection('security')
                }
                sx={{
                  color: '#dbe5ff',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Security
              </Button>

              <Button
                onClick={goMarket}
                sx={{
                  color: '#dbe5ff',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Markets
              </Button>

              <Button
                onClick={goSupport}
                sx={{
                  color: '#dbe5ff',
                  textTransform: 'none',
                  fontWeight: 700,
                }}
              >
                Contact
              </Button>

              <Button
                startIcon={<LoginIcon />}
                onClick={goLogin}
                sx={{
                  ml: 1,
                  color: '#fff',
                  textTransform: 'none',
                  fontWeight: 800,
                }}
              >
                Login
              </Button>

              <Button
                variant="contained"
                onClick={goRegister}
                sx={{
                  ml: 0.5,
                  color: '#041033',
                  background: '#5ce8ff',
                  textTransform: 'none',
                  fontWeight: 900,
                  borderRadius: 2,
                  px: 2.2,
                  '&:hover': {
                    background: '#83efff',
                  },
                }}
              >
                Get Started
              </Button>
            </Stack>

            {/* MOBILE */}

            <IconButton
              onClick={() =>
                setMobileMenuOpen(true)
              }
              sx={{
                display: {
                  xs: 'flex',
                  md: 'none',
                },
                color: '#fff',
                background:
                  'rgba(60,90,220,0.25)',
              }}
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* ====================================================
          MOBILE DRAWER
      ==================================================== */}

      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() =>
          setMobileMenuOpen(false)
        }
      >
        <Box
          sx={{
            width: {
              xs: '86vw',
              sm: 340,
            },
            maxWidth: 340,
            height: '100%',
            color: '#fff',
            background:
              'linear-gradient(180deg,#050d35,#0b1d68,#102e86)',
            p: 2.5,
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{
              mb: 3,
            }}
          >
            <Typography
              sx={{
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              Global Digital Market
            </Typography>

            <IconButton
              onClick={() =>
                setMobileMenuOpen(false)
              }
              sx={{
                color: '#fff',
              }}
            >
              <CloseIcon />
            </IconButton>
          </Stack>

          <Stack spacing={1}>
            <Button
              fullWidth
              onClick={() =>
                scrollToSection('home')
              }
              sx={{
                justifyContent: 'flex-start',
                color: '#fff',
                textTransform: 'none',
                py: 1.3,
              }}
            >
              Home
            </Button>

            <Button
              fullWidth
              onClick={() =>
                scrollToSection('about')
              }
              sx={{
                justifyContent: 'flex-start',
                color: '#fff',
                textTransform: 'none',
                py: 1.3,
              }}
            >
              About Us
            </Button>

            <Button
              fullWidth
              onClick={() =>
                scrollToSection('solutions')
              }
              sx={{
                justifyContent: 'flex-start',
                color: '#fff',
                textTransform: 'none',
                py: 1.3,
              }}
            >
              Solutions
            </Button>

            <Button
              fullWidth
              onClick={() =>
                scrollToSection('security')
              }
              sx={{
                justifyContent: 'flex-start',
                color: '#fff',
                textTransform: 'none',
                py: 1.3,
              }}
            >
              Security
            </Button>

            <Button
              fullWidth
              onClick={goMarket}
              sx={{
                justifyContent: 'flex-start',
                color: '#fff',
                textTransform: 'none',
                py: 1.3,
              }}
            >
              Markets
            </Button>

            <Button
              fullWidth
              onClick={goSupport}
              sx={{
                justifyContent: 'flex-start',
                color: '#fff',
                textTransform: 'none',
                py: 1.3,
              }}
            >
              Contact
            </Button>

            <Divider
              sx={{
                my: 1.5,
                borderColor:
                  'rgba(255,255,255,0.10)',
              }}
            />

            <Button
              fullWidth
              onClick={goLogin}
              sx={{
                color: '#fff',
                textTransform: 'none',
                fontWeight: 800,
                py: 1.3,
              }}
            >
              Login
            </Button>

            <Button
              fullWidth
              variant="contained"
              onClick={goRegister}
              sx={{
                color: '#041033',
                background: '#5ce8ff',
                textTransform: 'none',
                fontWeight: 900,
                py: 1.3,
              }}
            >
              Create Account
            </Button>
          </Stack>
        </Box>
      </Drawer>

      {/* ====================================================
          HERO
      ==================================================== */}

      <Box
        id="home"
        sx={{
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container
          maxWidth="xl"
          sx={{
            py: {
              xs: 7,
              md: 11,
            },
          }}
        >
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '1.1fr 0.9fr',
              },
              gap: {
                xs: 5,
                md: 7,
              },
              alignItems: 'center',
            }}
          >
            {/* HERO TEXT */}

            <Box>
              <Chip
                icon={
                  <VerifiedUserIcon
                    sx={{
                      color:
                        '#58f39b !important',
                    }}
                  />
                }
                label="Professional Digital Market Platform"
                sx={{
                  color: '#b9caff',
                  background:
                    'rgba(92,232,255,0.08)',
                  border:
                    '1px solid rgba(92,232,255,0.15)',
                  fontWeight: 800,
                  mb: 2.5,
                }}
              />

              <Typography
                component="h1"
                sx={{
                  fontSize: {
                    xs: 40,
                    sm: 52,
                    md: 68,
                  },
                  lineHeight: 1.03,
                  fontWeight: 950,
                  letterSpacing: -2.5,
                  maxWidth: 760,
                }}
              >
                Manage your
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    color: '#5ce8ff',
                  }}
                >
                  digital financial world.
                </Box>
              </Typography>

              <Typography
                sx={{
                  mt: 3,
                  maxWidth: 680,
                  color: '#9cafeb',
                  fontSize: {
                    xs: 15,
                    md: 17,
                  },
                  lineHeight: 1.8,
                }}
              >
                Global Digital Market provides a
                modern digital environment for
                managing investment activity,
                monitoring portfolios, exploring
                markets and keeping your financial
                account information organized in one
                place.
              </Typography>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1.5}
                sx={{
                  mt: 4,
                }}
              >
                <Button
                  variant="contained"
                  endIcon={
                    <ArrowForwardIcon />
                  }
                  onClick={goRegister}
                  sx={{
                    minHeight: 52,
                    px: 3,
                    color: '#041033',
                    background: '#5ce8ff',
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 900,
                    fontSize: 15,
                    '&:hover': {
                      background: '#83efff',
                    },
                  }}
                >
                  Open an Account
                </Button>

                <Button
                  variant="outlined"
                  onClick={goLogin}
                  sx={{
                    minHeight: 52,
                    px: 3,
                    color: '#fff',
                    borderColor:
                      'rgba(255,255,255,0.30)',
                    borderRadius: 2.5,
                    textTransform: 'none',
                    fontWeight: 800,
                    fontSize: 15,
                  }}
                >
                  Sign In
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={3}
                sx={{
                  mt: 4,
                  flexWrap: 'wrap',
                }}
                useFlexGap
              >
                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: '#6e87ce',
                    }}
                  >
                    PLATFORM
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      fontWeight: 900,
                    }}
                  >
                    Digital-first
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: '#6e87ce',
                    }}
                  >
                    ACCESS
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      fontWeight: 900,
                    }}
                  >
                    24/7 account access
                  </Typography>
                </Box>

                <Box>
                  <Typography
                    sx={{
                      fontSize: 12,
                      color: '#6e87ce',
                    }}
                  >
                    SUPPORT
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.4,
                      fontWeight: 900,
                    }}
                  >
                    Dedicated assistance
                  </Typography>
                </Box>
              </Stack>
            </Box>

            {/* HERO VISUAL */}

            <Box
              sx={{
                position: 'relative',
                minHeight: {
                  xs: 380,
                  md: 520,
                },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  width: {
                    xs: 260,
                    md: 420,
                  },
                  height: {
                    xs: 260,
                    md: 420,
                  },
                  borderRadius: '50%',
                  border:
                    '1px solid rgba(92,232,255,0.15)',
                  boxShadow:
                    '0 0 100px rgba(28,120,255,0.20)',
                }}
              />

              <Box
                sx={{
                  position: 'relative',
                  width: {
                    xs: '100%',
                    sm: 460,
                  },
                  p: {
                    xs: 2,
                    md: 3,
                  },
                  borderRadius: 5,
                  background:
                    'rgba(9,23,76,0.85)',
                  border:
                    '1px solid rgba(125,170,255,0.22)',
                  boxShadow:
                    '0 30px 80px rgba(0,0,0,0.35)',
                  backdropFilter:
                    'blur(18px)',
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography
                      sx={{
                        color: '#8198df',
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: 1,
                      }}
                    >
                      PORTFOLIO OVERVIEW
                    </Typography>

                    <Typography
                      sx={{
                        mt: 0.6,
                        fontSize: 28,
                        fontWeight: 900,
                      }}
                    >
                      Your financial dashboard
                    </Typography>
                  </Box>

                  <ShowChartIcon
                    sx={{
                      color: '#5ce8ff',
                      fontSize: 35,
                    }}
                  />
                </Stack>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    background:
                      'linear-gradient(135deg,#12348f,#087fda)',
                    mb: 1.5,
                  }}
                >
                  <Typography
                    sx={{
                      color: '#b9caff',
                      fontSize: 10,
                      fontWeight: 800,
                    }}
                  >
                    PORTFOLIO VALUE
                  </Typography>

                  <Typography
                    sx={{
                      fontSize: 35,
                      fontWeight: 900,
                      mt: 0.5,
                    }}
                  >
                    Account Dashboard
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                      mt: 1,
                    }}
                  >
                    <TrendingUpIcon
                      sx={{
                        color: '#58f39b',
                        fontSize: 18,
                      }}
                    />

                    <Typography
                      sx={{
                        color: '#58f39b',
                        fontSize: 12,
                        fontWeight: 800,
                      }}
                    >
                      Portfolio monitoring
                    </Typography>
                  </Stack>
                </Box>

                <Stack spacing={1.5}>
                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: 3,
                      background:
                        'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography
                        sx={{
                          color: '#8198df',
                          fontSize: 11,
                        }}
                      >
                        ACCOUNT
                      </Typography>

                      <VerifiedUserIcon
                        sx={{
                          color: '#58f39b',
                          fontSize: 18,
                        }}
                      />
                    </Stack>

                    <Typography
                      sx={{
                        mt: 0.6,
                        fontWeight: 800,
                      }}
                    >
                      Secure account access
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: 3,
                      background:
                        'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography
                        sx={{
                          color: '#8198df',
                          fontSize: 11,
                        }}
                      >
                        MARKETS
                      </Typography>

                      <PublicIcon
                        sx={{
                          color: '#5ce8ff',
                          fontSize: 18,
                        }}
                      />
                    </Stack>

                    <Typography
                      sx={{
                        mt: 0.6,
                        fontWeight: 800,
                      }}
                    >
                      Explore available markets
                    </Typography>
                  </Box>

                  <Box
                    sx={{
                      p: 1.8,
                      borderRadius: 3,
                      background:
                        'rgba(255,255,255,0.04)',
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                    >
                      <Typography
                        sx={{
                          color: '#8198df',
                          fontSize: 11,
                        }}
                      >
                        SUPPORT
                      </Typography>

                      <SupportAgentIcon
                        sx={{
                          color: '#c43dff',
                          fontSize: 18,
                        }}
                      />
                    </Stack>

                    <Typography
                      sx={{
                        mt: 0.6,
                        fontWeight: 800,
                      }}
                    >
                      Professional customer support
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          COMPANY PROFILE
      ==================================================== */}

      <Box
        id="about"
        sx={{
          py: {
            xs: 7,
            md: 10,
          },
          scrollMarginTop: 80,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '0.85fr 1.15fr',
              },
              gap: {
                xs: 4,
                md: 8,
              },
              alignItems: 'center',
            }}
          >
            <Box>
              <Typography
                sx={{
                  color: '#5ce8ff',
                  fontSize: 12,
                  fontWeight: 900,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}
              >
                About Global Digital Market
              </Typography>

              <Typography
                component="h2"
                sx={{
                  mt: 1.2,
                  fontSize: {
                    xs: 32,
                    md: 48,
                  },
                  lineHeight: 1.1,
                  fontWeight: 900,
                }}
              >
                Built for the modern
                digital financial experience.
              </Typography>
            </Box>

            <Box>
              <Typography
                sx={{
                  color: '#a3b3e9',
                  fontSize: 15,
                  lineHeight: 1.9,
                }}
              >
                Global Digital Market is a
                digital financial platform designed
                to give users a centralized
                environment for managing their
                investment activity, monitoring
                portfolios, reviewing account
                information and exploring market
                opportunities.
              </Typography>

              <Typography
                sx={{
                  mt: 2,
                  color: '#8198df',
                  fontSize: 14,
                  lineHeight: 1.9,
                }}
              >
                Our approach combines a clean
                digital experience with practical
                account and portfolio tools, helping
                users keep their financial activity
                organized and accessible from one
                platform.
              </Typography>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row',
                }}
                spacing={1.5}
                sx={{
                  mt: 3,
                }}
              >
                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 3,
                    background:
                      'rgba(255,255,255,0.035)',
                    border:
                      '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#5ce8ff',
                      fontWeight: 900,
                    }}
                  >
                    Our Mission
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.7,
                      color: '#8198df',
                      fontSize: 12,
                      lineHeight: 1.7,
                    }}
                  >
                    Make digital financial management
                    simpler, clearer and more accessible.
                  </Typography>
                </Box>

                <Box
                  sx={{
                    flex: 1,
                    p: 2,
                    borderRadius: 3,
                    background:
                      'rgba(255,255,255,0.035)',
                    border:
                      '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#5ce8ff',
                      fontWeight: 900,
                    }}
                  >
                    Our Vision
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.7,
                      color: '#8198df',
                      fontSize: 12,
                      lineHeight: 1.7,
                    }}
                  >
                    Build a trusted digital environment
                    for modern financial participation.
                  </Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          SOLUTIONS
      ==================================================== */}

      <Box
        id="solutions"
        sx={{
          py: {
            xs: 7,
            md: 10,
          },
          scrollMarginTop: 80,
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: 760,
              mx: 'auto',
              mb: 5,
            }}
          >
            <Typography
              sx={{
                color: '#5ce8ff',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.5,
              }}
            >
              PLATFORM SOLUTIONS
            </Typography>

            <Typography
              component="h2"
              sx={{
                mt: 1,
                fontSize: {
                  xs: 32,
                  md: 46,
                },
                fontWeight: 900,
              }}
            >
              Everything organized in one platform.
            </Typography>

            <Typography
              sx={{
                mt: 1.5,
                color: '#8198df',
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              Access the tools you need to understand,
              monitor and manage your digital financial
              activity.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2,1fr)',
                lg: 'repeat(4,1fr)',
              },
              gap: 2,
            }}
          >
            <FeatureCard
              icon={
                <AccountBalanceWalletIcon
                  sx={{ fontSize: 30 }}
                />
              }
              title="Wallet Management"
              description="Manage deposits, withdrawals, transfers and account balances through a centralized wallet experience."
            />

            <FeatureCard
              icon={
                <PieChartIcon
                  sx={{ fontSize: 30 }}
                />
              }
              title="Portfolio Management"
              description="Monitor holdings, portfolio value, allocation and current investment positions from your dashboard."
            />

            <FeatureCard
              icon={
                <ShowChartIcon
                  sx={{ fontSize: 30 }}
                />
              }
              title="Market Access"
              description="Explore available markets and review market information through a modern digital interface."
            />

            <FeatureCard
              icon={
                <TrendingUpIcon
                  sx={{ fontSize: 30 }}
                />
              }
              title="Trading Tools"
              description="Use the platform's trading workspace to manage and review your trading activity."
            />

            <FeatureCard
              icon={
                <InsightsIcon
                  sx={{ fontSize: 30 }}
                />
              }
              title="Market Intelligence"
              description="Keep your financial decisions informed with organized market and portfolio information."
            />

            <FeatureCard
              icon={
                <BusinessCenterIcon
                  sx={{ fontSize: 30 }}
                />
              }
              title="Investment Planning"
              description="Organize your investment activity and keep track of your financial objectives."
            />

            <FeatureCard
              icon={
                <SecurityIcon
                  sx={{ fontSize: 30 }}
                />
              }
              title="Secure Access"
              description="Access financial account information through authenticated user sessions and protected account areas."
            />

            <FeatureCard
              icon={
                <SupportAgentIcon
                  sx={{ fontSize: 30 }}
                />
              }
              title="Customer Support"
              description="Get assistance through the platform's dedicated customer support channel."
            />
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          WHY US
      ==================================================== */}

      <Box
        sx={{
          py: {
            xs: 7,
            md: 10,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              p: {
                xs: 3,
                md: 5,
              },
              borderRadius: 5,
              background:
                'linear-gradient(135deg,#0d2168,#0b3d9c)',
              border:
                '1px solid rgba(125,180,255,0.20)',
              boxShadow:
                '0 30px 80px rgba(0,0,0,0.22)',
            }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  md: '0.8fr 1.2fr',
                },
                gap: 5,
                alignItems: 'center',
              }}
            >
              <Box>
                <Typography
                  sx={{
                    color: '#5ce8ff',
                    fontSize: 12,
                    fontWeight: 900,
                    letterSpacing: 1.5,
                  }}
                >
                  WHY GLOBAL DIGITAL MARKET
                </Typography>

                <Typography
                  sx={{
                    mt: 1,
                    fontSize: {
                      xs: 30,
                      md: 42,
                    },
                    fontWeight: 900,
                    lineHeight: 1.1,
                  }}
                >
                  A platform designed around your account.
                </Typography>

                <Typography
                  sx={{
                    mt: 2,
                    color: '#b7c8f6',
                    fontSize: 14,
                    lineHeight: 1.8,
                  }}
                >
                  From your wallet and portfolio to
                  market information and transaction
                  history, Global Digital Market brings
                  essential account tools together in one
                  digital environment.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: '1fr 1fr',
                  },
                  gap: 3,
                }}
              >
                <ValueCard
                  icon={<SpeedIcon />}
                  title="Simple Experience"
                  description="A clear interface designed to make account information easy to understand."
                />

                <ValueCard
                  icon={<SecurityIcon />}
                  title="Security Focus"
                  description="Authenticated access and security-focused account features help protect your information."
                />

                <ValueCard
                  icon={<InsightsIcon />}
                  title="Better Visibility"
                  description="Keep your portfolio, transactions and financial activity organized."
                />

                <ValueCard
                  icon={<SupportAgentIcon />}
                  title="Human Support"
                  description="Access customer support when you need assistance with the platform."
                />
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          HOW IT WORKS
      ==================================================== */}

      <Box
        sx={{
          py: {
            xs: 7,
            md: 10,
          },
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              textAlign: 'center',
              maxWidth: 700,
              mx: 'auto',
              mb: 5,
            }}
          >
            <Typography
              sx={{
                color: '#5ce8ff',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.5,
              }}
            >
              HOW IT WORKS
            </Typography>

            <Typography
              component="h2"
              sx={{
                mt: 1,
                fontSize: {
                  xs: 32,
                  md: 44,
                },
                fontWeight: 900,
              }}
            >
              Start in four simple steps.
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2,1fr)',
                lg: 'repeat(4,1fr)',
              },
              gap: 2,
            }}
          >
            <StepCard
              number="01"
              title="Create your account"
              description="Register for a Global Digital Market account and provide the required information."
            />

            <StepCard
              number="02"
              title="Access your dashboard"
              description="Sign in to view your account information, wallet, portfolio and available platform tools."
            />

            <StepCard
              number="03"
              title="Explore the platform"
              description="Review markets, portfolio information, transactions and available investment tools."
            />

            <StepCard
              number="04"
              title="Manage your activity"
              description="Keep track of your account, portfolio and financial activity from one centralized environment."
            />
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          SECURITY
      ==================================================== */}

      <Box
        id="security"
        sx={{
          py: {
            xs: 7,
            md: 10,
          },
          scrollMarginTop: 80,
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: '1fr 1fr',
              },
              gap: 3,
            }}
          >
            <Card
              sx={{
                borderRadius: 4,
                color: '#fff',
                background:
                  'linear-gradient(145deg,#101f63,#08143f)',
                border:
                  '1px solid rgba(100,150,255,0.18)',
              }}
            >
              <CardContent sx={{ p: 3.5 }}>
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
                    mb: 2.5,
                  }}
                >
                  <SecurityIcon
                    sx={{ fontSize: 32 }}
                  />
                </Box>

                <Typography
                  sx={{
                    fontSize: 25,
                    fontWeight: 900,
                  }}
                >
                  Security-focused access
                </Typography>

                <Typography
                  sx={{
                    mt: 1.5,
                    color: '#8198df',
                    fontSize: 13,
                    lineHeight: 1.8,
                  }}
                >
                  Global Digital Market is designed
                  with authenticated account access
                  and security-focused features for
                  protecting user account information.
                </Typography>

                <Stack
                  spacing={1.5}
                  sx={{
                    mt: 3,
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                  >
                    <CheckCircleIcon
                      sx={{
                        color: '#58f39b',
                        fontSize: 20,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      Authenticated account access
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                  >
                    <CheckCircleIcon
                      sx={{
                        color: '#58f39b',
                        fontSize: 20,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      Protected financial account areas
                    </Typography>
                  </Stack>

                  <Stack
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                  >
                    <CheckCircleIcon
                      sx={{
                        color: '#58f39b',
                        fontSize: 20,
                      }}
                    />

                    <Typography
                      sx={{
                        fontSize: 13,
                        fontWeight: 700,
                      }}
                    >
                      Account activity visibility
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            <Card
              sx={{
                borderRadius: 4,
                color: '#fff',
                background:
                  'linear-gradient(145deg,#101f63,#08143f)',
                border:
                  '1px solid rgba(100,150,255,0.18)',
              }}
            >
              <CardContent sx={{ p: 3.5 }}>
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
                    mb: 2.5,
                  }}
                >
                  <PublicIcon
                    sx={{ fontSize: 32 }}
                  />
                </Box>

                <Typography
                  sx={{
                    fontSize: 25,
                    fontWeight: 900,
                  }}
                >
                  Transparency matters
                </Typography>

                <Typography
                  sx={{
                    mt: 1.5,
                    color: '#8198df',
                    fontSize: 13,
                    lineHeight: 1.8,
                  }}
                >
                  Financial information should be
                  presented clearly. Our platform is
                  structured to give users visibility
                  into their account balances,
                  transactions and portfolio activity.
                </Typography>

                <Box
                  sx={{
                    mt: 3,
                    p: 2,
                    borderRadius: 3,
                    background:
                      'rgba(255,255,255,0.035)',
                    border:
                      '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <Typography
                    sx={{
                      color: '#5ce8ff',
                      fontWeight: 900,
                    }}
                  >
                    Clear information
                  </Typography>

                  <Typography
                    sx={{
                      mt: 0.7,
                      color: '#8198df',
                      fontSize: 12,
                      lineHeight: 1.7,
                    }}
                  >
                    Account balances, portfolio
                    positions and transaction history
                    are presented through the user's
                    authenticated dashboard.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          CTA
      ==================================================== */}

      <Box
        sx={{
          py: {
            xs: 7,
            md: 10,
          },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              textAlign: 'center',
              p: {
                xs: 4,
                md: 7,
              },
              borderRadius: 5,
              background:
                'linear-gradient(135deg,#123b9c,#087fda)',
              border:
                '1px solid rgba(150,210,255,0.25)',
              boxShadow:
                '0 30px 80px rgba(0,0,0,0.25)',
            }}
          >
            <Typography
              sx={{
                color: '#bfeaff',
                fontSize: 12,
                fontWeight: 900,
                letterSpacing: 1.5,
              }}
            >
              GET STARTED
            </Typography>

            <Typography
              component="h2"
              sx={{
                mt: 1,
                fontSize: {
                  xs: 32,
                  md: 50,
                },
                lineHeight: 1.1,
                fontWeight: 900,
              }}
            >
              Build your digital financial experience.
            </Typography>

            <Typography
              sx={{
                maxWidth: 650,
                mx: 'auto',
                mt: 1.5,
                color: '#c4d7ff',
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              Create your Global Digital Market account
              and access a centralized platform for your
              financial account, portfolio and market
              activity.
            </Typography>

            <Stack
              direction={{
                xs: 'column',
                sm: 'row',
              }}
              spacing={1.5}
              justifyContent="center"
              sx={{
                mt: 3.5,
              }}
            >
              <Button
                variant="contained"
                endIcon={
                  <ArrowForwardIcon />
                }
                onClick={goRegister}
                sx={{
                  minHeight: 52,
                  px: 3,
                  color: '#041033',
                  background: '#5ce8ff',
                  textTransform: 'none',
                  fontWeight: 900,
                  borderRadius: 2.5,
                }}
              >
                Create Your Account
              </Button>

              <Button
                variant="outlined"
                onClick={goLogin}
                sx={{
                  minHeight: 52,
                  px: 3,
                  color: '#fff',
                  borderColor:
                    'rgba(255,255,255,0.45)',
                  textTransform: 'none',
                  fontWeight: 800,
                  borderRadius: 2.5,
                }}
              >
                Login
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* ====================================================
          FOOTER
      ==================================================== */}

      <Box
        component="footer"
        sx={{
          pt: 6,
          pb: 3,
          background:
            'rgba(1,5,24,0.72)',
          borderTop:
            '1px solid rgba(125,150,255,0.12)',
        }}
      >
        <Container maxWidth="xl">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: '2fr 1fr 1fr 1fr',
              },
              gap: 4,
            }}
          >
            {/* COMPANY */}

            <Box>
              <Typography
                sx={{
                  fontSize: 21,
                  fontWeight: 900,
                }}
              >
                Global Digital Market
              </Typography>

              <Typography
                sx={{
                  mt: 0.4,
                  color: '#6f8fe7',
                  fontSize: 9,
                  letterSpacing: 1,
                }}
              >
                PROFESSIONAL DIGITAL ASSET PLATFORM
              </Typography>

              <Typography
                sx={{
                  mt: 2,
                  maxWidth: 420,
                  color: '#7185c2',
                  fontSize: 12,
                  lineHeight: 1.8,
                }}
              >
                A modern digital platform for
                managing account information,
                portfolios, market activity and
                financial transactions.
              </Typography>
            </Box>

            {/* PLATFORM */}

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Platform
              </Typography>

              <Stack spacing={0.8}>
                <Button
                  onClick={() =>
                    scrollToSection('about')
                  }
                  sx={{
                    justifyContent: 'flex-start',
                    p: 0,
                    color: '#7185c2',
                    textTransform: 'none',
                    fontSize: 12,
                  }}
                >
                  About Us
                </Button>

                <Button
                  onClick={() =>
                    scrollToSection('solutions')
                  }
                  sx={{
                    justifyContent: 'flex-start',
                    p: 0,
                    color: '#7185c2',
                    textTransform: 'none',
                    fontSize: 12,
                  }}
                >
                  Solutions
                </Button>

                <Button
                  onClick={goMarket}
                  sx={{
                    justifyContent: 'flex-start',
                    p: 0,
                    color: '#7185c2',
                    textTransform: 'none',
                    fontSize: 12,
                  }}
                >
                  Markets
                </Button>
              </Stack>
            </Box>

            {/* ACCOUNT */}

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Account
              </Typography>

              <Stack spacing={0.8}>
                <Button
                  onClick={goLogin}
                  sx={{
                    justifyContent: 'flex-start',
                    p: 0,
                    color: '#7185c2',
                    textTransform: 'none',
                    fontSize: 12,
                  }}
                >
                  Login
                </Button>

                <Button
                  onClick={goRegister}
                  sx={{
                    justifyContent: 'flex-start',
                    p: 0,
                    color: '#7185c2',
                    textTransform: 'none',
                    fontSize: 12,
                  }}
                >
                  Create Account
                </Button>

                <Button
                  onClick={goSupport}
                  sx={{
                    justifyContent: 'flex-start',
                    p: 0,
                    color: '#7185c2',
                    textTransform: 'none',
                    fontSize: 12,
                  }}
                >
                  Contact Support
                </Button>
              </Stack>
            </Box>

            {/* COMPANY INFO */}

            <Box>
              <Typography
                sx={{
                  fontSize: 13,
                  fontWeight: 900,
                  mb: 1.5,
                }}
              >
                Company
              </Typography>

              <Stack spacing={0.8}>
                <Typography
                  sx={{
                    color: '#7185c2',
                    fontSize: 12,
                  }}
                >
                  Digital financial platform
                </Typography>

                <Typography
                  sx={{
                    color: '#7185c2',
                    fontSize: 12,
                  }}
                >
                  Portfolio management
                </Typography>

                <Typography
                  sx={{
                    color: '#7185c2',
                    fontSize: 12,
                  }}
                >
                  Market information
                </Typography>

                <Typography
                  sx={{
                    color: '#7185c2',
                    fontSize: 12,
                  }}
                >
                  Customer support
                </Typography>
              </Stack>
            </Box>
          </Box>

          <Divider
            sx={{
              my: 4,
              borderColor:
                'rgba(255,255,255,0.08)',
            }}
          />

          <Stack
            direction={{
              xs: 'column',
              sm: 'row',
            }}
            justifyContent="space-between"
            spacing={2}
          >
            <Typography
              sx={{
                color: '#566ba7',
                fontSize: 11,
              }}
            >
              © {new Date().getFullYear()} Global Digital Market. All rights reserved.
            </Typography>

            <Typography
              sx={{
                color: '#566ba7',
                fontSize: 11,
                textAlign: {
                  xs: 'left',
                  sm: 'right',
                },
              }}
            >
              Information provided through this
              platform is for account and informational
              purposes.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;
