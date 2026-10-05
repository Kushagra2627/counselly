import React, { useState, useRef, useEffect } from 'react';
import './MultiSelect.css';
import { Icon } from './Icon';

interface MultiSelectProps {
  label: string;
  options: readonly string[] | string[];
  value?: string[];
  selected?: string[];
  onChange: (val: string[]) => void;
  error?: string;
  hint?: string;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
  label,
  options,
  value: propValue,
  selected,
  onChange,
  error,
  hint
}) => {
  const value = selected || propValue || [];
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (opt: string) => {
    if (value.includes(opt)) {
      onChange(value.filter((v) => v !== opt));
    } else {
      onChange([...value, opt]);
    }
  };

  const removeOption = (e: React.MouseEvent, opt: string) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== opt));
  };

  return (
    <div className="multiselect-group" ref={containerRef}>
      <label className="multiselect-label">{label}</label>
      <div
        className={`multiselect-field ${error ? 'multiselect-error' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="multiselect-chips">
          {value.length === 0 && <span className="multiselect-placeholder">Select options...</span>}
          {value.map((v) => (
            <span key={v} className="multiselect-chip">
              {v}
              <button type="button" className="multiselect-chip-remove" onClick={(e) => removeOption(e, v)}>
                <Icon name="x" size={12} />
              </button>
            </span>
          ))}
        </div>
        <Icon name="chevron-right" className={`multiselect-arrow ${isOpen ? 'open' : ''}`} size={16} />
      </div>
      
      {isOpen && (
        <div className="multiselect-dropdown">
          {options.map((opt) => {
            const isSelected = value.includes(opt);
            return (
              <div
                key={opt}
                className={`multiselect-option ${isSelected ? 'selected' : ''}`}
                onClick={() => toggleOption(opt)}
              >
                <div className={`multiselect-checkbox ${isSelected ? 'checked' : ''}`}>
                  {isSelected && <Icon name="check" size={12} />}
                </div>
                {opt}
              </div>
            );
          })}
        </div>
      )}

      {error && <span className="multiselect-error-msg">{error}</span>}
      {hint && !error && <span className="multiselect-hint">{hint}</span>}
    </div>
  );
};
