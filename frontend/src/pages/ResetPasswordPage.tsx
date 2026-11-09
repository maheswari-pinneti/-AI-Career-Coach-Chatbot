import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  IconButton,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom';
import { Eye, EyeOff, Lock, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react';
import { AppButton } from '../components/common/AppButton';
import { AppInput } from '../components/common/AppInput';
import { authApi } from '../api/authApi';

export const ResetPasswordPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [token, setToken] = useState(() => searchParams.get('token') || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('A valid reset token is required.');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('New password must be at least 8 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword({ token, new_password: newPassword });
      setIsSuccess(true);
    } catch (err: unknown) {
      const errorObj = err as { message?: string; data?: { message?: string } };
      setErrorMessage(
        errorObj.data?.message ||
          errorObj.message ||
          'Password reset failed. The token may have expired or already been used.'
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
          maxWidth: 440,
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
            <KeyRound size={22} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={700} lineHeight={1.2}>
              Create New Password
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI Career Coach
            </Typography>
          </Box>
        </Box>

        {isSuccess ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'success.main' }}>
              <CheckCircle2 size={28} />
              <Typography variant="h6" fontWeight={700}>
                Password Reset Successfully
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Your password has been securely updated. You can now sign in with your new credentials.
            </Typography>

            <AppButton
              variant="primary"
              fullWidth
              size="large"
              onClick={() => navigate('/login')}
              rightIcon={<ArrowRight size={16} />}
            >
              Sign In to Your Workspace
            </AppButton>
          </Box>
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Reset Password
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter the recovery token received along with your new secure password.
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AppInput
                  label="Reset Token"
                  placeholder="Paste one-time reset token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  required
                  fullWidth
                  startAdornment={
                    <InputAdornment position="start">
                      <KeyRound size={18} color={theme.palette.text.secondary} />
                    </InputAdornment>
                  }
                />

                <AppInput
                  label="New Password (min 8 characters)"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
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
                  label="Confirm New Password"
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
                  Set New Password
                </AppButton>
              </Box>
            </form>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ textAlign: 'center' }}>
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
                Back to sign in
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};
