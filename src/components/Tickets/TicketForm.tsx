import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
} from '@mui/material';
import {
  Ticket,
  CreateTicketRequest,
  UpdateTicketRequest,
  TICKET_PRIORITY_OPTIONS,
  TICKET_CATEGORY_OPTIONS,
  TICKET_STATUS_OPTIONS,
} from '../../types/ticket';

interface TicketFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTicketRequest | UpdateTicketRequest) => Promise<void>;
  ticket?: Ticket | null;
  isAdmin?: boolean;
}

const TicketForm: React.FC<TicketFormProps> = ({
  open,
  onClose,
  onSubmit,
  ticket,
  isAdmin = false,
}) => {
  const [formData, setFormData] = useState<CreateTicketRequest | UpdateTicketRequest>({
    title: '',
    description: '',
    priority: 'NORMAL',
    category: 'GENERAL',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ticket) {
      setFormData({
        title: ticket.title,
        description: ticket.description,
        priority: ticket.priority,
        category: ticket.category,
        status: ticket.status,
        assignedTo: ticket.assignedTo,
        resolutionNotes: ticket.resolutionNotes,
      });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: 'NORMAL',
        category: 'GENERAL',
      });
    }
    setError('');
  }, [ticket, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.title || !formData.description) {
        setError('Title and description are required');
        setLoading(false);
        return;
      }

      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>{ticket ? 'Edit Ticket' : 'Create New Ticket'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              fullWidth
            />

            <TextField
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
              fullWidth
              multiline
              rows={4}
            />

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority || 'NORMAL'}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  {TICKET_PRIORITY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category || 'GENERAL'}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                >
                  {TICKET_CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {isAdmin && ticket && (
              <>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={(formData as UpdateTicketRequest).status || ticket.status}
                    label="Status"
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as any })
                    }
                  >
                    {TICKET_STATUS_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {(formData as UpdateTicketRequest).status === 'RESOLVED' ||
                (formData as UpdateTicketRequest).status === 'CLOSED' ? (
                  <TextField
                    label="Resolution Notes"
                    value={(formData as UpdateTicketRequest).resolutionNotes || ''}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        resolutionNotes: e.target.value,
                      } as UpdateTicketRequest)
                    }
                    fullWidth
                    multiline
                    rows={3}
                  />
                ) : null}
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {ticket ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default TicketForm;

