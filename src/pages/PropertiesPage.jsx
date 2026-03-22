import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  HiOutlinePlus,
  HiOutlineHomeModern,
  HiOutlineBuildingOffice,
  HiOutlineHome,
  HiOutlineBuildingStorefront,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineMapPin,
  HiOutlineSquare3Stack3D,
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
import FilterBar from '../components/ui/FilterBar'
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
  cave: HiOutlineSquare3Stack3D,
}

const statusColors = {
  occupied: 'success',
  vacant: 'warning',
  renovation: 'info',
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
    if (!form.name.trim()) {
      toast.error('Le nom du bien est requis')
      return
    }
    const data = {
      ...form,
      address: form.address_line1 || '',
      surface: Number(form.surface_m2) || 0,
      rooms: Number(form.nb_rooms) || 0,
      floor: form.floor ? Number(form.floor) : null,
    }
    if (editingId) {
      updateProperty(editingId, data)
      toast.success('Bien mis a jour')
    } else {
      createProperty(data)
      toast.success('Bien cree avec succes')
    }
    setShowModal(false)
    setEditingId(null)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteProperty(deleteTarget)
      setDeleteTarget(null)
      toast.success('Bien supprime')
    }
  }

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-5"
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

      <FilterBar activeCount={[typeFilter, statusFilter, structureFilter].filter(Boolean).length}>
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher un bien..." className="w-full sm:w-64" />
        <SelectField
          options={[{ value: '', label: 'Tous les types' }, ...propertyTypeOptions]}
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-40"
        />
        <SelectField
          options={[{ value: '', label: 'Tous les statuts' }, ...statusOptions]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full sm:w-40"
        />
        <SelectField
          options={[{ value: '', label: 'Toutes structures' }, ...structureOptions]}
          value={structureFilter}
          onChange={(e) => setStructureFilter(e.target.value)}
          className="w-full sm:w-44"
        />
      </FilterBar>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineHomeModern}
          title="Aucun bien trouve"
          description="Aucun bien ne correspond a vos criteres. Ajoutez votre premier bien immobilier."
          action={
            <Button icon={HiOutlinePlus} onClick={openCreate}>
              Nouveau bien
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((property, idx) => {
            const statusInfo = PROPERTY_STATUSES[property.status] || PROPERTY_STATUSES.vacant
            const TypeIcon = propertyTypeIcons[property.type] || HiOutlineHomeModern
            const activeRent = getActiveRent(property.id)
            const badgeVariant = statusColors[property.status] || 'neutral'

            return (
              <div key={property.id}>
                <Card hover className="h-full flex flex-col">
                  <div className="flex-1" onClick={() => navigate(`/properties/${property.id}`)}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-900 truncate">{property.name}</h3>
                          <div className="flex items-center gap-1 mt-0.5">
                            <HiOutlineMapPin className="h-3 w-3 text-slate-400 shrink-0" />
                            <p className="text-xs text-slate-500 truncate">{property.address || property.address_line1 || '-'}</p>
                          </div>
                        </div>
                      </div>
                      <Badge variant={badgeVariant} dot size="sm">{statusInfo.label}</Badge>
                    </div>

                    {/* Details */}
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                      <div className="flex gap-4 text-xs text-slate-500">
                        {(property.surface || property.surface_m2) > 0 && (
                          <span className="flex items-center gap-1">
                            {formatSurface(property.surface || property.surface_m2)}
                          </span>
                        )}
                        {(property.rooms || property.nb_rooms) > 0 && (
                          <span>{property.rooms || property.nb_rooms} pieces</span>
                        )}
                        {property.floor != null && property.floor !== '' && (
                          <span>Etage {property.floor}</span>
                        )}
                      </div>
                      <span className="text-sm font-bold text-slate-900">
                        {activeRent ? formatCurrency(activeRent) : property.monthly_rent ? formatCurrency(property.monthly_rent) : '-'}
                        {(activeRent || property.monthly_rent) && <span className="text-xs font-normal text-slate-400">/mois</span>}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex justify-end gap-1.5 border-t border-slate-100 pt-3">
                    <Button variant="ghost" size="xs" icon={HiOutlinePencilSquare} onClick={(e) => { e.stopPropagation(); openEdit(property) }}>
                      Modifier
                    </Button>
                    <Button variant="ghost" size="xs" icon={HiOutlineTrash} onClick={(e) => { e.stopPropagation(); setDeleteTarget(property.id) }} className="text-red-500 hover:bg-red-50 hover:text-red-600">
                      Supprimer
                    </Button>
                  </div>
                </Card>
              </div>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Modifier le bien' : 'Nouveau bien'}
        subtitle={editingId ? 'Modifiez les informations du bien' : 'Remplissez les informations du nouveau bien'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
            <Button onClick={handleSave}>{editingId ? 'Enregistrer' : 'Creer le bien'}</Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Structure" required options={structureOptions} value={form.structure_id} onChange={(e) => updateField('structure_id', e.target.value)} placeholder="Selectionnez une structure" />
          <SelectField label="Type de bien" required options={propertyTypeOptions} value={form.type} onChange={(e) => updateField('type', e.target.value)} />
          <InputField label="Nom du bien" required value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Ex: Appartement Nice Centre" className="sm:col-span-2" />
          <InputField label="Adresse" value={form.address_line1} onChange={(e) => updateField('address_line1', e.target.value)} placeholder="Numero et rue" />
          <InputField label="Complement" value={form.address_line2} onChange={(e) => updateField('address_line2', e.target.value)} placeholder="Batiment, etage..." />
          <InputField label="Code postal" value={form.postal_code} onChange={(e) => updateField('postal_code', e.target.value)} placeholder="06000" />
          <InputField label="Ville" value={form.city} onChange={(e) => updateField('city', e.target.value)} placeholder="Nice" />
          <InputField label="Surface (m²)" type="number" value={form.surface_m2} onChange={(e) => updateField('surface_m2', e.target.value)} />
          <InputField label="Nombre de pieces" type="number" value={form.nb_rooms} onChange={(e) => updateField('nb_rooms', e.target.value)} />
          <InputField label="Etage" type="number" value={form.floor} onChange={(e) => updateField('floor', e.target.value)} />
          <InputField label="Batiment" value={form.building} onChange={(e) => updateField('building', e.target.value)} />
          <InputField label="N° de lot" value={form.lot_number} onChange={(e) => updateField('lot_number', e.target.value)} />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              className="block w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 transition-all focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 focus:outline-none hover:border-slate-300 resize-none"
              placeholder="Informations complementaires..."
            />
          </div>
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
