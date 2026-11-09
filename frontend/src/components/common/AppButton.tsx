import React from 'react';
import { Button, ButtonProps, CircularProgress, Box } from '@mui/material';

export interface AppButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: 'primary' | 'secondary' | 'outlined' | 'ghost' | 'danger';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const AppButton: React.FC<AppButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  loadingText,
  disabled,
  leftIcon,
  rightIcon,
  startIcon,
  endIcon,
  sx,
  ...props
}) => {
  const getMuiVariant = (): ButtonProps['variant'] => {
    switch (variant) {
      case 'primary':
      case 'secondary':
      case 'danger':
        return 'contained';
      case 'outlined':
        return 'outlined';
      case 'ghost':
        return 'text';
      default:
        return 'contained';
    }
  };

  const getMuiColor = (): ButtonProps['color'] => {
    switch (variant) {
      case 'primary':
        return 'primary';
      case 'secondary':
        return 'secondary';
      case 'danger':
        return 'error';
      default:
        return 'inherit';
    }
  };

  return (
    <Button
      variant={getMuiVariant()}
      color={getMuiColor()}
      disabled={disabled || isLoading}
      startIcon={!isLoading ? (leftIcon || startIcon) : null}
      endIcon={!isLoading ? (rightIcon || endIcon) : null}
      sx={{
        position: 'relative',
        textTransform: 'none',
        fontWeight: 600,
        ...sx,
      }}
      {...props}
    >
      {isLoading ? (
        <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
          <CircularProgress size={16} color="inherit" />
          <span>{loadingText || children}</span>
        </Box>
      ) : (
        children
      )}
    </Button>
  );
};
