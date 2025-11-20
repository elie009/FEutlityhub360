import { createTheme } from '@mui/material/styles';

// Finance Management System Theme
// Modern, clean, minimalist design with emerald/blue gradient accents
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#10b981', // Emerald green
      light: '#34d399',
      dark: '#059669',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#3b82f6', // Blue
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f8fafc', // Very light gray
      paper: '#ffffff',
    },
    text: {
      primary: '#1e293b', // Slate dark
      secondary: '#64748b', // Slate medium
    },
    divider: '#e2e8f0',
    success: {
      main: '#22c55e',
      light: '#4ade80',
      dark: '#16a34a',
    },
    error: {
      main: '#ef4444',
      light: '#f87171',
      dark: '#dc2626',
    },
    warning: {
      main: '#f59e0b',
      light: '#fbbf24',
      dark: '#d97706',
    },
    info: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Segoe UI Emoji", "Segoe UI Symbol", -apple-system, BlinkMacSystemFont, "Roboto", "Inter", "Poppins", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#0f172a',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#0f172a',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#1e293b',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1e293b',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1e293b',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1e293b',
    },
    body1: {
      fontSize: '1rem',
      color: '#475569',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#64748b',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#f8fafc',
          backgroundImage: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1e293b',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          borderBottom: '1px solid #e2e8f0',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 500,
          padding: '10px 20px',
          fontSize: '0.875rem',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff',
          boxShadow: '0 4px 6px -1px rgb(16 185 129 / 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
            boxShadow: '0 10px 15px -3px rgb(16 185 129 / 0.4)',
            transform: 'translateY(-1px)',
          },
        },
        outlined: {
          borderColor: '#10b981',
          color: '#10b981',
          '&:hover': {
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            borderColor: '#059669',
          },
        },
        text: {
          color: '#10b981',
          '&:hover': {
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            '& fieldset': {
              borderColor: '#e2e8f0',
            },
            '&:hover fieldset': {
              borderColor: '#10b981',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#10b981',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#64748b',
            '&.Mui-focused': {
              color: '#10b981',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '0.75rem',
        },
        filled: {
          backgroundColor: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontSize: '1.25rem',
          fontWeight: 600,
          color: '#0f172a',
          borderBottom: '1px solid #e2e8f0',
          padding: '20px 24px',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#1e293b',
          color: '#ffffff',
          fontSize: '0.75rem',
          borderRadius: '6px',
          padding: '8px 12px',
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontSize: '0.875rem',
        },
        standardSuccess: {
          backgroundColor: '#f0fdf4',
          color: '#166534',
          border: '1px solid #bbf7d0',
        },
        standardError: {
          backgroundColor: '#fef2f2',
          color: '#991b1b',
          border: '1px solid #fecaca',
        },
        standardWarning: {
          backgroundColor: '#fffbeb',
          color: '#92400e',
          border: '1px solid #fde68a',
        },
        standardInfo: {
          backgroundColor: '#eff6ff',
          color: '#1e40af',
          border: '1px solid #bfdbfe',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          marginBottom: '4px',
          '&:hover': {
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(16, 185, 129, 0.12)',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff',
          borderRight: '1px solid #e2e8f0',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)',
        },
        elevation2: {
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8fafc',
          '& .MuiTableCell-head': {
            color: '#475569',
            fontWeight: 600,
            fontSize: '0.75rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: '#e2e8f0',
        },
      },
    },
  },
});
