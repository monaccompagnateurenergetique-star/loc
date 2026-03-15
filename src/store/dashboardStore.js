import { create } from 'zustand';
import { useStructureStore } from './structureStore';
import { usePropertyStore } from './propertyStore';
import { useLeaseStore } from './leaseStore';
import { useInvoiceStore } from './invoiceStore';
import { usePaymentStore } from './paymentStore';

export const useDashboardStore = create((set) => ({
  stats: {},
  loading: false,

  fetchDashboardData: () => {
    set({ loading: true });

    // Ensure all stores are hydrated
    const structures = useStructureStore.getState().structures;
    const properties = usePropertyStore.getState().properties;
    const leases = useLeaseStore.getState().leases;
    const invoices = useInvoiceStore.getState().invoices;
    const payments = usePaymentStore.getState().payments;

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    // ── Current month revenue & collection ──
    const currentMonthInvoices = invoices.filter(
      (i) => i.year === currentYear && i.month === currentMonth
    );
    const totalRevenue = currentMonthInvoices.reduce(
      (sum, i) => sum + i.total_ttc,
      0
    );
    const totalCollected = currentMonthInvoices.reduce(
      (sum, i) => sum + i.paid_amount,
      0
    );

    // ── Total outstanding (all unpaid amounts) ──
    const totalOutstanding = invoices.reduce((sum, i) => sum + i.remaining, 0);

    // ── Occupancy rate ──
    const totalProperties = properties.length;
    const occupiedProperties = properties.filter(
      (p) => p.status === 'occupied'
    ).length;
    const occupancyRate =
      totalProperties > 0
        ? Math.round((occupiedProperties / totalProperties) * 100)
        : 0;

    // ── Active leases count ──
    const activeLeases = leases.filter((l) => l.is_active);
    const activeLeasesCount = activeLeases.length;

    // ── Overdue invoices ──
    const todayStr = today.toISOString().split('T')[0];
    const overdueInvoices = invoices.filter(
      (i) =>
        (i.status === 'pending' || i.status === 'partially_paid') &&
        i.due_date < todayStr
    );
    const overdueCount = overdueInvoices.length;

    // ── Revenue by month (last 12 months) ──
    const revenueByMonth = [];
    for (let offset = 11; offset >= 0; offset--) {
      const d = new Date(currentYear, currentMonth - 1 - offset, 1);
      const y = d.getFullYear();
      const m = d.getMonth() + 1;
      const monthNames = [
        '', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
        'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
      ];
      const monthInvoices = invoices.filter(
        (i) => i.year === y && i.month === m
      );
      const expected = monthInvoices.reduce((s, i) => s + i.total_ttc, 0);
      const collected = monthInvoices.reduce((s, i) => s + i.paid_amount, 0);

      revenueByMonth.push({
        label: `${monthNames[m]} ${y}`,
        year: y,
        month: m,
        expected: Math.round(expected * 100) / 100,
        collected: Math.round(collected * 100) / 100,
      });
    }

    // ── Occupancy by structure ──
    const occupancyByStructure = structures.map((str) => {
      const strProperties = properties.filter(
        (p) => p.structure_id === str.id
      );
      const strOccupied = strProperties.filter(
        (p) => p.status === 'occupied'
      ).length;
      return {
        id: str.id,
        name: str.name,
        total: strProperties.length,
        occupied: strOccupied,
        rate:
          strProperties.length > 0
            ? Math.round((strOccupied / strProperties.length) * 100)
            : 0,
      };
    });

    // ── Expiring leases (next 90 days) ──
    const in90Days = new Date(today);
    in90Days.setDate(in90Days.getDate() + 90);
    const in90DaysStr = in90Days.toISOString().split('T')[0];
    const expiringLeases = activeLeases.filter(
      (l) => l.end_date >= todayStr && l.end_date <= in90DaysStr
    );

    const stats = {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalCollected: Math.round(totalCollected * 100) / 100,
      totalOutstanding: Math.round(totalOutstanding * 100) / 100,
      occupancyRate,
      activeLeasesCount,
      overdueCount,
      revenueByMonth,
      occupancyByStructure,
      expiringLeases,
      overdueInvoices,
    };

    set({ stats, loading: false });
    return stats;
  },
}));
