import React from 'react';
import { Snackbar, Alert, AlertColor, Slide, SlideProps } from '@mui/material';

export interface AppToastProps {
  open: boolean;
  message: string;
  severity?: AlertColor;
  onClose: () => void;
  autoHideDuration?: number;
}

function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

export const AppToast: React.FC<AppToastProps> = ({
  open,
  message,
  severity = 'success',
  onClose,
  autoHideDuration = 4000,
}) => {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      TransitionComponent={SlideTransition}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={onClose}
        severity={severity}
        variant="filled"
        sx={{
          width: '100%',
          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
          borderRadius: 2,
          fontWeight: 500,
          fontSize: '0.875rem',
        }}
      >
        {message}
      </Alert>
    </Snackbar>
  );
};
