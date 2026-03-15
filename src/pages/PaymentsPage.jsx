import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineBanknotes, HiOutlinePlus } from 'react-icons/hi2'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'
import InputField from '../components/ui/InputField'
import SelectField from '../components/ui/SelectField'
import EmptyState from '../components/ui/EmptyState'
import { usePaymentStore } from '../store/paymentStore'
import { useInvoiceStore } from '../store/invoiceStore'
import { useTenantStore } from '../store/tenantStore'
import { usePropertyStore } from '../store/propertyStore'
import { PAYMENT_METHODS } from '../lib/constants'
import { formatCurrency, formatDate } from '../lib/formatters'

const paymentMethodOptions = Object.entries(PAYMENT_METHODS).map(([value, label]) => ({ value, label }))
const allMethodOptions = [{ value: '', label: 'Toutes methodes' }, ...paymentMethodOptions]

export default function PaymentsPage() {
  const { payments, createPayment } = usePaymentStore()
  const invoices = useInvoiceStore((s) => s.invoices)
  const tenants = useTenantStore((s) => s.tenants)
  const properties = usePropertyStore((s) => s.properties)

  const [filterMethod, setFilterMethod] = useState('')
  const [filterDateFrom, setFilterDateFrom] = useState('')
  const [filterDateTo, setFilterDateTo] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    invoice_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'virement',
    reference: '',
    notes: '',
  })

  const pendingInvoices = useMemo(
    () => invoices.filter((i) => i.status === 'pending' || i.status === 'partially_paid'),
    [invoices]
  )

  const invoiceOptions = useMemo(
    () =>
      pendingInvoices.map((i) => {
        const t = tenants.find((t) => t.id === i.tenant_id)
        const label = `${i.id} - ${t ? `${t.first_name} ${t.last_name}` : ''} - ${i.period_label} (${formatCurrency(i.remaining)} du)`
        return { value: i.id, label }
      }),
    [pendingInvoices, tenants]
  )

  const filtered = useMemo(() => {
    let result = [...payments].sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    if (filterMethod) result = result.filter((p) => p.method === filterMethod)
    if (filterDateFrom) result = result.filter((p) => p.date >= filterDateFrom)
    if (filterDateTo) result = result.filter((p) => p.date <= filterDateTo)
    return result
  }, [payments, filterMethod, filterDateFrom, filterDateTo])

  const columns = [
    { key: 'date', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    {
      key: 'tenant_id',
      label: 'Locataire',
      render: (_, row) => {
        const t = tenants.find((t) => t.id === row.tenant_id)
        if (t) return <span className="font-medium">{t.first_name} {t.last_name}</span>
        // Fallback: find through invoice
        const inv = invoices.find((i) => i.id === row.invoice_id)
        if (inv) {
          const t2 = tenants.find((t) => t.id === inv.tenant_id)
          return t2 ? <span className="font-medium">{t2.first_name} {t2.last_name}</span> : '-'
        }
        return '-'
      },
    },
    {
      key: 'property',
      label: 'Bien',
      render: (_, row) => {
        const inv = invoices.find((i) => i.id === row.invoice_id)
        if (inv) {
          const p = properties.find((p) => p.id === inv.property_id)
          return p?.name || '-'
        }
        return '-'
      },
    },
    { key: 'invoice_id', label: 'N° Facture', render: (v) => <span className="font-mono text-xs">{v || '-'}</span> },
    { key: 'amount', label: 'Montant', sortable: true, render: (v) => <span className="font-medium text-emerald-700">{formatCurrency(v)}</span> },
    {
      key: 'method',
      label: 'Methode',
      render: (v) => PAYMENT_METHODS[v] || v || '-',
    },
    { key: 'reference', label: 'Reference', render: (v) => v || '-' },
  ]

  const openCreate = () => {
    setForm({
      invoice_id: '',
      amount: '',
      date: new Date().toISOString().split('T')[0],
      method: 'virement',
      reference: '',
      notes: '',
    })
    setShowModal(true)
  }

  const handleInvoiceSelect = (invoiceId) => {
    const inv = invoices.find((i) => i.id === invoiceId)
    setForm((prev) => ({
      ...prev,
      invoice_id: invoiceId,
      amount: inv ? String(inv.remaining) : prev.amount,
    }))
  }

  const handleSave = () => {
    if (!form.invoice_id || !form.amount) return
    const inv = invoices.find((i) => i.id === form.invoice_id)
    createPayment({
      invoice_id: form.invoice_id,
      lease_id: inv?.lease_id,
      tenant_id: inv?.tenant_id,
      amount: Number(form.amount),
      date: form.date,
      method: form.method,
      reference: form.reference,
      notes: form.notes,
    })
    setShowModal(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Paiements"
        icon={HiOutlineBanknotes}
        action={
          <Button icon={HiOutlinePlus} onClick={openCreate}>
            Enregistrer un paiement
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <InputField
          type="date"
          value={filterDateFrom}
          onChange={(e) => setFilterDateFrom(e.target.value)}
          placeholder="Du"
          className="w-40"
        />
        <InputField
          type="date"
          value={filterDateTo}
          onChange={(e) => setFilterDateTo(e.target.value)}
          placeholder="Au"
          className="w-40"
        />
        <SelectField
          options={allMethodOptions}
          value={filterMethod}
          onChange={(e) => setFilterMethod(e.target.value)}
          className="w-48"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineBanknotes}
          title="Aucun paiement"
          description="Aucun paiement ne correspond a vos filtres."
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          emptyMessage="Aucun paiement enregistre"
        />
      )}

      {/* Create Payment Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Enregistrer un paiement" size="md">
        <div className="space-y-4">
          <SelectField
            label="Facture"
            required
            options={invoiceOptions}
            value={form.invoice_id}
            onChange={(e) => handleInvoiceSelect(e.target.value)}
            placeholder="Selectionnez une facture"
          />
          <InputField
            label="Montant"
            type="number"
            required
            value={form.amount}
            onChange={(e) => setForm((prev) => ({ ...prev, amount: e.target.value }))}
            helper="Pre-rempli avec le montant restant du"
          />
          <InputField
            label="Date"
            type="date"
            value={form.date}
            onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
          />
          <SelectField
            label="Methode de paiement"
            options={paymentMethodOptions}
            value={form.method}
            onChange={(e) => setForm((prev) => ({ ...prev, method: e.target.value }))}
          />
          <InputField
            label="Reference"
            value={form.reference}
            onChange={(e) => setForm((prev) => ({ ...prev, reference: e.target.value }))}
            placeholder="Ex: VIR-2026-03-001"
          />
          <div>
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none"
              placeholder="Notes optionnelles..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer le paiement</Button>
        </div>
      </Modal>
    </motion.div>
  )
}
