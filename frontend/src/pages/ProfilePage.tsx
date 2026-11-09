import React, { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Divider,
} from '@mui/material';
import {
  Save,
  Shield,
  Briefcase,
  MapPin,
  Building,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AppPageHeader } from '../components/common/AppPageHeader';
import { AppCard } from '../components/common/AppCard';
import { AppButton } from '../components/common/AppButton';
import { AppAvatar } from '../components/common/AppAvatar';
import { AppInput } from '../components/common/AppInput';
import { AppTextarea } from '../components/common/AppTextarea';
import { AppToast } from '../components/common/AppToast';
import { AppSkeleton } from '../components/common/AppSkeleton';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { updateUser } from '../store/slices/authSlice';
import { authApi } from '../api/authApi';
import { User, UserProfile } from '../types/auth';

interface ProfileFormProps {
  initialUser?: User | null;
  initialProfile?: UserProfile | null;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ initialUser, initialProfile }) => {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();

  const [firstName, setFirstName] = useState(initialUser?.first_name || '');
  const [lastName, setLastName] = useState(initialUser?.last_name || '');
  const [email] = useState(initialUser?.email || '');
  const [currentDesignation, setCurrentDesignation] = useState(initialProfile?.current_designation || '');
  const [currentCompany, setCurrentCompany] = useState(initialProfile?.current_company || '');
  const [totalExperience, setTotalExperience] = useState(
    String(initialProfile?.total_experience ?? 5.0)
  );
  const [targetRole, setTargetRole] = useState(initialProfile?.target_role || '');
  const [skills, setSkills] = useState(
    Array.isArray(initialProfile?.current_skills)
      ? initialProfile.current_skills.join(', ')
      : ''
  );
  const [bio, setBio] = useState(initialProfile?.career_objectives || '');
  const [location, setLocation] = useState(initialProfile?.location || '');
  const [portfolioUrl, setPortfolioUrl] = useState(initialProfile?.portfolio_url || '');
  const [githubUrl, setGithubUrl] = useState(initialProfile?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(initialProfile?.linkedin_url || '');

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const updateMutation = useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (res) => {
      dispatch(updateUser(res.user));
      queryClient.invalidateQueries({ queryKey: ['user-profile'] });
      setToastSeverity('success');
      setToastMessage('Profile details updated successfully!');
    },
    onError: (err: unknown) => {
      const errorObj = err as { message?: string };
      setToastSeverity('error');
      setToastMessage(errorObj.message || 'Failed to update profile.');
    },
  });

  const handleSave = () => {
    const skillsList = skills
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    updateMutation.mutate({
      first_name: firstName.trim() || undefined,
      last_name: lastName.trim() || undefined,
      current_designation: currentDesignation.trim() || undefined,
      current_company: currentCompany.trim() || undefined,
      total_experience: parseFloat(totalExperience) || 0,
      current_skills: skillsList,
      target_role: targetRole.trim() || undefined,
      career_objectives: bio.trim() || undefined,
      location: location.trim() || undefined,
      portfolio_url: portfolioUrl.trim() || undefined,
      github_url: githubUrl.trim() || undefined,
      linkedin_url: linkedinUrl.trim() || undefined,
    });
  };

  const displayName =
    [firstName, lastName].filter(Boolean).join(' ') ||
    initialUser?.email?.split('@')[0] ||
    'Professional';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <AppPageHeader
        title="My Profile & Career Architecture"
        subtitle="Manage your personal identity, target aspirations, verified skills, and career objective telemetry."
        breadcrumbs={[{ label: 'Account' }, { label: 'My Profile' }]}
        actions={
          <AppButton
            variant="primary"
            leftIcon={<Save size={16} />}
            onClick={handleSave}
            isLoading={updateMutation.isPending}
          >
            Save Changes
          </AppButton>
        }
      />

      <Grid container spacing={3}>
        {/* Left Column: Avatar & Summary Card */}
        <Grid item xs={12} md={4}>
          <AppCard>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                py: 2,
              }}
            >
              <AppAvatar name={displayName} size={84} status="online" sx={{ mb: 2 }} />
              <Typography variant="h6" fontWeight={700}>
                {displayName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {email}
              </Typography>

              <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                <Paper variant="outlined" sx={{ py: 0.5, px: 1.5, borderRadius: 1.5 }}>
                  <Typography variant="caption" fontWeight={600} color="primary.main">
                    Pro Member
                  </Typography>
                </Paper>
                <Paper variant="outlined" sx={{ py: 0.5, px: 1.5, borderRadius: 1.5 }}>
                  <Typography variant="caption" fontWeight={600} color="success.main">
                    Isolated Tenant
                  </Typography>
                </Paper>
              </Box>

              <Divider sx={{ my: 3, width: '100%' }} />

              <Box sx={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Briefcase size={16} color="#6366f1" />
                  <Typography variant="body2">
                    Target: <strong>{targetRole || 'Not specified'}</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Building size={16} color="#0ea5e9" />
                  <Typography variant="body2">
                    Company: <strong>{currentCompany || 'Not specified'}</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MapPin size={16} color="#10b981" />
                  <Typography variant="body2">
                    Location: <strong>{location || 'Remote / Unset'}</strong>
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Shield size={16} color="#8b5cf6" />
                  <Typography variant="body2">
                    Ownership: <strong>Owner Bound</strong>
                  </Typography>
                </Box>
              </Box>
            </Box>
          </AppCard>
        </Grid>

        {/* Right Column: Demographic Form */}
        <Grid item xs={12} md={8}>
          <AppCard title="Personal Information & Career Alignment">
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <AppInput
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  isRequired
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <AppInput
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  isRequired
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <AppInput
                  label="Primary Contact Email"
                  value={email}
                  disabled
                  helperText="Email is bound to your account identity."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <AppInput
                  label="Target Role Title"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Lead Staff Architect"
                  isRequired
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <AppInput
                  label="Current Designation"
                  value={currentDesignation}
                  onChange={(e) => setCurrentDesignation(e.target.value)}
                  placeholder="e.g. Senior Software Engineer"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <AppInput
                  label="Current Organization / Company"
                  value={currentCompany}
                  onChange={(e) => setCurrentCompany(e.target.value)}
                  placeholder="e.g. Acme Corp"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <AppInput
                  label="Total Experience (Years)"
                  type="number"
                  value={totalExperience}
                  onChange={(e) => setTotalExperience(e.target.value)}
                  placeholder="5.5"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <AppInput
                  label="Geographic Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. San Francisco, CA (or Remote)"
                />
              </Grid>

              <Grid item xs={12}>
                <AppInput
                  label="Current Skills (comma separated)"
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  placeholder="Python, React, TypeScript, System Design, Docker, GraphQL"
                  helperText="These skills seed your AI Skill Gap analysis."
                />
              </Grid>

              <Grid item xs={12}>
                <AppTextarea
                  label="Career Objectives & Executive Summary"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  minRows={3}
                  maxLength={500}
                  currentLength={bio.length}
                  helperText="This summary feeds directly into your AI interview coaching prompts."
                />
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ mt: 1, mb: 1.5 }}>
                  Professional Portfolios & Social Links
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4}>
                <AppInput
                  label="Portfolio Website"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://portfolio.dev"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <AppInput
                  label="GitHub Profile URL"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/alexchen"
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <AppInput
                  label="LinkedIn Profile URL"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/alexchen"
                />
              </Grid>
            </Grid>
          </AppCard>
        </Grid>
      </Grid>

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

export const ProfilePage: React.FC = () => {
  const currentUser = useAppSelector((state) => state.auth.user);

  const { data, isLoading } = useQuery({
    queryKey: ['user-profile'],
    queryFn: authApi.getProfile,
    retry: 1,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <AppPageHeader
          title="My Profile & Career Architecture"
          subtitle="Loading your synchronized profile..."
          breadcrumbs={[{ label: 'Account' }, { label: 'My Profile' }]}
        />
        <AppSkeleton variant="card" height={320} />
      </Box>
    );
  }

  const user = data?.user || currentUser;
  const profile = data?.profile || currentUser?.profile;

  return (
    <ProfileForm
      key={user?.id || 'profile-form'}
      initialUser={user}
      initialProfile={profile}
    />
  );
};
