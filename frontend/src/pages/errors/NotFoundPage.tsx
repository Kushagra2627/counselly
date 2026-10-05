import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="container" style={{ padding: 'var(--space-24) 0', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <EmptyState
          title="Page Not Found"
          description="The page you are looking for does not exist or has been moved."
          action={
            <Link to="/">
              <Button>Return Home</Button>
            </Link>
          }
        />
      </div>
    </PublicLayout>
  );
};
