// @/components/contexts/AuthContext.tsx
'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase/client';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role: 'farmer' | 'dealer' | 'officer';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: string | null }>;
  signUp: (email: string, password: string, role: string, fullName: string) => Promise<{ user: User | null; error: string | null }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  verifyResetCode: (email: string, token: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase().auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/api/auth/callback?next=/reset-password`,
      });
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const verifyResetCode = async (email: string, token: string) => {
    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanToken = token.trim();

      if (!cleanEmail || !cleanToken) {
        return { error: 'Email and 6-digit code are required.' };
      }

      console.log('Verifying OTP for:', cleanEmail);
      const { data, error } = await supabase().auth.verifyOtp({
        email: cleanEmail,
        token: cleanToken,
        type: 'recovery',
      });
      
      if (error) {
        console.error('Supabase OTP Error Detail:', {
          message: error.message,
          status: error.status,
          name: error.name,
          code: (error as any).code
        });
        return { error: error.message };
      }

      console.log('OTP Verification successful, session created:', !!data?.session);

      if (data?.session) {
        await refreshSession();
        return { error: null };
      }
      
      return { error: 'Verification failed. Please try again.' };
    } catch (error) {
      console.error('Unexpected OTP Error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase().auth.updateUser({ password });
      return { error: error ? error.message : null };
    } catch (error) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase().auth.getSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      if (session?.user) {
        const userData: User = {
          id: session.user.id,
          email: session.user.email!,
          full_name: session.user.user_metadata?.full_name,
          role: session.user.user_metadata?.role || 'farmer'
        };
        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error in refreshSession:', error);
    }
  };

  useEffect(() => {
    // Check active session
    const getSession = async () => {
      try {
        await refreshSession();
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    // Listen for auth changes with proper typing
    const { data: { subscription } } = supabase().auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);
        
        if (session?.user) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email!,
            full_name: session.user.user_metadata?.full_name,
            role: session.user.user_metadata?.role || 'farmer'
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase().auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email!,
          full_name: data.user.user_metadata?.full_name,
          role: data.user.user_metadata?.role || 'farmer'
        };
        
        setUser(userData);
        
        // Force a session refresh to ensure cookies are set
        await refreshSession();
        
        return { user: userData, error: null };
      }

      return { user: null, error: 'No user data returned' };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, role: string, fullName: string) => {
    try {
      const { data, error } = await supabase().auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            full_name: fullName
          }
        }
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const userData: User = {
          id: data.user.id,
          email: data.user.email!,
          full_name: fullName,
          role: role as 'farmer' | 'dealer' | 'officer'
        };
        
        setUser(userData);
        
        // Force a session refresh to ensure cookies are set
        await refreshSession();
        
        return { user: userData, error: null };
      }

      return { user: null, error: 'No user data returned' };
    } catch (error) {
      return { user: null, error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    await supabase().auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshSession, resetPassword, verifyResetCode, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}