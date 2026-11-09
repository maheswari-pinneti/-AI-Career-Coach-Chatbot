import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Home, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', py: 8, textAlign: 'center' }}>
      <Paper
        elevation={0}
        sx={{
          p: 5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            color: 'warning.main',
          }}
        >
          <HelpCircle size={32} />
        </Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          404 — Page Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          The requested URL path does not exist in the application navigation tree.
        </Typography>
        <Button variant="contained" startIcon={<Home size={18} />} onClick={() => navigate('/')}>
          Back to Overview
        </Button>
      </Paper>
    </Box>
  );
};
