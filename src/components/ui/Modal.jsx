import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { HiOutlineXMark } from 'react-icons/hi2'
import { clsx } from 'clsx'

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)] sm:max-w-4xl',
}

export default function Modal({ isOpen, onClose, title, subtitle, children, size = 'md', footer }) {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className={clsx(
              'relative w-full rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl',
              'max-h-[90vh] sm:max-h-[85vh] flex flex-col',
              sizeStyles[size]
            )}
          >
            {/* Header */}
            {title && (
              <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                  {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
                </div>
                <button
                  onClick={onClose}
                  className="ml-4 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <HiOutlineXMark className="h-5 w-5" />
                </button>
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-5 py-4 sm:px-6">{children}</div>

            {/* Footer */}
            {footer && (
              <div className="border-t border-slate-100 px-5 py-3 sm:px-6">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
