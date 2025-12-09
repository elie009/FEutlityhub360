import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  AccountBalance,
  CreditCard,
} from '@mui/icons-material';
import { BankAccount } from '../../types/bankAccount';
import { useCurrency } from '../../contexts/CurrencyContext';

interface BankAccountCardSliderProps {
  accounts: BankAccount[];
  selectedAccountId: string | null;
  onSelectAccount: (accountId: string) => void;
}

// Mask account number for display (show last 4 digits)
const maskAccountNumber = (accountNumber?: string): string => {
  if (!accountNumber) return '•••• •••• •••• ••••';
  const cleaned = accountNumber.replace(/\s/g, '');
  if (cleaned.length <= 4) return '•••• •••• •••• ' + cleaned;
  return '•••• •••• •••• ' + cleaned.slice(-4);
};

// Get card gradient based on account type
const getCardGradient = (accountType: string): string => {
  switch (accountType.toLowerCase()) {
    case 'checking':
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    case 'savings':
      return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
    case 'credit_card':
      return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
    case 'investment':
      return 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)';
    default:
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
  }
};

// Get card icon
const getCardIcon = (accountType: string) => {
  switch (accountType.toLowerCase()) {
    case 'credit_card':
      return <CreditCard sx={{ fontSize: 32, opacity: 0.3 }} />;
    default:
      return <AccountBalance sx={{ fontSize: 32, opacity: 0.3 }} />;
  }
};

const BankAccountCardSlider: React.FC<BankAccountCardSliderProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
}) => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const carouselRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Update current index when selected account changes
  useEffect(() => {
    if (selectedAccountId) {
      const index = accounts.findIndex((acc) => acc.id === selectedAccountId);
      if (index !== -1 && index !== currentIndex) {
        setCurrentIndex(index);
      }
    }
  }, [selectedAccountId, accounts, currentIndex]);

  // Auto-select first account on mount
  useEffect(() => {
    if (accounts.length > 0 && !selectedAccountId) {
      onSelectAccount(accounts[0].id);
    }
  }, [accounts, selectedAccountId, onSelectAccount]);

  const handlePrev = () => {
    if (currentIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      const newIndex = currentIndex - 1;
      setCurrentIndex(newIndex);
      onSelectAccount(accounts[newIndex].id);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleNext = () => {
    if (currentIndex < accounts.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      const newIndex = currentIndex + 1;
      setCurrentIndex(newIndex);
      onSelectAccount(accounts[newIndex].id);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  const handleDotClick = (index: number) => {
    if (index !== currentIndex && !isTransitioning) {
      setIsTransitioning(true);
      setCurrentIndex(index);
      onSelectAccount(accounts[index].id);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Calculate card positioning for carousel effect
  const getCardStyle = (index: number) => {
    const offset = index - currentIndex;
    const cardWidth = isMobile ? 240 : 260;
    const gap = 16;
    const totalWidth = cardWidth + gap;
    const translateX = offset * totalWidth;

    // Calculate scale and opacity based on distance from center
    let scale = 1;
    let opacity = 1;
    let zIndex = 1;

    if (Math.abs(offset) === 0) {
      // Center card
      scale = 1;
      opacity = 1;
      zIndex = 10;
    } else if (Math.abs(offset) === 1) {
      // Adjacent cards (immediately next to center)
      scale = 0.9;
      opacity = 0.75;
      zIndex = 5;
    } else if (Math.abs(offset) === 2) {
      // Second level cards
      scale = 0.8;
      opacity = 0.5;
      zIndex = 3;
    } else {
      // Far cards (beyond second level)
      scale = 0.7;
      opacity = 0.3;
      zIndex = 1;
    }

    return {
      transform: `translateX(${translateX}px) scale(${scale})`,
      opacity,
      zIndex,
      transition: isTransitioning ? 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    };
  };

  if (accounts.length === 0) {
    return null;
  }

  const cardWidth = isMobile ? 240 : 260;
  const gap = 16;

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        overflow: 'hidden',
        py: 2,
      }}
    >
      {/* Navigation Arrows */}
      {accounts.length > 1 && (
        <>
          <IconButton
            onClick={handlePrev}
            disabled={currentIndex === 0 || isTransitioning}
            sx={{
              position: 'absolute',
              left: { xs: -8, sm: -8 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              bgcolor: 'background.paper',
              boxShadow: 4,
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) scale(1.1)',
              },
              '&.Mui-disabled': {
                opacity: 0.3,
              },
            }}
            size="small"
          >
            <ChevronLeft fontSize="small" />
          </IconButton>
          <IconButton
            onClick={handleNext}
            disabled={currentIndex === accounts.length - 1 || isTransitioning}
            sx={{
              position: 'absolute',
              right: { xs: -8, sm: -8 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 20,
              bgcolor: 'background.paper',
              boxShadow: 4,
              width: 32,
              height: 32,
              '&:hover': {
                bgcolor: 'background.paper',
                transform: 'translateY(-50%) scale(1.1)',
              },
              '&.Mui-disabled': {
                opacity: 0.3,
              },
            }}
            size="small"
          >
            <ChevronRight fontSize="small" />
          </IconButton>
        </>
      )}

      {/* Carousel Container */}
      <Box
        ref={carouselRef}
        sx={{
          position: 'relative',
          width: '100%',
          height: 200,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          perspective: '1000px',
          overflow: 'hidden',
          px: { xs: 2, sm: 4 },
        }}
      >
        {/* Cards Container */}
        <Box
          sx={{
            position: 'relative',
            width: cardWidth,
            height: 180,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
          }}
        >
          {accounts.map((account, index) => {
            const isSelected = index === currentIndex;
            const gradient = getCardGradient(account.accountType);
            const cardStyle = getCardStyle(index);

            return (
              <Card
                key={account.id}
                onClick={() => handleDotClick(index)}
                sx={{
                  position: 'absolute',
                  width: cardWidth,
                  height: 180,
                  background: gradient,
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: isSelected
                    ? '0 12px 32px rgba(0, 0, 0, 0.4)'
                    : '0 4px 16px rgba(0, 0, 0, 0.2)',
                  ...cardStyle,
                  '&:hover': {
                    boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                  },
                }}
              >
                {/* Card Content */}
                <Box
                  sx={{
                    p: 2.5,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    color: 'white',
                    position: 'relative',
                    zIndex: 1,
                    pointerEvents: 'none',
                  }}
                >
                  {/* Top Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.9,
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: 1,
                        }}
                      >
                        {account.accountType === 'credit_card' ? 'Credit Card' : account.accountType}
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 600,
                          mt: 0.5,
                          fontSize: { xs: '0.95rem', sm: '1rem' },
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          lineHeight: 1.2,
                        }}
                      >
                        {account.accountName}
                      </Typography>
                    </Box>
                    <Box sx={{ opacity: 0.3 }}>
                      {getCardIcon(account.accountType)}
                    </Box>
                  </Box>

                  {/* Middle Section - Card Number */}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        color: 'white',
                        opacity: 0.8,
                        fontSize: '0.7rem',
                        mb: 1,
                        letterSpacing: 1,
                      }}
                    >
                      Card Number
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{
                        fontFamily: 'monospace',
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        letterSpacing: { xs: 1, sm: 1.5 },
                        fontWeight: 500,
                        color: 'white',
                        textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      {maskAccountNumber(account.accountNumber)}
                    </Typography>
                  </Box>

                  {/* Bottom Section */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.8,
                          fontSize: '0.7rem',
                          mb: 0.5,
                        }}
                      >
                        Balance
                      </Typography>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          textShadow: '0 2px 4px rgba(0,0,0,0.2)',
                          fontSize: { xs: '1.25rem', sm: '1.35rem' },
                        }}
                      >
                        {formatCurrency(account.currentBalance)}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          opacity: 0.8,
                          fontSize: '0.7rem',
                          mt: 0.5,
                        }}
                      >
                        {account.financialInstitution || 'Bank'}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: { xs: 40, sm: 44 },
                        height: { xs: 28, sm: 30 },
                        bgcolor: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: { xs: '0.55rem', sm: '0.6rem' },
                          fontWeight: 600,
                          letterSpacing: 1,
                        }}
                      >
                        CHIP
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Decorative Pattern */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none',
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -30,
                    left: -30,
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255, 255, 255, 0.1)',
                    pointerEvents: 'none',
                  }}
                />
              </Card>
            );
          })}
        </Box>
      </Box>

      {/* Pagination Dots */}
      {accounts.length > 1 && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 1,
            mt: 2,
          }}
        >
          {accounts.map((_, index) => (
            <Box
              key={index}
              onClick={() => handleDotClick(index)}
              sx={{
                width: index === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: index === currentIndex ? 4 : '50%',
                bgcolor: index === currentIndex ? 'primary.main' : 'action.disabled',
                cursor: isTransitioning ? 'default' : 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  bgcolor: index === currentIndex ? 'primary.dark' : 'action.active',
                  transform: 'scale(1.2)',
                },
              }}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default BankAccountCardSlider;
