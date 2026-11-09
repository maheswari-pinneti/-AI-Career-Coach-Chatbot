import React from 'react';
import { Tooltip, TooltipProps } from '@mui/material';

export interface AppTooltipProps extends Omit<TooltipProps, 'children'> {
  children: React.ReactElement;
  description?: string;
}

export const AppTooltip: React.FC<AppTooltipProps> = ({
  children,
  title,
  description,
  arrow = true,
  placement = 'top',
  ...props
}) => {
  const content = description ? (
    <div>
      <div style={{ fontWeight: 600 }}>{title}</div>
      <div style={{ fontSize: '0.7rem', opacity: 0.85 }}>{description}</div>
    </div>
  ) : (
    title
  );

  return (
    <Tooltip
      title={content}
      arrow={arrow}
      placement={placement}
      enterDelay={200}
      leaveDelay={150}
      {...props}
    >
      {children}
    </Tooltip>
  );
};
