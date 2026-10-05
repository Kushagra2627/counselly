import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { LoadingState } from '../../components/ui/LoadingState';

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: ('STARTUP' | 'LAWYER' | 'ADMIN')[];
  requireOnboardingDone?: boolean;
}

export function ProtectedRoute({
  children,
  allowedRoles,
  requireOnboardingDone = true,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState message="Verifying session..." />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect user to their appropriate root dashboard
    if (user.role === 'STARTUP') return <Navigate to="/startup/overview" replace />;
    if (user.role === 'LAWYER') return <Navigate to="/lawyer/overview" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/admin/verification" replace />;
    return <Navigate to="/" replace />;
  }

  if (requireOnboardingDone) {
    if (user.role === 'STARTUP' && user.startup && !user.startup.onboardingDone) {
      return <Navigate to="/onboarding/startup" replace />;
    }
    if (user.role === 'LAWYER' && user.lawyer && !user.lawyer.onboardingDone) {
      return <Navigate to="/onboarding/lawyer" replace />;
    }
  }

  return <>{children}</>;
}
