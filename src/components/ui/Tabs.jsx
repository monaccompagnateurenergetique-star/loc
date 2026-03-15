import { motion } from 'framer-motion';
import { clsx } from 'clsx';

export default function Tabs({ tabs = [], activeTab, onChange }) {
  return (
    <div className="relative flex gap-1 border-b border-slate-200">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={clsx(
              'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors duration-150',
              isActive ? 'text-primary-600' : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {Icon && <Icon className="h-4 w-4" />}
            {tab.label}
            {isActive && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
