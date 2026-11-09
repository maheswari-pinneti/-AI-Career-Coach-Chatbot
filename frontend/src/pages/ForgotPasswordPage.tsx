import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Divider,
  Alert,
  InputAdornment,
  useTheme,
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, KeyRound, CheckCircle2 } from 'lucide-react';
import { AppButton } from '../components/common/AppButton';
import { AppInput } from '../components/common/AppInput';
import { authApi } from '../api/authApi';

export const ForgotPasswordPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email) {
      setErrorMessage('Please provide your registered email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authApi.forgotPassword(email);
      setIsSubmitted(true);
      if (response.reset_token) {
        setResetToken(response.reset_token);
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string; data?: { message?: string } };
      setErrorMessage(
        errorObj.data?.message || errorObj.message || 'Unable to process password reset request.'
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
              Account Recovery
            </Typography>
            <Typography variant="caption" color="text.secondary">
              AI Career Coach
            </Typography>
          </Box>
        </Box>

        {isSubmitted ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, py: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, color: 'success.main' }}>
              <CheckCircle2 size={28} />
              <Typography variant="h6" fontWeight={700}>
                Reset Link Issued
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              If an account with <strong>{email}</strong> exists, password reset instructions have been dispatched.
            </Typography>

            {resetToken && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
                  border: `1px dashed ${theme.palette.primary.main}`,
                }}
              >
                <Typography variant="caption" fontWeight={700} color="primary.main" display="block" gutterBottom>
                  DEVELOPMENT RESET TOKEN
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    bgcolor: 'background.paper',
                    p: 1,
                    borderRadius: 1,
                    mb: 1.5,
                  }}
                >
                  {resetToken}
                </Typography>
                <AppButton
                  variant="primary"
                  fullWidth
                  size="small"
                  onClick={() => navigate(`/reset-password?token=${encodeURIComponent(resetToken)}`)}
                >
                  Reset Password Now with Token
                </AppButton>
              </Box>
            )}

            <AppButton
              variant="outlined"
              fullWidth
              onClick={() => navigate('/login')}
              leftIcon={<ArrowLeft size={16} />}
            >
              Return to Login
            </AppButton>
          </Box>
        ) : (
          <>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Forgot Password?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your registered email address and we will generate a secure one-time recovery token.
            </Typography>

            {errorMessage && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
                {errorMessage}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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

                <AppButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  size="large"
                  isLoading={isLoading}
                  sx={{ mt: 1 }}
                >
                  Request Reset Token
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
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 600,
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                <ArrowLeft size={16} /> Return to sign in
              </Typography>
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
};
