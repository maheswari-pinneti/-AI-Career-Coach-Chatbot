import React from 'react';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link as MuiLink,
} from '@mui/material';
import { ChevronRight, Home } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

export interface AppPageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}

export const AppPageHeader: React.FC<AppPageHeaderProps> = ({
  title,
  subtitle,
  breadcrumbs,
  badge,
  actions,
}) => {
  return (
    <Box sx={{ mb: 3.5, width: '100%' }}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<ChevronRight size={14} />}
          aria-label="breadcrumb navigation"
          sx={{ mb: 1.5, fontSize: '0.8125rem' }}
        >
          <MuiLink
            component={RouterLink}
            to="/"
            color="inherit"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.5,
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <Home size={14} />
            <span>Home</span>
          </MuiLink>

          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            if (isLast || !item.path) {
              return (
                <Typography
                  key={item.label}
                  color="text.primary"
                  fontSize="inherit"
                  fontWeight={600}
                >
                  {item.label}
                </Typography>
              );
            }

            return (
              <MuiLink
                key={item.label}
                component={RouterLink}
                to={item.path}
                color="inherit"
                sx={{
                  textDecoration: 'none',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {item.label}
              </MuiLink>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Title & Actions Row */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            <Typography variant="h4" component="h1" fontWeight={700} sx={{ letterSpacing: -0.5 }}>
              {title}
            </Typography>
            {badge}
          </Box>
          {subtitle && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 680 }}>
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};
