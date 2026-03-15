import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { demoProperties } from './demoData';

export const usePropertyStore = create(
  persist(
    (set, get) => ({
      properties: [],
      loading: false,

      fetchProperties: (structureId) => {
        set({ loading: true });
        let { properties } = get();
        if (properties.length === 0) {
          properties = demoProperties;
          set({ properties });
        }
        set({ loading: false });
        if (structureId) {
          return properties.filter((p) => p.structure_id === structureId);
        }
        return properties;
      },

      createProperty: (data) => {
        const now = new Date().toISOString();
        const property = {
          id: `prop-${crypto.randomUUID().slice(0, 8)}`,
          status: 'vacant',
          created_at: now,
          updated_at: now,
          ...data,
        };
        set((state) => ({
          properties: [...state.properties, property],
        }));
        return property;
      },

      updateProperty: (id, updates) => {
        set((state) => ({
          properties: state.properties.map((p) =>
            p.id === id
              ? { ...p, ...updates, updated_at: new Date().toISOString() }
              : p
          ),
        }));
      },

      deleteProperty: (id) => {
        set((state) => ({
          properties: state.properties.filter((p) => p.id !== id),
        }));
      },

      getPropertyById: (id) => {
        return get().properties.find((p) => p.id === id) || null;
      },

      getPropertiesByStructure: (structureId) => {
        return get().properties.filter((p) => p.structure_id === structureId);
      },
    }),
    {
      name: 'gl-property-store',
    }
  )
);
