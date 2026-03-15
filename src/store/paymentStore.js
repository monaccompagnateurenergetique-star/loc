import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { demoPayments } from './demoData';
import { useInvoiceStore } from './invoiceStore';

export const usePaymentStore = create(
  persist(
    (set, get) => ({
      payments: [],
      loading: false,

      fetchPayments: () => {
        set({ loading: true });
        const { payments } = get();
        if (payments.length === 0) {
          set({ payments: demoPayments, loading: false });
        } else {
          set({ loading: false });
        }
      },

      createPayment: (data) => {
        const now = new Date().toISOString();
        const payment = {
          id: `pay-${crypto.randomUUID().slice(0, 8)}`,
          date: now.split('T')[0],
          created_at: now,
          ...data,
        };

        set((state) => ({
          payments: [...state.payments, payment],
        }));

        // Update the related invoice
        if (payment.invoice_id) {
          const invoiceStore = useInvoiceStore.getState();
          const invoice = invoiceStore.getInvoiceById(payment.invoice_id);
          if (invoice) {
            const newPaidAmount =
              Math.round((invoice.paid_amount + payment.amount) * 100) / 100;
            const newRemaining =
              Math.round((invoice.total_ttc - newPaidAmount) * 100) / 100;
            let newStatus;
            if (newRemaining <= 0) {
              newStatus = 'paid';
            } else if (newPaidAmount > 0) {
              newStatus = 'partially_paid';
            } else {
              newStatus = 'pending';
            }

            useInvoiceStore.setState((state) => ({
              invoices: state.invoices.map((inv) =>
                inv.id === payment.invoice_id
                  ? {
                      ...inv,
                      paid_amount: newPaidAmount,
                      remaining: Math.max(0, newRemaining),
                      status: newStatus,
                      updated_at: now,
                    }
                  : inv
              ),
            }));
          }
        }

        return payment;
      },

      getPaymentsByInvoice: (invoiceId) => {
        return get().payments.filter((p) => p.invoice_id === invoiceId);
      },

      getPaymentsByTenant: (tenantId) => {
        // Payments are linked to invoices which are linked to leases which have tenant_id
        // We store tenant_id directly on payments for efficiency
        const payments = get().payments;

        // First try direct tenant_id on payment
        const direct = payments.filter((p) => p.tenant_id === tenantId);
        if (direct.length > 0) return direct;

        // Fallback: resolve through invoices
        const invoiceStore = useInvoiceStore.getState();
        const tenantInvoiceIds = new Set(
          invoiceStore.invoices
            .filter((i) => i.tenant_id === tenantId)
            .map((i) => i.id)
        );
        return payments.filter((p) => tenantInvoiceIds.has(p.invoice_id));
      },
    }),
    {
      name: 'gl-payment-store',
    }
  )
);
