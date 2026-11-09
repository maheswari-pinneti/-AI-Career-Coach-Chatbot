import React from 'react';
import { Skeleton, Box, Grid, Paper } from '@mui/material';

export interface AppSkeletonProps {
  variant?: 'card' | 'table' | 'text' | 'avatar' | 'dashboard';
  count?: number;
  height?: number | string;
}

export const AppSkeleton: React.FC<AppSkeletonProps> = ({
  variant = 'card',
  count = 1,
  height,
}) => {
  if (variant === 'text') {
    return (
      <Box sx={{ width: '100%' }}>
        {Array.from({ length: count }).map((_, idx) => (
          <Skeleton
            key={idx}
            animation="wave"
            height={height || 24}
            sx={{ mb: 1, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (variant === 'avatar') {
    return (
      <Skeleton
        variant="circular"
        animation="wave"
        width={height || 40}
        height={height || 40}
      />
    );
  }

  if (variant === 'table') {
    return (
      <Box sx={{ width: '100%' }}>
        <Skeleton variant="rectangular" height={44} sx={{ mb: 1, borderRadius: 1 }} />
        {Array.from({ length: count || 4 }).map((_, idx) => (
          <Skeleton
            key={idx}
            variant="rectangular"
            height={52}
            sx={{ mb: 0.5, borderRadius: 1 }}
          />
        ))}
      </Box>
    );
  }

  if (variant === 'dashboard') {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 3 }} />
        <Grid container spacing={2}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5 }}>
                <Skeleton width="40%" height={20} sx={{ mb: 1 }} />
                <Skeleton width="70%" height={36} sx={{ mb: 1 }} />
                <Skeleton width="50%" height={16} />
              </Paper>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
          </Grid>
          <Grid item xs={12} md={4}>
            <Skeleton variant="rectangular" height={320} sx={{ borderRadius: 3 }} />
          </Grid>
        </Grid>
      </Box>
    );
  }

  // Default 'card'
  return (
    <Grid container spacing={2}>
      {Array.from({ length: count }).map((_, idx) => (
        <Grid item xs={12} sm={6} md={4} key={idx}>
          <Paper variant="outlined" sx={{ p: 3, borderRadius: 2.5, height: height || 180 }}>
            <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="90%" height={20} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={48} sx={{ borderRadius: 1.5, mb: 1.5 }} />
            <Skeleton variant="text" width="40%" height={20} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};
