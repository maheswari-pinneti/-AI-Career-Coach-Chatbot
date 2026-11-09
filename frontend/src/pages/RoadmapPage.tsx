import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Checkbox,
  LinearProgress,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Alert,
  Link,
} from '@mui/material';
import {
  Calendar,
  Plus,
  Sparkles,
  BookOpen,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  Target,
} from 'lucide-react';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { AppDialog } from '../components/common/AppDialog';
import { AppInput } from '../components/common/AppInput';
import { AppSelect } from '../components/common/AppSelect';
import { AppTextarea } from '../components/common/AppTextarea';
import { AppEmptyState } from '../components/common/AppEmptyState';
import { AppSkeleton } from '../components/common/AppSkeleton';
import { roadmapApi } from '../api/roadmapApi';
import { RoadmapMilestone } from '../types/roadmap';

export const RoadmapPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [selectedRoadmapId, setSelectedRoadmapId] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: roadmapsRes, isLoading, error: queryError } = useQuery({
    queryKey: ['roadmaps'],
    queryFn: roadmapApi.getRoadmaps,
  });

  const roadmaps = roadmapsRes?.data?.roadmaps || [];
  const activeRoadmapId =
    selectedRoadmapId && roadmaps.some((r) => r.id === selectedRoadmapId)
      ? selectedRoadmapId
      : roadmaps[0]?.id || null;
  const activeRoadmap = roadmaps.find((r) => r.id === activeRoadmapId);
  const error = actionError || (queryError ? 'Failed to load learning roadmaps. Please try again.' : null);

  // Dialog states
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState<boolean>(false);
  const [isAddMilestoneDialogOpen, setIsAddMilestoneDialogOpen] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Generate form state
  const [genTargetRole, setGenTargetRole] = useState('Senior Full-Stack Engineer');
  const [genCurrentSkills, setGenCurrentSkills] = useState('React, TypeScript, JavaScript, CSS');
  const [genSkillGaps, setGenSkillGaps] = useState('System Design, Docker, Microservices, CI/CD');
  const [genWeeklyHours, setGenWeeklyHours] = useState('10');
  const [genObjectives, setGenObjectives] = useState('Transition to Staff-level engineering leadership');

  // Custom milestone form state
  const [msTitle, setMsTitle] = useState('');
  const [msDescription, setMsDescription] = useState('');
  const [msDuration, setMsDuration] = useState('2 weeks');
  const [msPriority, setMsPriority] = useState('medium');
  const [msTasksText, setMsTasksText] = useState('');

  const handleToggleMilestone = async (milestoneId: number, currentCompleted: boolean) => {
    if (!activeRoadmapId) return;
    const targetStatus = !currentCompleted;

    try {
      await roadmapApi.toggleMilestone(activeRoadmapId, milestoneId, targetStatus);
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
    } catch {
      setActionError('Failed to toggle milestone.');
    }
  };

  const handleGenerateRoadmap = async () => {
    if (!genTargetRole.trim()) return;
    setIsSubmitting(true);
    setActionError(null);

    const currentSkills = genCurrentSkills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const skillGaps = genSkillGaps
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const objectives = genObjectives
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      const res = await roadmapApi.generateRoadmap({
        target_role: genTargetRole.trim(),
        current_skills: currentSkills,
        skill_gaps: skillGaps,
        weekly_hours: parseInt(genWeeklyHours, 10) || 10,
        learning_objectives: objectives,
      });

      if (res.success && res.data.roadmap) {
        queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
        setSelectedRoadmapId(res.data.roadmap.id);
        setIsGenerateDialogOpen(false);
      }
    } catch {
      setActionError('Failed to generate AI roadmap. Please verify parameters and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCustomMilestone = async () => {
    if (!activeRoadmapId || !msTitle.trim()) return;
    setIsSubmitting(true);
    try {
      const weeklyTasks = msTasksText
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await roadmapApi.addCustomMilestone(activeRoadmapId, {
        title: msTitle.trim(),
        description: msDescription.trim() || undefined,
        estimated_duration: msDuration.trim() || undefined,
        priority: msPriority,
        weekly_tasks: weeklyTasks,
      });

      if (res.success && res.data.milestone) {
        queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
        setIsAddMilestoneDialogOpen(false);
        setMsTitle('');
        setMsDescription('');
        setMsTasksText('');
      }
    } catch {
      setActionError('Failed to add custom milestone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoadmap = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this learning roadmap?')) return;
    try {
      await roadmapApi.deleteRoadmap(id);
      queryClient.invalidateQueries({ queryKey: ['roadmaps'] });
      if (selectedRoadmapId === id) {
        setSelectedRoadmapId(null);
      }
    } catch {
      setActionError('Failed to delete roadmap.');
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <AppBadge label="High Priority" color="error" size="small" variant="subtle" />;
      case 'medium':
        return <AppBadge label="Medium Priority" color="warning" size="small" variant="subtle" />;
      case 'low':
      default:
        return <AppBadge label="Low Priority" color="neutral" size="small" variant="subtle" />;
    }
  };

  const totalMilestones = activeRoadmap?.milestones?.length || 0;
  const completedMilestones =
    activeRoadmap?.milestones?.filter((m) => m.is_completed).length || 0;
  const progressPercent = activeRoadmap?.completion_pct ?? 0;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        title="Personalized Learning Roadmap"
        subtitle="Actionable, milestone-driven technical curricula generated from your verified skills and target ambitions."
        breadcrumbs={[{ label: 'Career Management' }, { label: 'Learning Roadmap' }]}
        badge={
          activeRoadmap ? (
            <AppBadge label={activeRoadmap.target_role} color="primary" variant="subtle" />
          ) : undefined
        }
        actions={
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <AppButton
              variant="secondary"
              leftIcon={<Sparkles size={16} />}
              onClick={() => setIsGenerateDialogOpen(true)}
            >
              Generate AI Roadmap
            </AppButton>
            {activeRoadmap && (
              <AppButton
                variant="primary"
                leftIcon={<Plus size={16} />}
                onClick={() => setIsAddMilestoneDialogOpen(true)}
              >
                Add Custom Milestone
              </AppButton>
            )}
          </Box>
        }
      />

      {error && (
        <Alert severity="error" onClose={() => setActionError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <AppSkeleton variant="card" height={120} />
          <AppSkeleton variant="card" height={220} />
          <AppSkeleton variant="card" height={220} />
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && roadmaps.length === 0 && (
        <AppCard>
          <AppEmptyState
            title="No Learning Roadmaps Yet"
            description="Accelerate your career trajectory with a tailor-made roadmap targeting your desired engineering role."
            actionLabel="Generate Your First Roadmap"
            onAction={() => setIsGenerateDialogOpen(true)}
          />
        </AppCard>
      )}

      {/* Content when roadmaps exist */}
      {!isLoading && activeRoadmap && (
        <>
          {/* Roadmap Selector Tabs / Switcher if multiple */}
          {roadmaps.length > 1 && (
            <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', pb: 0.5 }}>
              {roadmaps.map((r) => (
                <Chip
                  key={r.id}
                  label={r.title || r.target_role}
                  color={r.id === activeRoadmapId ? 'primary' : 'default'}
                  onClick={() => setSelectedRoadmapId(r.id)}
                  clickable
                  sx={{ fontWeight: r.id === activeRoadmapId ? 700 : 500 }}
                />
              ))}
            </Box>
          )}

          {/* Progress Overview Card */}
          <AppCard>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {activeRoadmap.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {completedMilestones} of {totalMilestones} milestones completed ({progressPercent}%)
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progressPercent}
                  color="primary"
                  sx={{ height: 10, borderRadius: 1.5, mb: 1.5 }}
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Target size={15} color="#6366f1" />
                    <Typography variant="caption" color="text.secondary">
                      Target: <strong>{activeRoadmap.target_role}</strong>
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                    <Clock size={15} color="#6366f1" />
                    <Typography variant="caption" color="text.secondary">
                      Dedication: <strong>{activeRoadmap.weekly_hours} hrs/week</strong>
                    </Typography>
                  </Box>
                  {activeRoadmap.learning_objectives && activeRoadmap.learning_objectives.length > 0 && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      <CheckCircle2 size={15} color="#10b981" />
                      <Typography variant="caption" color="text.secondary">
                        {activeRoadmap.learning_objectives.length} Core Objectives
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Grid>

              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  display: 'flex',
                  justifyContent: { xs: 'flex-start', md: 'flex-end' },
                  alignItems: 'center',
                  gap: 1.5,
                }}
              >
                <AppBadge
                  label={`${totalMilestones - completedMilestones} remaining`}
                  color="secondary"
                  variant="subtle"
                />
                <Tooltip title="Delete Roadmap">
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteRoadmap(activeRoadmap.id)}
                    sx={{ color: 'error.main' }}
                    aria-label="Delete roadmap"
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </Tooltip>
              </Grid>
            </Grid>
          </AppCard>

          {/* Milestones List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {activeRoadmap.milestones.map((milestone: RoadmapMilestone) => (
              <AppCard
                key={milestone.id}
                title={milestone.title}
                subtitle={milestone.description || undefined}
                action={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    {getPriorityBadge(milestone.priority)}
                    {milestone.estimated_duration && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Calendar size={14} color="#6366f1" />
                        <Typography variant="caption" fontWeight={700} color="primary.main">
                          {milestone.estimated_duration}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                }
              >
                {/* Milestone completion checkbox header */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.25,
                    borderRadius: 2,
                    bgcolor: milestone.is_completed ? 'success.light' : 'action.hover',
                    color: milestone.is_completed ? 'success.dark' : 'text.primary',
                    mb: 2,
                    transition: 'all 150ms ease',
                  }}
                >
                  <Checkbox
                    checked={milestone.is_completed}
                    onChange={() => handleToggleMilestone(milestone.id, milestone.is_completed)}
                    color="primary"
                    inputProps={{ 'aria-label': `Toggle ${milestone.title}` }}
                  />
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    sx={{
                      textDecoration: milestone.is_completed ? 'line-through' : 'none',
                    }}
                  >
                    {milestone.is_completed ? 'Milestone Completed' : 'Mark Milestone as Completed'}
                  </Typography>
                  {milestone.completed_at && (
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
                      Completed {new Date(milestone.completed_at).toLocaleDateString()}
                    </Typography>
                  )}
                </Box>

                {/* Weekly tasks breakdown */}
                {milestone.weekly_tasks && milestone.weekly_tasks.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography
                      variant="caption"
                      fontWeight={700}
                      color="text.secondary"
                      sx={{ textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1 }}
                    >
                      Weekly Tasks & Deliverables
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                      {milestone.weekly_tasks.map((task, idx) => (
                        <Paper
                          key={idx}
                          variant="outlined"
                          sx={{
                            p: 1.25,
                            borderRadius: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            bgcolor: milestone.is_completed ? 'action.hover' : 'background.paper',
                          }}
                        >
                          <Box
                            sx={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              bgcolor: milestone.is_completed ? 'success.main' : 'primary.main',
                              flexShrink: 0,
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: milestone.is_completed ? 'line-through' : 'none',
                              color: milestone.is_completed ? 'text.secondary' : 'text.primary',
                            }}
                          >
                            {task}
                          </Typography>
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Verified Learning Resources */}
                {milestone.resources && milestone.resources.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Divider sx={{ mb: 1.5 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <BookOpen size={15} color="#6366f1" />
                      <Typography
                        variant="caption"
                        fontWeight={700}
                        color="text.secondary"
                        sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}
                      >
                        Curated Learning Resources ({milestone.resources.length})
                      </Typography>
                    </Box>

                    <Grid container spacing={1.5}>
                      {milestone.resources.map((res) => (
                        <Grid item xs={12} sm={6} key={res.id}>
                          <Paper
                            variant="outlined"
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              bgcolor: 'background.default',
                            }}
                          >
                            <Box>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Chip
                                  label={res.resource_type || 'Resource'}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                  sx={{ height: 20, fontSize: '0.68rem', fontWeight: 600 }}
                                />
                                {res.is_verified && (
                                  <AppBadge label="Verified" color="success" size="small" variant="subtle" />
                                )}
                                {res.difficulty && (
                                  <Typography variant="caption" color="text.secondary">
                                    {res.difficulty}
                                  </Typography>
                                )}
                              </Box>

                              <Typography variant="subtitle2" fontWeight={700}>
                                {res.title}
                              </Typography>
                              {res.description && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  fontSize="0.78rem"
                                  sx={{ mt: 0.5 }}
                                >
                                  {res.description}
                                </Typography>
                              )}
                            </Box>

                            <Box sx={{ pt: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                              {res.estimated_duration && (
                                <Typography variant="caption" color="text.secondary">
                                  {res.estimated_duration}
                                </Typography>
                              )}
                              <Link
                                href={res.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  fontSize: '0.75rem',
                                  fontWeight: 600,
                                  color: 'primary.main',
                                  textDecoration: 'none',
                                  '&:hover': { textDecoration: 'underline' },
                                }}
                              >
                                Open Resource <ExternalLink size={12} />
                              </Link>
                            </Box>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}
              </AppCard>
            ))}
          </Box>
        </>
      )}

      {/* Generate AI Roadmap Dialog */}
      <AppDialog
        open={isGenerateDialogOpen}
        onClose={() => !isSubmitting && setIsGenerateDialogOpen(false)}
        title="Generate AI Learning Roadmap"
        description="Provide your career target and current skill profile to generate a structured, verifiable sprint curriculum."
        actions={
          <>
            <AppButton
              variant="ghost"
              onClick={() => setIsGenerateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleGenerateRoadmap}
              isLoading={isSubmitting}
              leftIcon={<Sparkles size={16} />}
            >
              Generate Curriculum
            </AppButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <AppInput
            label="Target Job Role"
            placeholder="e.g. Senior Full-Stack Engineer, Staff Architect"
            value={genTargetRole}
            onChange={(e) => setGenTargetRole(e.target.value)}
            isRequired
          />

          <AppInput
            label="Current Skills (comma-separated)"
            placeholder="e.g. React, TypeScript, Node.js, SQL"
            value={genCurrentSkills}
            onChange={(e) => setGenCurrentSkills(e.target.value)}
            isRequired
          />

          <AppInput
            label="Identified Skill Gaps (comma-separated)"
            placeholder="e.g. System Design, Kubernetes, GraphQL"
            value={genSkillGaps}
            onChange={(e) => setGenSkillGaps(e.target.value)}
            isRequired
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <AppInput
                label="Weekly Dedication (Hours)"
                type="number"
                placeholder="10"
                value={genWeeklyHours}
                onChange={(e) => setGenWeeklyHours(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AppInput
                label="Primary Objective"
                placeholder="e.g. Pass FAANG System Design"
                value={genObjectives}
                onChange={(e) => setGenObjectives(e.target.value)}
              />
            </Grid>
          </Grid>
        </Box>
      </AppDialog>

      {/* Add Custom Milestone Dialog */}
      <AppDialog
        open={isAddMilestoneDialogOpen}
        onClose={() => !isSubmitting && setIsAddMilestoneDialogOpen(false)}
        title="Add Custom Milestone"
        description="Insert an independent milestone or deliverable into this active learning roadmap."
        actions={
          <>
            <AppButton
              variant="ghost"
              onClick={() => setIsAddMilestoneDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleAddCustomMilestone}
              isLoading={isSubmitting}
            >
              Save Milestone
            </AppButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <AppInput
            label="Milestone Title"
            placeholder="e.g. Master Micro-Frontend Architecture"
            value={msTitle}
            onChange={(e) => setMsTitle(e.target.value)}
            isRequired
          />

          <AppInput
            label="Description / Context"
            placeholder="Brief scope of what this milestone covers"
            value={msDescription}
            onChange={(e) => setMsDescription(e.target.value)}
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <AppInput
                label="Estimated Duration"
                placeholder="e.g. 2 weeks"
                value={msDuration}
                onChange={(e) => setMsDuration(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <AppSelect
                label="Priority Tier"
                value={msPriority}
                onChange={(e) => setMsPriority(e.target.value as string)}
                options={[
                  { value: 'high', label: 'High Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'low', label: 'Low Priority' },
                ]}
              />
            </Grid>
          </Grid>

          <AppTextarea
            label="Weekly Tasks (one item per line)"
            placeholder="Task 1: Read Module Federation documentation&#10;Task 2: Build sample host and remote container&#10;Task 3: Implement shared design tokens"
            value={msTasksText}
            onChange={(e) => setMsTasksText(e.target.value)}
            rows={4}
          />
        </Box>
      </AppDialog>
    </Box>
  );
};
