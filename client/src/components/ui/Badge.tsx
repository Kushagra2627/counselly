import React from 'react';
import './Badge.css';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent' | 'primary' | 'neutral' | 'gold';
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'default', children, className = '', style }) => {
  return (
    <span className={`badge badge-${variant} ${className}`} style={style}>
      {children}
    </span>
  );
};
