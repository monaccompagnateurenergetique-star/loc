import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineHomeModern,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineArrowLeft,
  HiOutlineDocumentText,
  HiOutlinePlus,
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
import EmptyState from '../components/ui/EmptyState'
import { usePropertyStore } from '../store/propertyStore'
import { useStructureStore } from '../store/structureStore'
import { useLeaseStore } from '../store/leaseStore'
import { useTenantStore } from '../store/tenantStore'
import { useInvoiceStore } from '../store/invoiceStore'
import { PROPERTY_TYPES, PROPERTY_STATUSES } from '../lib/constants'
import { formatCurrency, formatDate, formatSurface } from '../lib/formatters'

const propertyTypeOptions = Object.entries(PROPERTY_TYPES).map(([value, { label }]) => ({ value, label }))

export default function PropertyDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { properties, updateProperty, deleteProperty } = usePropertyStore()
  const structures = useStructureStore((s) => s.structures)
  const leases = useLeaseStore((s) => s.leases)
  const tenants = useTenantStore((s) => s.tenants)
  const invoices = useInvoiceStore((s) => s.invoices)

  const property = useMemo(() => properties.find((p) => p.id === id), [properties, id])
  const structure = useMemo(() => structures.find((s) => s.id === property?.structure_id), [structures, property])

  const propertyLeases = useMemo(
    () => leases.filter((l) => l.property_id === id).sort((a, b) => b.start_date?.localeCompare(a.start_date)),
    [leases, id]
  )
  const activeLease = useMemo(() => propertyLeases.find((l) => l.is_active), [propertyLeases])
  const activeTenant = useMemo(
    () => (activeLease ? tenants.find((t) => t.id === activeLease.tenant_id) : null),
    [activeLease, tenants]
  )

  const totalRevenue = useMemo(() => {
    const propInvoices = invoices.filter((i) => i.property_id === id)
    return propInvoices.reduce((sum, i) => sum + i.paid_amount, 0)
  }, [invoices, id])

  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [form, setForm] = useState({})

  const structureOptions = useMemo(() => structures.map((s) => ({ value: s.id, label: s.name })), [structures])

  const openEdit = () => {
    setForm({
      structure_id: property.structure_id || '',
      type: property.type || 'appartement',
      name: property.name || '',
      address_line1: property.address_line1 || property.address || '',
      address_line2: property.address_line2 || '',
      postal_code: property.postal_code || '',
      city: property.city || '',
      surface_m2: property.surface_m2 || property.surface || '',
      nb_rooms: property.nb_rooms || property.rooms || '',
      floor: property.floor ?? '',
      building: property.building || '',
      lot_number: property.lot_number || '',
      notes: property.notes || property.description || '',
    })
    setShowEdit(true)
  }

  const handleSave = () => {
    updateProperty(id, {
      ...form,
      surface: Number(form.surface_m2) || 0,
      rooms: Number(form.nb_rooms) || 0,
      floor: form.floor !== '' ? Number(form.floor) : null,
    })
    setShowEdit(false)
  }

  const handleDelete = () => {
    deleteProperty(id)
    navigate('/properties')
  }

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  const leaseColumns = [
    {
      key: 'tenant',
      label: 'Locataire',
      render: (_, row) => {
        const t = tenants.find((t) => t.id === row.tenant_id)
        return t ? `${t.first_name} ${t.last_name}` : '-'
      },
    },
    { key: 'start_date', label: 'Debut', render: (v) => formatDate(v) },
    { key: 'end_date', label: 'Fin', render: (v) => formatDate(v) },
    { key: 'monthly_rent', label: 'Loyer', render: (v) => formatCurrency(v) },
    {
      key: 'is_active',
      label: 'Statut',
      render: (v) => <Badge variant={v ? 'success' : 'neutral'}>{v ? 'Actif' : 'Termine'}</Badge>,
    },
  ]

  if (!property) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Bien introuvable.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/properties')}>
          Retour aux biens
        </Button>
      </div>
    )
  }

  const statusInfo = PROPERTY_STATUSES[property.status] || PROPERTY_STATUSES.vacant

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <Button variant="ghost" size="sm" icon={HiOutlineArrowLeft} onClick={() => navigate('/properties')}>
        Retour
      </Button>

      <PageHeader
        title={property.name}
        icon={HiOutlineHomeModern}
        subtitle={
          <span className="flex items-center gap-2">
            {PROPERTY_TYPES[property.type]?.label || property.type}
            <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
          </span>
        }
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={HiOutlinePencilSquare} onClick={openEdit}>Modifier</Button>
            <Button variant="danger" icon={HiOutlineTrash} onClick={() => setShowDelete(true)}>Supprimer</Button>
          </div>
        }
      />

      {/* Property info */}
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Structure</p>
            <p className="mt-1 text-sm text-slate-900">{structure?.name || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Adresse</p>
            <p className="mt-1 text-sm text-slate-900">{property.address || property.address_line1 || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Ville</p>
            <p className="mt-1 text-sm text-slate-900">{property.city || '-'} {property.postal_code || ''}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Surface</p>
            <p className="mt-1 text-sm text-slate-900">{formatSurface(property.surface || property.surface_m2)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Pieces</p>
            <p className="mt-1 text-sm text-slate-900">{property.rooms || property.nb_rooms || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Etage</p>
            <p className="mt-1 text-sm text-slate-900">{property.floor != null ? property.floor : '-'}</p>
          </div>
          {(property.notes || property.description) && (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium uppercase text-slate-400">Description</p>
              <p className="mt-1 text-sm text-slate-900">{property.notes || property.description}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
        <Stat label="Revenu total encaisse" value={formatCurrency(totalRevenue)} />
        <Stat label="Loyer actuel" value={activeLease ? formatCurrency(activeLease.monthly_rent + (activeLease.charges || 0)) : '-'} />
        <Stat label="Baux" value={propertyLeases.length} />
      </div>

      {/* Current lease */}
      {activeLease && (
        <Card>
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Bail en cours</h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div>
              <p className="text-xs text-slate-400">Locataire</p>
              <p className="mt-0.5 text-sm font-medium text-slate-900">
                {activeTenant ? `${activeTenant.first_name} ${activeTenant.last_name}` : '-'}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Loyer</p>
              <p className="mt-0.5 text-sm font-medium text-slate-900">{formatCurrency(activeLease.monthly_rent)}</p>
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

      {property.status === 'vacant' && (
        <Card className="border-dashed">
          <EmptyState
            icon={HiOutlineDocumentText}
            title="Bien vacant"
            description="Ce bien n'a pas de bail actif."
            action={
              <Button icon={HiOutlinePlus} onClick={() => navigate('/leases')}>
                Creer un bail
              </Button>
            }
          />
        </Card>
      )}

      {/* Lease history */}
      <div>
        <h3 className="mb-3 text-lg font-semibold text-slate-900">Historique des baux</h3>
        <Table
          columns={leaseColumns}
          data={propertyLeases}
          onRowClick={(row) => navigate(`/leases/${row.id}`)}
          emptyMessage="Aucun bail pour ce bien"
        />
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier le bien" size="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Structure" options={structureOptions} value={form.structure_id || ''} onChange={(e) => updateField('structure_id', e.target.value)} placeholder="Selectionnez" />
          <SelectField label="Type" options={propertyTypeOptions} value={form.type || ''} onChange={(e) => updateField('type', e.target.value)} />
          <InputField label="Nom" required value={form.name || ''} onChange={(e) => updateField('name', e.target.value)} />
          <InputField label="Adresse" value={form.address_line1 || ''} onChange={(e) => updateField('address_line1', e.target.value)} />
          <InputField label="Complement" value={form.address_line2 || ''} onChange={(e) => updateField('address_line2', e.target.value)} />
          <InputField label="Code postal" value={form.postal_code || ''} onChange={(e) => updateField('postal_code', e.target.value)} />
          <InputField label="Ville" value={form.city || ''} onChange={(e) => updateField('city', e.target.value)} />
          <InputField label="Surface (m²)" type="number" value={form.surface_m2 ?? ''} onChange={(e) => updateField('surface_m2', e.target.value)} />
          <InputField label="Pieces" type="number" value={form.nb_rooms ?? ''} onChange={(e) => updateField('nb_rooms', e.target.value)} />
          <InputField label="Etage" type="number" value={form.floor ?? ''} onChange={(e) => updateField('floor', e.target.value)} />
          <InputField label="Batiment" value={form.building || ''} onChange={(e) => updateField('building', e.target.value)} />
          <InputField label="N° de lot" value={form.lot_number || ''} onChange={(e) => updateField('lot_number', e.target.value)} />
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
        title="Supprimer le bien"
        message="Etes-vous sur de vouloir supprimer ce bien ?"
        confirmLabel="Supprimer"
      />
    </motion.div>
  )
}
