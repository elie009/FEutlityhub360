import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Container,
  Typography,
  useTheme,
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ApartmentIcon from '@mui/icons-material/Apartment';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FMS_BASE, PMS_BASE } from '../config/appRoutes';

const SystemHubPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #f8f9fa 0%, #e8f5e9 45%, #f1f8e9 100%)',
        py: 6,
      }}
    >
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom sx={{ color: '#1a1a1a' }}>
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 560 }}>
          Choose a workspace to continue.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 3,
          }}
        >
          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
            }}
          >
            <CardActionArea onClick={() => navigate(FMS_BASE, { replace: true })} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3, minHeight: 200, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'rgba(179, 238, 154, 0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AccountBalanceWalletIcon sx={{ fontSize: 32, color: '#2e7d32' }} />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Financial management system
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Bills, transactions, accounts, reports, and the full finance suite.
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>

          <Card
            elevation={2}
            sx={{
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[8] },
            }}
          >
            <CardActionArea onClick={() => navigate(PMS_BASE, { replace: true })} sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3, minHeight: 200, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    bgcolor: 'rgba(100, 181, 246, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <ApartmentIcon sx={{ fontSize: 32, color: '#1565c0' }} />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Property management system
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Manage properties, leases, and related workflows (preview).
                </Typography>
              </CardContent>
            </CardActionArea>
          </Card>
        </Box>
      </Container>
    </Box>
  );
};

export default SystemHubPage;
