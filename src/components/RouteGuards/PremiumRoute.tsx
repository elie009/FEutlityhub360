import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { usePremiumFeature } from '../../hooks/usePremiumFeature';
import { FinanceLoader } from '../Common';
import SubscriptionModal from '../Subscription/SubscriptionModal';

interface PremiumRouteProps {
  children: React.ReactNode;
  feature: string;
  requiredTier?: 'PREMIUM' | 'ENTERPRISE';
}

/**
 * Route guard that checks if user has access to a premium feature
 * Redirects to home with upgrade prompt if access is denied
 */
const PremiumRoute: React.FC<PremiumRouteProps> = ({ children, feature, requiredTier }) => {
  const { hasAccess, loading } = usePremiumFeature(feature);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !hasAccess && !subscriptionModalOpen) {
      setSubscriptionModalOpen(true);
    }
  }, [loading, hasAccess, subscriptionModalOpen]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <FinanceLoader size="large" text="Checking access..." fullScreen />
      </Box>
    );
  }

  if (!hasAccess) {
    return (
      <>
        <Navigate to="/" replace />
        <SubscriptionModal
          open={subscriptionModalOpen}
          onClose={() => {
            setSubscriptionModalOpen(false);
            navigate('/');
          }}
        />
      </>
    );
  }

  return <>{children}</>;
};

export default PremiumRoute;

