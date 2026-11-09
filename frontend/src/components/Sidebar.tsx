import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
} from '@mui/material';
import {
  LayoutDashboard,
  Bot,
  FileText,
  Linkedin,
  Mic,
  Compass,
  Map,
  Briefcase,
  BarChart3,
  User,
  Settings,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setSidebarOpen } from '../store/slices/uiSlice';

const DRAWER_WIDTH = 260;

interface NavItem {
  id: string;
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  isNew?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Overview',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/',
        icon: <LayoutDashboard size={19} />,
      },
    ],
  },
  {
    title: 'AI Career Tools',
    items: [
      {
        id: 'chat',
        label: 'AI Career Coach',
        path: '/chat',
        icon: <Bot size={19} />,
        badge: 'AI',
        isNew: true,
      },
      {
        id: 'resume',
        label: 'Resume Analyzer',
        path: '/resume',
        icon: <FileText size={19} />,
      },
      {
        id: 'linkedin',
        label: 'LinkedIn Optimizer',
        path: '/linkedin',
        icon: <Linkedin size={19} />,
      },
      {
        id: 'interview',
        label: 'Interview Preparation',
        path: '/interview',
        icon: <Mic size={19} />,
      },
      {
        id: 'skills',
        label: 'Skill Gap Analyzer',
        path: '/skills',
        icon: <Compass size={19} />,
      },
    ],
  },
  {
    title: 'Career Management',
    items: [
      {
        id: 'roadmap',
        label: 'Learning Roadmap',
        path: '/roadmap',
        icon: <Map size={19} />,
      },
      {
        id: 'jobs',
        label: 'Job Tracker',
        path: '/jobs',
        icon: <Briefcase size={19} />,
      },
      {
        id: 'analytics',
        label: 'Analytics',
        path: '/analytics',
        icon: <BarChart3 size={19} />,
      },
    ],
  },
  {
    title: 'Account',
    items: [
      {
        id: 'profile',
        label: 'My Profile',
        path: '/profile',
        icon: <User size={19} />,
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: <Settings size={19} />,
      },
      {
        id: 'help',
        label: 'Help & Support',
        path: '/help',
        icon: <HelpCircle size={19} />,
      },
    ],
  },
];

export const Sidebar: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      dispatch(setSidebarOpen(false));
    }
  };

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Scrollable Navigation Sections */}
      <Box sx={{ px: 1.5, py: 2, flex: 1, overflowY: 'auto' }}>
        {NAV_SECTIONS.map((section, sIdx) => (
          <Box key={section.title} sx={{ mb: 2 }}>
            <Typography
              variant="caption"
              sx={{
                px: 1.5,
                pb: 0.75,
                display: 'block',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: 0.8,
                color: 'text.secondary',
                fontSize: '0.6875rem',
              }}
            >
              {section.title}
            </Typography>

            <List disablePadding>
              {section.items.map((item) => {
                const isSelected = location.pathname === item.path;

                return (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={isSelected}
                      onClick={() => handleNavigate(item.path)}
                      sx={{
                        borderRadius: 2,
                        py: 0.9,
                        px: 1.5,
                        transition: 'all 150ms ease',
                        '&.Mui-selected': {
                          bgcolor: 'primary.main',
                          color: 'primary.contrastText',
                          '&:hover': {
                            bgcolor: 'primary.dark',
                          },
                          '& .MuiListItemIcon-root': {
                            color: 'inherit',
                          },
                        },
                      }}
                    >
                      <ListItemIcon
                        sx={{
                          minWidth: 32,
                          color: isSelected ? 'inherit' : 'text.secondary',
                        }}
                      >
                        {item.icon}
                      </ListItemIcon>

                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontSize: '0.84rem',
                          fontWeight: isSelected ? 600 : 500,
                        }}
                      />

                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          color={isSelected ? 'secondary' : 'primary'}
                          sx={{
                            height: 18,
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            borderRadius: 1,
                          }}
                        />
                      )}
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>

            {sIdx < NAV_SECTIONS.length - 1 && <Divider sx={{ my: 1.5, opacity: 0.6 }} />}
          </Box>
        ))}
      </Box>

      {/* Pro Plan Upgrade Card */}
      <Box sx={{ p: 1.5, m: 1.5, borderRadius: 2.5, bgcolor: 'action.hover', border: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Sparkles size={16} color={theme.palette.primary.main} />
          <Typography variant="subtitle2" fontWeight={700} fontSize="0.8rem">
            Pro Plan Active
          </Typography>
        </Box>
        <Typography variant="caption" color="text.secondary" display="block">
          Unlimited resume scans & mock interview simulations.
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
      {/* Mobile Drawer (Temporary) */}
      <Drawer
        variant="temporary"
        open={sidebarOpen}
        onClose={() => dispatch(setSidebarOpen(false))}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer (Permanent) */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
            top: 64,
            height: 'calc(100% - 64px)',
            bgcolor: 'background.paper',
            borderRight: `1px solid ${theme.palette.divider}`,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};
