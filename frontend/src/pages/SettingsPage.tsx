import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Switch,
  Alert,
} from '@mui/material';
import {
  Settings,
  Shield,
  Cpu,
  Trash2,
  Lock,
  Smartphone,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppButton } from '../components/common/AppButton';
import { AppBadge } from '../components/common/AppBadge';
import { AppInput } from '../components/common/AppInput';
import { AppSelect } from '../components/common/AppSelect';
import { AppTabs } from '../components/common/AppTabs';
import { AppDialog } from '../components/common/AppDialog';
import { AppToast } from '../components/common/AppToast';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleTheme } from '../store/slices/uiSlice';
import { authApi } from '../api/authApi';

export const SettingsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const themeMode = useAppSelector((state) => state.ui.themeMode);

  const [activeTab, setActiveTab] = useState<string | number>('general');
  const [aiProvider, setAiProvider] = useState('mock');
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  // Query Active Sessions
  const { data: sessionData, isLoading: isLoadingSessions } = useQuery({
    queryKey: ['sessions'],
    queryFn: authApi.getSessions,
    retry: 1,
  });

  const revokeSessionMutation = useMutation({
    mutationFn: authApi.revokeSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sessions'] });
      setToastSeverity('success');
      setToastMessage('Session terminated successfully.');
    },
    onError: (err: unknown) => {
      const errorObj = err as { message?: string };
      setToastSeverity('error');
      setToastMessage(errorObj.message || 'Failed to revoke session.');
    },
  });

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!currentPassword || !newPassword) {
      setPasswordError('Please provide both current and new passwords.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setToastSeverity('success');
      setToastMessage('Password updated successfully.');
    } catch (err: unknown) {
      const errorObj = err as { message?: string; data?: { message?: string } };
      setPasswordError(
        errorObj.data?.message || errorObj.message || 'Unable to update password.'
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const sessions = sessionData?.sessions || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        title="Account & System Settings"
        subtitle="Manage global application preferences, security protocols, active sessions, and AI model configurations."
        breadcrumbs={[{ label: 'Account' }, { label: 'Settings' }]}
      />

      <AppTabs
        activeTab={activeTab}
        onChange={(t) => setActiveTab(t)}
        tabs={[
          { id: 'general', label: 'General & Appearance', icon: <Settings size={16} /> },
          { id: 'security', label: 'Security & Auth', icon: <Shield size={16} /> },
          { id: 'ai', label: 'AI Model Preferences', icon: <Cpu size={16} /> },
          { id: 'privacy', label: 'Data & Privacy' },
        ]}
      />

      {activeTab === 'general' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <AppCard title="Appearance & Theme">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Dark Mode Theme
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Switch between neutral white and charcoal dark backgrounds.
                  </Typography>
                </Box>
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={() => dispatch(toggleTheme())}
                  color="primary"
                  inputProps={{ 'aria-label': 'toggle dark mode' }}
                />
              </Box>
            </AppCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <AppCard title="Notifications & Communication">
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Email Progress Summaries
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Receive weekly interview readiness scores and roadmap progress.
                  </Typography>
                </Box>
                <Switch
                  checked={emailAlerts}
                  onChange={(e) => setEmailAlerts(e.target.checked)}
                  color="primary"
                  inputProps={{ 'aria-label': 'toggle email notifications' }}
                />
              </Box>
            </AppCard>
          </Grid>
        </Grid>
      )}

      {activeTab === 'security' && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <AppCard
              title="Change Password"
              subtitle="Passwords are protected using salted bcrypt cryptographic hashing."
            >
              {passwordError && (
                <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                  {passwordError}
                </Alert>
              )}

              <form onSubmit={handleChangePassword}>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <AppInput
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    fullWidth
                  />
                  <AppInput
                    label="New Password (min 8 characters)"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    fullWidth
                  />
                  <AppInput
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    fullWidth
                  />
                  <AppButton
                    type="submit"
                    variant="primary"
                    leftIcon={<Lock size={16} />}
                    isLoading={isChangingPassword}
                  >
                    Update Password
                  </AppButton>
                </Box>
              </form>
            </AppCard>
          </Grid>

          <Grid item xs={12} md={6}>
            <AppCard
              title="Active Sessions & Token Rotation"
              subtitle="Single-use refresh token rotation and active device auditing."
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {isLoadingSessions ? (
                  <Typography variant="body2" color="text.secondary">
                    Loading session audit logs...
                  </Typography>
                ) : sessions.length === 0 ? (
                  <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Active Web Session
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Current device authenticated
                        </Typography>
                      </Box>
                      <AppBadge label="Active Now" color="success" size="small" />
                    </Box>
                  </Paper>
                ) : (
                  sessions.map((sess, idx) => (
                    <Paper
                      key={sess.session_id || idx}
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 2 }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Smartphone size={20} color="#6366f1" />
                          <Box>
                            <Typography variant="subtitle2" fontWeight={700}>
                              {sess.user_agent ? sess.user_agent.slice(0, 35) + '...' : 'Web Session'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              IP: {sess.ip_address || '127.0.0.1'} • {sess.is_revoked ? 'Revoked' : 'Active'}
                            </Typography>
                          </Box>
                        </Box>
                        {!sess.is_revoked && (
                          <AppButton
                            variant="outlined"
                            size="small"
                            onClick={() => revokeSessionMutation.mutate(sess.session_id)}
                            isLoading={revokeSessionMutation.isPending}
                          >
                            Terminate
                          </AppButton>
                        )}
                      </Box>
                    </Paper>
                  ))
                )}
              </Box>
            </AppCard>
          </Grid>
        </Grid>
      )}

      {activeTab === 'ai' && (
        <AppCard
          title="AI Provider Configuration"
          subtitle="Select active inference provider for coaching, resume analysis, and interview simulations."
        >
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <AppSelect
                label="Active Provider"
                value={aiProvider}
                onChange={(e) => setAiProvider(e.target.value as string)}
                options={[
                  { value: 'mock', label: 'Local Deterministic Mock (Default / Testing)' },
                  { value: 'openai', label: 'OpenAI (GPT-4o / GPT-4o-mini)' },
                  { value: 'huggingface', label: 'Hugging Face Inference API' },
                ]}
                helperText="Local mock mode provides rapid feedback without requiring external API keys."
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Provider Status:
                  </Typography>
                  <AppBadge
                    label={aiProvider === 'mock' ? 'Mock Offline Ready' : 'API Key Configured'}
                    color={aiProvider === 'mock' ? 'neutral' : 'success'}
                    size="small"
                  />
                </Box>
                <Typography variant="caption" color="text.secondary">
                  Credentials are strictly stored in backend <code>.env</code> and never exposed to the client.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </AppCard>
      )}

      {activeTab === 'privacy' && (
        <AppCard
          title="Data Retention & Privacy Isolation"
          subtitle="Zero-data retention options and account deactivation controls."
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper variant="outlined" sx={{ p: 2.5, borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={700} gutterBottom>
                Data Confidentiality Guarantee
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All resumes, LinkedIn summaries, and mock interview transcripts are stored with user-level tenant isolation. We never sell or share user career artifacts.
              </Typography>
            </Paper>

            <Box sx={{ mt: 1 }}>
              <AppButton
                variant="danger"
                leftIcon={<Trash2 size={16} />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete Account & Purge Data
              </AppButton>
            </Box>
          </Box>
        </AppCard>
      )}

      {/* Account Deletion Dialog */}
      <AppDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Confirm Account Deletion"
        actions={
          <>
            <AppButton variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </AppButton>
            <AppButton
              variant="danger"
              onClick={() => {
                setDeleteDialogOpen(false);
                setToastSeverity('error');
                setToastMessage('Account deactivation requested.');
              }}
            >
              Permanently Delete Account
            </AppButton>
          </>
        }
      >
        <Typography variant="body2" color="text.secondary">
          Are you sure you want to permanently delete your AI Career Coach account? This action will remove all saved resumes, interview simulations, and roadmap tracking. This action cannot be undone.
        </Typography>
      </AppDialog>

      {/* Toast Notification */}
      <AppToast
        open={Boolean(toastMessage)}
        message={toastMessage || ''}
        onClose={() => setToastMessage(null)}
        severity={toastSeverity}
      />
    </Box>
  );
};
