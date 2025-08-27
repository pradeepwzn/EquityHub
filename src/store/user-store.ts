'use client';

import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  updated_at: string;
}

interface UserStore {
  users: User[];
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAllUsers: () => Promise<void>;
  setCurrentUser: (user: User | null) => void;
  findUserByEmail: (email: string) => User | null;
  findUserByUsername: (username: string) => User | null;
  clearError: () => void;
}

// Mock users for instant loading
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@example.com',
    username: 'admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    email: 'user@example.com',
    username: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    email: 'demo@example.com',
    username: 'demo',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

export const useUserStore = create<UserStore>((set, get) => ({
  users: mockUsers, // Start with mock users for instant loading
  currentUser: null,
  loading: false,
  error: null,

  fetchAllUsers: async () => {
    set({ loading: true, error: null });
    
    try {
      // Try to fetch from Supabase first
      const response = await fetch('/api/users');
      
      if (response.ok) {
        const { users } = await response.json();
        set({ users: users || mockUsers, loading: false });
        console.log('Users loaded from database:', users);
      } else {
        // Keep mock data if API fails
        set({ users: mockUsers, loading: false });
        console.log('Using mock users (API failed)');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      
      // Keep mock data on error
      set({ users: mockUsers, loading: false, error: 'Using mock data' });
    }
  },

  setCurrentUser: (user) => {
    set({ currentUser: user });
    console.log('Current user set:', user);
  },

  findUserByEmail: (email) => {
    const { users } = get();
    return users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
  },

  findUserByUsername: (username) => {
    const { users } = get();
    return users.find(user => user.username.toLowerCase() === username.toLowerCase()) || null;
  },

  clearError: () => {
    set({ error: null });
  }
}));
