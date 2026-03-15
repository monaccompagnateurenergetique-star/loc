import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  HiOutlineBuildingLibrary,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineArrowLeft,
  HiOutlineHomeModern,
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
import EmptyState from '../components/ui/EmptyState'
import { useStructureStore } from '../store/structureStore'
import { usePropertyStore } from '../store/propertyStore'
import { useLeaseStore } from '../store/leaseStore'
import { STRUCTURE_TYPES, PROPERTY_STATUSES, TVA_REGIMES } from '../lib/constants'
import { formatCurrency } from '../lib/formatters'

const structureTypeOptions = Object.entries(STRUCTURE_TYPES).map(([value, { label }]) => ({ value, label }))
const tvaRegimeOptions = Object.entries(TVA_REGIMES).map(([value, label]) => ({ value, label }))

export default function StructureDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { structures, updateStructure, deleteStructure } = useStructureStore()
  const properties = usePropertyStore((s) => s.properties)
  const leases = useLeaseStore((s) => s.leases)

  const structure = useMemo(() => structures.find((s) => s.id === id), [structures, id])

  const structureProperties = useMemo(
    () => properties.filter((p) => p.structure_id === id),
    [properties, id]
  )

  const stats = useMemo(() => {
    const total = structureProperties.length
    const occupied = structureProperties.filter((p) => p.status === 'occupied').length
    const vacant = structureProperties.filter((p) => p.status === 'vacant').length
    const activeLeases = leases.filter((l) => l.structure_id === id && l.is_active)
    const monthlyRevenue = activeLeases.reduce((sum, l) => sum + (l.monthly_rent || 0) + (l.charges || 0), 0)
    return { total, occupied, vacant, monthlyRevenue }
  }, [structureProperties, leases, id])

  const [showEdit, setShowEdit] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [form, setForm] = useState({})

  const openEdit = () => {
    setForm({
      name: structure.name || '',
      type: structure.type?.toLowerCase().replace(' ', '_') || 'sci_ir',
      siret: structure.siret || '',
      address_line1: structure.address_line1 || structure.address || '',
      address_line2: structure.address_line2 || '',
      postal_code: structure.postal_code || '',
      city: structure.city || '',
      bank_name: structure.bank_name || '',
      bank_iban: structure.bank_iban || '',
      bank_bic: structure.bank_bic || '',
      tva_regime: structure.tva_regime || 'franchise',
      tva_number: structure.tva_number || '',
      notes: structure.notes || '',
    })
    setShowEdit(true)
  }

  const handleSave = () => {
    updateStructure(id, form)
    setShowEdit(false)
  }

  const handleDelete = () => {
    deleteStructure(id)
    navigate('/structures')
  }

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }))

  if (!structure) {
    return (
      <div className="py-16 text-center">
        <p className="text-slate-500">Structure introuvable.</p>
        <Button variant="secondary" className="mt-4" onClick={() => navigate('/structures')}>
          Retour aux structures
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
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" icon={HiOutlineArrowLeft} onClick={() => navigate('/structures')}>
          Retour
        </Button>
      </div>

      <PageHeader
        title={structure.name}
        icon={HiOutlineBuildingLibrary}
        subtitle={STRUCTURE_TYPES[structure.type?.toLowerCase().replace(' ', '_')]?.label || structure.type}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" icon={HiOutlinePencilSquare} onClick={openEdit}>
              Modifier
            </Button>
            <Button variant="danger" icon={HiOutlineTrash} onClick={() => setShowDelete(true)}>
              Supprimer
            </Button>
          </div>
        }
      />

      {/* Structure info */}
      <Card>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Type</p>
            <p className="mt-1 text-sm text-slate-900">{STRUCTURE_TYPES[structure.type?.toLowerCase().replace(' ', '_')]?.label || structure.type}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">SIRET</p>
            <p className="mt-1 text-sm text-slate-900">{structure.siret || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Adresse</p>
            <p className="mt-1 text-sm text-slate-900">{structure.address || structure.address_line1 || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Regime TVA</p>
            <p className="mt-1 text-sm text-slate-900">{TVA_REGIMES[structure.tva_regime] || structure.fiscal_regime || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">N° TVA</p>
            <p className="mt-1 text-sm text-slate-900">{structure.tva_number || '-'}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase text-slate-400">Banque</p>
            <p className="mt-1 text-sm text-slate-900">{structure.bank_name || '-'}</p>
          </div>
          {structure.bank_iban && (
            <div>
              <p className="text-xs font-medium uppercase text-slate-400">IBAN</p>
              <p className="mt-1 text-sm text-slate-900">{structure.bank_iban}</p>
            </div>
          )}
          {structure.notes && (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="text-xs font-medium uppercase text-slate-400">Notes</p>
              <p className="mt-1 text-sm text-slate-900">{structure.notes}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat label="Total biens" value={stats.total} />
        <Stat label="Occupes" value={stats.occupied} trend="up" />
        <Stat label="Vacants" value={stats.vacant} trend={stats.vacant > 0 ? 'down' : 'neutral'} />
        <Stat label="Revenus mensuels" value={formatCurrency(stats.monthlyRevenue)} />
      </div>

      {/* Properties */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Biens immobiliers</h3>
          <Button size="sm" icon={HiOutlinePlus} onClick={() => navigate('/properties')}>
            Ajouter un bien
          </Button>
        </div>

        {structureProperties.length === 0 ? (
          <EmptyState
            icon={HiOutlineHomeModern}
            title="Aucun bien"
            description="Aucun bien n'est rattache a cette structure."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {structureProperties.map((prop) => {
              const statusInfo = PROPERTY_STATUSES[prop.status] || PROPERTY_STATUSES.vacant
              return (
                <Card
                  key={prop.id}
                  hover
                  className="cursor-pointer"
                >
                  <div onClick={() => navigate(`/properties/${prop.id}`)}>
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-slate-900">{prop.name}</h4>
                      <Badge variant={statusInfo.color}>{statusInfo.label}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-500">{prop.address || '-'}</p>
                    <div className="mt-3 flex items-center justify-between text-sm">
                      <span className="text-slate-500">{prop.surface ? `${prop.surface} m²` : '-'}{prop.rooms ? ` - ${prop.rooms}p` : ''}</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(prop.monthly_rent)}/mois</span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal isOpen={showEdit} onClose={() => setShowEdit(false)} title="Modifier la structure" size="lg">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField label="Nom" required value={form.name || ''} onChange={(e) => updateField('name', e.target.value)} />
          <SelectField label="Type" options={structureTypeOptions} value={form.type || ''} onChange={(e) => updateField('type', e.target.value)} />
          <InputField label="SIRET" value={form.siret || ''} onChange={(e) => updateField('siret', e.target.value)} />
          <InputField label="Adresse" value={form.address_line1 || ''} onChange={(e) => updateField('address_line1', e.target.value)} />
          <InputField label="Complement" value={form.address_line2 || ''} onChange={(e) => updateField('address_line2', e.target.value)} />
          <InputField label="Code postal" value={form.postal_code || ''} onChange={(e) => updateField('postal_code', e.target.value)} />
          <InputField label="Ville" value={form.city || ''} onChange={(e) => updateField('city', e.target.value)} />
          <InputField label="Banque" value={form.bank_name || ''} onChange={(e) => updateField('bank_name', e.target.value)} />
          <InputField label="IBAN" value={form.bank_iban || ''} onChange={(e) => updateField('bank_iban', e.target.value)} />
          <InputField label="BIC" value={form.bank_bic || ''} onChange={(e) => updateField('bank_bic', e.target.value)} />
          <SelectField label="Regime TVA" options={tvaRegimeOptions} value={form.tva_regime || ''} onChange={(e) => updateField('tva_regime', e.target.value)} />
          <InputField label="N° TVA" value={form.tva_number || ''} onChange={(e) => updateField('tva_number', e.target.value)} />
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

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={handleDelete}
        title="Supprimer la structure"
        message="Etes-vous sur de vouloir supprimer cette structure et toutes ses donnees associees ?"
        confirmLabel="Supprimer"
      />
    </motion.div>
  )
}
