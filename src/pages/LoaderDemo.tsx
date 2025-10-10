import React from 'react';
import { Box, Typography, Paper, Grid, Divider } from '@mui/material';
import { FinanceLoader } from '../components/Common';
import SimpleFinanceLoader from '../components/Common/SimpleFinanceLoader';

const LoaderDemo: React.FC = () => {
  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 4 }}>
        Custom Finance Loaders Demo
      </Typography>

      {/* FinanceLoader - Different Sizes */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Finance Loader (Animated)
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Professional loader with rotating rings, pulsing center, and floating icons
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Small
              </Typography>
              <FinanceLoader size="small" text="Loading..." />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Medium (Default)
              </Typography>
              <FinanceLoader size="medium" text="Loading..." />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Large
              </Typography>
              <FinanceLoader size="large" text="Loading..." />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* SimpleFinanceLoader - Different Sizes */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Simple Finance Loader
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Minimalist loader with circular progress and dollar sign
        </Typography>
        
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Small
              </Typography>
              <SimpleFinanceLoader size="small" text="Loading..." />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Medium (Default)
              </Typography>
              <SimpleFinanceLoader size="medium" text="Processing..." />
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Box sx={{ textAlign: 'center', p: 3, bgcolor: '#f8fafc', borderRadius: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Large
              </Typography>
              <SimpleFinanceLoader size="large" text="Please wait..." />
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Use Cases */}
      <Paper sx={{ p: 4, mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Use Cases
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Full Screen Loading
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use for initial app load or authentication
              </Typography>
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, textAlign: 'center' }}>
                <FinanceLoader size="medium" text="Authenticating" fullScreen={false} />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Inline Loading
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use for loading data in specific sections
              </Typography>
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, textAlign: 'center' }}>
                <SimpleFinanceLoader size="small" text="Loading bills..." />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Card Loading
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use for loading data inside cards
              </Typography>
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, textAlign: 'center' }}>
                <SimpleFinanceLoader size="medium" text="Loading transactions..." />
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f8fafc', height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Button Loading
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Use for small inline states
              </Typography>
              <Box sx={{ bgcolor: 'white', p: 3, borderRadius: 2, textAlign: 'center' }}>
                <SimpleFinanceLoader size="small" />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Implementation Guide */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Implementation
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body2" component="pre" sx={{ 
          bgcolor: '#1e293b', 
          color: '#f8fafc', 
          p: 2, 
          borderRadius: 1,
          overflow: 'auto',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
        }}>
{`// Import the loader
import { FinanceLoader, SimpleFinanceLoader } from '../components/Common';

// Use in your component
<FinanceLoader size="large" text="Loading..." fullScreen />

// Or use the simple version
<SimpleFinanceLoader size="medium" text="Processing..." />

// Props:
// size: 'small' | 'medium' | 'large'
// text: string (optional)
// fullScreen: boolean (only for FinanceLoader, default: false)`}
        </Typography>
      </Paper>
    </Box>
  );
};

export default LoaderDemo;

