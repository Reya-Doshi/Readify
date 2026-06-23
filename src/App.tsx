import React, { useEffect } from 'react';
import { RouterProvider, useRouter } from './lib/router';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { SettingsPage } from './pages/SettingsPage';
import { FileCode2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { page, navigateTo } = useRouter();
  const { user, isLoading } = useAuth();

  // Handle Route Guard Redirects
  useEffect(() => {
    if (isLoading) return;

    const privatePages = ['dashboard', 'workspace', 'settings'];
    const isPrivate = privatePages.includes(page);

    if (isPrivate && !user) {
      navigateTo('signin');
    } else if (user && (page === 'signin' || page === 'signup' || page === 'landing')) {
      navigateTo('dashboard');
    }
  }, [page, user, isLoading, navigateTo]);

  // Loading Screen while verifying active sessions
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center relative overflow-hidden select-none">
        <div className="absolute w-[300px] h-[300px] bg-accent/5 rounded-full filter blur-[100px] pointer-events-none animate-pulse" />
        <div className="flex flex-col items-center gap-4 relative z-10">
          <div className="h-14 w-14 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center animate-bounce">
            <FileCode2 className="h-7 w-7 text-accent" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-bold text-neutral-high tracking-tight">Initializing Workspace</span>
            <span className="text-[10px] text-neutral-low/40">Synchronizing credentials and loading profiles...</span>
          </div>
        </div>
      </div>
    );
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

