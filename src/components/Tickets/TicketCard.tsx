import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  BugReport,
  Lightbulb,
  Support,
  Build,
  Payment,
  Help,
  Visibility,
  Edit,
} from '@mui/icons-material';
import { Ticket, TICKET_STATUS_OPTIONS, TICKET_PRIORITY_OPTIONS, TICKET_CATEGORY_OPTIONS } from '../../types/ticket';
import { format } from 'date-fns';

interface TicketCardProps {
  ticket: Ticket;
  onView?: (ticket: Ticket) => void;
  onEdit?: (ticket: Ticket) => void;
}

const TicketCard: React.FC<TicketCardProps> = ({ ticket, onView, onEdit }) => {
  const statusOption = TICKET_STATUS_OPTIONS.find(s => s.value === ticket.status);
  const priorityOption = TICKET_PRIORITY_OPTIONS.find(p => p.value === ticket.priority);
  const categoryOption = TICKET_CATEGORY_OPTIONS.find(c => c.value === ticket.category);

  const getCategoryIcon = () => {
    switch (ticket.category) {
      case 'BUG':
        return <BugReport />;
      case 'FEATURE_REQUEST':
        return <Lightbulb />;
      case 'SUPPORT':
        return <Support />;
      case 'TECHNICAL':
        return <Build />;
      case 'BILLING':
        return <Payment />;
      default:
        return <Help />;
    }
  };

  return (
    <Card
      sx={{
        mb: 2,
        cursor: 'pointer',
        '&:hover': {
          boxShadow: 4,
        },
      }}
      onClick={() => onView?.(ticket)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Box display="flex" alignItems="center" gap={1} flex={1}>
            {getCategoryIcon()}
            <Typography variant="h6" component="div" sx={{ flex: 1 }}>
              {ticket.title}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            {onEdit && (
              <Tooltip title="Edit">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(ticket);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
            {onView && (
              <Tooltip title="View Details">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(ticket);
                  }}
                >
                  <Visibility fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        </Box>

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

        <Box display="flex" gap={1} flexWrap="wrap" mb={1}>
          <Chip
            label={statusOption?.label || ticket.status}
            size="small"
            sx={{
              backgroundColor: statusOption?.color || '#666',
              color: 'white',
            }}
          />
          <Chip
            label={priorityOption?.label || ticket.priority}
            size="small"
            sx={{
              backgroundColor: priorityOption?.color || '#1976d2',
              color: 'white',
            }}
          />
          <Chip
            label={categoryOption?.label || ticket.category}
            size="small"
            variant="outlined"
          />
        </Box>

        <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
          <Typography variant="caption" color="text.secondary">
            Created: {format(new Date(ticket.createdAt), 'MMM dd, yyyy')}
          </Typography>
          {ticket.assignedToName && (
            <Typography variant="caption" color="text.secondary">
              Assigned to: {ticket.assignedToName}
            </Typography>
          )}
        </Box>

        {(ticket.commentCount !== undefined && ticket.commentCount > 0) && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {ticket.commentCount} comment{ticket.commentCount !== 1 ? 's' : ''}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default TicketCard;

