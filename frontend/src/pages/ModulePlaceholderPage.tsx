import React from 'react';
import { Box, Typography, Paper, Chip, Button } from '@mui/material';
import { Clock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  moduleName: string;
  phase: string;
  description: string;
}

export const ModulePlaceholderPage: React.FC<Props> = ({ moduleName, phase, description }) => {
  const navigate = useNavigate();

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 3, sm: 5 },
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          textAlign: 'center',
        }}
      >
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'action.hover',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2,
            color: 'primary.main',
          }}
        >
          <Clock size={28} />
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          {moduleName}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Chip label={`Scheduled for ${phase}`} color="primary" variant="outlined" size="small" />
        </Box>

        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: 540, mx: 'auto' }}>
          {description}
        </Typography>

        <Button
          variant="contained"
          startIcon={<ArrowLeft size={16} />}
          onClick={() => navigate('/')}
          sx={{ mt: 2 }}
        >
          Return to Foundation Overview
        </Button>
      </Paper>
    </Box>
  );
};
