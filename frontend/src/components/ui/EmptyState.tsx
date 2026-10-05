import React from 'react';
import { Icon } from './Icon';
import './EmptyState.css';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = 'inbox', title, description, action }) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={32} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-description">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  );
};
