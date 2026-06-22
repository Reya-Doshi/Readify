import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useRouter } from '../lib/router';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { GlassCard } from '../components/ui/GlassCard';
import { FileCode2, Info } from 'lucide-react';

export const SignInPage: React.FC = () => {
  const { signIn, signInWithProvider, isSandbox } = useAuth();
  const { navigateTo } = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError(null);
    setIsLoading(true);

    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) {
        setError(signInError);
      } else {
        navigateTo('dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden select-none">
      
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-accent/5 filter blur-[100px] pointer-events-none" />

      {/* Main Container */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 flex flex-col items-center gap-4">
        {/* Logo */}
        <div 
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-2 cursor-pointer group"
        >
          <div className="h-10 w-10 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center group-hover:border-accent/40 transition-colors">
            <FileCode2 className="h-5 w-5 text-accent" />
          </div>
          <span className="text-xl font-bold tracking-tight text-neutral-high">Readify</span>
        </div>
        <h2 className="text-2xl font-extrabold text-neutral-high tracking-tight">
          Welcome back to Readify
        </h2>
        <p className="text-xs text-neutral-low/60">
          Enter your details below to sign in to your developer workspace.
        </p>
      </div>

      {/* Form Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <GlassCard className="border-white/[0.08] p-8 space-y-6">
          
          {/* Dev Sandbox Alert */}
          {isSandbox && (
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg flex items-start gap-2.5 text-left">
              <Info className="h-4.5 w-4.5 text-accent shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-[11px] font-bold text-accent">Dev Sandbox Active</span>
                <span className="text-[10px] text-neutral-low/75 leading-relaxed">
                  Supabase keys are not set. Offline mode is active; you can log in using any email and password combination.
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-600/10 border border-red-500/20 text-red-400 rounded-lg text-xs font-medium text-left">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4 text-left" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required
            />

            {/* Remember Me & Forgot Password row */}
            <div className="flex items-center justify-between text-xs py-1">
              <label className="flex items-center gap-2 cursor-pointer text-neutral-low hover:text-neutral-high select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded bg-white/[0.02] border border-white/[0.1] text-accent focus:ring-accent/40 focus:ring-offset-background"
                />
                <span>Remember me</span>
              </label>

              <button
                type="button"
                onClick={() => setError('Password reset features are available in connected Supabase environments.')}
                className="text-neutral-low hover:text-accent font-medium transition-colors"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full mt-2"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/[0.08]" />
            </div>
            <span className="relative bg-[#111] px-3 text-[10px] text-neutral-low/40 uppercase tracking-widest font-semibold">
              Or continue with
            </span>
          </div>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="secondary"
              leftIcon={
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.859-3.579-7.859-8s3.529-8 7.859-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C18.055 2.222 15.39 1 12.24 1 5.922 1 12 5.922 1 12s4.922 11 11.24 11c6.59 0 10.97-4.63 10.97-11.16 0-.75-.08-1.32-.2-1.885H12.24z"/>
                </svg>
              }
              onClick={() => signInWithProvider('google')}
              disabled={isLoading}
              className="text-xs py-2"
            >
              Google
            </Button>
            <Button
              type="button"
              variant="secondary"
              leftIcon={
                <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.579.688.481C19.137 20.164 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              }
              onClick={() => signInWithProvider('github')}
              disabled={isLoading}
              className="text-xs py-2"
            >
              GitHub
            </Button>
          </div>

          {/* Redirect link */}
          <p className="text-center text-xs text-neutral-low/50 pt-2">
            Don't have an account?{' '}
            <button
              onClick={() => navigateTo('signup')}
              className="font-medium text-accent hover:underline"
            >
              Sign Up
            </button>
          </p>

        </GlassCard>
      </div>

    </div>
  );
};
