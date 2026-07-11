import React from 'react';
import { Box, Paper, Typography } from '@mui/material';

interface PmsPageScaffoldProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

const PmsPageScaffold: React.FC<PmsPageScaffoldProps> = ({ title, description, children }) => (
  <Paper
    elevation={0}
    sx={{
      p: { xs: 2, sm: 3 },
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.paper',
    }}
  >
    <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: '#1a1a1a' }}>
      {title}
    </Typography>
    {description && (
      <Typography variant="body1" color="text.secondary" sx={{ mb: children ? 2 : 0 }}>
        {description}
      </Typography>
    )}
    {children && <Box sx={{ mt: 1 }}>{children}</Box>}
  </Paper>
);

export default PmsPageScaffold;
