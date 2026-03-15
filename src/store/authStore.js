import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (email, password) => {
        // Demo mode: accept any credentials
        const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        const user = {
          id: crypto.randomUUID(),
          email,
          name,
        };
        set({ user, isAuthenticated: true });
        return { success: true, user };
      },

      register: (email, password, name) => {
        // Demo mode: always succeed
        const user = {
          id: crypto.randomUUID(),
          email,
          name: name || email.split('@')[0],
        };
        set({ user, isAuthenticated: true });
        return { success: true, user };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      updateProfile: (updates) => {
        const { user } = get();
        if (!user) return;
        set({ user: { ...user, ...updates } });
      },
    }),
    {
      name: 'gl-auth-store',
    }
  )
);
