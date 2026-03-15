import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { demoTenants } from './demoData';

export const useTenantStore = create(
  persist(
    (set, get) => ({
      tenants: [],
      loading: false,

      fetchTenants: () => {
        set({ loading: true });
        const { tenants } = get();
        if (tenants.length === 0) {
          set({ tenants: demoTenants, loading: false });
        } else {
          set({ loading: false });
        }
      },

      createTenant: (data) => {
        const now = new Date().toISOString();
        const tenant = {
          id: `ten-${crypto.randomUUID().slice(0, 8)}`,
          created_at: now,
          updated_at: now,
          ...data,
        };
        set((state) => ({
          tenants: [...state.tenants, tenant],
        }));
        return tenant;
      },

      updateTenant: (id, updates) => {
        set((state) => ({
          tenants: state.tenants.map((t) =>
            t.id === id
              ? { ...t, ...updates, updated_at: new Date().toISOString() }
              : t
          ),
        }));
      },

      deleteTenant: (id) => {
        set((state) => ({
          tenants: state.tenants.filter((t) => t.id !== id),
        }));
      },

      getTenantById: (id) => {
        return get().tenants.find((t) => t.id === id) || null;
      },
    }),
    {
      name: 'gl-tenant-store',
    }
  )
);
