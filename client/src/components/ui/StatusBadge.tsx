import React from 'react';
import { Badge } from './Badge';
import { REQUEST_STATUS_LABELS, MATCH_STATUS_LABELS } from '../../config/constants';

interface StatusBadgeProps {
  status: string;
  type?: 'request' | 'match';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'match' }) => {
  let variant: 'default' | 'success' | 'warning' | 'error' | 'info' | 'accent' = 'default';
  
  if (type === 'request') {
    switch (status) {
      case 'DRAFT': variant = 'default'; break;
      case 'SUBMITTED': variant = 'info'; break;
      case 'MATCHING': variant = 'warning'; break;
      case 'MATCHED': variant = 'success'; break;
      case 'LAWYER_SELECTED': variant = 'accent'; break;
      case 'ENGAGEMENT_ACTIVE': variant = 'success'; break;
      case 'COMPLETED': variant = 'default'; break;
      default: variant = 'default';
    }
  } else if (type === 'match') {
    switch (status) {
      case 'PENDING': variant = 'warning'; break;
      case 'ACCEPTED': variant = 'success'; break;
      case 'DECLINED': variant = 'error'; break;
      case 'ENGAGED': variant = 'accent'; break;
      default: variant = 'default';
    }
  }

  const label = type === 'request' 
    ? REQUEST_STATUS_LABELS[status] || status 
    : MATCH_STATUS_LABELS[status] || status;

  return <Badge variant={variant}>{label}</Badge>;
};
