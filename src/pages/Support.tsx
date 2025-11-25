import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Tooltip,
  Alert,
  Skeleton,
  Pagination,
  Divider,
} from '@mui/material';
import {
  Support as SupportIcon,
  BugReport as BugIcon,
  QuestionAnswer as QuestionIcon,
  Feedback as FeedbackIcon,
  Add as AddIcon,
  FilterList,
  Refresh,
  Search,
  Clear,
  Visibility,
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
import { useNavigate } from 'react-router-dom';

const Support: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    loadTickets();
  }, [page, filters]);

  useEffect(() => {
    loadStatistics();
  }, []);

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

  const loadStatistics = async () => {
    try {
      // Load all tickets to calculate statistics
      const allTickets = await apiService.getTickets({}, 1, 1000);
      const ticketList = allTickets.data || allTickets.items || [];
      
      setStats({
        total: ticketList.length,
        open: ticketList.filter((t: Ticket) => t.status === 'OPEN').length,
        inProgress: ticketList.filter((t: Ticket) => t.status === 'IN_PROGRESS').length,
        resolved: ticketList.filter((t: Ticket) => t.status === 'RESOLVED' || t.status === 'CLOSED').length,
      });
    } catch (err: any) {
      // Silently fail statistics loading
      console.error('Failed to load statistics:', err);
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
      await loadStatistics();
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
      await loadStatistics();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'error';
      case 'IN_PROGRESS':
        return 'warning';
      case 'RESOLVED':
      case 'CLOSED':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Support Center</Typography>
        <Box display="flex" gap={1}>
          <Tooltip title="Filter">
            <IconButton onClick={() => setShowFilters(!showFilters)}>
              <FilterList />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={() => { loadTickets(); loadStatistics(); }}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/tickets')}
          >
            View All Tickets
          </Button>
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

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SupportIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Total Tickets
                  </Typography>
                  <Typography variant="h4">
                    {loading ? <Skeleton width={40} /> : stats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BugIcon sx={{ fontSize: 40, color: 'error.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Open Tickets
                  </Typography>
                  <Typography variant="h4">
                    {loading ? <Skeleton width={40} /> : stats.open}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <QuestionIcon sx={{ fontSize: 40, color: 'warning.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    In Progress
                  </Typography>
                  <Typography variant="h4">
                    {loading ? <Skeleton width={40} /> : stats.inProgress}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FeedbackIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Resolved
                  </Typography>
                  <Typography variant="h4">
                    {loading ? <Skeleton width={40} /> : stats.resolved}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
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

      {/* Quick Create Ticket Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New Support Ticket
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              Need help? Create a support ticket and our team will assist you.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedTicket(null);
                setShowTicketForm(true);
              }}
              sx={{ mt: 2 }}
            >
              Create New Ticket
            </Button>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({ ...filters, status: 'OPEN' })}
              >
                View Open Tickets
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({ ...filters, status: 'IN_PROGRESS' })}
              >
                View In Progress Tickets
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => navigate('/tickets')}
              >
                View All Tickets
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Tickets */}
      <Paper sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">Recent Support Tickets</Typography>
          {totalCount > 0 && (
            <Typography variant="body2" color="text.secondary">
              Showing {tickets.length} of {totalCount} tickets
            </Typography>
          )}
        </Box>

        <Divider sx={{ mb: 2 }} />

        {loading ? (
          <Grid container spacing={2}>
            {[1, 2, 3].map((i) => (
              <Grid item xs={12} key={i}>
                <Skeleton variant="rectangular" height={150} />
              </Grid>
            ))}
          </Grid>
        ) : tickets.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <SupportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No tickets found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {Object.keys(filters).length > 0
                ? 'Try adjusting your filters'
                : 'Create your first support ticket to get started'}
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedTicket(null);
                setShowTicketForm(true);
              }}
            >
              Create Ticket
            </Button>
          </Box>
        ) : (
          <>
            <Grid container spacing={2}>
              {tickets.map((ticket) => (
                <Grid item xs={12} key={ticket.id}>
                  <Card
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 4,
                      },
                    }}
                    onClick={() => handleViewTicket(ticket)}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Typography variant="h6" component="div" gutterBottom>
                            {ticket.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              mb: 2,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {ticket.description}
                          </Typography>
                          <Box display="flex" gap={1} flexWrap="wrap">
                            <Chip
                              label={ticket.status}
                              size="small"
                              color={getStatusColor(ticket.status) as any}
                            />
                            <Chip
                              label={ticket.priority}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={ticket.category}
                              size="small"
                              variant="outlined"
                            />
                          </Box>
                        </Box>
                        <Box display="flex" gap={1}>
                          {isAdmin && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTicket(ticket);
                                }}
                              >
                                <Visibility fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewTicket(ticket);
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
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
      </Paper>

      {/* Ticket Form Dialog */}
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

      {/* Ticket Detail Dialog */}
      <TicketDetail
        open={showTicketDetail}
        onClose={() => {
          setShowTicketDetail(false);
          setSelectedTicket(null);
        }}
        ticket={selectedTicket}
        onUpdate={() => {
          loadTickets();
          loadStatistics();
        }}
        isAdmin={isAdmin}
      />
    </Box>
  );
};

export default Support;
