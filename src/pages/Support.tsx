import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  TextField,
} from '@mui/material';
import {
  Support as SupportIcon,
  BugReport as BugIcon,
  QuestionAnswer as QuestionIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';

const Support: React.FC = () => {
  const tickets: any[] = [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open':
        return 'error';
      case 'In Progress':
        return 'warning';
      case 'Closed':
        return 'success';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'error';
      case 'Medium':
        return 'warning';
      case 'Low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Support Center
      </Typography>

      <Grid container spacing={3}>
        {/* Support Stats */}
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
                    0
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
                    0
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
                    0
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
                    0
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Create New Ticket */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Create New Support Ticket
            </Typography>
            <Box component="form" sx={{ mt: 2 }}>
              <TextField
                fullWidth
                label="Subject"
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={4}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              <Button variant="contained" fullWidth>
                Submit Ticket
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Tickets */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Support Tickets
            </Typography>
            <Box sx={{ mt: 2 }}>
              {tickets.length === 0 && (
                <Typography variant="body2" color="textSecondary" sx={{ textAlign: 'center', py: 4 }}>
                  No support tickets found
                </Typography>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Support;
