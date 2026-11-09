import React from 'react';
import {
  Tabs,
  Tab,
  TabsProps,
  Box,
  Chip,
} from '@mui/material';

export interface AppTabItem {
  id: string | number;
  label: string;
  icon?: React.ReactElement;
  badge?: string | number;
  badgeColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: boolean;
}

export interface AppTabsProps extends Omit<TabsProps, 'onChange'> {
  tabs: AppTabItem[];
  activeTab: string | number;
  onChange: (tabId: string | number) => void;
}

export const AppTabs: React.FC<AppTabsProps> = ({
  tabs,
  activeTab,
  onChange,
  sx,
  ...props
}) => {
  return (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%', mb: 2 }}>
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => onChange(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        aria-label="application tab navigation"
        sx={{
          minHeight: 44,
          '& .MuiTab-root': {
            minHeight: 44,
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.875rem',
            px: 2,
            transition: 'color 150ms ease',
            '&.Mui-selected': {
              fontWeight: 600,
            },
          },
          ...sx,
        }}
        {...props}
      >
        {tabs.map((tab) => (
          <Tab
            key={String(tab.id)}
            value={tab.id}
            icon={tab.icon}
            iconPosition="start"
            disabled={tab.disabled}
            label={
              <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}>
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <Chip
                    label={tab.badge}
                    size="small"
                    color={tab.badgeColor || 'default'}
                    sx={{
                      height: 18,
                      fontSize: '0.6875rem',
                      fontWeight: 600,
                      borderRadius: 1,
                    }}
                  />
                )}
              </Box>
            }
          />
        ))}
      </Tabs>
    </Box>
  );
};
