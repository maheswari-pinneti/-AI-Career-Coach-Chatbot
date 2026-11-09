import React, { useId } from 'react';
import {
  Drawer,
  DrawerProps,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import { X } from 'lucide-react';

export interface AppDrawerProps extends Omit<DrawerProps, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  onClose?: () => void;
  width?: number | string;
  footer?: React.ReactNode;
}

export const AppDrawer: React.FC<AppDrawerProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  width = 380,
  footer,
  anchor = 'right',
  sx,
  ...props
}) => {
  const titleId = useId();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      anchor={anchor}
      aria-labelledby={title ? titleId : undefined}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: width },
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: 'background.paper',
        },
        ...sx,
      }}
      {...props}
    >
      {title && (
        <>
          <Box
            sx={{
              p: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography id={titleId} variant="h6" fontWeight={700}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              )}
            </Box>
            {onClose && (
              <IconButton aria-label="close drawer" onClick={onClose} size="small">
                <X size={20} />
              </IconButton>
            )}
          </Box>
          <Divider />
        </>
      )}

      <Box sx={{ p: 2.5, flex: 1, overflowY: 'auto' }}>
        {children}
      </Box>

      {footer && (
        <>
          <Divider />
          <Box sx={{ p: 2, bgcolor: 'action.hover' }}>
            {footer}
          </Box>
        </>
      )}
    </Drawer>
  );
};
