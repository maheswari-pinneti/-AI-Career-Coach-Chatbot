import React, { useState } from 'react';
import { Box, Typography, Paper, Collapse, Button } from '@mui/material';
import { AlertCircle, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { AppButton } from './AppButton';

export interface AppErrorStateProps {
  title?: string;
  message?: string;
  errorDetails?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
}

export const AppErrorState: React.FC<AppErrorStateProps> = ({
  title = 'Something went wrong',
  message = 'We encountered an error loading this section. Please try again or refresh the page.',
  errorDetails,
  onRetry,
  isRetrying = false,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        textAlign: 'center',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'error.light',
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Box
        sx={{
          width: 52,
          height: 52,
          borderRadius: '50%',
          bgcolor: 'error.main',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
        }}
      >
        <AlertCircle size={28} />
      </Box>

      <Typography variant="h6" fontWeight={700} color="error.main" gutterBottom>
        {title}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mb: 2.5 }}>
        {message}
      </Typography>

      {onRetry && (
        <AppButton
          variant="primary"
          leftIcon={<RefreshCw size={16} />}
          onClick={onRetry}
          isLoading={isRetrying}
          loadingText="Retrying..."
        >
          Try Again
        </AppButton>
      )}

      {errorDetails && (
        <Box sx={{ mt: 2.5, width: '100%', maxWidth: 540 }}>
          <Button
            size="small"
            color="inherit"
            endIcon={showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            onClick={() => setShowDetails(!showDetails)}
            sx={{ fontSize: '0.75rem', color: 'text.secondary' }}
          >
            {showDetails ? 'Hide technical details' : 'Show technical details'}
          </Button>

          <Collapse in={showDetails}>
            <Box
              component="pre"
              sx={{
                mt: 1,
                p: 2,
                borderRadius: 1.5,
                bgcolor: 'action.hover',
                textAlign: 'left',
                fontSize: '0.75rem',
                fontFamily: 'monospace',
                overflowX: 'auto',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              {errorDetails}
            </Box>
          </Collapse>
        </Box>
      )}
    </Paper>
  );
};
