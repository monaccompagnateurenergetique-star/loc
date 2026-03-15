import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  HiOutlineDocumentCurrencyEuro,
  HiOutlinePlus,
  HiOutlineArrowDownTray,
  HiOutlineBanknotes,
} from 'react-icons/hi2'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Table from '../components/ui/Table'
import SelectField from '../components/ui/SelectField'
import InputField from '../components/ui/InputField'
import EmptyState from '../components/ui/EmptyState'
import { useInvoiceStore } from '../store/invoiceStore'
import { usePaymentStore } from '../store/paymentStore'
import { useTenantStore } from '../store/tenantStore'
import { usePropertyStore } from '../store/propertyStore'
import { useStructureStore } from '../store/structureStore'
import { INVOICE_STATUSES, PAYMENT_METHODS } from '../lib/constants'
import { formatCurrency, formatDate } from '../lib/formatters'

const currentYear = new Date().getFullYear()
const yearOptions = Array.from({ length: 3 }, (_, i) => ({
  value: String(currentYear - 1 + i),
  label: String(currentYear - 1 + i),
}))
const monthOptions = [
  { value: '', label: 'Tous les mois' },
  { value: '1', label: 'Janvier' },
  { value: '2', label: 'Fevrier' },
  { value: '3', label: 'Mars' },
  { value: '4', label: 'Avril' },
  { value: '5', label: 'Mai' },
  { value: '6', label: 'Juin' },
  { value: '7', label: 'Juillet' },
  { value: '8', label: 'Aout' },
  { value: '9', label: 'Septembre' },
  { value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' },
  { value: '12', label: 'Decembre' },
]
const statusOptions = [
  { value: '', label: 'Tous les statuts' },
  ...Object.entries(INVOICE_STATUSES).map(([value, { label }]) => ({ value, label })),
]
const paymentMethodOptions = Object.entries(PAYMENT_METHODS).map(([value, label]) => ({ value, label }))

export default function InvoicesPage() {
  const { invoices, generateMonthlyInvoices } = useInvoiceStore()
  const { createPayment } = usePaymentStore()
  const tenants = useTenantStore((s) => s.tenants)
  const properties = usePropertyStore((s) => s.properties)
  const structures = useStructureStore((s) => s.structures)

  const [filterYear, setFilterYear] = useState(String(currentYear))
  const [filterMonth, setFilterMonth] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStructure, setFilterStructure] = useState('')

  const [showGenerate, setShowGenerate] = useState(false)
  const [genYear, setGenYear] = useState(String(currentYear))
  const [genMonth, setGenMonth] = useState(String(new Date().getMonth() + 1))
  const [generateResult, setGenerateResult] = useState(null)

  const [showPayment, setShowPayment] = useState(false)
  const [paymentInvoice, setPaymentInvoice] = useState(null)
  const [paymentForm, setPaymentForm] = useState({ amount: '', date: '', method: 'virement', reference: '', notes: '' })

  const structureOptions = useMemo(
    () => [{ value: '', label: 'Toutes structures' }, ...structures.map((s) => ({ value: s.id, label: s.name }))],
    [structures]
  )

  const filtered = useMemo(() => {
    let result = [...invoices]
    if (filterYear) result = result.filter((i) => i.year === Number(filterYear))
    if (filterMonth) result = result.filter((i) => i.month === Number(filterMonth))
    if (filterStatus) result = result.filter((i) => i.status === filterStatus)
    if (filterStructure) result = result.filter((i) => i.structure_id === filterStructure)
    return result.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      if (a.month !== b.month) return b.month - a.month
      return (a.id || '').localeCompare(b.id || '')
    })
  }, [invoices, filterYear, filterMonth, filterStatus, filterStructure])

  const columns = [
    { key: 'id', label: 'N° Facture', render: (v) => <span className="font-mono text-xs">{v}</span> },
    {
      key: 'tenant_id',
      label: 'Locataire',
      render: (_, row) => {
        const t = tenants.find((t) => t.id === row.tenant_id)
        return t ? <span className="font-medium">{t.first_name} {t.last_name}</span> : '-'
      },
    },
    {
      key: 'property_id',
      label: 'Bien',
      render: (_, row) => {
        const p = properties.find((p) => p.id === row.property_id)
        return p?.name || '-'
      },
    },
    { key: 'period_label', label: 'Periode' },
    { key: 'total_ttc', label: 'Montant TTC', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'paid_amount', label: 'Paye', render: (v) => formatCurrency(v) },
    {
      key: 'status',
      label: 'Statut',
      render: (v) => {
        const info = INVOICE_STATUSES[v]
        if (!info) return v
        const variant = v === 'paid' ? 'success' : v === 'pending' ? 'warning' : v === 'partially_paid' ? 'info' : 'danger'
        return <Badge variant={variant}>{info.label}</Badge>
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_, row) => (
        <div className="flex gap-1">
          {row.status !== 'paid' && (
            <Button
              variant="ghost"
              size="sm"
              icon={HiOutlineBanknotes}
              onClick={(e) => { e.stopPropagation(); openPayment(row) }}
            >
              Payer
            </Button>
          )}
        </div>
      ),
    },
  ]

  const handleGenerate = () => {
    const result = generateMonthlyInvoices(Number(genYear), Number(genMonth))
    setGenerateResult(result)
  }

  const openPayment = (invoice) => {
    setPaymentInvoice(invoice)
    setPaymentForm({
      amount: String(invoice.remaining || invoice.total_ttc),
      date: new Date().toISOString().split('T')[0],
      method: 'virement',
      reference: '',
      notes: '',
    })
    setShowPayment(true)
  }

  const handlePayment = () => {
    if (!paymentInvoice || !paymentForm.amount) return
    createPayment({
      invoice_id: paymentInvoice.id,
      lease_id: paymentInvoice.lease_id,
      tenant_id: paymentInvoice.tenant_id,
      amount: Number(paymentForm.amount),
      date: paymentForm.date,
      method: paymentForm.method,
      reference: paymentForm.reference,
      notes: paymentForm.notes,
    })
    setShowPayment(false)
    setPaymentInvoice(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Facturation"
        icon={HiOutlineDocumentCurrencyEuro}
        action={
          <Button icon={HiOutlinePlus} onClick={() => { setGenerateResult(null); setShowGenerate(true) }}>
            Generer quittances
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <SelectField
          options={yearOptions}
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="w-32"
        />
        <SelectField
          options={monthOptions}
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-40"
        />
        <SelectField
          options={statusOptions}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-48"
        />
        <SelectField
          options={structureOptions}
          value={filterStructure}
          onChange={(e) => setFilterStructure(e.target.value)}
          className="w-48"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineDocumentCurrencyEuro}
          title="Aucune facture"
          description="Aucune facture ne correspond a vos filtres. Generez les quittances pour le mois en cours."
          action={
            <Button icon={HiOutlinePlus} onClick={() => setShowGenerate(true)}>
              Generer quittances
            </Button>
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          emptyMessage="Aucune facture trouvee"
        />
      )}

      {/* Generate Modal */}
      <Modal isOpen={showGenerate} onClose={() => setShowGenerate(false)} title="Generer les quittances mensuelles" size="md">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Selectionnez le mois et l'annee pour generer automatiquement les quittances pour tous les baux actifs.
          </p>
          <div className="flex gap-4">
            <SelectField
              label="Annee"
              options={yearOptions}
              value={genYear}
              onChange={(e) => setGenYear(e.target.value)}
              className="flex-1"
            />
            <SelectField
              label="Mois"
              options={monthOptions.filter((m) => m.value !== '')}
              value={genMonth}
              onChange={(e) => setGenMonth(e.target.value)}
              className="flex-1"
            />
          </div>

          {generateResult && (
            <div className="rounded-lg bg-slate-50 p-4">
              {generateResult.length > 0 ? (
                <>
                  <p className="text-sm font-medium text-emerald-700">{generateResult.length} quittance(s) generee(s) avec succes !</p>
                  <ul className="mt-2 space-y-1">
                    {generateResult.map((inv) => {
                      const t = tenants.find((t) => t.id === inv.tenant_id)
                      return (
                        <li key={inv.id} className="text-sm text-slate-600">
                          {t ? `${t.first_name} ${t.last_name}` : inv.tenant_id} - {formatCurrency(inv.total_ttc)}
                        </li>
                      )
                    })}
                  </ul>
                </>
              ) : (
                <p className="text-sm text-amber-700">Toutes les quittances existent deja pour cette periode.</p>
              )}
            </div>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowGenerate(false)}>Fermer</Button>
          {!generateResult && <Button onClick={handleGenerate}>Generer</Button>}
        </div>
      </Modal>

      {/* Payment Modal */}
      <Modal isOpen={showPayment} onClose={() => setShowPayment(false)} title="Enregistrer un paiement" size="md">
        {paymentInvoice && (
          <div className="space-y-4">
            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-sm text-slate-600">
                Facture: <span className="font-mono font-medium">{paymentInvoice.id}</span> - {paymentInvoice.period_label}
              </p>
              <p className="text-sm text-slate-600">
                Montant TTC: {formatCurrency(paymentInvoice.total_ttc)} | Reste du: {formatCurrency(paymentInvoice.remaining)}
              </p>
            </div>
            <InputField
              label="Montant"
              type="number"
              required
              value={paymentForm.amount}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, amount: e.target.value }))}
            />
            <InputField
              label="Date"
              type="date"
              value={paymentForm.date}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, date: e.target.value }))}
            />
            <SelectField
              label="Methode de paiement"
              options={paymentMethodOptions}
              value={paymentForm.method}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, method: e.target.value }))}
            />
            <InputField
              label="Reference"
              value={paymentForm.reference}
              onChange={(e) => setPaymentForm((prev) => ({ ...prev, reference: e.target.value }))}
              placeholder="Ex: VIR-2026-03"
            />
            <div>
              <label className="block text-sm font-medium text-slate-700">Notes</label>
              <textarea
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm((prev) => ({ ...prev, notes: e.target.value }))}
                rows={2}
                className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none"
              />
            </div>
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowPayment(false)}>Annuler</Button>
          <Button onClick={handlePayment}>Enregistrer le paiement</Button>
        </div>
      </Modal>
    </motion.div>
  )
}
