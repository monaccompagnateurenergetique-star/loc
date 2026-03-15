import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { HiOutlineHomeModern } from 'react-icons/hi2'
import Button from '../components/ui/Button'

export default function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-[60vh] flex-col items-center justify-center text-center"
    >
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
        <span className="text-4xl font-bold text-slate-400">404</span>
      </div>
      <h1 className="text-2xl font-bold text-slate-900">Page introuvable</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">
        La page que vous recherchez n'existe pas ou a ete deplacee.
      </p>
      <div className="mt-6">
        <Button icon={HiOutlineHomeModern} onClick={() => navigate('/')}>
          Retour au tableau de bord
        </Button>
      </div>
    </motion.div>
  )
}
