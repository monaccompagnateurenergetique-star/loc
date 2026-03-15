import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { demoLeases } from './demoData';
import { usePropertyStore } from './propertyStore';

export const useLeaseStore = create(
  persist(
    (set, get) => ({
      leases: [],
      loading: false,

      fetchLeases: () => {
        set({ loading: true });
        const { leases } = get();
        if (leases.length === 0) {
          set({ leases: demoLeases, loading: false });
        } else {
          set({ loading: false });
        }
      },

      createLease: (data) => {
        const now = new Date().toISOString();
        const lease = {
          id: `lease-${crypto.randomUUID().slice(0, 8)}`,
          is_active: true,
          termination_date: null,
          termination_reason: null,
          created_at: now,
          updated_at: now,
          ...data,
        };
        set((state) => ({
          leases: [...state.leases, lease],
        }));

        // Update property status to occupied
        if (lease.property_id) {
          usePropertyStore.getState().updateProperty(lease.property_id, {
            status: 'occupied',
          });
        }

        return lease;
      },

      updateLease: (id, updates) => {
        set((state) => ({
          leases: state.leases.map((l) =>
            l.id === id
              ? { ...l, ...updates, updated_at: new Date().toISOString() }
              : l
          ),
        }));
      },

      terminateLease: (id, reason) => {
        const lease = get().leases.find((l) => l.id === id);
        if (!lease) return;

        const now = new Date().toISOString();
        set((state) => ({
          leases: state.leases.map((l) =>
            l.id === id
              ? {
                  ...l,
                  is_active: false,
                  termination_date: now.split('T')[0],
                  termination_reason: reason || 'Résiliation',
                  updated_at: now,
                }
              : l
          ),
        }));

        // Update property status to vacant
        if (lease.property_id) {
          usePropertyStore.getState().updateProperty(lease.property_id, {
            status: 'vacant',
          });
        }
      },

      getLeaseById: (id) => {
        return get().leases.find((l) => l.id === id) || null;
      },

      getLeasesByProperty: (propertyId) => {
        return get().leases.filter((l) => l.property_id === propertyId);
      },

      getLeasesByTenant: (tenantId) => {
        return get().leases.filter((l) => l.tenant_id === tenantId);
      },

      getActiveLeases: () => {
        return get().leases.filter((l) => l.is_active);
      },
    }),
    {
      name: 'gl-lease-store',
    }
  )
);
