import React, { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Profile } from '../types/database';

interface AuthContextType {
  user: Profile | null;
  email: string | null;
  providerToken: string | null;
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
  const [providerToken, setProviderToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initial user loading
  useEffect(() => {
    const getSessionAndProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          let token = session.provider_token;
          if (token) {
            sessionStorage.setItem('readify_github_provider_token', token);
          } else {
            token = sessionStorage.getItem('readify_github_provider_token');
          }
          setProviderToken(token || null);

          if (session.user) {
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
                username: session.user.user_metadata?.user_name || session.user.user_metadata?.preferred_username || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'developer',
                avatar_url: session.user.user_metadata?.avatar_url || null,
                theme: 'dark',
                created_at: new Date().toISOString(),
              });
            }
          }
        }
      } catch (err) {
        console.error('Session load error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: any, session: any) => {
      if (session) {
        let token = session.provider_token;
        if (token) {
          sessionStorage.setItem('readify_github_provider_token', token);
        } else {
          token = sessionStorage.getItem('readify_github_provider_token');
        }
        setProviderToken(token || null);

        if (session.user) {
          setEmail(session.user.email || null);
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          setUser((profile as Profile) || {
            id: session.user.id,
            username: session.user.user_metadata?.user_name || session.user.user_metadata?.preferred_username || session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'developer',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            theme: 'dark',
            created_at: new Date().toISOString(),
          });
        }
      } else {
        setUser(null);
        setEmail(null);
        setProviderToken(null);
        sessionStorage.removeItem('readify_github_provider_token');
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (emailVal: string, passwordVal: string, usernameVal: string) => {
    setIsLoading(true);
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
  };

  const signIn = async (emailVal: string, passwordVal: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: emailVal,
      password: passwordVal,
    });
    setIsLoading(false);
    if (error) return { error: error.message };
    return { error: null };
  };

  const signOut = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setEmail(null);
    setProviderToken(null);
    sessionStorage.removeItem('readify_github_provider_token');
    setIsLoading(false);
  };

  const signInWithProvider = async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin
      }
    });
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);
    
    if (!error) {
      setUser({ ...user, ...updates });
      return { error: null };
    }
    return { error: error.message };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        email,
        providerToken,
        isLoading,
        isSandbox: false,
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
