import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlinePlus, HiOutlineDocumentText } from 'react-icons/hi2'
import PageHeader from '../components/layout/PageHeader'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import Modal from '../components/ui/Modal'
import Tabs from '../components/ui/Tabs'
import Table from '../components/ui/Table'
import InputField from '../components/ui/InputField'
import SelectField from '../components/ui/SelectField'
import EmptyState from '../components/ui/EmptyState'
import { useLeaseStore } from '../store/leaseStore'
import { usePropertyStore } from '../store/propertyStore'
import { useTenantStore } from '../store/tenantStore'
import { LEASE_TYPES, TVA_RATES, CHARGES_TYPES } from '../lib/constants'
import { formatCurrency, formatDate } from '../lib/formatters'

const leaseTypeOptions = Object.entries(LEASE_TYPES).map(([value, { label }]) => ({ value, label }))
const tvaOptions = TVA_RATES.map((r) => ({ value: String(r.value), label: r.label }))
const chargesTypeOptions = Object.entries(CHARGES_TYPES).map(([value, label]) => ({ value, label }))

const tabs = [
  { key: 'active', label: 'Actifs' },
  { key: 'terminated', label: 'Termines' },
  { key: 'all', label: 'Tous' },
]

const emptyForm = {
  property_id: '',
  tenant_id: '',
  type: 'habitation_vide',
  start_date: '',
  duration_months: 36,
  end_date: '',
  monthly_rent: '',
  tva_rate: '0',
  charges: '',
  charges_type: 'provision',
  deposit_amount: '',
  payment_due_day: '5',
  notes: '',
}

export default function LeasesPage() {
  const navigate = useNavigate()
  const { leases, createLease } = useLeaseStore()
  const properties = usePropertyStore((s) => s.properties)
  const tenants = useTenantStore((s) => s.tenants)

  const [activeTab, setActiveTab] = useState('active')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const vacantProperties = useMemo(
    () => properties.filter((p) => p.status === 'vacant'),
    [properties]
  )

  const propertyOptions = useMemo(
    () => vacantProperties.map((p) => ({ value: p.id, label: `${p.name} (${p.city || ''})` })),
    [vacantProperties]
  )

  const tenantOptions = useMemo(
    () => tenants.map((t) => ({ value: t.id, label: `${t.first_name} ${t.last_name}` })),
    [tenants]
  )

  const filtered = useMemo(() => {
    if (activeTab === 'active') return leases.filter((l) => l.is_active)
    if (activeTab === 'terminated') return leases.filter((l) => !l.is_active)
    return leases
  }, [leases, activeTab])

  const columns = [
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
        return p?.name || '-'
      },
    },
    { key: 'type', label: 'Type', render: (v) => LEASE_TYPES[v]?.label || v || '-' },
    {
      key: 'monthly_rent',
      label: 'Loyer TTC',
      sortable: true,
      render: (_, row) => formatCurrency((row.monthly_rent || 0) + (row.charges || 0)),
    },
    { key: 'start_date', label: 'Debut', sortable: true, render: (v) => formatDate(v) },
    { key: 'end_date', label: 'Fin', render: (v) => formatDate(v) },
    {
      key: 'is_active',
      label: 'Statut',
      render: (v) => <Badge variant={v ? 'success' : 'neutral'}>{v ? 'Actif' : 'Termine'}</Badge>,
    },
  ]

  const openCreate = () => {
    setForm(emptyForm)
    setShowModal(true)
  }

  const handleTypeChange = (type) => {
    const info = LEASE_TYPES[type]
    if (info) {
      const dur = info.duration
      const deposit = info.deposit
      const rent = Number(form.monthly_rent) || 0
      setForm((prev) => ({
        ...prev,
        type,
        duration_months: dur,
        deposit_amount: rent * deposit || '',
        end_date: prev.start_date ? calculateEndDate(prev.start_date, dur) : '',
      }))
    } else {
      setForm((prev) => ({ ...prev, type }))
    }
  }

  const handleStartDateChange = (startDate) => {
    const endDate = calculateEndDate(startDate, form.duration_months)
    setForm((prev) => ({ ...prev, start_date: startDate, end_date: endDate }))
  }

  const handleRentChange = (rent) => {
    const info = LEASE_TYPES[form.type]
    const depositMonths = info?.deposit || 1
    setForm((prev) => ({
      ...prev,
      monthly_rent: rent,
      deposit_amount: rent ? String(Number(rent) * depositMonths) : '',
    }))
  }

  const calculateEndDate = (start, months) => {
    if (!start || !months) return ''
    const d = new Date(start)
    d.setMonth(d.getMonth() + Number(months))
    d.setDate(d.getDate() - 1)
    return d.toISOString().split('T')[0]
  }

  const handleSave = () => {
    if (!form.property_id || !form.tenant_id || !form.start_date || !form.monthly_rent) return
    const prop = properties.find((p) => p.id === form.property_id)
    const structure_id = prop?.structure_id || ''
    createLease({
      ...form,
      structure_id,
      monthly_rent: Number(form.monthly_rent) || 0,
      charges: Number(form.charges) || 0,
      deposit_amount: Number(form.deposit_amount) || 0,
      tva_rate: Number(form.tva_rate) || 0,
      duration_months: Number(form.duration_months) || 36,
    })
    setShowModal(false)
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
        title="Baux"
        icon={HiOutlineDocumentText}
        action={
          <Button icon={HiOutlinePlus} onClick={openCreate}>
            Nouveau bail
          </Button>
        }
      />

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineDocumentText}
          title="Aucun bail"
          description={activeTab === 'active' ? 'Aucun bail actif pour le moment.' : 'Aucun bail dans cette categorie.'}
          action={
            <Button icon={HiOutlinePlus} onClick={openCreate}>
              Nouveau bail
            </Button>
          }
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          onRowClick={(row) => navigate(`/leases/${row.id}`)}
        />
      )}

      {/* Create Lease Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nouveau bail" size="xl">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField
            label="Bien (vacant uniquement)"
            required
            options={propertyOptions}
            value={form.property_id}
            onChange={(e) => updateField('property_id', e.target.value)}
            placeholder="Selectionnez un bien"
          />
          <SelectField
            label="Locataire"
            required
            options={tenantOptions}
            value={form.tenant_id}
            onChange={(e) => updateField('tenant_id', e.target.value)}
            placeholder="Selectionnez un locataire"
          />
          <SelectField
            label="Type de bail"
            required
            options={leaseTypeOptions}
            value={form.type}
            onChange={(e) => handleTypeChange(e.target.value)}
          />
          <InputField
            label="Date de debut"
            type="date"
            required
            value={form.start_date}
            onChange={(e) => handleStartDateChange(e.target.value)}
          />
          <InputField
            label="Duree (mois)"
            type="number"
            value={form.duration_months}
            onChange={(e) => {
              const dur = e.target.value
              updateField('duration_months', dur)
              if (form.start_date) updateField('end_date', calculateEndDate(form.start_date, dur))
            }}
          />
          <InputField
            label="Date de fin (auto-calculee)"
            type="date"
            value={form.end_date}
            onChange={(e) => updateField('end_date', e.target.value)}
          />
          <InputField
            label="Loyer HT (mensuel)"
            type="number"
            required
            value={form.monthly_rent}
            onChange={(e) => handleRentChange(e.target.value)}
            placeholder="950"
          />
          <SelectField
            label="Taux TVA"
            options={tvaOptions}
            value={form.tva_rate}
            onChange={(e) => updateField('tva_rate', e.target.value)}
          />
          <InputField
            label="Charges"
            type="number"
            value={form.charges}
            onChange={(e) => updateField('charges', e.target.value)}
            placeholder="120"
          />
          <SelectField
            label="Type de charges"
            options={chargesTypeOptions}
            value={form.charges_type}
            onChange={(e) => updateField('charges_type', e.target.value)}
          />
          <InputField
            label="Depot de garantie"
            type="number"
            value={form.deposit_amount}
            onChange={(e) => updateField('deposit_amount', e.target.value)}
            helper="Auto-calcule selon le type de bail"
          />
          <InputField
            label="Jour d'echeance (1-28)"
            type="number"
            value={form.payment_due_day}
            onChange={(e) => updateField('payment_due_day', e.target.value)}
            placeholder="5"
          />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none"
              placeholder="Conditions particulieres..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
          <Button onClick={handleSave}>Creer le bail</Button>
        </div>
      </Modal>
    </motion.div>
  )
}
