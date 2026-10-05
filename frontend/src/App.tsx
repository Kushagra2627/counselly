import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthContext';
import { ProtectedRoute } from './features/auth/ProtectedRoute';

// Layouts
import { PublicLayout } from './layouts/PublicLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import { NotFoundPage } from './pages/errors/NotFoundPage';

// Onboarding Pages
import StartupOnboardingPage from './pages/onboarding/StartupOnboardingPage';
import LawyerOnboardingPage from './pages/onboarding/LawyerOnboardingPage';

// Startup Pages
import StartupOverviewPage from './pages/startup/StartupOverviewPage';
import LegalRequestsPage from './pages/startup/LegalRequestsPage';
import CreateLegalRequestPage from './pages/startup/CreateLegalRequestPage';
import LegalRequestDetailPage from './pages/startup/LegalRequestDetailPage';
import MatchedCounselPage from './pages/startup/MatchedCounselPage';
import LawyerProfileViewPage from './pages/startup/LawyerProfileViewPage';
import CompanyProfilePage from './pages/startup/CompanyProfilePage';
import StartupSettingsPage from './pages/startup/StartupSettingsPage';

// Lawyer Pages
import LawyerOverviewPage from './pages/lawyer/LawyerOverviewPage';
import LawyerRequestsPage from './pages/lawyer/LawyerRequestsPage';
import LawyerMatchesPage from './pages/lawyer/LawyerMatchesPage';
import LawyerProfileEditorPage from './pages/lawyer/LawyerProfileEditorPage';
import LawyerVerificationPage from './pages/lawyer/LawyerVerificationPage';
import LawyerSettingsPage from './pages/lawyer/LawyerSettingsPage';

// Startup Verification
import StartupVerificationPage from './pages/startup/StartupVerificationPage';

// Admin Pages
import AdminVerificationQueuePage from './pages/admin/AdminVerificationQueuePage';
import AdminVerificationReviewPage from './pages/admin/AdminVerificationReviewPage';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public Landing */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/login"
          element={
            <AuthLayout title="Sign In to Counselly" subtitle="Access your legal workspace">
              <LoginPage />
            </AuthLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AuthLayout title="Create Your Counselly Account" subtitle="Join startups and legal counsel modernizing legal operations">
              <RegisterPage />
            </AuthLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <AuthLayout title="Reset Password" subtitle="Enter your email to receive recovery instructions">
              <ForgotPasswordPage />
            </AuthLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <AuthLayout title="Set New Password" subtitle="Choose a strong password for your account">
              <ResetPasswordPage />
            </AuthLayout>
          }
        />

        {/* Onboarding Flow (Protected, but allows incomplete onboarding) */}
        <Route
          path="/onboarding/startup"
          element={
            <ProtectedRoute allowedRoles={['STARTUP']} requireOnboardingDone={false}>
              <StartupOnboardingPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/onboarding/lawyer"
          element={
            <ProtectedRoute allowedRoles={['LAWYER']} requireOnboardingDone={false}>
              <LawyerOnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Startup Dashboard Routes */}
        <Route
          path="/startup/overview"
          element={
            <ProtectedRoute allowedRoles={['STARTUP']}>
              <DashboardLayout>
                <StartupOverviewPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Backward-compat alias */}
        <Route path="/startup/dashboard" element={<Navigate to="/startup/overview" replace />} />
        <Route
          path="/startup/requests"
          element={
            <ProtectedRoute allowedRoles={['STARTUP']}>
              <DashboardLayout>
                <LegalRequestsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/startup/requests/new"
          element={
            <ProtectedRoute allowedRoles={['STARTUP']}>
              <DashboardLayout>
                <CreateLegalRequestPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/startup/requests/:id"
          element={
            <ProtectedRoute allowedRoles={['STARTUP']}>
              <DashboardLayout>
                <LegalRequestDetailPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/startup/counsel"
          element={
            <ProtectedRoute allowedRoles={['STARTUP']}>
              <DashboardLayout>
                <MatchedCounselPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/startup/counsel/:id"
          element={
            <ProtectedRoute allowedRoles={['STARTUP']}>
              <DashboardLayout>
                <LawyerProfileViewPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/startup/profile"
          element={
            <ProtectedRoute allowedRoles={['STARTUP']}>
              <DashboardLayout>
                <CompanyProfilePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/startup/settings"
          element={
            <ProtectedRoute allowedRoles={['STARTUP']}>
              <DashboardLayout>
                <StartupSettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/startup/verification"
          element={
            <ProtectedRoute allowedRoles={['STARTUP']}>
              <DashboardLayout>
                <StartupVerificationPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Lawyer Dashboard Routes */}
        <Route
          path="/lawyer/overview"
          element={
            <ProtectedRoute allowedRoles={['LAWYER']}>
              <DashboardLayout>
                <LawyerOverviewPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        {/* Backward-compat alias */}
        <Route path="/lawyer/dashboard" element={<Navigate to="/lawyer/overview" replace />} />
        <Route
          path="/lawyer/requests"
          element={
            <ProtectedRoute allowedRoles={['LAWYER']}>
              <DashboardLayout>
                <LawyerRequestsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lawyer/matches"
          element={
            <ProtectedRoute allowedRoles={['LAWYER']}>
              <DashboardLayout>
                <LawyerMatchesPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lawyer/profile"
          element={
            <ProtectedRoute allowedRoles={['LAWYER']}>
              <DashboardLayout>
                <LawyerProfileEditorPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lawyer/verification"
          element={
            <ProtectedRoute allowedRoles={['LAWYER']}>
              <DashboardLayout>
                <LawyerVerificationPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/lawyer/settings"
          element={
            <ProtectedRoute allowedRoles={['LAWYER']}>
              <DashboardLayout>
                <LawyerSettingsPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin/verification"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <AdminVerificationQueuePage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/verification/:id"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <DashboardLayout>
                <AdminVerificationReviewPage />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* Fallbacks */}
        <Route path="/404" element={<NotFoundPage />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
