import React, { useState } from 'react';
import { Box, Paper } from '@mui/material';
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
        p: 2,
      }}
    >
      {/* Animated Particles Background */}
      <AnimatedParticlesBackground />
      
      {/* Auth Content */}
      <Paper
        elevation={10}
        sx={{
          borderRadius: 2,
          overflow: 'hidden',
          maxWidth: 'none',
          
          position: 'relative',
          zIndex: 1,
        }}
      >
        {isLogin ? (
          <LoginForm onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setIsLogin(true)} />
        )}
      </Paper>
    </Box>
  );
};

export default AuthPage;