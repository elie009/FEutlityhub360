import React, { useState } from 'react';
import {
  TextField,
  Popover,
  Box,
  Grid,
  IconButton,
  Typography,
  Button,
  Paper,
} from '@mui/material';
import {
  CalendarToday,
  ArrowBackIos,
  ArrowForwardIos,
} from '@mui/icons-material';

interface MonthYearPickerProps {
  value: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  size?: 'small' | 'medium';
  sx?: any;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
  value,
  onChange,
  label = 'Select Month',
  size = 'small',
  sx,
}) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [displayYear, setDisplayYear] = useState(value ? value.getFullYear() : new Date().getFullYear());
  const [displayMonth, setDisplayMonth] = useState(value ? value.getMonth() : new Date().getMonth());

  const handleTextFieldClick = (event: React.MouseEvent<HTMLDivElement>) => {
    setAnchorEl(event.currentTarget);
    if (value) {
      setDisplayYear(value.getFullYear());
      setDisplayMonth(value.getMonth());
    }
  };

  const handleIconClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    if (value) {
      setDisplayYear(value.getFullYear());
      setDisplayMonth(value.getMonth());
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMonthSelect = (month: number) => {
    const newDate = new Date(displayYear, month, 1);
    onChange(newDate);
    handleClose();
  };

  const handleYearChange = (delta: number) => {
    setDisplayYear(prev => prev + delta);
  };

  const formatDisplayValue = (): string => {
    if (!value) return '';
    return `${MONTHS[value.getMonth()]} ${value.getFullYear()}`;
  };

  const open = Boolean(anchorEl);
  const id = open ? 'month-year-picker-popover' : undefined;

  // Generate years (current year ± 10 years)
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 10; i <= currentYear + 1; i++) {
    years.push(i);
  }

  return (
    <>
      <TextField
        label={label}
        value={formatDisplayValue()}
        onClick={handleTextFieldClick}
        size={size}
        InputProps={{
          readOnly: true,
          endAdornment: (
            <IconButton
              size="small"
              onClick={handleIconClick}
              sx={{ mr: -1 }}
            >
              <CalendarToday fontSize="small" />
            </IconButton>
          ),
        }}
        sx={{
          minWidth: { xs: 150, sm: 180 },
          '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
          '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } },
          cursor: 'pointer',
          ...sx,
        }}
      />
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Paper sx={{ p: 2, minWidth: 280 }}>
          {/* Year Selector */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <IconButton
              size="small"
              onClick={() => handleYearChange(-1)}
              disabled={displayYear <= currentYear - 10}
            >
              <ArrowBackIos fontSize="small" />
            </IconButton>
            <Typography variant="h6" sx={{ minWidth: 100, textAlign: 'center' }}>
              {displayYear}
            </Typography>
            <IconButton
              size="small"
              onClick={() => handleYearChange(1)}
              disabled={displayYear >= currentYear + 1}
            >
              <ArrowForwardIos fontSize="small" />
            </IconButton>
          </Box>

          {/* Month Grid */}
          <Grid container spacing={1}>
            {MONTHS.map((month, index) => (
              <Grid item xs={4} key={month}>
                <Button
                  fullWidth
                  variant={displayMonth === index ? 'contained' : 'outlined'}
                  onClick={() => handleMonthSelect(index)}
                  sx={{
                    minHeight: 40,
                    fontSize: '0.875rem',
                    textTransform: 'none',
                  }}
                >
                  {month.substring(0, 3)}
                </Button>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Popover>
    </>
  );
};

export default MonthYearPicker;

