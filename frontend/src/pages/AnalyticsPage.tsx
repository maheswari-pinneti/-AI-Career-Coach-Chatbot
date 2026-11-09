import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Chip,
  Alert,
  useTheme,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  Award,
  TrendingUp,
  Download,
  Briefcase,
  BookOpen,
  Code,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppBadge } from '../components/common/AppBadge';
import { AppButton } from '../components/common/AppButton';
import { AppSkeleton } from '../components/common/AppSkeleton';
import { AppEmptyState } from '../components/common/AppEmptyState';
import { analyticsApi } from '../api/analyticsApi';

const PERIOD_OPTIONS = [
  { label: '7 Days', value: 7 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
  { label: 'All Time', value: 365 },
];

export const AnalyticsPage: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const [periodDays, setPeriodDays] = useState<number>(30);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const { data: overviewRes, isLoading, error: queryError } = useQuery({
    queryKey: ['analytics-overview', periodDays],
    queryFn: () => analyticsApi.getOverview(periodDays),
  });

  const data = overviewRes?.data || null;
  const error = exportError || (queryError ? 'Failed to aggregate telemetry metrics. Please try again.' : null);

  const handleExport = async (format: 'json' | 'csv') => {
    setIsExporting(true);
    try {
      const blob = await analyticsApi.exportAnalytics(format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `career_analytics_${new Date().toISOString().split('T')[0]}.${format}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setExportError('Failed to export analytics report.');
    } finally {
      setIsExporting(false);
    }
  };

  // Prepare chart datasets
  const statusDistributionData = data?.job_metrics?.status_distribution
    ? Object.entries(data.job_metrics.status_distribution).map(([stage, count]) => ({
        stage: stage.charAt(0).toUpperCase() + stage.slice(1),
        count,
      }))
    : [];

  const scoreProgressionData = data?.score_progression?.map((item) => ({
    date: item.date,
    'Career Readiness': item.readiness_score,
    'Resume Quality': item.resume_score,
    'Interview Rigor': item.interview_score,
  })) || [];

  const latestScore =
    data?.score_progression && data.score_progression.length > 0
      ? data.score_progression[data.score_progression.length - 1].readiness_score
      : 0;

  const totalApps = data?.job_metrics?.total_applications ?? 0;
  const interviewRate = data?.job_metrics?.interview_conversion_rate ?? 0;
  const offerRate = data?.job_metrics?.offer_conversion_rate ?? 0;
  const avgCompletion = data?.roadmap_metrics?.average_completion_pct ?? 0;
  const totalMilestones = data?.roadmap_metrics?.total_milestones ?? 0;
  const completedMilestones = data?.roadmap_metrics?.completed_milestones ?? 0;
  const skillsCount = data?.skill_metrics?.total_profile_skills ?? 0;
  const profileSkills = data?.skill_metrics?.profile_skills ?? [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        title="Career Growth & Telemetry"
        subtitle="Audited, data-driven telemetry tracking your recruitment funnel, milestone velocity, and interview proficiency."
        breadcrumbs={[{ label: 'Career Management' }, { label: 'Analytics' }]}
        badge={<AppBadge label="Real Persisted Data" color="primary" variant="subtle" />}
        actions={
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <AppButton
              variant="secondary"
              leftIcon={<Download size={16} />}
              onClick={() => handleExport('json')}
              isLoading={isExporting}
            >
              Export JSON
            </AppButton>
            <AppButton
              variant="ghost"
              leftIcon={<Download size={16} />}
              onClick={() => handleExport('csv')}
              isLoading={isExporting}
            >
              Export CSV
            </AppButton>
          </Box>
        }
      />

      {error && (
        <Alert severity="error" onClose={() => setExportError(null)}>
          {error}
        </Alert>
      )}

      {/* Date Range Filter Selector */}
      <AppCard>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Calendar size={18} color="#6366f1" />
            <Typography variant="subtitle2" fontWeight={700}>
              Analysis Timeframe
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {PERIOD_OPTIONS.map((opt) => (
              <Chip
                key={opt.value}
                label={opt.label}
                color={periodDays === opt.value ? 'primary' : 'default'}
                variant={periodDays === opt.value ? 'filled' : 'outlined'}
                onClick={() => setPeriodDays(opt.value)}
                clickable
                sx={{ fontWeight: periodDays === opt.value ? 700 : 500 }}
              />
            ))}
          </Box>
        </Box>
      </AppCard>

      {/* Loading Skeleton */}
      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Grid container spacing={2.5}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <AppSkeleton variant="card" height={130} />
              </Grid>
            ))}
          </Grid>
          <AppSkeleton variant="card" height={320} />
        </Box>
      )}

      {/* Telemetry Overview Cards */}
      {!isLoading && data && (
        <>
          <Grid container spacing={2.5}>
            {/* KPI 1: Career Readiness Score */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    CAREER READINESS SCORE
                  </Typography>
                  <Award size={18} color="#6366f1" />
                </Box>
                <Typography variant="h4" fontWeight={800} color="primary.main">
                  {latestScore}%
                </Typography>
                <Typography
                  variant="caption"
                  color="success.main"
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}
                >
                  <TrendingUp size={14} /> Persisted AI Evaluation
                </Typography>
              </Paper>
            </Grid>

            {/* KPI 2: Job Applications Pipeline */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    JOB PIPELINE
                  </Typography>
                  <Briefcase size={18} color="#0284c7" />
                </Box>
                <Typography variant="h4" fontWeight={800} color="secondary.main">
                  {totalApps}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {interviewRate}% Interview / {offerRate}% Offer rate
                </Typography>
              </Paper>
            </Grid>

            {/* KPI 3: Learning Roadmap Velocity */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    ROADMAP VELOCITY
                  </Typography>
                  <BookOpen size={18} color="#10b981" />
                </Box>
                <Typography variant="h4" fontWeight={800} color="success.main">
                  {avgCompletion}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  {completedMilestones} of {totalMilestones} milestones finished
                </Typography>
              </Paper>
            </Grid>

            {/* KPI 4: Verified Skills Count */}
            <Grid item xs={12} sm={6} md={3}>
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2.5, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    VERIFIED SKILLS
                  </Typography>
                  <Code size={18} color="#f59e0b" />
                </Box>
                <Typography variant="h4" fontWeight={800} color="warning.main">
                  {skillsCount}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Target: {data.skill_metrics?.target_role || 'General Track'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Charts Row */}
          <Grid container spacing={3}>
            {/* Chart 1: Readiness Trajectory */}
            <Grid item xs={12} md={7}>
              <AppCard
                title="Readiness & Rigor Trajectory"
                subtitle="Historical score metrics calculated from mock interviews and resume iterations."
              >
                {scoreProgressionData.length > 0 ? (
                  <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={scoreProgressionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#e2e8f0'} />
                        <XAxis dataKey="date" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                        <YAxis domain={[0, 100]} stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#111827' : '#ffffff',
                            borderColor: isDark ? '#374151' : '#e2e8f0',
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: 12 }} />
                        <Line
                          type="monotone"
                          dataKey="Career Readiness"
                          stroke="#6366f1"
                          strokeWidth={2.5}
                          dot={{ fill: '#6366f1', r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Resume Quality"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 3 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="Interview Rigor"
                          stroke="#0284c7"
                          strokeWidth={2}
                          dot={{ fill: '#0284c7', r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <AppEmptyState
                    title="No Historical Scores"
                    description="Complete mock interviews and analyze your resume to populate trajectory telemetry."
                  />
                )}
              </AppCard>
            </Grid>

            {/* Chart 2: Job Funnel Status Distribution */}
            <Grid item xs={12} md={5}>
              <AppCard
                title="Job Pipeline Funnel"
                subtitle="Volume of applications distributed across interview and decision stages."
              >
                {statusDistributionData.length > 0 ? (
                  <Box sx={{ width: '100%', height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statusDistributionData}>
                        <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1f2937' : '#e2e8f0'} />
                        <XAxis dataKey="stage" stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={11} />
                        <YAxis stroke={isDark ? '#94a3b8' : '#64748b'} fontSize={12} allowDecimals={false} />
                        <RechartsTooltip
                          contentStyle={{
                            backgroundColor: isDark ? '#111827' : '#ffffff',
                            borderColor: isDark ? '#374151' : '#e2e8f0',
                            borderRadius: 8,
                            fontSize: 12,
                          }}
                        />
                        <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                ) : (
                  <AppEmptyState
                    title="No Job Data"
                    description="Track jobs in the Job Tracker to visualize your interview pipeline conversion."
                  />
                )}
              </AppCard>
            </Grid>
          </Grid>

          {/* Skill Inventory & Recent Timeline */}
          <Grid container spacing={3}>
            {/* Skill Inventory */}
            <Grid item xs={12} md={6}>
              <AppCard
                title="Profile Skill Matrix"
                subtitle="Technical competences currently cataloged in your user profile."
              >
                {profileSkills.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                    {profileSkills.map((skill, idx) => (
                      <Chip
                        key={idx}
                        label={skill}
                        color="primary"
                        variant="outlined"
                        icon={<CheckCircle2 size={14} />}
                        sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No skills configured in your profile yet. Add skills in My Profile.
                  </Typography>
                )}
              </AppCard>
            </Grid>

            {/* Recent Timeline */}
            <Grid item xs={12} md={6}>
              <AppCard
                title="Recent Career Activity"
                subtitle="Audit log of completed mock sessions, applications, and roadmap sprints."
              >
                {data.recent_timeline && data.recent_timeline.length > 0 ? (
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mt: 1 }}>
                    {data.recent_timeline.map((act) => (
                      <Paper
                        key={act.id}
                        variant="outlined"
                        sx={{ p: 1.5, borderRadius: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                      >
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {act.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                            {act.subtitle}
                          </Typography>
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {act.date}
                        </Typography>
                      </Paper>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No recent activity logged in this period.
                  </Typography>
                )}
              </AppCard>
            </Grid>
          </Grid>
        </>
      )}
    </Box>
  );
};
