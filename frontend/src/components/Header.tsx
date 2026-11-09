import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Badge,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useTheme,
  Popover,
  List,
  ListItem,
  Chip,
  Button,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Sun,
  Moon,
  Bot,
  Bell,
  User,
  Settings,
  HelpCircle,
  LogOut,
  CheckCheck,
  Sparkles,
  FileText,
  Briefcase,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { toggleTheme, toggleSidebarOpen } from '../store/slices/uiSlice';
import { logout } from '../store/slices/authSlice';
import { authApi } from '../api/authApi';
import { notificationApi } from '../api/notificationApi';
import { AppNotification } from '../types/notification';
import { useNavigate } from 'react-router-dom';
import { AppAvatar } from './common/AppAvatar';



export const Header: React.FC = () => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector((state) => state.ui.themeMode);
  const user = useAppSelector((state) => state.auth.user);
  const theme = useTheme();
  const navigate = useNavigate();

  const userName =
    [user?.first_name, user?.last_name].filter(Boolean).join(' ') ||
    user?.email?.split('@')[0] ||
    'Career Member';
  const userEmail = user?.email || 'member@aicareercoach.com';

  // Profile Menu State
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  const handleLogout = async () => {
    setProfileAnchorEl(null);
    try {
      await authApi.logout();
    } catch {
      // Continue cleanup even if network fails
    }
    dispatch(logout());
    navigate('/login');
  };

  const queryClient = useQueryClient();

  // Notifications State
  const [notifAnchorEl, setNotifAnchorEl] = useState<null | HTMLElement>(null);
  const isNotifOpen = Boolean(notifAnchorEl);

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationApi.getNotifications,
    refetchInterval: 30000,
  });

  const notifications = notifData?.data?.notifications || [];
  const unreadCount = notifData?.data?.unread_count ?? notifications.filter((n) => !n.is_read).length;

  const markAllReadMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markOneReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const handleMarkAllRead = () => {
    markAllReadMutation.mutate();
  };

  const handleNotificationClick = (item: AppNotification) => {
    if (!item.is_read) {
      markOneReadMutation.mutate(item.id);
    }
    if (item.action_url) {
      setNotifAnchorEl(null);
      navigate(item.action_url);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'interview':
      case 'ai':
        return <Sparkles size={16} color={theme.palette.secondary.main} />;
      case 'resume':
        return <FileText size={16} color={theme.palette.primary.main} />;
      case 'job':
        return <Briefcase size={16} color={theme.palette.success.main} />;
      default:
        return <Sparkles size={16} color={theme.palette.primary.main} />;
    }
  };

  return (
    <AppBar
      position="sticky"
      sx={{
        bgcolor: 'background.paper',
        color: 'text.primary',
        borderBottom: `1px solid ${theme.palette.divider}`,
        zIndex: (t) => t.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64, px: { xs: 2, sm: 3 } }}>
        {/* Left: Mobile Menu Toggle & Brand */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <IconButton
            color="inherit"
            aria-label="open navigation drawer"
            edge="start"
            onClick={() => dispatch(toggleSidebarOpen())}
            sx={{ display: { md: 'none' } }}
          >
            <MenuIcon size={22} />
          </IconButton>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              cursor: 'pointer',
              userSelect: 'none',
            }}
            onClick={() => navigate('/')}
          >
            <Box
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                p: 0.8,
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bot size={22} />
            </Box>
            <Typography variant="h6" component="div" fontWeight={700} sx={{ letterSpacing: -0.5 }}>
              AI Career Coach
            </Typography>
            <Chip
              label="Pro SaaS"
              size="small"
              color="primary"
              variant="outlined"
              sx={{
                display: { xs: 'none', sm: 'inline-flex' },
                fontWeight: 600,
                height: 22,
                fontSize: '0.72rem',
              }}
            />
          </Box>
        </Box>

        {/* Right: Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              color="inherit"
              aria-label={`${unreadCount} unread notifications`}
              onClick={(e) => setNotifAnchorEl(e.currentTarget)}
            >
              <Badge badgeContent={unreadCount} color="error" variant="standard">
                <Bell size={20} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Theme Mode Toggle */}
          <Tooltip title={`Switch to ${themeMode === 'light' ? 'Dark' : 'Light'} Mode`}>
            <IconButton
              color="inherit"
              onClick={() => dispatch(toggleTheme())}
              aria-label="toggle color theme"
            >
              {themeMode === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </IconButton>
          </Tooltip>

          {/* User Profile Avatar / Trigger */}
          <Box sx={{ ml: { xs: 0.5, sm: 1 } }}>
            <IconButton
              onClick={(e) => setProfileAnchorEl(e.currentTarget)}
              aria-label="account user menu"
              aria-controls={isProfileMenuOpen ? 'profile-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={isProfileMenuOpen ? 'true' : undefined}
              sx={{ p: 0.5 }}
            >
              <AppAvatar name={userName} status="online" size={36} />
            </IconButton>
          </Box>
        </Box>

        {/* Notifications Popover */}
        <Popover
          open={isNotifOpen}
          anchorEl={notifAnchorEl}
          onClose={() => setNotifAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: { xs: 300, sm: 360 },
              maxHeight: 460,
              borderRadius: 2.5,
              mt: 1.5,
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            },
          }}
        >
          <Box
            sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle2" fontWeight={700}>
                Notifications
              </Typography>
              {unreadCount > 0 && (
                <Chip label={`${unreadCount} new`} size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
              )}
            </Box>
            {unreadCount > 0 && (
              <Button
                size="small"
                startIcon={<CheckCheck size={14} />}
                onClick={handleMarkAllRead}
                sx={{ fontSize: '0.75rem', p: '2px 8px' }}
              >
                Mark read
              </Button>
            )}
          </Box>

          <List disablePadding sx={{ maxHeight: 360, overflowY: 'auto' }}>
            {notifications.length === 0 ? (
              <Box sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No notifications yet.
                </Typography>
              </Box>
            ) : (
              notifications.map((item) => (
                <ListItem
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  sx={{
                    px: 2,
                    py: 1.5,
                    cursor: 'pointer',
                    alignItems: 'flex-start',
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: item.is_read ? 'transparent' : 'action.hover',
                    transition: 'background-color 150ms ease',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <Box sx={{ mr: 1.5, mt: 0.5 }}>{getNotifIcon(item.notification_type)}</Box>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" fontSize="0.85rem" fontWeight={item.is_read ? 500 : 700}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" fontSize="0.775rem" sx={{ mt: 0.25 }}>
                      {item.message}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {new Date(item.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </ListItem>
              ))
            )}
          </List>
        </Popover>

        {/* User Account Menu */}
        <Menu
          id="profile-menu"
          anchorEl={profileAnchorEl}
          open={isProfileMenuOpen}
          onClose={() => setProfileAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          PaperProps={{
            sx: {
              width: 220,
              borderRadius: 2.5,
              mt: 1.5,
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            },
          }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              {userName}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap display="block">
              {userEmail}
            </Typography>
            <Chip
              label="Active Member"
              size="small"
              color="success"
              variant="outlined"
              sx={{ mt: 1, height: 20, fontSize: '0.6875rem' }}
            />
          </Box>

          <Divider />

          <MenuItem
            onClick={() => {
              setProfileAnchorEl(null);
              navigate('/profile');
            }}
          >
            <ListItemIcon>
              <User size={18} />
            </ListItemIcon>
            <ListItemText primary="My Profile" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>

          <MenuItem
            onClick={() => {
              setProfileAnchorEl(null);
              navigate('/settings');
            }}
          >
            <ListItemIcon>
              <Settings size={18} />
            </ListItemIcon>
            <ListItemText primary="Settings" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>

          <MenuItem
            onClick={() => {
              setProfileAnchorEl(null);
              navigate('/help');
            }}
          >
            <ListItemIcon>
              <HelpCircle size={18} />
            </ListItemIcon>
            <ListItemText primary="Help & Support" primaryTypographyProps={{ fontSize: '0.875rem' }} />
          </MenuItem>

          <Divider />

          <MenuItem
            onClick={handleLogout}
            sx={{ color: 'error.main' }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              <LogOut size={18} />
            </ListItemIcon>
            <ListItemText primary="Sign Out" primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: 600 }} />
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
