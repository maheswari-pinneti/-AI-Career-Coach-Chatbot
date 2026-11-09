import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import {
  Mic,
  Award,
  Sparkles,
} from 'lucide-react';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { AppSelect } from '../components/common/AppSelect';
import { AppTextarea } from '../components/common/AppTextarea';
import { AppTabs } from '../components/common/AppTabs';

export const InterviewPrepPage: React.FC = () => {
  const [role, setRole] = useState('fullstack');
  const [level, setLevel] = useState('senior');
  const [activeCategory, setActiveCategory] = useState<string | number>('behavioral');
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [hasEvaluated, setHasEvaluated] = useState(false);

  const handleEvaluate = () => {
    if (!answer.trim()) return;
    setIsEvaluating(true);
    setTimeout(() => {
      setIsEvaluating(false);
      setHasEvaluated(true);
    }, 1000);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        title="AI Mock Interview Simulator"
        subtitle="Practice role-specific behavioral (STAR) and technical questions with instant criteria scoring."
        breadcrumbs={[{ label: 'AI Career Tools' }, { label: 'Interview Preparation' }]}
        badge={<AppBadge label="STAR Framework" color="warning" variant="subtle" />}
      />

      {/* Configuration Bar */}
      <AppCard>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <AppSelect
              label="Target Role"
              value={role}
              onChange={(e) => setRole(e.target.value as string)}
              options={[
                { value: 'frontend', label: 'Frontend / UI Engineer' },
                { value: 'backend', label: 'Backend / Distributed Systems' },
                { value: 'fullstack', label: 'Full Stack Engineer' },
                { value: 'architect', label: 'Principal Software Architect' },
              ]}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <AppSelect
              label="Seniority Level"
              value={level}
              onChange={(e) => setLevel(e.target.value as string)}
              options={[
                { value: 'junior', label: 'Junior (0–2 yrs)' },
                { value: 'mid', label: 'Mid-Level (3–5 yrs)' },
                { value: 'senior', label: 'Senior (5–8 yrs)' },
                { value: 'staff', label: 'Staff / Principal (8+ yrs)' },
              ]}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Box sx={{ pt: { xs: 0, sm: 2 } }}>
              <AppButton variant="primary" fullWidth leftIcon={<Sparkles size={16} />}>
                Generate New Question
              </AppButton>
            </Box>
          </Grid>
        </Grid>
      </AppCard>

      {/* Category Tabs */}
      <AppTabs
        activeTab={activeCategory}
        onChange={(cat) => setActiveCategory(cat)}
        tabs={[
          { id: 'behavioral', label: 'Behavioral & Leadership (STAR)', icon: <Mic size={16} /> },
          { id: 'system_design', label: 'System Architecture & Scale' },
          { id: 'problem_solving', label: 'Cross-Functional Collaboration' },
        ]}
      />

      {/* Simulator Question Card */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <AppCard
            title="Interview Question Prompt"
            action={<AppBadge label="Senior Engineering Rubric" color="primary" variant="subtle" />}
          >
            <Paper variant="outlined" sx={{ p: 2.5, mb: 3, borderRadius: 2, bgcolor: 'action.hover' }}>
              <Typography variant="h6" fontWeight={700} gutterBottom sx={{ fontSize: '1.05rem', lineHeight: 1.4 }}>
                "Tell me about a time you identified a critical architectural bottleneck in production. How did you diagnose it, align the team on the resolution, and verify the outcome?"
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Evaluated against: Technical rigor, stakeholder communication, and post-mortem accountability.
              </Typography>
            </Paper>

            <AppTextarea
              label="Your Answer (Draft or Transcribe)"
              placeholder="Use the STAR method: State the Situation, explain the Task, describe your exact Actions, and share the measurable Results..."
              minRows={6}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              helperText="Tip: Focus on the specific architectural decisions and your leadership in driving consensus."
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt: 1 }}>
              <AppButton
                variant="primary"
                leftIcon={<Sparkles size={16} />}
                onClick={handleEvaluate}
                isLoading={isEvaluating}
                disabled={!answer.trim()}
              >
                Evaluate Answer with AI
              </AppButton>
            </Box>
          </AppCard>
        </Grid>

        {/* Feedback / Evaluation Card */}
        <Grid item xs={12} md={5}>
          <AppCard
            title="AI Rubric Evaluation"
            subtitle="Real-time breakdown of STAR dimensions."
            avatar={
              <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'action.hover', color: 'primary.main', display: 'flex' }}>
                <Award size={20} />
              </Box>
            }
          >
            {hasEvaluated ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ p: 2, borderRadius: 2, bgcolor: 'action.hover', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    STAR READINESS SCORE
                  </Typography>
                  <Typography variant="h3" fontWeight={800} color="success.main">
                    85%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Strong Technical Delivery
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {[
                    { label: 'Situation & Context', score: '9/10', color: 'success' },
                    { label: 'Task Ownership', score: '8/10', color: 'success' },
                    { label: 'Action & Technical Depth', score: '9/10', color: 'success' },
                    { label: 'Results & Business Impact', score: '7/10', color: 'warning' },
                  ].map((dim) => (
                    <Box key={dim.label} sx={{ display: 'flex', justifyContent: 'space-between', p: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="body2">{dim.label}</Typography>
                      <Typography variant="body2" fontWeight={700} color={`${dim.color}.main`}>
                        {dim.score}
                      </Typography>
                    </Box>
                  ))}
                </Box>

                <Divider />

                <Box>
                  <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                    Recommended Polish:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Highlight whether you created an automated regression test or telemetry dashboard after the incident to ensure the bottleneck never recurred.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Submit your response on the left to receive AI-driven scoring on clarity, technical ownership, and STAR framework adherence.
                </Typography>
              </Box>
            )}
          </AppCard>
        </Grid>
      </Grid>
    </Box>
  );
};
