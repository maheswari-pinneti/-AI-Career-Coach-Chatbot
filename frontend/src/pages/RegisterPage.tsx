import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  Grid,
  useTheme,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Briefcase, Sparkles } from 'lucide-react';
import { AppButton } from '../components/common/AppButton';
import { AppInput } from '../components/common/AppInput';
import { useAppDispatch } from '../store/hooks';
import { setCredentials } from '../store/slices/authSlice';
import { authApi } from '../api/authApi';

export const RegisterPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.register({
        email,
        password,
        first_name: firstName.trim() || undefined,
        last_name: lastName.trim() || undefined,
        target_role: targetRole.trim() || undefined,
      });

      dispatch(
        setCredentials({
          user: response.user,
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
        })
      );
      navigate('/', { replace: true });
    } catch (err: unknown) {
      const errorObj = err as { message?: string; data?: { message?: string } };
      setErrorMessage(
        errorObj.data?.message ||
          errorObj.message ||
          'Registration failed. Please check your inputs.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
        py: 4,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 500,
          p: { xs: 3, sm: 4.5 },
          borderRadius: 3,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          boxShadow:
            theme.palette.mode === 'dark'
              ? '0 8px 32px rgba(0, 0, 0, 0.4)'
              : '0 8px 30px rgba(0, 0, 0, 0.06)',
        }}
      >
        {/* Brand Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
            }}
          >
            <Sparkles size={22} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              AI Career Coach
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Intelligent Career Progression SaaS
            </Typography>
          </Box>
        </Box>

        <Typography variant="h5" fontWeight={700} gutterBottom>
          Create Your Career Account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Accelerate your trajectory with AI-driven skill maps, ATS resume audits, and mock interview engines.
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
            {errorMessage}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <AppInput
                  label="First Name"
                  placeholder="Alex"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  fullWidth
                  startAdornment={
                    <InputAdornment position="start">
                      <User size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <AppInput
                  label="Last Name"
                  placeholder="Chen"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  fullWidth
                />
              </Grid>
            </Grid>

            <AppInput
              label="Work Email"
              type="email"
              placeholder="alex.chen@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              fullWidth
              startAdornment={
                <InputAdornment position="start">
                  <Mail size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              }
            />

            <AppInput
              label="Target Role / Ambition"
              placeholder="e.g. Lead Full-Stack Architect"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              fullWidth
              startAdornment={
                <InputAdornment position="start">
                  <Briefcase size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              }
            />

            <AppInput
              label="Password (min 8 characters)"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              fullWidth
              startAdornment={
                <InputAdornment position="start">
                  <Lock size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              }
              endAdornment={
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </IconButton>
                </InputAdornment>
              }
            />

            <AppInput
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              startAdornment={
                <InputAdornment position="start">
                  <Lock size={18} color={theme.palette.text.secondary} />
                </InputAdornment>
              }
            />

            <AppButton
              type="submit"
              variant="primary"
              fullWidth
              size="large"
              isLoading={isLoading}
              sx={{ mt: 1 }}
            >
              Create Account & Launch Workspace
            </AppButton>
          </Box>
        </form>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Typography
              component={RouterLink}
              to="/login"
              variant="body2"
              sx={{
                color: 'primary.main',
                textDecoration: 'none',
                fontWeight: 600,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              Sign in here
            </Typography>
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
