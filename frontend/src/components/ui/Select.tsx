import React from 'react';
import './Select.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  hint?: string;
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, hint, placeholder, className = '', id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className={`select-group ${className}`}>
        {label && (
          <label htmlFor={selectId} className="select-label">
            {label} {props.required && <span className="select-required">*</span>}
          </label>
        )}
        <div className="select-wrapper">
          <select
            ref={ref}
            id={selectId}
            className={`select-field ${error ? 'select-error' : ''}`}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <div className="select-arrow" />
        </div>
        {error && <span className="select-error-msg">{error}</span>}
        {hint && !error && <span className="select-hint">{hint}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
