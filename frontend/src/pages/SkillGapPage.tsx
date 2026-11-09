import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { AppSelect } from '../components/common/AppSelect';

export const SkillGapPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState('staff_frontend');

  const SKILL_BENCHMARKS = [
    { name: 'TypeScript Strict Architecture', current: 95, benchmark: 90, status: 'match' },
    { name: 'React 18 & State Architecture', current: 90, benchmark: 85, status: 'match' },
    { name: 'CI/CD & Automated Testing', current: 85, benchmark: 80, status: 'match' },
    { name: 'Micro-Frontends & Module Federation', current: 65, benchmark: 85, status: 'moderate' },
    { name: 'Web Vitals & Performance Profiling', current: 70, benchmark: 90, status: 'moderate' },
    { name: 'Distributed Systems & Cloud Infra', current: 40, benchmark: 75, status: 'critical' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        title="Skill Gap Analyzer"
        subtitle="Benchmark your technical skills against real-world engineering market demand."
        breadcrumbs={[{ label: 'AI Career Tools' }, { label: 'Skill Gap Analyzer' }]}
        badge={<AppBadge label="Market Radar" color="success" variant="subtle" />}
      />

      {/* Target Selector */}
      <AppCard>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <AppSelect
              label="Target Engineering Role"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value as string)}
              options={[
                { value: 'senior_frontend', label: 'Senior Frontend Engineer' },
                { value: 'staff_frontend', label: 'Staff Frontend Architect' },
                { value: 'senior_fullstack', label: 'Senior Full Stack Engineer' },
                { value: 'ai_engineer', label: 'AI Solutions Engineer' },
              ]}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" color="text.secondary" sx={{ pt: { sm: 2 } }}>
              Market sample size: <strong>1,420+ active job specifications</strong> analyzed in the last 30 days.
            </Typography>
          </Grid>
        </Grid>
      </AppCard>

      {/* Gap Analysis Matrix */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <AppCard title="Competency Alignment Matrix" subtitle="Comparison of your verified capabilities vs market requirements.">
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              {SKILL_BENCHMARKS.map((skill) => {
                const isMatch = skill.status === 'match';
                const isModerate = skill.status === 'moderate';

                return (
                  <Box key={skill.name}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {isMatch && <CheckCircle2 size={16} color="#10b981" />}
                        {isModerate && <HelpCircle size={16} color="#f59e0b" />}
                        {!isMatch && !isModerate && <AlertCircle size={16} color="#ef4444" />}
                        <Typography variant="body2" fontWeight={600}>
                          {skill.name}
                        </Typography>
                      </Box>
                      <AppBadge
                        label={isMatch ? 'Qualified' : isModerate ? 'Moderate Gap' : 'Critical Gap'}
                        color={isMatch ? 'success' : isModerate ? 'warning' : 'error'}
                        size="small"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={skill.current}
                        color={isMatch ? 'success' : isModerate ? 'warning' : 'error'}
                        sx={{ flex: 1, height: 8, borderRadius: 1 }}
                      />
                      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 45, textAlign: 'right' }}>
                        {skill.current}% / {skill.benchmark}%
                      </Typography>
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </AppCard>
        </Grid>

        <Grid item xs={12} md={5}>
          <AppCard
            title="Accelerated Bridge Plan"
            subtitle="Recommended high-leverage milestones to close priority gaps."
            avatar={
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover', color: 'primary.main', display: 'flex' }}>
                <Compass size={20} />
              </Box>
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <AppBadge label="Priority 1: Cloud & Distributed Systems" color="error" size="small" sx={{ mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Containerization & Service Mesh
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Complete a hands-on project deploying a multi-region Docker / Kubernetes cluster with automated rollback pipelines.
                </Typography>
              </Paper>

              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <AppBadge label="Priority 2: Performance Profiling" color="warning" size="small" sx={{ mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  Web Vitals & INP Optimization
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Demonstrate measuring Interaction to Next Paint (INP) and Largest Contentful Paint (LCP) in a high-traffic production application.
                </Typography>
              </Paper>

              <AppButton variant="primary" leftIcon={<Sparkles size={16} />} fullWidth>
                Generate Milestone Roadmap
              </AppButton>
            </Box>
          </AppCard>
        </Grid>
      </Grid>
    </Box>
  );
};
