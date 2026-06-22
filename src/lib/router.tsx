import React, { createContext, useContext, useState, useEffect } from 'react';

export type Page = 'landing' | 'signin' | 'signup' | 'dashboard' | 'workspace' | 'settings';

interface RouterContextType {
  page: Page;
  activeProjectId: string | null;
  navigateTo: (page: Page, projectId?: string | null) => void;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPageState] = useState<Page>('landing');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Sync route state with hash for user navigation convenience
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      if (['landing', 'signin', 'signup', 'dashboard', 'workspace', 'settings'].includes(hash)) {
        setPageState(hash as Page);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    // Initial load check
    const hash = window.location.hash.replace('#/', '');
    if (hash) {
      setPageState(hash as Page);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigateTo = (newPage: Page, projectId: string | null = null) => {
    setActiveProjectId(projectId);
    setPageState(newPage);
    window.location.hash = `#/${newPage}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <RouterContext.Provider value={{ page, activeProjectId, navigateTo }}>
      {children}
    </RouterContext.Provider>
  );
};

export const useRouter = () => {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
};
