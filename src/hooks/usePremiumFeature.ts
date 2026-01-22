import { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

export interface PremiumFeatureCheck {
  hasAccess: boolean;
  loading: boolean;
  error: string | null;
}

// Cache to store feature access results and avoid duplicate API calls
const featureAccessCache: Map<string, { hasAccess: boolean; timestamp: number }> = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes cache

// Track ongoing requests to prevent duplicate simultaneous calls for the same feature
const pendingRequests: Map<string, Promise<boolean>> = new Map();

/**
 * Hook to check if user has access to a premium feature
 * @param feature - Feature name (e.g., 'AI_ASSISTANT', 'BANK_FEED', 'RECEIPT_OCR', 'FINANCIAL_HEALTH_SCORE', 'BILL_FORECASTING', 'DEBT_OPTIMIZER', 'INVESTMENT_TRACKING', 'TAX_OPTIMIZATION', 'MULTI_USER', 'API_ACCESS', 'WHITE_LABEL')
 * @returns Object with hasAccess, loading, and error states
 */
export const usePremiumFeature = (feature: string): PremiumFeatureCheck => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const checkFeatureAccess = async () => {
      if (!isAuthenticated) {
        setHasAccess(false);
        setLoading(false);
        return;
      }

      // Check cache first
      const cached = featureAccessCache.get(feature);
      if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
        setHasAccess(cached.hasAccess);
        setLoading(false);
        return;
      }

      // If there's already a pending request for this feature, wait for it
      if (pendingRequests.has(feature)) {
        try {
          const access = await pendingRequests.get(feature)!;
          setHasAccess(access);
          setLoading(false);
          return;
        } catch (err: any) {
          setError(err.message || 'Failed to check feature access');
          setHasAccess(false);
          setLoading(false);
          return;
        }
      }

      try {
        setLoading(true);
        setError(null);
        
        // Create a promise for this request and store it
        const requestPromise = apiService.checkFeatureAccess(feature);
        pendingRequests.set(feature, requestPromise);
        
        const access = await requestPromise;
        
        // Cache the result
        featureAccessCache.set(feature, { hasAccess: access, timestamp: Date.now() });
        
        setHasAccess(access);
      } catch (err: any) {
        setError(err.message || 'Failed to check feature access');
        setHasAccess(false);
      } finally {
        setLoading(false);
        // Remove from pending requests
        pendingRequests.delete(feature);
      }
    };

    checkFeatureAccess();
  }, [feature, isAuthenticated]);

  return { hasAccess, loading, error };
};

/**
 * Hook to get user's subscription information
 */
export const useSubscription = () => {
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!isAuthenticated) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const sub = await apiService.getMySubscription();
        setSubscription(sub);
      } catch (err: any) {
        // User might not have a subscription, which is fine
        setSubscription(null);
        setError(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [isAuthenticated]);

  const isPremium = subscription?.status === 'ACTIVE' && 
                    (subscription?.planName === 'PROFESSIONAL' || subscription?.planName === 'ENTERPRISE');
  
  const isEnterprise = subscription?.status === 'ACTIVE' && 
                        subscription?.planName === 'ENTERPRISE';
  
  const isFree = !subscription || subscription?.planName === 'STARTER' || subscription?.status !== 'ACTIVE';

  return { subscription, loading, error, isPremium, isEnterprise, isFree };
};

