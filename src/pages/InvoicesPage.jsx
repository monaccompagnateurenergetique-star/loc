import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  HiOutlineDocumentCurrencyEuro,
  HiOutlinePlus,
  HiOutlineArrowDownTray,
  HiOutlineBanknotes,
  HiOutlineEye,
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
import { useLeaseStore } from '../store/leaseStore'
import { INVOICE_STATUSES, PAYMENT_METHODS } from '../lib/constants'
import { formatCurrency, formatDate } from '../lib/formatters'
import { generateQuittancePDF } from '../lib/generateQuittancePDF'

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
  const leases = useLeaseStore((s) => s.leases)

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

  const [showPdfPreview, setShowPdfPreview] = useState(false)
  const [pdfUrl, setPdfUrl] = useState(null)

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
    { key: 'id', label: 'N°', render: (v) => <span className="font-mono text-xs text-slate-500">{v?.slice(-8)}</span> },
    {
      key: 'tenant_id',
      label: 'Locataire',
      render: (_, row) => {
        const t = tenants.find((t) => t.id === row.tenant_id)
        return t ? <span className="font-medium text-slate-900">{t.first_name} {t.last_name}</span> : '-'
      },
    },
    {
      key: 'property_id',
      label: 'Bien',
      render: (_, row) => {
        const p = properties.find((p) => p.id === row.property_id)
        return <span className="text-slate-600">{p?.name || '-'}</span>
      },
    },
    { key: 'period_label', label: 'Periode', render: (v) => <span className="text-slate-600">{v}</span> },
    { key: 'total_ttc', label: 'Montant', sortable: true, render: (v) => <span className="font-semibold">{formatCurrency(v)}</span> },
    { key: 'paid_amount', label: 'Paye', render: (v) => <span className="text-slate-500">{formatCurrency(v)}</span> },
    {
      key: 'status',
      label: 'Statut',
      render: (v) => {
        const info = INVOICE_STATUSES[v]
        if (!info) return v
        const variant = v === 'paid' ? 'success' : v === 'pending' ? 'warning' : v === 'partially_paid' ? 'info' : 'danger'
        return <Badge variant={variant} dot>{info.label}</Badge>
      },
    },
    {
      key: 'actions',
      label: '',
      render: (_, row) => (
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="xs"
            icon={HiOutlineEye}
            onClick={(e) => { e.stopPropagation(); handlePreviewPDF(row) }}
            title="Voir le PDF"
          />
          <Button
            variant="ghost"
            size="xs"
            icon={HiOutlineArrowDownTray}
            onClick={(e) => { e.stopPropagation(); handleDownloadPDF(row) }}
            title="Telecharger le PDF"
          />
          {row.status !== 'paid' && (
            <Button
              variant="ghost"
              size="xs"
              icon={HiOutlineBanknotes}
              onClick={(e) => { e.stopPropagation(); openPayment(row) }}
              className="text-emerald-600 hover:bg-emerald-50"
              title="Enregistrer un paiement"
            />
          )}
        </div>
      ),
    },
  ]

  const getInvoiceData = (invoice) => {
    const tenant = tenants.find((t) => t.id === invoice.tenant_id)
    const property = properties.find((p) => p.id === invoice.property_id)
    const structure = structures.find((s) => s.id === invoice.structure_id)
    const lease = leases.find((l) => l.id === invoice.lease_id)
    return { invoice, tenant, property, structure, lease }
  }

  const handleDownloadPDF = (invoice) => {
    try {
      generateQuittancePDF(getInvoiceData(invoice))
      toast.success('PDF telecharge')
    } catch (err) {
      toast.error('Erreur lors de la generation du PDF')
      console.error(err)
    }
  }

  const handlePreviewPDF = (invoice) => {
    try {
      const { default: jsPDF } = { default: null }
      const data = getInvoiceData(invoice)
      // Generate PDF as blob for preview
      const { generateQuittancePDFBlob } = require('../lib/generateQuittancePDF')
      if (typeof generateQuittancePDFBlob === 'function') {
        const blob = generateQuittancePDFBlob(data)
        const url = URL.createObjectURL(blob)
        setPdfUrl(url)
        setShowPdfPreview(true)
      } else {
        // fallback: just download
        handleDownloadPDF(invoice)
      }
    } catch {
      // fallback: just download
      handleDownloadPDF(invoice)
    }
  }

  const handleGenerate = () => {
    const result = generateMonthlyInvoices(Number(genYear), Number(genMonth))
    setGenerateResult(result)
    if (result && result.length > 0) {
      toast.success(`${result.length} quittance(s) generee(s)`)
    } else {
      toast('Toutes les quittances existent deja', { icon: 'ℹ️' })
    }
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
    toast.success('Paiement enregistre')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
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

      {/* Filters - responsive */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <SelectField
          options={yearOptions}
          value={filterYear}
          onChange={(e) => setFilterYear(e.target.value)}
          className="w-full sm:w-32"
        />
        <SelectField
          options={monthOptions}
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="w-full sm:w-40"
        />
        <SelectField
          options={statusOptions}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="w-full sm:w-44"
        />
        <SelectField
          options={structureOptions}
          value={filterStructure}
          onChange={(e) => setFilterStructure(e.target.value)}
          className="w-full sm:w-44"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineDocumentCurrencyEuro}
          title="Aucune facture"
          description="Generez les quittances pour le mois en cours."
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
      <Modal
        isOpen={showGenerate}
        onClose={() => setShowGenerate(false)}
        title="Generer les quittances"
        subtitle="Generation automatique pour tous les baux actifs"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowGenerate(false)}>Fermer</Button>
            {!generateResult && <Button onClick={handleGenerate}>Generer</Button>}
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex gap-3">
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
            <div className="rounded-xl bg-slate-50 p-4">
              {generateResult.length > 0 ? (
                <>
                  <p className="text-sm font-medium text-emerald-700">{generateResult.length} quittance(s) generee(s)</p>
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
      </Modal>

      {/* Payment Modal */}
      <Modal
        isOpen={showPayment}
        onClose={() => setShowPayment(false)}
        title="Enregistrer un paiement"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowPayment(false)}>Annuler</Button>
            <Button variant="success" onClick={handlePayment}>Enregistrer</Button>
          </div>
        }
      >
        {paymentInvoice && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-500">Facture</p>
                  <p className="text-sm font-medium text-slate-900">{paymentInvoice.period_label}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Reste du</p>
                  <p className="text-sm font-bold text-slate-900">{formatCurrency(paymentInvoice.remaining)}</p>
                </div>
              </div>
            </div>
            <InputField
              label="Montant du paiement"
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
          </div>
        )}
      </Modal>
    </motion.div>
  )
}
