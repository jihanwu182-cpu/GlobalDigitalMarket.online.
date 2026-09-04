import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  CloudUpload,
  VerifiedUser,
} from '@mui/icons-material';

import apiClient from '../services/apiClient';

interface KycDocument {
  id: number;
  document_type: string;
  document_number: string | null;
  document_url: string;
  status: string;
  rejection_reason?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

interface KycVerification {
  status: string;
  documentType: string | null;
  documentNumber: string | null;
  documentUrl: string | null;
  document?: KycDocument | null;
}

const KYC: React.FC = () => {
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [documentType, setDocumentType] =
    useState('');

  const [documentNumber, setDocumentNumber] =
    useState('');

  const [documentFile, setDocumentFile] =
    useState<File | null>(null);

  const [verification, setVerification] =
    useState<KycVerification | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [loadingStatus, setLoadingStatus] =
    useState(true);

  const [errorMessage, setErrorMessage] =
    useState('');

  const [successMessage, setSuccessMessage] =
    useState('');

  // ==========================================================
  // LOAD KYC STATUS
  // ==========================================================

  const loadKycStatus = async () => {
    try {
      setLoadingStatus(true);

      const response =
        await apiClient.get('/kyc');

      setVerification(
        response.data?.verification || null
      );
    } catch (error: any) {
      console.error(
        'KYC status error:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          'Unable to load your KYC verification status.'
      );
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    loadKycStatus();
  }, []);

  // ==========================================================
  // FILE SELECTION
  // ==========================================================

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files?.[0] || null;

    setErrorMessage('');
    setSuccessMessage('');
    setDocumentFile(null);

    if (!file) {
      return;
    }

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        'Please upload a JPG, PNG, WEBP image, or PDF document.'
      );
      return;
    }

    const maxSize =
      10 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrorMessage(
        'The document must be 10 MB or smaller.'
      );
      return;
    }

    setDocumentFile(file);
  };

  // ==========================================================
  // SUBMIT KYC
  // ==========================================================

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!documentType) {
      setErrorMessage(
        'Please select your document type.'
      );
      return;
    }

    if (!documentNumber.trim()) {
      setErrorMessage(
        'Please enter your document number.'
      );
      return;
    }

    if (!documentFile) {
      setErrorMessage(
        'Please upload your ID document.'
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        'documentType',
        documentType
      );

      formData.append(
        'documentNumber',
        documentNumber.trim()
      );

      formData.append(
        'document',
        documentFile
      );

      const response =
        await apiClient.post(
          '/kyc/submit',
          formData
        );

      setSuccessMessage(
        response.data?.message ||
          'Your KYC verification has been submitted successfully. It is now pending review.'
      );

      setDocumentType('');
      setDocumentNumber('');
      setDocumentFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      await loadKycStatus();
    } catch (error: any) {
      console.error(
        'KYC submission error:',
        error
      );

      setErrorMessage(
        error?.response?.data?.message ||
          'Failed to submit KYC verification. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // STATUS
  // ==========================================================

  const status =
    String(
      verification?.status || 'PENDING'
    )
      .trim()
      .toUpperCase();

  const hasApprovedKyc =
    status === 'APPROVED';

  const hasSubmittedDocument =
    Boolean(
      verification?.document ||
        verification?.documentUrl
    );

  const statusColor =
    status === 'APPROVED'
      ? 'success'
      : status === 'REJECTED'
        ? 'error'
        : 'warning';

  const statusLabel =
    status === 'APPROVED'
      ? 'Approved'
      : status === 'REJECTED'
        ? 'Rejected'
        : 'Pending Review';

  return (
    <Container
      maxWidth="md"
      sx={{
        py: {
          xs: 3,
          md: 6,
        },
      }}
    >
      <Card
        elevation={4}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        {/* ====================================================
            HEADER
        ==================================================== */}

        <Box
          sx={{
            background:
              'linear-gradient(135deg, #071331 0%, #0b2a66 100%)',
            color: '#fff',
            px: {
              xs: 3,
              md: 5,
            },
            py: {
              xs: 3,
              md: 4,
            },
          }}
        >
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
          >
            <VerifiedUser
              sx={{
                fontSize: 42,
              }}
            />

            <Box>
              <Typography
                variant="h4"
                fontWeight={700}
              >
                KYC Verification
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  mt: 0.5,
                  opacity: 0.85,
                }}
              >
                Verify your identity by uploading
                your official identification document.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <CardContent
          sx={{
            p: {
              xs: 3,
              md: 5,
            },
          }}
        >
          <Stack
            component="form"
            spacing={3}
            onSubmit={handleSubmit}
          >
            {/* =================================================
                STATUS
            ================================================= */}

            {!loadingStatus && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  backgroundColor: '#f8fafc',
                }}
              >
                <Stack
                  direction={{
                    xs: 'column',
                    sm: 'row',
                  }}
                  spacing={1.5}
                  alignItems={{
                    xs: 'flex-start',
                    sm: 'center',
                  }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography
                      variant="subtitle1"
                      fontWeight={700}
                    >
                      Verification Status
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {hasApprovedKyc
                        ? 'Your identity has been successfully verified.'
                        : status === 'REJECTED'
                          ? 'Your previous verification was rejected. You can submit a new document.'
                          : hasSubmittedDocument
                            ? 'Your identity verification is awaiting administrator review.'
                            : 'Please submit your identity document for verification.'}
                    </Typography>
                  </Box>

                  <Chip
                    label={statusLabel}
                    color={statusColor}
                    sx={{
                      fontWeight: 700,
                    }}
                  />
                </Stack>
              </Box>
            )}

            {errorMessage && (
              <Alert severity="error">
                {errorMessage}
              </Alert>
            )}

            {successMessage && (
              <Alert severity="success">
                {successMessage}
              </Alert>
            )}

            {/* =================================================
                APPROVED
            ================================================= */}

            {hasApprovedKyc ? (
              <Alert
                severity="success"
                icon={<VerifiedUser />}
              >
                Your identity verification has
                been approved. You do not need
                to submit another document.
              </Alert>
            ) : (
              <>
                <Alert severity="info">
                  Please upload a clear, valid
                  government-issued identification
                  document. Your document will be
                  reviewed by an administrator.
                </Alert>

                {/* =================================================
                    DOCUMENT TYPE
                ================================================= */}

                <FormControl fullWidth>
                  <InputLabel id="document-type-label">
                    Document Type
                  </InputLabel>

                  <Select
                    labelId="document-type-label"
                    value={documentType}
                    label="Document Type"
                    onChange={(event) =>
                      setDocumentType(
                        event.target.value
                      )
                    }
                  >
                    <MenuItem value="NATIONAL_ID">
                      National ID
                    </MenuItem>

                    <MenuItem value="PASSPORT">
                      Passport
                    </MenuItem>

                    <MenuItem value="DRIVERS_LICENSE">
                      Driver's License
                    </MenuItem>
                  </Select>
                </FormControl>

                {/* =================================================
                    DOCUMENT NUMBER
                ================================================= */}

                <TextField
                  fullWidth
                  label="ID / Document Number"
                  value={documentNumber}
                  onChange={(event) =>
                    setDocumentNumber(
                      event.target.value
                    )
                  }
                  placeholder="Enter your document number"
                />

                {/* =================================================
                    DOCUMENT UPLOAD
                ================================================= */}

                <Box>
                  <input
                    ref={fileInputRef}
                    type="file"
                    hidden
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    onChange={handleFileChange}
                  />

                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<CloudUpload />}
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    fullWidth
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                    }}
                  >
                    Upload ID Document
                  </Button>

                  {documentFile && (
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 1,
                        wordBreak: 'break-word',
                      }}
                    >
                      Selected file:{' '}
                      <strong>
                        {documentFile.name}
                      </strong>
                    </Typography>
                  )}
                </Box>

                {/* =================================================
                    SUBMIT
                ================================================= */}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={
                    loading ||
                    (
                      status === 'PENDING' &&
                      hasSubmittedDocument
                    )
                  }
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                  }}
                >
                  {loading
                    ? 'Submitting...'
                    : status === 'PENDING' &&
                        hasSubmittedDocument
                      ? 'KYC Pending Review'
                      : 'Submit KYC Verification'}
                </Button>
              </>
            )}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default KYC;
