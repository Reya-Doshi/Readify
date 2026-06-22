import React from 'react';
import { useRouter } from '../../lib/router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { FileCode2, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { navigateTo } = useRouter();
  const { user, signOut } = useAuth();

  const handleScroll = (id: string) => {
    navigateTo('landing');
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.08] bg-background/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div 
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-accent/40 transition-all duration-300">
            <FileCode2 className="h-5 w-5 text-accent group-hover:scale-110 transition-transform duration-300" />
          </div>
          <span className="text-lg font-bold tracking-tight text-neutral-high group-hover:text-accent transition-colors duration-300">
            Readify
          </span>
        </div>

        {/* Links (Hidden on mobile, clean typography) */}
        <nav className="hidden md:flex items-center gap-8">
          <button 
            onClick={() => handleScroll('features')}
            className="text-sm font-medium text-neutral-low hover:text-neutral-high transition-colors duration-200"
          >
            Features
          </button>
          <button 
            onClick={() => handleScroll('how-it-works')}
            className="text-sm font-medium text-neutral-low hover:text-neutral-high transition-colors duration-200"
          >
            Templates
          </button>
          <button 
            onClick={() => handleScroll('pricing')}
            className="text-sm font-medium text-neutral-low hover:text-neutral-high transition-colors duration-200"
          >
            Pricing
          </button>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm font-medium text-neutral-low hover:text-neutral-high transition-colors duration-200"
          >
            GitHub
          </a>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.02] border border-white/[0.06]">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" className="h-5 w-5 rounded-full" />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center text-[10px] text-accent font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-neutral-low pr-1 font-medium">{user.username}</span>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateTo('dashboard')}
              >
                Dashboard
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="px-2"
                onClick={signOut}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4 text-neutral-low hover:text-red-400" />
              </Button>
            </>
          ) : (
            <>
              <button 
                onClick={() => navigateTo('signin')}
                className="text-sm font-medium text-neutral-low hover:text-neutral-high px-3 py-2 transition-colors duration-200"
              >
                Sign In
              </button>
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => navigateTo('signup')}
              >
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
