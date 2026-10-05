import React from 'react';
import './LoadingState.css';

interface LoadingStateProps {
  label?: string;
  message?: string;
  fullHeight?: boolean;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ label, message, fullHeight = false }) => {
  const text = label || message;
  return (
    <div className={`loading-state ${fullHeight ? 'loading-state-full' : ''}`}>
      <div className="loading-spinner"></div>
      {text && <p className="loading-label">{text}</p>}
    </div>
  );
};
