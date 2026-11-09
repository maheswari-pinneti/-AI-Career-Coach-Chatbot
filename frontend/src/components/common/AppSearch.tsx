import React, { useState, useEffect } from 'react';
import {
  OutlinedInput,
  InputAdornment,
  IconButton,
  OutlinedInputProps,
} from '@mui/material';
import { Search as SearchIcon, X } from 'lucide-react';

export interface AppSearchProps extends Omit<OutlinedInputProps, 'onChange'> {
  value?: string;
  onSearchChange: (value: string) => void;
  debounceMs?: number;
  placeholder?: string;
}

export const AppSearch: React.FC<AppSearchProps> = ({
  value: controlledValue,
  onSearchChange,
  debounceMs = 300,
  placeholder = 'Search...',
  sx,
  ...props
}) => {
  const [internalTerm, setInternalTerm] = useState(controlledValue || '');
  const isControlled = controlledValue !== undefined;
  const currentTerm = isControlled ? controlledValue : internalTerm;

  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(currentTerm);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [currentTerm, debounceMs, onSearchChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) {
      setInternalTerm(e.target.value);
    } else {
      onSearchChange(e.target.value);
    }
  };

  const handleClear = () => {
    if (!isControlled) {
      setInternalTerm('');
    }
    onSearchChange('');
  };

  return (
    <OutlinedInput
      value={currentTerm}
      onChange={handleChange}
      placeholder={placeholder}
      size="small"
      startAdornment={
        <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
          <SearchIcon size={18} />
        </InputAdornment>
      }
      endAdornment={
        currentTerm ? (
          <InputAdornment position="end">
            <IconButton
              size="small"
              aria-label="clear search input"
              onClick={handleClear}
              edge="end"
            >
              <X size={16} />
            </IconButton>
          </InputAdornment>
        ) : null
      }
      inputProps={{
        'aria-label': placeholder,
      }}
      sx={{
        borderRadius: 2,
        fontSize: '0.875rem',
        bgcolor: 'background.paper',
        maxWidth: 360,
        ...sx,
      }}
      {...props}
    />
  );
};
