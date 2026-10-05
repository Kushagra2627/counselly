import React from 'react';
import './ProgressBar.css';

interface ProgressBarProps {
  steps: string[];
  currentStep: number; // 0-indexed
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ steps, currentStep }) => {
  return (
    <div className="progress-container">
      <div className="progress-bar-bg">
        <div 
          className="progress-bar-fill"
          style={{ width: `${(currentStep / (Math.max(steps.length - 1, 1))) * 100}%` }}
        />
      </div>
      <div className="progress-steps">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          
          return (
            <div 
              key={index} 
              className={`progress-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}
            >
              <div className="progress-step-indicator">
                {isCompleted ? '✓' : index + 1}
              </div>
              <span className="progress-step-label">{step}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
