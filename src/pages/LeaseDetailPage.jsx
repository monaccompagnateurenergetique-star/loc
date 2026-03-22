import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineDocumentText,
  HiOutlinePencilSquare,
  HiOutlineArrowLeft,
  HiOutlineNoSymbol,
} from 'react-icons/hi2'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Stat from '../components/ui/Stat'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Table from '../components/ui/Table'
import Breadcrumb from '../components/ui/Breadcrumb'
import InputField from '../components/ui/InputField'
import SelectField from '../components/ui/SelectField'
import { useLeaseStore } from '../store/leaseStore'
import { usePropertyStore } from '../store/propertyStore'
import { useTenantStore } from '../store/tenantStore'
import { useInvoiceStore } from '../store/invoiceStore'
import { LEASE_TYPES, TVA_RATES, INVOICE_STATUSES } from '../lib/constants'
import { formatCurrency, formatDate } from '../lib/formatters'

const leaseTypeOptions = Object.entries(LEASE_TYPES).map(([value, { label }]) => ({ value, label }))

export default function LeaseDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { leases, updateLease, terminateLease } = useLeaseStore()
  const properties = usePropertyStore((s) => s.properties)
  const tenants = useTenantStore((s) => s.tenants)
  const invoices = useInvoiceStore((s) => s.invoices)

  const lease = useMemo(() => leases.find((l) => l.id === id), [leases, id])
  const property = useMemo(() => properties.find((p) => p.id === lease?.property_id), [properties, lease])
  const tenant = useMemo(() => tenants.find((t) => t.id === lease?.tenant_id), [tenants, lease])

  const leaseInvoices = useMemo(
    () => invoices.filter((i) => i.lease_id === id).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    }),
    [invoices, id]
  )

  const totalInvoiced = useMemo(() => leaseInvoices.reduce((sum, i) => sum + i.total_ttc, 0), [leaseInvoices])
  const totalCollected = useMemo(() => leaseInvoices.reduce((sum, i) => sum + i.paid_amount, 0), [leaseInvoices])
  const balance = totalInvoiced - totalCollected

  const [showEdit, setShowEdit] = useState(false)
  const [showTerminate, setShowTerminate] = useState(false)
  const [terminateReason, setTerminateReason] = useState('')
  const [form, setForm] = useState({})

  const openEdit = () => {
    setForm({
      type: lease.type || 'habitation_vide',
      monthly_rent: lease.monthly_rent || '',
      charges: lease.charges || '',
      start_date: lease.start_date || '',
      end_date: lease.end_date || '',
      deposit_amount: lease.deposit_amount || '',
      notes: lease.notes || '',
    })
    setShowEdit(true)
  }

  const handleSave = () => {
    updateLease(id, {
      ...form,
      monthly_rent: Number(form.monthly_rent) || 0,
      charges: Number(form.charges) || 0,
      deposit_amount: Number(form.deposit_amount) || 0,
    })
    setShowEdit(false)
  }

  const handleTerminate = () => {
    terminateLease(id, terminateReason || 'Resiliation')
    setShowTerminate(false)
    setTerminateReason('')
  }

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const invoiceColumns = [
    { key: 'period_label', label: 'Periode' },
    { key: 'total_ttc', label: 'Montant TTC', sortable: true, render: (v) => formatCurrency(v) },
    { key: 'paid_amount', label: 'Paye', render: (v) => formatCurrency(v) },
    { key: 'remaining', label: 'Reste', render: (v) => v > 0 ? <span className="text-red-600 font-medium">{formatCurrency(v)}</span> : formatCurrency(0) },
    { key: 'due_date', label: 'Echeance', render: (v) => formatDate(v) },
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
  ]

  if (!lease) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Bail introuvable.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/leases')}>
          Retour aux baux
        </Button>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Breadcrumb items={[
        { label: 'Baux', to: '/leases' },
        { label: tenant ? `${tenant.first_name} ${tenant.last_name}` : 'Bail' },
      ]} />

      <PageHeader
        title={`Bail - ${tenant ? `${tenant.first_name} ${tenant.last_name}` : id}`}
        icon={HiOutlineDocumentText}
        subtitle={
          <span className="flex items-center gap-2">
            {LEASE_TYPES[lease.type]?.label || lease.type}
            <Badge variant={lease.is_active ? 'success' : 'neutral'}>{lease.is_active ? 'Actif' : 'Termine'}</Badge>
          </span>
        }
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={HiOutlinePencilSquare} onClick={openEdit}>Modifier</Button>
            {lease.is_active && (
              <Button variant="danger" icon={HiOutlineNoSymbol} onClick={() => setShowTerminate(true)}>
                Resilier
              </Button>
            )}
          </div>
        }
      />

      {/* Lease info */}
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Loyer HT</p>
            <p className="mt-1 text-sm font-medium text-slate-900">{formatCurrency(lease.monthly_rent)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Charges</p>
            <p className="mt-1 text-sm text-slate-900">{formatCurrency(lease.charges)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">TVA</p>
            <p className="mt-1 text-sm text-slate-900">{lease.tva_rate ? `${lease.tva_rate}%` : 'Exonere'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Depot de garantie</p>
            <p className="mt-1 text-sm text-slate-900">{formatCurrency(lease.deposit_amount)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Debut</p>
            <p className="mt-1 text-sm text-slate-900">{formatDate(lease.start_date)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Fin</p>
            <p className="mt-1 text-sm text-slate-900">{formatDate(lease.end_date)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Duree</p>
            <p className="mt-1 text-sm text-slate-900">{lease.duration_months} mois</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Index de revision</p>
            <p className="mt-1 text-sm text-slate-900">{lease.revision_index || '-'}</p>
          </div>
          {lease.termination_date && (
            <>
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">Date de resiliation</p>
                <p className="mt-1 text-sm text-red-600">{formatDate(lease.termination_date)}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">Motif</p>
                <p className="mt-1 text-sm text-slate-900">{lease.termination_reason || '-'}</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Tenant & Property sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tenant */}
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Locataire</h3>
          {tenant ? (
            <div className="space-y-2">
              <p className="text-sm"><span className="text-slate-400">Nom:</span> <span className="font-medium text-slate-900">{tenant.first_name} {tenant.last_name}</span></p>
              <p className="text-sm"><span className="text-slate-400">Email:</span> {tenant.email || '-'}</p>
              <p className="text-sm"><span className="text-slate-400">Tel:</span> {tenant.phone || '-'}</p>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/tenants/${tenant.id}`)}>Voir le profil</Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Locataire non trouve</p>
          )}
        </Card>

        {/* Property */}
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Bien</h3>
          {property ? (
            <div className="space-y-2">
              <p className="text-sm"><span className="text-slate-400">Nom:</span> <span className="font-medium text-slate-900">{property.name}</span></p>
              <p className="text-sm"><span className="text-slate-400">Adresse:</span> {property.address || property.address_line1 || '-'}</p>
              <p className="text-sm"><span className="text-slate-400">Surface:</span> {property.surface ? `${property.surface} m²` : '-'}</p>
              <Button variant="ghost" size="sm" onClick={() => navigate(`/properties/${property.id}`)}>Voir le bien</Button>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Bien non trouve</p>
          )}
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Stat label="Total facture" value={formatCurrency(totalInvoiced)} />
        <Stat label="Total encaisse" value={formatCurrency(totalCollected)} trend="up" />
        <Stat label="Solde" value={formatCurrency(balance)} trend={balance > 0 ? 'down' : 'neutral'} />
      </div>

      {/* Invoice history */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Historique des factures</h3>
        <Table
          columns={invoiceColumns}
          data={leaseInvoices}
          emptyMessage="Aucune facture pour ce bail"
        />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier le bail" size="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Type de bail" options={leaseTypeOptions} value={form.type || ''} onChange={(e) => updateField('type', e.target.value)} />
          <InputField label="Loyer HT" type="number" value={form.monthly_rent ?? ''} onChange={(e) => updateField('monthly_rent', e.target.value)} />
          <InputField label="Charges" type="number" value={form.charges ?? ''} onChange={(e) => updateField('charges', e.target.value)} />
          <InputField label="Depot de garantie" type="number" value={form.deposit_amount ?? ''} onChange={(e) => updateField('deposit_amount', e.target.value)} />
          <InputField label="Date de debut" type="date" value={form.start_date || ''} onChange={(e) => updateField('start_date', e.target.value)} />
          <InputField label="Date de fin" type="date" value={form.end_date || ''} onChange={(e) => updateField('end_date', e.target.value)} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea value={form.notes || ''} onChange={(e) => updateField('notes', e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowEdit(false)}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </div>
      </Modal>

      {/* Terminate Confirm */}
      <Modal isOpen={showTerminate} onClose={() => setShowTerminate(false)} title="Resilier le bail" size="sm">
        <p className="text-sm text-slate-600">Etes-vous sur de vouloir resilier ce bail ? Le bien sera remis en statut vacant.</p>
        <div className="mt-4">
          <InputField
            label="Motif de resiliation"
            value={terminateReason}
            onChange={(e) => setTerminateReason(e.target.value)}
            placeholder="Ex: Depart du locataire"
          />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowTerminate(false)}>Annuler</Button>
          <Button variant="danger" onClick={handleTerminate}>Resilier le bail</Button>
        </div>
      </Modal>
    </motion.div>
  )
}
