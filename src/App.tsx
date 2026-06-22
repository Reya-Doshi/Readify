import React from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { SettingsPage } from './pages/SettingsPage';

const AppContent: React.FC = () => {
  const { page } = useRouter();
  const { user } = useAuth();

  // Route guarding: Redirect to landing/signin if not logged in and trying to access dashboard/workspace/settings
  const privatePages = ['dashboard', 'workspace', 'settings'];
  const isPrivate = privatePages.includes(page);

  if (isPrivate && !user) {
    // If not authenticated, force them to the Sign In page
    return <SignInPage />;
  }

  // If authenticated and tries to open login/signup pages, redirect to dashboard
  if (user && (page === 'signin' || page === 'signup')) {
    // Page redirect will happen in useEffect or state change.
    // For rendering, we can just return the dashboard view.
    return <DashboardPage />;
  }

  switch (page) {
    case 'landing':
      return <LandingPage />;
    case 'signin':
      return <SignInPage />;
    case 'signup':
      return <SignUpPage />;
    case 'dashboard':
      return <DashboardPage />;
    case 'workspace':
      return <WorkspacePage />;
    case 'settings':
      return <SettingsPage />;
    default:
      return <LandingPage />;
  }
};

function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </RouterProvider>
  );
}

export default App;
