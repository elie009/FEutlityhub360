import { createTheme } from '@mui/material/styles';

// Lodgify-inspired Dashboard Theme
// Modern, clean design with light gray sidebar and light green/yellow accents
export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#90EE90', // Light green
      light: '#98FB98',
      dark: '#7CFC00',
      contrastText: '#1a1a1a',
    },
    secondary: {
      main: '#FFD700', // Yellow/Gold
      light: '#FFE44D',
      dark: '#FFC107',
      contrastText: '#1a1a1a',
    },
    background: {
      default: '#ffffff', // White background
      paper: '#ffffff',
    },
    text: {
      primary: '#1a1a1a', // Dark text
      secondary: '#666666', // Medium gray
    },
    divider: '#e5e5e5',
    success: {
      main: '#90EE90', // Light green
      light: '#98FB98',
      dark: '#7CFC00',
    },
    error: {
      main: '#ff4444',
      light: '#ff6666',
      dark: '#cc0000',
    },
    warning: {
      main: '#FFD700', // Yellow
      light: '#FFE44D',
      dark: '#FFC107',
    },
    info: {
      main: '#90EE90', // Light green
      light: '#98FB98',
      dark: '#7CFC00',
    },
  },
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Inter", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: '#1a1a1a',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      color: '#1a1a1a',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#1a1a1a',
    },
    body1: {
      fontSize: '1rem',
      color: '#333333',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      color: '#666666',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 8,
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
          backgroundColor: '#ffffff',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#f8f9fa',
          color: '#1a1a1a',
          boxShadow: 'none',
          borderBottom: 'none',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e5e5e5',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
          background: '#90EE90',
          color: '#1a1a1a',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          '&:hover': {
            background: '#98FB98',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderColor: '#90EE90',
          color: '#1a1a1a',
          '&:hover': {
            backgroundColor: 'rgba(144, 238, 144, 0.1)',
            borderColor: '#98FB98',
          },
        },
        text: {
          color: '#1a1a1a',
          '&:hover': {
            backgroundColor: 'rgba(144, 238, 144, 0.1)',
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
              borderColor: '#e5e5e5',
            },
            '&:hover fieldset': {
              borderColor: '#90EE90',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#90EE90',
              borderWidth: '2px',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#666666',
            '&.Mui-focused': {
              color: '#90EE90',
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
          backgroundColor: '#E6FFE6',
          color: '#1a1a1a',
          border: '1px solid #90EE90',
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
          borderBottom: '1px solid #e5e5e5',
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
          backgroundColor: '#E6FFE6',
          color: '#1a1a1a',
          border: '1px solid #90EE90',
        },
        standardError: {
          backgroundColor: '#ffe6e6',
          color: '#cc0000',
          border: '1px solid #ff4444',
        },
        standardWarning: {
          backgroundColor: '#fff9e6',
          color: '#cc9900',
          border: '1px solid #FFD700',
        },
        standardInfo: {
          backgroundColor: '#e6f7ff',
          color: '#0066cc',
          border: '1px solid #66b3ff',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          marginBottom: '4px',
          '&:hover': {
            backgroundColor: 'rgba(144, 238, 144, 0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: '#90EE90',
            color: '#1a1a1a',
            '&:hover': {
              backgroundColor: '#98FB98',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#ffffff', // White sidebar
          borderRight: '1px solid #e5e5e5',
          boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
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
          backgroundColor: '#f5f5f5',
          '& .MuiTableCell-head': {
            color: '#1a1a1a',
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
          borderColor: '#e5e5e5',
        },
      },
    },
  },
});
