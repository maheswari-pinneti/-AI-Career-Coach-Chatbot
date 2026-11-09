import React, { useId } from 'react';
import {
  Box,
  Typography,
  OutlinedInput,
  OutlinedInputProps,
  FormHelperText,
  InputAdornment,
} from '@mui/material';

export interface AppInputProps extends Omit<OutlinedInputProps, 'error'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  leftAdornment?: React.ReactNode;
  rightAdornment?: React.ReactNode;
  maxLength?: number;
  currentLength?: number;
}

export const AppInput: React.FC<AppInputProps> = ({
  id: customId,
  label,
  helperText,
  errorMessage,
  isRequired = false,
  leftAdornment,
  rightAdornment,
  maxLength,
  currentLength,
  disabled,
  sx,
  ...props
}) => {
  const generatedId = useId();
  const inputId = customId || generatedId;
  const isError = Boolean(errorMessage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 2 }}>
      {label && (
        <Box
          component="label"
          htmlFor={inputId}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 0.75,
            fontSize: '0.875rem',
            fontWeight: 500,
            color: isError ? 'error.main' : 'text.primary',
          }}
        >
          <span>
            {label}
            {isRequired && (
              <Typography component="span" color="error.main" sx={{ ml: 0.5 }}>
                *
              </Typography>
            )}
          </span>
          {maxLength !== undefined && currentLength !== undefined && (
            <Typography variant="caption" color="text.secondary">
              {currentLength}/{maxLength}
            </Typography>
          )}
        </Box>
      )}

      <OutlinedInput
        id={inputId}
        error={isError}
        disabled={disabled}
        size="small"
        startAdornment={leftAdornment ? <InputAdornment position="start">{leftAdornment}</InputAdornment> : undefined}
        endAdornment={rightAdornment ? <InputAdornment position="end">{rightAdornment}</InputAdornment> : undefined}
        inputProps={{
          maxLength,
          'aria-invalid': isError,
          'aria-describedby': isError || helperText ? `${inputId}-helper` : undefined,
        }}
        sx={{
          borderRadius: 1.5,
          fontSize: '0.875rem',
          ...sx,
        }}
        {...props}
      />

      {(errorMessage || helperText) && (
        <FormHelperText
          id={`${inputId}-helper`}
          error={isError}
          sx={{ mx: 0.5, mt: 0.5, fontSize: '0.75rem' }}
        >
          {errorMessage || helperText}
        </FormHelperText>
      )}
    </Box>
  );
};
