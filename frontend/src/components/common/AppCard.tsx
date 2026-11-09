import React from 'react';
import {
  Card,
  CardProps,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Divider,
  Box,
} from '@mui/material';

export interface AppCardProps extends Omit<CardProps, 'title'> {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  avatar?: React.ReactNode;
  footer?: React.ReactNode;
  divided?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({
  title,
  subtitle,
  action,
  avatar,
  footer,
  divided = false,
  children,
  sx,
  ...props
}) => {
  const hasHeader = Boolean(title || subtitle || action || avatar);

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        ...sx,
      }}
      {...props}
    >
      {hasHeader && (
        <>
          <CardHeader
            avatar={avatar}
            action={action}
            title={
              typeof title === 'string' ? (
                <Typography variant="h6" fontWeight={600} fontSize="1.05rem">
                  {title}
                </Typography>
              ) : (
                title
              )
            }
            subheader={
              typeof subtitle === 'string' ? (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              ) : (
                subtitle
              )
            }
            sx={{ px: 3, pt: 2.5, pb: divided ? 2 : 1 }}
          />
          {divided && <Divider />}
        </>
      )}

      <CardContent sx={{ px: 3, py: 2, flex: 1, '&:last-child': { pb: 3 } }}>
        {children}
      </CardContent>

      {footer && (
        <>
          <Divider />
          <CardActions sx={{ px: 3, py: 1.5, bgcolor: 'action.hover' }}>
            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              {footer}
            </Box>
          </CardActions>
        </>
      )}
    </Card>
  );
};
