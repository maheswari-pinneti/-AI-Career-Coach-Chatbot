import React, { useId } from 'react';
import {
  Dialog,
  DialogProps,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  IconButton,
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { X } from 'lucide-react';

export interface AppDialogProps extends Omit<DialogProps, 'title'> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const AppDialog: React.FC<AppDialogProps> = ({
  open,
  onClose,
  title,
  description,
  actions,
  children,
  showCloseButton = true,
  maxWidth = 'sm',
  fullWidth = true,
  ...props
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const titleId = useId();
  const descId = useId();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isMobile}
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descId : undefined}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: isMobile ? 0 : 3,
          p: { xs: 1, sm: 2 },
        },
      }}
      {...props}
    >
      {title && (
        <DialogTitle
          id={titleId}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pb: description ? 0.5 : 1.5,
            pt: 1.5,
            px: 2,
          }}
        >
          {typeof title === 'string' ? (
            <Typography component="div" variant="h6" fontWeight={700}>
              {title}
            </Typography>
          ) : (
            title
          )}

          {showCloseButton && onClose && (
            <IconButton
              aria-label="close dialog"
              onClick={onClose}
              size="small"
              sx={{ color: 'text.secondary' }}
            >
              <X size={20} />
            </IconButton>
          )}
        </DialogTitle>
      )}

      <DialogContent sx={{ px: 2, py: 1.5 }}>
        {description && (
          <DialogContentText id={descId} sx={{ mb: 2, fontSize: '0.875rem' }}>
            {description}
          </DialogContentText>
        )}
        {children}
      </DialogContent>

      {actions && (
        <DialogActions sx={{ px: 2, pb: 1.5, pt: 1, gap: 1 }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            {actions}
          </Box>
        </DialogActions>
      )}
    </Dialog>
  );
};
