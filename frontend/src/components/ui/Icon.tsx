import React from 'react';
import './Icon.css';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, className = '', ...props }) => {
  const getPath = () => {
    switch (name) {
      case 'grid': return <path d="M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z" />;
      case 'file-text': return <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />;
      case 'users': return <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2 M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8z M23 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75" />;
      case 'building': return <path d="M4 22V2h12v20 M16 6h4v16 M4 22h16 M8 6h4 M8 10h4 M8 14h4 M8 18h4" />;
      case 'settings': return <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />;
      case 'inbox': return <path d="M22 12h-6l-2 3h-4l-2-3H2 M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />;
      case 'user': return <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2 M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />;
      case 'shield': return <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />;
      case 'plus': return <path d="M12 5v14 M5 12h14" />;
      case 'chevron-right': return <path d="M9 18l6-6-6-6" />;
      case 'chevron-left': return <path d="M15 18l-6-6 6-6" />;
      case 'check': return <path d="M20 6L9 17l-5-5" />;
      case 'x': return <path d="M18 6L6 18 M6 6l12 12" />;
      case 'search': return <path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16z M21 21l-4.35-4.35" />;
      case 'filter': return <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />;
      case 'clock': return <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z M12 6v6l4 2" />;
      case 'star': return <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />;
      case 'map-pin': return <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />;
      case 'dollar-sign': return <path d="M12 1v22 M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />;
      case 'briefcase': return <path d="M22 12V8a2 2 0 0 0-2-2h-4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2H4a2 2 0 0 0-2 2v4 M2 12h20v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8z M12 22v-4 M10 12v-2a2 2 0 0 1 2-2v0a2 2 0 0 1 2 2v2" />;
      case 'log-out': return <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4 M16 17l5-5-5-5 M21 12H9" />;
      case 'menu': return <path d="M3 12h18 M3 6h18 M3 18h18" />;
      case 'eye': return <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />;
      default: return null;
    }
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`icon ${className}`}
      {...props}
    >
      {getPath()}
    </svg>
  );
};
