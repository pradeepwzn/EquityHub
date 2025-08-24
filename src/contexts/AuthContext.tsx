'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Sign up the user with Supabase auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username,
          },
        },
      });

      if (error) {
        return { error };
      }

      // If signup is successful, manually create the user in the public.users table
      // This is a fallback in case the database trigger doesn't work
      if (data.user) {
        try {
          const { error: insertError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              username: username,
              email: email,
            });

          if (insertError) {
            console.warn('Failed to create user in public.users table:', insertError);
            // Don't fail the signup if this fails - the trigger should handle it
          }
        } catch (insertErr) {
          console.warn('Error creating user in public.users table:', insertErr);
          // Don't fail the signup if this fails - the trigger should handle it
        }
      }

      return { error: null };
    } catch (err) {
      console.error('Signup error:', err);
      return { error: err as Error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Attempting to sign in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }

      if (data.user) {
        console.log('Sign in successful for user:', data.user.id);
        
        // Check if user exists in public.users table
        try {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (userError) {
            console.warn('User not found in public.users table:', userError);
            // Try to create the user if they don't exist
            const { error: insertError } = await supabase
              .from('users')
              .insert({
                id: data.user.id,
                username: data.user.user_metadata?.username || data.user.email,
                email: data.user.email,
              });

            if (insertError) {
              console.error('Failed to create user in public.users table:', insertError);
            } else {
              console.log('User created in public.users table');
            }
          } else {
            console.log('User found in public.users table:', userData);
          }
        } catch (checkErr) {
          console.warn('Error checking user in public.users table:', checkErr);
        }
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected sign in error:', err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
