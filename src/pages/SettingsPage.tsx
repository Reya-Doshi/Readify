import React, { useState } from 'react';
import { Sidebar } from '../components/dashboard/Sidebar';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Dropdown } from '../components/ui/Dropdown';
import { GlassCard } from '../components/ui/GlassCard';
import { ShieldAlert, Check, RefreshCw } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  
  const [username, setUsername] = useState(user?.username || '');
  const [avatarSeed, setAvatarSeed] = useState('');
  const [theme, setTheme] = useState<'dark' | 'light'>(user?.theme || 'dark');
  const [defaultTemplate, setDefaultTemplate] = useState('minimal');
  
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username) return;

    setIsUpdating(true);
    setShowSuccess(false);

    try {
      const updates: any = { username, theme };
      if (avatarSeed) {
        updates.avatar_url = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(avatarSeed)}`;
      }
      
      const { error } = await updateProfile(updates);
      if (!error) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      } else {
        alert(`Failed to update profile: ${error}`);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  const generateNewSeed = () => {
    const randomSeed = Math.random().toString(36).substring(2, 9);
    setAvatarSeed(randomSeed);
  };

  const templateOptions = [
    { value: 'minimal', label: 'Minimal', description: 'Clean bullet points, no badges, straight text.' },
    { value: 'open-source', label: 'Open Source', description: 'Extensive badges, details, contribution rules.' },
    { value: 'professional', label: 'Professional', description: 'Clean layout, API specs, modular tags.' },
    { value: 'startup', label: 'Startup', description: 'Feature grid showcase, rich images, structure.' },
    { value: 'enterprise', label: 'Enterprise', description: 'Formal outline, compliance notices, licenses.' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Panel Content */}
      <main className="flex-1 p-6 md:p-10 max-w-4xl mx-auto w-full space-y-8 overflow-y-auto">
        
        {/* Title Header */}
        <div className="border-b border-white/[0.06] pb-6 text-left">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-high tracking-tight">
            Account Settings
          </h1>
          <p className="text-xs text-neutral-low/55 mt-1">
            Manage your developer profile details, styling defaults, and local environments.
          </p>
        </div>

        {/* Configurations Form */}
        <form onSubmit={handleSave} className="space-y-6 text-left">
          
          {/* Card 1: Profile Information */}
          <GlassCard className="border-white/[0.04]">
            <h3 className="text-sm font-bold text-neutral-high uppercase tracking-wider mb-4">
              Profile Information
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
              <Input
                label="Username"
                type="text"
                placeholder="Developer username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />

              <div className="flex items-center gap-3">
                <Input
                  label="Avatar Seed Generator"
                  type="text"
                  placeholder="Enter seed (e.g. key)"
                  value={avatarSeed}
                  onChange={(e) => setAvatarSeed(e.target.value)}
                  helperText="Dicebear API generates avatar"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mb-1 py-2 px-3"
                  onClick={generateNewSeed}
                  title="Generate Random Seed"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Current Avatar Preview */}
            <div className="mt-6 flex items-center gap-3.5 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] max-w-sm">
              {user?.avatar_url ? (
                <img 
                  src={avatarSeed ? `https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}` : user.avatar_url} 
                  alt="Avatar Preview" 
                  className="h-12 w-12 rounded-full border border-white/[0.08] bg-[#111]" 
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-accent/20 border border-white/[0.08]" />
              )}
              <div className="flex flex-col gap-0.5 text-xs">
                <span className="font-bold text-neutral-high">Avatar Preview</span>
                <span className="text-neutral-low/55">Will update upon saving profile details.</span>
              </div>
            </div>
          </GlassCard>

          {/* Card 2: Preference Settings */}
          <GlassCard className="border-white/[0.04] space-y-6">
            <h3 className="text-sm font-bold text-neutral-high uppercase tracking-wider">
              Workspace Preferences
            </h3>

            {/* Theme Select */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-neutral-low">Application Theme</span>
              <div className="flex gap-2.5">
                <Button
                  type="button"
                  variant={theme === 'dark' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="w-24"
                >
                  Dark
                </Button>
                <Button
                  type="button"
                  variant={theme === 'light' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="w-24"
                  disabled // Soft disabled for now since dark theme is requested premium standard
                >
                  Light
                </Button>
              </div>
              <span className="text-[10px] text-neutral-low/40">Default premium theme is Dark (#0A0A0A).</span>
            </div>

            {/* Default Documentation style */}
            <div className="max-w-sm">
              <Dropdown
                label="Default Generation Style"
                options={templateOptions}
                value={defaultTemplate}
                onChange={setDefaultTemplate}
              />
            </div>
          </GlassCard>

          {/* Form Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              isLoading={isUpdating}
              leftIcon={showSuccess ? <Check className="h-4 w-4 text-emerald-400" /> : undefined}
            >
              {showSuccess ? 'Settings Saved' : 'Save Changes'}
            </Button>
          </div>
        </form>

        {/* Card 3: Danger Zone */}
        <div className="pt-6">
          <GlassCard className="border-red-500/20 bg-red-500/[0.02]">
            <div className="flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2 text-red-400">
                <ShieldAlert className="h-5 w-5" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Danger Zone
                </h3>
              </div>
              
              <div className="space-y-1">
                <p className="text-xs font-semibold text-neutral-high">Delete User Account</p>
                <p className="text-[11px] text-neutral-low/55 leading-relaxed">
                  Permanently delete your profile information, project lists, and saved README layouts. This operation is irreversible.
                </p>
              </div>

              <Button
                type="button"
                variant="danger"
                size="sm"
                className="self-start mt-2"
                onClick={() => {
                  if (confirm('Are you absolutely sure you want to delete your account? All generated documentation files will be deleted.')) {
                    alert('Profile deletion was requested. If running in Sandbox, clear your browser LocalStorage data to reset.');
                  }
                }}
              >
                Delete Account
              </Button>
            </div>
          </GlassCard>
        </div>

      </main>
    </div>
  );
};
