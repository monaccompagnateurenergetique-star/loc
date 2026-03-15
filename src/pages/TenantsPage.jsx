import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlinePlus, HiOutlineUsers } from 'react-icons/hi2'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import SearchInput from '../components/ui/SearchInput'
import InputField from '../components/ui/InputField'
import SelectField from '../components/ui/SelectField'
import Table from '../components/ui/Table'
import EmptyState from '../components/ui/EmptyState'
import { useTenantStore } from '../store/tenantStore'
import { useLeaseStore } from '../store/leaseStore'
import { usePropertyStore } from '../store/propertyStore'
import { formatCurrency, formatPhoneNumber } from '../lib/formatters'

const idTypeOptions = [
  { value: 'CNI', label: 'Carte Nationale d\'Identite' },
  { value: 'Passport', label: 'Passeport' },
  { value: 'Titre_sejour', label: 'Titre de sejour' },
]

const emptyForm = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  date_of_birth: '',
  place_of_birth: '',
  id_type: 'CNI',
  id_number: '',
  emergency_contact_name: '',
  emergency_contact_phone: '',
  employer_name: '',
  monthly_income: '',
  notes: '',
}

export default function TenantsPage() {
  const navigate = useNavigate()
  const { tenants, createTenant, updateTenant, deleteTenant } = useTenantStore()
  const leases = useLeaseStore((s) => s.leases)
  const properties = usePropertyStore((s) => s.properties)

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    if (!search) return tenants
    const q = search.toLowerCase()
    return tenants.filter(
      (t) =>
        t.first_name?.toLowerCase().includes(q) ||
        t.last_name?.toLowerCase().includes(q) ||
        t.email?.toLowerCase().includes(q) ||
        t.phone?.includes(q)
    )
  }, [tenants, search])

  const getTenantLease = (tenantId) => {
    return leases.find((l) => l.tenant_id === tenantId && l.is_active) || null
  }

  const columns = [
    {
      key: 'last_name',
      label: 'Nom',
      sortable: true,
      render: (_, row) => (
        <span className="font-medium text-slate-900">{row.first_name} {row.last_name}</span>
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (v) => <span className="text-slate-600">{v || '-'}</span>,
    },
    {
      key: 'phone',
      label: 'Telephone',
      render: (v) => formatPhoneNumber(v),
    },
    {
      key: 'property',
      label: 'Bien actuel',
      render: (_, row) => {
        const lease = getTenantLease(row.id)
        if (!lease) return <span className="text-slate-400">-</span>
        const prop = properties.find((p) => p.id === lease.property_id)
        return prop?.name || '-'
      },
    },
    {
      key: 'rent',
      label: 'Loyer mensuel',
      render: (_, row) => {
        const lease = getTenantLease(row.id)
        if (!lease) return <span className="text-slate-400">-</span>
        return formatCurrency(lease.monthly_rent + (lease.charges || 0))
      },
    },
  ]

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (tenant) => {
    setEditingId(tenant.id)
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
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.first_name.trim() || !form.last_name.trim()) return
    const data = {
      ...form,
      monthly_income: form.monthly_income ? Number(form.monthly_income) : null,
    }
    if (editingId) {
      updateTenant(editingId, data)
    } else {
      createTenant(data)
    }
    setShowModal(false)
    setEditingId(null)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteTenant(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Locataires"
        icon={HiOutlineUsers}
        action={
          <Button icon={HiOutlinePlus} onClick={openCreate}>
            Nouveau locataire
          </Button>
        }
      />

      <div className="max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un locataire..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineUsers}
          title="Aucun locataire"
          description="Ajoutez votre premier locataire pour commencer."
          action={
            <Button icon={HiOutlinePlus} onClick={openCreate}>
              Nouveau locataire
            </Button>
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          onRowClick={(row) => navigate(`/tenants/${row.id}`)}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Modifier le locataire' : 'Nouveau locataire'} size="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Prenom" required value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} placeholder="Sophie" />
          <InputField label="Nom" required value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)} placeholder="Durand" />
          <InputField label="Email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="sophie@email.fr" />
          <InputField label="Telephone" value={form.phone} onChange={(e) => updateField('phone', e.target.value)} placeholder="06 12 34 56 78" />
          <InputField label="Date de naissance" type="date" value={form.date_of_birth} onChange={(e) => updateField('date_of_birth', e.target.value)} />
          <InputField label="Lieu de naissance" value={form.place_of_birth} onChange={(e) => updateField('place_of_birth', e.target.value)} placeholder="Nice" />
          <SelectField label="Type de piece d'identite" options={idTypeOptions} value={form.id_type} onChange={(e) => updateField('id_type', e.target.value)} />
          <InputField label="N° piece d'identite" value={form.id_number} onChange={(e) => updateField('id_number', e.target.value)} />
          <InputField label="Contact d'urgence (nom)" value={form.emergency_contact_name} onChange={(e) => updateField('emergency_contact_name', e.target.value)} />
          <InputField label="Contact d'urgence (tel)" value={form.emergency_contact_phone} onChange={(e) => updateField('emergency_contact_phone', e.target.value)} />
          <InputField label="Employeur / Profession" value={form.employer_name} onChange={(e) => updateField('employer_name', e.target.value)} />
          <InputField label="Revenus mensuels" type="number" value={form.monthly_income} onChange={(e) => updateField('monthly_income', e.target.value)} placeholder="3200" />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none" placeholder="Notes supplementaires..." />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button onClick={handleSave}>{editingId ? 'Enregistrer' : 'Creer'}</Button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer le locataire"
        message="Etes-vous sur de vouloir supprimer ce locataire ?"
        confirmLabel="Supprimer"
      />
    </motion.div>
  )
}
