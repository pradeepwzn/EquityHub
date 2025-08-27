'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useUserStore } from '@/store/user-store';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface SimpleUser {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: SimpleUser | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SimpleUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { users, fetchAllUsers, setCurrentUser, findUserByEmail } = useUserStore();
  const { handleError } = useErrorHandler();

  useEffect(() => {
    // Fetch all users on app start
    fetchAllUsers().catch((error) => {
      console.error('Failed to fetch users in AuthProvider:', error);
      handleError(error);
    });
    setLoading(false);
  }, [fetchAllUsers, handleError]);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      // Check if supabase client is available
      if (!supabase) {
        return { error: new Error('Supabase client not available') };
      }

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
      
      // Quick validation - check if users are loaded
      if (users.length === 0) {
        console.log('No users loaded yet, fetching...');
        await fetchAllUsers();
      }
      
      // Find user by email in our user store
      const foundUser = findUserByEmail(email);
      
      if (!foundUser) {
        console.log('User not found with email:', email);
        return { error: new Error('User not found. Please check your email.') };
      }
      
      console.log('User found:', foundUser);
      
      // Set the current user immediately
      setUser(foundUser);
      setCurrentUser(foundUser);
      
      console.log('Sign in successful for user:', foundUser.id);
      return { error: null };
    } catch (err) {
      console.error('Unexpected sign in error:', err);
      return { error: err as Error };
    }
  };

  const signOut = async () => {
    console.log('Signing out user');
    setUser(null);
    setCurrentUser(null);
  };

  const resetPassword = async (email: string) => {
    if (!supabase) {
      return { error: new Error('Supabase client not available') };
    }
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
