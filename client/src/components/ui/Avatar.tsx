import React from 'react';
import './Avatar.css';

interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ name, src, size = 'md', className = '' }) => {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <div className={`avatar avatar-${size} ${className}`}>
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="avatar-img" />
      ) : (
        <span className="avatar-initials">{initials}</span>
      )}
    </div>
  );
};
