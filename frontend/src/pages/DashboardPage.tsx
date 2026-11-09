import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
  useTheme,
  Alert,
} from '@mui/material';
import {
  Sparkles,
  TrendingUp,
  FileText,
  Mic,
  Briefcase,
  ArrowRight,
  CheckCircle2,
  Flame,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { AppSkeleton } from '../components/common/AppSkeleton';
import { AppToast } from '../components/common/AppToast';
import { useAppSelector } from '../store/hooks';
import { dashboardApi } from '../api/dashboardApi';
import { DashboardData } from '../types/dashboard';

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const currentUser = useAppSelector((state) => state.auth.user);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboard-metrics'],
    queryFn: dashboardApi.getDashboardMetrics,
    retry: 1,
  });

  const seedMutation = useMutation({
    mutationFn: dashboardApi.seedSampleData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
      setToastMessage('Sample telemetry populated successfully!');
    },
  });

  const userName =
    currentUser?.first_name ||
    currentUser?.email?.split('@')[0] ||
    'Professional';

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <AppPageHeader
          title="Career Command Center"
          subtitle="Calculating real-time career readiness analytics..."
        />
        <Grid container spacing={2.5}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <AppSkeleton variant="card" height={130} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  const hasData = Boolean(data?.has_data);
  const metrics = data?.metrics || {
    readiness_score: 0,
    resume_score: 0,
    linkedin_score: 0,
    interview_score: 0,
    skills_score: 0,
    roadmap_score: 0,
    job_applications_count: 0,
    interview_conversion_rate: 0,
  };

  const chartData = data?.progress_chart || [];
  const timeline = data?.timeline || [];
  const recommendedActions = data?.recommended_actions || [];

  const competencyBreakdown = [
    { domain: 'Resume', score: metrics.resume_score },
    { domain: 'LinkedIn', score: metrics.linkedin_score },
    { domain: 'Interview', score: metrics.interview_score },
    { domain: 'Skills', score: metrics.skills_score },
    { domain: 'Roadmap', score: metrics.roadmap_score },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Welcome & Command Header */}
      <AppPageHeader
        title={`Welcome Back, ${userName}`}
        subtitle={`Career Command Center • Real-time telemetry for ${currentUser?.profile?.target_role || 'Software Engineering'}`}
        breadcrumbs={[{ label: 'Overview' }, { label: 'Dashboard' }]}
        actions={
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {!hasData && (
              <AppButton
                variant="outlined"
                size="small"
                leftIcon={<Flame size={16} />}
                onClick={() => seedMutation.mutate()}
                isLoading={seedMutation.isPending}
              >
                Seed Demo Telemetry
              </AppButton>
            )}
            <AppButton
              variant="primary"
              size="small"
              leftIcon={<Sparkles size={16} />}
              onClick={() => navigate('/chat')}
            >
              Consult AI Coach
            </AppButton>
          </Box>
        }
      />

      {/* Onboarding Guidance Banner if no data */}
      {!hasData && (
        <Alert
          severity="info"
          sx={{
            borderRadius: 2.5,
            border: `1px solid ${theme.palette.info.main}`,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(14,165,233,0.08)' : 'rgba(14,165,233,0.05)',
          }}
          action={
            <AppButton
              variant="outlined"
              size="small"
              onClick={() => seedMutation.mutate()}
              isLoading={seedMutation.isPending}
            >
              Simulate Live Data
            </AppButton>
          }
        >
          <Typography variant="subtitle2" fontWeight={700}>
            New Account Telemetry Initializing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your metrics are strictly calculated from persisted activity (resumes scanned, mock interviews completed, and jobs tracked). Complete your profile or click "Simulate Live Data" to explore dashboard charts.
          </Typography>
        </Alert>
      )}

      {/* Core KPI Metrics Grid */}
      <Grid container spacing={2.5}>
        {/* Career Readiness */}
        <Grid item xs={12} sm={6} md={3}>
          <AppCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                CAREER READINESS
              </Typography>
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.1)',
                  color: 'primary.main',
                }}
              >
                <TrendingUp size={18} />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight={800} color="primary.main">
              {metrics.readiness_score}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={metrics.readiness_score}
              sx={{ my: 1.5, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary">
              Composite index across all 5 career pillars
            </Typography>
          </AppCard>
        </Grid>

        {/* Resume ATS Score */}
        <Grid item xs={12} sm={6} md={3}>
          <AppCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                RESUME ATS INDEX
              </Typography>
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.1)',
                  color: 'success.main',
                }}
              >
                <FileText size={18} />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight={800}>
              {metrics.resume_score}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={metrics.resume_score}
              color="success"
              sx={{ my: 1.5, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary">
              Keyword density & Google XYZ bullet strength
            </Typography>
          </AppCard>
        </Grid>

        {/* Interview Performance */}
        <Grid item xs={12} sm={6} md={3}>
          <AppCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                INTERVIEW READINESS
              </Typography>
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(245,158,11,0.2)' : 'rgba(245,158,11,0.1)',
                  color: 'warning.main',
                }}
              >
                <Mic size={18} />
              </Box>
            </Box>
            <Typography variant="h4" fontWeight={800}>
              {metrics.interview_score}%
            </Typography>
            <LinearProgress
              variant="determinate"
              value={metrics.interview_score}
              color="warning"
              sx={{ my: 1.5, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary">
              STAR method fidelity & probe drill confidence
            </Typography>
          </AppCard>
        </Grid>

        {/* Job Applications & Conversion */}
        <Grid item xs={12} sm={6} md={3}>
          <AppCard>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary">
                JOB CONVERSION RATE
              </Typography>
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 1.5,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(14,165,233,0.2)' : 'rgba(14,165,233,0.1)',
                  color: 'info.main',
                }}
              >
                <Briefcase size={18} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
              <Typography variant="h4" fontWeight={800}>
                {metrics.interview_conversion_rate}%
              </Typography>
              <Typography variant="caption" color="text.secondary">
                ({metrics.job_applications_count} tracked)
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(100, metrics.interview_conversion_rate * 2)}
              color="info"
              sx={{ my: 1.5, height: 6, borderRadius: 3 }}
            />
            <Typography variant="caption" color="text.secondary">
              Application-to-interview screening success
            </Typography>
          </AppCard>
        </Grid>
      </Grid>

      {/* Progress Charts Section */}
      <Grid container spacing={3}>
        {/* Trend Area Chart */}
        <Grid item xs={12} lg={8}>
          <AppCard
            title="Career Progress Trajectory"
            subtitle="Calculated readiness, interview, and technical competency trends across review cycles."
          >
            <Box sx={{ height: 280, width: '100%', mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="readinessGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.4} />
                      <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="interviewGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" stroke={theme.palette.text.secondary} fontSize={12} />
                  <YAxis domain={[0, 100]} stroke={theme.palette.text.secondary} fontSize={12} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="readiness"
                    stroke={theme.palette.primary.main}
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#readinessGrad)"
                    name="Readiness Score"
                  />
                  <Area
                    type="monotone"
                    dataKey="interview"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#interviewGrad)"
                    name="Interview Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </AppCard>
        </Grid>

        {/* Pillar Breakdown Bar Chart */}
        <Grid item xs={12} lg={4}>
          <AppCard
            title="Competency Balance"
            subtitle="Pillar-by-pillar mastery evaluation."
          >
            <Box sx={{ height: 280, width: '100%', mt: 2 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competencyBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="domain" stroke={theme.palette.text.secondary} fontSize={11} />
                  <YAxis domain={[0, 100]} stroke={theme.palette.text.secondary} fontSize={11} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: theme.palette.background.paper,
                      borderColor: theme.palette.divider,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="score" fill={theme.palette.primary.main} radius={[4, 4, 0, 0]} name="Score" />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </AppCard>
        </Grid>
      </Grid>

      {/* Recommended Next Actions & Recent Activity */}
      <Grid container spacing={3}>
        {/* Recommended Actions */}
        <Grid item xs={12} md={7}>
          <AppCard
            title="High-Priority Recommended Next Actions"
            subtitle="Targeted interventions to maximize interview conversion and career velocity."
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
              {recommendedActions.map((action) => (
                <Paper
                  key={action.id}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    transition: 'all 0.15s ease',
                    '&:hover': {
                      borderColor: theme.palette.primary.main,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.04)' : 'rgba(99,102,241,0.02)',
                    },
                  }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <AppBadge
                        label={action.priority.toUpperCase()}
                        color={
                          action.priority === 'high'
                            ? 'error'
                            : action.priority === 'medium'
                              ? 'warning'
                              : 'neutral'
                        }
                        size="small"
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        {action.title}
                      </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {action.description}
                    </Typography>
                  </Box>

                  <AppButton
                    variant="outlined"
                    size="small"
                    onClick={() => navigate(action.link)}
                    rightIcon={<ArrowRight size={14} />}
                  >
                    Action
                  </AppButton>
                </Paper>
              ))}
            </Box>
          </AppCard>
        </Grid>

        {/* Recent Activity & Telemetry Timeline */}
        <Grid item xs={12} md={5}>
          <AppCard
            title="Recent Telemetry & Milestones"
            subtitle="Verified actions and impact scores logged in your account."
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              {timeline.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
                  No recent activities logged yet.
                </Typography>
              ) : (
                timeline.map((event) => (
                  <Box
                    key={event.id}
                    sx={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1.5,
                      pb: 1.5,
                      borderBottom: `1px solid ${theme.palette.divider}`,
                      '&:last-child': { borderBottom: 'none', pb: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: 1.5,
                        bgcolor: theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.1)',
                        color: 'success.main',
                        flexShrink: 0,
                      }}
                    >
                      <CheckCircle2 size={16} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2" fontWeight={700} noWrap>
                          {event.title}
                        </Typography>
                        <AppBadge label={event.score_impact} color="success" size="small" />
                      </Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {event.description}
                      </Typography>
                      {event.timestamp && (
                        <Typography variant="caption" color="text.secondary" sx={{ opacity: 0.7 }}>
                          {new Date(event.timestamp).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                ))
              )}
            </Box>
          </AppCard>
        </Grid>
      </Grid>

      {/* Toast Notification */}
      <AppToast
        open={Boolean(toastMessage)}
        message={toastMessage || ''}
        onClose={() => setToastMessage(null)}
        severity="success"
      />
    </Box>
  );
};
