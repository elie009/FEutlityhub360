import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { CheckCircle, Close } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import SubscriptionModal from './SubscriptionModal';

interface UpgradePromptProps {
  open: boolean;
  onClose: () => void;
  featureName: string;
  featureDescription?: string;
  premiumFeatures?: string[];
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  open,
  onClose,
  featureName,
  featureDescription,
  premiumFeatures = [],
}) => {
  const navigate = useNavigate();
  const [showSubscriptionModal, setShowSubscriptionModal] = React.useState(false);

  const defaultFeatures = [
    'Unlimited bank accounts',
    'Unlimited transactions',
    'Unlimited bills and loans',
    'AI Financial Assistant',
    'Bank feed integration',
    'Receipt OCR (up to 50/month)',
    'Advanced reports & analytics',
    'Financial health score',
    'Bill forecasting',
    'Debt payoff optimizer',
    'Priority support',
  ];

  const featuresToShow = premiumFeatures.length > 0 ? premiumFeatures : defaultFeatures;

  const handleUpgrade = () => {
    onClose();
    setShowSubscriptionModal(true);
  };

  const handleCloseModal = () => {
    setShowSubscriptionModal(false);
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 2,
            borderBottom: '1px solid #e5e5e5',
          }}
        >
          <Typography variant="h5" component="h2" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
            Premium Feature
          </Typography>
          <Button
            onClick={onClose}
            sx={{
              minWidth: 'auto',
              p: 0.5,
              color: '#666666',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            <Close />
          </Button>
        </DialogTitle>

        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, color: '#1a1a1a' }}>
              {featureName} is a Premium Feature
            </Typography>
            {featureDescription && (
              <Typography variant="body2" sx={{ color: '#666666', mb: 3 }}>
                {featureDescription}
              </Typography>
            )}
            <Typography variant="body1" sx={{ color: '#666666' }}>
              Upgrade to Premium to unlock this feature and more:
            </Typography>
          </Box>

          <List sx={{ maxHeight: 300, overflowY: 'auto', mb: 2 }}>
            {featuresToShow.map((feature, index) => (
              <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircle sx={{ color: '#4caf50', fontSize: 20 }} />
                </ListItemIcon>
                <ListItemText
                  primary={feature}
                  primaryTypographyProps={{
                    variant: 'body2',
                    sx: { color: '#666666' },
                  }}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>

        <DialogActions sx={{ p: 3, pt: 2, borderTop: '1px solid #e5e5e5' }}>
          <Button
            onClick={onClose}
            variant="outlined"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              borderColor: '#666666',
              color: '#666666',
              '&:hover': {
                borderColor: '#333333',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
          >
            Maybe Later
          </Button>
          <Button
            onClick={handleUpgrade}
            variant="contained"
            sx={{
              borderRadius: 2,
              px: 3,
              py: 1,
              textTransform: 'none',
              backgroundColor: '#4caf50',
              fontWeight: 600,
              '&:hover': {
                backgroundColor: '#45a049',
              },
            }}
          >
            Upgrade to Premium
          </Button>
        </DialogActions>
      </Dialog>

      <SubscriptionModal open={showSubscriptionModal} onClose={handleCloseModal} />
    </>
  );
};

export default UpgradePrompt;

