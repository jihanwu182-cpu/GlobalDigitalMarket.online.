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
  VerifiedUser,
} from '@mui/icons-material';

import logo from '../GlobalDigitalMarket-logo-clean.png';

const certificates = [
  {
    country: 'United States — Oregon',
    authority: 'Division of Financial Regulation',
    type: 'Money Transmitter License',
    reference: '1878845',
    company: 'Global Digital Market Financial LLC',
    website: 'https://dfr.oregon.gov',
  },
  {
    country: 'United States',
    authority:
      'U.S. Financial Crimes Enforcement Network',
    type: 'Money Service Business Registration',
    reference: '31000201469839',
    company: 'Global Digital Market Financial LLC',
    website: 'https://www.fincen.gov',
  },
  {
    country: 'United States — Alabama',
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

const testimonials = Array.from({ length: 10 }, (_, index) => ({
  id: index + 1,
  name: `Customer ${index + 1}`,
  country: 'Global Client',
  text:
    'Genuine customer testimonial will be displayed here.',
}));

const Company: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #071B33 0%, #0B3158 32%, #F5F8FC 32%, #F5F8FC 100%)',
      }}
    >
      {/* HERO */}
      <Box
        sx={{
          color: '#fff',
          py: { xs: 7, md: 10 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(40,125,220,0.28), transparent 70%)',
            right: '-120px',
            top: '-120px',
          }}
        />

        <Container maxWidth="lg">
          <Stack
            alignItems="center"
            spacing={2}
            textAlign="center"
          >
            <Box
              component="img"
              src={logo}
              alt="Global Digital Market"
              sx={{
                width: { xs: 180, md: 230 },
                height: { xs: 90, md: 110 },
                objectFit: 'contain',
              }}
            />

            <Chip
              label="EST. 2018"
              sx={{
                color: '#D8B45A',
                borderColor: '#D8B45A',
                fontWeight: 700,
              }}
              variant="outlined"
            />

            <Typography
              variant="h2"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2.2rem', md: '3.7rem' },
              }}
            >
              Global Digital Market
            </Typography>

            <Typography
              variant="h6"
              sx={{
                maxWidth: 760,
                color: 'rgba(255,255,255,0.78)',
                lineHeight: 1.7,
              }}
            >
              A global-facing digital investment and trading
              platform focused on professional service,
              transparency, technology and client support.
            </Typography>

            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              sx={{ pt: 2 }}
            >
              <Button
                variant="contained"
                href="#certificates"
                endIcon={<ArrowForward />}
                sx={{
                  backgroundColor: '#D8B45A',
                  color: '#071B33',
                  fontWeight: 700,
                  px: 3,
                  '&:hover': {
                    backgroundColor: '#C49E43',
                  },
                }}
              >
                View Registrations
              </Button>

              <Button
                variant="outlined"
                href="#testimonials"
                sx={{
                  color: '#fff',
                  borderColor: 'rgba(255,255,255,0.55)',
                  px: 3,
                }}
              >
                Client Testimonials
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* COMPANY INFORMATION */}
      <Container maxWidth="lg" sx={{ py: { xs: 5, md: 8 } }}>
        <Card
          sx={{
            borderRadius: 4,
            boxShadow: '0 18px 50px rgba(7,27,51,0.12)',
            mb: 7,
          }}
        >
          <CardContent sx={{ p: { xs: 3, md: 5 } }}>
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={4}
              alignItems={{ xs: 'flex-start', md: 'center' }}
            >
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'linear-gradient(135deg, #0B3158, #17639A)',
                  color: '#fff',
                }}
              >
                <Business sx={{ fontSize: 38 }} />
              </Box>

              <Box sx={{ flex: 1 }}>
                <Typography
                  variant="overline"
                  sx={{
                    color: '#B08A32',
                    fontWeight: 800,
                  }}
                >
                  COMPANY
                </Typography>

                <Typography
                  variant="h4"
                  sx={{
                    color: '#0B3158',
                    fontWeight: 800,
                    mb: 1,
                  }}
                >
                  Global Digital Market Ltd.
                </Typography>

                <Typography
                  color="text.secondary"
                  sx={{ lineHeight: 1.8 }}
                >
                  Global Digital Market provides a digital
                  platform for investment, trading and financial
                  technology services. This company page
                  provides corporate information and links to
                  relevant regulatory sources.
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ my: 4 }} />

            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  ESTABLISHED
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="#0B3158"
                >
                  2018
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                >
                  LOCATION
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  color="#0B3158"
                >
                  United States
                </Typography>
              </Grid>

              <Grid item xs={12} md={4}>
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
                    fontWeight: 700,
                    color: '#17639A',
                    mt: 0.5,
                  }}
                >
                  support@globaldigitalmarket.online
                </Link>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* CERTIFICATES */}
        <Box id="certificates" sx={{ mb: 8 }}>
          <Stack
            alignItems="center"
            textAlign="center"
            spacing={1}
            sx={{ mb: 4 }}
          >
            <Typography
              variant="overline"
              sx={{
                color: '#B08A32',
                fontWeight: 800,
                letterSpacing: 2,
              }}
            >
              TRUST & COMPLIANCE
            </Typography>

            <Typography
              variant="h3"
              sx={{
                color: '#0B3158',
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Licenses & Registrations
            </Typography>

            <Typography
              color="text.secondary"
              sx={{
                maxWidth: 800,
                lineHeight: 1.7,
              }}
            >
              Regulatory information supplied for company
              presentation. Visitors should use the official
              regulator links to independently verify any
              registration or license.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {certificates.map((certificate, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  sx={{
                    height: '100%',
                    borderRadius: 3,
                    border: '1px solid #DCE4EC',
                    boxShadow:
                      '0 10px 30px rgba(7,27,51,0.08)',
                    transition: '0.25s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow:
                        '0 18px 40px rgba(7,27,51,0.14)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                      >
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#EDF5FC',
                            color: '#17639A',
                          }}
                        >
                          <VerifiedUser />
                        </Box>

                        <Chip
                          label={`#${index + 1}`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            color: '#0B3158',
                          }}
                        />
                      </Stack>

                      <Typography
                        variant="caption"
                        sx={{
                          color: '#17639A',
                          fontWeight: 800,
                        }}
                      >
                        {certificate.country}
                      </Typography>

                      <Typography
                        variant="h6"
                        sx={{
                          color: '#0B3158',
                          fontWeight: 800,
                        }}
                      >
                        {certificate.type}
                      </Typography>

                      <Typography
                        variant="body2"
                        color="text.secondary"
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

                        <Typography fontWeight={700}>
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

                        <Typography fontWeight={600}>
                          {certificate.company}
                        </Typography>
                      </Box>

                      <Button
                        component="a"
                        href={certificate.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        variant="outlined"
                        endIcon={<Language />}
                        sx={{
                          mt: 1,
                          borderColor: '#17639A',
                          color: '#17639A',
                          fontWeight: 700,
                        }}
                      >
                        Official Regulator
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* TESTIMONIALS */}
        <Box
          id="testimonials"
          sx={{
            background:
              'linear-gradient(135deg, #071B33 0%, #0B3158 100%)',
            borderRadius: 5,
            p: { xs: 3, md: 5 },
            color: '#fff',
          }}
        >
          <Stack
            alignItems="center"
            textAlign="center"
            spacing={1}
            sx={{ mb: 4 }}
          >
            <Typography
              variant="overline"
              sx={{
                color: '#D8B45A',
                fontWeight: 800,
                letterSpacing: 2,
              }}
            >
              WHAT OUR CLIENTS SAY
            </Typography>

            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                fontSize: { xs: '2rem', md: '3rem' },
              }}
            >
              Client Testimonials
            </Typography>

            <Typography
              sx={{
                maxWidth: 700,
                color: 'rgba(255,255,255,0.72)',
              }}
            >
              Genuine client feedback can be displayed here.
              Each testimonial should represent real customer
              experience.
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={testimonial.id}>
                <Card
                  sx={{
                    height: '100%',
                    background:
                      'rgba(255,255,255,0.055)',
                    border:
                      '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 3,
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
                          color: 'rgba(255,255,255,0.82)',
                          lineHeight: 1.7,
                          minHeight: 75,
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
                        <Typography fontWeight={800}>
                          {testimonial.name}
                        </Typography>

                        <Typography
                          variant="caption"
                          sx={{
                            color:
                              'rgba(255,255,255,0.55)',
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
            sx={{ mt: 4 }}
          >
            <CheckCircle sx={{ color: '#D8B45A' }} />

            <Typography
              variant="body2"
              sx={{
                color: 'rgba(255,255,255,0.65)',
              }}
            >
              Replace the testimonial placeholders with
              genuine customer feedback before publishing.
            </Typography>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default Company;
