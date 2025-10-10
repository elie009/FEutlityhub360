import React from 'react';
import { Box, Typography, keyframes } from '@mui/material';

interface SimpleFinanceLoaderProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

// Keyframe animations
const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const dash = keyframes`
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124;
  }
`;

const SimpleFinanceLoader: React.FC<SimpleFinanceLoaderProps> = ({ 
  size = 'medium', 
  text 
}) => {
  const dimensions = {
    small: 40,
    medium: 60,
    large: 80,
  };

  const loaderSize = dimensions[size];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      {/* SVG Circle Loader with Dollar Sign */}
      <Box
        sx={{
          position: 'relative',
          width: loaderSize,
          height: loaderSize,
        }}
      >
        <svg
          style={{
            animation: `${spin} 2s linear infinite`,
            width: loaderSize,
            height: loaderSize,
          }}
          viewBox="0 0 50 50"
        >
          {/* Background circle */}
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="3"
          />
          {/* Animated gradient circle */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#059669" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>
          <circle
            cx="25"
            cy="25"
            r="20"
            fill="none"
            stroke="url(#gradient)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray="89, 200"
            style={{
              animation: `${dash} 1.5s ease-in-out infinite`,
            }}
          />
        </svg>
        
        {/* Dollar sign in center */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: loaderSize * 0.4,
            fontWeight: 700,
            color: '#10b981',
          }}
        >
          $
        </Box>
      </Box>

      {/* Optional loading text */}
      {text && (
        <Typography
          variant={size === 'small' ? 'caption' : 'body2'}
          sx={{
            color: '#64748b',
            fontWeight: 500,
          }}
        >
          {text}
        </Typography>
      )}
    </Box>
  );
};

export default SimpleFinanceLoader;

