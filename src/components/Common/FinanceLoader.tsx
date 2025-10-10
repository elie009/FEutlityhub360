import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';
import { AttachMoney, TrendingUp, AccountBalance } from '@mui/icons-material';

interface FinanceLoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

// Keyframe animations
const float = keyframes`
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-15px);
  }
`;

const rotate = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.6;
    transform: scale(0.95);
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`;

const coinFlip = keyframes`
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(180deg);
  }
  100% {
    transform: rotateY(360deg);
  }
`;

const FinanceLoader: React.FC<FinanceLoaderProps> = ({ 
  size = 'medium', 
  text = 'Loading...', 
  fullScreen = false 
}) => {
  const dimensions = {
    small: { container: 80, icon: 24, ring: 60 },
    medium: { container: 120, icon: 36, ring: 90 },
    large: { container: 160, icon: 48, ring: 120 },
  };

  const { container, icon, ring } = dimensions[size];

  const containerStyles = fullScreen
    ? {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        width: '100%',
        backgroundColor: 'rgba(248, 250, 252, 0.95)',
      }
    : {
        display: 'flex',
        flexDirection: 'column' as const,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 4,
      };

  return (
    <Box sx={containerStyles}>
      {/* Main Loader Container */}
      <Box
        sx={{
          position: 'relative',
          width: container,
          height: container,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Outer rotating ring with gradient */}
        <Box
          sx={{
            position: 'absolute',
            width: ring,
            height: ring,
            borderRadius: '50%',
            border: '3px solid transparent',
            borderTopColor: '#10b981',
            borderRightColor: '#059669',
            borderBottomColor: '#3b82f6',
            animation: `${rotate} 1.5s linear infinite`,
            opacity: 0.8,
          }}
        />

        {/* Inner rotating ring */}
        <Box
          sx={{
            position: 'absolute',
            width: ring * 0.75,
            height: ring * 0.75,
            borderRadius: '50%',
            border: '2px solid transparent',
            borderTopColor: '#3b82f6',
            borderBottomColor: '#10b981',
            animation: `${rotate} 1s linear infinite reverse`,
            opacity: 0.6,
          }}
        />

        {/* Center icon container with gradient background */}
        <Box
          sx={{
            width: container * 0.5,
            height: container * 0.5,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #3b82f6 100%)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
            animation: `${pulse} 2s ease-in-out infinite`,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
              animation: `${shimmer} 2s infinite`,
            },
          }}
        >
          {/* Dollar sign icon */}
          <AttachMoney
            sx={{
              fontSize: icon,
              color: 'white',
              animation: `${coinFlip} 3s ease-in-out infinite`,
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
            }}
          />
        </Box>

        {/* Floating accent icons */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            right: '10%',
            animation: `${float} 3s ease-in-out infinite`,
            animationDelay: '0s',
          }}
        >
          <TrendingUp
            sx={{
              fontSize: icon * 0.6,
              color: '#10b981',
              opacity: 0.5,
            }}
          />
        </Box>

        <Box
          sx={{
            position: 'absolute',
            bottom: '10%',
            left: '10%',
            animation: `${float} 3s ease-in-out infinite`,
            animationDelay: '1s',
          }}
        >
          <AccountBalance
            sx={{
              fontSize: icon * 0.6,
              color: '#3b82f6',
              opacity: 0.5,
            }}
          />
        </Box>
      </Box>

      {/* Loading text */}
      <Typography
        variant={size === 'small' ? 'body2' : 'h6'}
        sx={{
          mt: 3,
          color: '#1e293b',
          fontWeight: 600,
          textAlign: 'center',
          letterSpacing: '0.05em',
        }}
      >
        {text}
      </Typography>

      {/* Animated dots */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          mt: 1,
        }}
      >
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: '#10b981',
              animation: `${pulse} 1.5s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </Box>

      {/* Subtitle for full screen loader */}
      {fullScreen && (
        <Typography
          variant="body2"
          sx={{
            mt: 2,
            color: '#64748b',
            fontSize: '0.875rem',
          }}
        >
          Please wait while we prepare your financial data
        </Typography>
      )}
    </Box>
  );
};

export default FinanceLoader;

