import { createTheme } from '@mui/material/styles';

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#b1e599', // Light mint green
      light: '#c7f0b3',
      dark: '#8bc47a',
      contrastText: '#1a1a1a',
    },
    secondary: {
      main: '#ffffff', // White for secondary elements
      light: '#f0f0f0',
      dark: '#cccccc',
      contrastText: '#1a1a1a',
    },
    background: {
      default: 'rgb(36, 43, 33)', // Very dark green/black
      paper: '#2a2a2a', // Slightly lighter dark green
    },
    text: {
      primary: '#b1e599', // Light mint green for primary text
      secondary: '#ffffff', // White for secondary text
    },
    divider: '#404040',
    action: {
      active: '#b1e599',
      hover: '#8bc47a',
      selected: '#8bc47a',
    },
  },
  typography: {
    fontFamily: '"Courier New", "Monaco", "Menlo", "Ubuntu Mono", monospace',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      color: '#b1e599',
      textShadow: '0 0 10px #b1e599',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: '#b1e599',
      textShadow: '0 0 8px #b1e599',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      color: '#b1e599',
      textShadow: '0 0 6px #b1e599',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      color: '#b1e599',
      textShadow: '0 0 4px #b1e599',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      color: '#b1e599',
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      color: '#b1e599',
    },
    body1: {
      color: '#ffffff',
    },
    body2: {
      color: '#cccccc',
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          boxShadow: '0 0 20px rgba(177, 229, 153, 0.3)',
          borderBottom: '1px solid #b1e599',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '4px',
          boxShadow: '0 0 15px rgba(177, 229, 153, 0.2)',
          '&:hover': {
            boxShadow: '0 0 25px rgba(177, 229, 153, 0.4)',
            border: '1px solid #b1e599',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          fontFamily: '"Courier New", "Monaco", "Menlo", "Ubuntu Mono", monospace',
          textTransform: 'none',
          borderRadius: '4px',
          border: '1px solid #b1e599',
          '&:hover': {
            boxShadow: '0 0 15px rgba(177, 229, 153, 0.5)',
          },
        },
        contained: {
          backgroundColor: '#b1e599',
          color: '#1a1a1a',
          '&:hover': {
            backgroundColor: '#8bc47a',
            boxShadow: '0 0 20px rgba(177, 229, 153, 0.6)',
          },
        },
        outlined: {
          color: '#b1e599',
          borderColor: '#b1e599',
          '&:hover': {
            backgroundColor: 'rgba(177, 229, 153, 0.1)',
            borderColor: '#b1e599',
            boxShadow: '0 0 15px rgba(177, 229, 153, 0.3)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            color: '#b1e599',
            fontFamily: '"Courier New", "Monaco", "Menlo", "Ubuntu Mono", monospace',
            '& fieldset': {
              borderColor: '#404040',
            },
            '&:hover fieldset': {
              borderColor: '#b1e599',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#b1e599',
              boxShadow: '0 0 10px rgba(177, 229, 153, 0.3)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#cccccc',
            '&.Mui-focused': {
              color: '#b1e599',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontFamily: '"Courier New", "Monaco", "Menlo", "Ubuntu Mono", monospace',
          backgroundColor: '#404040',
          color: '#b1e599',
          border: '1px solid #b1e599',
          '&:hover': {
            backgroundColor: '#8bc47a',
            color: '#1a1a1a',
            boxShadow: '0 0 10px rgba(177, 229, 153, 0.4)',
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backgroundColor: 'rgb(36, 43, 33)',
          border: '2px solid #b1e599',
          boxShadow: '0 0 30px rgba(177, 229, 153, 0.5)',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          color: '#b1e599',
          borderBottom: '1px solid #404040',
          textShadow: '0 0 8px #b1e599',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          color: '#ffffff',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: '#2a2a2a',
          color: '#b1e599',
          border: '1px solid #b1e599',
          fontFamily: '"Courier New", "Monaco", "Menlo", "Ubuntu Mono", monospace',
          boxShadow: '0 0 15px rgba(177, 229, 153, 0.3)',
        },
        arrow: {
          color: '#2a2a2a',
          '&::before': {
            border: '1px solid #b1e599',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          fontFamily: '"Courier New", "Monaco", "Menlo", "Ubuntu Mono", monospace',
          border: '1px solid #b1e599',
          backgroundColor: '#2a2a2a',
        },
        standardInfo: {
          backgroundColor: 'rgba(177, 229, 153, 0.1)',
          color: '#b1e599',
        },
        standardError: {
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
          color: '#ff6b6b',
          border: '1px solid #ff6b6b',
        },
        standardSuccess: {
          backgroundColor: 'rgba(177, 229, 153, 0.1)',
          color: '#b1e599',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: 'rgba(177, 229, 153, 0.1)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(177, 229, 153, 0.2)',
            '&:hover': {
              backgroundColor: 'rgba(177, 229, 153, 0.3)',
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: '#2a2a2a',
          borderRight: '2px solid #b1e599',
          boxShadow: '0 0 20px rgba(177, 229, 153, 0.3)',
        },
      },
    },
  },
});
