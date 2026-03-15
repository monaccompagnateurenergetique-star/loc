import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlinePlus, HiOutlineBuildingLibrary, HiOutlinePencilSquare, HiOutlineTrash } from 'react-icons/hi2'
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
import { useStructureStore } from '../store/structureStore'
import { usePropertyStore } from '../store/propertyStore'
import { useLeaseStore } from '../store/leaseStore'
import { STRUCTURE_TYPES, TVA_REGIMES } from '../lib/constants'
import { formatCurrency } from '../lib/formatters'

const emptyForm = {
  name: '',
  type: 'sci_ir',
  siret: '',
  address_line1: '',
  address_line2: '',
  postal_code: '',
  city: '',
  bank_name: '',
  bank_iban: '',
  bank_bic: '',
  tva_regime: 'franchise',
  tva_number: '',
  notes: '',
}

const structureTypeOptions = Object.entries(STRUCTURE_TYPES).map(([value, { label }]) => ({ value, label }))
const tvaRegimeOptions = Object.entries(TVA_REGIMES).map(([value, label]) => ({ value, label }))

export default function StructuresPage() {
  const navigate = useNavigate()
  const { structures, createStructure, updateStructure, deleteStructure } = useStructureStore()
  const properties = usePropertyStore((s) => s.properties)
  const leases = useLeaseStore((s) => s.leases)

  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    if (!search) return structures
    const q = search.toLowerCase()
    return structures.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.siret?.toLowerCase().includes(q) ||
        s.address?.toLowerCase().includes(q) ||
        s.type?.toLowerCase().includes(q)
    )
  }, [structures, search])

  const getStructureStats = (structureId) => {
    const props = properties.filter((p) => p.structure_id === structureId)
    const activeLeases = leases.filter((l) => l.structure_id === structureId && l.is_active)
    const monthlyRevenue = activeLeases.reduce((sum, l) => sum + (l.monthly_rent || 0) + (l.charges || 0), 0)
    return { propertyCount: props.length, monthlyRevenue }
  }

  const getTypeBadge = (type) => {
    const key = type?.toLowerCase().replace(' ', '_')
    if (key === 'sci_ir' || key === 'sci ir') return <Badge variant="info">SCI IR</Badge>
    if (key === 'sci_is' || key === 'sci is') return <Badge variant="info">SCI IS</Badge>
    if (key === 'nom_propre' || key === 'nom propre' || key === 'nom_propre') return <Badge variant="neutral">Nom Propre</Badge>
    return <Badge variant="neutral">{STRUCTURE_TYPES[key]?.label || type || '-'}</Badge>
  }

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (structure) => {
    setEditingId(structure.id)
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
    setShowModal(true)
  }

  const handleSave = () => {
    if (!form.name.trim()) return
    if (editingId) {
      updateStructure(editingId, form)
    } else {
      createStructure(form)
    }
    setShowModal(false)
    setForm(emptyForm)
    setEditingId(null)
  }

  const handleDelete = () => {
    if (deleteTarget) {
      deleteStructure(deleteTarget)
      setDeleteTarget(null)
    }
  }

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader
        title="Structures"
        icon={HiOutlineBuildingLibrary}
        action={
          <Button icon={HiOutlinePlus} onClick={openCreate}>
            Nouvelle structure
          </Button>
        }
      />

      <div className="max-w-sm">
        <SearchInput value={search} onChange={setSearch} placeholder="Rechercher une structure..." />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={HiOutlineBuildingLibrary}
          title="Aucune structure"
          description="Creez votre premiere structure pour commencer a gerer vos biens."
          action={
            <Button icon={HiOutlinePlus} onClick={openCreate}>
              Nouvelle structure
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((structure) => {
            const stats = getStructureStats(structure.id)
            return (
              <Card
                key={structure.id}
                hover
                className="cursor-pointer"
              >
                <div onClick={() => navigate(`/structures/${structure.id}`)}>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">{structure.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">{structure.address || structure.address_line1 || '-'}</p>
                    </div>
                    {getTypeBadge(structure.type)}
                  </div>
                  {structure.siret && (
                    <p className="mt-2 text-xs text-slate-400">SIRET: {structure.siret}</p>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="text-sm text-slate-500">{stats.propertyCount} bien(s)</span>
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(stats.monthlyRevenue)}/mois</span>
                  </div>
                </div>
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={HiOutlinePencilSquare}
                    onClick={(e) => { e.stopPropagation(); openEdit(structure) }}
                  >
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={HiOutlineTrash}
                    onClick={(e) => { e.stopPropagation(); setDeleteTarget(structure.id) }}
                    className="text-red-600 hover:bg-red-50"
                  >
                    Supprimer
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editingId ? 'Modifier la structure' : 'Nouvelle structure'}
        size="lg"
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <InputField
            label="Nom"
            required
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            placeholder="Ex: SCI Riviera"
          />
          <SelectField
            label="Type"
            required
            options={structureTypeOptions}
            value={form.type}
            onChange={(e) => updateField('type', e.target.value)}
          />
          <InputField
            label="SIRET"
            value={form.siret}
            onChange={(e) => updateField('siret', e.target.value)}
            placeholder="123 456 789 00012"
          />
          <InputField
            label="Adresse"
            value={form.address_line1}
            onChange={(e) => updateField('address_line1', e.target.value)}
            placeholder="Numero et rue"
          />
          <InputField
            label="Complement"
            value={form.address_line2}
            onChange={(e) => updateField('address_line2', e.target.value)}
            placeholder="Batiment, etage..."
          />
          <InputField
            label="Code postal"
            value={form.postal_code}
            onChange={(e) => updateField('postal_code', e.target.value)}
            placeholder="06000"
          />
          <InputField
            label="Ville"
            value={form.city}
            onChange={(e) => updateField('city', e.target.value)}
            placeholder="Nice"
          />
          <InputField
            label="Banque"
            value={form.bank_name}
            onChange={(e) => updateField('bank_name', e.target.value)}
            placeholder="Nom de la banque"
          />
          <InputField
            label="IBAN"
            value={form.bank_iban}
            onChange={(e) => updateField('bank_iban', e.target.value)}
            placeholder="FR76 XXXX XXXX ..."
          />
          <InputField
            label="BIC"
            value={form.bank_bic}
            onChange={(e) => updateField('bank_bic', e.target.value)}
            placeholder="BNPAFRPP"
          />
          <SelectField
            label="Regime TVA"
            options={tvaRegimeOptions}
            value={form.tva_regime}
            onChange={(e) => updateField('tva_regime', e.target.value)}
          />
          <InputField
            label="N° TVA"
            value={form.tva_number}
            onChange={(e) => updateField('tva_number', e.target.value)}
            placeholder="FR XX XXXXXXXXX"
          />
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              rows={3}
              className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 transition-colors focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:outline-none"
              placeholder="Notes supplementaires..."
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>
            {editingId ? 'Enregistrer' : 'Creer'}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Supprimer la structure"
        message="Etes-vous sur de vouloir supprimer cette structure ? Cette action est irreversible."
        confirmLabel="Supprimer"
      />
    </motion.div>
  )
}
