import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import type { Profile } from '../types/database';

interface AuthContextType {
  user: Profile | null;
  email: string | null;
  isLoading: boolean;
  isSandbox: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithProvider: (provider: 'google' | 'github') => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSandbox] = useState(!isSupabaseConfigured);

  // Initial user loading
  useEffect(() => {
    if (isSupabaseConfigured) {
      const getSessionAndProfile = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setEmail(session.user.email || null);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profile) {
            setUser(profile as Profile);
          } else {
            setUser({
              id: session.user.id,
              username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'developer',
              avatar_url: session.user.user_metadata?.avatar_url || null,
              theme: 'dark',
              created_at: new Date().toISOString(),
            });
          }
        }
        setIsLoading(false);
      };

      getSessionAndProfile();

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
        if (session?.user) {
          setEmail(session.user.email || null);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser((profile as Profile) || {
            id: session.user.id,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'developer',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            theme: 'dark',
            created_at: new Date().toISOString(),
          });
        } else {
          setUser(null);
          setEmail(null);
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Sandbox Auth (LocalStorage fallback)
      const checkLocalUser = () => {
        const savedUser = localStorage.getItem('readify_sandbox_user');
        const savedEmail = localStorage.getItem('readify_sandbox_email');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
          setEmail(savedEmail);
        }
        setIsLoading(false);
      };
      
      const timer = setTimeout(checkLocalUser, 400);
      return () => clearTimeout(timer);
    }
  }, []);

  const signUp = async (emailVal: string, passwordVal: string, usernameVal: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signUp({
        email: emailVal,
        password: passwordVal,
        options: {
          data: {
            username: usernameVal,
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameVal}`,
          }
        }
      });
      setIsLoading(false);
      if (error) return { error: error.message };
      return { error: null };
    } else {
      // Sandbox implementation
      return new Promise<{ error: string | null }>((resolve) => {
        setTimeout(() => {
          const mockId = 'sandbox-uid-' + Math.random().toString(36).substr(2, 9);
          const newProfile: Profile = {
            id: mockId,
            username: usernameVal,
            avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameVal}`,
            theme: 'dark',
            created_at: new Date().toISOString(),
          };
          localStorage.setItem('readify_sandbox_user', JSON.stringify(newProfile));
          localStorage.setItem('readify_sandbox_email', emailVal);
          setUser(newProfile);
          setEmail(emailVal);
          setIsLoading(false);
          resolve({ error: null });
        }, 1000);
      });
    }
  };

  const signIn = async (emailVal: string, passwordVal: string) => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({
        email: emailVal,
        password: passwordVal,
      });
      setIsLoading(false);
      if (error) return { error: error.message };
      return { error: null };
    } else {
      // Sandbox implementation
      return new Promise<{ error: string | null }>((resolve) => {
        setTimeout(() => {
          const usernameVal = emailVal.split('@')[0] || 'dev_guest';
          const existingUser = localStorage.getItem('readify_sandbox_user');
          let newProfile: Profile;
          
          if (existingUser) {
            newProfile = JSON.parse(existingUser);
          } else {
            newProfile = {
              id: 'sandbox-uid-default',
              username: usernameVal,
              avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameVal}`,
              theme: 'dark',
              created_at: new Date().toISOString(),
            };
            localStorage.setItem('readify_sandbox_user', JSON.stringify(newProfile));
          }
          localStorage.setItem('readify_sandbox_email', emailVal);
          setUser(newProfile);
          setEmail(emailVal);
          setIsLoading(false);
          resolve({ error: null });
        }, 1000);
      });
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localStorage.removeItem('readify_sandbox_user');
      localStorage.removeItem('readify_sandbox_email');
    }
    setUser(null);
    setEmail(null);
    setIsLoading(false);
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    if (isSupabaseConfigured) {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin
        }
      });
    } else {
      // Sandbox simulation
      setIsLoading(true);
      setTimeout(() => {
        const usernameVal = `${provider}_developer`;
        const newProfile: Profile = {
          id: `sandbox-oauth-${provider}-${Math.random().toString(36).substr(2, 5)}`,
          username: usernameVal,
          avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${usernameVal}`,
          theme: 'dark',
          created_at: new Date().toISOString(),
        };
        localStorage.setItem('readify_sandbox_user', JSON.stringify(newProfile));
        localStorage.setItem('readify_sandbox_email', `${usernameVal}@example.com`);
        setUser(newProfile);
        setEmail(`${usernameVal}@example.com`);
        setIsLoading(false);
      }, 800);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };

    if (isSupabaseConfigured) {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (!error) {
        setUser({ ...user, ...updates });
        return { error: null };
      }
      return { error: error.message };
    } else {
      // Sandbox implementation
      const updatedProfile = { ...user, ...updates };
      localStorage.setItem('readify_sandbox_user', JSON.stringify(updatedProfile));
      setUser(updatedProfile);
      return { error: null };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        email,
        isLoading,
        isSandbox,
        signUp,
        signIn,
        signOut,
        signInWithProvider,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
