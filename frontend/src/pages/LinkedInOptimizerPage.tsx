import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Linkedin,
  Copy,
  Check,
  Wand2,
  Sparkles,
} from 'lucide-react';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { AppInput } from '../components/common/AppInput';
import { AppTextarea } from '../components/common/AppTextarea';
import { AppTabs } from '../components/common/AppTabs';

export const LinkedInOptimizerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string | number>('headline');
  const [headline, setHeadline] = useState(
    'Senior Frontend Engineer | React, TypeScript, Architecture | Building High-Performance SaaS Platforms'
  );
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (section: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const AI_HEADLINE_SUGGESTIONS = [
    {
      id: 'h1',
      title: 'High-Impact Technical Leader',
      text: 'Staff Frontend Architect | React 18, Next.js, Micro-Frontends | Scaling High-Concurrency Cloud SaaS Systems to 10M+ Users',
      score: 96,
    },
    {
      id: 'h2',
      title: 'Business Outcome Focused',
      text: 'Lead Software Engineer @ Enterprise SaaS | Driving Front-End Scalability & Developer Experience | TypeScript & Cloud Architecture',
      score: 92,
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        title="LinkedIn Profile Optimizer"
        subtitle="Transform your LinkedIn presence to rank higher in recruiter searches and capture inbound inquiries."
        breadcrumbs={[{ label: 'AI Career Tools' }, { label: 'LinkedIn Optimizer' }]}
        badge={<AppBadge label="Profile SEO" color="info" variant="subtle" />}
      />

      <AppTabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t)}
        tabs={[
          { id: 'headline', label: 'Headline Optimization', icon: <Linkedin size={16} /> },
          { id: 'summary', label: 'About / Summary', icon: <Wand2 size={16} /> },
          { id: 'keywords', label: 'Recruiter Search Keywords' },
        ]}
      />

      {activeTab === 'headline' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={5}>
            <AppCard title="Current Headline" subtitle="What recruiters currently see in search results.">
              <AppInput
                label="Headline Text"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                maxLength={220}
                currentLength={headline.length}
                multiline
                minRows={3}
              />
              <AppButton variant="primary" leftIcon={<Sparkles size={16} />} fullWidth>
                Regenerate AI Suggestions
              </AppButton>
            </AppCard>
          </Grid>

          <Grid item xs={12} md={7}>
            <AppCard title="AI-Optimized Variations" subtitle="Generated using top 1% recruiter search frequency tokens.">
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {AI_HEADLINE_SUGGESTIONS.map((item) => (
                  <Paper
                    key={item.id}
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { borderColor: 'primary.main' },
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2" fontWeight={700}>
                          {item.title}
                        </Typography>
                        <AppBadge label={`${item.score}% Match`} color="success" size="small" />
                      </Box>

                      <Tooltip title={copiedSection === item.id ? 'Copied!' : 'Copy to clipboard'}>
                        <IconButton
                          size="small"
                          onClick={() => handleCopy(item.id, item.text)}
                          aria-label="copy headline"
                        >
                          {copiedSection === item.id ? <Check size={16} color="#10b981" /> : <Copy size={16} />}
                        </IconButton>
                      </Tooltip>
                    </Box>

                    <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                      {item.text}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </AppCard>
          </Grid>
        </Grid>
      )}

      {activeTab === 'summary' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <AppCard title="Current About Section">
              <AppTextarea
                minRows={8}
                value="I am a passionate software engineer with 6 years of experience building modern web applications. Proficient in React, JavaScript, and Node.js."
                onChange={() => {}}
                label="Existing Summary"
              />
            </AppCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <AppCard
              title="AI Enhanced Executive Summary"
              action={
                <AppButton
                  size="small"
                  variant="outlined"
                  leftIcon={<Copy size={14} />}
                  onClick={() => handleCopy('summary', 'Lead Frontend Engineer with 6+ years driving architectural transformation...')}
                >
                  {copiedSection === 'summary' ? 'Copied' : 'Copy'}
                </AppButton>
              }
            >
              <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2, bgcolor: 'action.hover' }}>
                <Typography variant="body2" sx={{ lineHeight: 1.7, whiteSpace: 'pre-line' }}>
                  {`As a Lead Frontend Engineer with 6+ years of experience, I architect resilient, accessible SaaS applications that serve millions of monthly active users.

Key Focus Areas:
• Modern Frontend Architecture: React 18, TypeScript, Redux Toolkit, and Vite HMR.
• Engineering Excellence: Zero-regression CI/CD pipelines, Vitest unit testing, and WCAG AA accessibility compliance.
• Mentorship & Scale: Led cross-functional squads to deprecate legacy systems, improving web vitals by 45%.`}
                </Typography>
              </Paper>
            </AppCard>
          </Grid>
        </Grid>
      )}

      {activeTab === 'keywords' && (
        <AppCard title="Recruiter Search Keywords" subtitle="High-frequency skill queries for your discipline.">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {['Micro-Frontends', 'Distributed Systems', 'TypeScript Strict Mode', 'Design Systems', 'Performance Profiling', 'Vite & Rollup', 'Next.js SSR', 'State Management (RTK)'].map((kw) => (
              <AppBadge key={kw} label={kw} color="primary" variant="subtle" />
            ))}
          </Box>
        </AppCard>
      )}
    </Box>
  );
};
