import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  LinearProgress,
} from '@mui/material';
import {
  UploadCloud,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { AppInput } from '../components/common/AppInput';
import { AppTabs } from '../components/common/AppTabs';

export const ResumeAnalyzerPage: React.FC = () => {
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer');
  const [activeTab, setActiveTab] = useState<string | number>('overview');
  const [isScanning, setIsScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(true);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setHasScanned(true);
    }, 1200);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        title="AI Resume Analyzer"
        subtitle="Evaluate resume ATS compliance, keyword saturation, and bullet-point impact metrics."
        breadcrumbs={[{ label: 'AI Career Tools' }, { label: 'Resume Analyzer' }]}
        badge={<AppBadge label="ATS Score Engine" color="secondary" variant="subtle" />}
        actions={
          <AppButton
            variant="outlined"
            leftIcon={<RotateCcw size={16} />}
            onClick={() => {
              setHasScanned(false);
              setTargetRole('');
            }}
          >
            Reset Analysis
          </AppButton>
        }
      />

      {/* Target Job Role & Upload Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <AppCard title="Target Role & Input" subtitle="Specify role requirements for accurate ATS benchmark calculations.">
            <AppInput
              label="Target Job Title"
              placeholder="e.g. Staff Software Engineer"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              helperText="The analyzer benchmarks your profile against standard competencies for this role."
            />

            {/* Upload Dropzone */}
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                borderRadius: 2.5,
                borderStyle: 'dashed',
                borderWidth: 2,
                borderColor: 'primary.main',
                bgcolor: 'action.hover',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                '&:hover': { bgcolor: 'action.selected' },
              }}
              onClick={handleSimulateScan}
            >
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  bgcolor: 'primary.main',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 1.5,
                }}
              >
                <UploadCloud size={24} />
              </Box>
              <Typography variant="subtitle2" fontWeight={700}>
                Drop PDF / DOCX resume here
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                Maximum size: 10 MB (strict client-side parsing)
              </Typography>

              <AppButton
                variant="primary"
                size="small"
                isLoading={isScanning}
                loadingText="Scanning Resume..."
                onClick={(e) => {
                  e.stopPropagation();
                  handleSimulateScan();
                }}
              >
                Upload & Scan File
              </AppButton>
            </Paper>
          </AppCard>
        </Grid>

        {/* Results Overview Card */}
        <Grid item xs={12} md={7}>
          {hasScanned ? (
            <AppCard
              title="Resume Diagnostic Report"
              subtitle="Analysis computed against Senior Full Stack Engineer benchmarks."
              action={<AppBadge label="Sample Data" color="neutral" variant="subtle" />}
            >
              {/* Score Metric Badges */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      OVERALL ATS
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="success.main">
                      88%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Competitive
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      KEYWORDS
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="primary.main">
                      92%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      18 of 20 Matched
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      IMPACT SCORE
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="warning.main">
                      76%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Needs Metrics
                    </Typography>
                  </Paper>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                      FORMATTING
                    </Typography>
                    <Typography variant="h4" fontWeight={800} color="info.main">
                      95%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Clean Layout
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Tabs for Detailed Feedback */}
              <AppTabs
                activeTab={activeTab}
                onChange={(tabId) => setActiveTab(tabId)}
                tabs={[
                  { id: 'overview', label: 'Priority Fixes', badge: 3, badgeColor: 'warning' },
                  { id: 'keywords', label: 'ATS Keywords', badge: 20, badgeColor: 'default' },
                  { id: 'structure', label: 'Section Analysis' },
                ]}
              />

              {activeTab === 'overview' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0, marginTop: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Quantify Achievement Metrics
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Under "Senior Engineer at Acme Corp", add measurable business outcomes rather than generic task lists.
                        Example: <em>"Scaled microservices throughput by 40% reducing compute costs by $12k/mo."</em>
                      </Typography>
                    </Box>
                  </Paper>

                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                    <CheckCircle2 size={20} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Strong Architectural Vocabulary
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Found high-signal keywords: TypeScript, Redux Toolkit, Micro-frontends, CI/CD, Docker, and REST APIs.
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              )}

              {activeTab === 'keywords' && (
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Key tech stack tokens parsed by ATS scanners:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {['React 18', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker', 'GraphQL', 'AWS', 'System Design', 'CI/CD'].map((kw) => (
                      <AppBadge key={kw} label={kw} color="success" variant="subtle" />
                    ))}
                    {['Kubernetes', 'Terraform'].map((kw) => (
                      <AppBadge key={kw} label={`Missing: ${kw}`} color="warning" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}

              {activeTab === 'structure' && (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {['Contact Information (100%)', 'Professional Summary (90%)', 'Work Experience (80%)', 'Skills Section (95%)', 'Education (100%)'].map((sec) => (
                    <Box key={sec}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                        <Typography variant="caption" fontWeight={600}>{sec}</Typography>
                        <Typography variant="caption" color="text.secondary">Verified</Typography>
                      </Box>
                      <LinearProgress variant="determinate" value={90} sx={{ height: 6, borderRadius: 1 }} />
                    </Box>
                  ))}
                </Box>
              )}
            </AppCard>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 6,
                textAlign: 'center',
                borderRadius: 2.5,
                bgcolor: 'action.hover',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <FileCheck size={40} color="#94a3b8" style={{ marginBottom: 16 }} />
              <Typography variant="h6" fontWeight={600} gutterBottom>
                No Resume Scanned Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380 }}>
                Upload your resume PDF/DOCX file on the left to generate ATS score breakdowns and bullet-point enhancements.
              </Typography>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
