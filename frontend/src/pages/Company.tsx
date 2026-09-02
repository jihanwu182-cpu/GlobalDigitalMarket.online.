import React from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Grid,
  Link,
  Rating,
  Stack,
  Typography,
} from '@mui/material';
import {
  ArrowForward,
  Business,
  CheckCircle,
  Language,
  Security,
  VerifiedUser,
} from '@mui/icons-material';

import logo from '../GlobalDigitalMarket-logo-clean.png';

const certificates = [
  {
    country: 'United States • Oregon',
    authority: 'Division of Financial Regulation',
    type: 'Money Transmitter License',
    reference: '1878845',
    company: 'Global Digital Market Financial LLC',
    website: 'https://dfr.oregon.gov',
  },
  {
    country: 'United States',
    authority: 'U.S. Financial Crimes Enforcement Network',
    type: 'Money Service Business Registration',
    reference: '31000201469839',
    company: 'Global Digital Market Financial LLC',
    website: 'https://www.fincen.gov',
  },
  {
    country: 'United States • Alabama',
    authority: 'State Banking Department',
    type: 'Consumer Credit License',
    reference: 'MC 22385',
    company: 'Global Digital Market Financial LLC',
    website: 'https://www.banking.alabama.gov',
  },
  {
    country: 'Canada',
    authority:
      'Financial Transactions and Reports Analysis Centre of Canada',
    type: 'Money Service Business Registration',
    reference: 'M20280268',
    company: 'Global Digital Market Capital Inc.',
    website: 'https://www.fintrac-canafe.gc.ca',
  },
  {
    country: 'Australia',
    authority:
      'Australian Securities and Investments Commission',
    type: 'Registration as Foreign Company',
    reference: '647054530',
    company: 'Global Digital Market Capital Inc.',
    website: 'https://asic.gov.au',
  },
];

const testimonials = [
  {
    name: 'Customer 1',
    country: 'Global Client',
    text: 'Genuine customer testimonial will be displayed here.',
  },
  {
    name: 'Customer 2',
    country: 'Global Client',
    text: 'Genuine customer testimonial will be displayed here.',
  },
  {
    name: 'Customer 3',
    country: 'Global Client',
    text: 'Genuine customer testimonial will be displayed here.',
  },
  {
    name: 'Customer 4',
    country: 'Global Client',
    text: 'Genuine customer testimonial will be displayed here.',
  },
  {
    name: 'Customer 5',
    country: 'Global Client',
    text: 'Genuine customer testimonial will be displayed here.',
  },
  {
    name: 'Customer 6',
    country: 'Global Client',
    text: 'Genuine customer testimonial will be displayed here.',
  },
  {
    name: 'Customer 7',
    country: 'Global Client',
    text: 'Genuine customer testimonial will be displayed here.',
  },
  {
    name: 'Customer 8',
    country: 'Global Client',
    text: 'Genuine customer testimonial will be displayed here.',
  },
  {
    name: 'Customer 9',
    country: 'Global Client',
    text: 'Genuine customer testimonial will be displayed here.',
  },
  {
    name: 'Customer 10',
    country: 'Global Client',
    text: 'Genuine customer testimonial will be displayed here.',
  },
];

const Company: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: '#F4F7FB',
      }}
    >
      {/* =====================================================
          HERO
      ====================================================== */}

      <Box
        sx={{
          position: 'relative',
          overflow: 'hidden',
          background:
            'radial-gradient(circle at 85% 20%, rgba(36,119,205,0.32), transparent 28%), linear-gradient(135deg, #020D1C 0%, #071B33 48%, #0B3158 100%)',
          color: '#fff',
          py: { xs: 8, md: 12 },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 500,
            height: 500,
            right: -220,
            top: -180,
            borderRadius: '50%',
            border: '1px solid rgba(216,180,90,0.18)',
          }}
        />

        <Box
          sx={{
            position: 'absolute',
            width: 350,
            height: 350,
            right: -120,
            top: -100,
            borderRadius: '50%',
            border: '1px solid rgba(64,151,226,0.18)',
          }}
        />

        <Container maxWidth="lg">
          <Stack
            alignItems="center"
            textAlign="center"
            spacing={2}
          >
            <Box
              component="img"
              src={logo}
              alt="Global Digital Market"
              sx={{
                width: { xs: 190, md: 245 },
                height: { xs: 85, md: 105 },
                objectFit: 'contain',
                background: '#fff',
                borderRadius: 2,
                p: 0.5,
              }}
            />

            <Chip
              label="EST. 2018"
              variant="outlined"
              sx={{
                color: '#D8B45A',
                borderColor: '#D8B45A',
                fontWeight: 800,
                letterSpacing: 1,
              }}
            />

            <Typography
              sx={{
                fontSize: { xs: '2.4rem', sm: '3.3rem', md: '4.4rem' },
                fontWeight: 900,
                lineHeight: 1.05,
                maxWidth: 950,
              }}
            >
              Global Digital Market
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: '1rem', md: '1.2rem' },
                maxWidth: 760,
                lineHeight: 1.8,
                color: 'rgba(255,255,255,0.72)',
              }}
            >
              Company information, regulatory resources,
              certificates and client experience — presented
              in one professional global destination.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ pt: 2 }}
            >
              <Button
                href="#certificates"
                variant="contained"
                endIcon={<ArrowForward />}
                sx={{
                  px: 4,
                  py: 1.4,
                  borderRadius: 2,
                  background: '#D8B45A',
                  color: '#071B33',
                  fontWeight: 800,
                  '&:hover': {
                    background: '#C59F49',
                  },
                }}
              >
                Licenses & Registrations
              </Button>

              <Button
                href="#testimonials"
                variant="outlined"
                sx={{
                  px: 4,
                  py: 1.4,
                  borderRadius: 2,
                  color: '#fff',
                  borderColor:
                    'rgba(255,255,255,0.45)',
                }}
              >
                Client Testimonials
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* =====================================================
          COMPANY OVERVIEW
      ====================================================== */}

      <Container
        maxWidth="lg"
        sx={{
          mt: { xs: -4, md: -5 },
          position: 'relative',
          zIndex: 2,
        }}
      >
        <Card
          sx={{
            borderRadius: 4,
            boxShadow:
              '0 25px 70px rgba(3,20,40,0.14)',
            overflow: 'hidden',
          }}
        >
          <CardContent
            sx={{
              p: { xs: 3, md: 5 },
            }}
          >
            <Grid
              container
              spacing={4}
              alignItems="center"
            >
              <Grid item xs={12} md={8}>
                <Stack direction="row" spacing={2}>
                  <Box
                    sx={{
                      minWidth: 62,
                      width: 62,
                      height: 62,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background:
                        'linear-gradient(135deg, #0B3158, #17639A)',
                      color: '#fff',
                    }}
                  >
                    <Business sx={{ fontSize: 32 }} />
                  </Box>

                  <Box>
                    <Typography
                      variant="overline"
                      sx={{
                        color: '#B08A32',
                        fontWeight: 900,
                        letterSpacing: 2,
                      }}
                    >
                      COMPANY
                    </Typography>

                    <Typography
                      variant="h4"
                      sx={{
                        color: '#0B3158',
                        fontWeight: 900,
                        mb: 1,
                      }}
                    >
                      Global Digital Market Ltd.
                    </Typography>

                    <Typography
                      color="text.secondary"
                      sx={{
                        lineHeight: 1.8,
                      }}
                    >
                      Global Digital Market is presented as
                      a global digital investment and trading
                      platform focused on technology,
                      accessibility, client support and
                      transparent corporate information.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              <Grid item xs={12} md={4}>
                <Box
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: '#F5F8FC',
                    border:
                      '1px solid #E0E7EF',
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    OFFICIAL WEBSITE
                  </Typography>

                  <Link
                    href="https://www.globaldigitalmarket.online"
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="hover"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      color: '#17639A',
                      fontWeight: 800,
                    }}
                  >
                    globaldigitalmarket.online
                  </Link>

                  <Divider sx={{ my: 2 }} />

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    SUPPORT
                  </Typography>

                  <Link
                    href="mailto:support@globaldigitalmarket.online"
                    underline="hover"
                    sx={{
                      display: 'block',
                      mt: 0.5,
                      color: '#17639A',
                      fontWeight: 700,
                    }}
                  >
                    support@globaldigitalmarket.online
                  </Link>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4 }} />

            <Grid container spacing={3}>
              {[
                ['2018', 'Established'],
                ['Global', 'Client Focus'],
                ['24/7', 'Support'],
                ['Secure', 'Platform Focus'],
              ].map(([value, label]) => (
                <Grid item xs={6} md={3} key={label}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: '#0B3158',
                      fontWeight: 900,
                    }}
                  >
                    {value}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    {label}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      </Container>

      {/* =====================================================
          CERTIFICATES
      ====================================================== */}

      <Container
        maxWidth="lg"
        id="certificates"
        sx={{ py: { xs: 7, md: 10 } }}
      >
        <Stack
          alignItems="center"
          textAlign="center"
          spacing={1}
          sx={{ mb: 5 }}
        >
          <Typography
            variant="overline"
            sx={{
              color: '#B08A32',
              fontWeight: 900,
              letterSpacing: 2,
            }}
          >
            TRUST & COMPLIANCE
          </Typography>

          <Typography
            variant="h3"
            sx={{
              color: '#0B3158',
              fontWeight: 900,
              fontSize: { xs: '2rem', md: '3rem' },
            }}
          >
            Licenses & Registrations
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 820,
              lineHeight: 1.8,
            }}
          >
            Regulatory information is presented for
            reference. Visitors should independently
            verify registrations and licenses through
            the relevant official regulator.
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {certificates.map((certificate, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              lg={4}
              key={certificate.reference}
            >
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 3,
                  border:
                    '1px solid #DCE5EE',
                  boxShadow:
                    '0 12px 35px rgba(7,27,51,0.07)',
                  transition:
                    'transform .25s, box-shadow .25s',
                  '&:hover': {
                    transform:
                      'translateY(-6px)',
                    boxShadow:
                      '0 20px 45px rgba(7,27,51,0.14)',
                  },
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Stack spacing={2.2}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box
                        sx={{
                          width: 50,
                          height: 50,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background:
                            'linear-gradient(135deg, #EAF3FB, #F7FAFD)',
                          color: '#17639A',
                        }}
                      >
                        <VerifiedUser />
                      </Box>

                      <Chip
                        label={`REGISTRATION ${index + 1}`}
                        size="small"
                        sx={{
                          color: '#0B3158',
                          fontWeight: 800,
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="caption"
                      sx={{
                        color: '#17639A',
                        fontWeight: 900,
                      }}
                    >
                      {certificate.country}
                    </Typography>

                    <Typography
                      variant="h6"
                      sx={{
                        color: '#0B3158',
                        fontWeight: 900,
                      }}
                    >
                      {certificate.type}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ minHeight: 42 }}
                    >
                      {certificate.authority}
                    </Typography>

                    <Divider />

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        REFERENCE NO.
                      </Typography>

                      <Typography
                        fontWeight={900}
                        color="#172033"
                      >
                        {certificate.reference}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                      >
                        COMPANY
                      </Typography>

                      <Typography
                        variant="body2"
                        fontWeight={700}
                      >
                        {certificate.company}
                      </Typography>
                    </Box>

                    <Button
                      component="a"
                      href={certificate.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      variant="contained"
                      endIcon={<Language />}
                      sx={{
                        mt: 1,
                        borderRadius: 2,
                        background: '#0B3158',
                        fontWeight: 800,
                        '&:hover': {
                          background: '#17639A',
                        },
                      }}
                    >
                      Visit Official Regulator
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3,
            background: '#FFF8E8',
            border:
              '1px solid #EAD9A7',
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={2}
            alignItems={{ xs: 'flex-start', md: 'center' }}
          >
            <Security
              sx={{
                color: '#9A731C',
                fontSize: 32,
              }}
            />

            <Typography
              variant="body2"
              sx={{
                color: '#5E4A1A',
                lineHeight: 1.7,
              }}
            >
              Regulatory registrations and licenses can
              have different legal meanings depending on
              the jurisdiction. Always use the linked
              official regulator for independent verification.
            </Typography>
          </Stack>
        </Box>
      </Container>

      {/* =====================================================
          TESTIMONIALS
      ====================================================== */}

      <Box
        id="testimonials"
        sx={{
          background:
            'linear-gradient(135deg, #020D1C 0%, #071B33 55%, #0B3158 100%)',
          py: { xs: 7, md: 10 },
        }}
      >
        <Container maxWidth="lg">
          <Stack
            alignItems="center"
            textAlign="center"
            spacing={1}
            sx={{ mb: 5 }}
          >
            <Typography
              variant="overline"
              sx={{
                color: '#D8B45A',
                fontWeight: 900,
                letterSpacing: 2,
              }}
            >
              WHAT OUR CLIENTS SAY
            </Typography>

            <Typography
              variant="h3"
              sx={{
                color: '#fff',
                fontWeight: 900,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Client Testimonials
            </Typography>

            <Typography
              sx={{
                maxWidth: 760,
                color:
                  'rgba(255,255,255,0.65)',
                lineHeight: 1.8,
              }}
            >
              A dedicated space for genuine customer
              experiences and feedback.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {testimonials.map((testimonial) => (
              <Grid
                item
                xs={12}
                sm={6}
                md={4}
                lg={3}
                key={testimonial.name}
              >
                <Card
                  sx={{
                    height: '100%',
                    minHeight: 235,
                    borderRadius: 3,
                    background:
                      'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.025))',
                    border:
                      '1px solid rgba(255,255,255,0.12)',
                    color: '#fff',
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Rating
                        value={5}
                        readOnly
                        size="small"
                      />

                      <Typography
                        sx={{
                          lineHeight: 1.7,
                          color:
                            'rgba(255,255,255,0.8)',
                        }}
                      >
                        “{testimonial.text}”
                      </Typography>

                      <Divider
                        sx={{
                          borderColor:
                            'rgba(255,255,255,0.12)',
                        }}
                      />

                      <Box>
                        <Typography
                          fontWeight={900}
                        >
                          {testimonial.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              'rgba(255,255,255,0.5)',
                          }}
                        >
                          {testimonial.country}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Stack
            direction="row"
            justifyContent="center"
            spacing={1}
            sx={{ mt: 5 }}
          >
            <CheckCircle
              sx={{ color: '#D8B45A' }}
            />

            <Typography
              variant="body2"
              sx={{
                color:
                  'rgba(255,255,255,0.55)',
              }}
            >
              Testimonials should be replaced with
              genuine customer feedback before publication.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Company;
