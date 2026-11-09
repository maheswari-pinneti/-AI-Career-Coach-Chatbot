import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Grid,
  Paper,
  Alert,
  Chip,
  MenuItem,
  Menu,
} from '@mui/material';
import {
  Plus,
  Trash2,
  Building,
  Kanban,
  Table as TableIcon,
  Calendar,
  ExternalLink,
  History,
  Clock,
  MoreVertical,
  Edit2,
  DollarSign,
  MapPin,
} from 'lucide-react';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { AppTable, Column } from '../components/common/AppTable';
import { AppSearch } from '../components/common/AppSearch';
import { AppFilter } from '../components/common/AppFilter';
import { AppDialog } from '../components/common/AppDialog';
import { AppInput } from '../components/common/AppInput';
import { AppSelect } from '../components/common/AppSelect';
import { AppTextarea } from '../components/common/AppTextarea';
import { AppSkeleton } from '../components/common/AppSkeleton';
import { AppEmptyState } from '../components/common/AppEmptyState';
import { jobsApi } from '../api/jobsApi';
import { JobApplication, JobStatus, CreateJobRequest } from '../types/job';

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; color: 'neutral' | 'secondary' | 'warning' | 'primary' | 'success' | 'error' }
> = {
  interested: { label: 'Interested', color: 'neutral' },
  applied: { label: 'Applied', color: 'secondary' },
  assessment: { label: 'Assessment', color: 'warning' },
  interview: { label: 'Interview', color: 'primary' },
  offer: { label: 'Offer', color: 'success' },
  rejected: { label: 'Rejected', color: 'error' },
  withdrawn: { label: 'Withdrawn', color: 'neutral' },
};

const ALL_STATUSES: JobStatus[] = [
  'interested',
  'applied',
  'assessment',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
];

export const JobTrackerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [actionError, setActionError] = useState<string | null>(null);

  const { data: jobsData, isLoading, error: queryError } = useQuery({
    queryKey: ['jobs'],
    queryFn: () => jobsApi.getJobs({ per_page: 100 }),
  });

  const jobs = jobsData?.data?.items || [];
  const error = actionError || (queryError ? 'Failed to load job applications.' : null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  // Dialog & Modal States
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApplication | null>(null);
  const [historyJob, setHistoryJob] = useState<JobApplication | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formCompany, setFormCompany] = useState('');
  const [formRole, setFormRole] = useState('');
  const [formLocation, setFormLocation] = useState('Remote');
  const [formEmploymentType, setFormEmploymentType] = useState('Full-time');
  const [formSalary, setFormSalary] = useState('');
  const [formStatus, setFormStatus] = useState<JobStatus>('applied');
  const [formJobUrl, setFormJobUrl] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formAppDate, setFormAppDate] = useState(new Date().toISOString().split('T')[0]);
  const [formFollowUpDate, setFormFollowUpDate] = useState('');
  const [formNotes, setFormNotes] = useState('');

  // Status transition action menu
  const [actionMenuAnchor, setActionMenuAnchor] = useState<null | HTMLElement>(null);
  const [selectedActionJob, setSelectedActionJob] = useState<JobApplication | null>(null);

  const openCreateDialog = () => {
    setEditingJob(null);
    setFormCompany('');
    setFormRole('');
    setFormLocation('Remote');
    setFormEmploymentType('Full-time');
    setFormSalary('');
    setFormStatus('applied');
    setFormJobUrl('');
    setFormDescription('');
    setFormAppDate(new Date().toISOString().split('T')[0]);
    setFormFollowUpDate('');
    setFormNotes('');
    setIsCreateDialogOpen(true);
  };

  const openEditDialog = (job: JobApplication) => {
    setEditingJob(job);
    setFormCompany(job.company);
    setFormRole(job.job_title);
    setFormLocation(job.location || '');
    setFormEmploymentType(job.employment_type || 'Full-time');
    setFormSalary(job.salary_range || '');
    setFormStatus(job.status);
    setFormJobUrl(job.job_url || '');
    setFormDescription(job.job_description || '');
    setFormAppDate(job.application_date || '');
    setFormFollowUpDate(job.follow_up_date || '');
    setFormNotes(job.notes || '');
    setIsCreateDialogOpen(true);
  };

  const handleSaveJob = async () => {
    if (!formCompany.trim() || !formRole.trim()) return;
    setIsSubmitting(true);
    setActionError(null);

    const payload: CreateJobRequest = {
      company: formCompany.trim(),
      job_title: formRole.trim(),
      location: formLocation.trim() || undefined,
      employment_type: formEmploymentType.trim() || undefined,
      salary_range: formSalary.trim() || undefined,
      status: formStatus,
      job_url: formJobUrl.trim() || undefined,
      job_description: formDescription.trim() || undefined,
      application_date: formAppDate || undefined,
      follow_up_date: formFollowUpDate || undefined,
      notes: formNotes.trim() || undefined,
    };

    try {
      if (editingJob) {
        await jobsApi.updateJob(editingJob.id, payload);
      } else {
        await jobsApi.createJob(payload);
      }
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setIsCreateDialogOpen(false);
    } catch {
      setActionError('Failed to save job application.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (jobId: number, newStatus: JobStatus) => {
    setActionMenuAnchor(null);
    try {
      await jobsApi.updateStatus(jobId, newStatus);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch {
      setActionError('Failed to update stage.');
    }
  };

  const handleDeleteJob = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      await jobsApi.deleteJob(id);
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    } catch {
      setActionError('Failed to delete job application.');
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (job.location && job.location.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(job.status);
    return matchesSearch && matchesStatus;
  });

  // Identify follow-up reminders
  const todayStr = new Date().toISOString().split('T')[0];
  const upcomingReminders = jobs.filter(
    (j) => j.follow_up_date && j.follow_up_date >= todayStr && j.status !== 'rejected' && j.status !== 'withdrawn'
  );

  const getStatusBadge = (status: JobStatus) => {
    const config = STATUS_CONFIG[status] || { label: status, color: 'neutral' };
    return <AppBadge label={config.label} color={config.color} size="small" dot />;
  };

  const columns: Column<JobApplication>[] = [
    {
      id: 'company',
      label: 'Company & Role',
      render: (row) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
              color: 'text.secondary',
              display: 'flex',
            }}
          >
            <Building size={18} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {row.company}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
              {row.job_title}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: 'status',
      label: 'Stage',
      render: (row) => getStatusBadge(row.status),
    },
    {
      id: 'location',
      label: 'Location & Type',
      render: (row) => (
        <Box>
          <Typography variant="body2" color="text.primary" fontSize="0.85rem">
            {row.location || 'Remote'}
          </Typography>
          {row.employment_type && (
            <Typography variant="caption" color="text.secondary">
              {row.employment_type}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'salary_range',
      label: 'Compensation',
      render: (row) => (
        <Typography variant="body2" fontWeight={600}>
          {row.salary_range || 'Not disclosed'}
        </Typography>
      ),
    },
    {
      id: 'application_date',
      label: 'Dates',
      render: (row) => (
        <Box>
          {row.application_date && (
            <Typography variant="caption" color="text.secondary" display="block">
              Applied: {row.application_date}
            </Typography>
          )}
          {row.follow_up_date && (
            <Typography variant="caption" color="warning.main" fontWeight={600} display="block">
              Follow-up: {row.follow_up_date}
            </Typography>
          )}
        </Box>
      ),
    },
    {
      id: 'actions',
      label: '',
      align: 'right',
      render: (row) => (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
          <Tooltip title="Status Audit Log">
            <IconButton
              size="small"
              onClick={() => setHistoryJob(row)}
              sx={{ color: 'text.secondary' }}
              aria-label="view history"
            >
              <History size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit Job">
            <IconButton
              size="small"
              onClick={() => openEditDialog(row)}
              sx={{ color: 'text.secondary' }}
              aria-label="edit job"
            >
              <Edit2 size={16} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => handleDeleteJob(row.id)}
              sx={{ color: 'error.main' }}
              aria-label="delete job"
            >
              <Trash2 size={16} />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        title="Job Application Pipeline"
        subtitle="Manage and organize your active job search, interview stages, offer packages, and follow-up reminders."
        breadcrumbs={[{ label: 'Career Management' }, { label: 'Job Tracker' }]}
        badge={<AppBadge label={`${jobs.length} Tracked`} color="primary" variant="subtle" />}
        actions={
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box sx={{ display: 'flex', bgcolor: 'action.hover', borderRadius: 2, p: 0.5 }}>
              <IconButton
                size="small"
                color={viewMode === 'kanban' ? 'primary' : 'default'}
                onClick={() => setViewMode('kanban')}
                aria-label="Kanban view"
              >
                <Kanban size={18} />
              </IconButton>
              <IconButton
                size="small"
                color={viewMode === 'table' ? 'primary' : 'default'}
                onClick={() => setViewMode('table')}
                aria-label="Table view"
              >
                <TableIcon size={18} />
              </IconButton>
            </Box>

            <AppButton
              variant="primary"
              leftIcon={<Plus size={16} />}
              onClick={openCreateDialog}
            >
              Add Application
            </AppButton>
          </Box>
        }
      />

      {error && (
        <Alert severity="error" onClose={() => setActionError(null)}>
          {error}
        </Alert>
      )}

      {/* Follow-up Reminders Alert */}
      {upcomingReminders.length > 0 && (
        <Alert
          severity="info"
          icon={<Clock size={18} />}
          sx={{ borderRadius: 2.5 }}
        >
          <Typography variant="subtitle2" fontWeight={700}>
            {upcomingReminders.length} Pending Follow-up Reminders
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Upcoming follow-ups due:{' '}
            {upcomingReminders
              .map((j) => `${j.company} (${j.follow_up_date})`)
              .join(', ')}
          </Typography>
        </Alert>
      )}

      {/* Filter and Search Bar */}
      <AppCard>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
          }}
        >
          <AppSearch
            placeholder="Search by company, role, or location..."
            value={searchQuery}
            onSearchChange={(q) => setSearchQuery(q)}
          />

          <AppFilter
            label="Stage"
            options={ALL_STATUSES.map((s) => ({ id: s, label: STATUS_CONFIG[s].label }))}
            selectedIds={selectedStatuses}
            onSelect={(id) => {
              setSelectedStatuses((prev) =>
                prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
              );
            }}
            onClearAll={() => setSelectedStatuses([])}
          />
        </Box>
      </AppCard>

      {/* Loading Skeleton */}
      {isLoading && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <AppSkeleton variant="card" height={100} />
          <AppSkeleton variant="card" height={300} />
        </Box>
      )}

      {/* Empty State */}
      {!isLoading && jobs.length === 0 && (
        <AppCard>
          <AppEmptyState
            title="No Job Applications Added"
            description="Track your applications, interview schedules, recruiter contacts, and offers in one organized dashboard."
            actionLabel="Add Your First Application"
            onAction={openCreateDialog}
          />
        </AppCard>
      )}

      {/* Kanban Board View */}
      {!isLoading && jobs.length > 0 && viewMode === 'kanban' && (
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            pb: 2,
            minHeight: 520,
            alignItems: 'flex-start',
          }}
        >
          {ALL_STATUSES.map((status) => {
            const columnJobs = filteredJobs.filter((j) => j.status === status);
            const config = STATUS_CONFIG[status];

            return (
              <Box
                key={status}
                sx={{
                  flex: '0 0 280px',
                  minWidth: 280,
                  bgcolor: 'action.hover',
                  borderRadius: 2.5,
                  p: 1.5,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1.5,
                }}
              >
                {/* Column Header */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 0.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {config.label}
                    </Typography>
                    <Chip
                      label={columnJobs.length}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }}
                    />
                  </Box>
                </Box>

                {/* Column Cards */}
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
                  {columnJobs.length === 0 ? (
                    <Box
                      sx={{
                        p: 2.5,
                        textAlign: 'center',
                        border: '1px dashed',
                        borderColor: 'divider',
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        No applications in this stage
                      </Typography>
                    </Box>
                  ) : (
                    columnJobs.map((job) => (
                      <Paper
                        key={job.id}
                        elevation={0}
                        variant="outlined"
                        sx={{
                          p: 1.75,
                          borderRadius: 2,
                          bgcolor: 'background.paper',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 1,
                          transition: 'box-shadow 150ms ease, transform 150ms ease',
                          '&:hover': {
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                            transform: 'translateY(-2px)',
                          },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {job.company}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" fontSize="0.8rem">
                              {job.job_title}
                            </Typography>
                          </Box>

                          <IconButton
                            size="small"
                            onClick={(e) => {
                              setSelectedActionJob(job);
                              setActionMenuAnchor(e.currentTarget);
                            }}
                            aria-label="job actions"
                          >
                            <MoreVertical size={16} />
                          </IconButton>
                        </Box>

                        {/* Location and Salary */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                          {job.location && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <MapPin size={12} />
                              <span>{job.location}</span>
                            </Box>
                          )}
                          {job.salary_range && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <DollarSign size={12} />
                              <span>{job.salary_range}</span>
                            </Box>
                          )}
                          {job.application_date && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                              <Calendar size={12} />
                              <span>Applied: {job.application_date}</span>
                            </Box>
                          )}
                        </Box>

                        {/* Card Footer: Quick Actions */}
                        <Box
                          sx={{
                            pt: 1,
                            mt: 0.5,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          {job.job_url ? (
                            <Tooltip title="View Job Posting">
                              <IconButton
                                size="small"
                                component="a"
                                href={job.job_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                sx={{ color: 'primary.main', p: 0.5 }}
                              >
                                <ExternalLink size={14} />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Box />
                          )}

                          <Box sx={{ display: 'flex', gap: 0.5 }}>
                            <Tooltip title="Audit Trail">
                              <IconButton
                                size="small"
                                onClick={() => setHistoryJob(job)}
                                sx={{ color: 'text.secondary', p: 0.5 }}
                              >
                                <History size={14} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => openEditDialog(job)}
                                sx={{ color: 'text.secondary', p: 0.5 }}
                              >
                                <Edit2 size={14} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteJob(job.id)}
                                sx={{ color: 'error.main', p: 0.5 }}
                              >
                                <Trash2 size={14} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Paper>
                    ))
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      )}

      {/* Table View */}
      {!isLoading && jobs.length > 0 && viewMode === 'table' && (
        <AppTable
          columns={columns}
          data={filteredJobs}
          rowKey={(row) => row.id}
          emptyMessage="No job applications match your active search filters."
        />
      )}

      {/* Status Transition Menu */}
      <Menu
        anchorEl={actionMenuAnchor}
        open={Boolean(actionMenuAnchor)}
        onClose={() => setActionMenuAnchor(null)}
      >
        <MenuItem disabled sx={{ fontSize: '0.75rem', fontWeight: 700 }}>
          Move to Stage:
        </MenuItem>
        {ALL_STATUSES.map((status) => (
          <MenuItem
            key={status}
            selected={selectedActionJob?.status === status}
            onClick={() => {
              if (selectedActionJob) {
                handleStatusChange(selectedActionJob.id, status);
              }
            }}
          >
            {STATUS_CONFIG[status].label}
          </MenuItem>
        ))}
      </Menu>

      {/* Add / Edit Application Modal Dialog */}
      <AppDialog
        open={isCreateDialogOpen}
        onClose={() => !isSubmitting && setIsCreateDialogOpen(false)}
        title={editingJob ? 'Edit Job Application' : 'Add Job Application'}
        description="Record verified application metadata to monitor recruitment funnel progress."
        actions={
          <>
            <AppButton
              variant="ghost"
              onClick={() => setIsCreateDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </AppButton>
            <AppButton
              variant="primary"
              onClick={handleSaveJob}
              isLoading={isSubmitting}
            >
              {editingJob ? 'Save Changes' : 'Save Application'}
            </AppButton>
          </>
        }
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <AppInput
            label="Company Name"
            placeholder="e.g. OpenAI, Stripe, Google"
            value={formCompany}
            onChange={(e) => setFormCompany(e.target.value)}
            isRequired
          />

          <AppInput
            label="Role Title"
            placeholder="e.g. Staff Software Engineer"
            value={formRole}
            onChange={(e) => setFormRole(e.target.value)}
            isRequired
          />

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <AppInput
                label="Location / Work Mode"
                placeholder="e.g. Remote, San Francisco, Hybrid"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <AppSelect
                label="Employment Type"
                value={formEmploymentType}
                onChange={(e) => setFormEmploymentType(e.target.value as string)}
                options={[
                  { value: 'Full-time', label: 'Full-time' },
                  { value: 'Part-time', label: 'Part-time' },
                  { value: 'Contract', label: 'Contract' },
                  { value: 'Internship', label: 'Internship' },
                ]}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <AppInput
                label="Compensation / Salary"
                placeholder="e.g. $190,000 - $220,000"
                value={formSalary}
                onChange={(e) => setFormSalary(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <AppSelect
                label="Current Stage"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as JobStatus)}
                options={ALL_STATUSES.map((s) => ({
                  value: s,
                  label: STATUS_CONFIG[s].label,
                }))}
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <AppInput
                label="Application Date"
                type="date"
                value={formAppDate}
                onChange={(e) => setFormAppDate(e.target.value)}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <AppInput
                label="Follow-Up Reminder Date"
                type="date"
                value={formFollowUpDate}
                onChange={(e) => setFormFollowUpDate(e.target.value)}
              />
            </Grid>
          </Grid>

          <AppInput
            label="Job Posting URL"
            placeholder="https://jobs.company.com/position/123"
            value={formJobUrl}
            onChange={(e) => setFormJobUrl(e.target.value)}
          />

          <AppTextarea
            label="Job Description / Notes"
            placeholder="Key requirements, tech stack, notes from recruiters..."
            value={formNotes}
            onChange={(e) => setFormNotes(e.target.value)}
            rows={3}
          />
        </Box>
      </AppDialog>

      {/* Status History Audit Dialog */}
      <AppDialog
        open={Boolean(historyJob)}
        onClose={() => setHistoryJob(null)}
        title={`Status History: ${historyJob?.company}`}
        description="Chronological audit log of stage transitions and updates."
        actions={
          <AppButton variant="secondary" onClick={() => setHistoryJob(null)}>
            Close
          </AppButton>
        }
      >
        <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {historyJob?.status_history && historyJob.status_history.length > 0 ? (
            historyJob.status_history.map((hist) => (
              <Paper
                key={hist.id}
                variant="outlined"
                sx={{ p: 1.5, borderRadius: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" fontWeight={700}>
                    Transitioned from{' '}
                    <Chip
                      label={hist.previous_status}
                      size="small"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />{' '}
                    to{' '}
                    <Chip
                      label={hist.new_status}
                      size="small"
                      color="primary"
                      sx={{ height: 20, fontSize: '0.7rem' }}
                    />
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(hist.created_at).toLocaleString()}
                  </Typography>
                </Box>
                {hist.notes && (
                  <Typography variant="caption" color="text.secondary">
                    Note: {hist.notes}
                  </Typography>
                )}
              </Paper>
            ))
          ) : (
            <Typography variant="body2" color="text.secondary">
              No previous stage transitions recorded yet.
            </Typography>
          )}
        </Box>
      </AppDialog>
    </Box>
  );
};
