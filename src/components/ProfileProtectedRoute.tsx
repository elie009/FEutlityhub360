import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

interface ProfileProtectedRouteProps {
  children: React.ReactNode;
}

const ProfileProtectedRoute: React.FC<ProfileProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, hasProfile, profileLoading, userProfile } = useAuth();
  const location = useLocation();

  // Show loading while checking profile
  if (isAuthenticated && profileLoading) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        minHeight="100vh"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Checking your profile...
        </Typography>
      </Box>
    );
  }

  // Check if user has a profile (using both hasProfile and userProfile for reliability)
  const userHasProfile = hasProfile || (userProfile && userProfile.id);
  
  console.log('ProfileProtectedRoute: State check:', {
    isAuthenticated,
    hasProfile,
    userProfile: !!userProfile,
    userProfileId: userProfile?.id,
    userHasProfile,
    profileLoading,
    currentPath: location.pathname
  });
  

  // If user has profile or is on settings page, render children
  return <>{children}</>;
};

export default ProfileProtectedRoute;
