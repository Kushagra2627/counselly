import React from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '../../layouts/PublicLayout';
import { EmptyState } from '../../components/ui/EmptyState';
import { Button } from '../../components/ui/Button';

export const UnauthorizedPage: React.FC = () => {
  return (
    <PublicLayout>
      <div className="container" style={{ padding: 'var(--space-24) 0', minHeight: '60vh', display: 'flex', alignItems: 'center' }}>
        <EmptyState
          title="Unauthorized Access"
          description="You do not have permission to view this page."
          icon="shield"
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
