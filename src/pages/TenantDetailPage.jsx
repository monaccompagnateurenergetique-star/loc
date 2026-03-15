import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineUsers,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowLeft,
} from 'react-icons/hi2'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Stat from '../components/ui/Stat'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import InputField from '../components/ui/InputField'
import SelectField from '../components/ui/SelectField'
import Table from '../components/ui/Table'
import { useTenantStore } from '../store/tenantStore'
import { useLeaseStore } from '../store/leaseStore'
import { usePropertyStore } from '../store/propertyStore'
import { usePaymentStore } from '../store/paymentStore'
import { useInvoiceStore } from '../store/invoiceStore'
import { formatCurrency, formatDate, formatPhoneNumber } from '../lib/formatters'

const idTypeOptions = [
  { value: 'CNI', label: 'Carte Nationale d\'Identite' },
  { value: 'Passport', label: 'Passeport' },
  { value: 'Titre_sejour', label: 'Titre de sejour' },
]

export default function TenantDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { tenants, updateTenant, deleteTenant } = useTenantStore()
  const leases = useLeaseStore((s) => s.leases)
  const properties = usePropertyStore((s) => s.properties)
  const payments = usePaymentStore((s) => s.payments)
  const invoices = useInvoiceStore((s) => s.invoices)

  const tenant = useMemo(() => tenants.find((t) => t.id === id), [tenants, id])
  const tenantLeases = useMemo(() => leases.filter((l) => l.tenant_id === id), [leases, id])
  const activeLease = useMemo(() => tenantLeases.find((l) => l.is_active), [tenantLeases])
  const activeProperty = useMemo(
    () => (activeLease ? properties.find((p) => p.id === activeLease.property_id) : null),
    [activeLease, properties]
  )

  const tenantPayments = useMemo(() => {
    const tenantInvoiceIds = new Set(invoices.filter((i) => i.tenant_id === id).map((i) => i.id))
    return payments
      .filter((p) => p.tenant_id === id || tenantInvoiceIds.has(p.invoice_id))
      .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
  }, [payments, invoices, id])

  const totalPaid = useMemo(() => tenantPayments.reduce((sum, p) => sum + p.amount, 0), [tenantPayments])

  const outstanding = useMemo(() => {
    const tenantInvoices = invoices.filter((i) => i.tenant_id === id)
    return tenantInvoices.reduce((sum, i) => sum + (i.remaining || 0), 0)
  }, [invoices, id])

  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [form, setForm] = useState({})

  const openEdit = () => {
    setForm({
      first_name: tenant.first_name || '',
      last_name: tenant.last_name || '',
      email: tenant.email || '',
      phone: tenant.phone || '',
      date_of_birth: tenant.date_of_birth || '',
      place_of_birth: tenant.place_of_birth || '',
      id_type: tenant.id_type || 'CNI',
      id_number: tenant.id_number || '',
      emergency_contact_name: tenant.emergency_contact_name || tenant.guarantor?.name || '',
      emergency_contact_phone: tenant.emergency_contact_phone || tenant.guarantor?.phone || '',
      employer_name: tenant.employer_name || tenant.profession || '',
      monthly_income: tenant.monthly_income || '',
      notes: tenant.notes || '',
    })
    setShowEdit(true)
  }

  const handleSave = () => {
    updateTenant(id, {
      ...form,
      monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
    })
    setShowEdit(false)
  }

  const handleDelete = () => {
    deleteTenant(id)
    navigate('/tenants')
  }

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const paymentColumns = [
    { key: 'date', label: 'Date', sortable: true, render: (v) => formatDate(v) },
    { key: 'amount', label: 'Montant', render: (v) => formatCurrency(v) },
    {
      key: 'method',
      label: 'Methode',
      render: (v) => v || '-',
    },
    { key: 'reference', label: 'Reference', render: (v) => v || '-' },
    {
      key: 'invoice_id',
      label: 'Facture',
      render: (v) => v || '-',
    },
  ]

  if (!tenant) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Locataire introuvable.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/tenants')}>
          Retour aux locataires
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
      <Button variant="ghost" size="sm" icon={HiOutlineArrowLeft} onClick={() => navigate('/tenants')}>
        Retour
      </Button>

      <PageHeader
        title={`${tenant.first_name} ${tenant.last_name}`}
        icon={HiOutlineUsers}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={HiOutlinePencilSquare} onClick={openEdit}>Modifier</Button>
            <Button variant="danger" icon={HiOutlineTrash} onClick={() => setShowDelete(true)}>Supprimer</Button>
          </div>
        }
      />

      {/* Tenant info */}
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Email</p>
            <p className="mt-1 text-sm text-slate-900">{tenant.email || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Telephone</p>
            <p className="mt-1 text-sm text-slate-900">{formatPhoneNumber(tenant.phone)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Date de naissance</p>
            <p className="mt-1 text-sm text-slate-900">{formatDate(tenant.date_of_birth)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Piece d'identite</p>
            <p className="mt-1 text-sm text-slate-900">{tenant.id_type || '-'} - {tenant.id_number || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Profession</p>
            <p className="mt-1 text-sm text-slate-900">{tenant.profession || tenant.employer_name || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Revenus mensuels</p>
            <p className="mt-1 text-sm text-slate-900">{tenant.monthly_income ? formatCurrency(tenant.monthly_income) : '-'}</p>
          </div>
          {(tenant.guarantor || tenant.emergency_contact_name) && (
            <>
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">Contact d'urgence</p>
                <p className="mt-1 text-sm text-slate-900">
                  {tenant.emergency_contact_name || tenant.guarantor?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-slate-400">Tel. urgence</p>
                <p className="mt-1 text-sm text-slate-900">
                  {formatPhoneNumber(tenant.emergency_contact_phone || tenant.guarantor?.phone)}
                </p>
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Total paye" value={formatCurrency(totalPaid)} trend="up" />
        <Stat label="Solde restant" value={formatCurrency(outstanding)} trend={outstanding > 0 ? 'down' : 'neutral'} />
        <Stat label="Paiements" value={tenantPayments.length} />
      </div>

      {/* Current lease */}
      {activeLease && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Bail en cours</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">Bien</p>
              <p className="mt-0.5 text-sm font-medium text-slate-900">{activeProperty?.name || '-'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Loyer TTC</p>
              <p className="mt-0.5 text-sm font-medium text-slate-900">{formatCurrency(activeLease.monthly_rent + (activeLease.charges || 0))}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Debut</p>
              <p className="mt-0.5 text-sm text-slate-900">{formatDate(activeLease.start_date)}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Fin</p>
              <p className="mt-0.5 text-sm text-slate-900">{formatDate(activeLease.end_date)}</p>
            </div>
          </div>
          <div className="mt-3">
            <Button variant="ghost" size="sm" onClick={() => navigate(`/leases/${activeLease.id}`)}>
              Voir le bail
            </Button>
          </div>
        </Card>
      )}

      {/* Payment history */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Historique des paiements</h3>
        <Table
          columns={paymentColumns}
          data={tenantPayments}
          emptyMessage="Aucun paiement enregistre"
        />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier le locataire" size="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Prenom" required value={form.first_name || ''} onChange={(e) => updateField('first_name', e.target.value)} />
          <InputField label="Nom" required value={form.last_name || ''} onChange={(e) => updateField('last_name', e.target.value)} />
          <InputField label="Email" type="email" value={form.email || ''} onChange={(e) => updateField('email', e.target.value)} />
          <InputField label="Telephone" value={form.phone || ''} onChange={(e) => updateField('phone', e.target.value)} />
          <InputField label="Date de naissance" type="date" value={form.date_of_birth || ''} onChange={(e) => updateField('date_of_birth', e.target.value)} />
          <InputField label="Lieu de naissance" value={form.place_of_birth || ''} onChange={(e) => updateField('place_of_birth', e.target.value)} />
          <SelectField label="Type de piece d'identite" options={idTypeOptions} value={form.id_type || ''} onChange={(e) => updateField('id_type', e.target.value)} />
          <InputField label="N° piece d'identite" value={form.id_number || ''} onChange={(e) => updateField('id_number', e.target.value)} />
          <InputField label="Contact d'urgence (nom)" value={form.emergency_contact_name || ''} onChange={(e) => updateField('emergency_contact_name', e.target.value)} />
          <InputField label="Contact d'urgence (tel)" value={form.emergency_contact_phone || ''} onChange={(e) => updateField('emergency_contact_phone', e.target.value)} />
          <InputField label="Employeur / Profession" value={form.employer_name || ''} onChange={(e) => updateField('employer_name', e.target.value)} />
          <InputField label="Revenus mensuels" type="number" value={form.monthly_income || ''} onChange={(e) => updateField('monthly_income', e.target.value)} />
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

      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Supprimer le locataire"
        message="Etes-vous sur de vouloir supprimer ce locataire ?"
        confirmLabel="Supprimer"
      />
    </motion.div>
  )
}
