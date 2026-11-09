import React from 'react';
import { Avatar, AvatarProps, Badge } from '@mui/material';

export interface AppAvatarProps extends AvatarProps {
  name?: string;
  status?: 'online' | 'offline' | 'busy' | 'away';
  size?: number;
}

export const AppAvatar: React.FC<AppAvatarProps> = ({
  name,
  src,
  status,
  size = 40,
  sx,
  ...props
}) => {
  const getInitials = (fullName?: string): string => {
    if (!fullName) return 'U';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'busy':
        return '#ef4444';
      case 'away':
        return '#f59e0b';
      case 'offline':
      default:
        return '#94a3b8';
    }
  };

  const avatar = (
    <Avatar
      src={src}
      alt={name || 'User Avatar'}
      sx={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        fontWeight: 600,
        bgcolor: 'primary.main',
        color: '#ffffff',
        ...sx,
      }}
      {...props}
    >
      {!src && getInitials(name)}
    </Avatar>
  );

  if (!status) {
    return avatar;
  }

  return (
    <Badge
      overlap="circular"
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      variant="dot"
      sx={{
        '& .MuiBadge-badge': {
          bgcolor: getStatusColor(),
          color: getStatusColor(),
          boxShadow: (theme) => `0 0 0 2px ${theme.palette.background.paper}`,
          width: Math.max(8, Math.round(size * 0.25)),
          height: Math.max(8, Math.round(size * 0.25)),
          borderRadius: '50%',
        },
      }}
    >
      {avatar}
    </Badge>
  );
};
