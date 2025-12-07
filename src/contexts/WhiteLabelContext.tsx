import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createTheme, Theme } from '@mui/material/styles';
import { WhiteLabelSettings } from '../types/whiteLabel';
import { apiService } from '../services/api';
import { baseTheme } from './baseTheme';

interface WhiteLabelContextType {
  settings: WhiteLabelSettings | null;
  theme: Theme;
  loading: boolean;
  refreshSettings: () => Promise<void>;
}

const WhiteLabelContext = createContext<WhiteLabelContextType | undefined>(undefined);

export const useWhiteLabel = () => {
  const context = useContext(WhiteLabelContext);
  if (!context) {
    throw new Error('useWhiteLabel must be used within a WhiteLabelProvider');
  }
  return context;
};

interface WhiteLabelProviderProps {
  children: ReactNode;
}

export const WhiteLabelProvider: React.FC<WhiteLabelProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<WhiteLabelSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>(baseTheme);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated before making the API call
      const authToken = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!authToken) {
        // No token, use default theme - user is not logged in yet
        setTheme(baseTheme);
        setLoading(false);
        return;
      }
      
      const data = await apiService.getWhiteLabelSettings();
      setSettings(data);
      
      // Apply theme if white-label is active
      if (data.isActive) {
        const customTheme = createTheme({
          ...baseTheme,
          palette: {
            ...baseTheme.palette,
            primary: {
              main: data.primaryColor,
              light: lightenColor(data.primaryColor, 0.2),
              dark: darkenColor(data.primaryColor, 0.2),
              contrastText: getContrastText(data.primaryColor),
            },
            secondary: {
              main: data.secondaryColor,
              light: lightenColor(data.secondaryColor, 0.2),
              dark: darkenColor(data.secondaryColor, 0.2),
              contrastText: getContrastText(data.secondaryColor),
            },
          },
          components: {
            ...baseTheme.components,
            MuiButton: {
              styleOverrides: {
                ...baseTheme.components?.MuiButton?.styleOverrides,
                contained: {
                  background: data.primaryColor,
                  color: getContrastText(data.primaryColor),
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: lightenColor(data.primaryColor, 0.1),
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
                  },
                },
                outlined: {
                  borderColor: data.primaryColor,
                  color: data.primaryColor,
                  '&:hover': {
                    backgroundColor: `${data.primaryColor}15`,
                    borderColor: lightenColor(data.primaryColor, 0.1),
                  },
                },
              },
            },
            MuiTextField: {
              styleOverrides: {
                ...baseTheme.components?.MuiTextField?.styleOverrides,
                root: {
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: data.primaryColor,
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: data.primaryColor,
                    },
                  },
                  '& .MuiInputLabel-root': {
                    '&.Mui-focused': {
                      color: data.primaryColor,
                    },
                  },
                },
              },
            },
          },
        });
        setTheme(customTheme);
      } else {
        setTheme(baseTheme);
      }
    } catch (error: any) {
      // Handle 401 errors gracefully - user is not authenticated yet
      if (error?.status === 401) {
        // Silently use default theme - this is expected when user is not logged in
        setTheme(baseTheme);
      } else {
        console.error('Failed to load white-label settings:', error);
        setTheme(baseTheme);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  return (
    <WhiteLabelContext.Provider value={{ settings, theme, loading, refreshSettings: loadSettings }}>
      {children}
    </WhiteLabelContext.Provider>
  );
};

// Helper functions for color manipulation
function lightenColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.min(255, (num >> 16) + Math.round(255 * amount));
  const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * amount));
  const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * amount));
  const newHex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  return `#${newHex}`;
}

function darkenColor(color: string, amount: number): string {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const r = Math.max(0, (num >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * amount));
  const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * amount));
  const newHex = ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
  return `#${newHex}`;
}

function getContrastText(color: string): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 128 ? '#1a1a1a' : '#ffffff';
}

