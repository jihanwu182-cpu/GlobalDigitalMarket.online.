import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  Rating,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import {
  Add,
  Delete,
  Edit,
  Refresh,
} from '@mui/icons-material';

import apiClient from '../services/apiClient';

interface Testimonial {
  id: number;
  name: string;
  country: string;
  rating: number;
  testimonial: string;
  photoUrl?: string;
  status: 'DRAFT' | 'PUBLISHED';
  createdAt?: string;
  updatedAt?: string;
}

interface TestimonialForm {
  name: string;
  country: string;
  rating: number;
  testimonial: string;
  photoUrl: string;
  status: 'DRAFT' | 'PUBLISHED';
}

const emptyForm: TestimonialForm = {
  name: '',
  country: 'Global Client',
  rating: 5,
  testimonial: '',
  photoUrl: '',
  status: 'DRAFT',
};

const AdminTestimonials: React.FC = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState<TestimonialForm>(emptyForm);

  const loadTestimonials = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const response = await apiClient.get('/testimonials/admin');

      const data = response.data;

      if (Array.isArray(data)) {
        setTestimonials(data);
      } else if (Array.isArray(data?.testimonials)) {
        setTestimonials(data.testimonials);
      } else if (Array.isArray(data?.data)) {
        setTestimonials(data.data);
      } else {
        setTestimonials([]);
      }
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to load testimonials.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTestimonials();
  }, [loadTestimonials]);

  const openAddDialog = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError('');
    setSuccess('');
    setDialogOpen(true);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingId(testimonial.id);

    setForm({
      name: testimonial.name || '',
      country: testimonial.country || 'Global Client',
      rating: testimonial.rating || 5,
      testimonial: testimonial.testimonial || '',
      photoUrl: testimonial.photoUrl || '',
      status: testimonial.status || 'DRAFT',
    });

    setError('');
    setSuccess('');
    setDialogOpen(true);
  };

  const closeDialog = () => {
    if (saving) return;

    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Customer name is required.');
      return;
    }

    if (!form.testimonial.trim()) {
      setError('Testimonial text is required.');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        name: form.name.trim(),
        country: form.country.trim() || 'Global Client',
        rating: form.rating,
        testimonial: form.testimonial.trim(),
        photoUrl: form.photoUrl.trim(),
        status: form.status,
      };

      if (editingId) {
        await apiClient.patch(
          `/testimonials/admin/${editingId}`,
          payload
        );

        setSuccess('Testimonial updated successfully.');
      } else {
        await apiClient.post(
          '/testimonials/admin',
          payload
        );

        setSuccess('Testimonial created successfully.');
      }

      setDialogOpen(false);
      setEditingId(null);
      setForm(emptyForm);

      await loadTestimonials();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to save testimonial.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this testimonial?'
    );

    if (!confirmed) return;

    try {
      setError('');
      setSuccess('');

      await apiClient.delete(
        `/testimonials/admin/${id}`
      );

      setSuccess('Testimonial deleted successfully.');

      await loadTestimonials();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to delete testimonial.'
      );
    }
  };

  const handleStatusChange = async (
    testimonial: Testimonial
  ) => {
    const newStatus =
      testimonial.status === 'PUBLISHED'
        ? 'DRAFT'
        : 'PUBLISHED';

    try {
      setError('');
      setSuccess('');

      await apiClient.patch(
        `/testimonials/admin/${testimonial.id}`,
        {
          status: newStatus,
        }
      );

      setSuccess(
        newStatus === 'PUBLISHED'
          ? 'Testimonial published.'
          : 'Testimonial hidden.'
      );

      await loadTestimonials();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          'Failed to update testimonial status.'
      );
    }
  };

  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'stretch', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography
            variant="h5"
            fontWeight={900}
          >
            Testimonials
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 0.5 }}
          >
            Manage customer testimonials displayed
            on the website.
          </Typography>
        </Box>

        <Stack
          direction="row"
          spacing={1}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadTestimonials}
            disabled={loading}
          >
            Refresh
          </Button>

          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={openAddDialog}
          >
            Add Testimonial
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Alert
          severity="error"
          sx={{ mb: 2 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}

      {success && (
        <Alert
          severity="success"
          sx={{ mb: 2 }}
          onClose={() => setSuccess('')}
        >
          {success}
        </Alert>
      )}

      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            py: 8,
          }}
        >
          <CircularProgress />
        </Box>
      ) : testimonials.length === 0 ? (
        <Card>
          <CardContent
            sx={{
              textAlign: 'center',
              py: 7,
            }}
          >
            <Typography
              fontWeight={800}
              sx={{ mb: 1 }}
            >
              No testimonials yet
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Add your first testimonial when you
              have a genuine customer review.
            </Typography>

            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={openAddDialog}
            >
              Add Testimonial
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
            },
            gap: 2,
          }}
        >
          {testimonials.map((testimonial) => (
            <Card
              key={testimonial.id}
              sx={{
                borderRadius: 3,
                height: '100%',
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={2}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      fontWeight={900}
                    >
                      {testimonial.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {testimonial.country}
                    </Typography>

                    <Rating
                      value={testimonial.rating}
                      readOnly
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>

                  <Chip
                    label={
                      testimonial.status ===
                      'PUBLISHED'
                        ? 'Published'
                        : 'Draft'
                    }
                    color={
                      testimonial.status ===
                      'PUBLISHED'
                        ? 'success'
                        : 'default'
                    }
                    size="small"
                  />
                </Stack>

                <Typography
                  variant="body2"
                  sx={{
                    mt: 2,
                    lineHeight: 1.7,
                  }}
                >
                  {testimonial.testimonial}
                </Typography>

                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ mt: 2 }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() =>
                      openEditDialog(testimonial)
                    }
                  >
                    Edit
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() =>
                      handleStatusChange(testimonial)
                    }
                  >
                    {testimonial.status ===
                    'PUBLISHED'
                      ? 'Hide'
                      : 'Publish'}
                  </Button>

                  <IconButton
                    color="error"
                    onClick={() =>
                      handleDelete(testimonial.id)
                    }
                  >
                    <Delete />
                  </IconButton>
                </Stack>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      <Dialog
        open={dialogOpen}
        onClose={closeDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={900}>
          {editingId
            ? 'Edit Testimonial'
            : 'Add Testimonial'}
        </DialogTitle>

        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Customer Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              fullWidth
              required
            />

            <TextField
              label="Country"
              value={form.country}
              onChange={(e) =>
                setForm({
                  ...form,
                  country: e.target.value,
                })
              }
              fullWidth
            />

            <Box>
              <Typography
                variant="body2"
                fontWeight={700}
                sx={{ mb: 0.5 }}
              >
                Rating
              </Typography>

              <Rating
                value={form.rating}
                onChange={(_, value) =>
                  setForm({
                    ...form,
                    rating: value || 5,
                  })
                }
              />
            </Box>

            <TextField
              label="Testimonial"
              value={form.testimonial}
              onChange={(e) =>
                setForm({
                  ...form,
                  testimonial: e.target.value,
                })
              }
              fullWidth
              required
              multiline
              minRows={5}
            />

            <TextField
              label="Photo URL (optional)"
              value={form.photoUrl}
              onChange={(e) =>
                setForm({
                  ...form,
                  photoUrl: e.target.value,
                })
              }
              fullWidth
            />

            <TextField
              select
              label="Status"
              value={form.status}
              onChange={(e) =>
                setForm({
                  ...form,
                  status: e.target.value as
                    | 'DRAFT'
                    | 'PUBLISHED',
                })
              }
              fullWidth
            >
              <MenuItem value="DRAFT">
                Draft
              </MenuItem>

              <MenuItem value="PUBLISHED">
                Published
              </MenuItem>
            </TextField>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeDialog}
            disabled={saving}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Testimonial'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTestimonials;
