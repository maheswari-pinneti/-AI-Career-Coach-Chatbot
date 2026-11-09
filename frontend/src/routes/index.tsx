import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { MainLayout } from '../layouts/MainLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';
import { DashboardPage } from '../pages/DashboardPage';

// Code-split heavy tool pages for performance
const ChatPage = React.lazy(() => import('../pages/ChatPage').then((m) => ({ default: m.ChatPage })));
const ResumeAnalyzerPage = React.lazy(() =>
  import('../pages/ResumeAnalyzerPage').then((m) => ({ default: m.ResumeAnalyzerPage }))
);
const LinkedInOptimizerPage = React.lazy(() =>
  import('../pages/LinkedInOptimizerPage').then((m) => ({ default: m.LinkedInOptimizerPage }))
);
const InterviewPrepPage = React.lazy(() =>
  import('../pages/InterviewPrepPage').then((m) => ({ default: m.InterviewPrepPage }))
);
const SkillGapPage = React.lazy(() => import('../pages/SkillGapPage').then((m) => ({ default: m.SkillGapPage })));
const RoadmapPage = React.lazy(() => import('../pages/RoadmapPage').then((m) => ({ default: m.RoadmapPage })));
const JobTrackerPage = React.lazy(() => import('../pages/JobTrackerPage').then((m) => ({ default: m.JobTrackerPage })));
const AnalyticsPage = React.lazy(() => import('../pages/AnalyticsPage').then((m) => ({ default: m.AnalyticsPage })));
const ProfilePage = React.lazy(() => import('../pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const SettingsPage = React.lazy(() => import('../pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const HelpSupportPage = React.lazy(() => import('../pages/HelpSupportPage').then((m) => ({ default: m.HelpSupportPage })));
const HealthPage = React.lazy(() => import('../pages/HealthPage').then((m) => ({ default: m.HealthPage })));
const NotFoundPage = React.lazy(() => import('../pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const RouteLoadingFallback: React.FC = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300, p: 4 }}>
    <CircularProgress size={36} color="primary" />
  </Box>
);

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<RouteLoadingFallback />}>
      <Routes>
        {/* Public Authentication Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* Protected SaaS Application Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            {/* Overview */}
            <Route index element={<DashboardPage />} />

            {/* AI Career Tools */}
            <Route path="chat" element={<ChatPage />} />
            <Route path="resume" element={<ResumeAnalyzerPage />} />
            <Route path="linkedin" element={<LinkedInOptimizerPage />} />
            <Route path="interview" element={<InterviewPrepPage />} />
            <Route path="skills" element={<SkillGapPage />} />

            {/* Career Management */}
            <Route path="roadmap" element={<RoadmapPage />} />
            <Route path="jobs" element={<JobTrackerPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />

            {/* Account */}
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="help" element={<HelpSupportPage />} />

            {/* Telemetry & Fallback */}
            <Route path="health" element={<HealthPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};
