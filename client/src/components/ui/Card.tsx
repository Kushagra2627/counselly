import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  title?: React.ReactNode;
  headerAction?: React.ReactNode;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hover = false,
  padding = 'md',
  onClick,
  title,
  headerAction,
  style
}) => {
  const classes = [
    'card',
    `card-p-${padding}`,
    hover ? 'card-hover' : '',
    onClick ? 'card-clickable' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onClick} style={style}>
      {(title || headerAction) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)', paddingBottom: 'var(--space-3)', borderBottom: '1px solid var(--color-border)' }}>
          {title && (typeof title === 'string' ? <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--color-navy)', margin: 0 }}>{title}</h3> : title)}
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
};
