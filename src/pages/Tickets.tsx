import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Fab,
  Dialog,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  FilterList,
  Refresh,
  Search,
  Clear,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  Ticket,
  TicketFilters,
  CreateTicketRequest,
  UpdateTicketRequest,
  TICKET_STATUS_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
  TICKET_CATEGORY_OPTIONS,
  PaginatedTicketsResponse,
} from '../types/ticket';
import TicketCard from '../components/Tickets/TicketCard';
import TicketForm from '../components/Tickets/TicketForm';
import TicketDetail from '../components/Tickets/TicketDetail';

const Tickets: React.FC = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showTicketForm, setShowTicketForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [showTicketDetail, setShowTicketDetail] = useState(false);
  const [filters, setFilters] = useState<TicketFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadTickets();
  }, [page, filters]);

  const loadTickets = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getTickets(filters, page, limit);
      // Backend returns Data (not items) in PaginatedResponse
      setTickets(response.data || response.items || []);
      setTotalPages(response.totalPages || 1);
      setTotalCount(response.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async (data: CreateTicketRequest) => {
    try {
      await apiService.createTicket(data);
      setSuccessMessage('Ticket created successfully');
      setShowTicketForm(false);
      // Reset to page 1 and clear filters to show the new ticket
      setPage(1);
      setFilters({});
      await loadTickets();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to create ticket');
    }
  };

  const handleUpdateTicket = async (data: UpdateTicketRequest) => {
    if (!selectedTicket) return;

    try {
      await apiService.updateTicket(selectedTicket.id, data);
      setSuccessMessage('Ticket updated successfully');
      setShowTicketForm(false);
      setSelectedTicket(null);
      await loadTickets();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      throw new Error(err.message || 'Failed to update ticket');
    }
  };

  const handleFormSubmit = async (data: CreateTicketRequest | UpdateTicketRequest) => {
    if (selectedTicket) {
      await handleUpdateTicket(data as UpdateTicketRequest);
    } else {
      await handleCreateTicket(data as CreateTicketRequest);
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!window.confirm('Are you sure you want to delete this ticket?')) return;

    try {
      await apiService.deleteTicket(ticketId);
      setSuccessMessage('Ticket deleted successfully');
      await loadTickets();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete ticket');
    }
  };

  const handleViewTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetail(true);
  };

  const handleEditTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setShowTicketForm(true);
  };

  const clearFilters = () => {
    setFilters({});
    setPage(1);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Support Tickets</Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Filter">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={loadTickets}>
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {showFilters && (
        <Card sx={{ mb: 3, p: 2 }}>
          <Box display="flex" flexDirection="column" gap={2}>
            <Box display="flex" gap={2} flexWrap="wrap">
              <TextField
                label="Search"
                size="small"
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ flex: 1, minWidth: 200 }}
              />
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.status || ''}
                  label="Status"
                  onChange={(e) =>
                    setFilters({ ...filters, status: e.target.value as any })
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {TICKET_STATUS_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={filters.priority || ''}
                  label="Priority"
                  onChange={(e) =>
                    setFilters({ ...filters, priority: e.target.value as any })
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {TICKET_PRIORITY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={filters.category || ''}
                  label="Category"
                  onChange={(e) =>
                    setFilters({ ...filters, category: e.target.value as any })
                  }
                >
                  <MenuItem value="">All</MenuItem>
                  {TICKET_CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                startIcon={<Clear />}
                onClick={clearFilters}
              >
                Clear
              </Button>
            </Box>
          </Box>
        </Card>
      )}

      {loading ? (
        <Grid container spacing={2}>
          {[1, 2, 3].map((i) => (
            <Grid item xs={12} key={i}>
              <Skeleton variant="rectangular" height={200} />
            </Grid>
          ))}
        </Grid>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="h6" align="center" color="text.secondary">
              No tickets found
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mt: 1 }}>
              {Object.keys(filters).length > 0
                ? 'Try adjusting your filters'
                : 'Create your first ticket to get started'}
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <>
          <Box mb={2}>
            <Typography variant="body2" color="text.secondary">
              Showing {tickets.length} of {totalCount} tickets
            </Typography>
          </Box>
          <Grid container spacing={2}>
            {tickets.map((ticket) => (
              <Grid item xs={12} key={ticket.id}>
                <TicketCard
                  ticket={ticket}
                  onView={handleViewTicket}
                  onEdit={isAdmin ? handleEditTicket : undefined}
                />
              </Grid>
            ))}
          </Grid>
          {totalPages > 1 && (
            <Box display="flex" justifyContent="center" mt={3}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          setSelectedTicket(null);
          setShowTicketForm(true);
        }}
      >
        <AddIcon />
      </Fab>

      <TicketForm
        open={showTicketForm}
        onClose={() => {
          setShowTicketForm(false);
          setSelectedTicket(null);
        }}
        onSubmit={handleFormSubmit}
        ticket={selectedTicket}
        isAdmin={isAdmin}
      />

      <TicketDetail
        open={showTicketDetail}
        onClose={() => {
          setShowTicketDetail(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onUpdate={loadTickets}
        isAdmin={isAdmin}
      />
    </Box>
  );
};

export default Tickets;

