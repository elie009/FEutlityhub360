import React, { useState } from 'react';
import { Box } from '@mui/material';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AnimatedParticlesBackground from './AnimatedParticlesBackground';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      {/* Animated Particles Background */}
      <AnimatedParticlesBackground />
      
      {/* Auth Content */}
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
        }}
      >
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </Box>
    </Box>
  );
};

export default AuthPage;