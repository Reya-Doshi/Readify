import React, { useState } from 'react';
import { useRouter } from '../../lib/router';
import type { Page } from '../../lib/router';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';
import { 
  FileCode2, 
  LayoutDashboard, 
  PlusCircle, 
  Settings as SettingsIcon, 
  LogOut, 
  Menu, 
  X,
  Database
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { page, navigateTo } = useRouter();
  const { user, signOut, isSandbox } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems: { label: string; page: Page; icon: React.FC<any> }[] = [
    { label: 'Dashboard', page: 'dashboard', icon: LayoutDashboard },
    { label: 'Create README', page: 'workspace', icon: PlusCircle },
    { label: 'Settings', page: 'settings', icon: SettingsIcon },
  ];

  const handleNav = (targetPage: Page) => {
    navigateTo(targetPage);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar (Visible only on small screens) */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#111] border-b border-white/[0.08] sticky top-0 z-35">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigateTo('landing')}>
          <div className="h-8 w-8 rounded bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
            <FileCode2 className="h-4.5 w-4.5 text-accent" />
          </div>
          <span className="text-sm font-bold tracking-tight text-neutral-high">Readify</span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded text-neutral-low hover:text-neutral-high hover:bg-white/[0.04]"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Sidebar Panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-[#0D0D0D] border-r border-white/[0.08] flex flex-col justify-between p-6 transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Logo Area */}
        <div className="flex flex-col gap-8">
          <div 
            onClick={() => navigateTo('landing')}
            className="hidden md:flex items-center gap-2 cursor-pointer group"
          >
            <div className="h-9 w-9 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-accent/40 transition-colors">
              <FileCode2 className="h-5 w-5 text-accent" />
            </div>
            <span className="text-base font-bold tracking-tight text-neutral-high">Readify</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-1.5 text-left">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = page === item.page;
              return (
                <button
                  key={item.page}
                  onClick={() => handleNav(item.page)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-white/[0.04] text-neutral-high border-gradient'
                      : 'text-neutral-low hover:text-neutral-high hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-accent' : 'text-neutral-low/70'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile Section */}
        <div className="flex flex-col gap-4">
          
          {/* Sandbox Indicator */}
          {isSandbox && (
            <div className="px-2.5 py-1.5 rounded-lg bg-accent/5 border border-accent/15 flex items-center gap-2 text-left">
              <Database className="h-3.5 w-3.5 text-accent flex-shrink-0" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-accent">Sandbox Mode</span>
                <span className="text-[9px] text-neutral-low/55 leading-none mt-0.5">Local Persistence</span>
              </div>
            </div>
          )}

          {/* Profile Card */}
          {user && (
            <div className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/[0.04] text-left">
              <div className="flex items-center gap-2.5 overflow-hidden">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt="avatar" className="h-8 w-8 rounded-full border border-white/[0.08]" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-accent/20 border border-white/[0.08] flex items-center justify-center text-xs text-accent font-bold">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-semibold text-neutral-high truncate">{user.username}</span>
                  <span className="text-[10px] text-neutral-low/50 truncate">Developer</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                className="px-1.5 py-1 text-neutral-low/40 hover:text-red-400"
                onClick={signOut}
                title="Sign Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Overlay for mobile drawer */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-xs md:hidden"
        />
      )}
    </>
  );
};
