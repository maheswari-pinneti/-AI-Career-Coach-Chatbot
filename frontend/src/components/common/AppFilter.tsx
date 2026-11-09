import React from 'react';
import { Box, Chip, Button, Typography } from '@mui/material';
import { Filter, X } from 'lucide-react';

export interface FilterOption {
  id: string;
  label: string;
  count?: number;
}

export interface AppFilterProps {
  label?: string;
  options: FilterOption[];
  selectedIds: string[];
  onSelect: (id: string) => void;
  onClearAll?: () => void;
}

export const AppFilter: React.FC<AppFilterProps> = ({
  label = 'Filter by',
  options,
  selectedIds,
  onSelect,
  onClearAll,
}) => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.secondary', mr: 0.5 }}>
        <Filter size={16} />
        <Typography variant="caption" fontWeight={600} textTransform="uppercase" letterSpacing={0.5}>
          {label}:
        </Typography>
      </Box>

      {options.map((option) => {
        const isSelected = selectedIds.includes(option.id);
        return (
          <Chip
            key={option.id}
            label={option.count !== undefined ? `${option.label} (${option.count})` : option.label}
            size="small"
            clickable
            color={isSelected ? 'primary' : 'default'}
            variant={isSelected ? 'filled' : 'outlined'}
            onClick={() => onSelect(option.id)}
            sx={{
              fontWeight: isSelected ? 600 : 500,
              fontSize: '0.75rem',
            }}
          />
        );
      })}

      {selectedIds.length > 0 && onClearAll && (
        <Button
          size="small"
          variant="text"
          color="inherit"
          startIcon={<X size={14} />}
          onClick={onClearAll}
          sx={{ fontSize: '0.75rem', p: '2px 8px', color: 'text.secondary' }}
        >
          Clear filters
        </Button>
      )}
    </Box>
  );
};
