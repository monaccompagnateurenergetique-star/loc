// ============================================================
// Demo seed data — realistic French rental management context
// ============================================================

export const demoStructures = [
  {
    id: 'str-1',
    name: 'SCI Riviera',
    type: 'SCI_IR',
    siren: '912 345 678',
    siret: '912 345 678 00012',
    address: '25 boulevard Victor Hugo, 06000 Nice',
    capital: 50000,
    associates: [
      { name: 'Jérôme Isologia', share: 60 },
      { name: 'Marie Isologia', share: 40 },
    ],
    fiscal_regime: 'IR',
    tva_applicable: false,
    created_at: '2024-03-15T10:00:00Z',
    updated_at: '2024-03-15T10:00:00Z',
  },
  {
    id: 'str-2',
    name: 'Jérôme Isologia',
    type: 'NOM_PROPRE',
    siren: null,
    siret: null,
    address: '12 rue des Oliviers, 06400 Cannes',
    capital: null,
    associates: [],
    fiscal_regime: 'MICRO_FONCIER',
    tva_applicable: false,
    created_at: '2024-06-01T08:00:00Z',
    updated_at: '2024-06-01T08:00:00Z',
  },
];

export const demoProperties = [
  {
    id: 'prop-1',
    structure_id: 'str-1',
    name: 'Appartement Nice Centre',
    type: 'appartement',
    address: '18 rue de France, 06000 Nice',
    city: 'Nice',
    postal_code: '06000',
    surface: 62,
    rooms: 3,
    floor: 3,
    elevator: true,
    parking: true,
    description: 'Bel appartement T3 lumineux, balcon vue mer, proche Promenade des Anglais',
    status: 'occupied',
    monthly_rent: 950,
    charges: 120,
    deposit: 1900,
    tax_fonciere: 1200,
    created_at: '2024-04-01T09:00:00Z',
    updated_at: '2025-12-01T09:00:00Z',
  },
  {
    id: 'prop-2',
    structure_id: 'str-1',
    name: 'Local Commercial Antibes',
    type: 'local_commercial',
    address: '8 avenue Robert Soleau, 06600 Antibes',
    city: 'Antibes',
    postal_code: '06600',
    surface: 85,
    rooms: null,
    floor: 0,
    elevator: false,
    parking: true,
    description: 'Local commercial en rez-de-chaussée, vitrine sur rue passante, idéal restauration ou commerce',
    status: 'occupied',
    monthly_rent: 1800,
    charges: 200,
    deposit: 5400,
    tax_fonciere: 2800,
    tva_rate: 20,
    created_at: '2024-05-15T14:00:00Z',
    updated_at: '2025-11-01T14:00:00Z',
  },
  {
    id: 'prop-3',
    structure_id: 'str-2',
    name: 'Maison Mougins',
    type: 'maison',
    address: '45 chemin des Campelières, 06250 Mougins',
    city: 'Mougins',
    postal_code: '06250',
    surface: 120,
    rooms: 5,
    floor: null,
    elevator: false,
    parking: true,
    description: 'Villa T5 avec jardin arboré, piscine, garage double, quartier résidentiel calme',
    status: 'occupied',
    monthly_rent: 1650,
    charges: 0,
    deposit: 3300,
    tax_fonciere: 2100,
    created_at: '2024-07-20T11:00:00Z',
    updated_at: '2025-10-01T11:00:00Z',
  },
  {
    id: 'prop-4',
    structure_id: 'str-2',
    name: 'Studio Cannes Banane',
    type: 'appartement',
    address: '3 rue Meynadier, 06400 Cannes',
    city: 'Cannes',
    postal_code: '06400',
    surface: 28,
    rooms: 1,
    floor: 2,
    elevator: false,
    parking: false,
    description: 'Studio meublé au cœur du quartier piéton, idéal investissement locatif',
    status: 'vacant',
    monthly_rent: 580,
    charges: 50,
    deposit: 1160,
    tax_fonciere: 650,
    created_at: '2024-09-10T16:00:00Z',
    updated_at: '2026-01-15T16:00:00Z',
  },
];

export const demoTenants = [
  {
    id: 'ten-1',
    first_name: 'Sophie',
    last_name: 'Durand',
    email: 'sophie.durand@email.fr',
    phone: '06 12 34 56 78',
    date_of_birth: '1985-07-22',
    address: '18 rue de France, 06000 Nice',
    id_type: 'CNI',
    id_number: '1234567890123',
    profession: 'Cadre commercial',
    monthly_income: 3200,
    guarantor: {
      name: 'Pierre Durand',
      relationship: 'Père',
      income: 4500,
      phone: '06 98 76 54 32',
    },
    created_at: '2024-04-01T09:00:00Z',
    updated_at: '2024-04-01T09:00:00Z',
  },
  {
    id: 'ten-2',
    first_name: 'Marc',
    last_name: 'Lefebvre',
    email: 'marc.lefebvre@entreprise.fr',
    phone: '06 45 67 89 01',
    date_of_birth: '1978-11-03',
    address: '8 avenue Robert Soleau, 06600 Antibes',
    id_type: 'CNI',
    id_number: '9876543210987',
    profession: 'Gérant SARL',
    monthly_income: 5500,
    guarantor: null,
    company: {
      name: 'Lefebvre Restauration SARL',
      siren: '823 456 789',
      activity: 'Restauration traditionnelle',
    },
    created_at: '2024-05-15T14:00:00Z',
    updated_at: '2024-05-15T14:00:00Z',
  },
  {
    id: 'ten-3',
    first_name: 'Camille',
    last_name: 'Moreau',
    email: 'camille.moreau@gmail.com',
    phone: '06 78 90 12 34',
    date_of_birth: '1992-03-14',
    address: '45 chemin des Campelières, 06250 Mougins',
    id_type: 'PASSEPORT',
    id_number: '22AA12345',
    profession: 'Ingénieure informatique',
    monthly_income: 4100,
    guarantor: {
      name: 'Anne Moreau',
      relationship: 'Mère',
      income: 3800,
      phone: '06 11 22 33 44',
    },
    created_at: '2024-07-20T11:00:00Z',
    updated_at: '2024-07-20T11:00:00Z',
  },
];

export const demoLeases = [
  {
    id: 'lease-1',
    property_id: 'prop-1',
    tenant_id: 'ten-1',
    structure_id: 'str-1',
    type: 'habitation_nue',
    start_date: '2024-09-01',
    end_date: '2027-08-31',
    duration_months: 36,
    monthly_rent: 950,
    charges: 120,
    deposit_amount: 1900,
    deposit_paid: true,
    revision_index: 'IRL',
    revision_date: '2025-09-01',
    is_active: true,
    termination_date: null,
    termination_reason: null,
    created_at: '2024-08-15T10:00:00Z',
    updated_at: '2024-08-15T10:00:00Z',
  },
  {
    id: 'lease-2',
    property_id: 'prop-2',
    tenant_id: 'ten-2',
    structure_id: 'str-1',
    type: 'commercial',
    start_date: '2024-10-01',
    end_date: '2033-09-30',
    duration_months: 108,
    monthly_rent: 1800,
    charges: 200,
    deposit_amount: 5400,
    deposit_paid: true,
    revision_index: 'ILC',
    revision_date: '2025-10-01',
    tva_rate: 20,
    is_active: true,
    termination_date: null,
    termination_reason: null,
    created_at: '2024-09-20T14:00:00Z',
    updated_at: '2024-09-20T14:00:00Z',
  },
  {
    id: 'lease-3',
    property_id: 'prop-3',
    tenant_id: 'ten-3',
    structure_id: 'str-2',
    type: 'habitation_nue',
    start_date: '2025-01-01',
    end_date: '2027-12-31',
    duration_months: 36,
    monthly_rent: 1650,
    charges: 0,
    deposit_amount: 3300,
    deposit_paid: true,
    revision_index: 'IRL',
    revision_date: '2026-01-01',
    is_active: true,
    termination_date: null,
    termination_reason: null,
    created_at: '2024-12-10T11:00:00Z',
    updated_at: '2024-12-10T11:00:00Z',
  },
];

// Helper: generate 6 months of invoices (Jan–June 2026) for each active lease
function generateInvoices() {
  const invoices = [];
  const months = [
    { year: 2026, month: 1, label: 'Janvier 2026' },
    { year: 2026, month: 2, label: 'Février 2026' },
    { year: 2026, month: 3, label: 'Mars 2026' },
    { year: 2026, month: 4, label: 'Avril 2026' },
    { year: 2026, month: 5, label: 'Mai 2026' },
    { year: 2026, month: 6, label: 'Juin 2026' },
  ];

  let invoiceCounter = 1;

  for (const lease of demoLeases) {
    for (const m of months) {
      const id = `inv-${String(invoiceCounter).padStart(3, '0')}`;
      invoiceCounter++;

      const rentHT = lease.monthly_rent;
      const charges = lease.charges;
      const hasTVA = lease.tva_rate > 0;
      const tvaRate = lease.tva_rate || 0;
      const tvaAmount = hasTVA ? Math.round(rentHT * tvaRate) / 100 : 0;
      const rentTTC = rentHT + tvaAmount;
      const totalTTC = rentTTC + charges;

      const dueDate = `${m.year}-${String(m.month).padStart(2, '0')}-05`;
      const periodStart = `${m.year}-${String(m.month).padStart(2, '0')}-01`;
      const lastDay = new Date(m.year, m.month, 0).getDate();
      const periodEnd = `${m.year}-${String(m.month).padStart(2, '0')}-${lastDay}`;

      // Determine payment status based on time
      let status, paidAmount;
      const today = new Date('2026-03-15');
      const due = new Date(dueDate);

      if (m.month <= 2) {
        // Jan & Feb: fully paid
        status = 'paid';
        paidAmount = totalTTC;
      } else if (m.month === 3) {
        // March: some paid, some partial
        if (lease.id === 'lease-1') {
          status = 'paid';
          paidAmount = totalTTC;
        } else if (lease.id === 'lease-2') {
          status = 'partially_paid';
          paidAmount = Math.round(totalTTC * 0.5 * 100) / 100;
        } else {
          status = 'pending';
          paidAmount = 0;
        }
      } else {
        // Apr–Jun: not yet due
        status = 'pending';
        paidAmount = 0;
      }

      // Override: lease-2 January is partially paid to show overdue scenario
      if (lease.id === 'lease-3' && m.month === 1) {
        // keep paid
      }

      invoices.push({
        id,
        lease_id: lease.id,
        property_id: lease.property_id,
        tenant_id: lease.tenant_id,
        structure_id: lease.structure_id,
        period_label: m.label,
        period_start: periodStart,
        period_end: periodEnd,
        year: m.year,
        month: m.month,
        rent_ht: rentHT,
        charges,
        tva_rate: tvaRate,
        tva_amount: tvaAmount,
        rent_ttc: rentTTC,
        total_ttc: totalTTC,
        paid_amount: paidAmount,
        remaining: Math.round((totalTTC - paidAmount) * 100) / 100,
        due_date: dueDate,
        status,
        created_at: `${m.year}-${String(m.month).padStart(2, '0')}-01T00:00:00Z`,
        updated_at: `${m.year}-${String(m.month).padStart(2, '0')}-01T00:00:00Z`,
      });
    }
  }

  return invoices;
}

// Helper: generate payments matching the paid / partially paid invoices
function generatePayments(invoices) {
  const payments = [];
  let paymentCounter = 1;

  for (const inv of invoices) {
    if (inv.paid_amount <= 0) continue;

    if (inv.status === 'paid') {
      payments.push({
        id: `pay-${String(paymentCounter).padStart(3, '0')}`,
        invoice_id: inv.id,
        lease_id: inv.lease_id,
        tenant_id: inv.tenant_id,
        amount: inv.paid_amount,
        date: inv.due_date.replace('-05', '-03'), // paid 2 days before due
        method: paymentCounter % 3 === 0 ? 'cheque' : 'virement',
        reference: `VIR-${inv.period_label.replace(' ', '-').toUpperCase()}`,
        notes: null,
        created_at: inv.due_date.replace('-05', '-03') + 'T10:00:00Z',
      });
      paymentCounter++;
    } else if (inv.status === 'partially_paid') {
      payments.push({
        id: `pay-${String(paymentCounter).padStart(3, '0')}`,
        invoice_id: inv.id,
        lease_id: inv.lease_id,
        tenant_id: inv.tenant_id,
        amount: inv.paid_amount,
        date: inv.due_date.replace('-05', '-06'), // paid 1 day late
        method: 'virement',
        reference: `VIR-PARTIEL-${inv.period_label.replace(' ', '-').toUpperCase()}`,
        notes: 'Paiement partiel',
        created_at: inv.due_date.replace('-05', '-06') + 'T14:00:00Z',
      });
      paymentCounter++;
    }
  }

  return payments;
}

export const demoInvoices = generateInvoices();
export const demoPayments = generatePayments(demoInvoices);

// All demo data bundled
export const allDemoData = {
  structures: demoStructures,
  properties: demoProperties,
  tenants: demoTenants,
  leases: demoLeases,
  invoices: demoInvoices,
  payments: demoPayments,
};
