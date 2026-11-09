import React from 'react';
import { Chip, ChipProps, useTheme } from '@mui/material';

export type AppBadgeVariant = 'subtle' | 'solid' | 'outlined';
export type AppBadgeColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

export interface AppBadgeProps extends Omit<ChipProps, 'color' | 'variant'> {
  color?: AppBadgeColor;
  variant?: AppBadgeVariant;
  dot?: boolean;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  color = 'primary',
  variant = 'subtle',
  dot = false,
  size = 'small',
  sx,
  icon,
  ...props
}) => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const getColors = () => {
    switch (color) {
      case 'primary':
        return {
          main: '#6366f1',
          bgSubtle: '#eef2ff',
          bgDarkSubtle: 'rgba(99, 102, 241, 0.16)',
          text: '#4338ca',
          darkText: '#a5b4fc',
        };
      case 'secondary':
        return {
          main: '#0284c7',
          bgSubtle: '#f0f9ff',
          bgDarkSubtle: 'rgba(2, 132, 199, 0.16)',
          text: '#0369a1',
          darkText: '#7dd3fc',
        };
      case 'success':
        return {
          main: '#10b981',
          bgSubtle: '#ecfdf5',
          bgDarkSubtle: 'rgba(16, 185, 129, 0.16)',
          text: '#047857',
          darkText: '#6ee7b7',
        };
      case 'warning':
        return {
          main: '#f59e0b',
          bgSubtle: '#fffbeb',
          bgDarkSubtle: 'rgba(245, 158, 11, 0.16)',
          text: '#b45309',
          darkText: '#fcd34d',
        };
      case 'error':
        return {
          main: '#ef4444',
          bgSubtle: '#fef2f2',
          bgDarkSubtle: 'rgba(239, 68, 68, 0.16)',
          text: '#b91c1c',
          darkText: '#fca5a5',
        };
      case 'info':
        return {
          main: '#0ea5e9',
          bgSubtle: '#f0f9ff',
          bgDarkSubtle: 'rgba(14, 165, 233, 0.16)',
          text: '#0369a1',
          darkText: '#7dd3fc',
        };
      case 'neutral':
      default:
        return {
          main: '#64748b',
          bgSubtle: '#f1f5f9',
          bgDarkSubtle: 'rgba(100, 116, 139, 0.16)',
          text: '#334155',
          darkText: '#cbd5e1',
        };
    }
  };

  const c = getColors();

  const getStyleOverrides = () => {
    if (variant === 'solid') {
      return {
        bgcolor: c.main,
        color: '#ffffff',
        fontWeight: 600,
      };
    }

    if (variant === 'outlined') {
      return {
        bgcolor: 'transparent',
        border: `1px solid ${c.main}`,
        color: isDark ? c.darkText : c.text,
        fontWeight: 500,
      };
    }

    return {
      bgcolor: isDark ? c.bgDarkSubtle : c.bgSubtle,
      color: isDark ? c.darkText : c.text,
      border: isDark ? 'none' : '1px solid rgba(0,0,0,0.04)',
      fontWeight: 600,
    };
  };

  return (
    <Chip
      size={size}
      icon={
        dot ? (
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              backgroundColor: c.main,
              marginLeft: 6,
              marginRight: -2,
            }}
          />
        ) : (
          icon
        )
      }
      label={label}
      sx={{
        height: size === 'small' ? 22 : 28,
        fontSize: size === 'small' ? '0.72rem' : '0.8125rem',
        borderRadius: 1,
        ...getStyleOverrides(),
        ...sx,
      }}
      {...props}
    />
  );
};
