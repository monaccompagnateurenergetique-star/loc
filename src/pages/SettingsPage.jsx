import { useState } from 'react'
import { motion } from 'framer-motion'
import { HiOutlineCog6Tooth, HiOutlineTrash, HiOutlineArrowPath } from 'react-icons/hi2'
import PageHeader from '../components/layout/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import InputField from '../components/ui/InputField'
import SelectField from '../components/ui/SelectField'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { useAuthStore } from '../store/authStore'
import { TVA_RATES } from '../lib/constants'

const tvaOptions = TVA_RATES.map((r) => ({ value: String(r.value), label: r.label }))

export default function SettingsPage() {
  const { user, updateProfile } = useAuthStore()

  const [name, setName] = useState(user?.name || '')
  const [email, setEmail] = useState(user?.email || '')
  const [defaultTva, setDefaultTva] = useState('0')
  const [invoicePrefix, setInvoicePrefix] = useState('INV')
  const [showReset, setShowReset] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSaveProfile = () => {
    updateProfile({ name, email })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    // Clear all localStorage keys used by the app
    const keys = [
      'gl-structure-store',
      'gl-property-store',
      'gl-tenant-store',
      'gl-lease-store',
      'gl-invoice-store',
      'gl-payment-store',
      'gl-auth-store',
    ]
    keys.forEach((key) => localStorage.removeItem(key))
    setShowReset(false)
    window.location.reload()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <PageHeader title="Parametres" icon={HiOutlineCog6Tooth} />

      {/* Profile */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Profil utilisateur</h3>
        <div className="grid max-w-md grid-cols-1 gap-4">
          <InputField
            label="Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Votre nom"
          />
          <InputField
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.fr"
          />
          <div>
            <Button onClick={handleSaveProfile}>
              {saved ? 'Enregistre !' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Preferences</h3>
        <div className="grid max-w-md grid-cols-1 gap-4">
          <SelectField
            label="Taux TVA par defaut"
            options={tvaOptions}
            value={defaultTva}
            onChange={(e) => setDefaultTva(e.target.value)}
          />
          <InputField
            label="Prefixe des factures"
            value={invoicePrefix}
            onChange={(e) => setInvoicePrefix(e.target.value)}
            placeholder="INV"
            helper="Utilise lors de la generation des quittances"
          />
        </div>
      </Card>

      {/* Data */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-slate-900">Donnees</h3>
        <p className="mb-4 text-sm text-slate-600">
          Reinitialiser les donnees de demonstration. Cette action supprimera toutes vos
          donnees locales et rechargera les donnees de demo.
        </p>
        <Button
          variant="danger"
          icon={HiOutlineArrowPath}
          onClick={() => setShowReset(true)}
        >
          Reinitialiser les donnees demo
        </Button>
      </Card>

      {/* About */}
      <Card>
        <h3 className="mb-4 text-sm font-semibold text-slate-900">A propos</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p><span className="font-medium text-slate-900">GestionLoc</span> - Application de gestion locative</p>
          <p>Version 1.0.0</p>
          <p>Stockage local (localStorage) - Aucune donnee envoyee sur un serveur.</p>
          <p>Technologies: React, Vite, TailwindCSS, Zustand, Recharts</p>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={showReset}
        onClose={() => setShowReset(false)}
        onConfirm={handleReset}
        title="Reinitialiser les donnees"
        message="Toutes les donnees seront supprimees et remplacees par les donnees de demonstration. Cette action est irreversible."
        confirmLabel="Reinitialiser"
      />
    </motion.div>
  )
}
