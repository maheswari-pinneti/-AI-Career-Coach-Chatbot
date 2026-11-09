import React, { useId } from 'react';
import {
  Box,
  Typography,
  OutlinedInput,
  OutlinedInputProps,
  FormHelperText,
} from '@mui/material';

export interface AppTextareaProps extends Omit<OutlinedInputProps, 'error'> {
  label?: string;
  helperText?: string;
  errorMessage?: string;
  isRequired?: boolean;
  minRows?: number;
  maxRows?: number;
  maxLength?: number;
  currentLength?: number;
}

export const AppTextarea: React.FC<AppTextareaProps> = ({
  id: customId,
  label,
  helperText,
  errorMessage,
  isRequired = false,
  minRows = 3,
  maxRows = 8,
  maxLength,
  currentLength,
  sx,
  ...props
}) => {
  const generatedId = useId();
  const textareaId = customId || generatedId;
  const isError = Boolean(errorMessage);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%', mb: 2 }}>
      {label && (
        <Box
          component="label"
          htmlFor={textareaId}
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
        id={textareaId}
        multiline
        minRows={minRows}
        maxRows={maxRows}
        error={isError}
        inputProps={{
          maxLength,
          'aria-invalid': isError,
          'aria-describedby': isError || helperText ? `${textareaId}-helper` : undefined,
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
          id={`${textareaId}-helper`}
          error={isError}
          sx={{ mx: 0.5, mt: 0.5, fontSize: '0.75rem' }}
        >
          {errorMessage || helperText}
        </FormHelperText>
      )}
    </Box>
  );
};
