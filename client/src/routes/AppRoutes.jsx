import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import PublicRoute from './PublicRoute';
import AuthLayout from '../layouts/AuthLayout';
import Spinner from '../components/ui/Spinner';

// Auth — eager load (small, critical path)
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import ForgotPasswordPage from '../features/auth/pages/ForgotPasswordPage';
import ResetPasswordPage from '../features/auth/pages/ResetPasswordPage';
import VerifyEmailPage from '../features/auth/pages/VerifyEmailPage';
import LandingPage from '../features/auth/pages/LandingPage';
import OnboardingPage from '../features/onboarding/pages/OnboardingPage';
const DashboardLayout = lazy(() => import('../layouts/DashboardLayout'));
const DashboardPage = lazy(() => import('../features/polls/pages/DashboardPage'));
const CreatePollPage = lazy(() => import('../features/polls/pages/CreatePollPage'));
const EditPollPage = lazy(() => import('../features/polls/pages/EditPollPage'));
const PollDetailPage = lazy(() => import('../features/polls/pages/PollDetailPage'));
const AnalyticsPage = lazy(() => import('../features/analytics/pages/AnalyticsPage'));
const ProfilePage = lazy(() => import('../features/auth/pages/ProfilePage'));
const PresentationPage = lazy(() => import('../features/presentation/pages/PresentationPage'));
const HelpPage = lazy(() => import('../features/help/pages/HelpPage'));
const PublicPollPage = lazy(() => import('../features/publicPoll/pages/PublicPollPage'));
const PublicResultsPage = lazy(() => import('../features/publicPoll/pages/PublicResultsPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-votora-bg">
    <Spinner size="lg" />
  </div>
);

const Lazy = ({ children }) => (
  <Suspense fallback={<PageLoader />}>{children}</Suspense>
);

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<LandingPage />} />

    <Route element={<PublicRoute />}>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
      </Route>
    </Route>

    <Route element={<ProtectedRoute />}>
      <Route path="/onboarding" element={<OnboardingPage />} />
    </Route>

    <Route element={<ProtectedRoute requireOnboarding />}>
      <Route
        element={(
          <Lazy>
            <DashboardLayout />
          </Lazy>
        )}
      >
        <Route path="/dashboard" element={<Lazy><DashboardPage /></Lazy>} />
        <Route path="/profile" element={<Lazy><ProfilePage /></Lazy>} />
        <Route path="/polls/create" element={<Lazy><CreatePollPage /></Lazy>} />
        <Route path="/polls/:id/edit" element={<Lazy><EditPollPage /></Lazy>} />
        <Route path="/polls/:id" element={<Lazy><PollDetailPage /></Lazy>} />
        <Route path="/polls/:id/analytics" element={<Lazy><AnalyticsPage /></Lazy>} />
        <Route path="/polls/:id/present" element={<Lazy><PresentationPage /></Lazy>} />
        <Route path="/help" element={<Lazy><HelpPage /></Lazy>} />
      </Route>
    </Route>

    <Route
      path="/poll/:pollCode"
      element={(
        <Lazy>
          <PublicPollPage />
        </Lazy>
      )}
    />
    <Route
      path="/poll/:pollCode/results"
      element={(
        <Lazy>
          <PublicResultsPage />
        </Lazy>
      )}
    />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
