import React from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className={`input-group ${className}`}>
        <label htmlFor={inputId} className="input-label">
          {label} {props.required && <span className="input-required">*</span>}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`input-field ${error ? 'input-error' : ''}`}
          {...props}
        />
        {error && <span className="input-error-msg">{error}</span>}
        {hint && !error && <span className="input-hint">{hint}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
