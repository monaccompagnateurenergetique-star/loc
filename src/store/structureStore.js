import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { demoStructures } from './demoData';

export const useStructureStore = create(
  persist(
    (set, get) => ({
      structures: [],
      loading: false,

      fetchStructures: () => {
        set({ loading: true });
        const { structures } = get();
        if (structures.length === 0) {
          // Seed with demo data on first use
          set({ structures: demoStructures, loading: false });
        } else {
          set({ loading: false });
        }
      },

      createStructure: (data) => {
        const now = new Date().toISOString();
        const structure = {
          id: `str-${crypto.randomUUID().slice(0, 8)}`,
          created_at: now,
          updated_at: now,
          associates: [],
          ...data,
        };
        set((state) => ({
          structures: [...state.structures, structure],
        }));
        return structure;
      },

      updateStructure: (id, updates) => {
        set((state) => ({
          structures: state.structures.map((s) =>
            s.id === id
              ? { ...s, ...updates, updated_at: new Date().toISOString() }
              : s
          ),
        }));
      },

      deleteStructure: (id) => {
        set((state) => ({
          structures: state.structures.filter((s) => s.id !== id),
        }));
      },

      getStructureById: (id) => {
        return get().structures.find((s) => s.id === id) || null;
      },
    }),
    {
      name: 'gl-structure-store',
    }
  )
);
