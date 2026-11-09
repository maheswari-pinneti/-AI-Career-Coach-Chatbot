import React from 'react';
import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';

export const MainLayout: React.FC = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'background.default',
        overflowX: 'hidden',
        width: '100%',
      }}
    >
      <Header />
      <Box sx={{ display: 'flex', flex: 1, position: 'relative', width: '100%' }}>
        <Sidebar />
        <Box
          component="main"
          id="main-content"
          tabIndex={-1}
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 2.5, md: 3.5 },
            width: { xs: '100%', md: 'calc(100% - 260px)' },
            maxWidth: '100%',
            minHeight: 'calc(100vh - 64px)',
            overflowX: 'hidden',
          }}
        >
          <Container maxWidth="xl" disableGutters sx={{ width: '100%' }}>
            <Outlet />
          </Container>
        </Box>
      </Box>
    </Box>
  );
};
