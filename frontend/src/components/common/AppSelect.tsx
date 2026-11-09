import React, { useId } from 'react';
import {
  Box,
  Typography,
  Select,
  SelectProps,
  MenuItem,
  FormHelperText,
  FormControl,
} from '@mui/material';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface AppSelectProps extends Omit<SelectProps, 'error'> {
  label?: string;
  options: SelectOption[];
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  placeholder?: string;
}

export const AppSelect: React.FC<AppSelectProps> = ({
  id: customId,
  label,
  options,
  helperText,
  errorMessage,
  isRequired = false,
  placeholder,
  value,
  sx,
  ...props
}) => {
  const generatedId = useId();
  const selectId = customId || generatedId;
  const isError = Boolean(errorMessage);

  return (
    <FormControl fullWidth size="small" error={isError} sx={{ mb: 2 }}>
      {label && (
        <Box
          component="label"
          htmlFor={selectId}
          sx={{
            mb: 0.75,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: isError ? 'error.main' : 'text.primary',
          }}
        >
          {label}
          {isRequired && (
            <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
              *
            </Typography>
          )}
        </Box>
      )}

      <Select
        id={selectId}
        value={value}
        displayEmpty={Boolean(placeholder)}
        sx={{
          borderRadius: 1.5,
          fontSize: '0.875rem',
          ...sx,
        }}
        renderValue={(selected) => {
          if (!selected && placeholder) {
            return <Typography color="text.secondary" variant="body2">{placeholder}</Typography>;
          }
          const match = options.find((opt) => opt.value === selected);
          return match ? match.label : String(selected);
        }}
        {...props}
      >
        {options.map((option) => (
          <MenuItem
            key={String(option.value)}
            value={option.value}
            disabled={option.disabled}
            sx={{ fontSize: '0.875rem' }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>

      {(errorMessage || helperText) && (
        <FormHelperText sx={{ mx: 0.5, mt: 0.5, fontSize: '0.75rem' }}>
          {errorMessage || helperText}
        </FormHelperText>
      )}
    </FormControl>
  );
};
