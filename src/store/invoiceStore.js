import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { demoInvoices } from './demoData';
import { useLeaseStore } from './leaseStore';

export const useInvoiceStore = create(
  persist(
    (set, get) => ({
      invoices: [],
      loading: false,

      fetchInvoices: (filters) => {
        set({ loading: true });
        let { invoices } = get();
        if (invoices.length === 0) {
          invoices = demoInvoices;
          set({ invoices });
        }
        set({ loading: false });

        if (!filters) return invoices;

        let result = [...invoices];
        if (filters.status) {
          result = result.filter((i) => i.status === filters.status);
        }
        if (filters.leaseId) {
          result = result.filter((i) => i.lease_id === filters.leaseId);
        }
        if (filters.year) {
          result = result.filter((i) => i.year === filters.year);
        }
        if (filters.month) {
          result = result.filter((i) => i.month === filters.month);
        }
        if (filters.structureId) {
          result = result.filter((i) => i.structure_id === filters.structureId);
        }
        if (filters.tenantId) {
          result = result.filter((i) => i.tenant_id === filters.tenantId);
        }
        return result;
      },

      generateMonthlyInvoices: (year, month) => {
        const activeLeases = useLeaseStore.getState().getActiveLeases();
        const { invoices } = get();
        const newInvoices = [];

        for (const lease of activeLeases) {
          // Check if invoice already exists for this lease/period
          const exists = invoices.some(
            (i) => i.lease_id === lease.id && i.year === year && i.month === month
          );
          if (exists) continue;

          const monthStr = String(month).padStart(2, '0');
          const lastDay = new Date(year, month, 0).getDate();
          const monthNames = [
            '', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
          ];

          const rentHT = lease.monthly_rent;
          const charges = lease.charges || 0;
          const tvaRate = lease.tva_rate || 0;
          const tvaAmount = tvaRate > 0 ? Math.round(rentHT * tvaRate) / 100 : 0;
          const rentTTC = rentHT + tvaAmount;
          const totalTTC = rentTTC + charges;

          const invoice = {
            id: `inv-${crypto.randomUUID().slice(0, 8)}`,
            lease_id: lease.id,
            property_id: lease.property_id,
            tenant_id: lease.tenant_id,
            structure_id: lease.structure_id,
            period_label: `${monthNames[month]} ${year}`,
            period_start: `${year}-${monthStr}-01`,
            period_end: `${year}-${monthStr}-${lastDay}`,
            year,
            month,
            rent_ht: rentHT,
            charges,
            tva_rate: tvaRate,
            tva_amount: tvaAmount,
            rent_ttc: rentTTC,
            total_ttc: totalTTC,
            paid_amount: 0,
            remaining: totalTTC,
            due_date: `${year}-${monthStr}-05`,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };

          newInvoices.push(invoice);
        }

        if (newInvoices.length > 0) {
          set((state) => ({
            invoices: [...state.invoices, ...newInvoices],
          }));
        }

        return newInvoices;
      },

      getInvoiceById: (id) => {
        return get().invoices.find((i) => i.id === id) || null;
      },

      getInvoicesByLease: (leaseId) => {
        return get().invoices.filter((i) => i.lease_id === leaseId);
      },

      getOverdueInvoices: () => {
        const today = new Date().toISOString().split('T')[0];
        return get().invoices.filter(
          (i) =>
            (i.status === 'pending' || i.status === 'partially_paid') &&
            i.due_date < today
        );
      },

      updateInvoiceStatus: (invoiceId) => {
        set((state) => ({
          invoices: state.invoices.map((inv) => {
            if (inv.id !== invoiceId) return inv;

            const remaining = Math.round((inv.total_ttc - inv.paid_amount) * 100) / 100;
            let status;
            if (remaining <= 0) {
              status = 'paid';
            } else if (inv.paid_amount > 0) {
              status = 'partially_paid';
            } else {
              const today = new Date().toISOString().split('T')[0];
              status = inv.due_date < today ? 'pending' : 'pending';
            }

            return {
              ...inv,
              remaining: Math.max(0, remaining),
              status,
              updated_at: new Date().toISOString(),
            };
          }),
        }));
      },
    }),
    {
      name: 'gl-invoice-store',
    }
  )
);
