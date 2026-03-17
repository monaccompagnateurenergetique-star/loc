import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlinePlus,
  HiOutlineHomeModern,
  HiOutlineBuildingOffice,
  HiOutlineHome,
  HiOutlineBuildingStorefront,
  HiOutlinePencilSquare,
  HiOutlineTrash,
} from 'react-icons/hi2'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import SearchInput from '../components/ui/SearchInput'
import InputField from '../components/ui/InputField'
import SelectField from '../components/ui/SelectField'
import EmptyState from '../components/ui/EmptyState'
import { usePropertyStore } from '../store/propertyStore'
import { useStructureStore } from '../store/structureStore'
import { useLeaseStore } from '../store/leaseStore'
import { PROPERTY_TYPES, PROPERTY_STATUSES } from '../lib/constants'
import { formatCurrency, formatSurface } from '../lib/formatters'

const propertyTypeIcons = {
  appartement: HiOutlineBuildingOffice,
  maison: HiOutlineHome,
  local_commercial: HiOutlineBuildingStorefront,
  parking: HiOutlineHomeModern,
  cave: HiOutlineHomeModern,
}

const propertyTypeOptions = Object.entries(PROPERTY_TYPES).map(([value, { label }]) => ({ value, label }))
const statusOptions = Object.entries(PROPERTY_STATUSES).map(([value, { label }]) => ({ value, label }))

const emptyForm = {
  structure_id: '',
  type: 'appartement',
  name: '',
  address_line1: '',
  address_line2: '',
  postal_code: '',
  city: '',
  surface_m2: '',
  nb_rooms: '',
  floor: '',
  building: '',
  lot_number: '',
  notes: '',
}

export default function PropertiesPage() {
  const navigate = useNavigate()
  const { properties, createProperty, updateProperty, deleteProperty } = usePropertyStore()
  const structures = useStructureStore((s) => s.structures)
  const leases = useLeaseStore((s) => s.leases)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [structureFilter, setStructureFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const structureOptions = useMemo(
    () => structures.map((s) => ({ value: s.id, label: s.name })),
    [structures]
  )

  const filtered = useMemo(() => {
    let result = [...properties]
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          (p.address || p.address_line1 || '')?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q)
      )
    }
    if (typeFilter) result = result.filter((p) => p.type === typeFilter)
    if (statusFilter) result = result.filter((p) => p.status === statusFilter)
    if (structureFilter) result = result.filter((p) => p.structure_id === structureFilter)
    return result
  }, [properties, search, typeFilter, statusFilter, structureFilter])

  const getActiveRent = (propertyId) => {
    const lease = leases.find((l) => l.property_id === propertyId && l.is_active)
    return lease ? lease.monthly_rent + (lease.charges || 0) : null
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (property) => {
    setEditingId(property.id)
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
      floor: property.floor || '',
      building: property.building || '',
      lot_number: property.lot_number || '',
      notes: property.notes || property.description || '',
    })
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    const data = {
      ...form,
      address: form.address_line1 || '',
      surface: Number(form.surface_m2) || 0,
      rooms: Number(form.nb_rooms) || 0,
      floor: form.floor ? Number(form.floor) : null,
    }
    if (editingId) {
      updateProperty(editingId, data)
    } else {
      createProperty(data)
    }
    setShowModal(false)
    setEditingId(null)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProperty(deleteTarget)
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
        title="Biens Immobiliers"
        icon={HiOutlineHomeModern}
        action={
          <Button icon={HiOutlinePlus} onClick={openCreate}>
            Nouveau bien
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="w-64">
          <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un bien..." />
        </div>
        <SelectField
          options={[{ value: '', label: 'Tous les types' }, ...propertyTypeOptions]}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-44"
        />
        <SelectField
          options={[{ value: '', label: 'Tous les statuts' }, ...statusOptions]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-44"
        />
        <SelectField
          options={[{ value: '', label: 'Toutes structures' }, ...structureOptions]}
          value={structureFilter}
          onChange={(e) => setStructureFilter(e.target.value)}
          className="w-48"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineHomeModern}
          title="Aucun bien trouve"
          description="Aucun bien ne correspond a vos criteres de recherche."
          action={
            <Button icon={HiOutlinePlus} onClick={openCreate}>
              Nouveau bien
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((property) => {
            const statusInfo = PROPERTY_STATUSES[property.status] || PROPERTY_STATUSES.vacant
            const TypeIcon = propertyTypeIcons[property.type] || HiOutlineHomeModern
            const activeRent = getActiveRent(property.id)

            return (
              <Card key={property.id} hover className="cursor-pointer">
                <div onClick={() => navigate(`/properties/${property.id}`)}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                        <TypeIcon className="h-5 w-5 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{property.name}</h3>
                        <p className="text-sm text-slate-500">{property.address || property.address_line1 || '-'}</p>
                      </div>
                    </div>
                    <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm">
                    <div className="flex gap-3 text-slate-500">
                      {property.surface && <span>{formatSurface(property.surface)}</span>}
                      {(property.rooms || property.nb_rooms) && <span>{property.rooms || property.nb_rooms}p</span>}
                    </div>
                    <span className="font-semibold text-slate-900">
                      {activeRent ? formatCurrency(activeRent) : formatCurrency(property.monthly_rent)}/mois
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button variant="ghost" size="sm" icon={HiOutlinePencilSquare} onClick={(e) => { e.stopPropagation(); openEdit(property) }}>
                    Modifier
                  </Button>
                  <Button variant="ghost" size="sm" icon={HiOutlineTrash} onClick={(e) => { e.stopPropagation(); setDeleteTarget(property.id) }} className="text-red-600 hover:bg-red-50">
                    Supprimer
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Modifier le bien' : 'Nouveau bien'} size="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Structure" required options={structureOptions} value={form.structure_id} onChange={(e) => updateField('structure_id', e.target.value)} placeholder="Selectionnez une structure" />
          <SelectField label="Type" required options={propertyTypeOptions} value={form.type} onChange={(e) => updateField('type', e.target.value)} />
          <InputField label="Nom" required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Ex: Appartement Nice Centre" />
          <InputField label="Adresse" value={form.address_line1} onChange={(e) => updateField('address_line1', e.target.value)} placeholder="Numero et rue" />
          <InputField label="Complement" value={form.address_line2} onChange={(e) => updateField('address_line2', e.target.value)} />
          <InputField label="Code postal" value={form.postal_code} onChange={(e) => updateField('postal_code', e.target.value)} placeholder="06000" />
          <InputField label="Ville" value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Nice" />
          <InputField label="Surface (m²)" type="number" value={form.surface_m2} onChange={(e) => updateField('surface_m2', e.target.value)} />
          <InputField label="Nombre de pieces" type="number" value={form.nb_rooms} onChange={(e) => updateField('nb_rooms', e.target.value)} />
          <InputField label="Etage" type="number" value={form.floor} onChange={(e) => updateField('floor', e.target.value)} />
          <InputField label="Batiment" value={form.building} onChange={(e) => updateField('building', e.target.value)} />
          <InputField label="N° de lot" value={form.lot_number} onChange={(e) => updateField('lot_number', e.target.value)} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea value={form.notes} onChange={(e) => updateField('notes', e.target.value)} rows={3} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none" />
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
        title="Supprimer le bien"
        message="Etes-vous sur de vouloir supprimer ce bien ? Cette action est irreversible."
        confirmLabel="Supprimer"
      />
    </motion.div>
  )
}
