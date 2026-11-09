import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Inbox } from 'lucide-react';
import { AppButton } from './AppButton';

export interface AppEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: React.ReactNode;
}

export const AppEmptyState: React.FC<AppEmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{
        py: 6,
        px: 3,
        textAlign: 'center',
        borderRadius: 3,
        border: '1px dashed',
        borderColor: 'divider',
        bgcolor: 'action.hover',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'background.paper',
          color: 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        {icon || <Inbox size={28} />}
      </Box>

      <Typography variant="h6" fontWeight={600} gutterBottom>
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 440, mb: actionLabel ? 3 : 0 }}
        >
          {description}
        </Typography>
      )}

      {actionLabel && onAction && (
        <AppButton variant="primary" leftIcon={actionIcon} onClick={onAction}>
          {actionLabel}
        </AppButton>
      )}
    </Paper>
  );
};
