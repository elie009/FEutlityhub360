import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  TextField,
  Paper,
  Divider,
  IconButton,
  Tooltip,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  Close,
  AttachFile,
  Send,
  Download,
  BugReport,
  Lightbulb,
  Support,
  Build,
  Payment,
  Help,
} from '@mui/icons-material';
import { Ticket, TicketComment, TicketAttachment, CreateTicketCommentRequest } from '../../types/ticket';
import { format } from 'date-fns';
import { apiService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

interface TicketDetailProps {
  open: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onUpdate?: () => void;
  isAdmin?: boolean;
}

const TicketDetail: React.FC<TicketDetailProps> = ({
  open,
  onClose,
  ticket,
  onUpdate,
  isAdmin = false,
}) => {
  const { user } = useAuth();
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [attachments, setAttachments] = useState<TicketAttachment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open && ticket) {
      loadTicketDetails();
    }
  }, [open, ticket]);

  const loadTicketDetails = async () => {
    if (!ticket) return;

    try {
      setLoading(true);
      const [commentsData, attachmentsData] = await Promise.all([
        apiService.getTicketComments(ticket.id),
        apiService.getTicketAttachments(ticket.id),
      ]);
      setComments(commentsData);
      setAttachments(attachmentsData);
    } catch (err: any) {
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!ticket || !newComment.trim()) return;

    try {
      setLoading(true);
      setError('');
      await apiService.addTicketComment(ticket.id, {
        comment: newComment,
        isInternal: false,
      });
      setNewComment('');
      await loadTicketDetails();
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || 'Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!ticket || !e.target.files?.[0]) return;

    try {
      setLoading(true);
      setError('');
      await apiService.addTicketAttachment(ticket.id, e.target.files[0]);
      await loadTicketDetails();
      onUpdate?.();
    } catch (err: any) {
      setError(err.message || 'Failed to upload attachment');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = () => {
    if (!ticket) return <Help />;
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

  if (!ticket) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={1}>
            {getCategoryIcon()}
            <Typography variant="h6">{ticket.title}</Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Box display="flex" gap={1} flexWrap="wrap" mb={2}>
            <Chip label={ticket.status} size="small" />
            <Chip label={ticket.priority} size="small" />
            <Chip label={ticket.category} size="small" variant="outlined" />
          </Box>

          <Typography variant="body1" sx={{ mb: 2, whiteSpace: 'pre-wrap' }}>
            {ticket.description}
          </Typography>

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" color="text.secondary">
            Created: {format(new Date(ticket.createdAt), 'MMM dd, yyyy HH:mm')}
          </Typography>
          {ticket.assignedToName && (
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Assigned to: {ticket.assignedToName}
            </Typography>
          )}
          {ticket.resolutionNotes && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Resolution Notes:
              </Typography>
              <Typography variant="body2">{ticket.resolutionNotes}</Typography>
            </Box>
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Attachments ({attachments.length})
        </Typography>
        {attachments.length > 0 ? (
          <List>
            {attachments.map((attachment) => (
              <ListItem key={attachment.id}>
                <ListItemAvatar>
                  <Avatar>
                    <AttachFile />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={attachment.fileName}
                  secondary={`${(attachment.fileSize || 0) / 1024} KB - ${format(
                    new Date(attachment.createdAt),
                    'MMM dd, yyyy'
                  )}`}
                />
                <Button
                  size="small"
                  startIcon={<Download />}
                  href={attachment.fileUrl}
                  target="_blank"
                >
                  Download
                </Button>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No attachments
          </Typography>
        )}

        <Box sx={{ mt: 2, mb: 1 }}>
          <input
            accept="*/*"
            style={{ display: 'none' }}
            id="file-upload"
            type="file"
            onChange={handleFileUpload}
          />
          <label htmlFor="file-upload">
            <Button
              component="span"
              variant="outlined"
              startIcon={<AttachFile />}
              size="small"
              disabled={loading}
            >
              Upload Attachment
            </Button>
          </label>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Comments ({comments.length})
        </Typography>

        <List>
          {comments.map((comment) => (
            <Paper key={comment.id} sx={{ p: 2, mb: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                <Typography variant="subtitle2">
                  {comment.userName || 'Unknown User'}
                  {comment.isInternal && (
                    <Chip label="Internal" size="small" sx={{ ml: 1 }} />
                  )}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {format(new Date(comment.createdAt), 'MMM dd, yyyy HH:mm')}
                </Typography>
              </Box>
              <Typography variant="body2">{comment.comment}</Typography>
            </Paper>
          ))}
        </List>

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            disabled={loading}
          />
          <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              startIcon={<Send />}
              onClick={handleAddComment}
              disabled={loading || !newComment.trim()}
            >
              Add Comment
            </Button>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default TicketDetail;

