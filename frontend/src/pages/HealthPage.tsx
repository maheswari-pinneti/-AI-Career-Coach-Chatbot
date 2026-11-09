import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../api/axiosClient';
import { ApiHealthResponse } from '../types';
import { RefreshCw, CheckCircle, AlertCircle, Server } from 'lucide-react';

const fetchHealth = async (): Promise<ApiHealthResponse> => {
  const response = await apiClient.get<ApiHealthResponse>('/health');
  return response.data;
};

export const HealthPage: React.FC = () => {
  const { data, error, isLoading, isError, isFetching, refetch } = useQuery<ApiHealthResponse>({
    queryKey: ['health'],
    queryFn: fetchHealth,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            System & API Health Telemetry
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live connectivity inspection between the React frontend and Flask REST API endpoint (
            <code>GET /api/v1/health</code>).
          </Typography>
        </div>

        <Button
          variant="outlined"
          startIcon={isFetching ? <CircularProgress size={16} /> : <RefreshCw size={16} />}
          onClick={() => refetch()}
          disabled={isFetching}
        >
          Refresh Telemetry
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
          <Server size={24} />
          <Typography variant="h6" fontWeight={600}>
            Backend Service Status
          </Typography>
          {isLoading ? (
            <Chip label="Connecting..." size="small" />
          ) : isError ? (
            <Chip
              icon={<AlertCircle size={16} />}
              label="Unreachable"
              color="error"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          ) : (
            <Chip
              icon={<CheckCircle size={16} />}
              label="Operational"
              color="success"
              size="small"
              sx={{ fontWeight: 600 }}
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 4, justifyContent: 'center' }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">
              Querying API endpoint at <code>{apiClient.defaults.baseURL}/health</code>...
            </Typography>
          </Box>
        )}

        {isError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              Backend API is not currently reachable
            </Typography>
            <Typography variant="body2">
              Ensure the Flask development server is running on{' '}
              <code>http://127.0.0.1:5000</code> by executing <code>python run.py</code> inside the{' '}
              <code>backend/</code> folder.
            </Typography>
            {error && (
              <Box
                component="pre"
                sx={{
                  mt: 1,
                  p: 1,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  fontSize: '0.75rem',
                  overflowX: 'auto',
                }}
              >
                {JSON.stringify(error, null, 2)}
              </Box>
            )}
          </Alert>
        )}

        {data && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  ENDPOINT STATUS
                </Typography>
                <Typography variant="h6" fontWeight={600} color="success.main">
                  {data.success ? 'HTTP 200 OK — Healthy' : 'Degraded'}
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  API VERSION
                </Typography>
                <Typography variant="h6" fontWeight={600}>
                  v{data.version}
                </Typography>
              </Paper>
            </Box>

            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ display: 'block', mb: 0.5 }}>
                RAW RESPONSE PAYLOAD
              </Typography>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: 'action.hover',
                  borderRadius: 2,
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                }}
              >
                {JSON.stringify(data, null, 2)}
              </Paper>
            </Box>
          </Box>
        )}
      </Paper>
    </Box>
  );
};
