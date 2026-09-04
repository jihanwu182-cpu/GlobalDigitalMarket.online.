import React, { useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
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

const KYC: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [documentType, setDocumentType] = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0] || null;

    setErrorMessage('');
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

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      setErrorMessage(
        'The document must be 10 MB or smaller.'
      );
      return;
    }

    setDocumentFile(file);
  };

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    setErrorMessage('');
    setSuccessMessage('');

    if (!documentType) {
      setErrorMessage('Please select your document type.');
      return;
    }

    if (!documentNumber.trim()) {
      setErrorMessage('Please enter your document number.');
      return;
    }

    if (!documentFile) {
      setErrorMessage('Please upload your ID document.');
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

      await apiClient.post(
        '/kyc/submit',
        formData
      );

      setSuccessMessage(
        'Your KYC verification has been submitted successfully. It is now pending review.'
      );

      setDocumentType('');
      setDocumentNumber('');
      setDocumentFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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

  return (
    <Container
      maxWidth="md"
      sx={{ py: { xs: 3, md: 6 } }}
    >
      <Card
        elevation={4}
        sx={{
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            background:
              'linear-gradient(135deg, #071331 0%, #0b2a66 100%)',
            color: '#fff',
            px: { xs: 3, md: 5 },
            py: { xs: 3, md: 4 },
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
                sx={{ mt: 0.5, opacity: 0.85 }}
              >
                Verify your identity by uploading
                your official identification document.
              </Typography>
            </Box>
          </Stack>
        </Box>

        <CardContent
          sx={{
            p: { xs: 3, md: 5 },
          }}
        >
          <Stack
            component="form"
            spacing={3}
            onSubmit={handleSubmit}
          >
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

            <Alert severity="info">
              Please upload a clear, valid government-issued
              identification document. Your document will be
              reviewed by an administrator.
            </Alert>

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
                <MenuItem value="National ID">
                  National ID
                </MenuItem>

                <MenuItem value="Passport">
                  Passport
                </MenuItem>

                <MenuItem value="Driver's License">
                  Driver's License
                </MenuItem>

                <MenuItem value="Residence Permit">
                  Residence Permit
                </MenuItem>
              </Select>
            </FormControl>

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

            <Box>
              <input
                ref={fileInputRef}
                type="file"
                hidden
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
              />

              <Button
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

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 700,
              }}
            >
              {loading
                ? 'Submitting...'
                : 'Submit KYC Verification'}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default KYC;
