import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  isLoading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading,
  isLoading,
  fullWidth,
  icon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const isCurrentlyLoading = loading || isLoading;
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth ? 'btn-full' : '',
    isCurrentlyLoading ? 'btn-loading' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <button className={classes} disabled={disabled || isCurrentlyLoading} {...props}>
      {isCurrentlyLoading && <span className="btn-spinner" />}
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-text">{children}</span>
    </button>
  );
};
