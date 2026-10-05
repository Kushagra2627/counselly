import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-off-white)',
      padding: 'var(--space-4)'
    }}>
      <div style={{ marginBottom: 'var(--space-8)' }}>
        <Link to="/" style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--text-3xl)',
          color: 'var(--color-black)',
          fontWeight: 600,
          textDecoration: 'none'
        }}>
          Counselly
        </Link>
      </div>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <Card padding="lg">
          {children}
        </Card>
      </div>
    </div>
  );
};
