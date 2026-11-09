import React from 'react';
import {
  Box,
  Pagination,
  PaginationProps,
  Typography,
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';

export interface AppPaginationProps extends PaginationProps {
  totalItems?: number;
  currentPage: number;
  totalPages: number;
  pageSize?: number;
  pageSizeOptions?: number[];
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void;
  onPageSizeChange?: (newSize: number) => void;
}

export const AppPagination: React.FC<AppPaginationProps> = ({
  totalItems,
  currentPage,
  totalPages,
  pageSize = 10,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  ...props
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
        py: 2,
        px: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {totalItems !== undefined && (
          <Typography variant="body2" color="text.secondary">
            Showing <strong>{startItem}</strong>–<strong>{endItem}</strong> of <strong>{totalItems}</strong>
          </Typography>
        )}

        {onPageSizeChange && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Per page:
            </Typography>
            <FormControl size="small">
              <Select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                sx={{ height: 32, fontSize: '0.8125rem' }}
                aria-label="Items per page"
              >
                {pageSizeOptions.map((opt) => (
                  <MenuItem key={opt} value={opt} sx={{ fontSize: '0.8125rem' }}>
                    {opt}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        )}
      </Box>

      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={onPageChange}
        color="primary"
        shape="rounded"
        size="small"
        aria-label="pagination controls"
        {...props}
      />
    </Box>
  );
};
